import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
} from 'react-native';

const IncomeScreen = ({ transactions, renderTransaction, setScreen }) => {
  const filtered = transactions.filter(item => item.type === 'Income');

  return (
    <View style={styles.pageSection}>
      <View style={styles.pageHeader}>
        <Text style={styles.sectionLabel}>Income transactions</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => setScreen('Home')}>
          <Text style={styles.backButtonText}>Home</Text>
        </TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <Text style={styles.emptyText}>No incomes yet. Add one from Home.</Text>
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
  emptyText: {
    color: '#888',
    fontSize: 15,
    marginTop: 10,
  },
});

export default IncomeScreen;
