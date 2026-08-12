import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ImageBackground, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import TransactionFormModal from '../components/TransactionFormModal';
import AnimatedVeloraCat from '../components/AnimatedVeloraCat';

const budget = 3000;
const formatMoney = (value) => `$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatDate = (value) => {
  const date = new Date(value);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  return `${isToday ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
};
const iconFor = (item) => {
  const value = `${item.category} ${item.note}`.toLowerCase();
  if (value.includes('coffee')) return ['cafe-outline', '#e9ad72'];
  if (value.includes('groc') || value.includes('food')) return ['basket-outline', '#c9a672'];
  if (value.includes('music') || value.includes('spotify')) return ['musical-notes-outline', '#ce9a91'];
  if (value.includes('shop') || value.includes('zara')) return ['bag-handle-outline', '#e2bf88'];
  return ['receipt-outline', '#d9a979'];
};

export default function HomeScreen({ transactions, updateTransaction, removeTransaction, currentUser }) {
  const [editing, setEditing] = useState(null);
  const { width } = useWindowDimensions();
  const { expenses, recent } = useMemo(() => {
    const expenseItems = transactions.filter((item) => item.type === 'Expense');
    return { expenses: expenseItems.reduce((sum, item) => sum + Number(item.amount || 0), 0), recent: [...expenseItems].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).slice(0, 5) };
  }, [transactions]);
  const remaining = Math.max(0, budget - expenses);
  const budgetRatio = Math.max(0, Math.min(1, remaining / budget));
  const userName = currentUser?.displayName?.trim().split(/\s+/)[0] || 'there';
  const cardWidth = Math.min(292, width - 66);
  const offsets = [0.06, 0.43, 0.1, 0.46, 0.14];
  const remove = (item) => Alert.alert('Delete transaction?', `Delete ${item.category || item.note || 'this transaction'} permanently?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => removeTransaction(item.id) }]);
  const save = (entry) => { const result = updateTransaction(editing.id, entry); if (result.ok) setEditing(null); else Alert.alert('Unable to save changes', result.message); };

  return <ImageBackground source={require('../../assets/mountain-background.png')} resizeMode="cover" style={styles.background}><CinematicOverlay /><SafeAreaView style={styles.safe}><Animated.ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Text style={styles.greeting}>Good morning, {userName} 👋</Text></View>
    <View style={styles.hero}><AnimatedVeloraCat budgetPercentage={budgetRatio * 100} foodLevel={budgetRatio * 100} /></View>
    <View style={styles.budgetLine}><View><Text style={styles.remaining}>{formatMoney(remaining)}</Text><Text style={styles.budgetEyebrow}>LEFT TO SPEND</Text></View><Text style={styles.percent}>{Math.round(budgetRatio * 100)}%</Text></View>
    <View style={styles.transactions}><TailString height={Math.max(170, recent.length * 93)} />
      {recent.length ? recent.map((item, index) => {
        const [icon, color] = iconFor(item);
        return <Animated.View key={item.id} entering={FadeInDown.delay(index * 85).duration(500)} style={[styles.cardWrap, { width: cardWidth, marginLeft: Math.max(0, (width - cardWidth) * offsets[index]) }]}><View style={styles.knot} /><TouchableOpacity activeOpacity={0.84} style={styles.row} onPress={() => setEditing(item)} onLongPress={() => remove(item)}>
          <View style={[styles.icon, { backgroundColor: `${color}20` }]}><Ionicons name={icon} size={19} color={color} /></View><View style={styles.info}><Text style={styles.name} numberOfLines={1}>{item.note || item.category || 'Expense'}</Text><Text style={styles.category}>{item.category || 'Expense'} · {formatDate(item.date || item.createdAt)}</Text></View><Text style={styles.amount}>−{formatMoney(item.amount)}</Text>
        </TouchableOpacity></Animated.View>;
      }) : <View style={styles.empty}><Ionicons name="fish-outline" size={27} color="#ddb47a" /><Text style={styles.emptyTitle}>The bowl is waiting</Text><Text style={styles.emptyCopy}>Add an expense and it will appear here.</Text></View>}
    </View>
    {recent.length > 0 && <Text style={styles.hint}>Tap a receipt to edit · Hold to delete</Text>}
    <TransactionFormModal visible={Boolean(editing)} transaction={editing} onClose={() => setEditing(null)} onSave={save} />
  </Animated.ScrollView></SafeAreaView></ImageBackground>;
}

function TailString({ height }) {
  const settle = useSharedValue(-1.8);
  useEffect(() => { settle.value = withSequence(withTiming(1.1, { duration: 360 }), withTiming(0, { duration: 900 })); }, [settle]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${settle.value}deg` }] }));
  return <Animated.View pointerEvents="none" style={[styles.string, { height }, animatedStyle]}><Svg width="100%" height="100%" viewBox={`0 0 360 ${height}`} preserveAspectRatio="none"><Path d={`M264 0 C286 31 194 41 237 72 S314 108 218 143 S120 ${height - 42} 169 ${height}`} fill="none" stroke="#d3a76f" strokeOpacity=".48" strokeWidth="1.15" strokeLinecap="round" /><Path d={`M266 0 C285 31 196 41 239 72`} fill="none" stroke="#fff1ce" strokeOpacity=".28" strokeWidth=".45" /></Svg></Animated.View>;
}

