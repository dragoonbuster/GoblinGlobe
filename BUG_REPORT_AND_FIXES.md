# Production Bug Report and Fixes

## Bug #1: DNS Timeout Implementation Doesn't Work

### Description
The `AbortController` API is used to timeout DNS lookups, but Node.js `dns.resolve4()` doesn't support AbortSignal. The timeout code has no effect.

### Impact
- DNS lookups can hang indefinitely
- Server can become unresponsive if DNS server is slow
- Rate limiting becomes ineffective if requests pile up

### Steps to Reproduce
1. Block DNS traffic with firewall
2. Make request to `/api/generate`
3. Request will hang beyond the 5-second timeout

### Root Cause
```javascript
// This doesn't work - dns.resolve4 doesn't accept AbortSignal
const controller = new AbortController();
await dns.resolve4(domain); // No signal parameter!
```

### Fix
Replace with Promise.race pattern:

```javascript
async function checkDomainAvailability(domain, timeout = 5000) {
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
      // WHOIS check code...
    }
    
    return { domain, available: false, method: 'error' };
  }
}
```

---

## Bug #2: OpenAI Client Timeout Parameter Invalid

### Description
The OpenAI Node.js client doesn't accept a `timeout` parameter in `chat.completions.create()`. This causes a silent failure or unexpected behavior.

### Impact
- Timeout is ignored, requests can hang
- False sense of security about timeout protection
- Potential for long-running requests to consume resources

### Steps to Reproduce
1. Check OpenAI client documentation
2. The `timeout` parameter is not valid for `create()` method

### Root Cause
```javascript
// This parameter doesn't exist
const response = await openai.chat.completions.create({
  // ... other params
  timeout: 30000 // ❌ Not a valid parameter!
});
```

### Fix
Use the client-level timeout configuration:

```javascript
// Option 1: Configure timeout when creating client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000 // 30 seconds
});

// Option 2: Use Promise.race for per-request timeout
async function generateDomainNames(prompt, count = 10) {
  try {
    const systemPrompt = `Generate exactly ${count} domain names...`;
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('OpenAI timeout')), 30000)
    );
    
    const response = await Promise.race([
      openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 500
      }),
      timeoutPromise
    ]);
    
    // Rest of function...
  } catch (error) {
    if (error.message === 'OpenAI timeout') {
      logger.error('OpenAI request timeout');
      throw new Error('AI service timeout - please try again');
    }
    throw error;
  }
}
```

---

## Bug #3: Security Headers Test Requires Running Server

### Description
The security headers test attempts to connect to a server that may not be running, causing the test to fail with connection errors rather than testing headers.

### Impact
- Test suite appears broken
- CI/CD pipelines will fail
- Security headers might not be properly validated

### Steps to Reproduce
1. Ensure server is not running
2. Run `npm run test:headers`
3. Test fails with ECONNREFUSED

### Root Cause
Test assumes server is already running at localhost:3000

### Fix
Create a test that starts its own server instance:

