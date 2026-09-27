import React, { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CARD_GAP, colors, GUTTER, radius, scrim, SECTION_GAP, type } from '../theme';
import { INCOME_CATEGORIES, SUGGESTED_CATEGORIES, categoryIcon, loadCategoryPrefs, resolveActiveCategories } from '../lib/categories';
import { REPEAT_INTERVALS, describeInterval, isValidInterval, nextOccurrence } from '../lib/recurring';
import { formatDateTime, formatLongDate, parseAmount } from '../lib/format';
import useKeyboardOverlap from '../lib/useKeyboardOverlap';
import Button from './Button';
import Card from './Card';
import Chip from './Chip';
import ListRow from './ListRow';
import AmountField from './AmountField';
import GradientCard from './GradientCard';
import SegmentedControl from './SegmentedControl';
import SheetHeader from './SheetHeader';
import Sheet, { SheetSurface } from './Sheet';
import { useDatePicker } from './DatePicker';

const SAVE_BUTTON_HEIGHT = 56;

const TRANSACTION_TYPES = [
  { key: 'Expense', label: 'Expense', icon: 'arrow-up' },
  { key: 'Income', label: 'Income', icon: 'arrow-down' },
];

const validDate = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const getInitialValues = (transaction, categories) => {
  const isIncome = transaction?.type === 'Income';
  const list = isIncome ? INCOME_CATEGORIES : categories;
  return {
    amount: transaction?.amount ? String(transaction.amount) : '',
    category: transaction?.category || list[0]?.label || '',
    note: transaction?.note || '',
    recurring: Boolean(transaction?.recurring),
    date: validDate(transaction?.date),
    // Older builds offered a "Custom" interval that had no settings behind it.
    repeatInterval: isValidInterval(transaction?.repeatInterval) ? transaction.repeatInterval : 'Monthly',
    type: isIncome ? 'Income' : 'Expense',
  };
};

