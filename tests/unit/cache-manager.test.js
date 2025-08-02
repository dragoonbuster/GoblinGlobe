import { cacheManager } from '../../src/cache-manager.js';

describe('Cache Manager', () => {
  describe('Key generation', () => {
    test('should generate consistent cache keys', () => {
      const key1 = cacheManager.generateKey('dns', 'example.com');
      const key2 = cacheManager.generateKey('dns', 'example.com');
      const key3 = cacheManager.generateKey('dns', 'different.com');

      expect(key1).toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key1).toMatch(/^domain-finder:dns:[a-f0-9]{16}$/);
    });

    test('should include namespace in key', () => {
      const dnsKey = cacheManager.generateKey('dns', 'example.com');
      const whoisKey = cacheManager.generateKey('whois', 'example.com');

      expect(dnsKey).toContain(':dns:');
      expect(whoisKey).toContain(':whois:');
      expect(dnsKey).not.toBe(whoisKey);
    });
  });

  describe('Cache availability', () => {
    test('should handle unavailable cache gracefully', async () => {
      // Cache is not connected in test environment
      expect(cacheManager.isAvailable()).toBe(false);

      // Should return default values when cache is unavailable
      const result = await cacheManager.get('test-key', 'default');
      expect(result).toBe('default');

      const setResult = await cacheManager.set('test-key', 'value');
      expect(setResult).toBe(false);
    });
  });

  describe('Domain-specific cache methods', () => {
    test('should handle DNS result caching gracefully when unavailable', async () => {
      const domain = 'test.com';

      const cachedResult = await cacheManager.getDNSResult(domain);
      expect(cachedResult).toBeNull();

      const setResult = await cacheManager.setDNSResult(domain, { resolved: true });
      expect(setResult).toBe(false);
    });

    test('should handle WHOIS result caching gracefully when unavailable', async () => {
      const domain = 'test.com';

      const cachedResult = await cacheManager.getWHOISResult(domain);
      expect(cachedResult).toBeNull();

      const setResult = await cacheManager.setWHOISResult(domain, { available: false });
      expect(setResult).toBe(false);
    });

    test('should handle domain generation caching gracefully when unavailable', async () => {
      const prompt = 'tech startup';
      const count = 5;
      const model = 'gpt-3.5-turbo';

      const cachedResult = await cacheManager.getDomainGeneration(prompt, count, model);
      expect(cachedResult).toBeNull();

      const setResult = await cacheManager.setDomainGeneration(prompt, count, model, ['techapp', 'startuptech']);
      expect(setResult).toBe(false);
    });

    test('should handle quality score caching gracefully when unavailable', async () => {
      const domain = 'test.com';
      const prompt = 'test prompt';

      const cachedResult = await cacheManager.getQualityScore(domain, prompt);
      expect(cachedResult).toBeNull();

      const setResult = await cacheManager.setQualityScore(domain, prompt, { overall: 85 });
      expect(setResult).toBe(false);
    });
  });

  describe('Cache statistics and management', () => {
    test('should return disconnected stats when unavailable', async () => {
      const stats = await cacheManager.getStats();
      expect(stats.connected).toBe(false);
    });

    test('should handle namespace clearing gracefully when unavailable', async () => {
      const result = await cacheManager.clearNamespace('dns');
      expect(result).toBe(false);
    });

    test('should handle cache clearing gracefully when unavailable', async () => {
      const result = await cacheManager.clearAll();
      expect(result).toBe(false);
    });
  });

  describe('Connection management', () => {
    test('should handle connection attempts gracefully', async () => {
      // This will fail in test environment without Redis, but should not throw
      const connected = await cacheManager.connect();
      expect(typeof connected).toBe('boolean');
    });

    test('should handle disconnection gracefully', async () => {
      // Should not throw even if not connected
      await expect(cacheManager.disconnect()).resolves.not.toThrow();
    });
  });
});
