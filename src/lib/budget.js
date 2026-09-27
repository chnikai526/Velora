import AsyncStorage from '@react-native-async-storage/async-storage';

const storageKey = (uid) => `velora-budget-${uid || 'guest'}`;

// Returns the user's highest monthly budget, or 0 if they haven't set one yet.
export const loadMonthlyBudget = async (uid) => {
  try {
    const saved = await AsyncStorage.getItem(storageKey(uid));
    if (saved !== null) return Number(saved) || 0;
  } catch (_error) {
    // Fall through to unset if storage is unavailable or corrupted.
  }
  return 0;
};

export const saveMonthlyBudget = async (uid, amount) => {
  await AsyncStorage.setItem(storageKey(uid), String(amount));
};

export const clearMonthlyBudget = async (uid) => {
  await AsyncStorage.removeItem(storageKey(uid));
};

// The budget period always runs from the 1st through the last day of the
// current calendar month, so it re-derives from `date` rather than being
// stored — no month-end job is needed to "reset" it.
export const getCurrentMonthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// Running totals across every transaction ever recorded. Balance is income
// minus expenses, so it can legitimately go negative — callers render the sign.
export const getBalanceTotals = (transactions = []) => {
  const totals = transactions.reduce(
    (running, item) => {
      const amount = Number(item.amount) || 0;
      if (item.type === 'Income') running.income += amount;
      else running.expenses += amount;
      return running;
    },
    { income: 0, expenses: 0 }
  );

  return { ...totals, balance: totals.income - totals.expenses };
};

export const getMonthToDateExpenses = (transactions, date = new Date()) => {
  const { start, end } = getCurrentMonthRange(date);
  return transactions
    .filter((item) => item.type === 'Expense')
    .filter((item) => {
      const itemDate = new Date(item.date || item.createdAt);
      return itemDate >= start && itemDate <= end;
    })
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
};

// Expense totals for the last `count` calendar months, oldest first.
export const getMonthlyExpenseSeries = (transactions = [], count = 6, now = new Date()) => {
  const months = Array.from({ length: count }, (_, index) => {
    const start = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
    return {
      year: start.getFullYear(),
      month: start.getMonth(),
      label: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(start),
      value: 0,
    };
  });
  transactions.forEach((item) => {
    if (item.type !== 'Expense') return;
    const date = new Date(item.date || item.createdAt);
    const bucket = months.find((entry) => entry.year === date.getFullYear() && entry.month === date.getMonth());
    if (bucket) bucket.value += Number(item.amount) || 0;
  });
  return months.map(({ label, value }) => ({ label, value }));
};
