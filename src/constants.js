// Application Constants

// Server Configuration
export const SERVER = {
  DEFAULT_PORT: 8080,
  SHUTDOWN_TIMEOUT_MS: 30000, // 30 seconds
  JSON_LIMIT: '1mb',
  STATIC_MAX_AGE: '1d'
};

// Rate Limiting Configuration
export const RATE_LIMITS = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  GENERATE: {
    MAX_REQUESTS: 5,
    MESSAGE: 'Too many generation requests. Please try again later.'
  },
  CHECK: {
    MAX_REQUESTS: 20,
    MESSAGE: 'Too many check requests. Please try again later.'
  },
  GENERAL: {
    MAX_REQUESTS: 100,
    MESSAGE: 'Too many requests. Please try again later.'
  }
};

// Input Validation Limits
export const VALIDATION = {
  PROMPT: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 500,
    ERROR_MESSAGE: 'Prompt must be between 3 and 500 characters'
  },
  COUNT: {
    MIN: 1,
    MAX: 20,
    DEFAULT: 10,
    ERROR_MESSAGE: 'Count must be between 1 and 20'
  },
  DOMAINS: {
    MIN: 1,
    MAX: 50,
    ERROR_MESSAGE: 'Must provide 1-50 domains'
  },
  EXTENSIONS: {
    MAX: 10,
    ALLOWED: ['.com', '.net', '.org', '.io', '.co', '.dev', '.app'],
    ERROR_MESSAGE: 'Invalid extension'
  },
  DOMAIN_MAX_LENGTH: 253
};

// Security Configuration
export const SECURITY = {
  HSTS_MAX_AGE: 31536000, // 1 year
  IP_HASH_LENGTH: 8,
  REQUEST_ID_LENGTH: 36, // UUID v4
  HELMET_CSP: {
    defaultSrc: ['\'self\''],
    styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://cdn.tailwindcss.com'],
    scriptSrc: ['\'self\'', '\'unsafe-inline\'', 'https://cdn.tailwindcss.com'],
    imgSrc: ['\'self\'', 'data:', 'https:'],
    connectSrc: ['\'self\''],
    fontSrc: ['\'self\'', 'https:', 'data:'],
    objectSrc: ['\'none\''],
    mediaSrc: ['\'self\''],
    frameSrc: ['\'self\'']
  }
};

// API Configuration
export const API = {
  VERSION: '1.0',
  TIMEOUT_MS: 5000, // 5 seconds for DNS/WHOIS
  OPENAI_TIMEOUT_MS: 30000, // 30 seconds for OpenAI
  OPENAI_DEFAULT_MODEL: 'gpt-3.5-turbo',
  CACHE_CONTROL: 'no-store, no-cache, must-revalidate, private'
};

// Logging Configuration
export const LOGGING = {
  DATE_PATTERN: 'YYYY-MM-DD',
  MAX_SIZE: '20m',
  MAX_FILES: '14d',
  LOG_DIR: 'logs',
  LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  }
};

// Environment Variables
export const ENV_VARS = {
  REQUIRED: ['OPENAI_API_KEY', 'NODE_ENV'],
  VALID_ENVIRONMENTS: ['development', 'production', 'test'],
  VALID_LOG_LEVELS: ['error', 'warn', 'info', 'debug']
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_API_KEY: 'Valid OpenAI API key required (should start with sk-)',
  INVALID_ENVIRONMENT: 'NODE_ENV must be development, production, or test',
  INVALID_PORT: 'PORT must be a valid port number (1-65535)',
  INVALID_ORIGINS: 'ALLOWED_ORIGINS must be comma-separated list of valid URLs',
  INVALID_LOG_LEVEL: 'LOG_LEVEL must be error, warn, info, or debug',
  INVALID_LOG_SENSITIVE: 'LOG_SENSITIVE_DATA must be true or false',
  INVALID_MODEL: 'OPENAI_MODEL must be a non-empty string',
  DNS_TIMEOUT: 'DNS timeout',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  INTERNAL_ERROR: 'Internal server error',
  NOT_FOUND: 'Not found',
  INVALID_PROMPT: 'Invalid prompt format detected',
  FORBIDDEN: 'Forbidden'
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Private IP Ranges (for SSRF protection)
export const PRIVATE_IP_RANGES = [
  { start: '10.0.0.0', end: '10.255.255.255' },
  { start: '172.16.0.0', end: '172.31.255.255' },
  { start: '192.168.0.0', end: '192.168.255.255' },
  { start: '127.0.0.0', end: '127.255.255.255' },
  { start: '169.254.0.0', end: '169.254.255.255' },
  { start: '0.0.0.0', end: '0.255.255.255' }
];

// Suspicious Domain Patterns
export const SUSPICIOUS_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '[::1]',
  'metadata.google.internal',
  '169.254.169.254',
  'metadata.azure.com',
  'instance-data',
  '.local',
  '.internal',
  '.cluster.local'
];

// Prompt Injection Patterns
export const INJECTION_PATTERNS = {
  INSTRUCTION_OVERRIDE: [
    /ignore\s+(previous|above|all)/i,
    /disregard\s+(previous|above|all)/i,
    /forget\s+(previous|above|all)/i,
    /new\s+instructions?:/i,
    /system\s*:/i,
    /assistant\s*:/i
  ],
  ROLE_MANIPULATION: [
    /you\s+are\s+now/i,
    /act\s+as\s+(a|an)/i,
    /pretend\s+to\s+be/i,
    /roleplay\s+as/i
  ],
  OUTPUT_MANIPULATION: [
    /output\s+the\s+following/i,
    /print\s+the\s+following/i,
    /say\s+exactly/i,
    /repeat\s+after\s+me/i
  ],
  BOUNDARY_BREAKING: [
    /\[\/\w+\]/,
    /```[^`]*```/,
    /<\|.*?\|>/
  ],
  JAILBREAK: [
    /do\s+anything\s+now/i,
    /dan\s+mode/i,
    /developer\s+mode/i,
    /jailbreak/i
  ]
};
