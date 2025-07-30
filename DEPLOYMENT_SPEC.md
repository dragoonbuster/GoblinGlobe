# Production Deployment Specification - Domain Finder

## Overview
This is a comprehensive specification for deploying Domain Finder as a production-ready web service. This document includes all security implementations, monitoring, testing procedures, and operational runbooks needed for a secure, scalable deployment.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Security Implementation](#security-implementation)
3. [Testing Procedures](#testing-procedures)
4. [Deployment Process](#deployment-process)
5. [Monitoring & Observability](#monitoring--observability)
6. [Cost Analysis](#cost-analysis)
7. [Operational Runbooks](#operational-runbooks)
8. [Scaling Guidelines](#scaling-guidelines)

## Pre-Deployment Checklist

### Required Accounts
- [ ] Digital Ocean account with billing configured
- [ ] GitHub account with 2FA enabled
- [ ] OpenAI account with production API key
- [ ] Domain name (optional but recommended)
- [ ] Sentry account for error tracking (free tier)
- [ ] UptimeRobot account for monitoring (free tier)

### Local Testing Requirements
- [ ] Node.js 18+ installed
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Load testing performed
- [ ] API key properly secured

## Security Implementation

### Step 1: Install Security Dependencies

```bash
npm install helmet cors express-rate-limit express-validator 
npm install express-mongo-sanitize compression express-session
npm install winston winston-daily-rotate-file
npm install --save-dev @types/node artillery
```

### Step 2: Create Production Server Configuration

Create `src/server-production.js`:

```javascript
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
```

### Step 3: Environment Configuration

Create `.env.production.example`:
```
NODE_ENV=production
PORT=8080
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
LOG_LEVEL=info
```

### Step 4: Update package.json

```json
{
  "name": "domain-finder",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "start": "NODE_ENV=production node src/server-production.js",
    "dev": "node --watch src/server.js",
    "test": "node --test",
    "test:load": "artillery run tests/load-test.yml",
    "test:security": "npm audit && npm run test:headers",
    "test:headers": "node tests/security-headers-test.js",
    "build": "npm ci --production",
    "logs": "tail -f logs/app-*.log"
  },
  "dependencies": {
    "express": "^4.18.2",
    "openai": "^4.24.0",
    "dns-socket": "^4.2.2",
    "whois": "^2.14.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "express-mongo-sanitize": "^2.2.0",
    "compression": "^1.7.4",
    "express-session": "^1.17.3",
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "artillery": "^2.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Testing Procedures

### Step 1: Create Load Test Configuration

Create `tests/load-test.yml`:
```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 2
      name: "Warm-up"
    - duration: 120
      arrivalRate: 10
      name: "Sustained load"
    - duration: 60
      arrivalRate: 20
      name: "Peak load"
  processor: "./load-test-processor.js"

scenarios:
  - name: "Generate domains"
    weight: 70
    flow:
      - post:
          url: "/api/generate"
          json:
            prompt: "{{ randomPrompt }}"
            count: 5
            extensions: [".com", ".net"]
          expect:
            - statusCode: 200
            - contentType: json
            - hasProperty: success
      - think: 5

  - name: "Check domains"
    weight: 30
    flow:
      - post:
          url: "/api/check"
          json:
            domains: ["example123.com", "test456.net"]
          expect:
            - statusCode: 200
      - think: 3
```

Create `tests/load-test-processor.js`:
```javascript
module.exports = {
  beforeRequest: (requestParams, context, events, done) => {
    const prompts = [
      "tech startup with AI",
      "eco-friendly products",
      "creative agency names",
      "food delivery service",
      "fitness app names"
    ];
    context.vars.randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    return done();
  }
};
```

### Step 2: Security Headers Test

Create `tests/security-headers-test.js`:
```javascript
import http from 'http';

const requiredHeaders = {
  'x-frame-options': 'SAMEORIGIN',
  'x-content-type-options': 'nosniff',
  'strict-transport-security': /max-age=\d+/,
  'x-xss-protection': '1; mode=block'
};

const testUrl = process.env.TEST_URL || 'http://localhost:3000';

console.log(`Testing security headers for ${testUrl}...`);

http.get(testUrl, (res) => {
  let passed = true;
  
  for (const [header, expected] of Object.entries(requiredHeaders)) {
    const value = res.headers[header];
    
    if (!value) {
      console.error(`❌ Missing header: ${header}`);
      passed = false;
    } else if (expected instanceof RegExp) {
      if (!expected.test(value)) {
        console.error(`❌ Invalid ${header}: ${value}`);
        passed = false;
      } else {
        console.log(`✅ ${header}: ${value}`);
      }
    } else if (value !== expected) {
      console.error(`❌ Invalid ${header}: ${value} (expected: ${expected})`);
      passed = false;
    } else {
      console.log(`✅ ${header}: ${value}`);
    }
  }
  
  process.exit(passed ? 0 : 1);
}).on('error', (err) => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
```

### Step 3: Local Testing Checklist

1. **Unit Tests**
   ```bash
   npm test
   ```

2. **Security Audit**
   ```bash
   npm audit
   npm run test:security
   ```

3. **Load Testing**
   ```bash
   # Start server in one terminal
   npm start
   
   # Run load test in another
   npm run test:load
   ```

4. **Manual Testing**
   - Test rate limiting by making rapid requests
   - Test invalid inputs
   - Test large payloads (should be rejected)
   - Verify CORS works correctly

## Deployment Process

### Step 1: GitHub Setup

```bash
# Initialize git if not already done
git init

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/domain-finder.git

# Create production branch
git checkout -b production

# Add all files
git add .

# Commit
git commit -m "Production-ready deployment with security hardening"

# Push
git push -u origin production
```

### Step 2: Digital Ocean App Platform Setup

1. **Create App**
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Select GitHub repository
   - Choose `production` branch

2. **Configure Build**
   ```yaml
   Build Command: npm ci --production
   Run Command: npm start
   ```

3. **Environment Variables** (ALL must be encrypted)
   ```
   NODE_ENV=production
   PORT=8080
   OPENAI_API_KEY=[your-key]
   OPENAI_MODEL=gpt-3.5-turbo
   ALLOWED_ORIGINS=https://your-app.ondigitalocean.app
   LOG_LEVEL=info
   ```

4. **Health Checks**
   - HTTP Path: `/health`
   - Port: 8080
   - Success Threshold: 3
   - Failure Threshold: 3
   - Timeout: 10s
   - Period: 30s

5. **Resource Sizing**
   - For <1000 requests/day: Basic ($12/month)
   - For <10000 requests/day: Professional ($25/month)
   - For >10000 requests/day: Add horizontal scaling

### Step 3: Configure Monitoring

1. **Digital Ocean Monitoring**
   - Enable all metrics
   - Set up alerts:
     - CPU > 80% for 5 minutes
     - Memory > 80% for 5 minutes
     - Error rate > 5% for 5 minutes
     - Response time > 2s for 5 minutes

2. **External Monitoring (UptimeRobot)**
   ```
   Monitor Type: HTTP(s)
   URL: https://your-app.ondigitalocean.app/health
   Check Interval: 5 minutes
   Alert contacts: Your email, SMS
   ```

3. **Error Tracking (Sentry)**
   ```bash
   npm install @sentry/node
   ```
   
   Add to server-production.js:
   ```javascript
   import * as Sentry from '@sentry/node';
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 0.1
   });
   ```

### Step 4: DNS Configuration (if using custom domain)

1. Add domain in DO App settings
2. Update DNS records:
   ```
   Type: A
   Name: @
   Value: [DO provides this]
   TTL: 3600
   
   Type: CNAME
   Name: www
   Value: your-domain.com
   TTL: 3600
   ```

## Monitoring & Observability

### Metrics to Track

1. **Application Metrics**
   - Request rate by endpoint
   - Response time percentiles (p50, p95, p99)
   - Error rate by type
   - API key usage rate

2. **Infrastructure Metrics**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network throughput

3. **Business Metrics**
   - Domain checks per day
   - Unique users
   - Most popular TLDs
   - Generation success rate

### Alert Configuration

| Metric | Threshold | Action |
|--------|-----------|--------|
| Error rate | >5% for 5 min | Check logs, possible rollback |
| Response time | >2s p95 for 10 min | Scale up, check load |
| CPU | >90% for 5 min | Scale up immediately |
| Memory | >85% for 5 min | Check for memory leaks |
| API failures | >10 in 5 min | Check OpenAI status |
| Rate limit hits | >100/hour | Review limits, possible attack |

### Log Analysis Queries

```bash
# Most frequent IPs
grep "api_request" logs/app-*.log | jq '.ip' | sort | uniq -c | sort -nr | head -20

# Error patterns
grep "error" logs/error-*.log | jq '.error' | sort | uniq -c | sort -nr

# Slow requests
grep "api_success" logs/app-*.log | jq 'select(.duration > 2000)' | jq '.endpoint'

# Usage by hour
grep "api_request" logs/app-*.log | jq '.timestamp' | cut -d'T' -f2 | cut -d':' -f1 | sort | uniq -c
```

## Cost Analysis

### Monthly Cost Breakdown

| Service | Usage | Cost |
|---------|-------|------|
| DO App Platform | Basic tier | $12 |
| OpenAI API | 5000 requests @ $0.002 | $10 |
| Domain | Annual / 12 | $1 |
| Monitoring | Free tiers | $0 |
| **Total** | | **$23/month** |

### Cost Optimization

1. **Cache frequently checked domains** (Redis: $15/month)
   - ROI positive at >10k checks/month

2. **Use GPT-3.5-turbo** instead of GPT-4
   - 10x cost reduction

3. **Implement user accounts**
   - Charge $5/month for unlimited
   - Break even at 5 users

### Scaling Costs

| Users/Day | Requests/Day | Infrastructure | API Costs | Total/Month |
|-----------|--------------|----------------|-----------|-------------|
| 100 | 500 | Basic ($12) | $30 | $42 |
| 1000 | 5000 | Professional ($25) | $300 | $325 |
| 10000 | 50000 | 2x Professional ($50) | $3000 | $3050 |

## Operational Runbooks

### Runbook: High CPU Usage

**Trigger**: CPU >80% for 5 minutes

1. Check current traffic:
   ```bash
   doctl apps logs [APP_ID] --type=run --tail=100
   ```

2. Identify heavy endpoints:
   ```bash
   grep "api_" logs/app-*.log | jq '.endpoint' | sort | uniq -c | sort -nr
   ```

3. If legitimate traffic:
   - Scale horizontally in DO dashboard
   - Add more instances

4. If attack/abuse:
   - Tighten rate limits
   - Block IPs if necessary
   - Enable Cloudflare if severe

### Runbook: API Key Compromised

**Trigger**: Unusual API usage spike

1. **Immediate Actions** (5 minutes)
   - Revoke key in OpenAI dashboard
   - Generate new key
   - Update in DO environment variables

2. **Investigation** (30 minutes)
   ```bash
   # Find unusual usage patterns
   grep "api_request" logs/app-*.log | jq '.ip' | sort | uniq -c | sort -nr | head -50
   
   # Check for suspicious prompts
   grep "api_request" logs/app-*.log | jq '.prompt' | grep -i "test\|key\|token"
   ```

3. **Prevention**
   - Rotate keys monthly
   - Implement IP allowlisting if possible
   - Add anomaly detection

### Runbook: Deployment Rollback

**Trigger**: Critical bug in production

1. **In Digital Ocean Dashboard**:
   - Go to Activity tab
   - Find previous deployment
   - Click "Rollback"

2. **Via CLI**:
   ```bash
   doctl apps create-rollback [APP_ID] --deployment-id [PREVIOUS_DEPLOYMENT_ID]
   ```

3. **Post-Rollback**:
   - Create hotfix branch
   - Fix issue
   - Test thoroughly
   - Deploy through normal process

### Runbook: Database Connection Issues
*Note: Current app has no database, but if added:*

1. Check connection pool:
   ```bash
   grep "database" logs/app-*.log | tail -50
   ```

2. Restart app if needed:
   ```bash
   doctl apps create-deployment [APP_ID]
   ```

## Scaling Guidelines

### Vertical Scaling Triggers
- CPU consistently >70%
- Memory consistently >80%
- Response time p95 >1.5s

### Horizontal Scaling Triggers
- >10k requests/day
- Need for geographic distribution
- High availability requirements

### Scaling Strategy

1. **Phase 1**: Single instance (0-1k users/day)
   - Basic tier
   - Single region

2. **Phase 2**: Horizontal scaling (1k-10k users/day)
   - 2-3 instances
   - Load balancer
   - Redis cache

3. **Phase 3**: Multi-region (10k+ users/day)
   - Geographic distribution
   - CDN for static assets
   - Read replicas if database added

### Performance Optimization Checklist

- [ ] Enable gzip compression
- [ ] Implement caching headers
- [ ] Use CDN for static assets
- [ ] Cache DNS lookups (Redis)
- [ ] Batch API calls where possible
- [ ] Implement request queuing for bursts

## Security Maintenance

### Weekly Tasks
- Review logs for suspicious activity
- Check for new npm vulnerabilities
- Monitor rate limit effectiveness
- Review error patterns

### Monthly Tasks
- Rotate API keys
- Update dependencies
- Review and update rate limits
- Audit user access logs
- Load test to verify performance

### Quarterly Tasks
- Full security audit
- Disaster recovery test
- Review scaling needs
- Update documentation

## Compliance & Legal

### Required Policies
1. **Privacy Policy** covering:
   - What data is collected
   - How it's used
   - Third-party services (OpenAI)
   - Data retention

2. **Terms of Service** covering:
   - Acceptable use
   - Rate limits
   - No warranty disclaimer
   - Limitation of liability

3. **Cookie Policy** (if adding analytics)

### GDPR Compliance (if serving EU users)
- Add consent mechanisms
- Implement data export
- Add deletion capabilities
- Appoint DPO if needed

## Troubleshooting Guide

### Common Issues

1. **"Too many requests" errors**
   - Check rate limit configuration
   - Verify IP-based limiting works
   - Consider increasing limits

2. **Slow domain checks**
   - DNS resolver issues
   - WHOIS timeout too high
   - Consider adding cache

3. **High OpenAI costs**
   - Check for abuse
   - Review generation logic
   - Consider prompt optimization

4. **Memory leaks**
   ```bash
   # Monitor memory over time
   doctl apps logs [APP_ID] --type=run | grep "Memory"
   ```

5. **SSL certificate issues**
   - DO handles automatically
   - Check domain configuration
   - Verify DNS propagation

This specification provides a complete production deployment plan. The actual deployment should follow these steps carefully, with testing at each stage.