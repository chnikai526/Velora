import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import SpendingCat from '../components/SpendingCat';
import TransactionFormModal from '../components/TransactionFormModal';
import CurrentBalanceCard from '../components/CurrentBalanceCard';
import CurrencyConverterCard from '../components/CurrencyConverterCard';
import colors from '../theme/colors';

const chartColors = ['#7184ff', '#ff5f7c', '#ffad4d', '#9c69e8', '#45c8a0', '#5d9cec'];
const money = (value) => `$${value.toFixed(2)}`;

const isInCurrentMonth = (item) => {
  const date = new Date(item.date || item.createdAt);
  const now = new Date();
  return date >= new Date(now.getFullYear(), now.getMonth(), 1) && date <= now;
};

function ExpenseDonut({ groups, total }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  if (!total) return <View style={styles.emptyDonut}><Text style={styles.emptyDonutText}>No expenses{`\n`}yet</Text></View>;
  return <View style={styles.donutWrap}><Svg width={132} height={132} viewBox="0 0 120 120"><Circle cx="60" cy="60" r={radius} stroke={colors.surfaceMuted} strokeWidth="15" fill="none" />{groups.map(([name, value], index) => { const length = (value / total) * circumference; const segment = <Circle key={name} cx="60" cy="60" r={radius} stroke={chartColors[index % chartColors.length]} strokeWidth="15" fill="none" strokeLinecap="butt" strokeDasharray={`${Math.max(length - 2, 0)} ${circumference - Math.max(length - 2, 0)}`} strokeDashoffset={-offset} rotation="-90" origin="60, 60" />; offset += length; return segment; })}</Svg><View style={styles.donutCenter}><Text style={styles.donutCenterLabel}>Spent</Text><Text style={styles.donutCenterValue}>{money(total)}</Text></View></View>;
}

