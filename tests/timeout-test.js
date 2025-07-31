import { createApp, validateEnvironment } from '../src/app-production.js';
import http from 'http';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_SENSITIVE_DATA = 'false';

// Validate environment
validateEnvironment();

// Create app
const app = createApp();

console.log('Testing timeout functionality...\n');

// Test 1: DNS timeout test
console.log('Test 1: DNS Timeout (simulated by checking non-existent domain)');
const testDomain = 'this-domain-definitely-does-not-exist-' + Date.now() + '.com';

// Make request to check endpoint
const postData = JSON.stringify({
  domains: [testDomain]
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/check',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const server = app.listen(4000, () => {
  const startTime = Date.now();
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const duration = Date.now() - startTime;
      console.log(`Response received in ${duration}ms`);
      
      try {
        const result = JSON.parse(data);
        console.log('Result:', JSON.stringify(result, null, 2));
        
        if (result.success && result.results[0]) {
          const domainResult = result.results[0];
          if (domainResult.method === 'whois-timeout' || domainResult.method === 'timeout') {
            console.log('✅ Timeout handling worked correctly!');
          } else {
            console.log(`ℹ️  Domain check completed with method: ${domainResult.method}`);
          }
        }
      } catch (e) {
        console.error('Failed to parse response:', e);
      }
      
      // Test 2: Check that normal domains work quickly
      console.log('\nTest 2: Normal domain check (should be fast)');
      const normalData = JSON.stringify({
        domains: ['google.com', 'example.com']
      });
      
      const normalOptions = { ...options };
      normalOptions.headers['Content-Length'] = Buffer.byteLength(normalData);
      
      const startTime2 = Date.now();
      const req2 = http.request(normalOptions, (res2) => {
        let data2 = '';
        
        res2.on('data', (chunk) => {
          data2 += chunk;
        });
        
        res2.on('end', () => {
          const duration2 = Date.now() - startTime2;
          console.log(`Response received in ${duration2}ms`);
          
          try {
            const result2 = JSON.parse(data2);
            console.log('Results:', result2.results?.map(r => 
              `${r.domain}: ${r.available ? 'available' : 'taken'} (${r.method})`
            ).join(', '));
            
            if (duration2 < 5000) {
              console.log('✅ Normal domains checked quickly!');
            } else {
              console.log('⚠️  Normal domain check took longer than expected');
            }
          } catch (e) {
            console.error('Failed to parse response:', e);
          }
          
          console.log('\n✅ All timeout tests completed!');
          server.close();
          process.exit(0);
        });
      });
      
      req2.write(normalData);
      req2.end();
    });
  });
  
  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    server.close();
    process.exit(1);
  });
  
  req.write(postData);
  req.end();
});