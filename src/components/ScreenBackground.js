import React, { useId } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme';

// Near-black canvas with a soft amber glow at the top — used behind the
// sign-in and loading screens. Gradients are sized in pixels from the window
// so the glow stays a wide circle instead of stretching with the screen.
export default function ScreenBackground({ children, style }) {
  const { width, height } = useWindowDimensions();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  return (
    <View style={[styles.bg, style]}>
      <Svg style={StyleSheet.absoluteFill} width={width} height={height} pointerEvents="none">
        <Defs>
          <RadialGradient id={`top${uid}`} gradientUnits="userSpaceOnUse" cx={width / 2} cy={-width * 0.15} r={width * 1.1} fx={width / 2} fy={-width * 0.15}>
            <Stop offset="0" stopColor="#D9914A" stopOpacity="0.55" />
            <Stop offset="0.5" stopColor="#6E3F1C" stopOpacity="0.22" />
            <Stop offset="1" stopColor={colors.bg} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id={`bottom${uid}`} gradientUnits="userSpaceOnUse" cx={width} cy={height} r={width * 0.9} fx={width} fy={height}>
            <Stop offset="0" stopColor="#8FB4B6" stopOpacity="0.16" />
            <Stop offset="1" stopColor={colors.bg} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill={colors.bg} />
        <Rect x="0" y="0" width={width} height={height} fill={`url(#top${uid})`} />
        <Rect x="0" y="0" width={width} height={height} fill={`url(#bottom${uid})`} />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
});
