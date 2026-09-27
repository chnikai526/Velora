import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, type } from '../theme';

// Two-or-three way switch drawn as a track with a light pill on the active
// option. `variant="glass"` is the darker, rimmed track for use on top of a
// GradientCard.
export default function SegmentedControl({ options, value, onChange, variant = 'surface', disabled = false, style }) {
  return (
    <View style={[styles.track, variant === 'glass' && styles.trackGlass, style]} accessibilityRole="tablist">
      {options.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => !active && onChange(option.key)}
            disabled={disabled}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: active, disabled }}
            style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && !active && styles.pressed]}
          >
            {option.icon ? <Ionicons name={option.icon} size={15} color={active ? colors.pillText : colors.textMuted} /> : null}
            <Text numberOfLines={1} style={[styles.text, active && styles.textActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: radius.pill, backgroundColor: colors.surface },
  trackGlass: { backgroundColor: 'rgba(0,0,0,0.32)', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.hairline },
  item: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: radius.pill, paddingHorizontal: 10 },
  itemActive: { backgroundColor: colors.pill },
  pressed: { opacity: 0.7 },
  text: { ...type.label, fontSize: 15, color: colors.textMuted },
  textActive: { color: colors.pillText },
});
