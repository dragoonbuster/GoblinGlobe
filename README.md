# 🚧 GOBLIN GLOBE - The ULTIMATE Domain Finder!!! 🚧

An AI-powered domain name generator with authentic 1990s GeoCities aesthetic that generates creative domain ideas and checks their availability in real-time.

## 🌟 Features

### Core Functionality
- **AI-Powered Generation**: Uses OpenAI GPT-3.5-turbo for creative domain name ideas
- **Real-Time Availability**: DNS lookups with WHOIS fallback for accuracy  
- **Domain Quality Scoring**: A-F grades based on length, memorability, brandability
- **Multiple TLDs**: Support for .com, .net, .org, .io, .co, .dev, .app
- **Fast Concurrent Checking**: Parallel domain availability checks
- **Export Features**: CSV export and clipboard copy functionality

### 90s Web Experience
- **Authentic 1990s Interface**: Complete GeoCities-style retro web design
- **25 UI Variants**: Archived collection of different retro themes
- **90s Visual Effects**: Rainbow text, blinking elements, under construction GIFs
- **Easter Eggs**: Konami code support, random 90s alerts, visitor counter
- **Period-Accurate HTML**: HTML 3.2 DOCTYPE, table-based layout, web-safe colors

### Advanced Features  
- **Redis Caching**: Intelligent caching for domains, DNS results, and AI generations
- **Comprehensive Security**: SSRF protection, prompt injection detection, rate limiting
- **Production Ready**: Separate dev/production servers with full security hardening
- **Quality Metrics**: Domain scoring based on multiple factors
- **Extensive Testing**: Unit, integration, load, and security test suites

## 🚀 Quick Setup

### Development
```bash
# Clone and install
git clone <repo-url>
cd domain-finder
npm install

# Set up environment
cp .env.example .env
# Edit .env and add your OpenAI API key
# Customize rate limits, timeouts, and more (see .env.example)

# Start development server
npm run dev
# Opens on http://localhost:3000
```

### Production
```bash
# Set up production environment
cp .env.example .env
# Edit .env with production values (see .env.example)

# Start production server
NODE_ENV=production npm start
# Runs on port 8080 (or PORT env var)
```

### Configuration

All settings are now environment-based for easy management:
- **Rate Limiting**: Control request limits per user
- **Timeouts**: Adjust DNS, WHOIS, and API timeouts  
- **Security**: Configure CORS, HSTS, and monitoring keys
- **Performance**: Set cache durations and request sizes

See `.env.example` for all options and `DIGITALOCEAN_DEPLOYMENT.md` for cloud deployment guide.

## 🎮 Usage

1. **Enter a creative prompt** in the textarea (e.g., "cool tech startup", "fantasy gaming")
2. **Choose domain count** (5-20 domains, or 50 with Konami code!)
3. **Select extensions** (.com, .net, .org, .io)
4. **Click "FIND MY DOMAINS!!!"** and watch the 90s loading animation
5. **View results** in authentic 90s table format with quality scores
6. **Export or register** available domains directly

## 🛠️ Technical Architecture

### Backend
- **Framework**: Node.js + Express with ES modules
- **AI**: OpenAI GPT-3.5-turbo with prompt injection protection
- **Domain Checking**: Promise.race DNS timeouts with WHOIS fallback
- **Caching**: Redis with intelligent TTL and DNS result caching
- **Security**: Comprehensive SSRF protection and input validation

### Frontend  
- **Style**: Authentic 1990s HTML/CSS with inline styling
- **JavaScript**: Vanilla ES6+ with 90s-themed interactions
- **No Dependencies**: Pure web technologies for period authenticity
- **Features**: Konami code, visitor counter, random effects, export tools

### Infrastructure
- **Production Server**: Hardened with security headers and validation
- **Development Server**: Hot reload with relaxed security for dev
- **Logging**: Winston-based structured logging with rotation
- **Testing**: Jest with extensive coverage (unit, integration, load)
- **Security**: Automated security audits and header validation

