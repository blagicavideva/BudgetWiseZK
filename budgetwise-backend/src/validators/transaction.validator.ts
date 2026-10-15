// src/validators/transaction.validator.ts
import { z } from 'zod';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').refine((value) => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}, 'Date must be a real calendar date');

export const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive('Amount must be positive').max(999999999),
  currency: z.enum(['EUR', 'USD', 'GBP', 'CHF', 'HRK', 'RSD', 'BAM']).optional(),
  description: z.string().min(1).max(200),
  note: z.string().max(500).optional(),
  date: dateSchema,
  categoryId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  categoryId: z.string().uuid().optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