```javascript
// tests/security-headers-test.js
import { createServer } from 'http';
import app from '../src/server-production.js';

const PORT = 3999; // Use different port to avoid conflicts

// Start server for testing
const server = app.listen(PORT, async () => {
  console.log(`Test server started on port ${PORT}`);
  
  const requiredHeaders = {
    'x-frame-options': 'SAMEORIGIN',
    'x-content-type-options': 'nosniff',
    'strict-transport-security': /max-age=\d+/,
    'x-xss-protection': '1; mode=block'
  };
  
  const testUrl = `http://localhost:${PORT}`;
  
  try {
    const response = await fetch(testUrl);
    const headers = response.headers;
    let passed = true;
    
    for (const [header, expected] of Object.entries(requiredHeaders)) {
      const value = headers.get(header);
      
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
    
    server.close();
    process.exit(passed ? 0 : 1);
  } catch (error) {
    console.error('Test failed:', error.message);
    server.close();
    process.exit(1);
  }
});
```

---

## Bug #4: WHOIS Timeout Promise Rejection Not Caught

### Description
The WHOIS timeout uses `reject()` inside setTimeout, but this rejection isn't caught by the try-catch block because it's inside a Promise constructor.

### Impact
- Unhandled promise rejections
- Process might crash in Node.js future versions
- Timeout might not work as expected

### Steps to Reproduce
1. Make WHOIS lookup take longer than timeout
2. Watch for unhandled promise rejection warnings

### Root Cause
```javascript
return await new Promise((resolve, reject) => {
  const whoisTimeout = setTimeout(() => {
    reject(new Error('WHOIS timeout')); // This might not be caught!
  }, timeout);
  // ...
});
```

### Fix
Properly handle the timeout within the Promise:

```javascript
async function checkDomainAvailability(domain, timeout = 5000) {
  try {
    // DNS lookup with timeout
    const dnsTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('DNS timeout')), timeout)
    );
    
    await Promise.race([dns.resolve4(domain), dnsTimeoutPromise]);
    return { domain, available: false, method: 'dns' };
  } catch (error) {
    if (error.message === 'DNS timeout' || error.code === 'ENOTFOUND') {
      // Try WHOIS as fallback
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
```

---

## Bug #5: Sensitive Data in Logs

### Description
The logging configuration logs full request details including IP addresses and potentially sensitive prompt data.

### Impact
- Privacy concerns
- GDPR compliance issues
- Potential exposure of user ideas/prompts

### Steps to Reproduce
1. Make request with sensitive prompt
2. Check logs/app-*.log
3. Full prompt is visible (first 50 chars)

### Root Cause
```javascript
logger.info({
  type: 'api_request',
  endpoint: 'generate',
  prompt: prompt.substring(0, 50), // Still logs partial prompt
  count,
  extensions,
  ip: req.ip // Logs IP address
});
```

### Fix
Add log sanitization and make sensitive logging configurable:

```javascript
// Add to environment variables
const LOG_SENSITIVE_DATA = process.env.LOG_SENSITIVE_DATA === 'true';

// Create log sanitizer
function sanitizeLogData(data) {
  if (!LOG_SENSITIVE_DATA) {
    // Hash IPs for privacy
    if (data.ip) {
      const crypto = require('crypto');
      data.ip = crypto.createHash('sha256').update(data.ip).digest('hex').substring(0, 8);
    }
    
    // Remove prompt content
    if (data.prompt) {
      data.prompt = '[REDACTED]';
    }
    
    // Mask user agent
    if (data.userAgent) {
      data.userAgent = data.userAgent.split('/')[0]; // Just browser name
    }
  }
  return data;
}

// Update logging calls
logger.info(sanitizeLogData({
  type: 'api_request',
  endpoint: 'generate',
  prompt: prompt,
  count,
  extensions,
  ip: req.ip
}));

// Update request logging middleware
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
```

---

## Bug #6: Missing Environment Variable Validation

### Description
The server only checks for OPENAI_API_KEY and NODE_ENV, but uses other environment variables without validation.

### Impact
- Confusing errors when ALLOWED_ORIGINS is not set correctly
- Unclear error messages
- Security misconfigurations

### Steps to Reproduce
1. Set ALLOWED_ORIGINS to invalid value
2. CORS will silently fail

### Root Cause
Missing validation for all used environment variables

### Fix
Add comprehensive environment validation:

```javascript
// Validate required environment variables
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
  }
};

// Check all environment variables
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
```

---

## Implementation Priority

1. **Critical**: Fix DNS/WHOIS timeout implementation (Bug #1, #4)
2. **Critical**: Fix OpenAI timeout (Bug #2)
3. **High**: Add environment validation (Bug #6)
4. **Medium**: Fix security test (Bug #3)
5. **Medium**: Add log sanitization (Bug #5)

## Testing After Fixes

Run these commands to verify fixes:

```bash
# Test environment validation
unset OPENAI_API_KEY && npm start  # Should fail with clear error

# Test timeouts
# Add artificial delay to DNS/WHOIS and verify timeout works

# Test security headers
npm run test:headers  # Should pass without external server

# Test log sanitization
# Make requests and verify logs don't contain sensitive data

# Load test to verify performance
npm run test:load  # If Node 22+ available
```