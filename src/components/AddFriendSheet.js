import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, GUTTER, radius, type } from '../theme';
import AnimalAvatar from './avatars/AnimalAvatar';
import { avatarForFriend, createFriend, loadFriends, saveFriends } from '../lib/friends';
import Button from './Button';
import GradientCard from './GradientCard';
import Input from './Input';
import Sheet from './Sheet';

export default function AddFriendSheet({ visible, uid, onClose, onAdded }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Start each opening with an empty field (reset during render, not in an
  // effect, so the stale name never flashes).
  const [wasVisible, setWasVisible] = useState(visible);
  if (wasVisible !== visible) {
    setWasVisible(visible);
    if (visible) {
      setName('');
      setError('');
      setSaving(false);
    }
  }

  const trimmed = name.trim();

  const save = async () => {
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const existing = await loadFriends(uid);
      // Two friends with the same name are indistinguishable in every list.
      if (existing.some((friend) => friend.name.toLowerCase() === trimmed.toLowerCase())) {
        setError(`${trimmed} is already on your list.`);
        setSaving(false);
        return;
      }
      await saveFriends(uid, [...existing, createFriend(trimmed)]);
      onAdded();
    } catch (_error) {
      setError('Could not save to this device. Try again.');
      setSaving(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Add friend" closeIcon="close">
      <View style={styles.content}>
        <GradientCard tone="dawn" radius={radius.xl} contentStyle={styles.previewContent}>
          <View style={styles.avatarRing}>
            <AnimalAvatar avatarId={avatarForFriend(trimmed || 'friend')} size={92} />
          </View>
          <Text style={styles.previewName} numberOfLines={1}>{trimmed || 'New friend'}</Text>
          <Text style={styles.previewCopy}>Their animal is picked from their name.</Text>
        </GradientCard>

        <Text style={styles.fieldLabel}>Name</Text>
        <Input
          value={name}
          onChangeText={(text) => { setName(text); setError(''); }}
          placeholder="e.g. Sam"
          autoCapitalize="words"
          autoFocus
          maxLength={40}
          onSubmitEditing={save}
          returnKeyType="done"
          icon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button onPress={save} label="Add friend" icon={<Ionicons name="person-add" size={18} color={colors.pillText} />} disabled={!trimmed || saving} style={styles.saveButton} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: GUTTER, paddingTop: 4 },
  previewContent: { alignItems: 'center', paddingVertical: 26 },
  avatarRing: { width: 108, height: 108, borderRadius: 54, backgroundColor: 'rgba(255,255,255,0.85)', justifyContent: 'center', alignItems: 'center' },
  previewName: { ...type.title, color: '#FFFFFF', marginTop: 16, maxWidth: '90%' },
  previewCopy: { ...type.overline, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  fieldLabel: { ...type.label, color: colors.textSoft, marginTop: 24, marginBottom: 10, paddingHorizontal: 4 },
  error: { ...type.caption, color: colors.negative, marginTop: -6, marginBottom: 12, paddingHorizontal: 4 },
  saveButton: { alignSelf: 'stretch', marginTop: 4 },
});