export default function TransactionFormModal({ visible = true, transaction, uid, onClose, onSave, onDelete, fullScreen = false }) {
  const [categories, setCategories] = useState(SUGGESTED_CATEGORIES);
  const [values, setValues] = useState(() => getInitialValues(transaction, SUGGESTED_CATEGORIES));
  const insets = useSafeAreaInsets();
  const containerRef = useRef(null);
  const [keyboardOverlap, onContainerLayout] = useKeyboardOverlap(containerRef);
  const datePicker = useDatePicker();
  const scrollRef = useRef(null);

  // Hold on to the transaction while the sheet slides away: the parent clears
  // it as it closes, which flipped the title to "New expense" and emptied the
  // form mid-animation.
  const [shown, setShown] = useState(transaction);
  if (transaction && transaction !== shown) setShown(transaction);
  const current = transaction || (visible ? null : shown);
  const isEditing = Boolean(current);

  useEffect(() => {
    if (!visible) return undefined;
    let active = true;
    loadCategoryPrefs(uid).then((prefs) => {
      if (!active) return;
      const resolved = resolveActiveCategories(prefs);
      const next = resolved.length ? resolved : SUGGESTED_CATEGORIES;
      setCategories(next);
      // Income categories are fixed, so only re-seed when this is a new expense.
      setValues((draft) => (isEditing || draft.type === 'Income' || next.some((item) => item.label === draft.category) ? draft : { ...draft, category: next[0].label }));
    });
    return () => { active = false; };
  }, [visible, uid, isEditing]);

  // Re-seed the form whenever it opens or switches to a different
  // transaction. Done during render (not in an effect) so the first frame
  // already shows the right values.
  const [seededFor, setSeededFor] = useState({ transaction, visible });
  if (seededFor.transaction !== transaction || seededFor.visible !== visible) {
    setSeededFor({ transaction, visible });
    if (visible) setValues(getInitialValues(transaction, categories));
  }

  const isIncome = values.type === 'Income';
  const set = (patch) => setValues((draft) => ({ ...draft, ...patch }));

  // Income draws from its own fixed list, expenses from the user's catalog.
  // An edited transaction's category stays selectable even if it has since
  // been switched off in Categories — otherwise no chip shows as selected.
  const baseCategories = isIncome ? INCOME_CATEGORIES : categories;
  const activeCategories = values.category && !baseCategories.some((item) => item.label === values.category)
    ? [{ id: `current-${values.category}`, label: values.category, icon: categoryIcon(values.category) }, ...baseCategories]
    : baseCategories;

  const selectType = (nextType) => {
    setValues((draft) => {
      if (draft.type === nextType) return draft;
      const nextList = nextType === 'Income' ? INCOME_CATEGORIES : categories;
      // The old category belongs to the other list, so re-seed it.
      const category = nextList.some((item) => item.label === draft.category) ? draft.category : nextList[0]?.label || '';
      return { ...draft, type: nextType, category };
    });
  };

  const amountValue = parseAmount(values.amount);
  const canSave = amountValue > 0;

  const save = () => {
    if (!canSave) return;
    onSave({
      ...values,
      amount: amountValue,
      date: values.date.toISOString(),
      repeatInterval: values.recurring ? values.repeatInterval : null,
    });
  };

  const openDate = () => datePicker.open({
    value: values.date,
    mode: 'datetime',
    title: values.recurring ? 'Starts on' : 'Date',
    quickPicks: true,
    onPick: (date) => set({ date }),
  });

  const next = values.recurring ? nextOccurrence(values.date, values.repeatInterval) : null;
  const repeatSubtitle = values.recurring
    ? `${describeInterval(values.repeatInterval)}${next ? ` · next ${formatLongDate(next)}` : ''}`
    : 'Off';

  const keyboardOpen = keyboardOverlap > 0;
  const saveBottom = keyboardOpen ? keyboardOverlap + 12 : insets.bottom + 16;
  const footerHeight = SAVE_BUTTON_HEIGHT + saveBottom;
  const title = `${isEditing ? 'Edit' : 'New'} ${isIncome ? 'income' : 'expense'}`;
  const glow = isIncome ? 'green' : 'gold';

  const body = (
    <View ref={containerRef} onLayout={onContainerLayout} style={[styles.flex, { paddingBottom: keyboardOverlap }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingBottom: footerHeight + SECTION_GAP - keyboardOverlap }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        <GradientCard tone={isIncome ? 'meadow' : 'halo'} radius={radius.xl} contentStyle={styles.heroContent}>
          <SegmentedControl options={TRANSACTION_TYPES} value={values.type} onChange={selectType} variant="glass" style={styles.segment} />
          <Text style={styles.prompt}>{isIncome ? 'How much came in?' : 'How much did you spend?'}</Text>
          <AmountField label={null} value={values.amount} onChangeText={(amount) => set({ amount })} fontSize={60} accessibilityLabel="Amount" style={styles.amount} />
          <View style={styles.summaryPill}>
            <Ionicons name={categoryIcon(values.category)} size={15} color={colors.text} />
            <Text style={styles.summaryText} numberOfLines={1}>{values.category || 'No category'} · {formatDateTime(values.date)}</Text>
          </View>
        </GradientCard>

        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.chips}>
          {activeCategories.map((item) => (
            <Chip key={item.id || item.label} label={item.label} icon={item.icon} selected={values.category === item.label} onPress={() => set({ category: item.label })} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Details</Text>
        <Card contentStyle={styles.detailsContent}>
          <ListRow
            icon={<Ionicons name="calendar-outline" />}
            title={values.recurring ? 'Starts' : 'Date'}
            subtitle={formatDateTime(values.date)}
            onPress={openDate}
            right={<Ionicons name="chevron-forward" size={16} color={colors.textFaint} />}
          />
          <View style={styles.noteRow}>
            <View style={styles.noteIcon}>
              <Ionicons name="create-outline" size={18} color={colors.textSoft} />
            </View>
            <TextInput
              value={values.note}
              onChangeText={(note) => set({ note })}
              placeholder="Add a note"
              placeholderTextColor={colors.textFaint}
              selectionColor={colors.accent}
              style={styles.noteInput}
              maxLength={120}
              returnKeyType="done"
              // The note is the last field; bring it clear of the keyboard and
              // the pinned Save button once the keyboard has settled.
              onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 350)}
            />
          </View>
          <View style={styles.divider} />
          <ListRow
            icon={<Ionicons name="repeat-outline" />}
            title="Repeat"
            subtitle={repeatSubtitle}
            showDivider={values.recurring}
            right={
              <Switch
                value={values.recurring}
                onValueChange={(recurring) => set({ recurring })}
                trackColor={{ false: colors.surfaceRaised, true: colors.accent }}
                thumbColor={colors.text}
                ios_backgroundColor={colors.surfaceRaised}
                // react-native-web paints the "on" thumb teal unless told otherwise.
                {...(Platform.OS === 'web' ? { activeThumbColor: colors.text } : null)}
                accessibilityLabel="Repeat this transaction"
              />
            }
          />
          {values.recurring ? (
            <View style={styles.intervals}>
              {REPEAT_INTERVALS.map((item) => (
                <Chip key={item} label={item} selected={values.repeatInterval === item} onPress={() => set({ repeatInterval: item })} style={values.repeatInterval !== item && styles.intervalChip} />
              ))}
            </View>
          ) : null}
        </Card>
        {values.recurring ? (
          <Text style={styles.hint}>A copy is added automatically each time it comes due. Turn Repeat off to stop it.</Text>
        ) : null}

        {isEditing && onDelete ? (
          <Button
            label="Delete transaction"
            variant="danger"
            size="md"
            icon={<Ionicons name="trash-outline" size={17} color={colors.negative} />}
            onPress={() => onDelete(current)}
            style={styles.delete}
          />
        ) : null}
      </ScrollView>

      <LinearGradient colors={scrim.colors} locations={scrim.locations} style={[styles.bottomScrim, { height: footerHeight + 40 }]} pointerEvents="none" />
      <Button
        label={isEditing ? 'Save changes' : `Save ${isIncome ? 'income' : 'expense'}`}
        icon={<Ionicons name="checkmark" size={20} color={colors.pillText} />}
        onPress={save}
        disabled={!canSave}
        style={[styles.saveButton, { bottom: saveBottom }]}
      />
    </View>
  );

  // The picker panel is a sibling of the header so its dimmed backdrop
  // covers the whole sheet, header included.
  if (fullScreen) {
    return (
      <SheetSurface glow={glow}>
        <SheetHeader title={title} onClose={onClose} closeIcon="close" closeLabel="Cancel" />
        {body}
        {datePicker.panel}
      </SheetSurface>
    );
  }

  return (
    <Sheet visible={visible} onClose={onClose} title={title} closeIcon="close" glow={glow}>
      {body}
      {datePicker.panel}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: GUTTER, paddingTop: 4 },
  heroContent: { alignItems: 'center', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 22 },
  segment: { alignSelf: 'stretch', marginBottom: 22 },
  prompt: { ...type.heading, fontSize: 17, color: colors.textSoft, marginBottom: 4 },
  amount: { alignSelf: 'stretch' },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    maxWidth: '100%',
    marginTop: 18,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  summaryText: { ...type.label, color: colors.text, flexShrink: 1 },
  sectionTitle: { ...type.heading, color: colors.text, marginTop: SECTION_GAP, marginBottom: 12, paddingHorizontal: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP },
  detailsContent: { paddingVertical: 4, paddingHorizontal: 16 },
  noteRow: { flexDirection: 'row', alignItems: 'center', minHeight: 66 },
  noteIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  noteInput: { flex: 1, ...type.body, color: colors.text, paddingVertical: 12 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.09)', marginLeft: 54 },
  intervals: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingLeft: 54, paddingTop: 12, paddingBottom: 16 },
  intervalChip: { backgroundColor: colors.surfaceRaised },
  hint: { ...type.caption, color: colors.textMuted, marginTop: 10, paddingHorizontal: 4 },
  delete: { marginTop: SECTION_GAP },
  bottomScrim: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  saveButton: { position: 'absolute', left: GUTTER, right: GUTTER },
});
