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