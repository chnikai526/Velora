import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/colors';

const expenseCategories = [
  'Food',
  'Transport',
  'Bills',
  'Shopping',
  'Rent',
  'Health',
  'Entertainment',
  'Other',
];

const formatCurrency = (value) => `$${value.toFixed(2)}`;

export default function ExpenseScreen({
  transactions,
  addTransaction,
  removeTransaction,
}) {
  const [selectedType, setSelectedType] = useState('Expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const isExpense = selectedType === 'Expense';

  const entries = transactions.filter(
    (item) => item.type === 'Expense' || item.type === 'Income'
  );
  const incomeTotal = entries
    .filter((item) => item.type === 'Income')
    .reduce((sum, item) => sum + item.amount, 0);
  const expenseTotal = entries
    .filter((item) => item.type === 'Expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const handleSave = () => {
    const result = addTransaction({
      type: selectedType,
      amount,
      category: isExpense ? category : '',
      note,
    });

    if (!result.ok) {
      Alert.alert('Unable to save', result.message);
      return;
    }

    setAmount('');
    setNote('');
    if (!isExpense) {
      setCategory(expenseCategories[0]);
    }
    Alert.alert('Saved', `${selectedType} added successfully.`);
  };

  const handleTypeChange = (option) => {
    setSelectedType(option);
    if (option === 'Income') {
      setCategory('');
      setIsCategoryModalVisible(false);
      return;
    }

    setCategory((currentCategory) => currentCategory || expenseCategories[0]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Track cash flow</Text>
          <Text style={styles.headerCopy}>
            Add income and expenses here, then see the impact across your dashboard.
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.summaryValue}>{formatCurrency(incomeTotal)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.summaryValue}>{formatCurrency(expenseTotal)}</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Add a new entry</Text>

          <View style={styles.toggleRow}>
            {['Expense', 'Income'].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => handleTypeChange(option)}
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
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Amount"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          {isExpense ? (
            <>
              <Text style={styles.fieldLabel}>Category</Text>
              <TouchableOpacity
                style={styles.selectField}
                onPress={() => setIsCategoryModalVisible(true)}
              >
                <Text style={styles.selectValue}>{category || 'Select category'}</Text>
                <Text style={styles.selectChevron}>v</Text>
              </TouchableOpacity>
            </>
          ) : null}

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={isExpense ? 'Note' : 'Income note'}
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          <TouchableOpacity onPress={handleSave} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Save entry</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Recent income & expenses</Text>
          {entries.length === 0 ? (
            <Text style={styles.emptyText}>
              No entries yet. Add your first income or expense above.
            </Text>
          ) : (
            entries.map((item) => (
              <View key={item.id} style={styles.entryRow}>
                <View style={styles.entryTextWrap}>
                  <Text style={styles.entryTitle}>
                    {item.note || item.category || item.type}
                  </Text>
                  <Text style={styles.entryMeta}>
                    {item.type} · {item.category || 'General'}
                  </Text>
                </View>
                <View style={styles.entryRight}>
                  <Text
                    style={[
                      styles.entryAmount,
                      item.type === 'Income'
                        ? styles.entryAmountPositive
                        : styles.entryAmountNegative,
                    ]}
                  >
                    {item.type === 'Income' ? '+' : '-'}
                    {formatCurrency(item.amount)}
                  </Text>
                  <TouchableOpacity onPress={() => removeTransaction(item.id)}>
                    <Text style={styles.removeText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={isCategoryModalVisible}
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose category</Text>
            {expenseCategories.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  setCategory(option);
                  setIsCategoryModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    category === option && styles.modalOptionTextActive,
                  ]}
                >
                  {option}
                </Text>
                {category === option ? (
                  <Text style={styles.modalCheck}>Selected</Text>
                ) : null}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsCategoryModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  headerCopy: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 22,
    padding: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 6,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  formCard: {
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
  fieldLabel: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  selectField: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  selectChevron: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  entryTextWrap: {
    flex: 1,
    paddingRight: 16,
  },
  entryTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  entryMeta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  entryRight: {
    alignItems: 'flex-end',
  },
  entryAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  entryAmountPositive: {
    color: colors.success,
  },
  entryAmountNegative: {
    color: colors.danger,
  },
  removeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalOption: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOptionText: {
    color: colors.textSoft,
    fontSize: 15,
    fontWeight: '600',
  },
  modalOptionTextActive: {
    color: colors.text,
  },
  modalCheck: {
    color: colors.primarySoft,
    fontSize: 12,
    fontWeight: '700',
  },
  modalCloseButton: {
    marginTop: 6,
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalCloseText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
});