## 🧪 Testing & Development

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests  
npm run test:security      # Security audit
npm run test:load         # Load testing

# Development tools
npm run dev               # Development server with hot reload
npm run lint              # ESLint code analysis
npm run lint:fix          # Auto-fix linting issues
```

## 🔒 Security Features

This application implements enterprise-grade security:

- **SSRF Protection**: Blocks private IPs, cloud metadata, suspicious domains
- **Prompt Injection Defense**: Detects and blocks AI manipulation attempts
- **Input Validation**: Comprehensive server-side validation with express-validator
- **Rate Limiting**: Per-IP throttling for all endpoints
- **Security Headers**: CSP, HSTS, X-Frame-Options, and more
- **DNS Timeout Protection**: Prevents DNS-based DoS attacks
- **Secure Logging**: Structured logging without sensitive data exposure

For complete security documentation, see [SECURITY.md](SECURITY.md).

## 📊 Domain Quality Scoring

Each domain receives an A-F grade based on:
- **Length Score**: Optimal 4-8 characters with penalties for extremes
- **Memorability**: Vowel-consonant balance, pronunciation difficulty  
- **Brandability**: Uniqueness, patterns, commercial viability
- **Extension Value**: .com premium, others weighted accordingly
- **Keyword Relevance**: Relationship to your search prompt

## 🎨 UI Variants & Themes

The application features 25 different retro UI themes (archived in `/public/archive/`):
- **UI #2 (Active)**: 90s GeoCities with rainbow text and construction themes
- **UI #9**: Unix terminal with man page styling
- **UI #22**: Matrix-themed duplicate with green text effects
- **Others**: Various retro styles including Windows 95, early web designs

## 🚀 Deployment

### Live Application
- **Production**: [goblinglobe.xyz](https://goblinglobe.xyz)
- **DigitalOcean**: [goblinglobe-app-7cecs.ondigitalocean.app](https://goblinglobe-app-7cecs.ondigitalocean.app)

### Deployment Options
- **DigitalOcean App Platform**: Recommended (see [DEPLOYMENT.md](DEPLOYMENT.md))
- **Docker**: Production-ready containers available
- **Railway/Render**: Free tier compatible
- **Self-hosted**: Full deployment guide included

## 💰 Cost Analysis

- **OpenAI API**: ~$0.002 per domain generation (very cheap)
- **Redis**: Free tier sufficient for most usage
- **DNS/WHOIS**: Free lookups
- **Hosting**: $5-12/month for small-medium traffic
- **Domain Registration**: $10-15/year per domain purchased

## 🤝 Contributing

1. Check existing [security documentation](SECURITY.md)
2. Run the full test suite before commits
3. Follow the established 90s aesthetic for UI changes
4. Security-first development - validate all inputs
5. Maintain backwards compatibility with retro browsers

## 📜 Recent Updates

- ✅ **DNS Timeout Bug Fixed**: Implemented Promise.race pattern for stability
- ✅ **UI #2 Made Default**: 90s interface now primary experience  
- ✅ **Custom Domain Active**: goblinglobe.xyz with SSL working
- ✅ **Security Hardened**: Comprehensive security audit completed
- ✅ **Quality Scoring**: Domain grading system implemented

## 🏆 Features Completed

- ✅ Redis caching system
- ✅ Domain quality scoring (A-F grades) 
- ✅ 25 UI theme variants
- ✅ CSV export functionality
- ✅ Comprehensive security suite
- ✅ Production deployment
- ✅ DNS timeout protection
- ✅ 90s authentic experience with easter eggs

---

*This site is optimized for Netscape Navigator 4.0 and Internet Explorer 4.0*
*Best viewed at 800x600 resolution with thousands of colors*
**Copyright 1999 Goblin Globe Industries** 🧙‍♂️