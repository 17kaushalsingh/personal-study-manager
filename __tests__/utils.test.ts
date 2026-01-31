import {
  formatDate,
  getHeatmapLevel,
  capitalize,
  generateId,
  cn,
} from '@/lib/utils';

describe('Utils', () => {
  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      expect(formatDate(date)).toBe('2024-01-15');
    });

    it('should handle different dates correctly', () => {
      const date = new Date('2023-12-31T23:59:59Z');
      expect(formatDate(date)).toBe('2023-12-31');
    });
  });

  describe('getHeatmapLevel', () => {
    it('should return 0 for no activity', () => {
      expect(getHeatmapLevel(0)).toBe(0);
    });

    it('should return 1 for 1-2 activities', () => {
      expect(getHeatmapLevel(1)).toBe(1);
      expect(getHeatmapLevel(2)).toBe(1);
    });

    it('should return 2 for 3-4 activities', () => {
      expect(getHeatmapLevel(3)).toBe(2);
      expect(getHeatmapLevel(4)).toBe(2);
    });

    it('should return 3 for 5-6 activities', () => {
      expect(getHeatmapLevel(5)).toBe(3);
      expect(getHeatmapLevel(6)).toBe(3);
    });

    it('should return 4 for 7+ activities', () => {
      expect(getHeatmapLevel(7)).toBe(4);
      expect(getHeatmapLevel(10)).toBe(4);
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle already capitalized string', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
    });
  });

  describe('generateId', () => {
    it('should generate a non-empty string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('cn', () => {
    it('should join class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should filter out falsy values', () => {
      expect(cn('class1', null, 'class2', undefined, false, 'class3')).toBe(
        'class1 class2 class3'
      );
    });

    it('should handle empty input', () => {
      expect(cn()).toBe('');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const isDisabled = false;
      expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe(
        'base active'
      );
    });
  });
});
