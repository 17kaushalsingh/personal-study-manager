import { getProblemLink, normalizeDifficulty } from '@/lib/leetcode';

describe('LeetCode Utils', () => {
  describe('getProblemLink', () => {
    it('should generate correct problem link', () => {
      expect(getProblemLink('two-sum')).toBe('https://leetcode.com/problems/two-sum/');
    });

    it('should handle complex slugs', () => {
      expect(getProblemLink('valid-parentheses')).toBe(
        'https://leetcode.com/problems/valid-parentheses/'
      );
    });
  });

  describe('normalizeDifficulty', () => {
    it('should normalize Easy', () => {
      expect(normalizeDifficulty('Easy')).toBe('easy');
      expect(normalizeDifficulty('EASY')).toBe('easy');
      expect(normalizeDifficulty('easy')).toBe('easy');
    });

    it('should normalize Medium', () => {
      expect(normalizeDifficulty('Medium')).toBe('medium');
      expect(normalizeDifficulty('MEDIUM')).toBe('medium');
      expect(normalizeDifficulty('medium')).toBe('medium');
    });

    it('should normalize Hard', () => {
      expect(normalizeDifficulty('Hard')).toBe('hard');
      expect(normalizeDifficulty('HARD')).toBe('hard');
      expect(normalizeDifficulty('hard')).toBe('hard');
    });

    it('should default to hard for unknown difficulty', () => {
      expect(normalizeDifficulty('unknown')).toBe('hard');
    });
  });
});
