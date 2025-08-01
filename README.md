# Domain Name Finder

A tool that generates creative domain name ideas using AI and checks their availability in real-time.

## Features

- AI-powered domain name generation based on your prompts
- Real-time availability checking using DNS and WHOIS lookups
- Support for multiple TLDs (.com, .net, .org, .io)
- Clean, responsive web interface
- Fast concurrent checking of multiple domains

## Setup

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_actual_api_key_here
PORT=3000
```

4. Start the server:
```bash
npm start
```

5. Open http://localhost:3000 in your browser

## Usage

1. Enter a creative prompt (e.g., "combine two random animals")
2. Select how many suggestions you want
3. Choose which domain extensions to check
4. Click "Generate & Check Availability"
5. View available domains in green and taken ones in red
6. Click "Register →" on available domains to register them

## Technical Details

- **Backend**: Node.js + Express
- **AI**: OpenAI GPT-3.5-turbo for name generation
- **Domain Checking**: DNS lookups (fast) with WHOIS fallback (accurate)
- **Frontend**: Vanilla JS with Tailwind CSS

## Cost Considerations

- OpenAI API: ~$0.002 per generation request
- DNS/WHOIS lookups: Free
- Hosting: Can run on free tier services (Railway, Render, etc.)

## Security

This application implements comprehensive security measures including:
- Input validation and sanitization
- DNS rebinding and SSRF protection
- Prompt injection detection
- Rate limiting
- Security headers
- Secure logging

For detailed security information, see [SECURITY.md](SECURITY.md).

## Improvements You Could Make

1. Add caching to avoid re-checking the same domains
2. Implement bulk export of available domains
3. Add more TLDs and country-specific extensions
4. Create a CLI version for terminal use
5. Add domain name scoring/quality metrics
6. Implement user sessions to save search history