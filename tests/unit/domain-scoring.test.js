import {
  calculateDomainQualityScore,
  getQualityGrade,
  sortDomainsByQuality
} from '../../src/domain-scoring.js';

describe('Domain Scoring', () => {
  describe('calculateDomainQualityScore', () => {
    test('should calculate score for high-quality domain', () => {
      const result = calculateDomainQualityScore('apple.com', 'fruit tech company');

      expect(result.overall).toBeGreaterThan(70);
      expect(result.breakdown).toHaveProperty('length');
      expect(result.breakdown).toHaveProperty('memorability');
      expect(result.breakdown).toHaveProperty('brandability');
      expect(result.breakdown).toHaveProperty('extension');
      expect(result.breakdown).toHaveProperty('relevance');
      expect(result.weights).toHaveProperty('length');
    });

    test('should calculate score for medium-quality domain', () => {
      const result = calculateDomainQualityScore('my-long-domain-name.net', 'business website');

      expect(result.overall).toBeGreaterThan(30);
      expect(result.overall).toBeLessThan(90);
    });

    test('should handle domains without prompt', () => {
      const result = calculateDomainQualityScore('test.com');

      expect(result.overall).toBeGreaterThan(0);
      expect(result.overall).toBeLessThanOrEqual(100);
    });

    test('should score .com higher than other extensions', () => {
      const comResult = calculateDomainQualityScore('test.com', 'test');
      const netResult = calculateDomainQualityScore('test.net', 'test');

      expect(comResult.breakdown.extension).toBeGreaterThan(netResult.breakdown.extension);
    });

    test('should score shorter domains higher', () => {
      const shortResult = calculateDomainQualityScore('app.com', 'application');
      const longResult = calculateDomainQualityScore('very-long-domain-name.com', 'application');

      expect(shortResult.breakdown.length).toBeGreaterThan(longResult.breakdown.length);
    });

    test('should penalize domains with numbers', () => {
      const withoutNumbers = calculateDomainQualityScore('techapp.com', 'tech app');
      const withNumbers = calculateDomainQualityScore('techapp2.com', 'tech app');

      expect(withoutNumbers.breakdown.brandability).toBeGreaterThan(withNumbers.breakdown.brandability);
    });

    test('should give higher relevance score for keyword matches', () => {
      const relevant = calculateDomainQualityScore('techapp.com', 'technology application');
      const irrelevant = calculateDomainQualityScore('flowerpot.com', 'technology application');

      expect(relevant.breakdown.relevance).toBeGreaterThan(irrelevant.breakdown.relevance);
    });
  });

  describe('getQualityGrade', () => {
    test('should return correct grades for different scores', () => {
      expect(getQualityGrade(95).grade).toBe('A+');
      expect(getQualityGrade(85).grade).toBe('A');
      expect(getQualityGrade(75).grade).toBe('B+');
      expect(getQualityGrade(65).grade).toBe('B');
      expect(getQualityGrade(55).grade).toBe('C+');
      expect(getQualityGrade(45).grade).toBe('C');
      expect(getQualityGrade(35).grade).toBe('D');
    });

    test('should include description and color', () => {
      const grade = getQualityGrade(85);
      expect(grade).toHaveProperty('description');
      expect(grade).toHaveProperty('color');
      expect(typeof grade.description).toBe('string');
      expect(typeof grade.color).toBe('string');
    });
  });

  describe('sortDomainsByQuality', () => {
    test('should sort domains by quality score descending', () => {
      const domains = [
        { domain: 'test.com', qualityScore: { overall: 60 } },
        { domain: 'app.com', qualityScore: { overall: 90 } },
        { domain: 'longdomain.net', qualityScore: { overall: 45 } }
      ];

      const sorted = sortDomainsByQuality(domains);

      expect(sorted[0].qualityScore.overall).toBe(90);
      expect(sorted[1].qualityScore.overall).toBe(60);
      expect(sorted[2].qualityScore.overall).toBe(45);
    });

    test('should handle domains without quality scores', () => {
      const domains = [
        { domain: 'test.com' },
        { domain: 'app.com', qualityScore: { overall: 90 } }
      ];

      const sorted = sortDomainsByQuality(domains);

      expect(sorted[0].qualityScore.overall).toBe(90);
      expect(sorted[1].domain).toBe('test.com');
    });

    test('should maintain relative order for equal scores', () => {
      const domains = [
        { domain: 'first.com', qualityScore: { overall: 80 } },
        { domain: 'second.com', qualityScore: { overall: 80 } },
        { domain: 'third.com', qualityScore: { overall: 70 } }
      ];

      const sorted = sortDomainsByQuality(domains);

      expect(sorted[0].qualityScore.overall).toBe(80);
      expect(sorted[1].qualityScore.overall).toBe(80);
      expect(sorted[2].qualityScore.overall).toBe(70);
    });
  });

  describe('Edge cases', () => {
    test('should handle empty domain gracefully', () => {
      const result = calculateDomainQualityScore('', 'test');
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
    });

    test('should handle very long domains', () => {
      const longDomain = 'a'.repeat(60) + '.com';
      const result = calculateDomainQualityScore(longDomain, 'test');
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
    });

    test('should handle domains with special characters', () => {
      const result = calculateDomainQualityScore('test-domain.co.uk', 'test business');
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
    });

    test('should handle null/undefined prompts', () => {
      const resultNull = calculateDomainQualityScore('test.com', null);
      const resultUndefined = calculateDomainQualityScore('test.com', undefined);

      expect(resultNull.overall).toBeGreaterThanOrEqual(0);
      expect(resultUndefined.overall).toBeGreaterThanOrEqual(0);
    });
  });
});
