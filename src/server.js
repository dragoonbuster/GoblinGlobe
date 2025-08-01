import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { promises as dns } from 'dns';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import whois from 'whois';
import { calculateDomainQualityScore, getQualityGrade, sortDomainsByQuality } from './domain-scoring.js';
import { cacheManager, initializeCache, shutdownCache } from './cache-manager.js';
import { logger } from './logger.js';
import { isValidDomain } from './security-utils.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: parseInt(process.env.OPENAI_TIMEOUT_MS) || 30000 // Default 30 seconds
});

// Security middleware (relaxed for development)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''], // Allow inline styles for 90s theme
      scriptSrc: ['\'self\'', '\'unsafe-inline\''], // Allow inline scripts for 90s theme
      imgSrc: ['\'self\'', 'data:', 'https:'],
      connectSrc: ['\'self\'']
    }
  },
  crossOriginEmbedderPolicy: false // Relaxed for development
}));

// CORS configuration for development
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing with reasonable limits
const requestSizeLimit = process.env.REQUEST_SIZE_LIMIT || '1mb';
app.use(express.json({ limit: requestSizeLimit }));
app.use(express.urlencoded({ extended: true, limit: requestSizeLimit }));

// Additional security headers for API responses
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.setHeader('X-API-Version', '1.0');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Request logging middleware for development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip?.substring(0, 8) + '***', // Partially mask IP for privacy
      userAgent: req.get('user-agent')?.split('/')[0] || 'Unknown'
    });
  });
  next();
});

app.use(express.static(join(__dirname, '../public')));

// Rate limiting (more relaxed for development)
const rateLimitWindow = (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000;
const developmentLimiter = rateLimit({
  windowMs: rateLimitWindow,
  max: parseInt(process.env.RATE_LIMIT_GENERAL_MAX) || 50, // More generous for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

async function checkWHOISWithCache(domain, qualityScore, qualityGrade, timeout) {
  const cachedWHOIS = await cacheManager.getWHOISResult(domain);
  if (cachedWHOIS) {
    return {
      domain,
      available: cachedWHOIS.available,
      method: `${cachedWHOIS.method}-cached`,
      qualityScore,
      qualityGrade
    };
  }

  try {
    const whoisResult = await Promise.race([
      new Promise((resolve) => {
        whois.lookup(domain, (err, data) => {
          if (err) {
            resolve({ available: true, method: 'whois-error' });
            return;
          }

          const lowerData = data.toLowerCase();
          const isAvailable =
            lowerData.includes('no match') ||
            lowerData.includes('not found') ||
            lowerData.includes('no data found') ||
            lowerData.includes('no entries found');

          resolve({ available: isAvailable, method: 'whois' });
        });
      }),
      new Promise((resolve) =>
        setTimeout(() => resolve({ available: true, method: 'whois-timeout' }), timeout)
      )
    ]);

    // Cache the WHOIS result
    await cacheManager.setWHOISResult(domain, whoisResult);
    return { domain, ...whoisResult, qualityScore, qualityGrade };
  } catch (whoisError) {
    logger.warn(`WHOIS check failed for ${domain}:`, whoisError.message);
    const result = { available: true, method: 'whois-error', qualityScore, qualityGrade };
    // Cache the error result briefly
    await cacheManager.setWHOISResult(domain, { available: true, method: 'whois-error' });
    return { domain, ...result };
  }
}

async function checkDomainAvailability(domain, prompt = '', timeout = parseInt(process.env.DNS_TIMEOUT_MS) || 5000) {
  // Check cache first for complete availability result
  const cachedResult = await cacheManager.getDomainAvailability(domain);
  if (cachedResult) {
    // Update quality score and grade for the cached result (in case prompt changed)
    const qualityScore = calculateDomainQualityScore(domain, prompt);
    const qualityGrade = getQualityGrade(qualityScore.overall);
    return { ...cachedResult, qualityScore, qualityGrade };
  }

  // Calculate quality score
  const qualityScore = calculateDomainQualityScore(domain, prompt);
  const qualityGrade = getQualityGrade(qualityScore.overall);

  // Security validation
  if (!isValidDomain(domain)) {
    logger.warn(`Invalid or suspicious domain blocked: ${domain}`);
    const result = { domain, available: false, method: 'blocked', error: 'Invalid domain', qualityScore, qualityGrade };
    // Don't cache blocked domains
    return result;
  }

  // Check for cached DNS result first
  let result;
  const cachedDNS = await cacheManager.getDNSResult(domain);

  try {
    if (cachedDNS) {
      // Use cached DNS result
      if (cachedDNS.resolved) {
        result = { domain, available: false, method: 'dns-cached', qualityScore, qualityGrade };
      } else {
        // DNS was not found, check WHOIS (might be cached too)
        result = await checkWHOISWithCache(domain, qualityScore, qualityGrade, timeout);
      }
    } else {
      // Perform fresh DNS lookup with timeout protection
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DNS timeout')), timeout)
      );

      try {
        await Promise.race([
          dns.resolve4(domain),
          timeoutPromise
        ]);

        // Cache the successful DNS result
        await cacheManager.setDNSResult(domain, { resolved: true });
        result = { domain, available: false, method: 'dns', qualityScore, qualityGrade };
      } catch (dnsError) {
        if (dnsError.message === 'DNS timeout') {
          logger.warn(`DNS timeout for ${domain}`);
          result = { domain, available: false, method: 'timeout', qualityScore, qualityGrade };
        } else if (dnsError.code === 'ENOTFOUND') {
          // Cache the DNS not found result
          await cacheManager.setDNSResult(domain, { resolved: false });
          // Try WHOIS as fallback
          result = await checkWHOISWithCache(domain, qualityScore, qualityGrade, timeout);
        } else {
          result = { domain, available: false, method: 'error', qualityScore, qualityGrade };
        }
      }
    }
  } catch (error) {
    logger.error(`Domain availability check failed for ${domain}:`, error.message);
    result = { domain, available: false, method: 'error', qualityScore, qualityGrade };
  }

  // Cache the final result
  await cacheManager.setDomainAvailability(domain, {
    domain: result.domain,
    available: result.available,
    method: result.method
  });

  return result;
}

async function generateDomainNames(prompt, count = 10) {
  const model = 'gpt-3.5-turbo';

  // Check cache first
  const cachedResult = await cacheManager.getDomainGeneration(prompt, count, model);
  if (cachedResult) {
    logger.info(`Using cached domain generation for prompt: "${prompt}"`);
    return cachedResult;
  }

  const systemPrompt = `You are a creative domain name generator. Generate exactly ${count} domain names based on the user's request. 
  Return ONLY the domain names (without extensions) as a JSON array of strings. 
  Make them memorable, brandable, and relevant to the request.
  Example output: ["fishbunny", "octopusgiraffe", "pandashark"]`;

  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.9,
    max_tokens: 500
  });

  let result;
  try {
    result = JSON.parse(response.choices[0].message.content);
  } catch {
    // Fallback: extract words that look like domain names
    const content = response.choices[0].message.content;
    const matches = content.match(/[a-zA-Z][a-zA-Z0-9-]{2,}/g) || [];
    result = matches.slice(0, count);
  }

  // Cache the result
  await cacheManager.setDomainGeneration(prompt, count, model, result);

  return result;
}

