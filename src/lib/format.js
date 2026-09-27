// Absolute dollar amount with two decimals. Callers render the sign.
export const formatMoney = (value) =>
  `$${Math.abs(Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// YYYY-MM-DD and HH:MM in the device's local time zone. `toISOString` would
// give the UTC date, which is a different day for evening entries.
const pad = (value) => String(value).padStart(2, '0');
export const toLocalDateInput = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const toLocalTimeInput = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const MAX_WHOLE_DIGITS = 9;

// Keeps a money field to digits and a single decimal point with at most two
// decimals. Locales whose decimal pad types "," (e.g. "12,50") would otherwise
// be parsed by parseFloat as 12, silently dropping the cents.
export const sanitizeAmountInput = (text = '') => {
  let next = String(text);
  next = next.includes('.') ? next.replace(/,/g, '') : next.replace(/,/g, '.');
  next = next.replace(/[^0-9.]/g, '');
  const dot = next.indexOf('.');
  let whole = dot === -1 ? next : next.slice(0, dot);
  const fraction = dot === -1 ? null : next.slice(dot + 1).replace(/\./g, '').slice(0, 2);
  whole = whole.replace(/^0+(?=\d)/, '').slice(0, MAX_WHOLE_DIGITS);
  if (fraction === null) return whole;
  return `${whole || '0'}.${fraction}`;
};

// Number value of a money field, rounded to cents; NaN when empty or invalid.
export const parseAmount = (text) => {
  const value = Number.parseFloat(String(text ?? '').replace(',', '.'));
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : Number.NaN;
};

const isSameDay = (left, right) => left.toDateString() === right.toDateString();

const relativeDay = (date, now = new Date()) => {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (isSameDay(date, now)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';
  if (isSameDay(date, tomorrow)) return 'Tomorrow';
  return null;
};

// "Today", "Yesterday", "Mon, Sep 22" or "Sep 22, 2025" for other years.
export const formatDayLabel = (value, now = new Date()) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const relative = relativeDay(date, now);
  if (relative) return relative;
  return date.getFullYear() === now.getFullYear()
    ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// "Today, 12:15 PM", "Sep 22, 9:00 AM" or "Sep 22, 2025, 9:00 AM".
export const formatDateTime = (value, now = new Date()) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const relative = relativeDay(date, now);
  if (relative) return `${relative}, ${time}`;
  const day = date.getFullYear() === now.getFullYear()
    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${day}, ${time}`;
};

// "Sep 22, 2026".
export const formatLongDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
