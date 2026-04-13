import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/colors';

const formatCurrency = (value) => `$${value.toFixed(2)}`;

const getRelativeLabel = (isoDate) => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 1) {
    return 'Just now';
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export default function HomeScreen({ transactions, removeTransaction }) {
  const incomeTotal = transactions
    .filter((item) => item.type === 'Income')
    .reduce((sum, item) => sum + item.amount, 0);
  const expenseTotal = transactions
    .filter((item) => item.type === 'Expense')
    .reduce((sum, item) => sum + item.amount, 0);
  const borrowedTotal = transactions
    .filter((item) => item.type === 'Borrowed')
    .reduce((sum, item) => sum + item.amount, 0);
  const givenTotal = transactions
    .filter((item) => item.type === 'Given')
    .reduce((sum, item) => sum + item.amount, 0);
  const balance = incomeTotal - expenseTotal - givenTotal + borrowedTotal;

  const expenseByCategory = transactions
    .filter((item) => item.type === 'Expense')
    .reduce((groups, item) => {
      const key = item.category || 'Other';
      groups[key] = (groups[key] || 0) + item.amount;
      return groups;
    }, {});

  const topCategories = Object.entries(expenseByCategory)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);

  const recentTransactions = transactions.slice(0, 5);
  const overviewItems = [
    {
      key: 'income',
      label: 'Income',
      value: incomeTotal,
      softBackground: '#2a3328',
    },
    {
      key: 'expense',
      label: 'Expense',
      value: expenseTotal,
      softBackground: '#392520',
    },
    {
      key: 'given',
      label: 'Given',
      value: givenTotal,
      softBackground: '#3a2c1d',
    },
    {
      key: 'borrowed',
      label: 'Borrowed',
      value: borrowedTotal,
      softBackground: '#33241c',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>Velora dashboard</Text>
            <Text style={styles.headerTitle}>Money snapshot</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{transactions.length} items</Text>
          </View>
        </View>

        <View style={styles.balanceDeck}>
          <View style={styles.mainBalanceCard}>
            <Text style={styles.balanceLabel}>Available balance</Text>
            <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
            <Text style={styles.balanceMeta}>
              Income - expenses - money given + money borrowed
            </Text>

            <View style={styles.balanceFootRow}>
              <View style={styles.balanceFootChip}>
                <Text style={styles.balanceFootChipLabel}>Spent</Text>
                <Text style={styles.balanceFootChipValue}>
                  {formatCurrency(expenseTotal)}
                </Text>
              </View>
              <View style={styles.balanceFootChip}>
                <Text style={styles.balanceFootChipLabel}>Shared</Text>
                <Text style={styles.balanceFootChipValue}>
                  {formatCurrency(givenTotal + borrowedTotal)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.balanceSideRow}>
            <View style={styles.sideCard}>
              <Text style={styles.sideCardLabel}>Income flow</Text>
              <Text style={styles.sideCardValue}>{formatCurrency(incomeTotal)}</Text>
              <Text style={styles.sideCardMeta}>Cash coming in</Text>
            </View>

            <View style={styles.sideCard}>
              <Text style={styles.sideCardLabel}>Shared money</Text>
              <Text style={styles.sideCardValue}>
                {formatCurrency(borrowedTotal - givenTotal)}
              </Text>
              <Text style={styles.sideCardMeta}>Net with friends</Text>
            </View>
          </View>
        </View>

        <View style={styles.gridRow}>
          {overviewItems.map((item) => (
            <View
              key={item.key}
              style={[styles.miniStatCard, { backgroundColor: item.softBackground }]}
            >
              <Text style={styles.miniStatLabel}>{item.label}</Text>
              <Text style={styles.miniStatValue}>{formatCurrency(item.value)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.analyticsCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>Expenses</Text>
              <Text style={styles.sectionTitle}>Top categories</Text>
            </View>
            <Text style={styles.sectionMeta}>Live split</Text>
          </View>

          {topCategories.length === 0 ? (
            <Text style={styles.emptyText}>
              Add an expense to start building category cards.
            </Text>
          ) : (
            topCategories.map(([category, total]) => {
              const percentage = expenseTotal > 0 ? (total / expenseTotal) * 100 : 0;

              return (
                <View key={category} style={styles.categoryCard}>
                  <View style={styles.categoryTopRow}>
                    <Text style={styles.categoryName}>{category}</Text>
                    <Text style={styles.categoryAmount}>{formatCurrency(total)}</Text>
                  </View>
                  <Text style={styles.categoryShare}>
                    {Math.round(percentage)}% of all expenses
                  </Text>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.max(12, Math.min(percentage, 100))}%` },
                      ]}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.analyticsCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>Feed</Text>
              <Text style={styles.sectionTitle}>Recent activity</Text>
            </View>
            <Text style={styles.sectionMeta}>Latest 5</Text>
          </View>

          {recentTransactions.length === 0 ? (
            <Text style={styles.emptyText}>
              No transactions yet. Add one from Expenses or Friends.
            </Text>
          ) : (
            recentTransactions.map((item) => (
              <View key={item.id} style={styles.transactionCard}>
                <View style={styles.transactionLeft}>
                  <View style={styles.transactionAvatar}>
                    <Text style={styles.transactionAvatarText}>
                      {(item.recipient || item.category || item.type).slice(0, 1)}
                    </Text>
                  </View>
                  <View style={styles.transactionTextWrap}>
                    <Text style={styles.transactionTitle}>
                      {item.recipient || item.category || item.note || item.type}
                    </Text>
                    <Text style={styles.transactionMeta}>
                      {item.type} · {getRelativeLabel(item.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      item.type === 'Income' || item.type === 'Borrowed'
                        ? styles.positiveAmount
                        : styles.negativeAmount,
                    ]}
                  >
                    {item.type === 'Income' || item.type === 'Borrowed' ? '+' : '-'}
                    {formatCurrency(item.amount)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeTransaction(item.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  eyebrow: {
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontSize: 12,
    marginBottom: 8,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '700',
  },
  headerBadge: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerBadgeText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '600',
  },
  balanceDeck: {
    marginBottom: 18,
  },
  mainBalanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    minHeight: 220,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
    marginBottom: 12,
  },
  balanceSideRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sideCard: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  sideCardLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 8,
  },
  sideCardValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  sideCardMeta: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  balanceLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 10,
  },
  balanceValue: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '800',
    marginBottom: 10,
    maxWidth: '100%',
  },
  balanceMeta: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    maxWidth: '100%',
  },
  balanceFootRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    maxWidth: '100%',
  },
  balanceFootChip: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  balanceFootChipLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 6,
  },
  balanceFootChipValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  miniStatCard: {
    width: '48%',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  miniStatLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },
  miniStatValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  analyticsCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  sectionEyebrow: {
    color: colors.accent,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  sectionMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 18,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  categoryCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  categoryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  categoryAmount: {
    color: colors.textSoft,
    fontSize: 14,
  },
  categoryShare: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 12,
  },
  progressTrack: {
    height: 9,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  transactionAvatar: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionAvatarText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  transactionTextWrap: {
    flex: 1,
  },
  transactionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionMeta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  positiveAmount: {
    color: colors.success,
  },
  negativeAmount: {
    color: colors.dangerSoft,
  },
  deleteButton: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '600',
  },
});
