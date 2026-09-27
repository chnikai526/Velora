import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatMoney as formatCurrency } from './format';
import { getCurrentMonthRange, getMonthToDateExpenses } from './budget';

const readKey = (uid) => `velora-notifications-read-${uid || 'guest'}`;

export const loadReadIds = async (uid) => {
  try {
    const saved = await AsyncStorage.getItem(readKey(uid));
    if (saved) return new Set(JSON.parse(saved));
  } catch (_error) {
    // Fall through to "nothing read yet" if storage is unavailable or corrupted.
  }
  return new Set();
};

export const saveReadIds = async (uid, ids) => {
  await AsyncStorage.setItem(readKey(uid), JSON.stringify(Array.from(ids)));
};

const monthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;

// Budget status items are recomputed on every open, so they carry a
// `timeLabel` ("This month") instead of a misleading "Just now".
// Builds the notification feed straight from live state — budget progress,
// month boundaries, and recent activity — rather than a separately stored
// event log, so it can never drift out of sync with what actually happened.
// Ids are deterministic (e.g. `budget-80-2026-7`) so re-computing this on
// every open naturally dedupes and preserves prior read state.
export const buildNotifications = ({ transactions = [], budgetAmount = 0, now = new Date() }) => {
  const items = [];
  const { start } = getCurrentMonthRange(now);
  const mKey = monthKey(now);

  if (budgetAmount > 0) {
    const spent = getMonthToDateExpenses(transactions, now);
    const ratio = spent / budgetAmount;

    if (ratio >= 1) {
      items.push({ id: `budget-over-${mKey}`, type: 'budget', tone: 'danger', icon: 'alert-circle', title: 'Monthly budget exceeded', body: `You've spent ${formatCurrency(spent)} of your ${formatCurrency(budgetAmount)} budget this month.`, date: now.toISOString(), timeLabel: 'This month' });
    } else if (ratio >= 0.8) {
      items.push({ id: `budget-80-${mKey}`, type: 'budget', tone: 'warning', icon: 'warning-outline', title: "You're close to your budget", body: `${Math.round(ratio * 100)}% of your ${formatCurrency(budgetAmount)} monthly budget is used.`, date: now.toISOString(), timeLabel: 'This month' });
    } else if (ratio >= 0.5) {
      items.push({ id: `budget-50-${mKey}`, type: 'budget', tone: 'info', icon: 'stats-chart-outline', title: 'Halfway through your budget', body: `${Math.round(ratio * 100)}% of your ${formatCurrency(budgetAmount)} monthly budget is used.`, date: now.toISOString(), timeLabel: 'This month' });
    }

    if (now.getDate() <= 3) {
      items.push({ id: `month-reset-${mKey}`, type: 'reset', tone: 'info', icon: 'refresh-outline', title: 'Fresh month, fresh budget', body: `Your ${formatCurrency(budgetAmount)} budget has reset for ${now.toLocaleDateString('en-US', { month: 'long' })}.`, date: start.toISOString() });
    }
  }

  const recentExpenses = [...transactions]
    .filter((item) => item.type === 'Expense')
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, 5);
  recentExpenses.forEach((item) => {
    items.push({ id: `txn-${item.id}`, type: 'transaction', tone: 'neutral', icon: 'receipt-outline', title: 'Expense logged', body: `${item.category || item.note || 'Expense'} · ${formatCurrency(item.amount)}`, date: item.date || item.createdAt });
  });

  if (transactions.length === 0) {
    items.push({ id: 'welcome', type: 'welcome', tone: 'info', icon: 'sparkles-outline', title: 'Welcome to Velora', body: 'Track your first expense and set a monthly budget to get started.', date: now.toISOString() });
  }

  return items.sort((a, b) => new Date(b.date) - new Date(a.date));
};
