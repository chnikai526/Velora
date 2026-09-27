import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ReanimatedAnimated, { FadeInDown } from 'react-native-reanimated';
import TransactionFormModal from '../components/TransactionFormModal';
import TransactionsHistorySheet from '../components/TransactionsHistorySheet';
import MonthlyBudgetSheet from '../components/MonthlyBudgetSheet';
import VeloraCatMascot from '../components/VeloraCatMascot';
import AnimalAvatar from '../components/avatars/AnimalAvatar';
import GradientCard from '../components/GradientCard';
import MetricCard from '../components/MetricCard';
import PillButton from '../components/PillButton';
import TickRuler from '../components/TickRuler';
import IconButton from '../components/IconButton';
import FloatingAddButton, { FAB_SIZE } from '../components/FloatingAddButton';
import { CARD_GAP, colors, GUTTER, radius, SECTION_GAP, tabBarClearance, type } from '../theme';
import { getBalanceTotals, getMonthToDateExpenses, loadMonthlyBudget } from '../lib/budget';
import { loadProfile } from '../lib/profile';
import { formatDateTime, formatMoney } from '../lib/format';
import { describeInterval } from '../lib/recurring';
import { confirmAction, showNotice } from '../lib/confirm';

// Space between the top of the tab bar and the floating "+" above it.
const FAB_GAP = 14;

