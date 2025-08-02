import { VALIDATION } from './constants.js';

// Common English words for memorability scoring
const COMMON_WORDS = new Set([
  'app', 'web', 'tech', 'pro', 'max', 'top', 'new', 'get', 'go', 'do', 'be',
  'up', 'my', 'to', 'in', 'on', 'at', 'it', 'is', 'as', 'we', 'me', 'or',
  'if', 'no', 'so', 'by', 'he', 'us', 'an', 'am', 'of', 'all', 'any', 'can',
  'had', 'her', 'was', 'one', 'our', 'day', 'get', 'has', 'him', 'his', 'how',
  'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did',
  'for', 'let', 'man', 'new', 'not', 'now', 'old', 'put', 'say', 'she', 'too',
  'use'
]);

// Pronounceable patterns and syllable rules
const VOWELS = 'aeiou';
const CONSONANTS = 'bcdfghjklmnpqrstvwxyz';
const COMMON_PATTERNS = [
  /^[bcdfghjklmnpqrstvwxyz][aeiou]/,  // Consonant-vowel start
  /[aeiou][bcdfghjklmnpqrstvwxyz]$/,  // Vowel-consonant end
  /[aeiou]{2}/,  // Double vowels
  /[bcdfghjklmnpqrstvwxyz]{3,}/,  // 3+ consonants in a row (negative)
];

// Extension quality ranking
const EXTENSION_RANKS = {
  '.com': 100,
  '.net': 85,
  '.org': 80,
  '.io': 75,
  '.co': 70,
  '.dev': 65,
  '.app': 60,
  '.tech': 55,
  '.biz': 50,
  '.info': 45
};

/**
 * Calculate length score (0-100)
 * Optimal length is 4-8 characters, with penalty for very short or long domains
 */
function calculateLengthScore(domain) {
  const baseDomain = domain.split('.')[0];
  const length = baseDomain.length;
  
  if (length < 3) return 20; // Too short
  if (length <= 6) return 100; // Ideal length
  if (length <= 8) return 90;
  if (length <= 10) return 75;
  if (length <= 12) return 60;
  if (length <= 15) return 45;
  if (length <= 20) return 30;
  return 15; // Very long
}

/**
 * Calculate memorability score (0-100)
 * Based on pronunciation patterns, syllable structure, and common word usage
 */
