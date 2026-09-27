import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, GUTTER, radius, SECTION_GAP, type } from '../theme';
import AnimalAvatar from './avatars/AnimalAvatar';
import { avatarForFriend, getFriendBalance, loadFriends, loadLedger, saveFriends, saveLedger } from '../lib/friends';
import { formatLongDate, formatMoney } from '../lib/format';
import { confirmAction, showNotice } from '../lib/confirm';
import Button from './Button';
import Card from './Card';
import GradientCard from './GradientCard';
import ListRow from './ListRow';
import Sheet from './Sheet';
import LendBorrowSheet from './LendBorrowSheet';

// Settlement entries are stored as a lend/borrow that zeroes the balance;
// label them as such instead of "You borrowed $40 · Settled up".
const isSettlement = (entry) => entry.kind === 'settle' || entry.note === 'Settled up';

const describeEntry = (entry) => {
  if (isSettlement(entry)) return { title: entry.type === 'lend' ? 'You paid them back' : 'They paid you back', icon: 'checkmark-done' };
  return entry.type === 'lend' ? { title: 'You lent', icon: 'arrow-up' } : { title: 'You borrowed', icon: 'arrow-down' };
};

// `friend` toggles between an object and null as the sheet opens/closes, so
// every hook here must run unconditionally — the null-guard only wraps the
// rendered content, never a hook call.
export default function FriendDetailSheet({ visible, uid, friend, ledger, onClose, onChanged, onRemoved }) {
  const insets = useSafeAreaInsets();
  const [lendBorrowOpen, setLendBorrowOpen] = useState(false);
  // Keep showing the last friend while the sheet slides away — the parent
  // clears `friend` on close, which blanked the sheet mid-animation.
  const [shown, setShown] = useState(friend);
  if (friend && friend !== shown) setShown(friend);
  const current = friend || shown;

  const entries = useMemo(() => {
    if (!current) return [];
    return ledger.filter((item) => item.friendId === current.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [ledger, current]);

  const balance = current ? getFriendBalance(ledger, current.id) : 0;
  const tone = balance === 0 ? 'halo' : balance > 0 ? 'meadow' : 'rose';
  const statusTitle = balance === 0 ? 'All square' : balance > 0 ? 'Owes you' : 'You owe';

  const run = async (task) => {
    try {
      await task();
    } catch (_error) {
      showNotice('Not saved', 'Your device storage could not be written. Try again.');
    }
  };

  const removeEntry = (entry) => confirmAction({
    title: 'Delete entry?',
    message: 'This removes it from the ledger permanently.',
    confirmLabel: 'Delete',
    destructive: true,
    onConfirm: () => run(async () => {
      const all = await loadLedger(uid);
      await saveLedger(uid, all.filter((item) => item.id !== entry.id));
      onChanged();
    }),
  });

  const settleUp = () => {
    if (!current || balance === 0) return;
    confirmAction({
      title: 'Settle up?',
      message: balance > 0
        ? `Record that ${current.name} paid you back ${formatMoney(balance)}.`
        : `Record that you paid ${current.name} back ${formatMoney(balance)}.`,
      confirmLabel: 'Settle up',
      onConfirm: () => run(async () => {
        const all = await loadLedger(uid);
        const entry = {
          id: `ledger-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          friendId: current.id,
          type: balance > 0 ? 'borrow' : 'lend',
          kind: 'settle',
          amount: Math.abs(balance),
          note: 'Settled up',
          date: new Date().toISOString(),
        };
        await saveLedger(uid, [entry, ...all]);
        onChanged();
      }),
    });
  };

  const removeFriend = () => {
    if (!current) return;
    confirmAction({
      title: 'Remove friend?',
      message: `This deletes ${current.name} and their full history.`,
      confirmLabel: 'Remove',
      destructive: true,
      onConfirm: () => run(async () => {
        const [allFriends, allLedger] = await Promise.all([loadFriends(uid), loadLedger(uid)]);
        await Promise.all([
          saveFriends(uid, allFriends.filter((item) => item.id !== current.id)),
          saveLedger(uid, allLedger.filter((item) => item.friendId !== current.id)),
        ]);
        onRemoved();
      }),
    });
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={current?.name || 'Friend'} glow={balance < 0 ? 'rose' : balance > 0 ? 'green' : 'gold'}>
      {current ? (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
          <GradientCard tone={tone} radius={radius.xl} contentStyle={styles.heroContent}>
            <View style={styles.avatarRing}>
              <AnimalAvatar avatarId={avatarForFriend(current.name)} size={76} />
            </View>
            <Text style={styles.heroTitle}>{statusTitle}</Text>
            <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
              {balance === 0 ? '$0.00' : formatMoney(balance)}
            </Text>
            <Text style={styles.heroCaption}>
              {entries.length ? `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} · friends since ${formatLongDate(current.createdAt)}` : `Added ${formatLongDate(current.createdAt)}`}
            </Text>
          </GradientCard>

          <View style={styles.actionsRow}>
            <Button onPress={() => setLendBorrowOpen(true)} label="Lend / borrow" icon={<Ionicons name="swap-vertical" size={17} color={colors.pillText} />} size="md" style={styles.actionButton} />
            {balance !== 0 && (
              <Button onPress={settleUp} label="Settle up" icon={<Ionicons name="checkmark-done" size={17} color={colors.text} />} variant="secondary" size="md" style={styles.actionButton} />
            )}
          </View>

          <Text style={styles.sectionTitle}>History</Text>
          {entries.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No entries yet. Record money you lend or borrow with {current.name}.</Text>
            </View>
          ) : (
            <Card contentStyle={styles.historyCardContent}>
              {entries.map((entry, index) => {
                const { title, icon } = describeEntry(entry);
                const settle = isSettlement(entry);
                const tint = settle ? colors.accent : entry.type === 'lend' ? colors.positive : colors.negative;
                return (
                  <ListRow
                    key={entry.id}
                    icon={<Ionicons name={icon} />}
                    iconColor={tint}
                    iconBg={settle ? colors.accentDim : entry.type === 'lend' ? colors.positiveDim : colors.negativeDim}
                    title={title}
                    subtitle={[settle ? null : entry.note, formatLongDate(entry.date)].filter(Boolean).join(' · ')}
                    right={<Text style={[styles.entryAmount, { color: settle ? colors.textSoft : tint }]}>{entry.type === 'lend' ? '+' : '−'}{formatMoney(entry.amount)}</Text>}
                    onLongPress={() => removeEntry(entry)}
                    showDivider={index < entries.length - 1}
                  />
                );
              })}
            </Card>
          )}
          {entries.length > 0 && <Text style={styles.hint}>Hold an entry to delete it</Text>}

          <Button
            label="Remove friend"
            variant="danger"
            size="md"
            icon={<Ionicons name="person-remove-outline" size={17} color={colors.negative} />}
            onPress={removeFriend}
            style={styles.removeButton}
          />
        </ScrollView>
      ) : null}
      {current ? (
        <LendBorrowSheet
          visible={lendBorrowOpen}
          uid={uid}
          presetFriend={current}
          onClose={() => setLendBorrowOpen(false)}
          onSaved={() => { setLendBorrowOpen(false); onChanged(); }}
        />
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: GUTTER, paddingTop: 4 },
  heroContent: { alignItems: 'center', paddingTop: 24, paddingBottom: 22, paddingHorizontal: 20 },
  avatarRing: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroTitle: { ...type.heading, fontSize: 18, color: colors.textSoft },
  heroValue: { ...type.hero, fontSize: 52, lineHeight: 60, color: colors.text, alignSelf: 'stretch', textAlign: 'center' },
  heroCaption: { ...type.overline, color: colors.textSoft, marginTop: 6, textAlign: 'center' },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionButton: { flex: 1 },
  sectionTitle: { ...type.heading, color: colors.text, marginTop: SECTION_GAP, marginBottom: 12, paddingHorizontal: 4 },
  historyCardContent: { paddingVertical: 4, paddingHorizontal: 16 },
  empty: { borderRadius: radius.lg, backgroundColor: colors.surface, padding: 20 },
  emptyText: { ...type.body, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  entryAmount: { ...type.numeric, fontSize: 15 },
  hint: { ...type.caption, color: colors.textFaint, textAlign: 'center', marginTop: 14 },
  removeButton: { alignSelf: 'stretch', marginTop: SECTION_GAP },
});
