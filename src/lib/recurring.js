// Recurring transactions. The transaction the user saves with "Repeat" on is
// the template and also the first entry. Each later occurrence is a normal
// transaction with a deterministic id (`<templateId>-r<n>`), so two devices
// generating the same occurrence write the same Firestore document instead
// of duplicating it. The template's `occurrencesGenerated` records how many
// have been created, so deleting one occurrence doesn't make it come back.

export const REPEAT_INTERVALS = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

const UNIT = { Daily: 'day', Weekly: 'week', Monthly: 'month', Yearly: 'year' };

export const isValidInterval = (interval) => REPEAT_INTERVALS.includes(interval);

// Date of the n-th repeat after `start`. Month and year steps clamp to the
// last day of shorter months (Jan 31 → Feb 28) instead of overflowing.
export const addInterval = (start, interval, n) => {
  const date = new Date(start.getTime());
  if (interval === 'Daily') date.setDate(date.getDate() + n);
  else if (interval === 'Weekly') date.setDate(date.getDate() + 7 * n);
  else {
    const months = interval === 'Yearly' ? 12 * n : n;
    const day = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + months);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(day, lastDay));
  }
  return date;
};

const MAX_SCAN = 5000;

// How many repeats of this schedule already fall on or before `now`. Saving
// a schedule starts counting from here, so turning "Repeat" on for an old
// entry doesn't suddenly backfill months of copies.
export const countElapsedOccurrences = (startValue, interval, now = new Date()) => {
  const start = new Date(startValue);
  if (!isValidInterval(interval) || Number.isNaN(start.getTime())) return 0;
  let n = 0;
  while (n < MAX_SCAN && addInterval(start, interval, n + 1) <= now) n += 1;
  return n;
};

// First repeat strictly after `now`, for the "Next on …" hint.
export const nextOccurrence = (startValue, interval, now = new Date()) => {
  const start = new Date(startValue);
  if (!isValidInterval(interval) || Number.isNaN(start.getTime())) return null;
  if (start > now) return addInterval(start, interval, 1);
  return addInterval(start, interval, countElapsedOccurrences(start, interval, now) + 1);
};

export const describeInterval = (interval) => (isValidInterval(interval) ? `Every ${UNIT[interval]}` : 'Off');

const MAX_PER_RUN = 400;

// Returns the occurrences that have come due since the last run, plus the
// templates with their counters advanced. Pure, so it's safe to call on
// every transactions change.
export const collectDueOccurrences = (transactions = [], now = new Date()) => {
  const existingIds = new Set(transactions.map((item) => item.id));
  const created = [];
  const templates = [];

  transactions.forEach((template) => {
    if (!template.recurring || !isValidInterval(template.repeatInterval)) return;
    const start = new Date(template.date || template.createdAt);
    if (Number.isNaN(start.getTime())) return;

    let generated = Number(template.occurrencesGenerated) || 0;
    const startCount = generated;
    while (created.length < MAX_PER_RUN) {
      const at = addInterval(start, template.repeatInterval, generated + 1);
      if (at > now) break;
      generated += 1;
      const id = `${template.id}-r${generated}`;
      if (existingIds.has(id)) continue;
      existingIds.add(id);
      created.push({
        ...template,
        id,
        recurring: false,
        repeatInterval: null,
        occurrencesGenerated: undefined,
        recurringSourceId: template.id,
        date: at.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: undefined,
      });
    }
    if (generated !== startCount) templates.push({ ...template, occurrencesGenerated: generated, updatedAt: now.toISOString() });
  });

  // Firestore rejects `undefined` field values, so strip them.
  const clean = (item) => Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined));
  return { created: created.map(clean), templates };
};
