import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import mongoSanitize from 'express-mongo-sanitize';
import { logger } from './logger.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as dns } from 'dns';
import whois from 'whois';
import crypto from 'crypto';
import { isValidDomain, sanitizePrompt, detectPromptInjection, createSecurityContext } from './security-utils.js';
import { calculateDomainQualityScore, getQualityGrade, sortDomainsByQuality } from './domain-scoring.js';
import { cacheManager, initializeCache, shutdownCache } from './cache-manager.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Export environment validation function
export function validateEnvironment() {
  const requiredEnvVars = {
    OPENAI_API_KEY: {
      required: true,
      validate: (val) => val && val.startsWith('sk-'),
      error: 'Valid OpenAI API key required (should start with sk-)'
    },
    NODE_ENV: {
      required: true,
      validate: (val) => ['development', 'production', 'test'].includes(val),
      error: 'NODE_ENV must be development, production, or test'
    },
    PORT: {
      required: false,
      validate: (val) => !val || (Number(val) > 0 && Number(val) < 65536),
      error: 'PORT must be a valid port number (1-65535)'
    },
    ALLOWED_ORIGINS: {
      required: false,
      validate: (val) => !val || val.split(',').every(origin => origin.startsWith('http')),
      error: 'ALLOWED_ORIGINS must be comma-separated list of valid URLs'
    },
    LOG_LEVEL: {
      required: false,
      validate: (val) => !val || ['error', 'warn', 'info', 'debug'].includes(val),
      error: 'LOG_LEVEL must be error, warn, info, or debug'
    },
    LOG_SENSITIVE_DATA: {
      required: false,
      validate: (val) => !val || ['true', 'false'].includes(val),
      error: 'LOG_SENSITIVE_DATA must be true or false'
    },
    OPENAI_MODEL: {
      required: false,
      validate: (val) => !val || val.length > 0,
      error: 'OPENAI_MODEL must be a valid model name'
    },
    RATE_LIMIT_WINDOW_MINUTES: {
      required: false,
      validate: (val) => !val || (Number(val) > 0 && Number(val) <= 1440),
      error: 'RATE_LIMIT_WINDOW_MINUTES must be between 1 and 1440 (24 hours)'
    },
    RATE_LIMIT_GENERATE_MAX: {
      required: false,
      validate: (val) => !val || (Number(val) > 0 && Number(val) <= 1000),
      error: 'RATE_LIMIT_GENERATE_MAX must be between 1 and 1000'
    },
    RATE_LIMIT_CHECK_MAX: {
      required: false,
      validate: (val) => !val || (Number(val) > 0 && Number(val) <= 1000),
      error: 'RATE_LIMIT_CHECK_MAX must be between 1 and 1000'
    },
    RATE_LIMIT_GENERAL_MAX: {
      required: false,
      validate: (val) => !val || (Number(val) > 0 && Number(val) <= 10000),
      error: 'RATE_LIMIT_GENERAL_MAX must be between 1 and 10000'
    },
    OPENAI_TIMEOUT_MS: {
      required: false,
      validate: (val) => !val || (Number(val) >= 1000 && Number(val) <= 300000),
      error: 'OPENAI_TIMEOUT_MS must be between 1000 and 300000 (1-300 seconds)'
    },
    DNS_TIMEOUT_MS: {
      required: false,
      validate: (val) => !val || (Number(val) >= 100 && Number(val) <= 30000),
      error: 'DNS_TIMEOUT_MS must be between 100 and 30000 (0.1-30 seconds)'
    },
    REQUEST_SIZE_LIMIT: {
      required: false,
      validate: (val) => !val || /^\d+(kb|mb)$/i.test(val),
      error: 'REQUEST_SIZE_LIMIT must be a valid size (e.g., 1mb, 500kb)'
    },
    MAX_DOMAIN_COUNT: {
      required: false,
      validate: (val) => !val || (Number(val) > 0 && Number(val) <= 500),
      error: 'MAX_DOMAIN_COUNT must be between 1 and 500'
    },
    MAX_EXTENSION_COUNT: {
      required: false,
      validate: (val) => !val || (Number(val) > 0 && Number(val) <= 50),
      error: 'MAX_EXTENSION_COUNT must be between 1 and 50'
    },
    HSTS_MAX_AGE: {
      required: false,
      validate: (val) => !val || (Number(val) >= 0 && Number(val) <= 63072000),
      error: 'HSTS_MAX_AGE must be between 0 and 63072000 (2 years)'
    },
    INTERNAL_MONITOR_KEY: {
      required: false,
      validate: (val) => !val || val.length >= 10,
      error: 'INTERNAL_MONITOR_KEY must be at least 10 characters long'
    }
  };

  console.log('Validating environment variables...');
  for (const [envVar, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[envVar];

    if (config.required && !value) {
      console.error(`Missing required environment variable: ${envVar}`);
      console.error(config.error);
      process.exit(1);
    }

    if (value && !config.validate(value)) {
      console.error(`Invalid environment variable ${envVar}: ${value}`);
      console.error(config.error);
      process.exit(1);
    }
  }
  console.log('✅ Environment variables validated successfully');
}

// Configure whether to log sensitive data
const LOG_SENSITIVE_DATA = process.env.LOG_SENSITIVE_DATA === 'true';

// Log sanitization function
function sanitizeLogData(data) {
  const sanitized = { ...data };

  if (!LOG_SENSITIVE_DATA) {
    // Hash IPs for privacy
    if (sanitized.ip) {
      sanitized.ip = crypto.createHash('sha256').update(sanitized.ip).digest('hex').substring(0, 8);
    }

    // Remove prompt content
    if (sanitized.prompt) {
      sanitized.prompt = '[REDACTED]';
    }

    // Mask user agent
    if (sanitized.userAgent) {
      const parts = sanitized.userAgent.split('/');
      sanitized.userAgent = parts[0] || 'Unknown';
    }
  }

  return sanitized;
}


// Create Express app
export function createApp() {
  const app = express();

  // Initialize OpenAI with timeout configuration
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: parseInt(process.env.OPENAI_TIMEOUT_MS) || 30000 // Default 30 seconds
  });

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\'self\''],
        styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://cdn.tailwindcss.com'],
        scriptSrc: ['\'self\'', '\'unsafe-inline\'', 'https://cdn.tailwindcss.com'],
        imgSrc: ['\'self\'', 'data:', 'https:'],
        connectSrc: ['\'self\'']
      }
    },
    hsts: {
      maxAge: parseInt(process.env.HSTS_MAX_AGE) || 31536000, // Default 1 year
      includeSubDomains: true,
      preload: true
    }
  }));

  // Compression
  app.use(compression());

  // CORS configuration
  const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ?
      process.env.ALLOWED_ORIGINS.split(',') :
      ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));

  // Body parsing with size limits
  const requestSizeLimit = process.env.REQUEST_SIZE_LIMIT || '1mb';
  app.use(express.json({ limit: requestSizeLimit }));
  app.use(express.urlencoded({ extended: true, limit: requestSizeLimit }));

  // Sanitize user input
  app.use(mongoSanitize());

  // Additional security headers for API responses
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      res.setHeader('X-API-Version', '1.0');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('X-Request-ID', crypto.randomUUID());
    }
    next();
  });

  // Request logging middleware with sanitization
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(sanitizeLogData({
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get('user-agent')
      }));
    });
    next();
  });

  // Rate limiting configurations
  const createRateLimiter = (windowMs, max, message) => rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(sanitizeLogData({
        type: 'rate_limit_exceeded',
        ip: req.ip,
        path: req.path
      }));
      res.status(429).json({ error: message });
    }
  });

  // Different rate limits for different endpoints
  const rateLimitWindow = (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000;
  
  const generateLimiter = createRateLimiter(
    rateLimitWindow,
    parseInt(process.env.RATE_LIMIT_GENERATE_MAX) || 5,
    'Too many generation requests. Please try again later.'
  );

  const checkLimiter = createRateLimiter(
    rateLimitWindow,
    parseInt(process.env.RATE_LIMIT_CHECK_MAX) || 20,
    'Too many check requests. Please try again later.'
  );

  const generalLimiter = createRateLimiter(
    rateLimitWindow,
    parseInt(process.env.RATE_LIMIT_GENERAL_MAX) || 100,
    'Too many requests. Please try again later.'
  );

  // Apply general rate limit to all routes
  app.use(generalLimiter);

  // Health check endpoint (no rate limit)
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        PORT: process.env.PORT || 'not set',
        OPENAI_KEY_SET: !!process.env.OPENAI_API_KEY,
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'not set'
      }
    });
  });

  // Readiness check
  app.get('/ready', async (req, res) => {
    try {
      // Check OpenAI API connectivity
      await openai.models.list();
      res.json({ status: 'ready' });
    } catch (error) {
      logger.error('Readiness check failed:', error);
      res.status(503).json({ status: 'not ready' });
    }
  });

  // Security monitoring endpoint (protected)
  app.get('/api/security/status', generalLimiter, (req, res) => {
    // Only allow from internal IPs or with proper header
    const internalHeader = req.headers['x-internal-monitor'];
    const isInternalIP = req.ip === '127.0.0.1' || req.ip === '::1';

    if (!isInternalIP && (!process.env.INTERNAL_MONITOR_KEY || internalHeader !== process.env.INTERNAL_MONITOR_KEY)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      security: {
        rateLimitStatus: 'active',
        csrfProtection: 'enabled',
        corsEnabled: true,
        helmetEnabled: true,
        httpsOnly: process.env.NODE_ENV === 'production'
      },
      monitoring: {
        requestsHandled: process.memoryUsage().heapUsed,
        uptime: process.uptime()
      }
    });
  });

  // Static files with security headers
  app.use(express.static(join(__dirname, '../public'), {
    maxAge: process.env.STATIC_CACHE_MAX_AGE || '1d',
    setHeaders: (res, path) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }));

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

  // Fixed domain checking function with proper timeout, security, and caching
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
        // Perform fresh DNS lookup
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

      // Cache the final availability result
      await cacheManager.setDomainAvailability(domain, {
        domain: result.domain,
        available: result.available,
        method: result.method
      });

      return result;
    } catch (error) {
      logger.error(`Domain availability check failed for ${domain}:`, error);
      return { domain, available: false, method: 'error', qualityScore, qualityGrade };
    }
  }

  // Helper function for WHOIS checking with caching
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
              lowerData.includes('no data found');

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
      const result = { available: true, method: 'dns-only' };
      await cacheManager.setWHOISResult(domain, result);
      return { domain, ...result, qualityScore, qualityGrade };
    }
  }

  // Generate domain names with caching and error handling
  async function generateDomainNames(prompt, count = 10) {
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

    // Check cache first
    const cachedResult = await cacheManager.getDomainGeneration(prompt, count, model);
    if (cachedResult) {
      logger.info(`Using cached domain generation for prompt: "${prompt}"`);
      return cachedResult;
    }

    try {
      const systemPrompt = `Generate exactly ${count} domain names based on: "${prompt}". 
      Return ONLY a JSON array of domain names without extensions.
      Make them memorable, brandable, and relevant.`;

      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 500
      });

      const content = response.choices[0].message.content;
      const names = JSON.parse(content);

      // Validate generated names
      const validNames = names.filter(name =>
        /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]?$/.test(name)
      ).slice(0, count);

      // Cache the result
      await cacheManager.setDomainGeneration(prompt, count, model, validNames);

      return validNames;
    } catch (error) {
      logger.error('Domain generation failed:', error);
      throw new Error('Failed to generate domain names');
    }
  }

  // API Routes
  app.post('/api/generate', generateLimiter, validateGenerateRequest, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const startTime = Date.now();
    const { prompt, count = 10, extensions = ['.com'] } = req.body;

    // Create security context
    const secContext = createSecurityContext();

    try {
      // Check for prompt injection
      if (detectPromptInjection(prompt)) {
        logger.warn(sanitizeLogData({
          type: 'security_alert',
          issue: 'prompt_injection_attempt',
          prompt: prompt,
          ip: req.ip,
          requestId: secContext.requestId
        }));
        return res.status(400).json({
          success: false,
          error: 'Invalid prompt format detected'
        });
      }

      // Sanitize prompt
      const sanitizedPrompt = sanitizePrompt(prompt);

      // Log API usage with sanitization
      logger.info(sanitizeLogData({
        type: 'api_request',
        endpoint: 'generate',
        prompt: sanitizedPrompt,
        count,
        extensions,
        ip: req.ip,
        requestId: secContext.requestId
      }));

      // Generate names with sanitized prompt
      const names = await generateDomainNames(sanitizedPrompt, count);

      // Check availability in parallel with timeout
      const checks = [];
      for (const name of names) {
        for (const ext of extensions) {
          checks.push(checkDomainAvailability(name + ext, sanitizedPrompt));
        }
      }

      const results = await Promise.allSettled(checks);
      const successfulResults = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);

      const available = sortDomainsByQuality(successfulResults.filter(r => r.available));
      const taken = sortDomainsByQuality(successfulResults.filter(r => !r.available));

      const duration = Date.now() - startTime;

      // Log successful generation
      logger.info({
        type: 'api_success',
        endpoint: 'generate',
        duration,
        totalChecked: successfulResults.length,
        available: available.length
      });

      res.json({
        success: true,
        results: { available, taken },
        summary: {
          generated: names.length,
          checked: successfulResults.length,
          available: available.length,
          duration
        }
      });
    } catch (error) {
      logger.error({
        type: 'api_error',
        endpoint: 'generate',
        error: error.message,
        duration: Date.now() - startTime
      });

      res.status(500).json({
        success: false,
        error: 'Service temporarily unavailable'
      });
    }
  });

  app.post('/api/check', checkLimiter, validateCheckRequest, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { domains } = req.body;

    try {
      const results = await Promise.allSettled(
        domains.map(domain => checkDomainAvailability(domain, ''))
      );

      const successfulResults = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);

      const sortedResults = sortDomainsByQuality(successfulResults);

      res.json({
        success: true,
        results: sortedResults
      });
    } catch (error) {
      logger.error('Domain check error:', error);
      res.status(500).json({
        success: false,
        error: 'Service temporarily unavailable'
      });
    }
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    logger.error({
      type: 'unhandled_error',
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
    });

    res.status(500).json({
      error: 'Internal server error',
      reference: Date.now()
    });
  });

  return app;
}

// Only start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Validate environment variables first
  validateEnvironment();

  // Initialize cache
  logger.info('Initializing Redis cache...');
  await initializeCache();

  // Create Express app
  const app = createApp();

  // Start server
  const PORT = process.env.PORT || 8080;
  const server = app.listen(PORT, () => {
    logger.info(`Production server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`CORS origins: ${process.env.ALLOWED_ORIGINS || 'localhost only'}`);
    logger.info(`Log sensitive data: ${process.env.LOG_SENSITIVE_DATA === 'true'}`);
  });

  const gracefulShutdown = async () => {
    logger.info('Received shutdown signal, closing server...');

    // Close cache connection first
    await shutdownCache();

    if (server) {
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  // Unhandled rejection handler
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // Server startup moved up to resolve const declaration

  // Handle server startup errors
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use`);
    } else {
      logger.error('Server startup error:', err);
    }
    process.exit(1);
  });
}
