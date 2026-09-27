import AsyncStorage from '@react-native-async-storage/async-storage';

// The full catalog of pre-suggested categories a user can pick from. Kept
// separate from the "currently enabled" set so new suggestions can be added
// later without touching anyone's saved preferences.
export const SUGGESTED_CATEGORIES = [
  { id: 'food', label: 'Food', icon: 'fast-food-outline' },
  { id: 'transport', label: 'Transport', icon: 'car-outline' },
  { id: 'bills', label: 'Bills', icon: 'receipt-outline' },
  { id: 'shopping', label: 'Shopping', icon: 'bag-handle-outline' },
  { id: 'entertainment', label: 'Entertainment', icon: 'film-outline' },
  { id: 'health', label: 'Health', icon: 'medkit-outline' },
  { id: 'education', label: 'Education', icon: 'school-outline' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'repeat-outline' },
  { id: 'travel', label: 'Travel', icon: 'airplane-outline' },
  { id: 'groceries', label: 'Groceries', icon: 'basket-outline' },
  { id: 'rent', label: 'Rent', icon: 'home-outline' },
  { id: 'coffee', label: 'Coffee', icon: 'cafe-outline' },
  { id: 'fitness', label: 'Fitness', icon: 'barbell-outline' },
  { id: 'gifts', label: 'Gifts', icon: 'gift-outline' },
  { id: 'pets', label: 'Pets', icon: 'paw-outline' },
  { id: 'others', label: 'Others', icon: 'ellipsis-horizontal-outline' },
];

const DEFAULT_ENABLED_IDS = ['food', 'transport', 'bills', 'shopping', 'entertainment', 'health', 'education', 'subscriptions', 'travel', 'others'];

// Income keeps its own fixed list — the customisable catalog above is all
// spending categories, and "Groceries" as a source of income makes no sense.
export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', icon: 'briefcase-outline' },
  { id: 'freelance', label: 'Freelance', icon: 'laptop-outline' },
  { id: 'refund', label: 'Refund', icon: 'return-down-back-outline' },
  { id: 'gift-income', label: 'Gift', icon: 'gift-outline' },
  { id: 'investment', label: 'Investment', icon: 'trending-up-outline' },
  { id: 'other-income', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export const INCOME_CATEGORY_LABELS = INCOME_CATEGORIES.map((item) => item.label);

const CUSTOM_ICON = 'pricetag-outline';

export const createCustomCategory = (label) => ({ id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, label, icon: CUSTOM_ICON });

// Icon for any stored category label — suggested, income or custom.
export const categoryIcon = (label = '') => {
  const key = String(label).trim().toLowerCase();
  const match = [...SUGGESTED_CATEGORIES, ...INCOME_CATEGORIES].find((item) => item.label.toLowerCase() === key);
  return match?.icon || CUSTOM_ICON;
};

// Case-insensitive lookup in the suggested catalog, so typing "coffee" as a
// custom category re-enables the built-in one instead of creating a twin.
export const findSuggestedCategory = (label = '') => {
  const key = String(label).trim().toLowerCase();
  return SUGGESTED_CATEGORIES.find((item) => item.label.toLowerCase() === key) || null;
};

const storageKey = (uid) => `velora-categories-${uid || 'guest'}`;

// Returns { enabledIds, custom } — enabledIds references SUGGESTED_CATEGORIES
// entries the user has kept, custom is their own { id, label, icon } entries.
export const loadCategoryPrefs = async (uid) => {
  try {
    const saved = await AsyncStorage.getItem(storageKey(uid));
    if (saved) {
      const parsed = JSON.parse(saved);
      // A partially written or hand-edited value used to crash every
      // category picker on `prefs.enabledIds.includes`.
      return {
        enabledIds: Array.isArray(parsed?.enabledIds) ? parsed.enabledIds : DEFAULT_ENABLED_IDS,
        custom: Array.isArray(parsed?.custom) ? parsed.custom.filter((item) => item?.id && item?.label) : [],
      };
    }
  } catch (_error) {
    // Fall through to defaults if storage is unavailable or corrupted.
  }
  return { enabledIds: DEFAULT_ENABLED_IDS, custom: [] };
};

export const saveCategoryPrefs = async (uid, prefs) => {
  await AsyncStorage.setItem(storageKey(uid), JSON.stringify(prefs));
};

// Flattens prefs into the ordered { id, label, icon } list a category picker
// should render: suggested (in catalog order) first, then custom ones.
export const resolveActiveCategories = (prefs) => {
  const enabled = SUGGESTED_CATEGORIES.filter((item) => (prefs?.enabledIds || []).includes(item.id));
  const seen = new Set(enabled.map((item) => item.label.toLowerCase()));
  // Drop custom entries that duplicate a label already in the list — two
  // chips with the same label shared a React key and toggled together.
  const custom = (prefs?.custom || []).filter((item) => {
    const key = item.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return [...enabled, ...custom];
};
