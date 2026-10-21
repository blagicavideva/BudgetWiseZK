/*Preverja, ali sistem sprejme veljaven prihodek ali strošek in zavrne napačne podatke: 
ničelni ali previsok znesek, neveljaven datum,valuto, opis ali parametre poizvedbe. 
Preveri tudi, da parse ob neveljavnem znesku vrže izjemo.*/

import {
  createTransactionSchema,
  transactionQuerySchema,
  updateTransactionSchema,
} from '../transaction.validator';

// Osnovni veljavni primer uporabimo kot izhodišče za spremembe posameznih polj.
const validTransaction = {
  type: 'EXPENSE',
  amount: 25.5,
  description: 'Groceries',
  date: '2026-02-28',
};

// Shema mora sprejeti veljaven zapis in zavrniti neveljavne zneske, datume ter polja.
describe('createTransactionSchema', () => {
  it('accepts a valid transaction and applies the optional fields', () => {
    // Veljaven zapis mora biti sprejet brez sprememb.
    expect(createTransactionSchema.parse(validTransaction)).toEqual(validTransaction);
  });

  it.each([0, -0.01, -10])('rejects a non-positive amount: %s', (amount) => {
    // Ničelni in negativni zneski niso dovoljeni.
    // Primer z 0 zazna napako, pri kateri bi validator ničelni znesek pomotoma sprejel.
    expect(createTransactionSchema.safeParse({ ...validTransaction, amount }).success).toBe(false);
  });

  it.each(['2026-2-01', 'not-a-date', '2026-02-31', '2025-02-29'])('rejects an invalid calendar date: %s', (date) => {
    // Preverimo tudi neobstoječe datume in napačen zapis datuma.
    expect(createTransactionSchema.safeParse({ ...validTransaction, date }).success).toBe(false);
  });

  it('accepts the maximum amount and maximum description length', () => {
    // Robni vrednosti na dovoljenih mejah morata biti sprejeti.
    expect(createTransactionSchema.safeParse({
      ...validTransaction,
      amount: 999999999,
      description: 'x'.repeat(200),
    }).success).toBe(true);
  });

  it('rejects an amount above the maximum', () => {
    // Zazna previsoko nastavljeno zgornjo mejo dovoljenega zneska.
    expect(createTransactionSchema.safeParse({ ...validTransaction, amount: 1000000000 }).success).toBe(false);
  });

  it('throws a validation exception when parse receives an invalid amount', () => {
    // Metoda parse mora ob neveljavnem vhodu vreči validacijsko izjemo.
    expect(() => createTransactionSchema.parse({ ...validTransaction, amount: 0 })).toThrow();
  });

  it.each(['INCOME', 'EXPENSE'])('accepts supported transaction type %s', (type) => {
    // Obe dovoljeni vrsti transakcije morata biti sprejeti.
    expect(createTransactionSchema.safeParse({ ...validTransaction, type }).success).toBe(true);
  });

  it('rejects unsupported currency, description length, and malformed category id', () => {
    // Vsaka sprememba v seznamu predstavlja eno neveljavno vrednost polja.
    for (const patch of [
      { currency: 'CAD' },
      { description: '' },
      { description: 'x'.repeat(201) },
      { categoryId: 'not-a-uuid' },
    ]) {
      expect(createTransactionSchema.safeParse({ ...validTransaction, ...patch }).success).toBe(false);
    }
  });
});

describe('updateTransactionSchema', () => {
  it('accepts partial updates while validating supplied values', () => {
    // Posodobitev je lahko delna, vendar mora vsaka podana vrednost ostati veljavna.
    expect(updateTransactionSchema.parse({ amount: 12 })).toEqual({ amount: 12 });
    expect(updateTransactionSchema.safeParse({ amount: 0 }).success).toBe(false);
  });
});

describe('transactionQuerySchema', () => {
  it('applies pagination and sorting defaults', () => {
    // Ob izpuščenih parametrih se uporabijo privzete vrednosti.
    expect(transactionQuerySchema.parse({})).toEqual({
      page: 1,
      limit: 20,
      sortBy: 'date',
      sortOrder: 'desc',
    });
  });

  it.each([{ page: '0' }, { limit: '101' }, { limit: '0' }, { sortBy: 'description' }, { sortOrder: 'up' }])(
    'rejects invalid query parameters: %o',
    (query) => {
      // Neveljavna paginacija ali sortiranje ne smeta prestati validacije.
      expect(transactionQuerySchema.safeParse(query).success).toBe(false);
    },
  );
});

// Za prikaz neuspeha CI začasno odstrani oznaki komentarja okoli tega testa.
// Po prikazu ga znova zakomentiraj, da redni testi ostanejo uspešni.
/*
it('prikazno preveri ničelni znesek z napačno pričakovano vrednostjo', () => {
  // Znesek transakcije mora biti večji od 0, zato validator pravilno zavrne znesek 0.
  // Test napačno pričakuje, da bo ničelni znesek veljaven; ta vsebinska napaka povzroči neuspeh testa in CI.
  expect(createTransactionSchema.safeParse({ ...validTransaction, amount: 0 }).success).toBe(true);
});
*/

// Drugi prikazni primer: tudi napačno pričakovanje pri zgornji meji povzroči neuspeh.
/*
it('prikazno pričakuje napačno sprejetje previsokega zneska', () => {
  // Največji dovoljeni znesek je 999999999; znesek 1000000000 mora biti zavrnjen.
  // Test napačno pričakuje, da bo sprejet, zato bi Jest prikazal neuspeh in CI bi postal rdeč.
  expect(createTransactionSchema.safeParse({ ...validTransaction, amount: 1000000000 }).success).toBe(true);
});
*/

// Uporabljeni agent za pripravo in pregled testov: Codex (UI agent).
