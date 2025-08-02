// Test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests
process.env.LOG_SENSITIVE_DATA = 'false';

// Reduce console noise during tests
const noop = () => {};
global.console = {
  ...console,
  log: noop,
  info: noop,
  warn: noop,
  // Keep error for debugging
  error: console.error
};
