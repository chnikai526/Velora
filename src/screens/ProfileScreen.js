import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { signOut, updateProfile, verifyBeforeUpdateEmail } from 'firebase/auth';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { primaryAuth } from '../lib/firebase';
import { CARD_GAP, colors, GUTTER, radius, SECTION_GAP, tabBarClearance, type } from '../theme';
import AnimalAvatar from '../components/avatars/AnimalAvatar';
import EditProfileSheet from '../components/EditProfileSheet';
import TransactionsHistorySheet from '../components/TransactionsHistorySheet';
import CategoriesManagerSheet from '../components/CategoriesManagerSheet';
import MonthlyBudgetSheet from '../components/MonthlyBudgetSheet';
import NotificationsSheet from '../components/NotificationsSheet';
import CurrencyConverterSheet from '../components/CurrencyConverterSheet';
import SpendingChart from '../components/SpendingChart';
import MetricCard from '../components/MetricCard';
import IconButton from '../components/IconButton';
import Button from '../components/Button';
import Card from '../components/Card';
import ListRow from '../components/ListRow';
import { getMonthlyExpenseSeries, loadMonthlyBudget } from '../lib/budget';
import { buildNotifications, loadReadIds } from '../lib/notifications';
import { loadProfile, saveProfile as persistProfile } from '../lib/profile';
import { formatMoney } from '../lib/format';
import { confirmAction, showNotice } from '../lib/confirm';

const emailChangeError = (error) => {
  switch (error?.code) {
    case 'auth/requires-recent-login':
      return 'For your security, log out and sign back in, then change your email again.';
    case 'auth/email-already-in-use':
      return 'That email is already used by another account.';
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'Firebase could not start the email change right now. Your other changes were saved.';
  }
};

