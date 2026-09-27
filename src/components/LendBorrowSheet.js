import React, { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, GUTTER, radius, scrim, SECTION_GAP, type } from '../theme';
import AnimalAvatar from './avatars/AnimalAvatar';
import { avatarForFriend, createFriend, getFriendBalance, loadFriends, loadLedger, saveFriends, saveLedger } from '../lib/friends';
import { formatMoney, parseAmount } from '../lib/format';
import useKeyboardOverlap from '../lib/useKeyboardOverlap';
import { showNotice } from '../lib/confirm';
import Button from './Button';
import Input from './Input';
import AmountField from './AmountField';
import Chip from './Chip';
import GradientCard from './GradientCard';
import SegmentedControl from './SegmentedControl';
import Sheet from './Sheet';

// The friend picker shows about four and a half rows, so the cut-off row
// hints that the list scrolls.
const FRIEND_ROW_HEIGHT = 60;
const FRIEND_LIST_PADDING = 6;
const FRIEND_LIST_MAX_HEIGHT = FRIEND_ROW_HEIGHT * 4.5 + FRIEND_LIST_PADDING;

const DIRECTIONS = [
  { key: 'lend', label: 'I lent', icon: 'arrow-up' },
  { key: 'borrow', label: 'I borrowed', icon: 'arrow-down' },
];

