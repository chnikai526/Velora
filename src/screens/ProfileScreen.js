import React from 'react';
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Profile & insights</Text>
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
    padding: 20,
    paddingBottom: 100,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  heroCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 22,
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
    borderRadius: 24,
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
    borderRadius: 18,
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
});
