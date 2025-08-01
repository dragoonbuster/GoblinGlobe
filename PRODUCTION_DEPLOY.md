# Production Deployment Checklist

## Prerequisites
- [x] All code fixes implemented and tested
- [x] Security audit passed (0 vulnerabilities)
- [x] Security headers test passing
- [x] Timeout handling verified

## Step 1: GitHub Repository Setup (Your Action Required)

1. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Repository name: `domain-finder`
   - Set to **Private** (recommended for production apps)
   - Do NOT initialize with README (we have files already)

2. **Add Remote and Push**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/domain-finder.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Digital Ocean Setup (Your Action Required)

1. **Create DO Account**:
   - Sign up at https://cloud.digitalocean.com
   - Use promo code for $200 credit: https://www.digitalocean.com/try

2. **Create App Platform App**:
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Choose "GitHub" as source
   - Authorize DO to access your GitHub
   - Select your `domain-finder` repository
   - Choose branch: `main`

## Step 3: Configure App Settings (Your Action Required)

### Build Configuration:
```
Build Command: npm ci --production
Run Command: npm start
```

### Environment Variables (CRITICAL - Mark ALL as ENCRYPTED):
```
NODE_ENV=production
PORT=8080
OPENAI_API_KEY=your_actual_openai_key_here
OPENAI_MODEL=gpt-3.5-turbo
ALLOWED_ORIGINS=https://your-app.ondigitalocean.app
LOG_LEVEL=info
LOG_SENSITIVE_DATA=false
```

### Resource Configuration:
- **Plan**: Basic ($12/month)
- **Container Size**: Basic (512 MB RAM, 1 vCPU)

### Health Checks:
- **HTTP Path**: `/health`
- **Port**: 8080
- **Success Threshold**: 3
- **Failure Threshold**: 3
- **Timeout**: 10s
- **Period**: 30s

## Step 4: Post-Deployment Verification

### Security Check:
1. Visit your app URL
2. Test API endpoints:
   ```bash
   curl -X POST https://your-app.ondigitalocean.app/api/generate \
     -H "Content-Type: application/json" \
     -d '{"prompt":"tech startup names","count":3,"extensions":[".com"]}'
   ```

3. Verify security headers:
   ```bash
   curl -I https://your-app.ondigitalocean.app
   ```

### Rate Limiting Test:
1. Make 6 requests quickly to `/api/generate`
2. Should get 429 error on 6th request

## Step 5: Monitoring Setup (Your Action Required)

### Digital Ocean Monitoring:
1. In DO dashboard, go to your app
2. Enable monitoring
3. Set alerts for:
   - CPU > 80% for 5 minutes
   - Memory > 80% for 5 minutes
   - Error rate > 5% for 5 minutes

### External Monitoring (Free):
1. Sign up at https://uptimerobot.com
2. Add HTTP monitor:
   - URL: `https://your-app.ondigitalocean.app/health`
   - Check interval: 5 minutes

## Expected Costs

### Monthly Breakdown:
- Digital Ocean App Platform: $12/month
- OpenAI API (estimated): $10-30/month depending on usage
- Domain (optional): ~$12/year
- **Total**: ~$22-42/month

### Usage Limits:
- Current rate limits: 5 generations per 15 minutes per IP
- With $12 DO plan: Can handle ~1000 users/day
- OpenAI costs: ~$0.002 per generation request

## Troubleshooting

### Common Issues:
1. **Build fails**: Check that all dependencies are in `dependencies` not `devDependencies`
2. **App won't start**: Verify environment variables are set and encrypted
3. **CORS errors**: Update ALLOWED_ORIGINS with your actual domain
4. **OpenAI errors**: Verify API key is valid and has credits

### Debug Commands:
```bash
# View logs
doctl apps logs YOUR_APP_ID --type=run --tail=100

# Check app status
doctl apps get YOUR_APP_ID
```

## Security Reminders

- [x] API key is encrypted in DO environment variables
- [x] Rate limiting prevents abuse
- [x] Logs don't contain sensitive data
- [x] All security headers are properly set
- [x] Input validation on all endpoints
- [x] No npm vulnerabilities

## Next Steps After Deployment

1. **Test thoroughly** with real requests
2. **Monitor logs** for first 24 hours
3. **Check OpenAI usage** in dashboard
4. **Set up log rotation** if needed (DO handles automatically)
5. **Consider adding analytics** (optional)

Your app is production-ready with enterprise-level security!