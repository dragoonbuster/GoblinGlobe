export default {
  testEnvironment: 'node',
  testTimeout: 10000,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {},
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};