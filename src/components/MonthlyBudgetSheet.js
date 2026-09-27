import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, GUTTER, radius, scrim, SECTION_GAP, type } from '../theme';
import { clearMonthlyBudget, getCurrentMonthRange, getMonthToDateExpenses, loadMonthlyBudget, saveMonthlyBudget } from '../lib/budget';
import { formatMoney, parseAmount } from '../lib/format';
import useKeyboardOverlap from '../lib/useKeyboardOverlap';
import { confirmAction, showNotice } from '../lib/confirm';
import AmountField from './AmountField';
import Button from './Button';
import Chip from './Chip';
import GradientCard from './GradientCard';
import TickRuler from './TickRuler';
import Sheet from './Sheet';

const PRESETS = [500, 1000, 1500, 2000, 3000];

export default function MonthlyBudgetSheet({ visible, uid, transactions, onClose }) {
  const insets = useSafeAreaInsets();
  const containerRef = useRef(null);
  const [keyboardOverlap, onContainerLayout] = useKeyboardOverlap(containerRef);
  const [budget, setBudget] = useState(0);
  const [input, setInput] = useState('');
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef(null);

  useEffect(() => () => clearTimeout(savedTimer.current), []);

  const [wasVisible, setWasVisible] = useState(visible);
  if (wasVisible !== visible) {
    setWasVisible(visible);
    if (visible) setSaved(false);
  }

  useEffect(() => {
    if (!visible) return undefined;
    let active = true;
    loadMonthlyBudget(uid).then((amount) => {
      if (!active) return;
      setBudget(amount);
      setInput(amount ? String(amount) : '');
    });
    return () => { active = false; };
  }, [visible, uid]);

  // Recomputed each time the sheet opens; Profile keeps it mounted, so a
  // mount-time memo showed last month's range after the 1st.
  const { monthLabel, rangeLabel } = useMemo(() => {
    const now = new Date();
    const { start, end } = getCurrentMonthRange(now);
    const short = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { monthLabel: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), rangeLabel: `${short(start)} – ${short(end)}` };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const spent = useMemo(() => getMonthToDateExpenses(transactions || []), [transactions]);
  const remaining = Math.max(0, budget - spent);
  const ratio = budget > 0 ? Math.min(1, spent / budget) : 0;
  const over = budget > 0 && spent > budget;

  const amount = parseAmount(input);
  const valid = amount > 0;
  const unchanged = valid && amount === budget;

  const flashSaved = () => {
    setSaved(true);
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2000);
  };

  const save = async () => {
    if (!valid) return;
    try {
      await saveMonthlyBudget(uid, amount);
      setBudget(amount);
      setInput(String(amount));
      flashSaved();
    } catch (_error) {
      showNotice('Budget not saved', 'Your device storage could not be written. Try again.');
    }
  };

  const removeBudget = () => confirmAction({
    title: 'Remove monthly budget?',
    message: 'Home will stop tracking what is left to spend until you set a new one.',
    confirmLabel: 'Remove',
    destructive: true,
    onConfirm: async () => {
      try {
        await clearMonthlyBudget(uid);
        setBudget(0);
        setInput('');
      } catch (_error) {
        showNotice('Budget not removed', 'Your device storage could not be written. Try again.');
      }
    },
  });

  const keyboardOpen = keyboardOverlap > 0;
  const saveBottom = keyboardOpen ? keyboardOverlap + 12 : insets.bottom + 16;

  return (
    <Sheet visible={visible} onClose={onClose} title="Monthly budget" subtitle={`${monthLabel} · ${rangeLabel}`}>
      <View ref={containerRef} onLayout={onContainerLayout} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: saveBottom + 56 + SECTION_GAP }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          <GradientCard tone={over ? 'rose' : 'halo'} radius={radius.xl} contentStyle={styles.summaryContent}>
            <Text style={styles.summaryTitle}>{budget > 0 ? (over ? 'Over budget by' : 'Left this month') : 'Spent this month'}</Text>
            <Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
              {budget > 0 ? formatMoney(over ? spent - budget : remaining) : formatMoney(spent)}
            </Text>
            <View style={styles.summaryPill}>
              <Text style={styles.summaryPillText}>
                {budget > 0 ? `${formatMoney(spent)} of ${formatMoney(budget)} spent` : 'No budget set yet'}
              </Text>
            </View>
            <TickRuler ratio={budget > 0 ? ratio : 0} style={styles.ruler} />
          </GradientCard>

          <Text style={styles.sectionTitle}>Highest monthly budget</Text>
          <View style={styles.inputCard}>
            <AmountField label={null} value={input} onChangeText={setInput} fontSize={48} accessibilityLabel="Monthly budget" />
            <View style={styles.presets}>
              {PRESETS.map((value) => (
                <Chip key={value} label={formatMoney(value).replace('.00', '')} selected={amount === value} onPress={() => setInput(String(value))} style={amount !== value && styles.preset} />
              ))}
            </View>
          </View>
          <Text style={styles.copy}>Starts fresh on the 1st and runs through the last day of each month — no need to reset it.</Text>

          {budget > 0 ? (
            <Button
              label="Remove budget"
              variant="danger"
              size="md"
              icon={<Ionicons name="trash-outline" size={17} color={colors.negative} />}
              onPress={removeBudget}
              style={styles.remove}
            />
          ) : null}
        </ScrollView>

        <LinearGradient colors={scrim.colors} locations={scrim.locations} style={[styles.bottomScrim, { height: saveBottom + 96 }]} pointerEvents="none" />
        <Button
          onPress={save}
          label={saved ? 'Saved' : budget > 0 ? 'Update budget' : 'Save budget'}
          icon={<Ionicons name={saved ? 'checkmark-circle' : 'checkmark'} size={20} color={colors.pillText} />}
          disabled={!valid || (unchanged && !saved)}
          style={[styles.saveButton, { bottom: saveBottom }]}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: GUTTER, paddingTop: 4 },
  summaryContent: { alignItems: 'center', paddingTop: 26, paddingBottom: 22, paddingHorizontal: 22 },
  summaryTitle: { ...type.heading, fontSize: 18, color: colors.textSoft },
  summaryValue: { ...type.hero, fontSize: 52, lineHeight: 60, color: colors.text, alignSelf: 'stretch', textAlign: 'center', marginTop: 6 },
  summaryPill: { marginTop: 12, height: 36, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', justifyContent: 'center' },
  summaryPillText: { ...type.label, color: colors.text },
  ruler: { alignSelf: 'stretch', marginTop: 22 },
  sectionTitle: { ...type.heading, color: colors.text, marginTop: SECTION_GAP, marginBottom: 12, paddingHorizontal: 4 },
  inputCard: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingTop: 22, paddingBottom: 18, paddingHorizontal: 16 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 20 },
  // Unselected only — a background here would override the selected pill.
  preset: { backgroundColor: colors.surfaceRaised },
  copy: { ...type.caption, fontSize: 13, lineHeight: 18, color: colors.textMuted, marginTop: 12, paddingHorizontal: 4 },
  remove: { marginTop: SECTION_GAP },
  bottomScrim: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  saveButton: { position: 'absolute', left: GUTTER, right: GUTTER },
});
