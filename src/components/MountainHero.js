import React, { useEffect } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Polygon, Stop } from 'react-native-svg';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

const AView = Animated.createAnimatedComponent(View);
const ASvg = Animated.createAnimatedComponent(Svg);

export default function MountainHero({ spent, budget, scrollY }) {
  const dark = useColorScheme() !== 'light';
  const remaining = Math.max(0, 1 - spent / budget);
  const mood = remaining > .5 ? 'bright' : remaining > .2 ? 'calm' : 'concerned';
  const cloud = useSharedValue(0);
  const breath = useSharedValue(0);
  const blink = useSharedValue(1);
  const tail = useSharedValue(0);
  const ear = useSharedValue(0);
  const tilt = useSharedValue(0);
  useEffect(() => {
    cloud.value = withRepeat(withTiming(1, { duration: 24000, easing: Easing.linear }), -1, true);
    breath.value = withRepeat(withSequence(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.ease) })), -1);
    tail.value = withRepeat(withSequence(withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: 3400, easing: Easing.inOut(Easing.ease) })), -1);
    ear.value = withRepeat(withSequence(withTiming(0, { duration: 5000 }), withTiming(1, { duration: 160 }), withTiming(0, { duration: 220 })), -1);
    tilt.value = withRepeat(withSequence(withTiming(0, { duration: 6200 }), withTiming(1, { duration: 550, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: 550, easing: Easing.inOut(Easing.ease) })), -1);
    blink.value = withRepeat(withSequence(withTiming(1, { duration: 4200 }), withTiming(.08, { duration: 100 }), withTiming(1, { duration: 130 })), -1);
  }, [blink, breath, cloud, ear, tail, tilt]);
  const cloudStyle = useAnimatedStyle(() => ({ transform: [{ translateX: interpolate(cloud.value, [0, 1], [-10, 24]) }, { translateY: scrollY ? scrollY.value * .02 : 0 }] }));
  const farStyle = useAnimatedStyle(() => ({ transform: [{ translateY: scrollY ? scrollY.value * .04 : 0 }] }));
  const nearStyle = useAnimatedStyle(() => ({ transform: [{ translateY: scrollY ? scrollY.value * .12 : 0 }] }));
  const catStyle = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(breath.value, [0, 1], [0, -3]) }, { rotate: `${interpolate(tilt.value, [0, 1], [0, 1.2])}deg` }] }));
  const eyeStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: blink.value }] }));
  const tailStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${interpolate(tail.value, [0, 1], [-3, 5])}deg` }] }));
  const earStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${interpolate(ear.value, [0, 1], [0, -8])}deg` }] }));
  const colors = dark ? { sky1: '#122039', sky2: '#e79968', mountain: '#273b49', snow: '#d8e4e6', pine: '#183b39', grass: '#31513e', rock: '#3a423e', fur: mood === 'concerned' ? '#786452' : '#a97651', bowl: '#f2dec0', ink: '#2c2924', cloud: '#eaf0ee' } : { sky1: '#b8d7e7', sky2: '#f5bb87', mountain: '#7899a4', snow: '#f2f6f4', pine: '#3c6b57', grass: '#669362', rock: '#6c746b', fur: '#b87853', bowl: '#fff0d5', ink: '#40352d', cloud: '#fffdf6' };
  const coins = Math.round(remaining * 6);
  return <View style={styles.scene}>
    <Svg width="100%" height="100%" viewBox="0 0 393 430" preserveAspectRatio="xMidYMid slice">
      <Defs><LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={colors.sky1}/><Stop offset="1" stopColor={colors.sky2}/></LinearGradient></Defs>
      <Path d="M0 0h393v430H0z" fill="url(#sky)" />
      <Circle cx="328" cy="103" r="28" fill="#ffe0a2" opacity=".72" />
    </Svg>
    <AView style={[styles.layer, cloudStyle]}><Svg width="100%" height="100%" viewBox="0 0 393 430"><Path d="M-28 121 C14 96 42 110 60 132 C91 108 126 122 138 145 L-28 145z" fill={colors.cloud} opacity=".35"/><Path d="M226 75 C251 54 285 62 296 85 C322 64 359 76 372 100 L222 100z" fill={colors.cloud} opacity=".32"/></Svg></AView>
    <AView style={[styles.layer, farStyle]}><Svg width="100%" height="100%" viewBox="0 0 393 430"><Polygon points="0,241 104,106 174,225 249,87 393,237" fill={colors.mountain}/><Polygon points="104,106 78,160 109,142 133,170" fill={colors.snow} opacity=".88"/><Polygon points="249,87 211,160 250,135 285,168" fill={colors.snow} opacity=".88"/><Path d="M0 244 C96 205 239 224 393 196v105H0z" fill="#233d44" opacity=".6"/></Svg></AView>
    <AView style={[styles.layer, nearStyle]}><Svg width="100%" height="100%" viewBox="0 0 393 430"><Path d="M0 285l25-73 25 73h-13l21 49H0zm338 0 25-83 30 83h-17l17 55h-72z" fill={colors.pine}/><Path d="M45 302l20-59 23 59h-13l15 37H25zm250 12 21-68 24 68h-14l17 47h-65z" fill={colors.pine}/><Path d="M0 333 C67 292 102 349 173 320 C235 295 300 336 393 301 V430H0z" fill={colors.grass}/><Path d="M80 351 C101 315 161 304 207 329 C226 341 229 365 210 376 C160 394 97 385 80 351z" fill={colors.rock}/><Path d="M102 344 C128 325 177 324 199 342" stroke="#7d8c7c" strokeWidth="3" fill="none" opacity=".5"/><Path d="M0 385 C85 326 140 410 202 357 C275 297 325 374 393 346" stroke="#d9b56c" strokeWidth="12" fill="none" opacity=".9"/></Svg></AView>
    <AView style={[styles.cat, tailStyle]}><Svg width="130" height="100" viewBox="0 0 130 100"><Path d="M82 62 C118 50 126 72 112 84 C102 92 92 88 94 79" fill="none" stroke={colors.fur} strokeWidth="15" strokeLinecap="round"/></Svg></AView>
    <AView style={[styles.cat, catStyle]}><Svg width="180" height="180" viewBox="0 0 180 180"><Path d="M47 76 L51 35 79 62 M104 62 L132 35 135 78" fill={colors.fur}/><Path d="M34 92 C34 58 143 56 148 105 C153 148 117 150 91 139 C52 153 28 134 34 92" fill={colors.fur}/><Path d="M53 109 C64 120 117 120 132 108" stroke="#d6a27c" strokeWidth="2" fill="none" opacity=".55"/><Circle cx="89" cy="102" r="4" fill="#5a3b33"/><Path d={mood === 'bright' ? 'M79 111 Q89 119 100 111' : 'M81 114 Q89 110 98 114'} stroke={colors.ink} strokeWidth="2.5" fill="none" strokeLinecap="round"/></Svg><ASvg style={[styles.ear, earStyle]} width="36" height="50" viewBox="0 0 36 50"><Path d="M4 45 L10 4 33 39" fill="#c98764"/></ASvg><ASvg style={[styles.eye, eyeStyle]} width="102" height="25" viewBox="0 0 102 25"><Path d="M11 13q10-9 20 0M70 13q10-9 20 0" stroke={colors.ink} strokeWidth="4" fill="none" strokeLinecap="round"/></ASvg></AView>
    <View style={styles.bowl}><Svg width="156" height="86" viewBox="0 0 156 86"><Path d="M8 18 C15 79 142 79 148 18z" fill={colors.bowl}/><Path d="M8 18 C12 2 143 2 148 18 C139 40 19 40 8 18z" fill="#5c765d"/><Path d="M13 20 C38 8 116 8 143 20" stroke="#fff4d9" strokeWidth="4" fill="none" opacity=".75"/>{[0,1,2,3,4,5].map((coin) => coin < coins && <Circle key={coin} cx={43 + coin * 14} cy={19 - (coin % 2) * 4} r="6" fill="#f6c85f"/>)}<Path d="M8 18 C15 79 142 79 148 18" stroke="#c6a77c" strokeWidth="2" fill="none"/></Svg></View>
    <View style={styles.readout}><Text style={[styles.amount, { color: colors.ink }]}>${spent.toLocaleString('en-US', { maximumFractionDigits: 0 })}</Text><Text style={[styles.caption, { color: colors.ink }]}>spent of ${budget.toLocaleString()} this month</Text></View>
  </View>;
}

const styles = StyleSheet.create({ scene: { height: 430, overflow: 'hidden', borderRadius: 30, backgroundColor: '#17263b' }, layer: { ...StyleSheet.absoluteFillObject }, cat: { position: 'absolute', width: 180, height: 180, top: 164, left: '27%' }, eye: { position: 'absolute', left: 39, top: 87, width: 102, height: 25 }, ear: { position: 'absolute', left: 98, top: 25, width: 36, height: 50 }, bowl: { position: 'absolute', width: 156, height: 86, left: '30%', top: 305 }, readout: { position: 'absolute', alignItems: 'center', width: '100%', top: 379 }, amount: { fontSize: 24, fontWeight: '800' }, caption: { fontSize: 12, opacity: .72, marginTop: 1 } });