export default function HomeScreen({ transactions, updateTransaction, settleTransaction, removeTransaction, navigation, route }) {
  const savedTransaction = route?.params?.savedTransaction;
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    if (!savedTransaction) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      navigation.setParams({ savedTransaction: undefined });
    }, 10000);

    return () => clearTimeout(timeout);
  }, [navigation, savedTransaction]);
  const { currentBalance, monthExpenses, income, expenses, friendCashflow, groups } = useMemo(() => {
    const month = transactions.filter(isInCurrentMonth);
    const monthExpenses = month.filter((item) => item.type === 'Expense');
    const income = month.filter((item) => item.type === 'Income').reduce((sum, item) => sum + item.amount, 0);
    const expenses = monthExpenses.reduce((sum, item) => sum + item.amount, 0);
    const groupMap = monthExpenses.reduce((all, item) => ({ ...all, [item.category || 'Other']: (all[item.category || 'Other'] || 0) + item.amount }), {});
    const activeFriendTransactions = month.filter(
      (item) =>
        (item.type === 'Borrowed' || item.type === 'Given') &&
        item.status !== 'settled'
    );
    const friendCashflow = activeFriendTransactions.filter((item) => item.type === 'Borrowed').reduce((sum, item) => sum + item.amount, 0) - activeFriendTransactions.filter((item) => item.type === 'Given').reduce((sum, item) => sum + item.amount, 0);
    const totalIncome = transactions.filter((item) => item.type === 'Income').reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = transactions.filter((item) => item.type === 'Expense').reduce((sum, item) => sum + item.amount, 0);
    const totalFriendCashflow = transactions.filter((item) => (item.type === 'Borrowed' || item.type === 'Given') && item.status !== 'settled').reduce((sum, item) => sum + (item.type === 'Borrowed' ? item.amount : -item.amount), 0);
    return { currentBalance: totalIncome - totalExpenses + totalFriendCashflow, monthExpenses: monthExpenses.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)), income, expenses, savings: income - expenses, friendCashflow, groups: Object.entries(groupMap).sort(([, a], [, b]) => b - a) };
  }, [transactions]);
  const firstDay = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
  const activeFriendTransactions = transactions.filter((item) => (item.type === 'Borrowed' || item.type === 'Given') && item.status !== 'settled');
  const confirmRemove = (transaction) => {
    Alert.alert('Delete transaction?', `Delete ${transaction.category || transaction.note || 'this transaction'} permanently?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeTransaction(transaction.id) },
    ]);
  };
  const saveEdit = (entry) => {
    const result = updateTransaction(editingTransaction.id, entry);
    if (!result.ok) {
      Alert.alert('Unable to save changes', result.message);
      return;
    }
    setEditingTransaction(null);
  };

  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.topRow}><View><Text style={styles.greeting}>Good day</Text><Text style={styles.title}>Your money overview</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>V</Text></View></View>
    {savedTransaction && <View style={styles.savedNotice}><Ionicons name="checkmark-circle" size={18} color={colors.success}/><Text style={styles.savedNoticeText}>Last {savedTransaction.type} Saved: {money(savedTransaction.amount)}</Text></View>}
    <CurrentBalanceCard balance={currentBalance} />
    <View style={styles.balanceCard}><Text style={styles.balanceLabel}>Spending overview</Text><Text style={styles.balanceValue}>{money(expenses)}</Text><Text style={styles.balanceCopy}>{firstDay} 1 – today</Text><SpendingCat expenses={expenses} income={income} friendCashflow={friendCashflow} /></View>
    <View style={styles.sectionHead}><Text style={styles.sectionTitle}>This month’s expenses</Text><Text style={styles.sectionMeta}>{monthExpenses.length} entries</Text></View>
    <View style={styles.analyticsCard}><ExpenseDonut groups={groups} total={expenses}/><View style={styles.legend}>{groups.slice(0, 4).map(([name, value], index)=><View key={name} style={styles.legendRow}><View style={[styles.legendDot,{backgroundColor:chartColors[index]}]}/><Text style={styles.legendName}>{name}</Text><Text style={styles.legendValue}>{Math.round((value / expenses) * 100)}%</Text></View>)}{groups.length === 0 && <Text style={styles.legendEmpty}>Add an expense to see your breakdown.</Text>}</View></View>
    
    <View style={styles.sectionHead}><View><Text style={styles.sectionTitle}>Expenses</Text><Text style={styles.sectionSub}>From the 1st of {firstDay}</Text></View><Text style={styles.sectionMeta}>Current month</Text></View>
    {monthExpenses.length === 0 ? <View style={styles.emptyState}><Ionicons name="receipt-outline" size={30} color={colors.primarySoft}/><Text style={styles.emptyTitle}>No expenses yet</Text><Text style={styles.emptyCopy}>Use the Add tab to record your first expense.</Text></View> : monthExpenses.map((item, index)=><View key={item.id} style={styles.transaction}><View style={[styles.transactionIcon,{backgroundColor:`${chartColors[index % chartColors.length]}22` }]}><Ionicons name="arrow-up" size={18} color={chartColors[index % chartColors.length]}/></View><View style={styles.transactionInfo}><Text style={styles.transactionName}>{item.category || item.note || 'Expense'}</Text><Text style={styles.transactionMeta}>{item.paymentMethod || 'Payment'} · {new Date(item.date || item.createdAt).toLocaleDateString()}</Text></View><View style={styles.transactionRight}><Text style={styles.transactionAmount}>-{money(item.amount)}</Text><View style={styles.transactionActions}><TouchableOpacity onPress={() => setEditingTransaction(item)}><Text style={styles.edit}>Edit</Text></TouchableOpacity><TouchableOpacity onPress={() => confirmRemove(item)}><Text style={styles.remove}>Remove</Text></TouchableOpacity></View></View></View>)}
    <View style={styles.sectionHead}><View><Text style={styles.sectionTitle}>Borrowed & Lent</Text><Text style={styles.sectionSub}>Open balances with friends</Text></View><Text style={styles.sectionMeta}>{activeFriendTransactions.length} active</Text></View>
    {activeFriendTransactions.length === 0 ? <View style={styles.emptyState}><Ionicons name="people-outline" size={30} color={colors.primarySoft}/><Text style={styles.emptyTitle}>No open friend balances</Text><Text style={styles.emptyCopy}>Use Friend in the Add tab to track money borrowed or lent.</Text></View> : activeFriendTransactions.map((item) => <View key={item.id} style={styles.transaction}><View style={styles.transactionIcon}><Ionicons name="people" size={18} color={colors.primarySoft}/></View><View style={styles.transactionInfo}><Text style={styles.transactionName}>{item.type === 'Borrowed' ? `You owe ${item.recipient || 'a friend'}` : `${item.recipient || 'A friend'} owes you`}</Text><Text style={styles.transactionMeta}>Created {new Date(item.date || item.createdAt).toLocaleDateString()}</Text></View><View style={styles.transactionRight}><Text style={styles.transactionAmount}>{money(item.amount)}</Text><View style={styles.transactionActions}><TouchableOpacity onPress={() => setEditingTransaction(item)}><Text style={styles.edit}>Edit</Text></TouchableOpacity><TouchableOpacity onPress={() => settleTransaction(item.id)}><Text style={styles.settled}>Mark settled</Text></TouchableOpacity></View></View></View>)}
    <TransactionFormModal visible={Boolean(editingTransaction)} transaction={editingTransaction} onClose={() => setEditingTransaction(null)} onSave={saveEdit} />
    <CurrencyConverterCard />
  </ScrollView></SafeAreaView>;
}

const styles=StyleSheet.create({safeArea:{flex:1,backgroundColor:colors.background},content:{padding:20,paddingBottom:110},topRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:10,marginBottom:20},greeting:{color:colors.textMuted,fontSize:14,marginBottom:4},title:{color:colors.text,fontSize:27,fontWeight:'800'},avatar:{width:42,height:42,borderRadius:21,backgroundColor:colors.primary,justifyContent:'center',alignItems:'center'},avatarText:{color:colors.text,fontWeight:'800',fontSize:16},savedNotice:{flexDirection:'row',alignItems:'center',gap:8,backgroundColor:colors.surface,marginBottom:16,padding:13,borderRadius:16,borderWidth:1,borderColor:colors.success},savedNoticeText:{color:colors.textSoft,fontSize:13,fontWeight:'700'},balanceCard:{overflow:'hidden',backgroundColor:'#3f2873',borderRadius:26,padding:22,marginBottom:24},balanceLabel:{color:'#e1cfbf',fontSize:14},balanceValue:{color:'#e1cfbf',fontSize:37,fontWeight:'800',marginTop:5,marginBottom:6},balanceCopy:{color:'#e1cfbf',fontSize:12},sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},sectionTitle:{color:colors.text,fontSize:19,fontWeight:'800'},sectionSub:{color:colors.textMuted,fontSize:12,marginTop:3},sectionMeta:{color:colors.primarySoft,fontSize:12,fontWeight:'700'},analyticsCard:{backgroundColor:colors.surface,borderRadius:24,borderWidth:1,borderColor:colors.border,padding:17,flexDirection:'row',alignItems:'center',marginBottom:25},donutWrap:{width:135,height:135,justifyContent:'center',alignItems:'center'},donutCenter:{position:'absolute',alignItems:'center'},donutCenterLabel:{color:colors.textMuted,fontSize:10},donutCenterValue:{color:colors.text,fontSize:13,fontWeight:'800',marginTop:3},emptyDonut:{width:105,height:105,borderRadius:53,borderWidth:14,borderColor:colors.surfaceMuted,justifyContent:'center',alignItems:'center'},emptyDonutText:{color:colors.textMuted,fontSize:11,textAlign:'center'},legend:{flex:1,paddingLeft:12},legendRow:{flexDirection:'row',alignItems:'center',marginBottom:12},legendDot:{width:8,height:8,borderRadius:4,marginRight:8},legendName:{color:colors.textSoft,fontSize:12,flex:1},legendValue:{color:colors.text,fontSize:12,fontWeight:'700'},legendEmpty:{color:colors.textMuted,fontSize:12,lineHeight:18},emptyState:{alignItems:'center',backgroundColor:colors.surface,borderRadius:22,borderWidth:1,borderColor:colors.border,padding:30,marginBottom:22},emptyTitle:{color:colors.text,fontSize:17,fontWeight:'700',marginTop:10},emptyCopy:{color:colors.textMuted,fontSize:13,textAlign:'center',marginTop:6},transaction:{backgroundColor:colors.surface,borderRadius:19,borderColor:colors.border,borderWidth:1,padding:13,flexDirection:'row',alignItems:'center',marginBottom:10},transactionIcon:{width:40,height:40,borderRadius:14,alignItems:'center',justifyContent:'center',marginRight:11,backgroundColor:colors.surfaceMuted},transactionInfo:{flex:1},transactionName:{color:colors.text,fontSize:14,fontWeight:'700',marginBottom:4},transactionMeta:{color:colors.textMuted,fontSize:11},transactionRight:{alignItems:'flex-end'},transactionAmount:{color:colors.dangerSoft,fontSize:14,fontWeight:'800',marginBottom:6},transactionActions:{flexDirection:'row',gap:10},edit:{color:colors.primarySoft,fontSize:11,fontWeight:'700'},settled:{color:colors.success,fontSize:11,fontWeight:'700'},remove:{color:colors.dangerSoft,fontSize:11,fontWeight:'700'}});