// Input validation middleware
const validateGenerateRequest = [
  body('prompt').isString().trim().isLength({ min: 3, max: 500 })
    .withMessage('Prompt must be between 3 and 500 characters'),
  body('count').optional().isInt({ min: 1, max: 20 })
    .withMessage('Count must be between 1 and 20'),
  body('extensions').optional().isArray({ max: parseInt(process.env.MAX_EXTENSION_COUNT) || 10 })
    .withMessage(`Maximum ${parseInt(process.env.MAX_EXTENSION_COUNT) || 10} extensions allowed`),
  body('extensions.*').optional().isIn(['.com', '.net', '.org', '.io', '.co', '.dev', '.app'])
    .withMessage('Invalid extension')
];

const validateCheckRequest = [
  body('domains').isArray({ min: 1, max: parseInt(process.env.MAX_DOMAIN_COUNT) || 50 })
    .withMessage(`Must provide 1-${parseInt(process.env.MAX_DOMAIN_COUNT) || 50} domains`),
  body('domains.*').matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/)
    .withMessage('Invalid domain format')
];

app.post('/api/generate', developmentLimiter, validateGenerateRequest, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { prompt, count = 10, extensions = ['.com'] } = req.body;

    // Generate domain name ideas
    const names = await generateDomainNames(prompt, count);

    // Check availability for each name with each extension
    const checks = [];
    for (const name of names) {
      for (const ext of extensions) {
        checks.push(checkDomainAvailability(name + ext, prompt));
      }
    }

    const results = await Promise.all(checks);

    // Group by availability and sort by quality
    const available = sortDomainsByQuality(results.filter(r => r.available));
    const taken = sortDomainsByQuality(results.filter(r => !r.available));

    res.json({
      success: true,
      prompt,
      generated: names,
      results: {
        available,
        taken
      },
      summary: {
        total: results.length,
        available: available.length,
        taken: taken.length
      }
    });
  } catch (error) {
    logger.error('API request error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/check', developmentLimiter, validateCheckRequest, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { domains } = req.body;

    if (!Array.isArray(domains)) {
      return res.status(400).json({
        success: false,
        error: 'Domains must be an array'
      });
    }

    const results = await Promise.all(
      domains.map(domain => checkDomainAvailability(domain, ''))
    );

    const sortedResults = sortDomainsByQuality(results);

    res.json({
      success: true,
      results: sortedResults
    });
  } catch (error) {
    logger.error('API request error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Initialize cache
logger.info('Initializing Redis cache...');
await initializeCache();

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Domain Finder API running on http://localhost:${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing server...');

  // Close cache connection
  await shutdownCache();

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
