# Domain Finder - Production Deployment Guide

This guide consolidates all deployment information for the Domain Finder application. Whether you're looking for a quick deployment or detailed configuration, this guide has you covered.

## Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [Prerequisites & Setup](#prerequisites--setup)
3. [Security Implementation](#security-implementation)
4. [Testing & Validation](#testing--validation)
5. [Deployment Process](#deployment-process)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Monitoring & Observability](#monitoring--observability)
8. [Operational Runbooks](#operational-runbooks)
9. [Scaling & Cost Management](#scaling--cost-management)
10. [Security Maintenance](#security-maintenance)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Appendices](#appendices)

---

## Quick Start Guide

**Deploy Domain Finder in 15 minutes** - For experienced developers who want to get up and running quickly.

### Prerequisites Checklist
- [ ] Node.js 18+ installed locally
- [ ] GitHub account with repository access
- [ ] DigitalOcean account with payment method
- [ ] OpenAI API key with credits
- [ ] Git configured locally

### Quick Deploy Steps

1. **Clone and prepare**:
   ```bash
   git clone <your-repo-url>
   cd domain-finder
   npm install
   npm run test:security
   ```

2. **Set production configuration**:
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your OpenAI API key
   ```

3. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial production setup"
   git push origin main
   ```

4. **Deploy on DigitalOcean**:
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App" → Connect GitHub → Select your repo
   - Set environment variables (see [Environment Variables](#environment-variables))
   - Deploy!

5. **Verify deployment**:
   ```bash
   curl https://your-app.ondigitalocean.app/health
   ```

For detailed instructions, continue reading below.

---

## Prerequisites & Setup

### Required Accounts

1. **GitHub Account**
   - Repository to host your code
   - SSH key configured for git operations

2. **DigitalOcean Account**
   - Valid payment method attached
   - Budget: ~$22-42/month

3. **OpenAI Account**
   - API key (starts with `sk-`)
   - Active credits or payment method
   - Budget: ~$5-20/month depending on usage

### Local Development Environment

1. **Node.js 18+**:
   ```bash
   node --version  # Should be 18.0.0 or higher
   ```

2. **Git**:
   ```bash
   git --version  # Should be 2.0 or higher
   ```

3. **Development Tools** (optional but recommended):
   - VS Code or preferred editor
   - Postman or curl for API testing
   - GitHub CLI (`gh`) for easier PR management

### Cost Expectations

| Service | Basic | Standard | High Usage |
|---------|-------|----------|------------|
| DigitalOcean | $12/mo | $25/mo | $50/mo |
| OpenAI API | $5/mo | $10/mo | $20/mo |
| Domain (optional) | $10/yr | $10/yr | $10/yr |
| **Total** | ~$17/mo | ~$35/mo | ~$70/mo |

---

## Security Implementation

### Production Server Configuration

The application includes comprehensive security features. Here's the complete production configuration:

1. **Install security dependencies**:
   ```bash
   npm install helmet cors express-rate-limit express-validator express-mongo-sanitize compression winston winston-daily-rotate-file
   ```

2. **Environment Variables** (`.env.production`):
   ```env
   NODE_ENV=production
   PORT=8080
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   LOG_LEVEL=info
   LOG_SENSITIVE_DATA=false
   INTERNAL_MONITOR_KEY=generate-a-random-key-here
   ```

3. **Security Features Implemented**:
   - **Helmet.js**: Comprehensive security headers
   - **CORS**: Configurable origin restrictions
   - **Rate Limiting**: 
     - Generate endpoint: 5 requests per 15 minutes
     - Check endpoint: 20 requests per 15 minutes
     - General API: 100 requests per 15 minutes
   - **Input Validation**: All inputs sanitized and validated
   - **DNS Rebinding Protection**: Blocks private IPs and suspicious domains
   - **Prompt Injection Detection**: Prevents malicious prompts
   - **Secure Logging**: Sensitive data redaction

### Security Configuration Details

See `src/app-production.js` for the complete implementation. Key security middleware includes:

```javascript
// Rate limiting
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many generation requests. Please try again later.'
});

// Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      // ... additional directives
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## Testing & Validation

### Pre-Deployment Testing

1. **Security Audit**:
   ```bash
   npm run test:security
   ```

2. **Unit & Integration Tests**:
   ```bash
   npm test
   npm run test:coverage
   ```

3. **Load Testing** (optional):
   ```bash
   npm run test:load
   ```

4. **Manual Testing Checklist**:
   - [ ] Generate domains with various prompts
   - [ ] Test rate limiting (make 6+ requests rapidly)
   - [ ] Verify domain checking accuracy
   - [ ] Test with invalid inputs
   - [ ] Check security headers in browser dev tools

### Security Headers Verification

Run the security headers test:
```bash
npm run test:headers
```

Expected output should show all security headers properly configured.

---

## Deployment Process

### Step 1: Prepare GitHub Repository

1. **Create new repository**:
   ```bash
   gh repo create domain-finder --public
   ```

2. **Push code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/domain-finder.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Configure DigitalOcean App Platform

1. **Create New App**:
   - Navigate to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Select "GitHub" as source

2. **Configure Build Settings**:
   - **Source Directory**: `/`
   - **Build Command**: `npm ci --production`
   - **Run Command**: `npm start`

3. **Environment Variables** (encrypted):
   ```
   NODE_ENV=production
   PORT=8080
   OPENAI_API_KEY=[your-key]
   OPENAI_MODEL=gpt-3.5-turbo
   ALLOWED_ORIGINS=https://your-app.ondigitalocean.app
   LOG_LEVEL=info
   LOG_SENSITIVE_DATA=false
   INTERNAL_MONITOR_KEY=[generate-random-key]
   ```

4. **Health Checks**:
   - **HTTP Path**: `/health`
   - **Port**: 8080
   - **Success Threshold**: 1
   - **Failure Threshold**: 3

5. **Resource Sizing**:
   - **Basic**: $12/month (512 MB RAM, 1 vCPU)
   - **Professional**: $25/month (1 GB RAM, 1 vCPU)

### Step 3: Deploy

1. Click "Next" through the configuration
2. Review settings
3. Click "Create Resources"
4. Wait for deployment (5-10 minutes)

---

## Post-Deployment Configuration

### Domain Setup (Optional)

1. **Add Custom Domain** in DigitalOcean:
   - Settings → Domains → Add Domain
   - Enter your domain name

2. **Configure DNS**:
   ```
   Type: CNAME
   Host: @ (or subdomain)
   Points to: your-app.ondigitalocean.app.
   ```

3. **Wait for SSL Certificate** (automatic via Let's Encrypt)

### Monitoring Setup

1. **DigitalOcean Monitoring** (automatic):
   - CPU, Memory, Response time
   - Alert policies available

2. **External Monitoring** (recommended):
   - [UptimeRobot](https://uptimerobot.com): Free tier available
   - Monitor: `https://your-app.ondigitalocean.app/health`
   - Alert contacts: Email, SMS, Slack

3. **Application Metrics**:
   ```bash
   # View logs
   doctl apps logs YOUR_APP_ID --type=run

   # View metrics
   doctl apps metrics YOUR_APP_ID
   ```

### Security Verification

1. **Check SSL Configuration**:
   ```bash
   curl -I https://your-app.ondigitalocean.app
   ```

2. **Verify Security Headers**:
   ```bash
   curl -I https://your-app.ondigitalocean.app/api/generate
   ```

3. **Test Rate Limiting**:
   ```bash
   for i in {1..6}; do
     curl -X POST https://your-app.ondigitalocean.app/api/generate \
       -H "Content-Type: application/json" \
       -d '{"prompt":"test","count":5,"extensions":[".com"]}'
   done
   ```

---

## Monitoring & Observability

### Key Metrics to Monitor

1. **Application Health**:
   - Uptime: Target 99.9%
   - Response time: < 500ms p95
   - Error rate: < 1%

2. **Resource Usage**:
   - CPU: Alert at 80%
   - Memory: Alert at 85%
   - Disk: Alert at 90%

3. **API Metrics**:
   - Request volume
   - Rate limit hits
   - OpenAI API errors

### Log Analysis

Logs are stored with daily rotation. Access via:
```bash
# Real-time logs
doctl apps logs YOUR_APP_ID --follow

# Download logs
doctl apps logs YOUR_APP_ID > app-logs.txt

# Search logs
doctl apps logs YOUR_APP_ID | grep "error"
```

### Alerts Configuration

Set up alerts for:
- [ ] Application down (health check fails)
- [ ] High error rate (> 5%)
- [ ] Resource exhaustion (CPU/Memory > 90%)
- [ ] Suspicious activity (multiple rate limit hits)
- [ ] OpenAI API failures

---

## Operational Runbooks

### High CPU Usage

**Symptoms**: CPU > 80% sustained

**Actions**:
1. Check request volume: `doctl apps logs YOUR_APP_ID | grep "api_request"`
2. Identify heavy operations
3. Scale up if legitimate traffic
4. Investigate potential DoS if suspicious

### API Key Compromise

**Symptoms**: Unusual API usage, unexpected costs

**Actions**:
1. **Immediate**: Revoke compromised key in OpenAI dashboard
2. Generate new API key
3. Update DigitalOcean environment variable
4. Redeploy application
5. Review logs for unauthorized usage
6. Update security monitoring

### Memory Leak Investigation

**Symptoms**: Gradually increasing memory usage

**Actions**:
1. Check uptime: `curl https://your-app.ondigitalocean.app/health`
2. Review memory patterns in monitoring
3. Analyze heap dumps if available
4. Schedule regular restarts if needed
5. Investigate code for memory retention

### Deployment Rollback

**If deployment fails**:
1. Go to DigitalOcean App Platform
2. Navigate to "Activity" tab
3. Find previous successful deployment
4. Click "Rollback to this deployment"

---

## Scaling & Cost Management

### Scaling Triggers

Scale up when:
- CPU consistently > 70%
- Memory consistently > 80%
- Response time p95 > 1 second
- Request volume increases 50%

### Scaling Options

1. **Vertical Scaling** (increase resources):
   ```
   Basic → Professional → Professional XL
   $12/mo → $25/mo → $50/mo
   ```

2. **Horizontal Scaling** (add instances):
   - Configure in App Platform settings
   - Load balanced automatically
   - Costs multiply per instance

### Cost Optimization

1. **Monitor OpenAI Usage**:
   - Set usage limits in OpenAI dashboard
   - Implement caching for repeated queries
   - Use GPT-3.5-turbo (most cost-effective)

2. **Optimize Resources**:
   - Right-size based on actual usage
   - Use autoscaling during peak hours
   - Consider serverless for variable load

---

## Security Maintenance

### Weekly Tasks
- [ ] Review security logs for anomalies
- [ ] Check for dependency updates: `npm outdated`
- [ ] Monitor rate limit effectiveness
- [ ] Review error logs

### Monthly Tasks
- [ ] Run full security audit: `npm audit`
- [ ] Update dependencies: `npm update`
- [ ] Review and rotate API keys
- [ ] Test backup procedures
- [ ] Review security alerts

### Quarterly Tasks
- [ ] Penetration testing (if applicable)
- [ ] Security documentation review
- [ ] Team security training
- [ ] Disaster recovery drill

### API Key Rotation

1. Generate new key in OpenAI
2. Update in DigitalOcean (Settings → App-Level Environment Variables)
3. Save and redeploy
4. Verify functionality
5. Revoke old key

---

## Troubleshooting Guide

### Common Issues

#### "Service temporarily unavailable"
- **Cause**: OpenAI API issues
- **Fix**: Check API key validity, credits, and OpenAI status

#### SSL Certificate Errors
- **Cause**: DNS not fully propagated
- **Fix**: Wait 24 hours, verify DNS configuration

#### Rate Limit Hit Immediately
- **Cause**: IP already rate limited
- **Fix**: Wait 15 minutes or adjust limits

#### High Memory Usage
- **Cause**: Memory leak or high traffic
- **Fix**: Restart app, investigate with logs

### Debug Commands

```bash
# Check application status
curl https://your-app.ondigitalocean.app/health

# Test OpenAI connectivity
curl https://your-app.ondigitalocean.app/ready

# View recent logs
doctl apps logs YOUR_APP_ID --lines=100

# Check deployment status
doctl apps get YOUR_APP_ID

# Force restart
doctl apps create-restart YOUR_APP_ID
```

### Performance Debugging

1. **Slow Response Times**:
   - Check OpenAI API latency
   - Review DNS lookup times
   - Analyze application logs

2. **Memory Issues**:
   - Monitor heap usage
   - Check for memory leaks
   - Review concurrent connections

---

## Appendices

### A. Complete Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | Yes | - | Set to "production" |
| PORT | No | 8080 | Application port |
| OPENAI_API_KEY | Yes | - | OpenAI API key |
| OPENAI_MODEL | No | gpt-3.5-turbo | Model to use |
| ALLOWED_ORIGINS | No | localhost | CORS origins |
| LOG_LEVEL | No | info | Logging verbosity |
| LOG_SENSITIVE_DATA | No | false | Log sensitive data |
| INTERNAL_MONITOR_KEY | No | - | Security monitoring key |

### B. Security Headers Reference

All responses include:
- `Strict-Transport-Security`: HSTS with preload
- `X-Content-Type-Options`: nosniff
- `X-Frame-Options`: SAMEORIGIN
- `X-XSS-Protection`: 0 (disabled in favor of CSP)
- `Content-Security-Policy`: Restrictive policy
- `X-DNS-Prefetch-Control`: off

### C. API Endpoints

| Endpoint | Method | Rate Limit | Description |
|----------|--------|------------|-------------|
| /health | GET | None | Health check |
| /ready | GET | None | Readiness check |
| /api/generate | POST | 5/15min | Generate domains |
| /api/check | POST | 20/15min | Check availability |
| /api/security/status | GET | 100/15min | Security status |

### D. Compliance Considerations

- **GDPR**: No personal data collected
- **CCPA**: No California resident data collected
- **Logs**: IPs hashed, no PII stored
- **Data Retention**: Logs rotate after 14 days

### E. Backup and Recovery

1. **Code Backup**: GitHub repository
2. **Configuration Backup**: Document all environment variables
3. **Recovery Time Objective (RTO)**: 30 minutes
4. **Recovery Point Objective (RPO)**: Last deployment

---

## Support and Updates

- **Security Issues**: Create private security advisory on GitHub
- **Documentation Updates**: Submit PR with changes
- **Questions**: Open GitHub issue

Last Updated: August 2025