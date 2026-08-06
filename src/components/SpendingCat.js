import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path } from 'react-native-svg';

const getMood = (expenses) => {
  if (expenses < 500) return 'sleeping';
  if (expenses < 1000) return 'awake';
  if (expenses < 1500) return 'staring';
  if (expenses < 2000) return 'worried';
  return 'angry';
};

const moodCopy = {
  sleeping: 'Chilling · keep it cozy',
  awake: 'Eyes open · looking good',
  staring: 'Keeping a close watch',
  worried: 'A little worried now',
  angry: 'Budget alert · slow it down',
};

function Eyes({ mood }) {
  if (mood === 'sleeping') return <><Path d="M87 95 Q96 103 105 95" stroke="#1b1521" strokeWidth="4" fill="none" strokeLinecap="round" /><Path d="M130 95 Q139 103 148 95" stroke="#1b1521" strokeWidth="4" fill="none" strokeLinecap="round" /></>;
  if (mood === 'awake') return <><Ellipse cx="96" cy="96" rx="8" ry="4" fill="#d8c3a9" /><Ellipse cx="139" cy="96" rx="8" ry="4" fill="#d8c3a9" /><Circle cx="96" cy="96" r="2.5" fill="#1b1521" /><Circle cx="139" cy="96" r="2.5" fill="#1b1521" /></>;
  if (mood === 'staring') return <><Ellipse cx="96" cy="96" rx="9" ry="8" fill="#e8d8c0" /><Ellipse cx="139" cy="96" rx="9" ry="8" fill="#e8d8c0" /><Circle cx="96" cy="96" r="3" fill="#17111b" /><Circle cx="139" cy="96" r="3" fill="#17111b" /></>;
  if (mood === 'worried') return <><Ellipse cx="96" cy="96" rx="11" ry="13" fill="#f4eadb" /><Ellipse cx="139" cy="96" rx="11" ry="13" fill="#f4eadb" /><Circle cx="96" cy="98" r="4" fill="#33263b" /><Circle cx="139" cy="98" r="4" fill="#33263b" /><Path d="M84 82 L104 87 M130 87 L150 82" stroke="#1b1521" strokeWidth="4" strokeLinecap="round" /></>;
  return <><Ellipse cx="96" cy="96" rx="10" ry="11" fill="#ff5365" /><Ellipse cx="139" cy="96" rx="10" ry="11" fill="#ff5365" /><Circle cx="96" cy="97" r="3.5" fill="#1b1521" /><Circle cx="139" cy="97" r="3.5" fill="#1b1521" /><Path d="M84 84 L105 91 M151 84 L130 91" stroke="#1b1521" strokeWidth="5" strokeLinecap="round" /></>;
}

export default function SpendingCat({ expenses, income, friendCashflow }) {
  const mood = getMood(expenses);
  const float = useRef(new Animated.Value(0)).current;
  const breath = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animations = Animated.parallel([
      Animated.loop(Animated.sequence([Animated.timing(float, { toValue: -8, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }), Animated.timing(float, { toValue: 8, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })]), { resetBeforeIteration: false }),
      Animated.loop(Animated.sequence([Animated.timing(breath, { toValue: 0.68, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }), Animated.timing(breath, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true })])),
    ]);
    animations.start();
    return () => animations.stop();
  }, [breath, float]);

  const catMotion = { opacity: breath, transform: [{ translateY: float }] };
  return <>
    <Animated.View style={catMotion}>
    <Svg width="100%" height={218} viewBox="0 0 330 205">
      <Path d="M206 143 C236 157 244 160 262 154" stroke="#d76a38" strokeWidth="30" fill="none" strokeLinecap="butt" />
      <Path d="M262 154 C280 149 292 142 305 130" stroke="#e8a246" strokeWidth="30" fill="none" strokeLinecap="butt" />
      <Path d="M305 130 C317 120 321 108 322 97" stroke="#5d9d9d" strokeWidth="30" fill="none" strokeLinecap="round" />
      <Ellipse cx="172" cy="118" rx="86" ry="58" fill="#33242a" />
      <Ellipse cx="170" cy="122" rx="77" ry="52" fill="#3d2b30" opacity=".75" />
      <Ellipse cx="105" cy="122" rx="56" ry="48" fill="#3a292e" />
      <Path d="M61 93 L69 58 L92 83" fill="#3a292e" /><Path d="M63 85 L69 66 L82 84" fill="#e18174" />
      <Path d="M137 82 L160 54 L164 96" fill="#3a292e" /><Path d="M146 80 L158 63 L160 89" fill="#e18174" />
      <Eyes mood={mood} />
      <Path d="M112 110 L119 114 L126 109" fill="#dc7c79" /><Path d="M118 115 Q118 123 109 123 M118 115 Q120 123 129 122" stroke="#21161d" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Line x1="78" y1="113" x2="44" y2="107" stroke="#d9aa9c" strokeWidth="2" strokeLinecap="round" /><Line x1="79" y1="120" x2="45" y2="124" stroke="#d9aa9c" strokeWidth="2" strokeLinecap="round" /><Line x1="155" y1="113" x2="182" y2="106" stroke="#d9aa9c" strokeWidth="2" strokeLinecap="round" /><Line x1="155" y1="120" x2="184" y2="125" stroke="#d9aa9c" strokeWidth="2" strokeLinecap="round" />
      <Ellipse cx="88" cy="158" rx="37" ry="16" fill="#2b1e25" /><Ellipse cx="154" cy="160" rx="39" ry="17" fill="#2b1e25" />
    </Svg>
    </Animated.View>
    <TextRows mood={mood} expenses={expenses} income={income} friendCashflow={friendCashflow} />
  </>;
}

function TextRows({ mood, expenses, income, friendCashflow }) {
  return <View><Text style={styles.mood}>{moodCopy[mood]}</Text><View style={styles.tailLegend}><View style={styles.tailItem}><View style={[styles.dot, { backgroundColor: '#d76a38' }]} /><Text style={styles.label}>Expenses</Text><Text style={styles.value}>${expenses.toFixed(0)}</Text></View><View style={styles.tailItem}><View style={[styles.dot, { backgroundColor: '#e8a246' }]} /><Text style={styles.label}>Earnings</Text><Text style={styles.value}>${income.toFixed(0)}</Text></View><View style={styles.tailItem}><View style={[styles.dot, { backgroundColor: '#5d9d9d' }]} /><Text style={styles.label}>Friends</Text><Text style={styles.value}>{friendCashflow < 0 ? '−' : '+'}${Math.abs(friendCashflow).toFixed(0)}</Text></View></View></View>;
}
const styles = StyleSheet.create({ mood:{ color:'#e1cfbf', fontSize:13, fontWeight:'700', marginTop:-5, marginBottom:13 }, tailLegend:{ flexDirection:'row', justifyContent:'space-between', gap:8 }, tailItem:{ flex:1 }, dot:{ width:8, height:8, borderRadius:4, marginBottom:5 }, label:{ color:'#b8a9a4', fontSize:10 }, value:{ color:'#f7e8db', fontSize:13, fontWeight:'800', marginTop:2 } });
