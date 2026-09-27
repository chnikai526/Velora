import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius, space } from '../theme';

// Solid graphite surface with generous rounding. The fill vs. background
// luminance step is what makes it read as an object — no outline needed.
export default function Card({ children, style, contentStyle, radius: cardRadius = radius.lg }) {
  return (
    <View style={[styles.base, { borderRadius: cardRadius }, style]}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.surface, overflow: 'hidden' },
  content: { padding: space[5] },
});