const greetingFor = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// Counts a number up/down to `value` instead of jumping — hero amount only.
function useCountUp(value, duration = 400) {
  const [display, setDisplay] = useState(value);
  const [animated] = useState(() => new Animated.Value(value));

  useEffect(() => {
    const listener = animated.addListener(({ value: next }) => setDisplay(next));
    const animation = Animated.timing(animated, { toValue: value, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    animation.start();
    return () => {
      animation.stop();
      animated.removeListener(listener);
    };
  }, [animated, duration, value]);

  return display;
}

export default function HomeScreen({ transactions, updateTransaction, removeTransaction, currentUser, navigation }) {
  const [editing, setEditing] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budget, setBudget] = useState(0);
  const [avatarId, setAvatarId] = useState('cat');
  const [profileName, setProfileName] = useState('');
  const [wakeSignal, setWakeSignal] = useState(0);
  const prevTransactionCount = useRef(transactions.length);
  const scrollRef = useRef(null);
  const insets = useSafeAreaInsets();
  const uid = currentUser?.uid;
  useScrollToTop(scrollRef);

  const loadBudget = useCallback(() => {
    let active = true;
    loadMonthlyBudget(uid).then((amount) => { if (active) setBudget(amount); });
    return () => { active = false; };
  }, [uid]);

  // The saved profile is the source of truth for the name: it's what the
  // user typed in Edit profile, even when Firebase's displayName update
  // failed or hasn't propagated to this screen yet.
  useFocusEffect(useCallback(() => {
    const cancelBudget = loadBudget();
    let active = true;
    loadProfile(uid).then((profile) => {
      if (!active) return;
      if (profile?.avatarId) setAvatarId(profile.avatarId);
      setProfileName(profile?.name?.trim() || '');
    });
    return () => { active = false; cancelBudget(); };
  }, [uid, loadBudget]));

  useEffect(() => {
    if (prevTransactionCount.current !== transactions.length) {
      prevTransactionCount.current = transactions.length;
      setWakeSignal((n) => n + 1);
    }
  }, [transactions.length]);

  const { expenses, recent, totals } = useMemo(() => ({
    expenses: getMonthToDateExpenses(transactions),
    totals: getBalanceTotals(transactions),
    recent: [...transactions].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).slice(0, 5),
  }), [transactions]);
  const hasBudget = budget > 0;
  const remaining = hasBudget ? Math.max(0, budget - expenses) : 0;
  const spentRatio = hasBudget ? Math.max(0, Math.min(1, expenses / budget)) : 0;
  const leftPercent = hasBudget ? Math.round((remaining / budget) * 100) : 0;
  const mood = spentRatio > 0.8 ? 'mad' : spentRatio > 0.4 ? 'worried' : 'happy';
  const userName = (profileName || currentUser?.displayName || '').trim().split(/\s+/)[0] || 'there';
  const greeting = greetingFor();
  const remove = (item, afterDelete) => confirmAction({
    title: 'Delete transaction?',
    message: `Delete ${item.note || item.category || 'this transaction'} permanently?`,
    confirmLabel: 'Delete',
    destructive: true,
    onConfirm: () => { removeTransaction(item.id); afterDelete?.(); },
  });
  const save = (entry) => {
    const result = updateTransaction(editing.id, entry);
    if (result.ok) setEditing(null);
    else showNotice('Unable to save changes', result.message);
  };
  const openHistory = () => setHistoryOpen(true);
  const openBudget = () => setBudgetOpen(true);
  const openAdd = () => navigation.navigate('AddTransaction');

  const tabClearance = tabBarClearance(insets.bottom);
  const fabBottom = tabClearance + FAB_GAP;
  // Lets the last card scroll up past the floating "+" instead of under it.
  const scrollBottomPadding = fabBottom + FAB_SIZE + SECTION_GAP;

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView ref={scrollRef} contentContainerStyle={[styles.content, { paddingBottom: scrollBottomPadding }]} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.avatarRing}>
              <AnimalAvatar avatarId={avatarId} size={40} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.name} numberOfLines={1}>{userName}</Text>
            </View>
            <IconButton accessibilityLabel="All transactions" onPress={openHistory} icon={<Ionicons name="time-outline" size={20} color={colors.text} />} />
          </View>

          <GradientCard tone="halo" radius={radius.xl} style={styles.hero} contentStyle={styles.heroContent}>
            <Text style={styles.heroTitle}>Left to spend{'\n'}this month</Text>
            <VeloraCatMascot size={150} mood={mood} wakeSignal={wakeSignal} />
            <HeroAmount value={remaining} placeholder={!hasBudget} />
            {/* Opens the budget sheet right here — it used to jump to the
                Profile tab and leave the user to find "Monthly budget". */}
            <Pressable
              onPress={openBudget}
              style={({ pressed }) => [styles.heroPill, pressed && styles.heroPillPressed]}
              accessibilityRole="button"
              accessibilityLabel={hasBudget ? 'Edit monthly budget' : 'Set a monthly budget'}
              hitSlop={6}
            >
              <Text style={styles.heroPillText}>{hasBudget ? `${leftPercent}% of ${formatMoney(budget)} left` : 'Set a monthly budget'}</Text>
              <Ionicons name={hasBudget ? 'create-outline' : 'add'} size={15} color={colors.text} />
            </Pressable>
            <TickRuler ratio={hasBudget ? spentRatio : 0.5} style={styles.ruler} />
            {hasBudget && (
              <View style={styles.rulerLabels}>
                <Text style={styles.rulerLabel}>Spent {formatMoney(expenses)}</Text>
                <Text style={styles.rulerLabel}>Budget {formatMoney(budget)}</Text>
              </View>
            )}
          </GradientCard>

          <GradientCard tone="ember" style={styles.balanceCard} contentStyle={styles.balanceContent} onPress={openHistory} accessibilityLabel="Current balance">
            <Text style={styles.cardTitle}>Current{'\n'}balance</Text>
            <View style={styles.balanceBottom}>
              <View style={styles.flex}>
                <Text style={styles.balanceValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{totals.balance < 0 ? '−' : ''}{formatMoney(totals.balance)}</Text>
                <Text style={styles.balanceHint}>Income minus expenses</Text>
              </View>
              <View style={styles.cornerArrow}>
                <Ionicons name="arrow-up" size={15} color={colors.text} />
              </View>
            </View>
          </GradientCard>

          <View style={styles.tiles}>
            <GradientCard tone="dawn" style={styles.tile} contentStyle={styles.tileContent} onPress={openHistory} accessibilityLabel="Total income">
              <Text style={styles.tileTitle}>Total{'\n'}income</Text>
              <PillButton label={`${totals.income > 0 ? '+' : ''}${formatMoney(totals.income)}`} onPress={openHistory} />
            </GradientCard>
            <GradientCard tone="dusk" style={styles.tile} contentStyle={styles.tileContent} onPress={openHistory} accessibilityLabel="Total expenses">
              <Text style={styles.tileTitle}>Total{'\n'}expenses</Text>
              <PillButton label={`${totals.expenses > 0 ? '−' : ''}${formatMoney(totals.expenses)}`} onPress={openHistory} />
            </GradientCard>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent activity</Text>
            {recent.length > 0 && (
              <Pressable onPress={openHistory} hitSlop={8} style={styles.seeAll} accessibilityRole="button">
                <Text style={styles.seeAllText}>See all</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.textSoft} />
              </Pressable>
            )}
          </View>

          {recent.length ? (
            <View style={styles.stack}>
              {recent.map((item, index) => {
                const isIncome = item.type === 'Income';
                return (
                  <ReanimatedAnimated.View key={item.id} entering={FadeInDown.delay(index * 60).duration(400)}>
                    <MetricCard
                      label={item.note || item.category || (isIncome ? 'Income' : 'Expense')}
                      caption={`${formatDateTime(item.date || item.createdAt)}${item.recurring ? ` · ${describeInterval(item.repeatInterval)}` : ''}`}
                      pill={{ label: item.category || item.type, tone: isIncome ? 'green' : 'gold' }}
                      value={`${isIncome ? '+' : '−'}${formatMoney(item.amount)}`}
                      valueColor={isIncome ? colors.positive : colors.text}
                      onPress={() => setEditing(item)}
                      onLongPress={() => remove(item)}
                    />
                  </ReanimatedAnimated.View>
                );
              })}
              <Text style={styles.hint}>Tap to edit · hold to delete</Text>
            </View>
          ) : (
            <Pressable onPress={openAdd} style={({ pressed }) => [styles.empty, pressed && styles.emptyPressed]} accessibilityRole="button" accessibilityLabel="Add your first transaction">
              <View style={styles.emptyIcon}>
                <Ionicons name="receipt-outline" size={22} color={colors.textSoft} />
              </View>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptyCopy}>Tap + below to add income or an expense and it will appear here.</Text>
            </Pressable>
          )}
        </ScrollView>

        {/* Fades content out beneath the floating tab bar. */}
        <LinearGradient colors={['rgba(19,19,19,0)', colors.bg]} style={[styles.bottomScrim, { height: tabClearance + 36 }]} pointerEvents="none" />

        <FloatingAddButton onPress={openAdd} style={[styles.fab, { bottom: fabBottom }]} />

        <TransactionFormModal
          visible={Boolean(editing)}
          transaction={editing}
          uid={uid}
          onClose={() => setEditing(null)}
          onSave={save}
          onDelete={(item) => remove(item, () => setEditing(null))}
        />
        <TransactionsHistorySheet
          visible={historyOpen}
          transactions={transactions}
          uid={uid}
          onUpdate={updateTransaction}
          onRemove={removeTransaction}
          onClose={() => setHistoryOpen(false)}
        />
        <MonthlyBudgetSheet visible={budgetOpen} uid={uid} transactions={transactions} onClose={() => { setBudgetOpen(false); loadBudget(); }} />
      </SafeAreaView>
    </View>
  );
}

