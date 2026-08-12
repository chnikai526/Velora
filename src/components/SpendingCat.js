import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Ellipse, Path } from 'react-native-svg';

const catHero = require('../../assets/cat-bowl-hero-v2.png');
const catHeroEyesOpen = require('../../assets/cat-bowl-eyes-open.png');
const AnimatedImage = Animated.createAnimatedComponent(Image);
const moods = { content: 0, calm: .2, tired: .45, sad: .72, empty: 1 };

const getMood = (ratio) => ratio <= 0 ? 'empty' : ratio < .25 ? 'sad' : ratio < .5 ? 'tired' : ratio < .75 ? 'calm' : 'content';

function CropLayer({ frame, source = catHero, style }) {
  return <View pointerEvents="none" style={[styles.crop, frame]}><AnimatedImage source={source} resizeMode="cover" style={[styles.cropImage, { left: -frame.left, top: -frame.top }, style]} /></View>;
}

export default function SpendingCat({ budgetRatio }) {
  const ratio = Math.max(0, Math.min(1, budgetRatio));
  const mood = getMood(ratio);
  const breath = useSharedValue(0);
  const head = useSharedValue(0);
  const ears = useSharedValue(0);
  const paw = useSharedValue(0);
  const tail = useSharedValue(0);
  const whiskers = useSharedValue(0);
  const eyes = useSharedValue(0);
  const food = useSharedValue(ratio);
  const moodWeight = useSharedValue(moods[mood]);

  useEffect(() => {
    const slow = mood === 'sad' || mood === 'empty';
    const pace = slow ? 3800 : mood === 'content' ? 2300 : 2900;
    breath.value = withRepeat(withSequence(withTiming(1, { duration: pace, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: pace, easing: Easing.inOut(Easing.sin) })), -1, false);
    head.value = withRepeat(withSequence(withDelay(1700, withTiming(1, { duration: pace + 400, easing: Easing.inOut(Easing.sin) })), withTiming(0, { duration: pace + 400, easing: Easing.inOut(Easing.sin) })), -1, false);
    ears.value = withRepeat(withSequence(withDelay(2500, withTiming(1, { duration: 210, easing: Easing.out(Easing.quad) })), withTiming(0, { duration: 530, easing: Easing.inOut(Easing.quad) }), withDelay(2600, withTiming(0, { duration: 1 }))), -1, false);
    paw.value = withRepeat(withSequence(withDelay(5300, withTiming(1, { duration: 460, easing: Easing.inOut(Easing.quad) })), withTiming(0, { duration: 700, easing: Easing.inOut(Easing.quad) })), -1, false);
    tail.value = withRepeat(withSequence(withDelay(1100, withTiming(1, { duration: pace, easing: Easing.inOut(Easing.sin) })), withTiming(0, { duration: pace, easing: Easing.inOut(Easing.sin) })), -1, false);
    whiskers.value = withRepeat(withSequence(withDelay(3000, withTiming(1, { duration: 420, easing: Easing.inOut(Easing.quad) })), withTiming(0, { duration: 680, easing: Easing.inOut(Easing.quad) })), -1, false);
    eyes.value = withRepeat(withSequence(withDelay(3400, withTiming(1, { duration: 150, easing: Easing.inOut(Easing.quad) })), withDelay(mood === 'content' ? 900 : mood === 'calm' ? 580 : 280, withTiming(0, { duration: 150, easing: Easing.inOut(Easing.quad) }))), -1, false);
    moodWeight.value = withTiming(moods[mood], { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [breath, ears, eyes, head, mood, moodWeight, paw, tail, whiskers]);

  useEffect(() => { food.value = withTiming(ratio, { duration: 680, easing: Easing.inOut(Easing.cubic) }); }, [food, ratio]);

  const chestStyle = useAnimatedStyle(() => ({ transform: [{ translateY: breath.value * -1.5 }, { scaleY: 1 + breath.value * .018 }] }));
  const headStyle = useAnimatedStyle(() => ({ transform: [{ translateY: 1 + head.value * -1.5 + moodWeight.value * 4 }, { rotate: `${-0.4 + head.value * .8 - moodWeight.value * .7}deg` }] }));
  const awakeHeadStyle = useAnimatedStyle(() => ({ opacity: eyes.value, transform: [{ translateY: 1 + head.value * -1.5 + moodWeight.value * 4 }, { rotate: `${-0.4 + head.value * .8 - moodWeight.value * .7}deg` }] }));
  const earStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${ears.value * -4 - moodWeight.value * 7}deg` }, { translateY: moodWeight.value * 2 }] }));
  const pawStyle = useAnimatedStyle(() => ({ transform: [{ translateY: paw.value * -2 }] }));
  const tailStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${-3 + tail.value * 6 - moodWeight.value * 3}deg` }] }));
  const whiskerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: whiskers.value * 1.5 }] }));
  const maskStyle = useAnimatedStyle(() => ({ opacity: .78 * (1 - food.value) }));
  const foodStyle = useAnimatedStyle(() => ({ opacity: food.value, transform: [{ scaleX: Math.max(.04, food.value) }, { scaleY: .55 + food.value * .45 }] }));

  return <View style={styles.stage} accessibilityLabel={`Budget cat is ${mood}. ${Math.round(ratio * 100)} percent of budget remains.`}>
    <View style={styles.aura} />
    <Image source={catHero} resizeMode="cover" style={styles.base} />
    <CropLayer frame={styles.chestCrop} style={chestStyle} />
    <CropLayer frame={styles.headCrop} style={headStyle} />
    <CropLayer frame={styles.headCrop} source={catHeroEyesOpen} style={awakeHeadStyle} />
    <CropLayer frame={styles.earCrop} style={earStyle} />
    <CropLayer frame={styles.pawCrop} style={pawStyle} />
    <CropLayer frame={styles.tailCrop} style={tailStyle} />
    <Animated.View pointerEvents="none" style={[styles.foodMask, maskStyle]} />
    <Animated.View pointerEvents="none" style={[styles.foodLayer, foodStyle]}><Kibble /></Animated.View>
    <Animated.View pointerEvents="none" style={[styles.whiskers, whiskerStyle]}><Svg width="86" height="42" viewBox="0 0 86 42"><Path d="M14 18 L1 13 M16 23 L0 25 M67 18 L85 13 M67 23 L85 26" stroke="#e4bf91" strokeOpacity=".55" strokeWidth="1" strokeLinecap="round" /></Svg></Animated.View>
  </View>;
}