function CinematicOverlay() { return <Svg pointerEvents="none" style={styles.backdrop} width="100%" height="100%"><Defs><LinearGradient id="mountainShade" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#080605" stopOpacity=".54" /><Stop offset=".48" stopColor="#140b08" stopOpacity=".24" /><Stop offset="1" stopColor="#070504" stopOpacity=".72" /></LinearGradient></Defs><Rect width="100%" height="100%" fill="url(#mountainShade)" /></Svg>; }

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#090706' }, backdrop: { ...StyleSheet.absoluteFillObject }, safe: { flex: 1 }, content: { paddingHorizontal: 20, paddingBottom: 112 },
  header: { paddingTop: 13, paddingBottom: 25 }, greeting: { color: '#fff3df', fontSize: 23, fontWeight: '700', letterSpacing: -.4, textShadowColor: 'rgba(0,0,0,.8)', textShadowRadius: 10 },
  hero: { overflow: 'visible' },
  budgetLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 7 }, budgetEyebrow: { color: '#c6a27a', fontSize: 10, fontWeight: '800', letterSpacing: 1.15, marginTop: 2 }, remaining: { color: '#fff0d7', fontSize: 28, fontWeight: '700', letterSpacing: -.7, textShadowColor: 'rgba(0,0,0,.65)', textShadowRadius: 8 }, percent: { color: '#f1d0a0', fontSize: 11, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: 'rgba(117,74,43,.62)', borderWidth: 1, borderColor: 'rgba(245,210,161,.24)' },
  transactions: { position: 'relative', marginTop: 25, gap: 12 }, string: { position: 'absolute', top: -53, left: 0, right: 0, zIndex: 0 }, cardWrap: { zIndex: 1, position: 'relative' }, knot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, left: 19, top: -4, zIndex: 3, backgroundColor: '#c69663', borderWidth: 1, borderColor: '#f6d3a0' }, row: { minHeight: 63, padding: 11, flexDirection: 'row', alignItems: 'center', borderRadius: 18, backgroundColor: 'rgba(39,25,18,.46)', borderWidth: 1, borderColor: 'rgba(245,212,168,.2)', shadowColor: '#000', shadowOpacity: .24, shadowRadius: 12, shadowOffset: { width: 0, height: 7 }, elevation: 3 }, icon: { width: 37, height: 37, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginRight: 11 }, info: { flex: 1, minWidth: 0 }, name: { color: '#fff4e3', fontSize: 14, fontWeight: '700' }, category: { color: '#d6c0aa', fontSize: 10.5, marginTop: 4 }, amount: { color: '#f4b78e', fontSize: 13, fontWeight: '800', marginLeft: 8 },
  empty: { alignItems: 'center', paddingVertical: 35, borderRadius: 23, backgroundColor: 'rgba(39,25,18,.35)', borderWidth: 1, borderColor: 'rgba(245,212,168,.13)' }, emptyTitle: { color: '#fff1da', fontWeight: '700', marginTop: 10 }, emptyCopy: { color: '#d7c0aa', fontSize: 12, marginTop: 5 }, hint: { color: '#c3a78d', fontSize: 10.5, textAlign: 'center', marginTop: 18 },
});