function HeroAmount({ value, placeholder }) {
  const display = useCountUp(value);
  return (
    <Text style={styles.heroAmount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
      {placeholder ? '—' : formatMoney(display)}
    </Text>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: GUTTER, paddingTop: 8 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  avatarRing: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, marginLeft: 12 },
  greeting: { ...type.overline, color: colors.textMuted },
  name: { ...type.heading, fontSize: 20, color: colors.text },

  hero: { marginBottom: CARD_GAP },
  heroContent: { alignItems: 'center', paddingTop: 28, paddingBottom: 22, paddingHorizontal: 22 },
  heroTitle: { ...type.heading, fontSize: 21, lineHeight: 25, color: colors.text, textAlign: 'center', marginBottom: 6 },
  heroAmount: { ...type.hero, fontSize: 56, lineHeight: 64, color: colors.text, textAlign: 'center', alignSelf: 'stretch', marginTop: 4 },
  heroPill: { marginTop: 12, height: 40, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroPillPressed: { backgroundColor: 'rgba(255,255,255,0.08)' },
  heroPillText: { ...type.label, fontSize: 16, color: colors.text },
  ruler: { alignSelf: 'stretch', marginTop: 22 },
  rulerLabels: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  rulerLabel: { ...type.caption, color: colors.textMuted },

  balanceCard: { marginBottom: CARD_GAP },
  balanceContent: { padding: 24, minHeight: 170, justifyContent: 'space-between' },
  cardTitle: { ...type.title, color: colors.text },
  balanceBottom: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 18 },
  balanceValue: { ...type.display, fontSize: 34, lineHeight: 40, color: colors.text },
  balanceHint: { ...type.overline, color: colors.textSoft, marginTop: 2 },
  cornerArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },

  tiles: { flexDirection: 'row', gap: CARD_GAP, marginBottom: SECTION_GAP + 4 },
  tile: { flex: 1 },
  tileContent: { padding: 20, minHeight: 156, justifyContent: 'space-between' },
  tileTitle: { ...type.title, fontSize: 23, lineHeight: 26, color: '#FFFFFF' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 },
  sectionTitle: { ...type.heading, fontSize: 20, color: colors.text },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 32, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.glass },
  seeAllText: { ...type.label, color: colors.textSoft },
  stack: { gap: CARD_GAP },
  hint: { ...type.caption, color: colors.textFaint, textAlign: 'center', marginTop: 8 },

  empty: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24, borderRadius: radius.lg, backgroundColor: colors.surface },
  emptyPressed: { opacity: 0.85 },
  emptyIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { ...type.heading, color: colors.text, marginTop: 14, marginBottom: 6 },
  emptyCopy: { ...type.body, color: colors.textMuted, textAlign: 'center' },
  bottomScrim: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  fab: { position: 'absolute', right: GUTTER },
});
