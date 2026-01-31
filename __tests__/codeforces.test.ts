import { getProblemLink, ratingToDifficulty, getRankColor } from '@/lib/codeforces';

describe('Codeforces Utils', () => {
  describe('getProblemLink', () => {
    it('should generate correct problem link', () => {
      expect(getProblemLink(1, 'A')).toBe('https://codeforces.com/problemset/problem/1/A');
    });

    it('should handle different contest IDs and indexes', () => {
      expect(getProblemLink(1234, 'B2')).toBe(
        'https://codeforces.com/problemset/problem/1234/B2'
      );
    });
  });

  describe('ratingToDifficulty', () => {
    it('should return easy for rating <= 1200', () => {
      expect(ratingToDifficulty(800)).toBe('easy');
      expect(ratingToDifficulty(1000)).toBe('easy');
      expect(ratingToDifficulty(1200)).toBe('easy');
    });

    it('should return medium for rating 1201-1800', () => {
      expect(ratingToDifficulty(1201)).toBe('medium');
      expect(ratingToDifficulty(1500)).toBe('medium');
      expect(ratingToDifficulty(1800)).toBe('medium');
    });

    it('should return hard for rating > 1800', () => {
      expect(ratingToDifficulty(1801)).toBe('hard');
      expect(ratingToDifficulty(2000)).toBe('hard');
      expect(ratingToDifficulty(3000)).toBe('hard');
    });

    it('should return medium for undefined rating', () => {
      expect(ratingToDifficulty(undefined)).toBe('medium');
    });
  });

  describe('getRankColor', () => {
    it('should return correct color for newbie', () => {
      expect(getRankColor('newbie')).toBe('#808080');
      expect(getRankColor('Newbie')).toBe('#808080');
    });

    it('should return correct color for expert', () => {
      expect(getRankColor('expert')).toBe('#0000ff');
      expect(getRankColor('Expert')).toBe('#0000ff');
    });

    it('should return correct color for grandmaster', () => {
      expect(getRankColor('grandmaster')).toBe('#ff0000');
    });

    it('should return gray for unknown rank', () => {
      expect(getRankColor('unknown')).toBe('#808080');
    });
  });
});
