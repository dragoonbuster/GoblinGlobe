# Deployment Guide - Domain Finder

This guide walks through deploying the Domain Finder website to Digital Ocean App Platform with proper security configurations.

## Prerequisites

- Digital Ocean account (get $200 credit: https://www.digitalocean.com/try)
- GitHub account
- Domain name (optional, can use DO's provided subdomain)

## Step 1: Prepare Code for Production

### 1.1 Security Updates

First, add production security packages:

```bash
npm install helmet cors express-rate-limit dotenv
npm install --save-dev @types/node
```

### 1.2 Update server.js with Security Features

Add these security measures to `src/server.js`:

```javascript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per IP per window
  message: 'Too many requests, please try again later.'
});

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 requests per IP per hour
  message: 'Rate limit exceeded. Please try again in an hour.'
});

app.use('/api/generate', limiter);
app.use('/api/', strictLimiter);

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.ip} - ${req.method} ${req.path}`);
  next();
});
```

### 1.3 Environment Configuration

Create `.env.production` (DO NOT commit this):
```
NODE_ENV=production
OPENAI_API_KEY=your_key_here
PORT=8080
ALLOWED_ORIGINS=https://yourdomain.com
```

### 1.4 Update package.json

Add production script:
```json
"scripts": {
  "start": "NODE_ENV=production node src/server.js",
  "dev": "node --watch src/server.js"
}
```

## Step 2: Push to GitHub

### 2.1 Create GitHub Repository

1. Go to https://github.com/new
2. Name: `domain-finder`
3. Private repository (recommended)
4. Do NOT initialize with README

### 2.2 Push Local Code

```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/domain-finder.git

# Push code
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Digital Ocean

### 3.1 Create App on Digital Ocean

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Choose "GitHub" as source
4. Authorize Digital Ocean to access your GitHub
5. Select your `domain-finder` repository
6. Choose branch: `main`

### 3.2 Configure App Settings

#### Build Settings:
- **Build Command**: `npm install`
- **Run Command**: `npm start`

#### Environment Variables (CRITICAL):
1. Click "Edit" next to Environment Variables
2. Add these ENCRYPTED variables:
   - `OPENAI_API_KEY` = [your key] (mark as "Encrypt")
   - `NODE_ENV` = `production`
   - `PORT` = `8080`

#### Resources:
- **Plan**: Basic ($12/month)
- **Container Size**: Basic (512 MB RAM, 1 vCPU)

### 3.3 Security Configuration

#### Add these App-Level Environment Variables:
```
ALLOWED_ORIGINS=https://your-app.ondigitalocean.app
SESSION_SECRET=[generate random 32+ char string]
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=10
```

#### Digital Ocean Firewall:
1. Go to Networking > Firewalls
2. Create new firewall
3. Inbound Rules:
   - HTTP (80) from all IPv4/IPv6
   - HTTPS (443) from all IPv4/IPv6
4. Outbound Rules:
   - All traffic allowed
5. Apply to your app

## Step 4: Post-Deployment Security

### 4.1 Enable HTTPS (Automatic)
Digital Ocean provides free SSL certificates automatically.

### 4.2 Set Up Monitoring

1. Enable DO Monitoring in app settings
2. Set up alerts for:
   - High CPU usage (>80%)
   - High memory usage (>80%)
   - Error rate (>5%)

### 4.3 Add Domain (Optional)

1. In App Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed

### 4.4 Security Headers Check

After deployment, verify security headers:
```bash
curl -I https://your-app.ondigitalocean.app
```

Should see headers like:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`

## Step 5: Production Monitoring

### 5.1 API Key Rotation

1. Generate new API keys monthly
2. Update via DO dashboard (zero downtime)
3. Never commit keys to GitHub

### 5.2 Usage Monitoring

Add logging to track:
- API usage per IP
- Failed requests
- Response times

### 5.3 Cost Management

Monitor:
- OpenAI API usage ($0.002 per request)
- DO App Platform ($12/month base)
- Bandwidth (included up to 1TB)

## Emergency Procedures

### If API Key is Compromised:
1. Immediately revoke key in OpenAI dashboard
2. Generate new key
3. Update in DO environment variables
4. Check logs for unauthorized usage

### If Site is Attacked:
1. Enable stricter rate limits
2. Use DO's DDoS protection
3. Temporarily require Cloudflare proxy

## Maintenance

### Regular Updates:
```bash
# Monthly security updates
npm audit
npm audit fix

# Commit and push updates
git add package*.json
git commit -m "chore: security updates"
git push
```

Digital Ocean will automatically deploy updates from GitHub.

## Important Security Notes

1. **Never** commit `.env` files
2. **Always** use encrypted environment variables in DO
3. **Monitor** OpenAI usage dashboard daily initially
4. **Enable** 2FA on both GitHub and Digital Ocean
5. **Review** logs weekly for suspicious activity
6. **Test** rate limiting works before going live

## Support

- Digital Ocean Support: https://www.digitalocean.com/support/
- Monitor API costs: https://platform.openai.com/usage
- App logs: DO Dashboard > Your App > Runtime Logs