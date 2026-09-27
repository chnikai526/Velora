import React, { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import AnimalAvatar, { AVATARS } from './avatars/AnimalAvatar';
import { colors, GUTTER, radius, scrim, SECTION_GAP, type } from '../theme';
import useKeyboardOverlap from '../lib/useKeyboardOverlap';
import Button from './Button';
import GradientCard from './GradientCard';
import Input from './Input';
import Sheet from './Sheet';
import { useDatePicker } from './DatePicker';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const DEFAULT_DOB = new Date(2000, 0, 1, 12);

const fields = ({ name, email, dateOfBirth, avatarId }) => JSON.stringify({ name: name?.trim(), email: email?.trim(), dateOfBirth: dateOfBirth || null, avatarId });

export default function EditProfileSheet({ visible, profile, onClose, onSave }) {
  const insets = useSafeAreaInsets();
  const containerRef = useRef(null);
  const [keyboardOverlap, onContainerLayout] = useKeyboardOverlap(containerRef);
  const datePicker = useDatePicker();
  const [draft, setDraft] = useState(profile);
  const [emailError, setEmailError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const scale = useSharedValue(1);

  // Re-seed from the saved profile every time the sheet opens (during render,
  // so the first frame is already correct; Modal's onShow fired after the
  // sheet was visible, flashing the previous draft).
  const [wasVisible, setWasVisible] = useState(visible);
  if (wasVisible !== visible) {
    setWasVisible(visible);
    if (visible) {
      setDraft(profile);
      setEmailError(false);
      setNameError(false);
    }
  }

  const changed = useMemo(() => fields(draft) !== fields(profile), [draft, profile]);
  const emailChanged = (draft.email || '').trim() !== (profile.email || '').trim();
  const avatarStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const chooseAvatar = (avatarId) => {
    setDraft((current) => ({ ...current, avatarId }));
    scale.set(withSequence(withTiming(0.92, { duration: 0 }), withSpring(1, { damping: 11, stiffness: 180 })));
  };

  const save = () => {
    const name = (draft.name || '').trim();
    const email = (draft.email || '').trim();
    if (!name) {
      setNameError(true);
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setEmailError(true);
      return;
    }
    onSave({ ...draft, name, email });
  };

  const dob = draft.dateOfBirth ? new Date(draft.dateOfBirth) : null;
  const dobValid = dob && !Number.isNaN(dob.getTime());

  const openDob = () => datePicker.open({
    value: dobValid ? dob : DEFAULT_DOB,
    mode: 'date',
    display: 'spinner',
    title: 'Date of birth',
    maximumDate: new Date(),
    minimumDate: new Date(1900, 0, 1),
    onPick: (date) => {
      // Stored at local noon so no time zone can shift it to another day.
      const noon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
      setDraft((current) => ({ ...current, dateOfBirth: noon.toISOString() }));
    },
  });

  const keyboardOpen = keyboardOverlap > 0;
  const saveBottom = keyboardOpen ? keyboardOverlap + 12 : insets.bottom + 16;

  return (
    <Sheet visible={visible} onClose={onClose} title="Edit profile" closeIcon="close">
      <View ref={containerRef} onLayout={onContainerLayout} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: saveBottom + 56 + SECTION_GAP }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          <GradientCard tone="halo" radius={radius.xl} contentStyle={styles.heroContent}>
            <Animated.View style={[styles.preview, avatarStyle]}>
              <AnimalAvatar avatarId={draft.avatarId} size={104} />
            </Animated.View>
            <Text style={styles.heroName} numberOfLines={1}>{(draft.name || '').trim() || 'Your name'}</Text>
            <Text style={styles.heroCaption}>Pick an animal below</Text>
          </GradientCard>

          <View style={styles.grid}>
            {AVATARS.map((avatar) => {
              const selected = draft.avatarId === avatar.id;
              return (
                <Pressable
                  key={avatar.id}
                  onPress={() => chooseAvatar(avatar.id)}
                  accessibilityRole="button"
                  accessibilityLabel={avatar.label}
                  accessibilityState={{ selected }}
                  style={[styles.avatarChoice, selected && styles.avatarSelected]}
                >
                  <AnimalAvatar avatarId={avatar.id} size={52} />
                  {selected && <View style={styles.check}><Ionicons name="checkmark" color={colors.accentText} size={12} /></View>}
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Name</Text>
          <Input
            value={draft.name}
            onChangeText={(name) => { setDraft((current) => ({ ...current, name })); setNameError(false); }}
            placeholder="Enter your name"
            autoCapitalize="words"
            maxLength={40}
            icon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />}
            containerStyle={nameError && styles.errorInput}
          />
          {nameError && <Text style={styles.error}>Enter a name to continue.</Text>}

          <Text style={styles.label}>Date of birth</Text>
          <Pressable onPress={openDob} accessibilityRole="button" accessibilityLabel="Date of birth" style={({ pressed }) => [styles.dateField, pressed && styles.pressed]}>
            <Ionicons name="calendar-outline" color={colors.textMuted} size={18} />
            <Text style={[styles.dateText, !dobValid && styles.datePlaceholder]}>
              {dobValid ? dob.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Add your birthday'}
            </Text>
            <Ionicons name="chevron-forward" color={colors.textFaint} size={16} />
          </Pressable>

          <Text style={styles.label}>Email</Text>
          <Input
            value={draft.email}
            onChangeText={(email) => { setDraft((current) => ({ ...current, email })); setEmailError(false); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Enter your email"
            icon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
            containerStyle={emailError && styles.errorInput}
          />
          {emailError ? (
            <Text style={styles.error}>Enter a valid email address.</Text>
          ) : emailChanged ? (
            <Text style={styles.note}>We’ll email a confirmation link to the new address. Sign-in keeps using your current email until you open it.</Text>
          ) : null}
        </ScrollView>

        <LinearGradient colors={scrim.colors} locations={scrim.locations} style={[styles.bottomScrim, { height: saveBottom + 96 }]} pointerEvents="none" />
        <Button
          onPress={save}
          disabled={!changed}
          label="Save changes"
          icon={<Ionicons name="checkmark" size={20} color={colors.pillText} />}
          style={[styles.saveButton, { bottom: saveBottom }]}
        />
      </View>
      {datePicker.panel}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: GUTTER, paddingTop: 4 },
  heroContent: { alignItems: 'center', paddingTop: 24, paddingBottom: 22 },
  preview: { width: 116, height: 116, borderRadius: 58, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
  heroName: { ...type.title, color: colors.text, marginTop: 14, maxWidth: '90%' },
  heroCaption: { ...type.overline, color: colors.textSoft, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginTop: 8, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14 },
  avatarChoice: { width: '18%', aspectRatio: 1, borderRadius: 999, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  avatarSelected: { borderColor: colors.accent },
  check: { position: 'absolute', right: -2, bottom: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
  label: { ...type.label, color: colors.textSoft, marginTop: 10, marginBottom: 10, paddingHorizontal: 4 },
  dateField: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: radius.md, paddingHorizontal: 18, height: 54, marginBottom: 14 },
  pressed: { opacity: 0.8 },
  dateText: { ...type.body, color: colors.text, flex: 1 },
  datePlaceholder: { color: colors.textFaint },
  errorInput: { borderColor: colors.negative },
  error: { ...type.caption, color: colors.negative, marginTop: -8, marginBottom: 14, paddingHorizontal: 4 },
  note: { ...type.caption, lineHeight: 17, color: colors.textMuted, marginTop: -6, marginBottom: 14, paddingHorizontal: 4 },
  bottomScrim: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  saveButton: { position: 'absolute', left: GUTTER, right: GUTTER },
});
