import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, type } from '../theme';

// Status pill ("Normal", "Excelent", "4 Years Younger").
const TONES = {
  gold: { bg: colors.accent, text: colors.accentText, border: 'transparent' },
  green: { bg: colors.positive, text: '#10200E', border: 'transparent' },
  pink: { bg: colors.negative, text: '#2A1311', border: 'transparent' },
  light: { bg: colors.pill, text: colors.pillText, border: 'transparent' },
  outline: { bg: 'transparent', text: colors.text, border: 'rgba(255,255,255,0.7)' },
  muted: { bg: colors.glass, text: colors.textSoft, border: 'transparent' },
};

export default function Pill({ label, tone = 'gold', size = 'sm', style }) {
  const palette = TONES[tone] || TONES.gold;
  const large = size === 'lg';
  return (
    <View style={[styles.base, large && styles.large, { backgroundColor: palette.bg, borderColor: palette.border }, style]}>
      <Text numberOfLines={1} style={[styles.text, large && styles.textLarge, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignSelf: 'flex-start', height: 28, paddingHorizontal: 10, borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  large: { height: 40, paddingHorizontal: 16 },
  text: { ...type.label, fontSize: 14 },
  textLarge: { fontSize: 16 },
});
