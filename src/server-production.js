import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import mongoSanitize from 'express-mongo-sanitize';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as dns } from 'dns';
import whois from 'whois';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate required environment variables
const requiredEnvVars = ['OPENAI_API_KEY', 'NODE_ENV'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Configure logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error'
    })
  ]
});

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
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
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Sanitize user input
app.use(mongoSanitize());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
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
    logger.warn({
      type: 'rate_limit_exceeded',
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({ error: message });
  }
});

// Different rate limits for different endpoints
const generateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per window
  'Too many generation requests. Please try again later.'
);

const checkLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  20, // 20 requests per window
  'Too many check requests. Please try again later.'
);

const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests. Please try again later.'
);

// Apply general rate limit to all routes
app.use(generalLimiter);

// Health check endpoint (no rate limit)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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

// Static files with security headers
app.use(express.static(join(__dirname, '../public'), {
  maxAge: '1d',
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
  body('extensions').optional().isArray({ max: 10 })
    .withMessage('Maximum 10 extensions allowed'),
  body('extensions.*').optional().isIn(['.com', '.net', '.org', '.io', '.co', '.dev', '.app'])
    .withMessage('Invalid extension')
];

const validateCheckRequest = [
  body('domains').isArray({ min: 1, max: 50 })
    .withMessage('Must provide 1-50 domains'),
  body('domains.*').matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/)
    .withMessage('Invalid domain format')
];

// Domain checking function with timeout
async function checkDomainAvailability(domain, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // DNS lookup with timeout
    await dns.resolve4(domain);
    clearTimeout(timeoutId);
    return { domain, available: false, method: 'dns' };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.code === 'ENOTFOUND') {
      // Additional WHOIS check for accuracy
      try {
        return await new Promise((resolve, reject) => {
          const whoisTimeout = setTimeout(() => {
            reject(new Error('WHOIS timeout'));
          }, timeout);
          
          whois.lookup(domain, (err, data) => {
            clearTimeout(whoisTimeout);
            if (err) {
              resolve({ domain, available: true, method: 'whois-error' });
              return;
            }
            
            const lowerData = data.toLowerCase();
            const isAvailable = 
              lowerData.includes('no match') ||
              lowerData.includes('not found') ||
              lowerData.includes('no data found');
            
            resolve({ domain, available: isAvailable, method: 'whois' });
          });
        });
      } catch (whoisError) {
        logger.warn(`WHOIS check failed for ${domain}:`, whoisError.message);
        return { domain, available: true, method: 'dns-only' };
      }
    }
    return { domain, available: false, method: 'error' };
  }
}

// Generate domain names with error handling
async function generateDomainNames(prompt, count = 10) {
  try {
    const systemPrompt = `Generate exactly ${count} domain names based on: "${prompt}". 
    Return ONLY a JSON array of domain names without extensions.
    Make them memorable, brandable, and relevant.`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.9,
      max_tokens: 500,
      timeout: 30000 // 30 second timeout
    });

    const content = response.choices[0].message.content;
    const names = JSON.parse(content);
    
    // Validate generated names
    return names.filter(name => 
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]?$/.test(name)
    ).slice(0, count);
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
  
  try {
    // Log API usage
    logger.info({
      type: 'api_request',
      endpoint: 'generate',
      prompt: prompt.substring(0, 50),
      count,
      extensions,
      ip: req.ip
    });
    
    // Generate names
    const names = await generateDomainNames(prompt, count);
    
    // Check availability in parallel with timeout
    const checks = [];
    for (const name of names) {
      for (const ext of extensions) {
        checks.push(checkDomainAvailability(name + ext));
      }
    }
    
    const results = await Promise.allSettled(checks);
    const successfulResults = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);
    
    const available = successfulResults.filter(r => r.available);
    const taken = successfulResults.filter(r => !r.available);
    
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
      domains.map(domain => checkDomainAvailability(domain))
    );
    
    const successfulResults = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);
    
    res.json({
      success: true,
      results: successfulResults
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

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server...');
  
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

// Start server
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  logger.info(`Production server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`CORS origins: ${process.env.ALLOWED_ORIGINS || 'localhost only'}`);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;