function Kibble() {
  const pieces = [[125,176],[137,180],[148,174],[158,181],[169,175],[181,181],[193,174],[205,180],[216,176],[132,184],[145,187],[156,182],[171,187],[184,183],[197,188],[209,184],[151,191],[165,193],[179,190],[192,193]];
  return <Svg width="100%" height="100%" viewBox="0 0 290 228"><Ellipse cx="145" cy="184" rx="92" ry="12" fill="#583018" opacity=".9" />{pieces.map(([cx, cy], index) => <Ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={index % 3 === 0 ? 3.5 : 3} ry={index % 2 === 0 ? 2.2 : 2.6} fill={index % 3 === 0 ? '#d08a47' : index % 2 === 0 ? '#a95f2b' : '#77401d'} />)}</Svg>;
}

const styles = StyleSheet.create({
  stage: { height: 232, width: '100%', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible' },
  aura: { position: 'absolute', width: 210, height: 118, bottom: 8, borderRadius: 110, backgroundColor: '#c77038', opacity: .16, transform: [{ scaleX: 1.25 }] },
  base: { position: 'absolute', width: 280, height: 232 },
  crop: { position: 'absolute', overflow: 'hidden' }, cropImage: { position: 'absolute', width: 280, height: 232 },
  chestCrop: { left: 65, top: 76, width: 145, height: 105 },
  headCrop: { left: 18, top: 5, width: 148, height: 125 },
  earCrop: { left: 70, top: 0, width: 76, height: 62 },
  pawCrop: { left: 97, top: 94, width: 58, height: 77 },
  tailCrop: { left: 170, top: 94, width: 102, height: 118, transformOrigin: '18px 9px' },
  foodMask: { position: 'absolute', width: 188, height: 26, bottom: 61, borderRadius: 100, backgroundColor: '#180c08' },
  foodLayer: { position: 'absolute', width: 242, height: 190, bottom: 0 },
  whiskers: { position: 'absolute', left: '37%', top: 92, opacity: .8 },
});
