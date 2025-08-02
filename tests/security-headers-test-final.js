import http from 'http';
import { createApp, validateEnvironment } from '../src/app-production.js';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_SENSITIVE_DATA = 'false';

// Validate environment
validateEnvironment();

// Create app
const app = createApp();

const PORT = 3999; // Use different port to avoid conflicts

// Start server for testing
const server = app.listen(PORT, async () => {
  console.log(`Test server started on port ${PORT}`);

  const requiredHeaders = {
    'x-frame-options': 'SAMEORIGIN',
    'x-content-type-options': 'nosniff',
    'strict-transport-security': /max-age=\d+/,
    'x-xss-protection': '0' // Modern helmet.js disables XSS auditor as recommended
  };

  const testUrl = `http://localhost:${PORT}`;

  try {
    // Make HTTP request to test server
    http.get(testUrl, (res) => {
      let passed = true;

      console.log(`\nTesting security headers for ${testUrl}...\n`);

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

      // Additional security headers to check (optional but good to have)
      const optionalHeaders = {
        'x-dns-prefetch-control': 'off',
        'x-download-options': 'noopen',
        'x-permitted-cross-domain-policies': 'none'
      };

      console.log('\nOptional security headers:');
      for (const [header, expected] of Object.entries(optionalHeaders)) {
        const value = res.headers[header];
        if (value) {
          console.log(`✅ ${header}: ${value}`);
        } else {
          console.log(`ℹ️  ${header}: not set (optional)`);
        }
      }

      console.log('\n' + (passed ? '✅ All required security headers are properly set!' : '❌ Some security headers are missing or incorrect.'));

      // Clean up
      server.close(() => {
        process.exit(passed ? 0 : 1);
      });
    }).on('error', (err) => {
      console.error('Test failed:', err.message);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    console.error('Test setup failed:', error.message);
    server.close(() => {
      process.exit(1);
    });
  }
});

// Handle server startup errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop any running servers.`);
  } else {
    console.error('Server startup error:', err.message);
  }
  process.exit(1);
});
