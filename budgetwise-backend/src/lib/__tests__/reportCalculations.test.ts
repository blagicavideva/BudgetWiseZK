import { averageDailySpend, getDateRange, percentChange } from '../reportCalculations';

describe('percentChange', () => {
  it.each([
    [120, 100, 20],
    [80, 100, -20],
    [1, 0, 100],
    [0, 0, 0],
    [0, -100, 100],
  ])('returns %s current vs %s previous as %s percent', (current, previous, expected) => {
    expect(percentChange(current, previous)).toBe(expected);
  });

  it('rounds to one decimal place', () => {
    expect(percentChange(10, 6)).toBe(66.7);
  });
});

describe('getDateRange', () => {
  it('returns the full range for a 31-day month', () => {
    expect(getDateRange(2026, 1)).toEqual({
      start: new Date(2026, 0, 1),
      end: new Date(2026, 1, 0, 23, 59, 59, 999),
    });
  });

  it('handles leap-year February', () => {
    const { start, end } = getDateRange(2024, 2);
    expect(start.getDate()).toBe(1);
    expect(end.getDate()).toBe(29);
    expect(end.getHours()).toBe(23);
    expect(end.getMilliseconds()).toBe(999);
  });
});

describe('averageDailySpend', () => {
  it('uses the correct number of days and rounds currency to cents', () => {
    expect(averageDailySpend(31, 2026, 1)).toBe(1);
    expect(averageDailySpend(29, 2024, 2)).toBe(1);
    expect(averageDailySpend(10, 2026, 1)).toBe(0.32);
  });

  it('returns zero when there are no expenses', () => {
    expect(averageDailySpend(0, 2026, 2)).toBe(0);
  });
});
