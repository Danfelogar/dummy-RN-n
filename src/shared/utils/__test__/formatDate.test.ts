import { formatDate } from '../formatDate';

const MOCK_NOW = new Date('2026-04-22T10:30:00');

describe('formatDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('today', () => {
    it('should return "Today," prefix when the date is the same calendar day', () => {
      const input = new Date('2026-04-22T08:00:00');
      expect(formatDate(input)).toMatch(/^Today,/);
    });

    it('should format a morning time correctly', () => {
      const input = new Date('2026-04-22T08:05:00');
      expect(formatDate(input)).toBe('Today, 8:05 AM');
    });

    it('should format a noon time correctly', () => {
      const input = new Date('2026-04-22T12:00:00');
      expect(formatDate(input)).toBe('Today, 12:00 PM');
    });

    it('should format a midnight time correctly', () => {
      const input = new Date('2026-04-22T00:00:00');
      expect(formatDate(input)).toBe('Today, 12:00 AM');
    });

    it('should format the last minute of the day correctly', () => {
      const input = new Date('2026-04-22T23:59:00');
      expect(formatDate(input)).toBe('Today, 11:59 PM');
    });
  });

  describe('yesterday', () => {
    it('should return "Yesterday," prefix when the date is the previous calendar day', () => {
      const input = new Date('2026-04-21T15:00:00');
      expect(formatDate(input)).toMatch(/^Yesterday,/);
    });

    it('should format yesterday afternoon correctly', () => {
      const input = new Date('2026-04-21T14:45:00');
      expect(formatDate(input)).toBe('Yesterday, 2:45 PM');
    });

    it('should format yesterday at midnight correctly', () => {
      const input = new Date('2026-04-21T00:00:00');
      expect(formatDate(input)).toBe('Yesterday, 12:00 AM');
    });
  });

  describe('older dates', () => {
    it('should return month and day for dates before yesterday', () => {
      const input = new Date('2026-04-20T15:15:00');
      expect(formatDate(input)).toBe('Apr 20, 3:15 PM');
    });

    it('should format a date from a different month correctly', () => {
      const input = new Date('2026-03-01T09:00:00');
      expect(formatDate(input)).toBe('Mar 1, 9:00 AM');
    });

    it('should format a date from a different year correctly', () => {
      const input = new Date('2025-12-31T23:30:00');
      expect(formatDate(input)).toBe('Dec 31, 11:30 PM');
    });

    it('should not include "Today" or "Yesterday" in the output', () => {
      const input = new Date('2026-04-19T10:00:00');
      const result = formatDate(input);
      expect(result).not.toMatch(/^Today/);
      expect(result).not.toMatch(/^Yesterday/);
    });
  });

  describe('edge cases', () => {
    it('should treat the exact current moment as today', () => {
      expect(formatDate(new Date(MOCK_NOW))).toMatch(/^Today,/);
    });

    it('should treat one millisecond before midnight as yesterday', () => {
      // 2026-04-21T23:59:59.999 is still yesterday relative to MOCK_NOW
      const input = new Date('2026-04-21T23:59:59.999');
      expect(formatDate(input)).toMatch(/^Yesterday,/);
    });

    it('should treat midnight of the current day as today', () => {
      const input = new Date('2026-04-22T00:00:00.000');
      expect(formatDate(input)).toMatch(/^Today,/);
    });
  });
});
