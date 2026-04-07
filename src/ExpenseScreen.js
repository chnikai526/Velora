import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
} from 'react-native';

const ExpenseScreen = ({
  transactions,
  renderTransaction,
  setScreen,
  expenseAmount,
  setExpenseAmount,
  expenseReason,
  setExpenseReason,
  selectedCategory,
  setSelectedCategory,
  expenseCategories,
  newExpenseCategory,
  setNewExpenseCategory,
  addExpenseCategory,
  addExpenseRecord,
}) => {
  const filtered = transactions.filter(item => item.type === 'Expense');

  return (
    <View style={styles.pageSection}>
      <View style={styles.pageHeader}>
        <Text style={styles.sectionLabel}>Expense transactions</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => setScreen('Home')}>
          <Text style={styles.backButtonText}>Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.expenseForm}>
        <Text style={styles.sectionLabel}>Add daily expense</Text>
        <View style={styles.optionRow}>
          {expenseCategories.map(category => (
            <TouchableOpacity
              key={category}
              style={[styles.optionButton, selectedCategory === category && styles.selectedButton]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.optionText, selectedCategory === category && styles.selectedText]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="New category"
          placeholderTextColor="#999"
          value={newExpenseCategory}
          onChangeText={setNewExpenseCategory}
        />
        <TouchableOpacity style={[styles.addButton, styles.buttonSpacing]} onPress={addExpenseCategory}>
          <Text style={styles.addButtonText}>Add category</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Amount"
          placeholderTextColor="#999"
          value={expenseAmount}
          onChangeText={setExpenseAmount}
        />
        <TextInput
          style={styles.input}
          placeholder="Reason (optional)"
          placeholderTextColor="#999"
          value={expenseReason}
          onChangeText={setExpenseReason}
        />
        <TouchableOpacity style={styles.saveButton} onPress={() => addExpenseRecord(expenseAmount, expenseReason)}>
          <Text style={styles.addButtonText}>Save expense</Text>
        </TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <Text style={styles.emptyText}>No expenses yet. Add one from Home.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderTransaction}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pageSection: {
    marginTop: 20,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: '#272727',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  expenseForm: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#272727',
    borderWidth: 1,
    borderColor: '#272727',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedButton: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  optionText: {
    color: '#ddd',
    fontWeight: '600',
  },
  selectedText: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#1f1f1f',
    borderRadius: 14,
    color: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  addButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#22c55e',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonSpacing: {
    marginBottom: 12,
  },
  emptyText: {
    color: '#888',
    fontSize: 15,
    marginTop: 10,
  },
});

export default ExpenseScreen;
