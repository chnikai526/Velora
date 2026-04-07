import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
} from 'react-native';

const HomeScreen = ({
  registeredEmail,
  incomeTotal,
  expenseTotal,
  balance,
  showAddForm,
  setShowAddForm,
  selectedType,
  setSelectedType,
  selectedCategory,
  setSelectedCategory,
  expenseCategories,
  selectedMethod,
  setSelectedMethod,
  amount,
  setAmount,
  description,
  setDescription,
  addTransaction,
  transactions,
  renderTransaction,
  savedCards,
  cardName,
  setCardName,
  addSavedCard,
  methodOptions,
}) => {
  const typeOptions = ['Expense', 'Income'];

  const legendItems = [
    { label: 'Home', value: '$2,840', color: '#f97316' },
    { label: 'Food', value: '$1,072', color: '#facc15' },
    { label: 'Education', value: '$450', color: '#34d399' },
    { label: 'Entertainment', value: '$598', color: '#60a5fa' },
    { label: 'Charity', value: '$351', color: '#f472b6' },
    { label: 'Services', value: '$820', color: '#a78bfa' },
  ];

  return (
    <>
      <View style={styles.userBanner}>
        <Text style={styles.welcomeText}>Hello, {registeredEmail}</Text>
        <Text style={styles.welcomeSubText}>Monthly spending at a glance</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>Statistics</Text>
          <Text style={styles.statsSubtitle}>All cards</Text>
        </View>

        <View style={styles.periodRow}>
          {['Expenses', 'Week', 'Month', 'Quarter'].map(label => (
            <TouchableOpacity key={label} style={styles.periodButton}>
              <Text style={styles.periodText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartRingContainer}>
            <View style={[styles.chartRing, styles.chartRingShadow]}>
              <View style={[styles.chartCenter, styles.chartCenterShadow]}>
                <Text style={styles.chartValue}>${balance.toFixed(2)}</Text>
                <Text style={styles.chartLabel}>Available</Text>
              </View>
            </View>

            <View style={[styles.segment, styles.segment1]} />
            <View style={[styles.segment, styles.segment2]} />
            <View style={[styles.segment, styles.segment3]} />
            <View style={[styles.segment, styles.segment4]} />
            <View style={[styles.segment, styles.segment5]} />
            <View style={[styles.segment, styles.segment6]} />
            <View style={[styles.segment, styles.segment7]} />
            <View style={[styles.segment, styles.segment8]} />
          </View>

          <View style={styles.legendList}>
            {legendItems.map(item => (
              <View key={item.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <View>
                  <Text style={styles.legendLabel}>{item.label}</Text>
                  <Text style={styles.legendValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, styles.summaryCardAccent]}>
          <Text style={styles.summarySmallLabel}>Income</Text>
          <Text style={styles.summarySmallValue}>${incomeTotal.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardAccent2]}>
          <Text style={styles.summarySmallLabel}>Expense</Text>
          <Text style={styles.summarySmallValue}>${expenseTotal.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardAccent3]}>
          <Text style={styles.summarySmallLabel}>Balance</Text>
          <Text style={styles.summarySmallValue}>${balance.toFixed(2)}</Text>
        </View>
      </View>

      {!showAddForm && (
        <View style={styles.fabSection}>
          <TouchableOpacity style={styles.fabButton} onPress={() => setShowAddForm(true)}>
            <Text style={styles.fabIcon}>+</Text>
          </TouchableOpacity>
          <Text style={styles.fabLabel}>Add transaction</Text>
        </View>
      )}

      {showAddForm && (
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Add a transaction</Text>

          <View style={styles.optionRow}>
            {typeOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, selectedType === option && styles.selectedButton]}
                onPress={() => setSelectedType(option)}
              >
                <Text style={[styles.optionText, selectedType === option && styles.selectedText]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.optionRow}>
            {methodOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, selectedMethod === option && styles.selectedButton]}
                onPress={() => setSelectedMethod(option)}
              >
                <Text style={[styles.optionText, selectedMethod === option && styles.selectedText]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedType === 'Expense' && (
            <>
              <Text style={[styles.sectionLabel, styles.savedLabel]}>Expense categories</Text>
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
            </>
          )}

          {savedCards.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, styles.savedLabel]}>Saved payment methods</Text>
              <View style={styles.optionRow}>
                {savedCards.map(card => (
                  <TouchableOpacity
                    key={card}
                    style={[styles.optionButton, selectedMethod === card && styles.selectedButton]}
                    onPress={() => setSelectedMethod(card)}
                  >
                    <Text style={[styles.optionText, selectedMethod === card && styles.selectedText]}>{card}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="Save payment method for later"
            placeholderTextColor="#999"
            value={cardName}
            onChangeText={setCardName}
          />
          <TouchableOpacity style={[styles.addButton, styles.buttonSpacing]} onPress={addSavedCard}>
            <Text style={styles.addButtonText}>Save Card</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Amount"
            placeholderTextColor="#999"
            value={amount}
            onChangeText={setAmount}
          />
          <TextInput
            style={styles.input}
            placeholder="Description (optional)"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
          />

          <View style={styles.formActions}>
            <TouchableOpacity style={[styles.addButton, styles.buttonSpacing]} onPress={addTransaction}>
              <Text style={styles.addButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddForm(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.listSection}>
        <Text style={styles.sectionLabel}>Recent transactions</Text>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet. Add one to get started.</Text>
        ) : (
          <FlatList
            data={transactions}
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
    backgroundColor: '#14141a',
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  welcomeSubText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  statsCard: {
    backgroundColor: '#18181b',
    borderRadius: 28,
    padding: 22,
    marginBottom: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  statsTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  statsSubtitle: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '600',
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  periodButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#27272a',
    marginRight: 10,
    marginBottom: 10,
  },
  periodText: {
    color: '#d4d4d8',
    fontWeight: '600',
    fontSize: 13,
  },
  chartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartRingContainer: {
    width: 180,
    height: 180,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartRing: {
    width: 170,
    height: 170,
    borderRadius: 100,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartRingShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  chartCenter: {
    width: 110,
    height: 110,
    borderRadius: 100,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartCenterShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  chartValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  chartLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  segment: {
    position: 'absolute',
    width: 34,
    height: 14,
    borderRadius: 12,
    opacity: 0.96,
  },
  segment1: {
    top: 12,
    left: 74,
    backgroundColor: '#f97316',
    transform: [{ rotate: '8deg' }],
  },
  segment2: {
    top: 24,
    left: 120,
    backgroundColor: '#facc15',
    transform: [{ rotate: '22deg' }],
  },
  segment3: {
    top: 52,
    left: 136,
    backgroundColor: '#34d399',
    transform: [{ rotate: '44deg' }],
  },
  segment4: {
    top: 96,
    left: 136,
    backgroundColor: '#60a5fa',
    transform: [{ rotate: '90deg' }],
  },
  segment5: {
    top: 126,
    left: 118,
    backgroundColor: '#a78bfa',
    transform: [{ rotate: '132deg' }],
  },
  segment6: {
    top: 146,
    left: 74,
    backgroundColor: '#f472b6',
    transform: [{ rotate: '180deg' }],
  },
  segment7: {
    top: 132,
    left: 30,
    backgroundColor: '#38bdf8',
    transform: [{ rotate: '220deg' }],
  },
  segment8: {
    top: 92,
    left: 18,
    backgroundColor: '#fb7185',
    transform: [{ rotate: '260deg' }],
  },
  legendList: {
    flex: 1,
    marginLeft: 18,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendLabel: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '700',
  },
  legendValue: {
    color: '#9ca3af',
    fontSize: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    marginRight: 10,
    backgroundColor: '#111827',
  },
  summaryCardAccent: {
    backgroundColor: '#0f172a',
  },
  summaryCardAccent2: {
    backgroundColor: '#111827',
  },
  summaryCardAccent3: {
    backgroundColor: '#111827',
  },
  summarySmallLabel: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 10,
  },
  summarySmallValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
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
  sectionLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
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
  emptyText: {
    color: '#888',
    fontSize: 15,
    marginTop: 10,
  },
});

export default HomeScreen;
