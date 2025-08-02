import { createClient } from 'redis';
import crypto from 'crypto';
import { logger } from './logger.js';

// Cache TTL configurations (in seconds)
const CACHE_TTL = {
  DNS_LOOKUP: 5 * 60,      // 5 minutes - DNS results change infrequently
  WHOIS_LOOKUP: 30 * 60,   // 30 minutes - WHOIS data is more stable
  DOMAIN_GENERATION: 60 * 60, // 1 hour - OpenAI responses for same prompt
  QUALITY_SCORE: 24 * 60 * 60  // 24 hours - Quality scores are deterministic
};

class CacheManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionPromise = null;
  }

  async connect() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this._connect();
    return this.connectionPromise;
  }

  async _connect() {
    try {
      // Use Redis URL from environment or default to localhost
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              logger.error('Redis connection failed after 3 retries');
              return false; // Stop reconnecting
            }
            return Math.min(retries * 100, 3000); // Exponential backoff
          }
        }
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        logger.warn('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      this.isConnected = true;

      logger.info('Redis cache manager initialized');
      return true;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      try {
        await this.client.disconnect();
        logger.info('Redis cache manager disconnected');
      } catch (error) {
        logger.error('Error disconnecting from Redis:', error);
      }
    }
  }

  isAvailable() {
    return this.isConnected && this.client;
  }

  // Generate cache key with optional namespace
  generateKey(namespace, identifier) {
    const hash = crypto.createHash('sha256').update(identifier).digest('hex').substring(0, 16);
    return `domain-finder:${namespace}:${hash}`;
  }

  // Generic cache get with fallback
  async get(key, defaultValue = null) {
    if (!this.isAvailable()) {
      return defaultValue;
    }

    try {
      const value = await this.client.get(key);
      if (value === null) {
        return defaultValue;
      }
      return JSON.parse(value);
    } catch (error) {
      logger.warn(`Cache get error for key ${key}:`, error.message);
      return defaultValue;
    }
  }

  // Generic cache set with TTL
  async set(key, value, ttl = 3600) {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttl, serialized);
      return true;
    } catch (error) {
      logger.warn(`Cache set error for key ${key}:`, error.message);
      return false;
    }
  }

  // Delete cache entry
  async del(key) {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.warn(`Cache delete error for key ${key}:`, error.message);
      return false;
    }
  }

  // DNS lookup caching
  async getDNSResult(domain) {
    const key = this.generateKey('dns', domain);
    return await this.get(key);
  }

  async setDNSResult(domain, result) {
    const key = this.generateKey('dns', domain);
    return await this.set(key, result, CACHE_TTL.DNS_LOOKUP);
  }

  // WHOIS lookup caching
  async getWHOISResult(domain) {
    const key = this.generateKey('whois', domain);
    return await this.get(key);
  }

  async setWHOISResult(domain, result) {
    const key = this.generateKey('whois', domain);
    return await this.set(key, result, CACHE_TTL.WHOIS_LOOKUP);
  }

  // Domain availability caching (combines DNS + WHOIS)
  async getDomainAvailability(domain) {
    const key = this.generateKey('availability', domain);
    return await this.get(key);
  }

  async setDomainAvailability(domain, result) {
    const key = this.generateKey('availability', domain);
    // Use shorter TTL for availability since it can change
    return await this.set(key, result, Math.min(CACHE_TTL.DNS_LOOKUP, CACHE_TTL.WHOIS_LOOKUP));
  }

  // OpenAI domain generation caching
  async getDomainGeneration(prompt, count, model) {
    const identifier = `${prompt}:${count}:${model}`;
    const key = this.generateKey('generation', identifier);
    return await this.get(key);
  }

  async setDomainGeneration(prompt, count, model, result) {
    const identifier = `${prompt}:${count}:${model}`;
    const key = this.generateKey('generation', identifier);
    return await this.set(key, result, CACHE_TTL.DOMAIN_GENERATION);
  }

  // Quality score caching (deterministic based on domain and prompt)
  async getQualityScore(domain, prompt) {
    const identifier = `${domain}:${prompt}`;
    const key = this.generateKey('quality', identifier);
    return await this.get(key);
  }

  async setQualityScore(domain, prompt, result) {
    const identifier = `${domain}:${prompt}`;
    const key = this.generateKey('quality', identifier);
    return await this.set(key, result, CACHE_TTL.QUALITY_SCORE);
  }

  // Cache statistics
  async getStats() {
    if (!this.isAvailable()) {
      return { connected: false };
    }

    try {
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');

      return {
        connected: this.isConnected,
        memory: info,
        keyspace: keyspace
      };
    } catch (error) {
      logger.warn('Error getting cache stats:', error.message);
      return { connected: this.isConnected, error: error.message };
    }
  }

  // Clear specific namespace
  async clearNamespace(namespace) {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const pattern = `domain-finder:${namespace}:*`;
      const keys = await this.client.keys(pattern);

      if (keys.length > 0) {
        await this.client.del(keys);
        logger.info(`Cleared ${keys.length} keys from namespace: ${namespace}`);
      }

      return true;
    } catch (error) {
      logger.warn(`Error clearing namespace ${namespace}:`, error.message);
      return false;
    }
  }

  // Clear all cache
  async clearAll() {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client.flushDb();
      logger.info('Cleared all cache');
      return true;
    } catch (error) {
      logger.warn('Error clearing all cache:', error.message);
      return false;
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Initialize cache connection
export async function initializeCache() {
  try {
    await cacheManager.connect();
    return cacheManager.isAvailable();
  } catch (error) {
    logger.error('Failed to initialize cache:', error);
    return false;
  }
}

// Graceful shutdown
export async function shutdownCache() {
  await cacheManager.disconnect();
}
