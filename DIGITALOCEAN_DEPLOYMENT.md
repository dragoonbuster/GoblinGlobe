# DigitalOcean App Platform Configuration Guide

This guide explains how to configure environment variables for Goblin Globe on DigitalOcean App Platform.

## Environment Variables to Set

### Required Variables

1. **Go to your DigitalOcean App Platform dashboard**
2. **Click on your app (goblin-globe)**
3. **Go to Settings → App-Level Environment Variables**
4. **Add the following variables:**

```bash
# REQUIRED - Your OpenAI API key
OPENAI_API_KEY=sk-your-actual-api-key-here

# REQUIRED - Must be "production" for deployment
NODE_ENV=production

# REQUIRED - Set your allowed domains
ALLOWED_ORIGINS=https://goblinglobe.xyz,https://www.goblinglobe.xyz
```

### Performance & Rate Limiting Variables

These control how many requests users can make:

```bash
# Rate limiting time window (minutes)
RATE_LIMIT_WINDOW_MINUTES=15

# Max domain generation requests per IP per window
RATE_LIMIT_GENERATE_MAX=5

# Max domain check requests per IP per window
RATE_LIMIT_CHECK_MAX=20

# General rate limit for all other endpoints
RATE_LIMIT_GENERAL_MAX=100
```

**Recommended Settings by Traffic Level:**

- **Low Traffic (< 100 users/day)**:
  - RATE_LIMIT_GENERATE_MAX=10
  - RATE_LIMIT_CHECK_MAX=30
  
- **Medium Traffic (100-1000 users/day)**:
  - RATE_LIMIT_GENERATE_MAX=5 (default)
  - RATE_LIMIT_CHECK_MAX=20 (default)
  
- **High Traffic (> 1000 users/day)**:
  - RATE_LIMIT_GENERATE_MAX=3
  - RATE_LIMIT_CHECK_MAX=10

### Timeout Configuration

Control how long to wait for various operations:

```bash
# OpenAI API timeout (milliseconds)
OPENAI_TIMEOUT_MS=30000  # 30 seconds

# DNS lookup timeout (milliseconds)
DNS_TIMEOUT_MS=5000      # 5 seconds

# WHOIS lookup timeout (milliseconds)
WHOIS_TIMEOUT_MS=5000    # 5 seconds
```

### Request Limits

Control maximum sizes and counts:

```bash
# Max request body size
REQUEST_SIZE_LIMIT=1mb

# Max domains per check request
MAX_DOMAIN_COUNT=50

# Max extensions per generate request
MAX_EXTENSION_COUNT=10
```

### Security Configuration

```bash
# HSTS header max age (seconds)
HSTS_MAX_AGE=31536000  # 1 year

# Static file cache duration
STATIC_CACHE_MAX_AGE=1d

# Secret key for monitoring endpoint (generate a random string)
INTERNAL_MONITOR_KEY=your-random-secret-key-here

# Whether to log sensitive data (set to false for privacy)
LOG_SENSITIVE_DATA=false
```

### Redis Configuration (if using DigitalOcean Managed Redis)

```bash
# Redis connection URL from DigitalOcean
REDIS_URL=rediss://default:password@your-redis-host:25061/0

# Redis retry configuration
REDIS_RETRY_ATTEMPTS=3
REDIS_RETRY_DELAY=500
```

### Optional Configuration

```bash
# OpenAI model to use
OPENAI_MODEL=gpt-3.5-turbo

# Logging level
LOG_LEVEL=info
```

## Step-by-Step Setup

1. **Navigate to Environment Variables**:
   - Open DigitalOcean App Platform
   - Select your app
   - Go to Settings → App-Level Environment Variables
   - Click "Edit"

2. **Add Each Variable**:
   - Click "Add Variable"
   - Enter the KEY (e.g., `OPENAI_API_KEY`)
   - Enter the VALUE
   - For sensitive values, click "Encrypt" to hide them

3. **Save and Deploy**:
   - Click "Save"
   - The app will automatically redeploy with new settings

## Monitoring Your Configuration

### Check Rate Limiting Status

```bash
# From your local machine (replace with your domain)
curl https://goblinglobe.xyz/api/security/status \
  -H "x-internal-monitor: your-internal-monitor-key"
```

### View Current Configuration

Check the `/health` endpoint to see active configuration:

```bash
curl https://goblinglobe.xyz/health
```

## Common Issues and Solutions

### Issue: "Too many requests" errors
**Solution**: Increase rate limits:
- RATE_LIMIT_GENERATE_MAX=10
- RATE_LIMIT_CHECK_MAX=30

### Issue: Timeouts on domain checks
**Solution**: Increase timeouts:
- DNS_TIMEOUT_MS=10000
- WHOIS_TIMEOUT_MS=10000

### Issue: Large domain lists failing
**Solution**: Adjust limits:
- MAX_DOMAIN_COUNT=100
- REQUEST_SIZE_LIMIT=2mb

## Security Best Practices

1. **Always encrypt sensitive variables** (API keys, monitor keys)
2. **Set restrictive ALLOWED_ORIGINS** to only your domains
3. **Keep LOG_SENSITIVE_DATA=false** in production
4. **Generate a strong INTERNAL_MONITOR_KEY** (use a password generator)
5. **Regularly rotate your API keys**

## Performance Optimization

For best performance:

1. **Enable Redis caching** by setting up DigitalOcean Managed Redis
2. **Set appropriate rate limits** based on your OpenAI API limits
3. **Monitor your logs** for timeout issues and adjust accordingly
4. **Use shorter timeouts** if you have good network connectivity

## Example Production Configuration

Here's a complete example for a production deployment:

```bash
# Required
OPENAI_API_KEY=sk-xxxxxxxxxxxx
NODE_ENV=production
ALLOWED_ORIGINS=https://goblinglobe.xyz,https://www.goblinglobe.xyz

# Rate Limiting
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_GENERATE_MAX=5
RATE_LIMIT_CHECK_MAX=20
RATE_LIMIT_GENERAL_MAX=100

# Timeouts
OPENAI_TIMEOUT_MS=30000
DNS_TIMEOUT_MS=5000

# Security
INTERNAL_MONITOR_KEY=randomly-generated-key-1234567890
LOG_SENSITIVE_DATA=false

# Redis (if using)
REDIS_URL=rediss://default:password@redis-host:25061/0
```

## Need Help?

- Check logs in DigitalOcean: App → Runtime Logs
- Monitor performance: App → Insights
- Review security headers: Use https://securityheaders.com/

Remember to test your configuration changes in a staging environment first if possible!