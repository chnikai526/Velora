import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CARD_GAP, colors, GUTTER, radius, SECTION_GAP, tabBarClearance, type } from '../theme';
import AnimalAvatar from '../components/avatars/AnimalAvatar';
import GradientCard from '../components/GradientCard';
import MetricCard from '../components/MetricCard';
import PillButton from '../components/PillButton';
import IconButton from '../components/IconButton';
import AddFriendSheet from '../components/AddFriendSheet';
import LendBorrowSheet from '../components/LendBorrowSheet';
import FriendDetailSheet from '../components/FriendDetailSheet';
import { avatarForFriend, getFriendBalance, getTotals, loadFriends, loadLedger } from '../lib/friends';
import { formatMoney } from '../lib/format';
import { loadProfile } from '../lib/profile';

// One-line summary for the intro card, split into bright and muted parts.
const headlineFor = (totals, friendCount) => {
  if (friendCount === 0) return [['add a friend ', true], ['to start tracking money you lend or borrow.', false]];
  if (!totals.owedToYou && !totals.youOwe) return [['you are ', false], ['all settled up ', true], ['with everyone.', false]];
  const parts = [];
  if (totals.owedToYou) parts.push([`${formatMoney(totals.owedToYou)} `, true], ['is owed to you', false]);
  if (totals.owedToYou && totals.youOwe) parts.push([' and ', false]);
  if (totals.youOwe) parts.push(['you owe ', false], [formatMoney(totals.youOwe), true]);
  parts.push(['.', false]);
  return parts;
};

