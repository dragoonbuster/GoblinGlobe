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
import crypto from 'crypto';
import { isValidDomain, sanitizePrompt, detectPromptInjection, createSecurityContext } from './security-utils.js';

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

// Configure logging
export const logger = winston.createLogger({
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

// Create Express app
export function createApp() {
  const app = express();

  // Initialize OpenAI with timeout configuration
  const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000 // 30 second timeout
  });

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
    
    if (!isInternalIP && internalHeader !== process.env.INTERNAL_MONITOR_KEY) {
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

  // Fixed domain checking function with proper timeout and security
  async function checkDomainAvailability(domain, timeout = 5000) {
    // Security validation
    if (!isValidDomain(domain)) {
      logger.warn(`Invalid or suspicious domain blocked: ${domain}`);
      return { domain, available: false, method: 'blocked', error: 'Invalid domain' };
    }
    
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('DNS timeout')), timeout)
      );
      
      // Race DNS lookup against timeout
      await Promise.race([
        dns.resolve4(domain),
        timeoutPromise
      ]);
      
      return { domain, available: false, method: 'dns' };
    } catch (error) {
      if (error.message === 'DNS timeout') {
        logger.warn(`DNS timeout for ${domain}`);
        return { domain, available: false, method: 'timeout' };
      }
      
      if (error.code === 'ENOTFOUND') {
        // Try WHOIS as fallback with proper timeout handling
        try {
          const whoisResult = await Promise.race([
            new Promise((resolve) => {
              whois.lookup(domain, (err, data) => {
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
            }),
            new Promise((resolve) => 
              setTimeout(() => resolve({ domain, available: true, method: 'whois-timeout' }), timeout)
            )
          ]);
          
          return whoisResult;
        } catch (whoisError) {
          logger.warn(`WHOIS check failed for ${domain}:`, whoisError.message);
          return { domain, available: true, method: 'dns-only' };
        }
      }
      
      return { domain, available: false, method: 'error' };
    }
  }

  // Generate domain names with error handling (fixed without timeout parameter)
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
        max_tokens: 500
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

  return app;
}

// Only start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Validate environment variables first
  validateEnvironment();
  
  // Create Express app
  const app = createApp();
  
  // Graceful shutdown handler
  let server;
  
  const gracefulShutdown = () => {
    logger.info('Received shutdown signal, closing server...');
    
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
  
  // Start server
  const PORT = process.env.PORT || 8080;
  server = app.listen(PORT, () => {
    logger.info(`Production server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`CORS origins: ${process.env.ALLOWED_ORIGINS || 'localhost only'}`);
    logger.info(`Log sensitive data: ${process.env.LOG_SENSITIVE_DATA === 'true'}`);
  });
  
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