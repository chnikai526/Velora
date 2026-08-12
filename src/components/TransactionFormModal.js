import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Subscriptions', 'Travel', 'Others'];
const REPEAT_INTERVALS = ['Daily', 'Weekly', 'Monthly', 'Custom'];

const getInitialValues = (transaction) => ({
  amount: transaction?.amount ? String(transaction.amount) : '',
  category: transaction?.category || EXPENSE_CATEGORIES[0],
  note: transaction?.note || '',
  recurring: Boolean(transaction?.recurring),
  startDate: transaction?.date ? new Date(transaction.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
  time: transaction?.date ? new Date(transaction.date).toTimeString().slice(0, 5) : new Date().toTimeString().slice(0, 5),
  repeatInterval: transaction?.repeatInterval || 'Monthly',
  type: 'Expense',
});

export default function TransactionFormModal({ visible = true, transaction, onClose, onSave, fullScreen = false }) {
  const [values, setValues] = useState(getInitialValues(transaction));
  const isEditing = Boolean(transaction);

  useEffect(() => {
    if (visible) {
      setValues(getInitialValues(transaction));
    }
  }, [transaction, visible]);

  const save = () => {
    const date = new Date(`${values.startDate}T${values.time || '00:00'}`);
    onSave({ ...values, date: Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString() });
  };

  const form = <View style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{isEditing ? 'Edit expense' : 'New expense'}</Text>
            <Text style={styles.title}>{isEditing ? 'Update your record' : 'Add an expense'}</Text>
          </View>
          <TouchableOpacity accessibilityLabel="Close transaction form" onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.amountCard}>
            <Text style={styles.fieldLabel}>Amount</Text>
            <View style={styles.amountRow}><Text style={styles.currency}>$</Text><TextInput value={values.amount} onChangeText={(amount) => setValues((current) => ({ ...current, amount }))} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textMuted} style={styles.amountInput} /></View>
          </View>
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {EXPENSE_CATEGORIES.map((item) => <TouchableOpacity key={item} onPress={() => setValues((current) => ({ ...current, category: item }))} style={[styles.chip, values.category === item && styles.chipActive]}><Text style={[styles.chipText, values.category === item && styles.chipTextActive]}>{item}</Text></TouchableOpacity>)}
            </ScrollView>
            <TextInput value={values.note} onChangeText={(note) => setValues((current) => ({ ...current, note }))} placeholder="Description (optional)" placeholderTextColor={colors.textMuted} style={styles.input} />
            <View style={styles.settingRow}><View><Text style={styles.settingTitle}>Repeat this transaction</Text><Text style={styles.settingCopy}>Set up a recurring entry</Text></View><Switch value={values.recurring} onValueChange={(recurring) => setValues((current) => ({ ...current, recurring }))} trackColor={{ false: colors.borderStrong, true: colors.primary }} thumbColor={colors.text} /></View>
            {values.recurring && <View style={styles.schedule}>
              <Text style={styles.fieldLabel}>Start date</Text><TextInput value={values.startDate} onChangeText={(startDate) => setValues((current) => ({ ...current, startDate }))} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} style={styles.input} />
              <Text style={styles.fieldLabel}>Time</Text><TextInput value={values.time} onChangeText={(time) => setValues((current) => ({ ...current, time }))} placeholder="HH:MM" placeholderTextColor={colors.textMuted} style={styles.input} />
              <Text style={styles.fieldLabel}>Repeat interval</Text><View style={styles.intervalRow}>{REPEAT_INTERVALS.map((item) => <TouchableOpacity key={item} onPress={() => setValues((current) => ({ ...current, repeatInterval: item }))} style={[styles.interval, values.repeatInterval === item && styles.intervalActive]}><Text style={[styles.intervalText, values.repeatInterval === item && styles.intervalTextActive]}>{item}</Text></TouchableOpacity>)}</View>
            </View>}
          </View>
          <TouchableOpacity onPress={save} style={styles.saveButton}><Text style={styles.saveText}>{isEditing ? 'Save changes' : 'Save transaction'}</Text></TouchableOpacity>
        </ScrollView>
      </View>;
  return fullScreen ? form : <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>{form}</Modal>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: 28 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, marginBottom: 22 },
  eyebrow: { color: colors.primarySoft, textTransform: 'uppercase', letterSpacing: 1.3, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', maxWidth: 260 },
  closeButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMuted },
  content: { padding: 24, paddingTop: 0, paddingBottom: 44 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 18 }, typeButton: { flex: 1, alignItems: 'center', paddingVertical: 15, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, typeButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary }, typeText: { color: colors.textMuted, fontWeight: '700' }, typeTextActive: { color: colors.text },
  amountCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary, borderRadius: 28, padding: 22, marginBottom: 16 }, fieldLabel: { color: colors.textSoft, fontSize: 14, fontWeight: '700', marginBottom: 12 }, amountRow: { flexDirection: 'row', alignItems: 'center' }, currency: { color: colors.textMuted, fontSize: 34, fontWeight: '700', marginRight: 10 }, amountInput: { flex: 1, color: colors.text, fontSize: 40, fontWeight: '800', paddingVertical: 2 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 28, padding: 20, marginBottom: 18 }, chips: { gap: 8, paddingBottom: 22 }, chip: { backgroundColor: colors.surfaceMuted, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: colors.border }, chipActive: { backgroundColor: '#12314a', borderColor: colors.primary }, chipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' }, chipTextActive: { color: colors.primarySoft },
  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }, method: { width: '47%', backgroundColor: colors.surfaceMuted, borderRadius: 14, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border }, methodActive: { borderColor: colors.primary, backgroundColor: '#12314a' }, methodText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' }, methodTextActive: { color: colors.text }, input: { backgroundColor: colors.surfaceMuted, borderRadius: 16, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15, paddingVertical: 14, color: colors.text, marginBottom: 18 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, settingTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 4 }, settingCopy: { color: colors.textMuted, fontSize: 12 }, schedule: { marginTop: 22 }, intervalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, interval: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 14, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border }, intervalActive: { borderColor: colors.primary, backgroundColor: '#12314a' }, intervalText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' }, intervalTextActive: { color: colors.primarySoft }, saveButton: { backgroundColor: colors.primary, borderRadius: 20, alignItems: 'center', paddingVertical: 17 }, saveText: { color: colors.text, fontWeight: '800', fontSize: 16 },
});
