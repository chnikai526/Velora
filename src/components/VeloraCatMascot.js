import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';

// Each mood has an "asleep" resting pose and an "awake" pose. The mascot
// plays a brief wake-up (crossfade + scale pop) then settles back to sleep,
// triggered by a change to `wakeSignal` (and once on mount).
const ASSETS = {
  happy: { awake: require('../../assets/cat/happy-awake.png'), asleep: require('../../assets/cat/happy-asleep.png') },
  worried: { awake: require('../../assets/cat/worried-awake.png'), asleep: require('../../assets/cat/worried-asleep.png') },
  mad: { awake: require('../../assets/cat/mad-awake.png'), asleep: require('../../assets/cat/mad-asleep.png') },
};
const ASSET_ASPECT = 900 / 600;

export default function VeloraCatMascot({ size = 200, mood = 'happy', wakeSignal = 0 }) {
  const height = size / ASSET_ASPECT;
  const wake = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    wake.value = withSequence(
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
      withDelay(1500, withTiming(0, { duration: 550, easing: Easing.inOut(Easing.cubic) })),
    );
    scale.value = withSequence(
      withTiming(1.07, { duration: 260, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 320, easing: Easing.out(Easing.quad) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wakeSignal]);

  const asleepStyle = useAnimatedStyle(() => ({ opacity: 1 - wake.value }));
  const awakeStyle = useAnimatedStyle(() => ({ opacity: wake.value }));
  const bounceStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const set = ASSETS[mood] || ASSETS.happy;

  return (
    <Animated.View style={[{ width: size, height }, bounceStyle]}>
      <Animated.Image source={set.asleep} resizeMode="contain" style={[styles.fill, asleepStyle]} />
      <Animated.Image source={set.awake} resizeMode="contain" style={[styles.fill, awakeStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
});
