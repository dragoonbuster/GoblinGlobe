import net from 'net';
import { URL } from 'url';
import crypto from 'crypto';

// Private IP ranges (RFC 1918, RFC 4193, etc.)
const PRIVATE_IP_RANGES = [
  // IPv4 private ranges
  { start: '10.0.0.0', end: '10.255.255.255' },
  { start: '172.16.0.0', end: '172.31.255.255' },
  { start: '192.168.0.0', end: '192.168.255.255' },
  { start: '127.0.0.0', end: '127.255.255.255' }, // Loopback
  { start: '169.254.0.0', end: '169.254.255.255' }, // Link-local
  { start: '0.0.0.0', end: '0.255.255.255' } // Reserved
];

// Convert IP string to number for comparison
function ipToNumber(ip) {
  const parts = ip.split('.');
  return parts.reduce((acc, part, i) => acc + (parseInt(part) << (8 * (3 - i))), 0);
}

// Check if IP is in private range
export function isPrivateIP(ip) {
  // Check if it's a valid IPv4
  if (!net.isIPv4(ip)) {
    // For IPv6, block all local addresses
    if (net.isIPv6(ip)) {
      return ip === '::1' || ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80');
    }
    return false;
  }

  const ipNum = ipToNumber(ip);

  for (const range of PRIVATE_IP_RANGES) {
    const startNum = ipToNumber(range.start);
    const endNum = ipToNumber(range.end);

    if (ipNum >= startNum && ipNum <= endNum) {
      return true;
    }
  }

  return false;
}

// Validate domain to prevent SSRF attacks
export function isValidDomain(domain) {
  try {
    // Basic validation
    if (!domain || typeof domain !== 'string') return false;

    // Check length
    if (domain.length > 253) return false;

    // Check for suspicious patterns
    const suspicious = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '[::1]',
      'metadata.google.internal',
      '169.254.169.254', // AWS metadata
      'metadata.azure.com',
      'instance-data',
      '.local',
      '.internal',
      '.cluster.local'
    ];

    const lowerDomain = domain.toLowerCase();
    for (const pattern of suspicious) {
      if (lowerDomain.includes(pattern)) {
        return false;
      }
    }

    // Check if it's an IP address
    if (net.isIP(domain)) {
      return !isPrivateIP(domain);
    }

    // Valid domain format
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  } catch (error) {
    return false;
  }
}

// Sanitize prompt to prevent injection attacks
export function sanitizePrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') return '';

  // Remove potential command injection characters
  let sanitized = prompt
    .replace(/[<>'"`;|&$(){}[\]\\]/g, '') // Remove shell metacharacters
    .replace(/\n|\r/g, ' ') // Replace newlines with spaces
    .trim();

  // Limit length
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500);
  }

  return sanitized;
}

// Check for prompt injection attempts
export function detectPromptInjection(prompt) {
  if (!prompt || typeof prompt !== 'string') return false;

  const injectionPatterns = [
    // Direct instructions
    /ignore\s+(previous|above|all)/i,
    /disregard\s+(previous|above|all)/i,
    /forget\s+(previous|above|all|everything)/i,
    /new\s+instructions?:/i,
    /system\s*:/i,
    /assistant\s*:/i,

    // Role manipulation
    /you\s+are\s+now/i,
    /act\s+as\s+(a|an)/i,
    /pretend\s+to\s+be/i,
    /roleplay\s+as/i,

    // Output manipulation
    /output\s+the\s+following/i,
    /print\s+the\s+following/i,
    /say\s+exactly/i,
    /repeat\s+after\s+me/i,

    // Boundary breaking
    /\[\/\w+\]/,  // Closing tags like [/INST]
    /```[^`]*```/, // Code blocks that might contain instructions
    /<\|.*?\|>/,   // Special tokens

    // Common jailbreak attempts
    /do\s+anything\s+now/i,
    /dan\s+mode/i,
    /developer\s+mode/i,
    /jailbreak/i
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(prompt)) {
      return true;
    }
  }

  return false;
}

// Create security context for requests
export function createSecurityContext() {
  return {
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    checks: {
      dns: false,
      prompt: false,
      rateLimit: false
    }
  };
}
