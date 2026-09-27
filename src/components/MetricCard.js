import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, type } from '../theme';
import Pill from './Pill';

// Stacked metric card: label (+ optional status pill) on top, a large value
// underneath, and a circled arrow in the bottom-right corner.
export default function MetricCard({
  label,
  caption,
  leading,
  pill,
  value,
  valueColor = colors.text,
  arrow = 'arrow-up',
  onPress,
  onLongPress,
  style,
}) {
  const interactive = Boolean(onPress || onLongPress);
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={!interactive}
      accessibilityRole={interactive ? 'button' : undefined}
      style={({ pressed }) => [styles.card, pressed && interactive && styles.pressed, style]}
    >
      <View style={styles.top}>
        {leading ? <View style={styles.leading}>{leading}</View> : null}
        <View style={styles.labels}>
          <Text style={styles.label} numberOfLines={1}>{label}</Text>
          {caption ? <Text style={styles.caption} numberOfLines={1}>{caption}</Text> : null}
        </View>
        {pill ? <Pill label={pill.label} tone={pill.tone} style={styles.pill} /> : null}
      </View>
      <View style={styles.bottom}>
        <Text style={[styles.value, { color: valueColor }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{value}</Text>
        {interactive && arrow ? (
          <View style={styles.arrow}>
            <Ionicons name={arrow} size={15} color={colors.textSoft} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 16 },
  pressed: { opacity: 0.85 },
  top: { flexDirection: 'row', alignItems: 'center', minHeight: 28 },
  leading: { marginRight: 10 },
  labels: { flex: 1, minWidth: 0 },
  label: { ...type.label, fontSize: 16, lineHeight: 20, color: colors.textSoft },
  caption: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  pill: { marginLeft: 10, maxWidth: '50%' },
  bottom: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  value: { ...type.value, flex: 1, marginRight: 10 },
  arrow: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center' },
});