export default function ProfileScreen({ currentUser, transactions, updateTransaction, removeTransaction, navigation }) {
  const uid = currentUser?.uid;
  // Email always comes from the signed-in account: the old code showed the
  // locally saved copy, so a failed email change still displayed the new
  // address even though sign-in kept using the old one.
  const accountEmail = currentUser?.email || '';
  const fallbackProfile = useMemo(() => ({
    name: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Velora member',
    email: accountEmail,
    dateOfBirth: null,
    avatarId: 'cat',
  }), [currentUser?.displayName, currentUser?.email, accountEmail]);
  const [profile, setProfile] = useState(fallbackProfile);
  const [editing, setEditing] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [converterOpen, setConverterOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [budget, setBudget] = useState(0);
  const [success, setSuccess] = useState(false);
  const successTimer = useRef(null);
  const scrollRef = useRef(null);
  const insets = useSafeAreaInsets();
  useScrollToTop(scrollRef);

  useEffect(() => () => clearTimeout(successTimer.current), []);

  // Budget and unread count are re-read whenever the tab gains focus or the
  // transactions change, so edits made elsewhere show up here.
  const refresh = useCallback(() => {
    let active = true;
    Promise.all([loadReadIds(uid), loadMonthlyBudget(uid)]).then(([ids, budgetAmount]) => {
      if (!active) return;
      const items = buildNotifications({ transactions, budgetAmount });
      setBudget(budgetAmount);
      setUnreadCount(items.filter((item) => !ids.has(item.id)).length);
    });
    return () => { active = false; };
  }, [uid, transactions]);

  useFocusEffect(refresh);

  useEffect(() => {
    let active = true;
    loadProfile(uid).then((saved) => { if (active && saved) setProfile({ ...saved, email: accountEmail }); });
    return () => { active = false; };
  }, [uid, accountEmail]);

  const handleLogout = () => confirmAction({
    title: 'Log out?',
    message: 'You will be sent back to the login screen.',
    confirmLabel: 'Log out',
    destructive: true,
    onConfirm: async () => {
      try {
        await signOut(primaryAuth);
      } catch (_error) {
        showNotice('Unable to log out', 'Firebase could not end your session right now.');
      }
    },
  });

  const flashSuccess = () => {
    setSuccess(true);
    clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => setSuccess(false), 2000);
  };

  const saveProfile = async (nextProfile) => {
    const wantsNewEmail = Boolean(currentUser) && nextProfile.email && nextProfile.email !== accountEmail;
    const cleanProfile = { name: nextProfile.name, email: accountEmail, dateOfBirth: nextProfile.dateOfBirth || null, avatarId: nextProfile.avatarId };
    setProfile(cleanProfile);
    setEditing(false);
    flashSuccess();
    try {
      await persistProfile(uid, cleanProfile);
    } catch (_error) {
      showNotice('Profile not saved', 'Your device storage could not be written. Try again.');
      return;
    }
    if (!currentUser) return;
    try {
      await updateProfile(currentUser, { displayName: cleanProfile.name });
    } catch (_error) {
      // The local profile is the source of truth for the name on this device.
    }
    if (!wantsNewEmail) return;
    // `updateEmail` is rejected outright on projects with email-enumeration
    // protection (the Firebase default), so the change never happened. The
    // supported flow emails a confirmation link to the new address.
    try {
      await verifyBeforeUpdateEmail(currentUser, nextProfile.email);
      showNotice('Confirm your new email', `We sent a link to ${nextProfile.email}. Your sign-in email changes once you open it.`);
    } catch (error) {
      showNotice('Email not changed', emailChangeError(error));
    }
  };

  const series = useMemo(() => getMonthlyExpenseSeries(transactions), [transactions]);
  const thisMonth = series[series.length - 1]?.value || 0;
  const totalTracked = useMemo(() => transactions.filter((item) => item.type === 'Expense').reduce((sum, item) => sum + item.amount, 0), [transactions]);
  const name = profile.name || fallbackProfile.name;
  const tabClearance = tabBarClearance(insets.bottom);

  const pages = [
    { key: 'transactions', label: 'Transactions', icon: 'receipt-outline', onPress: () => setHistoryOpen(true) },
    { key: 'categories', label: 'Categories', icon: 'pricetags-outline', onPress: () => setCategoriesOpen(true) },
    { key: 'budget', label: 'Monthly budget', icon: 'wallet-outline', onPress: () => setBudgetOpen(true) },
    { key: 'converter', label: 'Currency converter', icon: 'swap-horizontal-outline', onPress: () => setConverterOpen(true) },
    { key: 'notifications', label: 'Notifications', icon: 'notifications-outline', onPress: () => setNotificationsOpen(true), badge: unreadCount },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView ref={scrollRef} contentContainerStyle={[styles.content, { paddingBottom: tabClearance + SECTION_GAP }]} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.topRow}>
            <IconButton accessibilityLabel="Notifications" onPress={() => setNotificationsOpen(true)} icon={<Ionicons name="notifications-outline" size={19} color={colors.text} />} />
            <IconButton accessibilityLabel="Edit profile" onPress={() => setEditing(true)} icon={<Ionicons name="create-outline" size={19} color={colors.text} />} />
          </View>
          <View style={styles.avatarRing}>
            <AnimalAvatar avatarId={profile.avatarId} size={100} />
          </View>
          <Text style={styles.name}>{name}</Text>
          {accountEmail ? <Text style={styles.email}>{accountEmail}</Text> : null}
        </View>

        <Card style={styles.chartCard} contentStyle={styles.chartContent}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartLabel}>Spent this month</Text>
            <Text style={styles.chartRange}>{budget > 0 ? `Budget ${formatMoney(budget)}` : 'Last 6 months'}</Text>
          </View>
          <Text style={styles.chartValue}>{formatMoney(thisMonth)}</Text>
          <SpendingChart data={series} budget={budget} />
        </Card>

        <View style={styles.metricsRow}>
          <MetricCard label="Total entries" value={String(transactions.length)} style={styles.metric} arrow={null} onPress={() => setHistoryOpen(true)} />
          <MetricCard label="Tracked spend" value={formatMoney(totalTracked)} style={styles.metric} arrow={null} onPress={() => setHistoryOpen(true)} />
        </View>

        <Card contentStyle={styles.menuContent} style={styles.menuCard}>
          {pages.map((page, index) => (
            <ListRow
              key={page.key}
              icon={<Ionicons name={page.icon} />}
              title={page.label}
              onPress={page.onPress}
              showDivider={index < pages.length - 1}
              right={
                <>
                  {page.badge > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{page.badge}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
                </>
              }
            />
          ))}
        </Card>

        <Button label="Log out" variant="danger" size="md" onPress={handleLogout} icon={<Ionicons name="log-out-outline" size={18} color={colors.negative} />} />
      </ScrollView>
      <LinearGradient colors={['rgba(19,19,19,0)', colors.bg]} style={[styles.bottomScrim, { height: tabClearance + 36 }]} pointerEvents="none" />
      {success && (
        <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(250)} style={[styles.success, { bottom: tabClearance + 12 }]}>
          <Ionicons name="checkmark-circle" size={16} color={colors.positive} />
          <Text style={styles.successText}>Profile updated</Text>
        </Animated.View>
      )}
      <EditProfileSheet visible={editing} profile={{ ...profile, email: accountEmail }} onClose={() => setEditing(false)} onSave={saveProfile} />
      <TransactionsHistorySheet
        visible={historyOpen}
        transactions={transactions}
        uid={uid}
        onUpdate={updateTransaction}
        onRemove={removeTransaction}
        onClose={() => { setHistoryOpen(false); refresh(); }}
      />
      <CategoriesManagerSheet visible={categoriesOpen} uid={uid} onClose={() => setCategoriesOpen(false)} />
      <MonthlyBudgetSheet visible={budgetOpen} uid={uid} transactions={transactions} onClose={() => { setBudgetOpen(false); refresh(); }} />
      <NotificationsSheet visible={notificationsOpen} uid={uid} transactions={transactions} onClose={() => { setNotificationsOpen(false); refresh(); }} />
      <CurrencyConverterSheet
        visible={converterOpen}
        onClose={() => setConverterOpen(false)}
        onViewAllRates={(params) => {
          // The full rates list lives on the root stack, so dismiss the sheet
          // first — otherwise the pushed screen renders behind it.
          setConverterOpen(false);
          (navigation?.getParent() ?? navigation)?.navigate('ExchangeRates', params);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: GUTTER, paddingTop: 8 },

  profileCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 18, paddingBottom: 30, alignItems: 'center', marginBottom: CARD_GAP },
  topRow: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  avatarRing: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  name: { ...type.display, fontSize: 34, lineHeight: 38, color: colors.text, textAlign: 'center', marginTop: 18, maxWidth: 260 },
  email: { ...type.body, fontSize: 14, color: colors.textSoft, marginTop: 10 },

  chartCard: { marginBottom: CARD_GAP },
  chartContent: { padding: 20, paddingBottom: 18 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartLabel: { ...type.label, fontSize: 16, color: colors.textSoft },
  chartRange: { ...type.body, fontSize: 14, color: colors.textMuted },
  chartValue: { ...type.value, color: colors.text, marginTop: 6, marginBottom: 16 },

  metricsRow: { flexDirection: 'row', gap: CARD_GAP, marginBottom: CARD_GAP },
  metric: { flex: 1 },

  menuCard: { marginBottom: SECTION_GAP },
  menuContent: { paddingVertical: 4, paddingHorizontal: 16 },
  badge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
  badgeText: { ...type.numeric, fontSize: 11, color: colors.accentText },

  bottomScrim: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  success: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceRaised, paddingHorizontal: 18, height: 44, borderRadius: radius.pill },
  successText: { ...type.label, color: colors.text },
});
