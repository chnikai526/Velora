import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { primaryAuth } from '../lib/firebase';
import colors from '../theme/colors';

const formatCurrency = (value) => `$${value.toFixed(2)}`;

export default function ProfileScreen({
  currentUser,
  transactions,
  clearTransactions,
  cloudStatus,
}) {
  const incomeCount = transactions.filter((item) => item.type === 'Income').length;
  const expenseCount = transactions.filter((item) => item.type === 'Expense').length;
  const friendCount = transactions.filter(
    (item) => item.type === 'Borrowed' || item.type === 'Given'
  ).length;

  const totalTracked = transactions.reduce((sum, item) => sum + item.amount, 0);
  const latestTransaction = transactions[0];
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
  const pastTransactions = transactions.filter((item) => {
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

  const handleClearData = () => {
    Alert.alert('Clear all transactions?', 'This permanently removes your transaction history from this device and Firestore.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear data', style: 'destructive', onPress: clearTransactions },
    ]);
  };

  const name = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Velora member';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{name.slice(0, 1).toUpperCase()}</Text></View>
          <Text style={styles.heroTitle}>{name}</Text>
          <Text style={styles.heroCopy}>
            {currentUser?.email
              ? `Signed in as ${currentUser.email}.`
              : 'Keep an eye on your activity and reset your local data whenever needed.'}
          </Text>
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
          <Text style={styles.sectionTitle}>Past transactions</Text>
          <Text style={styles.sectionCopy}>Pick any month to review your income and expenses.</Text>
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
              <View style={styles.historyIcon}><Text style={styles.historyIconText}>{item.type === 'Income' ? '+' : '−'}</Text></View>
              <View style={styles.historyInfo}><Text style={styles.historyName}>{item.category || item.note || item.type}</Text><Text style={styles.historyMeta}>{item.paymentMethod || item.type} · {new Date(item.date || item.createdAt).toLocaleDateString()}</Text></View>
              <Text style={[styles.historyAmount, item.type === 'Income' ? styles.historyIncome : styles.historyExpense]}>{item.type === 'Income' ? '+' : '−'}{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Income items</Text>
            <Text style={styles.metricValue}>{incomeCount}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Expense items</Text>
            <Text style={styles.metricValue}>{expenseCount}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {['Monthly budget', 'Currency · CAD', 'Appearance · Dark', 'Notifications', 'Security'].map((item) => (
            <View key={item} style={styles.preferenceRow}><Text style={styles.preferenceText}>{item}</Text><Text style={styles.chevron}>›</Text></View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Your data</Text>
          {['Backup data', 'Export CSV', 'Export PDF'].map((item) => (
            <View key={item} style={styles.preferenceRow}><Text style={styles.preferenceText}>{item}</Text><Text style={styles.chevron}>›</Text></View>
          ))}
          <TouchableOpacity onPress={handleClearData} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear transaction data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Friends activity</Text>
          <Text style={styles.largeValue}>{friendCount}</Text>
          <Text style={styles.sectionCopy}>
            Borrowed and given transactions are counted here so you can track shared money separately.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Latest transaction</Text>
          {latestTransaction ? (
            <>
              <Text style={styles.latestTitle}>
                {latestTransaction.recipient ||
                  latestTransaction.category ||
                  latestTransaction.note ||
                  latestTransaction.type}
              </Text>
              <Text style={styles.latestMeta}>
                {latestTransaction.type} · {formatCurrency(latestTransaction.amount)}
              </Text>
            </>
          ) : (
            <Text style={styles.sectionCopy}>
              No activity yet. Add an income, expense, or friend entry to populate this.
            </Text>
          )}
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { color: colors.text, fontSize: 22, fontWeight: '800' },
  heroTitle: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 10,
  },
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
  historyIncome: { color: colors.success },
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
  largeValue: {
    color: colors.primarySoft,
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 6,
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
});