// Handles both flows: lending/borrowing with an existing friend, or adding a
// brand-new friend right in the middle of recording money — the new friend
// is persisted immediately so it sticks even if the entry itself is cancelled.
// `ledger` is only used to show each friend's balance in the picker.
export default function LendBorrowSheet({ visible, uid, friends = [], ledger = [], presetFriend = null, onClose, onSaved }) {
  const insets = useSafeAreaInsets();
  const containerRef = useRef(null);
  const [keyboardOverlap, onContainerLayout] = useKeyboardOverlap(containerRef);
  const scrollRef = useRef(null);
  const friendListRef = useRef(null);
  const [localFriends, setLocalFriends] = useState(friends);
  const [selectedId, setSelectedId] = useState(presetFriend?.id || null);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [direction, setDirection] = useState('lend');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  // Reset the form each time the sheet opens. Keyed on `visible` alone: the
  // `friends` default is a fresh [] every render, so depending on it would
  // wipe whatever the user was typing whenever the parent re-rendered.
  const [wasVisible, setWasVisible] = useState(visible);
  if (wasVisible !== visible) {
    setWasVisible(visible);
    if (visible) {
      setLocalFriends(friends);
      setSelectedId(presetFriend?.id || null);
      setAddingNew(friends.length === 0 && !presetFriend);
      setNewName('');
      setDirection('lend');
      setAmount('');
      setNote('');
      setSaving(false);
    }
  }

  // Alphabetical, so a long list can be scanned for a name.
  const sortedFriends = useMemo(
    () => [...localFriends].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
    [localFriends],
  );

  const selectedFriend = presetFriend || localFriends.find((item) => item.id === selectedId) || null;
  const numericAmount = parseAmount(amount);
  const canSave = Boolean(selectedFriend) && numericAmount > 0 && !saving;
  const isLend = direction === 'lend';

  const addNewFriend = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const existing = localFriends.find((item) => item.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      setSelectedId(existing.id);
      setAddingNew(false);
      setNewName('');
      return;
    }
    const friend = createFriend(trimmed);
    try {
      // Merge with what's stored rather than the snapshot taken on open, so
      // a friend added elsewhere in the meantime isn't overwritten.
      const stored = await loadFriends(uid);
      await saveFriends(uid, [...stored.filter((item) => item.id !== friend.id), friend]);
    } catch (_error) {
      showNotice('Friend not saved', 'Your device storage could not be written. Try again.');
      return;
    }
    setLocalFriends((list) => [...list, friend]);
    setSelectedId(friend.id);
    setAddingNew(false);
    setNewName('');
    // Bring the new, now-selected friend into view in the picker.
    const index = [...sortedFriends, friend]
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
      .findIndex((item) => item.id === friend.id);
    setTimeout(() => friendListRef.current?.scrollTo({ y: Math.max(0, (index - 1) * FRIEND_ROW_HEIGHT), animated: true }), 60);
  };

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const entries = await loadLedger(uid);
      const entry = {
        id: `ledger-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        friendId: selectedFriend.id,
        type: direction,
        amount: numericAmount,
        note: note.trim(),
        date: new Date().toISOString(),
      };
      await saveLedger(uid, [entry, ...entries]);
      onSaved();
    } catch (_error) {
      setSaving(false);
      showNotice('Not saved', 'Your device storage could not be written. Try again.');
    }
  };

  const keyboardOpen = keyboardOverlap > 0;
  const saveBottom = keyboardOpen ? keyboardOverlap + 12 : insets.bottom + 16;
  const title = presetFriend ? `With ${presetFriend.name}` : 'Lend or borrow';

  return (
    <Sheet visible={visible} onClose={onClose} title={title} closeIcon="close" glow={isLend ? 'green' : 'rose'}>
      <View ref={containerRef} onLayout={onContainerLayout} style={styles.flex}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.content, { paddingBottom: saveBottom + 56 + SECTION_GAP }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          <GradientCard tone={isLend ? 'meadow' : 'rose'} radius={radius.xl} contentStyle={styles.heroContent}>
            <SegmentedControl options={DIRECTIONS} value={direction} onChange={setDirection} variant="glass" style={styles.segment} />
            <Text style={styles.prompt}>{isLend ? 'How much did you lend?' : 'How much did you borrow?'}</Text>
            <AmountField label={null} value={amount} onChangeText={setAmount} fontSize={56} accessibilityLabel="Amount" />
            <Text style={styles.heroHint}>
              {selectedFriend
                ? isLend ? `${selectedFriend.name} will owe you this` : `You will owe ${selectedFriend.name} this`
                : 'Pick a friend below'}
            </Text>
          </GradientCard>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleInline}>{presetFriend ? 'Friend' : 'Choose a friend'}</Text>
            {!presetFriend && localFriends.length > 0 ? (
              <Chip label="New" icon={addingNew ? 'close' : 'add'} selected={addingNew} onPress={() => setAddingNew((open) => !open)} accessibilityLabel={addingNew ? 'Cancel new friend' : 'New friend'} />
            ) : null}
          </View>
          {presetFriend ? (
            <View style={styles.presetRow}>
              <View style={styles.presetAvatar}>
                <AnimalAvatar avatarId={avatarForFriend(presetFriend.name)} size={34} />
              </View>
              <Text style={styles.presetName}>{presetFriend.name}</Text>
            </View>
          ) : (
            <>
              {addingNew && (
                <View style={styles.newFriendRow}>
                  <Input
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Friend's name"
                    autoCapitalize="words"
                    maxLength={40}
                    containerStyle={styles.newFriendInput}
                    onSubmitEditing={addNewFriend}
                    returnKeyType="done"
                  />
                  <Button onPress={addNewFriend} label="Add" size="md" disabled={!newName.trim()} style={styles.newFriendButton} />
                </View>
              )}
              {sortedFriends.length > 0 ? (
                <View style={styles.friendList} accessibilityRole="radiogroup">
                  {/* nestedScrollEnabled lets Android scroll this list inside
                      the sheet's own ScrollView. */}
                  <ScrollView
                    ref={friendListRef}
                    style={{ maxHeight: FRIEND_LIST_MAX_HEIGHT }}
                    contentContainerStyle={styles.friendListContent}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {sortedFriends.map((item) => (
                      <FriendOption
                        key={item.id}
                        friend={item}
                        balance={getFriendBalance(ledger, item.id)}
                        selected={selectedId === item.id}
                        onPress={() => setSelectedId(item.id)}
                      />
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </>
          )}

          <Text style={styles.sectionTitle}>Note</Text>
          <Input
            value={note}
            onChangeText={setNote}
            placeholder="What was it for? (optional)"
            maxLength={120}
            returnKeyType="done"
            icon={<Ionicons name="create-outline" size={18} color={colors.textMuted} />}
            onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 350)}
          />
        </ScrollView>

        <LinearGradient colors={scrim.colors} locations={scrim.locations} style={[styles.bottomScrim, { height: saveBottom + 96 }]} pointerEvents="none" />
        <Button
          onPress={save}
          label={isLend ? 'Save as lent' : 'Save as borrowed'}
          icon={<Ionicons name="checkmark" size={20} color={colors.pillText} />}
          disabled={!canSave}
          style={[styles.saveButton, { bottom: saveBottom }]}
        />
      </View>
    </Sheet>
  );
}

function FriendOption({ friend, balance, selected, onPress }) {
  const status = balance === 0 ? 'All square' : balance > 0 ? `Owes you ${formatMoney(balance)}` : `You owe ${formatMoney(balance)}`;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${friend.name}, ${status}`}
      style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && !selected && styles.optionPressed]}
    >
      <View style={[styles.optionAvatar, selected && styles.optionAvatarSelected]}>
        <AnimalAvatar avatarId={avatarForFriend(friend.name)} size={30} />
      </View>
      <View style={styles.optionText}>
        <Text numberOfLines={1} style={styles.optionName}>{friend.name}</Text>
        <Text numberOfLines={1} style={[styles.optionStatus, balance > 0 && styles.optionStatusOwed, balance < 0 && styles.optionStatusOwe]}>{status}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <Ionicons name="checkmark" size={15} color={colors.accentText} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: GUTTER, paddingTop: 4 },
  heroContent: { alignItems: 'center', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 22 },
  segment: { alignSelf: 'stretch', marginBottom: 22 },
  prompt: { ...type.heading, fontSize: 17, color: colors.textSoft, marginBottom: 4 },
  heroHint: { ...type.overline, color: colors.textSoft, marginTop: 14 },
  sectionTitle: { ...type.heading, color: colors.text, marginTop: SECTION_GAP, marginBottom: 12, paddingHorizontal: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 38, marginTop: SECTION_GAP, marginBottom: 12, paddingLeft: 4 },
  sectionTitleInline: { ...type.heading, color: colors.text },
  friendList: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  friendListContent: { padding: FRIEND_LIST_PADDING / 2 },
  option: { flexDirection: 'row', alignItems: 'center', height: FRIEND_ROW_HEIGHT, paddingHorizontal: 10, borderRadius: radius.md },
  optionSelected: { backgroundColor: colors.glass },
  optionPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  optionAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center' },
  optionAvatarSelected: { backgroundColor: colors.accent },
  optionText: { flex: 1, minWidth: 0, marginLeft: 12, marginRight: 10 },
  optionName: { ...type.label, fontSize: 15, color: colors.text },
  optionStatus: { ...type.caption, fontSize: 13, color: colors.textMuted, marginTop: 3 },
  optionStatusOwed: { color: colors.positive },
  optionStatusOwe: { color: colors.negative },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  newFriendRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  newFriendInput: { flex: 1, marginBottom: 0 },
  newFriendButton: { width: 84 },
  presetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: 14, height: 62 },
  presetAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  presetName: { ...type.label, fontSize: 16, color: colors.text },
  bottomScrim: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  saveButton: { position: 'absolute', left: GUTTER, right: GUTTER },
});
