# Security Documentation - Domain Finder

## Overview

This document describes the security measures implemented in the Domain Finder application as of August 2025. The application has undergone a comprehensive security audit and enhancement to protect against modern web vulnerabilities.

## Security Features

### 1. Input Validation and Sanitization

#### Frontend Validation
- Client-side validation for user experience
- Extension whitelist validation
- Character limits on all inputs

#### Backend Validation (Express-Validator)
- **Prompt**: 3-500 characters, string type, trimmed
- **Count**: 1-20 integer range
- **Extensions**: Maximum 10, whitelist: `.com`, `.net`, `.org`, `.io`, `.co`, `.dev`, `.app`
- **Domain Format**: Regex validation `/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/`

### 2. DNS Rebinding and SSRF Protection

#### Domain Validation (`security-utils.js`)
- Blocks private IP ranges (RFC 1918)
- Blocks loopback addresses (127.0.0.0/8)
- Blocks link-local addresses (169.254.0.0/16)
- Blocks IPv6 local addresses
- Blocks cloud metadata endpoints
- Validates domain format before DNS lookup

#### Suspicious Pattern Detection
Automatically blocks domains containing:
- `localhost`, `127.0.0.1`, `0.0.0.0`
- `metadata.google.internal`, `169.254.169.254` (AWS metadata)
- `metadata.azure.com`, `instance-data`
- `.local`, `.internal`, `.cluster.local`

### 3. Prompt Injection Protection

#### Detection Patterns
The system detects and blocks prompts containing:
- Instruction override attempts ("ignore previous", "forget all")
- Role manipulation ("you are now", "act as")
- Output manipulation ("print the following", "say exactly")
- Boundary breaking attempts (special tokens, code blocks)
- Known jailbreak patterns ("DAN mode", "developer mode")

#### Sanitization
- Removes shell metacharacters
- Strips newlines and control characters
- Enforces 500 character limit
- Logs all injection attempts with request ID

### 4. Rate Limiting

Three-tier rate limiting system:
- **Generation Endpoint**: 5 requests per 15 minutes
- **Domain Check Endpoint**: 20 requests per 15 minutes
- **General API**: 100 requests per 15 minutes

Features:
- IP-based tracking
- Proper error messages
- Rate limit headers in responses
- Logging of limit violations

### 5. Security Headers

#### Helmet.js Configuration
- **CSP**: Restrictive policy with CDN allowlist
- **HSTS**: max-age=31536000; includeSubDomains; preload
- **X-Frame-Options**: SAMEORIGIN
- **X-Content-Type-Options**: nosniff
- **X-DNS-Prefetch-Control**: off
- **X-Download-Options**: noopen
- **X-Permitted-Cross-Domain-Policies**: none

#### API-Specific Headers
- `X-API-Version`: Version tracking
- `Cache-Control`: no-store, no-cache, must-revalidate, private
- `X-Request-ID`: Unique request tracking

### 6. Logging and Monitoring

#### Log Sanitization
- IP addresses hashed with SHA-256 (8-char prefix)
- User prompts redacted in logs
- User agents masked to browser name only
- Configurable via `LOG_SENSITIVE_DATA` environment variable

#### Security Monitoring Endpoint
- `/api/security/status` - Protected monitoring endpoint
- Requires internal IP or secret header
- Reports security feature status
- Tracks system health metrics

### 7. Environment Security

#### Variable Validation
All environment variables validated on startup:
- `OPENAI_API_KEY`: Must start with 'sk-'
- `NODE_ENV`: Must be development/production/test
- `PORT`: Valid port number (1-65535)
- `ALLOWED_ORIGINS`: Valid URL format
- `LOG_LEVEL`: error/warn/info/debug
- `LOG_SENSITIVE_DATA`: true/false

#### Secret Management
- No secrets in code
- `.env.production` excluded from git
- Example files provided for configuration
- API keys never logged or exposed

### 8. CORS Configuration

- Environment-based origin whitelist
- Credentials support enabled
- Fallback to localhost for development
- Proper preflight handling

### 9. Error Handling

- Generic error messages to prevent information disclosure
- Stack traces never exposed to clients
- Error reference timestamps for debugging
- Comprehensive error logging

### 10. Dependencies

- All dependencies audited (0 vulnerabilities)
- Security-focused packages:
  - `helmet`: Security headers
  - `express-validator`: Input validation
  - `express-mongo-sanitize`: NoSQL injection prevention
  - `express-rate-limit`: Rate limiting
  - `cors`: CORS handling
  - `winston`: Secure logging

## Security Checklist

### Pre-Deployment
- [ ] Rotate all API keys
- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS`
- [ ] Set `LOG_SENSITIVE_DATA=false`
- [ ] Review all environment variables
- [ ] Run `npm audit`

### Post-Deployment
- [ ] Verify HTTPS is enforced
- [ ] Test rate limiting
- [ ] Monitor security endpoint
- [ ] Review logs for anomalies
- [ ] Set up alerts for security events

## Incident Response

### Security Event Detection
1. Monitor logs for `security_alert` entries
2. Check `/api/security/status` endpoint
3. Review rate limit violations
4. Track failed validation attempts

### Response Steps
1. Identify attack pattern
2. Block malicious IPs if necessary
3. Review and update validation rules
4. Document incident
5. Update security measures

## Regular Maintenance

### Weekly
- Review security logs
- Check for dependency updates
- Monitor rate limit effectiveness

### Monthly
- Run full security audit
- Update dependencies
- Review and update security rules
- Test all security features

### Quarterly
- Penetration testing
- Security documentation review
- Team security training

## Contact

For security issues or questions:
- Create a private security advisory on GitHub
- Do not disclose vulnerabilities publicly
- Allow 30 days for patching before disclosure

## Compliance

This application implements security best practices aligned with:
- OWASP Top 10 (2021)
- Node.js Security Best Practices
- Express.js Security Guidelines

Last Updated: August 2025