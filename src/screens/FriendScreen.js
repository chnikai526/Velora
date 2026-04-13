import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/colors';

const formatCurrency = (value) => `$${value.toFixed(2)}`;

export default function FriendScreen({
  transactions,
  addTransaction,
  removeTransaction,
}) {
  const [selectedType, setSelectedType] = useState('Borrowed');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [reason, setReason] = useState('');
  const [showForm, setShowForm] = useState(false);

  const friendTransactions = transactions.filter(
    (item) => item.type === 'Borrowed' || item.type === 'Given'
  );
  const borrowedTotal = friendTransactions
    .filter((item) => item.type === 'Borrowed')
    .reduce((sum, item) => sum + item.amount, 0);
  const givenTotal = friendTransactions
    .filter((item) => item.type === 'Given')
    .reduce((sum, item) => sum + item.amount, 0);
  const netBalance = borrowedTotal - givenTotal;

  const friendBalances = friendTransactions.reduce((groups, item) => {
    const key = item.recipient || 'Friend';

    if (!groups[key]) {
      groups[key] = { name: key, borrowed: 0, given: 0, net: 0 };
    }

    if (item.type === 'Borrowed') {
      groups[key].borrowed += item.amount;
      groups[key].net += item.amount;
    } else {
      groups[key].given += item.amount;
      groups[key].net -= item.amount;
    }

    return groups;
  }, {});

  const sortedFriends = Object.values(friendBalances).sort(
    (left, right) => Math.abs(right.net) - Math.abs(left.net)
  );

  const handleSave = () => {
    if (!recipient.trim()) {
      Alert.alert('Missing name', 'Add the friend or recipient name first.');
      return;
    }

    const result = addTransaction({
      type: selectedType,
      amount,
      recipient,
      note: reason,
    });

    if (!result.ok) {
      Alert.alert('Unable to save', result.message);
      return;
    }

    setAmount('');
    setRecipient('');
    setReason('');
    setShowForm(false);
    Alert.alert('Saved', `${selectedType} record added.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Borrow & give</Text>
          <Text style={styles.heroText}>
            Track who owes you, who you owe, and the reason behind each transfer.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Borrowed</Text>
            <Text style={[styles.summaryValue, styles.borrowedColor]}>
              {formatCurrency(borrowedTotal)}
            </Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Given</Text>
            <Text style={[styles.summaryValue, styles.givenColor]}>
              {formatCurrency(givenTotal)}
            </Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Net</Text>
            <Text
              style={[
                styles.summaryValue,
                netBalance >= 0 ? styles.positiveNet : styles.negativeNet,
              ]}
            >
              {formatCurrency(netBalance)}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Friend balances</Text>
          {sortedFriends.length === 0 ? (
            <Text style={styles.emptyText}>
              No friend activity yet. Add a borrowed or given record to begin.
            </Text>
          ) : (
            sortedFriends.map((friend) => (
              <View key={friend.name} style={styles.friendRow}>
                <View>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendMeta}>
                    Borrowed {formatCurrency(friend.borrowed)} · Given{' '}
                    {formatCurrency(friend.given)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.friendNet,
                    friend.net >= 0 ? styles.positiveNet : styles.negativeNet,
                  ]}
                >
                  {friend.net >= 0 ? '+' : '-'}
                  {formatCurrency(Math.abs(friend.net))}
                </Text>
              </View>
            ))
          )}
        </View>

        {!showForm ? (
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Add borrow / give record</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>New friend entry</Text>
            <View style={styles.toggleRow}>
              {['Borrowed', 'Given'].map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSelectedType(option)}
                  style={[
                    styles.toggleButton,
                    selectedType === option && styles.toggleButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      selectedType === option && styles.toggleTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={recipient}
              onChangeText={setRecipient}
              placeholder="Friend / recipient"
              placeholderTextColor="#6b7280"
              style={styles.input}
            />
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Amount"
              placeholderTextColor="#6b7280"
              style={styles.input}
            />
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Reason"
              placeholderTextColor="#6b7280"
              style={styles.input}
            />

            <TouchableOpacity onPress={handleSave} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Save record</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowForm(false)}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>History</Text>
          {friendTransactions.length === 0 ? (
            <Text style={styles.emptyText}>No borrow or give history yet.</Text>
          ) : (
            friendTransactions.map((item) => (
              <View key={item.id} style={styles.historyRow}>
                <View style={styles.historyTextWrap}>
                  <Text style={styles.historyTitle}>
                    {item.recipient || 'Friend'}
                  </Text>
                  <Text style={styles.historyMeta}>
                    {item.type}
                    {item.note ? ` · ${item.note}` : ''}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  <Text
                    style={[
                      styles.historyAmount,
                      item.type === 'Borrowed'
                        ? styles.borrowedColor
                        : styles.givenColor,
                    ]}
                  >
                    {item.type === 'Borrowed' ? '+' : '-'}
                    {formatCurrency(item.amount)}
                  </Text>
                  <TouchableOpacity onPress={() => removeTransaction(item.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
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
  heroText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryBlock: {
    marginBottom: 14,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  borrowedColor: {
    color: colors.accent,
  },
  givenColor: {
    color: colors.warning,
  },
  positiveNet: {
    color: colors.success,
  },
  negativeNet: {
    color: colors.dangerSoft,
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
    marginBottom: 14,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  friendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  friendName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  friendMeta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  friendNet: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  toggleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: {
    color: colors.textSoft,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    marginBottom: 14,
  },
  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    marginTop: -4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textSoft,
    fontWeight: '700',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyTextWrap: {
    flex: 1,
    paddingRight: 16,
  },
  historyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  historyMeta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  deleteText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
});
