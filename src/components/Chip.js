import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, type } from '../theme';

// Selector pill. Selected flips to the light pill (near-white, dark text).
// `icon` / `trailingIcon` are Ionicons names tinted to match the state.
export default function Chip({ label, icon, trailingIcon, selected = false, onPress, disabled = false, style, children, accessibilityLabel }) {
  const tint = selected ? colors.pillText : colors.textSoft;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ selected, disabled }}
      hitSlop={4}
      style={({ pressed }) => [styles.base, selected && styles.selected, pressed && styles.pressed, disabled && styles.disabled, style]}
    >
      {children || (
        <>
          {icon ? <Ionicons name={icon} size={15} color={tint} /> : null}
          <Text numberOfLines={1} style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
          {trailingIcon ? <Ionicons name={trailingIcon} size={15} color={tint} /> : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 38,
    borderRadius: radius.pill,
    paddingHorizontal: 15,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  selected: { backgroundColor: colors.pill, borderColor: colors.pill },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.4 },
  label: { ...type.label, color: colors.textSoft, flexShrink: 1 },
  labelSelected: { color: colors.pillText },
});
