import { prisma } from '../../lib/prisma';
import { getMonthlyReportService } from '../report.service';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    transaction: {
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      findFirst: jest.fn(),
    },
    goal: { aggregate: jest.fn() },
    category: { findMany: jest.fn() },
  },
}));

// Mockirana baza omogoča preverjanje izračunov poročila brez povezave s pravo bazo.
describe('getMonthlyReportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Vrnemo različne zneske za trenutni in prejšnji mesec ter tako preverimo primerjavo.
    (prisma.transaction.aggregate as jest.Mock).mockImplementation(({ where }) => {
      const currentMonth = where.date.gte.getMonth() === 0;
      const isIncome = where.type === 'INCOME';
      const amount = isIncome
        ? (currentMonth ? '1000' : '800')
        : (currentMonth ? '300' : '200');

      return Promise.resolve({ _sum: { amount }, _count: currentMonth ? 3 : 2 });
    });
    (prisma.goal.aggregate as jest.Mock).mockImplementation(({ where }) => {
      const currentMonth = where.createdAt.gte.getMonth() === 0;
      return Promise.resolve({ _sum: { currentAmount: currentMonth ? '150' : '100' } });
    });
    (prisma.transaction.groupBy as jest.Mock).mockImplementation(({ by }) => {
      if (by[0] === 'categoryId') {
        return Promise.resolve([{ categoryId: 'food-id', _sum: { amount: '300' }, _count: 2 }]);
      }
      return Promise.resolve([]);
    });
    (prisma.transaction.findFirst as jest.Mock).mockResolvedValue({
      description: 'Groceries',
      amount: '120',
      category: { name: 'Food & Dining', icon: '🍲' },
      date: new Date('2026-01-15T00:00:00.000Z'),
    });
    (prisma.category.findMany as jest.Mock).mockResolvedValue([
      { id: 'food-id', name: 'Food & Dining', icon: '🍲', color: '#123456' },
    ]);
  });

  it('compares January with the previous December and summarizes mocked database totals', async () => {
    const result = await getMonthlyReportService('user-1', 2026, 1);

    // Preverimo vse pomembne dele poročila, tudi pravilen prevod kategorije.
    expect(result).toMatchObject({
      period: { year: 2026, month: 1, label: 'Januar 2026' },
      summary: {
        totalIncome: 1000,
        totalExpenses: 300,
        netSavings: 150,
        savingsRate: 15,
        transactionCount: 6,
      },
      comparison: { incomeChange: 25, expensesChange: 50, savingsChange: 50 },
      biggestExpense: {
        description: 'Groceries',
        amount: 120,
        categoryName: 'Hrana in pijača',
        categoryIcon: '🍲',
        date: '2026-01-15',
      },
      averageDailySpend: 9.68,
      categories: [
        expect.objectContaining({ categoryName: 'Hrana in pijača', total: 300, percentage: 100 }),
      ],
    });

    const transactionAggregateCalls = (prisma.transaction.aggregate as jest.Mock).mock.calls;
    // Januar 2026 mora primerjati s prejšnjim mesecem, decembrom 2025.
    const queriedMonths = transactionAggregateCalls.map(([query]) => [
      query.where.date.gte.getFullYear(),
      query.where.date.gte.getMonth() + 1,
    ]);
    expect(queriedMonths).toContainEqual([2026, 1]);
    expect(queriedMonths).toContainEqual([2025, 12]);
  });
});