export default function FriendsScreen({ currentUser }) {
  const uid = currentUser?.uid;
  const insets = useSafeAreaInsets();
  const tabClearance = tabBarClearance(insets.bottom);
  const bottomPadding = tabClearance + SECTION_GAP;
  const [friends, setFriends] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [profileName, setProfileName] = useState('');
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [lendBorrowOpen, setLendBorrowOpen] = useState(false);
  const [activeFriend, setActiveFriend] = useState(null);
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  const refresh = useCallback(() => {
    let active = true;
    Promise.all([loadFriends(uid), loadLedger(uid), loadProfile(uid)]).then(([nextFriends, nextLedger, profile]) => {
      if (!active) return;
      setFriends(nextFriends);
      setLedger(nextLedger);
      setProfileName(profile?.name?.trim() || '');
    });
    return () => { active = false; };
  }, [uid]);

  useFocusEffect(refresh);

  const totals = useMemo(() => getTotals(friends, ledger), [friends, ledger]);
  const firstName = (profileName || currentUser?.displayName || '').trim().split(/\s+/)[0];
  const headline = headlineFor(totals, friends.length);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView ref={scrollRef} contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <View style={styles.header}>
            <IconButton onPress={() => setLendBorrowOpen(true)} icon={<Ionicons name="swap-vertical" size={18} color={colors.text} />} accessibilityLabel="Lend or borrow" />
            <Text style={styles.title}>Friends{'\n'}and balances</Text>
            <IconButton onPress={() => setAddFriendOpen(true)} icon={<Ionicons name="person-add-outline" size={18} color={colors.text} />} accessibilityLabel="Add friend" />
          </View>

          <View style={styles.message}>
            <Text style={styles.headline}>
              <Text style={styles.headlineBright}>{firstName ? `${firstName}, ` : ''}</Text>
              {headline.map(([text, bright], index) => (
                <Text key={index} style={bright ? styles.headlineBright : styles.headlineMuted}>{text}</Text>
              ))}
            </Text>
            <Text style={styles.body}>Record money you lend or borrow, then settle up when you are square. Balances stay on this device.</Text>
            <PillButton label="Lend or borrow" onPress={() => setLendBorrowOpen(true)} style={styles.introAction} />
          </View>
        </View>

        <View style={styles.tiles}>
          <GradientCard tone="dawn" style={styles.tile} contentStyle={styles.tileContent}>
            <Text style={styles.tileTitle}>Owed{'\n'}to you</Text>
            <PillButton label={formatMoney(totals.owedToYou)} icon="arrow-down" />
          </GradientCard>
          <GradientCard tone="dusk" style={styles.tile} contentStyle={styles.tileContent}>
            <Text style={styles.tileTitle}>You{'\n'}owe</Text>
            <PillButton label={formatMoney(totals.youOwe)} icon="arrow-up" />
          </GradientCard>
        </View>

        <Text style={styles.sectionTitle}>Your friends</Text>
        {friends.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="people-outline" size={22} color={colors.textSoft} />
            </View>
            <Text style={styles.emptyTitle}>No friends yet</Text>
            <Text style={styles.emptyCopy}>Add a friend to start tracking money you lend or borrow.</Text>
          </View>
        ) : (
          <View style={styles.stack}>
            {friends.map((friend) => {
              const balance = getFriendBalance(ledger, friend.id);
              const pill = balance === 0
                ? { label: 'Settled', tone: 'gold' }
                : balance > 0 ? { label: 'Owes you', tone: 'green' } : { label: 'You owe', tone: 'pink' };
              return (
                <MetricCard
                  key={friend.id}
                  leading={<AnimalAvatar avatarId={avatarForFriend(friend.name)} size={30} />}
                  label={friend.name}
                  pill={pill}
                  value={balance === 0 ? 'All square' : formatMoney(balance)}
                  valueColor={balance === 0 ? colors.textSoft : balance > 0 ? colors.positive : colors.negative}
                  onPress={() => setActiveFriend(friend)}
                />
              );
            })}
          </View>
        )}
        {friends.length > 0 ? <Text style={styles.hint}>Tap a friend to see history or settle up</Text> : null}
      </ScrollView>
      <LinearGradient colors={['rgba(19,19,19,0)', colors.bg]} style={[styles.bottomScrim, { height: tabClearance + 36 }]} pointerEvents="none" />

      <AddFriendSheet
        visible={addFriendOpen}
        uid={uid}
        onClose={() => setAddFriendOpen(false)}
        onAdded={() => { setAddFriendOpen(false); refresh(); }}
      />
      <LendBorrowSheet
        visible={lendBorrowOpen}
        uid={uid}
        friends={friends}
        ledger={ledger}
        // The sheet can add a brand-new friend before the entry is
        // cancelled, so refresh on close as well as on save.
        onClose={() => { setLendBorrowOpen(false); refresh(); }}
        onSaved={() => { setLendBorrowOpen(false); refresh(); }}
      />
      <FriendDetailSheet
        visible={Boolean(activeFriend)}
        uid={uid}
        friend={activeFriend}
        ledger={ledger}
        onClose={() => setActiveFriend(null)}
        onChanged={refresh}
        onRemoved={() => { setActiveFriend(null); refresh(); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: GUTTER, paddingTop: 8 },

  introCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, marginBottom: CARD_GAP },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  title: { ...type.title, fontSize: 24, lineHeight: 27, color: colors.text, textAlign: 'center', flex: 1 },
  message: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: radius.lg, padding: 20 },
  headline: { ...type.title, fontSize: 24, lineHeight: 28 },
  headlineBright: { color: colors.text },
  headlineMuted: { color: '#B5A48C' },
  body: { ...type.body, color: colors.textMuted, marginTop: 14 },
  introAction: { marginTop: 18 },

  tiles: { flexDirection: 'row', gap: CARD_GAP, marginBottom: SECTION_GAP + 4 },
  tile: { flex: 1 },
  tileContent: { padding: 20, minHeight: 156, justifyContent: 'space-between' },
  tileTitle: { ...type.title, fontSize: 23, lineHeight: 26, color: '#FFFFFF' },

  sectionTitle: { ...type.heading, fontSize: 20, color: colors.text, marginBottom: 12, paddingHorizontal: 4 },
  stack: { gap: CARD_GAP },
  empty: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24, borderRadius: radius.lg, backgroundColor: colors.surface },
  emptyIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { ...type.heading, color: colors.text, marginTop: 14, marginBottom: 6 },
  emptyCopy: { ...type.body, color: colors.textMuted, textAlign: 'center' },
  hint: { ...type.caption, color: colors.textFaint, textAlign: 'center', marginTop: 12 },
  bottomScrim: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
