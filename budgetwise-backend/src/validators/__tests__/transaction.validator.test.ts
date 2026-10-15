import {
  createTransactionSchema,
  transactionQuerySchema,
  updateTransactionSchema,
} from '../transaction.validator';

const validTransaction = {
  type: 'EXPENSE',
  amount: 25.5,
  description: 'Groceries',
  date: '2026-02-28',
};

describe('createTransactionSchema', () => {
  it('accepts a valid transaction and applies the optional fields', () => {
    expect(createTransactionSchema.parse(validTransaction)).toEqual(validTransaction);
  });

  it.each([0, -0.01, -10])('rejects a non-positive amount: %s', (amount) => {
    expect(createTransactionSchema.safeParse({ ...validTransaction, amount }).success).toBe(false);
  });

  it.each(['2026-2-01', 'not-a-date', '2026-02-31', '2025-02-29'])('rejects an invalid calendar date: %s', (date) => {
    expect(createTransactionSchema.safeParse({ ...validTransaction, date }).success).toBe(false);
  });

  it('accepts the maximum amount and maximum description length', () => {
    expect(createTransactionSchema.safeParse({
      ...validTransaction,
      amount: 999999999,
      description: 'x'.repeat(200),
    }).success).toBe(true);
  });

  it('rejects an amount above the maximum', () => {
    expect(createTransactionSchema.safeParse({ ...validTransaction, amount: 1000000000 }).success).toBe(false);
  });

  it.each(['INCOME', 'EXPENSE'])('accepts supported transaction type %s', (type) => {
    expect(createTransactionSchema.safeParse({ ...validTransaction, type }).success).toBe(true);
  });

  it('rejects unsupported currency, description length, and malformed category id', () => {
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
    expect(updateTransactionSchema.parse({ amount: 12 })).toEqual({ amount: 12 });
    expect(updateTransactionSchema.safeParse({ amount: 0 }).success).toBe(false);
  });
});

describe('transactionQuerySchema', () => {
  it('applies pagination and sorting defaults', () => {
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
      expect(transactionQuerySchema.safeParse(query).success).toBe(false);
    },
  );
});
