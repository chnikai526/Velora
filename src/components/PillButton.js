import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, type } from '../theme';

// Light pill with a label and a circled arrow — the "4 Risks →" control.
export default function PillButton({ label, icon = 'arrow-forward', onPress, style, accessibilityLabel }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      hitSlop={6}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
    >
      <View style={styles.pill}>
        <Text numberOfLines={1} style={styles.label}>{label}</Text>
      </View>
      <View style={styles.circle}>
        <Ionicons name={icon} size={15} color={colors.pillText} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 2 },
  pressed: { opacity: 0.8 },
  pill: { height: 30, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: colors.pill, justifyContent: 'center', flexShrink: 1 },
  label: { ...type.label, fontSize: 15, color: colors.pillText },
  circle: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.pill, alignItems: 'center', justifyContent: 'center' },
});
