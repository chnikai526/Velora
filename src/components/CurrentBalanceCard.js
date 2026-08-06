import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

export default function CurrentBalanceCard({ balance }) {
  const amount = `${balance < 0 ? '−' : ''}$${Math.abs(balance).toFixed(2)}`;
  const glow = useRef(new Animated.Value(0.72)).current;
  const lift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(glow, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(lift, { toValue: -3, duration: 1200, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(glow, { toValue: 0.72, duration: 1200, useNativeDriver: true }),
        Animated.timing(lift, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    ]));
    animation.start();
    return () => animation.stop();
  }, [glow, lift]);

  return <Animated.View style={[styles.card, { opacity: glow, transform: [{ translateY: lift }] }]}><View style={styles.header}><View><Text style={styles.label}>Current balance</Text><Text style={styles.copy}>Income, expenses and active friend balances</Text></View><View style={styles.icon}><Ionicons name="wallet-outline" size={21} color={colors.text}/></View></View><Text style={[styles.amount, balance < 0 && styles.negative]}>{amount}</Text></Animated.View>;
}

const styles = StyleSheet.create({
  card:{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:24,padding:20,marginBottom:18},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'},label:{color:colors.text,fontSize:16,fontWeight:'800',marginBottom:5},copy:{color:colors.textMuted,fontSize:11,maxWidth:230},icon:{width:40,height:40,alignItems:'center',justifyContent:'center',borderRadius:14,backgroundColor:colors.primary},amount:{color:colors.success,fontSize:32,fontWeight:'800',marginTop:22},negative:{color:colors.dangerSoft},
});
