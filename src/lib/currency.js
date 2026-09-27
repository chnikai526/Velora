import AsyncStorage from '@react-native-async-storage/async-storage';

// Free, no-key endpoint covering ~166 currencies. It reports "1 CAD = N X".
const RATES_URL = 'https://open.er-api.com/v6/latest/CAD';
const CACHE_KEY = 'velora-exchange-rates';

// Names for the currencies people actually reach for. Anything outside this
// map still works and still converts — the picker just shows its code alone.
const CURRENCY_NAMES = {
  AED: 'UAE Dirham', ARS: 'Argentine Peso', AUD: 'Australian Dollar', BDT: 'Bangladeshi Taka',
  BGN: 'Bulgarian Lev', BHD: 'Bahraini Dinar', BRL: 'Brazilian Real', CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc', CLP: 'Chilean Peso', CNY: 'Chinese Yuan', COP: 'Colombian Peso',
  CZK: 'Czech Koruna', DKK: 'Danish Krone', EGP: 'Egyptian Pound', ETB: 'Ethiopian Birr',
  EUR: 'Euro', GBP: 'British Pound', GHS: 'Ghanaian Cedi', HKD: 'Hong Kong Dollar',
  HUF: 'Hungarian Forint', IDR: 'Indonesian Rupiah', ILS: 'Israeli Shekel', INR: 'Indian Rupee',
  ISK: 'Icelandic Krona', JMD: 'Jamaican Dollar', JPY: 'Japanese Yen', KES: 'Kenyan Shilling',
  KRW: 'South Korean Won', KWD: 'Kuwaiti Dinar', LKR: 'Sri Lankan Rupee', MAD: 'Moroccan Dirham',
  MXN: 'Mexican Peso', MYR: 'Malaysian Ringgit', NGN: 'Nigerian Naira', NOK: 'Norwegian Krone',
  NPR: 'Nepalese Rupee', NZD: 'New Zealand Dollar', OMR: 'Omani Rial', PEN: 'Peruvian Sol',
  PHP: 'Philippine Peso', PKR: 'Pakistani Rupee', PLN: 'Polish Zloty', QAR: 'Qatari Riyal',
  RON: 'Romanian Leu', RSD: 'Serbian Dinar', RUB: 'Russian Ruble', SAR: 'Saudi Riyal',
  SEK: 'Swedish Krona', SGD: 'Singapore Dollar', THB: 'Thai Baht', TRY: 'Turkish Lira',
  TWD: 'Taiwan Dollar', TZS: 'Tanzanian Shilling', UAH: 'Ukrainian Hryvnia', UGX: 'Ugandan Shilling',
  USD: 'US Dollar', UYU: 'Uruguayan Peso', VND: 'Vietnamese Dong', ZAR: 'South African Rand',
};

export const currencyName = (code) => CURRENCY_NAMES[code] || code;

// Every rate is stored as "1 unit of this currency = N CAD" (so CAD is exactly
// 1). That's the inverse of what the API sends, and it's what makes both the
// conversion below and the rates list read consistently off one number.
export const fetchRates = async (signal) => {
  const response = await fetch(RATES_URL, { signal });
  if (!response.ok) throw new Error('Unable to load exchange rates.');

  const data = await response.json();
  if (data?.result !== 'success' || !data?.rates) throw new Error('Unable to load exchange rates.');

  const rates = { CAD: 1 };
  Object.entries(data.rates).forEach(([code, value]) => {
    const perCad = Number(value);
    if (Number.isFinite(perCad) && perCad > 0) rates[code] = 1 / perCad;
  });

  // `time_last_update_utc` is an RFC 2822 string ("Fri, 26 Sep 2026 00:00:01
  // +0000") that Hermes can't parse, which rendered as "Invalid Date". The
  // unix field converts cleanly to ISO.
  const unix = Number(data.time_last_update_unix);
  return { rates, updatedAt: Number.isFinite(unix) && unix > 0 ? new Date(unix * 1000).toISOString() : null };
};

export const convert = (amount, fromCurrency, toCurrency, rates) => {
  const numericAmount = Number.parseFloat(amount);
  if (!Number.isFinite(numericAmount)) return null;
  if (!rates?.[fromCurrency] || !rates?.[toCurrency]) return null;
  return (numericAmount * rates[fromCurrency]) / rates[toCurrency];
};

// Small results (1 INR in CAD is 0.0146) would round away to "0.01" at two
// decimals, so tighten precision as the number shrinks.
export const formatAmount = (value) => {
  if (value === null || !Number.isFinite(value)) return '—';
  const magnitude = Math.abs(value);
  const decimals = magnitude === 0 ? 2 : magnitude < 0.01 ? 6 : magnitude < 1 ? 4 : 2;
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

// Readable "Sep 26, 2026" for a stored `updatedAt`, or null if it can't be
// parsed (older caches stored the RFC 2822 string above).
export const formatRatesDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const loadCachedRates = async () => {
  try {
    const saved = await AsyncStorage.getItem(CACHE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (_error) {
    // Fall through to a live fetch if the cache is unavailable or corrupted.
  }
  return null;
};

export const saveCachedRates = async (payload) => {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch (_error) {
    // A failed cache write only costs a refetch next time.
  }
};
