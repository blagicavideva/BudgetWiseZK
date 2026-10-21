/*Preverja tri samostojne funkcije: odstotno spremembo, začetek in konec mesečnega obdobja ter povprečno dnevno porabo.
Tu se preverijo robni primeri, kot so ničelne vrednosti, prestopno leto in pravilno zaokroževanje.*/

import { averageDailySpend, getDateRange, percentChange } from '../reportCalculations';

// Preverimo pozitivno in negativno spremembo ter dogovorjeno obravnavo ničle.
describe('percentChange', () => {
  // Primeri preverijo pozitivno in negativno spremembo ter obravnavo prejšnje vrednosti nič.
  it.each([
    [120, 100, 20],
    [80, 100, -20],
    [1, 0, 100],
    [0, 0, 0],
    // Zazna odstranitev Math.abs: negativna prejšnja vrednost mora dati 100 %, ne -100 %.
    [0, -100, 100],
  ])('returns %s current vs %s previous as %s percent', (current, previous, expected) => {
    expect(percentChange(current, previous)).toBe(expected);
  });

  // Za prikaz neuspeha CI začasno odstrani oznaki komentarja okoli spodnjega testa.
  // Po prikazu testa ne pozabi znova zakomentirati ali odstraniti.
  /*
  it('prikazno preveri odstotno spremembo z napačno pričakovano vrednostjo', () => {
    // Sprememba z 100 na 120 je (120 - 100) / 100 * 100 = 20 %, ne 25 %.
    // Napačna pričakovana vrednost 25 povzroči neuspeh testa in posledično CI.
    expect(percentChange(120, 100)).toBe(25);
  });
  */

  it('rounds to one decimal place', () => {
    // Rezultat 66,666... mora biti zaokrožen na eno decimalno mesto.
    expect(percentChange(10, 6)).toBe(66.7);
  });
});

describe('getDateRange', () => {
  it('returns the full range for a 31-day month', () => {
    // Končni čas mora zajeti tudi zadnjo milisekundo zadnjega dne v mesecu.
    // Zazna napako, pri kateri bi se razpon končal pri milisekundi 998 namesto 999.
    expect(getDateRange(2026, 1)).toEqual({
      start: new Date(2026, 0, 1),
      end: new Date(2026, 1, 0, 23, 59, 59, 999),
    });
  });

  it('handles leap-year February', () => {
    // Prestopno leto ima februarja 29 dni.
    // Preverjanje milisekund zazna prezgodnji konec obdobja tudi v prestopnem letu.
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