function calculateMemorabilityScore(domain) {
  const baseDomain = domain.split('.')[0].toLowerCase();
  let score = 50; // Base score
  
  // Check for common words
  if (COMMON_WORDS.has(baseDomain)) {
    score += 30;
  } else {
    // Check if contains common words
    for (const word of COMMON_WORDS) {
      if (baseDomain.includes(word) && word.length >= 3) {
        score += 15;
        break;
      }
    }
  }
  
  // Pronunciation patterns
  const vowelCount = (baseDomain.match(/[aeiou]/g) || []).length;
  const consonantCount = baseDomain.length - vowelCount;
  
  // Good vowel/consonant ratio
  const ratio = vowelCount / baseDomain.length;
  if (ratio >= 0.3 && ratio <= 0.5) {
    score += 20;
  } else if (ratio < 0.2 || ratio > 0.6) {
    score -= 15;
  }
  
  // Check for difficult consonant clusters
  if (/[bcdfghjklmnpqrstvwxyz]{3,}/.test(baseDomain)) {
    score -= 20;
  }
  
  // Repeating characters (good for memorability if not excessive)
  const repeats = baseDomain.match(/(.)\1+/g);
  if (repeats && repeats.length === 1 && repeats[0].length === 2) {
    score += 10; // Single double letter is good
  } else if (repeats && repeats.length > 1) {
    score -= 15; // Multiple repeats are bad
  }
  
  // Alternating vowel-consonant pattern is good
  let alternating = true;
  for (let i = 1; i < baseDomain.length; i++) {
    const current = VOWELS.includes(baseDomain[i]);
    const previous = VOWELS.includes(baseDomain[i-1]);
    if (current === previous) {
      alternating = false;
      break;
    }
  }
  if (alternating && baseDomain.length >= 4) {
    score += 15;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate brandability score (0-100)
 * Based on uniqueness, avoiding numbers/hyphens, and catchiness
 */
function calculateBrandabilityScore(domain) {
  const baseDomain = domain.split('.')[0].toLowerCase();
  let score = 70; // Base score for generated domains
  
  // Penalize numbers
  if (/\d/.test(baseDomain)) {
    score -= 25;
  }
  
  // Penalize hyphens and underscores
  if (/[-_]/.test(baseDomain)) {
    score -= 20;
  }
  
  // Bonus for unique letter combinations
  const uniqueChars = new Set(baseDomain).size;
  const uniqueRatio = uniqueChars / baseDomain.length;
  if (uniqueRatio > 0.7) {
    score += 15; // High character diversity
  } else if (uniqueRatio < 0.4) {
    score -= 10; // Low character diversity
  }
  
  // Check for creative combinations (portmanteau patterns)
  if (baseDomain.length >= 6) {
    // Look for potential word boundaries
    const possibleBreaks = [];
    for (let i = 3; i <= baseDomain.length - 3; i++) {
      const firstPart = baseDomain.substring(0, i);
      const secondPart = baseDomain.substring(i);
      if (COMMON_WORDS.has(firstPart) || COMMON_WORDS.has(secondPart)) {
        possibleBreaks.push(i);
      }
    }
    if (possibleBreaks.length > 0) {
      score += 20; // Likely portmanteau
    }
  }
  
  // Penalize very generic patterns
  const genericPatterns = [
    /^the/, /web$/, /site$/, /app$/, /tech$/, /pro$/, /max$/, /plus$/,
    /^get/, /^my/, /^best/, /^top/
  ];
  for (const pattern of genericPatterns) {
    if (pattern.test(baseDomain)) {
      score -= 15;
      break;
    }
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate extension score (0-100)
 * Based on popular and trustworthy extensions
 */
function calculateExtensionScore(domain) {
  const extension = '.' + domain.split('.').slice(1).join('.');
  return EXTENSION_RANKS[extension] || 40; // Default score for unknown extensions
}

/**
 * Calculate keyword relevance score (0-100)
 * How well the domain relates to the original prompt
 */
function calculateKeywordRelevanceScore(domain, prompt) {
  if (!prompt) return 50; // Default if no prompt
  
  const baseDomain = domain.split('.')[0].toLowerCase();
  const promptWords = prompt.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length >= 3)
    .map(word => word.replace(/[^a-z]/g, ''));
  
  let score = 30; // Base score
  
  // Direct word matches
  for (const word of promptWords) {
    if (word.length >= 3) {
      if (baseDomain.includes(word)) {
        score += Math.min(25, word.length * 5); // Longer words get more points
      }
    }
  }
  
  // Partial matches (first 3+ characters)
  for (const word of promptWords) {
    if (word.length >= 4) {
      const prefix = word.substring(0, Math.min(4, word.length));
      if (baseDomain.includes(prefix) && !baseDomain.includes(word)) {
        score += 10;
      }
    }
  }
  
  // Check for thematic relevance (simple heuristics)
  const themes = {
    tech: ['tech', 'digital', 'cyber', 'data', 'code', 'dev', 'app', 'web', 'net'],
    business: ['biz', 'corp', 'pro', 'market', 'trade', 'shop', 'store', 'hub'],
    creative: ['art', 'design', 'create', 'make', 'craft', 'studio', 'lab'],
    social: ['social', 'connect', 'share', 'community', 'network', 'link'],
    education: ['learn', 'teach', 'edu', 'study', 'school', 'academy', 'knowledge']
  };
  
  for (const [theme, keywords] of Object.entries(themes)) {
    const promptHasTheme = promptWords.some(word => 
      keywords.some(keyword => word.includes(keyword) || keyword.includes(word))
    );
    const domainHasTheme = keywords.some(keyword => baseDomain.includes(keyword));
    
    if (promptHasTheme && domainHasTheme) {
      score += 15;
      break;
    }
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate overall domain quality score (0-100)
 * Weighted combination of all scoring factors
 */
export function calculateDomainQualityScore(domain, prompt = '') {
  const weights = {
    length: 0.30,      // 30% - Length optimization
    memorability: 0.25, // 25% - How easy to remember/pronounce
    brandability: 0.20, // 20% - Brand potential
    extension: 0.15,    // 15% - Extension quality
    relevance: 0.10     // 10% - Keyword relevance
  };
  
  const scores = {
    length: calculateLengthScore(domain),
    memorability: calculateMemorabilityScore(domain),
    brandability: calculateBrandabilityScore(domain),
    extension: calculateExtensionScore(domain),
    relevance: calculateKeywordRelevanceScore(domain, prompt)
  };
  
  // Calculate weighted average
  const totalScore = Object.entries(scores).reduce((total, [factor, score]) => {
    return total + (score * weights[factor]);
  }, 0);
  
  return {
    overall: Math.round(totalScore),
    breakdown: scores,
    weights
  };
}

/**
 * Get quality grade based on score
 */
export function getQualityGrade(score) {
  if (score >= 90) return { grade: 'A+', description: 'Exceptional', color: 'emerald' };
  if (score >= 80) return { grade: 'A', description: 'Excellent', color: 'green' };
  if (score >= 70) return { grade: 'B+', description: 'Very Good', color: 'lime' };
  if (score >= 60) return { grade: 'B', description: 'Good', color: 'yellow' };
  if (score >= 50) return { grade: 'C+', description: 'Average', color: 'orange' };
  if (score >= 40) return { grade: 'C', description: 'Below Average', color: 'red' };
  return { grade: 'D', description: 'Poor', color: 'red' };
}

/**
 * Sort domains by quality score (highest first)
 */
export function sortDomainsByQuality(domains) {
  return domains.sort((a, b) => {
    const scoreA = a.qualityScore?.overall || 0;
    const scoreB = b.qualityScore?.overall || 0;
    return scoreB - scoreA;
  });
}