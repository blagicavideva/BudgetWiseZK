import { averageDailySpend, getDateRange, percentChange } from '../reportCalculations';

// Preverimo pozitivno in negativno spremembo ter dogovorjeno obravnavo ničle.
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

  // ZAČASNO: namenoma povzroči neuspeh testa za prikaz delovanja cevovoda CI.
  it('temporarily demonstrates that CI stops on a failing test', () => {
    expect(true).toBe(false);
  });

  it('rounds to one decimal place', () => {
    expect(percentChange(10, 6)).toBe(66.7);
  });
});

describe('getDateRange', () => {
  it('returns the full range for a 31-day month', () => {
    // Končni čas mora zajeti tudi zadnjo milisekundo zadnjega dne v mesecu.
    expect(getDateRange(2026, 1)).toEqual({
      start: new Date(2026, 0, 1),
      end: new Date(2026, 1, 0, 23, 59, 59, 999),
    });
  });

  it('handles leap-year February', () => {
    // Prestopno leto ima februarja 29 dni.
    const { start, end } = getDateRange(2024, 2);
    expect(start.getDate()).toBe(1);
    expect(end.getDate()).toBe(29);
    expect(end.getHours()).toBe(23);
    expect(end.getMilliseconds()).toBe(999);
  });
});

describe('averageDailySpend', () => {
  it('uses the correct number of days and rounds currency to cents', () => {
    // Povprečje se deli s številom dni v mesecu in zaokroži na cente.
    expect(averageDailySpend(31, 2026, 1)).toBe(1);
    expect(averageDailySpend(29, 2024, 2)).toBe(1);
    expect(averageDailySpend(10, 2026, 1)).toBe(0.32);
  });

  it('returns zero when there are no expenses', () => {
    // Brez stroškov mora biti dnevno povprečje enako nič.
    expect(averageDailySpend(0, 2026, 2)).toBe(0);
  });
});
