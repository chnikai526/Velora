import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut, updateEmail, updateProfile } from 'firebase/auth';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { primaryAuth } from '../lib/firebase';
import colors from '../theme/colors';
import AnimalAvatar from '../components/avatars/AnimalAvatar';
import EditProfileSheet from '../components/EditProfileSheet';

const formatCurrency = (value) => `$${value.toFixed(2)}`;

export default function ProfileScreen({
  currentUser,
  transactions,
}) {
  const expenseTransactions = transactions.filter((item) => item.type === 'Expense');
  const totalTracked = expenseTransactions.reduce((sum, item) => sum + item.amount, 0);
  const fallbackProfile = { name: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Velora member', email: currentUser?.email || '', dateOfBirth: '2000-01-01T00:00:00.000Z', avatarId: 'cat' };
  const [profile, setProfile] = useState(fallbackProfile);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const monthOptions = useMemo(() => Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}-${index}`,
      label: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date),
      year: date.getFullYear(),
      month: date.getMonth(),
    };
  }), []);
  const selectedPeriod = monthOptions[selectedMonth];
  const pastTransactions = expenseTransactions.filter((item) => {
    const date = new Date(item.date || item.createdAt);
    return date.getFullYear() === selectedPeriod.year && date.getMonth() === selectedPeriod.month;
  });

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will be sent back to the login screen.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(primaryAuth);
          } catch (_error) {
            Alert.alert(
              'Unable to log out',
              'Firebase could not end your session right now.'
            );
          }
        },
      },
    ]);
  };

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(`velora-profile-${currentUser?.uid || 'guest'}`).then((saved) => {
      if (active && saved) setProfile(JSON.parse(saved));
    }).catch(() => undefined);
    return () => { active = false; };
  }, [currentUser?.uid]);

  const saveProfile = async (nextProfile) => {
    const cleanProfile = { name: nextProfile.name, email: nextProfile.email, dateOfBirth: nextProfile.dateOfBirth, avatarId: nextProfile.avatarId };
    setProfile(cleanProfile);
    setEditing(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    await AsyncStorage.setItem(`velora-profile-${currentUser?.uid || 'guest'}`, JSON.stringify(cleanProfile));
    if (!currentUser) return;
    try {
      await updateProfile(currentUser, { displayName: cleanProfile.name });
      if (cleanProfile.email !== currentUser.email) await updateEmail(currentUser, cleanProfile.email);
    } catch (_error) {
      // The saved local profile remains current even if Firebase requires a recent sign-in.
    }
  };

  const name = profile.name || fallbackProfile.name;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <TouchableOpacity onPress={() => setEditing(true)} style={styles.avatar}><AnimalAvatar avatarId={profile.avatarId} size={54}/></TouchableOpacity>
          <TouchableOpacity onPress={() => setEditing(true)}><Text style={styles.heroTitle}>{name}</Text></TouchableOpacity>
          <Text style={styles.profileEmail}>{profile.email}</Text>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total entries</Text>
            <Text style={styles.metricValue}>{transactions.length}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Tracked amount</Text>
            <Text style={styles.metricValue}>{formatCurrency(totalTracked)}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthRow}>
            {monthOptions.map((item, index) => (
              <TouchableOpacity key={item.key} onPress={() => setSelectedMonth(index)} style={[styles.monthChip, selectedMonth === index && styles.monthChipActive]}>
                <Text style={[styles.monthChipText, selectedMonth === index && styles.monthChipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {pastTransactions.length === 0 ? (
            <Text style={styles.historyEmpty}>No transactions in {selectedPeriod.label}.</Text>
          ) : pastTransactions.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.historyIcon}><Text style={styles.historyIconText}>−</Text></View>
              <View style={styles.historyInfo}><Text style={styles.historyName}>{item.category || item.note || 'Expense'}</Text><Text style={styles.historyMeta}>{new Date(item.date || item.createdAt).toLocaleDateString()}</Text></View>
              <Text style={[styles.historyAmount, styles.historyExpense]}>−{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {['Transactions', 'Monthly budget', 'Currency · CAD', 'Notifications', 'Security'].map((item) => (
            <View key={item} style={styles.preferenceRow}><Text style={styles.preferenceText}>{item}</Text><Text style={styles.chevron}>›</Text></View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Session</Text>
          <Text style={styles.sectionCopy}>
            End your current session and return to the login page.
          </Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {success && <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(250)} style={styles.success}><Text style={styles.successText}>✓ Profile Updated</Text></Animated.View>}
      <EditProfileSheet visible={editing} profile={profile} onClose={() => setEditing(false)} onSave={saveProfile}/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 116,
  },
  heroCard: {
    paddingVertical: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 10,
  },
  profileEmail: { color: colors.textMuted, fontSize: 14, marginTop: -4 },
  heroCopy: {
    color: colors.accent,
    fontSize: 16,
    lineHeight: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  monthRow: { gap: 8, paddingTop: 16, paddingBottom: 14 },
  monthChip: { backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border, borderRadius: 15, paddingHorizontal: 14, paddingVertical: 10 },
  monthChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  monthChipText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  monthChipTextActive: { color: colors.text },
  historyEmpty: { color: colors.textMuted, fontSize: 13, paddingVertical: 8 },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.border },
  historyIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt, marginRight: 10 },
  historyIconText: { color: colors.primarySoft, fontSize: 17, fontWeight: '800' },
  historyInfo: { flex: 1 },
  historyName: { color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: 3 },
  historyMeta: { color: colors.textMuted, fontSize: 10 },
  historyAmount: { fontSize: 13, fontWeight: '800' },
  historyExpense: { color: colors.dangerSoft },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  metricValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  latestTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  latestMeta: {
    color: colors.textMuted,
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  preferenceText: { color: colors.textSoft, fontSize: 15, fontWeight: '600' },
  chevron: { color: colors.textMuted, fontSize: 24, lineHeight: 24 },
  clearButton: {
    alignSelf: 'flex-start',
    marginTop: 18,
  },
  clearButtonText: { color: colors.dangerSoft, fontSize: 14, fontWeight: '700' },
  success: { position: 'absolute', alignSelf: 'center', bottom: 104, backgroundColor: '#2f7d55', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 18, shadowColor: '#000', shadowOpacity: .2, shadowRadius: 10, elevation: 5 },
  successText: { color: '#fff', fontWeight: '800' },
});
