import React, { useMemo, useState } from 'react';
import { ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, GUTTER, radius, type } from '../theme';
import { categoryIcon } from '../lib/categories';
import { formatDayLabel, formatMoney } from '../lib/format';
import { describeInterval } from '../lib/recurring';
import { confirmAction, showNotice } from '../lib/confirm';
import Input from './Input';
import ListRow from './ListRow';
import GradientCard from './GradientCard';
import Sheet from './Sheet';
import TransactionFormModal from './TransactionFormModal';

const MONTHS_BACK = 12;
const dateOf = (item) => new Date(item.date || item.createdAt);
const monthKeyOf = (date) => `${date.getFullYear()}-${date.getMonth()}`;
const entries = (count) => `${count} ${count === 1 ? 'entry' : 'entries'}`;

// Two steps: the sheet opens on the past twelve months, and picking one shows
// that month's transactions. `onUpdate(id, entry)` and `onRemove(id)` are
// optional; without them the list is read-only.
export default function TransactionsHistorySheet({ visible, transactions, uid, onUpdate, onRemove, onClose }) {
  const insets = useSafeAreaInsets();
  const [selectedKey, setSelectedKey] = useState(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const editable = Boolean(onUpdate);

  // Start fresh on the month list each time the sheet opens.
  const [wasVisible, setWasVisible] = useState(visible);
  if (wasVisible !== visible) {
    setWasVisible(visible);
    if (visible) {
      setSelectedKey(null);
      setSearch('');
    }
  }

  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: MONTHS_BACK }, (_, index) => {
      // Anchor to the 1st before stepping back — "Mar 31 minus a month"
      // overflows forward and duplicated months.
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      return {
        key: monthKeyOf(date),
        name: date.toLocaleDateString('en-US', { month: 'long' }),
        short: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        longLabel: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        year: date.getFullYear(),
        current: index === 0,
      };
    });
    // Recomputed on open so a sheet left mounted across midnight on the 1st
    // still lists the current month.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const monthTotals = useMemo(() => {
    const totals = {};
    transactions.forEach((item) => {
      const key = monthKeyOf(dateOf(item));
      const entry = totals[key] || (totals[key] = { count: 0, earned: 0, spent: 0 });
      const amount = Number(item.amount) || 0;
      entry.count += 1;
      if (item.type === 'Income') entry.earned += amount;
      else entry.spent += amount;
    });
    return totals;
  }, [transactions]);

  // Only months inside the 12-month window that actually have entries,
  // split under year headings (e.g. 2026 then 2025).
  const activeMonths = useMemo(() => months
    .filter((month) => monthTotals[month.key])
    .map((month) => ({ ...month, stats: monthTotals[month.key] })), [months, monthTotals]);

  const years = useMemo(() => {
    const groups = [];
    activeMonths.forEach((month) => {
      const last = groups[groups.length - 1];
      if (last && last.year === month.year) last.months.push(month);
      else groups.push({ year: month.year, months: [month] });
    });
    return groups;
  }, [activeMonths]);

  const yearTotals = useMemo(() => activeMonths.reduce((sum, { stats }) => (
    { count: sum.count + stats.count, earned: sum.earned + stats.earned, spent: sum.spent + stats.spent }
  ), { count: 0, earned: 0, spent: 0 }), [activeMonths]);

  // Resolved against the whole window, not just active months, so deleting a
  // month's last entry shows its empty state instead of jumping to the list.
  const selected = months.find((month) => month.key === selectedKey) || null;
  const openMonth = (key) => {
    setSearch('');
    setSelectedKey(key);
  };
  const showMonths = () => {
    setSearch('');
    setSelectedKey(null);
  };

  const { sections, spent, earned, count } = useMemo(() => {
    if (!selected) return { sections: [], spent: 0, earned: 0, count: 0 };
    const query = search.trim().toLowerCase();
    const list = transactions
      .filter((item) => monthKeyOf(dateOf(item)) === selected.key)
      .filter((item) => !query || `${item.note} ${item.category} ${item.type} ${item.amount}`.toLowerCase().includes(query))
      .sort((a, b) => dateOf(b) - dateOf(a));

    const groups = [];
    list.forEach((item) => {
      const key = dateOf(item).toDateString();
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.data.push(item);
      else groups.push({ key, title: formatDayLabel(dateOf(item)), data: [item] });
    });

    return {
      sections: groups,
      count: list.length,
      spent: list.filter((item) => item.type !== 'Income').reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
      earned: list.filter((item) => item.type === 'Income').reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    };
  }, [transactions, selected, search]);

  const remove = (item, afterDelete) => {
    if (!onRemove) return;
    confirmAction({
      title: 'Delete transaction?',
      message: `Delete ${item.note || item.category || 'this transaction'} permanently?`,
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: () => { onRemove(item.id); afterDelete?.(); },
    });
  };

  const save = (entry) => {
    const result = onUpdate(editing.id, entry);
    if (result.ok) setEditing(null);
    else showNotice('Unable to save changes', result.message);
  };

  return (
    <Sheet
      visible={visible}
      onClose={selected ? showMonths : onClose}
      closeIcon={selected ? 'arrow-back' : 'chevron-down'}
      title={selected ? selected.longLabel : 'Transactions'}
      subtitle={selected || !years.length ? null : 'Pick a month'}
    >
      {selected ? (
        <View style={styles.body}>
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder={`Search ${selected.name}`}
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
            icon={<Ionicons name="search" size={18} color={colors.textMuted} />}
            containerStyle={styles.search}
          />

          {/* Search stays pinned while the list scrolls — nesting the list in
              a ScrollView would break its virtualisation. */}
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            ListHeaderComponent={(
              <SummaryCard
                eyebrow={`${selected.longLabel}${search.trim() ? ' · filtered' : ''}`}
                count={count}
                earned={earned}
                spent={spent}
              />
            )}
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            ListEmptyComponent={(
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Ionicons name={search.trim() ? 'search-outline' : 'receipt-outline'} size={22} color={colors.textSoft} />
                </View>
                <Text style={styles.emptyTitle}>{search.trim() ? 'No matches' : 'Nothing here yet'}</Text>
                <Text style={styles.emptyCopy}>
                  {search.trim() ? `Nothing matches “${search.trim()}” in ${selected.longLabel}.` : `No transactions in ${selected.longLabel}.`}
                </Text>
              </View>
            )}
            renderSectionHeader={({ section }) => <Text style={styles.groupTitle}>{section.title}</Text>}
            renderItem={({ item, index, section }) => {
              const isIncome = item.type === 'Income';
              const first = index === 0;
              const last = index === section.data.length - 1;
              const detail = [item.note && item.category ? item.note : null, dateOf(item).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), item.recurring ? describeInterval(item.repeatInterval) : null].filter(Boolean).join(' · ');
              return (
                <View style={[styles.rowCard, first && styles.rowCardFirst, last && styles.rowCardLast]}>
                  <ListRow
                    icon={<Ionicons name={categoryIcon(item.category)} />}
                    iconColor={isIncome ? colors.positive : colors.textSoft}
                    iconBg={isIncome ? colors.positiveDim : colors.glass}
                    title={item.category || item.note || (isIncome ? 'Income' : 'Expense')}
                    subtitle={detail}
                    right={<Text style={[styles.rowAmount, isIncome && styles.rowAmountIncome]}>{isIncome ? '+' : '−'}{formatMoney(item.amount)}</Text>}
                    onPress={editable ? () => setEditing(item) : undefined}
                    onLongPress={onRemove ? () => remove(item) : undefined}
                    showDivider={!last}
                  />
                </View>
              );
            }}
            ListFooterComponent={count > 0 && editable ? <Text style={styles.hint}>Tap to edit · hold to delete</Text> : null}
          />
        </View>
      ) : (
        <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
          {years.length ? (
            <SummaryCard eyebrow="Past 12 months" count={yearTotals.count} earned={yearTotals.earned} spent={yearTotals.spent} />
          ) : (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="receipt-outline" size={22} color={colors.textSoft} />
              </View>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptyCopy}>Anything you add shows up here, grouped by month, for the last 12 months.</Text>
            </View>
          )}
          {years.map((group) => (
            <View key={group.year}>
              <Text style={styles.groupTitle}>{group.year}</Text>
              <View style={styles.monthCard}>
                {group.months.map((month, index) => {
                  const monthNet = month.stats.earned - month.stats.spent;
                  return (
                    <ListRow
                      key={month.key}
                      left={(
                        <View style={[styles.monthBadge, month.current && styles.monthBadgeCurrent]}>
                          <Text style={[styles.monthBadgeText, month.current && styles.monthBadgeTextCurrent]}>{month.short}</Text>
                        </View>
                      )}
                      title={month.name}
                      subtitle={month.current ? `This month · ${entries(month.stats.count)}` : entries(month.stats.count)}
                      right={(
                        <>
                          <Text style={[styles.rowAmount, monthNet > 0 && styles.rowAmountIncome]}>{monthNet < 0 ? '−' : '+'}{formatMoney(monthNet)}</Text>
                          <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
                        </>
                      )}
                      onPress={() => openMonth(month.key)}
                      showDivider={index < group.months.length - 1}
                    />
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Rendered inside this sheet's modal so it presents on top of it. */}
      {editable ? (
        <TransactionFormModal
          visible={Boolean(editing)}
          transaction={editing}
          uid={uid}
          onClose={() => setEditing(null)}
          onSave={save}
          onDelete={onRemove ? (item) => remove(item, () => setEditing(null)) : undefined}
        />
      ) : null}
    </Sheet>
  );
}

function SummaryCard({ eyebrow, count, earned, spent }) {
  const net = earned - spent;
  return (
    <GradientCard tone="ember" radius={radius.xl} style={styles.summary} contentStyle={styles.summaryContent}>
      <Text style={styles.summaryEyebrow}>{eyebrow}</Text>
      <Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
        {net < 0 ? '−' : '+'}{formatMoney(net)}
      </Text>
      <Text style={styles.summaryCaption}>Net across {entries(count)}</Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryStat}>
          <View style={[styles.statDot, { backgroundColor: colors.positive }]} />
          <Text style={styles.statLabel}>In</Text>
          <Text style={styles.statValue} numberOfLines={1}>{formatMoney(earned)}</Text>
        </View>
        <View style={styles.summaryStat}>
          <View style={[styles.statDot, { backgroundColor: colors.negative }]} />
          <Text style={styles.statLabel}>Out</Text>
          <Text style={styles.statValue} numberOfLines={1}>{formatMoney(spent)}</Text>
        </View>
      </View>
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: GUTTER },
  search: { marginBottom: 12 },
  summary: { marginBottom: 6 },
  summaryContent: { padding: 22 },
  summaryEyebrow: { ...type.overline, color: colors.textSoft, marginBottom: 8 },
  summaryValue: { ...type.display, fontSize: 36, lineHeight: 42, color: colors.text },
  summaryCaption: { ...type.overline, color: colors.textSoft, marginTop: 2 },
  summaryRow: { flexDirection: 'row', gap: 8, marginTop: 18 },
  summaryStat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7, height: 38, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.28)' },
  statDot: { width: 7, height: 7, borderRadius: 4 },
  statLabel: { ...type.label, fontSize: 13, color: colors.textSoft },
  statValue: { ...type.numeric, fontSize: 14, color: colors.text, flex: 1, textAlign: 'right' },
  groupTitle: { ...type.label, color: colors.textMuted, marginTop: 18, marginBottom: 8, paddingHorizontal: 4 },
  monthCard: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 4 },
  monthBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center' },
  monthBadgeCurrent: { backgroundColor: colors.accent },
  monthBadgeText: { ...type.label, fontSize: 11, letterSpacing: 0.6, color: colors.textSoft },
  monthBadgeTextCurrent: { color: colors.accentText },
  rowCard: { backgroundColor: colors.surface, paddingHorizontal: 16 },
  rowCardFirst: { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingTop: 4 },
  rowCardLast: { borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg, paddingBottom: 4 },
  rowAmount: { ...type.numeric, fontSize: 15, color: colors.text },
  rowAmountIncome: { color: colors.positive },
  empty: { alignItems: 'center', marginTop: 12, paddingVertical: 32, paddingHorizontal: 24, borderRadius: radius.lg, backgroundColor: colors.surface },
  emptyIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { ...type.heading, color: colors.text, marginTop: 14, marginBottom: 6 },
  emptyCopy: { ...type.body, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  hint: { ...type.caption, color: colors.textFaint, textAlign: 'center', marginTop: 14 },
});
