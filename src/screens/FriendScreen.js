import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
} from 'react-native';

const FriendScreen = ({
  transactions,
  renderTransaction,
  borrowedTotal,
  givenTotal,
  showBorrowForm,
  setShowBorrowForm,
  selectedBorrowType,
  setSelectedBorrowType,
  borrowAmount,
  setBorrowAmount,
  borrowRecipient,
  setBorrowRecipient,
  borrowReason,
  setBorrowReason,
  addBorrowRecord,
}) => {
  const borrowTypeOptions = ['Borrowed', 'Given'];
  const filtered = transactions.filter(item => item.type === 'Borrowed' || item.type === 'Given');
  const netBorrowed = borrowedTotal - givenTotal;
  const recipientGroups = filtered.reduce((groups, item) => {
    const name = item.recipient || 'Friend';
    if (!groups[name]) {
      groups[name] = { name, borrowed: 0, given: 0, net: 0 };
    }
    if (item.type === 'Borrowed') {
      groups[name].borrowed += item.amount;
      groups[name].net += item.amount;
    } else {
      groups[name].given += item.amount;
      groups[name].net -= item.amount;
    }
    return groups;
  }, {});

  return (
    <>
      <View style={styles.userBanner}>
        <Text style={styles.welcomeText}>Borrow & Give</Text>
        <Text style={styles.welcomeSubText}>Track money you borrowed or gave to friends.</Text>
      </View>

      <View style={styles.cardSummary}>
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryLabel}>Borrowed</Text>
          <Text style={[styles.summaryValue, styles.borrowedText]}>${borrowedTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryLabel}>Given</Text>
          <Text style={[styles.summaryValue, styles.givenText]}>${givenTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryLabel}>Net</Text>
          <Text style={[styles.summaryValue, netBorrowed >= 0 ? styles.borrowPositive : styles.borrowNegative]}>
            ${netBorrowed.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.recipientSummary}>
        <Text style={styles.sectionLabel}>Friends</Text>
        {Object.values(recipientGroups).length === 0 ? (
          <Text style={styles.emptyText}>No friends added yet.</Text>
        ) : (
          Object.values(recipientGroups).map(group => (
            <View key={group.name} style={styles.recipientCard}>
              <Text style={styles.recipientName}>{group.name}</Text>
              <Text style={[styles.recipientNet, group.net >= 0 ? styles.borrowPositive : styles.borrowNegative]}>
                {group.net >= 0 ? '+' : '-'}${Math.abs(group.net).toFixed(2)}
              </Text>
              <Text style={styles.recipientMeta}>
                Borrowed ${group.borrowed.toFixed(2)} · Given ${group.given.toFixed(2)}
              </Text>
            </View>
          ))
        )}
      </View>

      {!showBorrowForm && (
        <View style={styles.fabSection}>
          <TouchableOpacity style={styles.fabButton} onPress={() => setShowBorrowForm(true)}>
            <Text style={styles.fabIcon}>+</Text>
          </TouchableOpacity>
          <Text style={styles.fabLabel}>Add borrow/give</Text>
        </View>
      )}

      {showBorrowForm && (
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Record borrowed or given money</Text>

          <View style={styles.optionRow}>
            {borrowTypeOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, selectedBorrowType === option && styles.selectedButton]}
                onPress={() => setSelectedBorrowType(option)}
              >
                <Text style={[styles.optionText, selectedBorrowType === option && styles.selectedText]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Friend / recipient name"
            placeholderTextColor="#999"
            value={borrowRecipient}
            onChangeText={setBorrowRecipient}
          />
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Amount"
            placeholderTextColor="#999"
            value={borrowAmount}
            onChangeText={setBorrowAmount}
          />
          <TextInput
            style={styles.input}
            placeholder="Reason (optional)"
            placeholderTextColor="#999"
            value={borrowReason}
            onChangeText={setBorrowReason}
          />

          <View style={styles.formActions}>
            <TouchableOpacity style={[styles.addButton, styles.buttonSpacing]} onPress={addBorrowRecord}>
              <Text style={styles.addButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowBorrowForm(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.listSection}>
        <Text style={styles.sectionLabel}>Borrowed / Given history</Text>
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>No borrow records yet. Add one to get started.</Text>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={renderTransaction}
            scrollEnabled={false}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  userBanner: {
    backgroundColor: '#1f1f1f',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  welcomeSubText: {
    color: '#bbb',
    fontSize: 14,
  },
  cardSummary: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  summaryBlock: {
    marginBottom: 16,
  },
  summaryLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 6,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  borrowedText: {
    color: '#93c5fd',
  },
  givenText: {
    color: '#fbbf24',
  },
  borrowPositive: {
    color: '#4ade80',
  },
  borrowNegative: {
    color: '#f87171',
  },
  recipientSummary: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  recipientCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
  },
  recipientName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  recipientNet: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  recipientMeta: {
    color: '#777',
    fontSize: 13,
  },
  emptyText: {
    color: '#888',
    fontSize: 15,
    marginTop: 10,
  },
  fabSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '700',
  },
  fabLabel: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
  },
  formSection: {
    marginBottom: 24,
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
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  buttonSpacing: {
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#272727',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  listSection: {
    marginBottom: 20,
  },
});

export default FriendScreen;
