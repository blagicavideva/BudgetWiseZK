export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat((((current - previous) / Math.abs(previous)) * 100).toFixed(1));
}

export function getDateRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

export function averageDailySpend(totalExpenses: number, year: number, month: number): number {
  const daysInMonth = new Date(year, month, 0).getDate();
  return parseFloat((totalExpenses / daysInMonth).toFixed(2));
}
