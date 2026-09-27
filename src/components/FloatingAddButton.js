import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, shadows } from '../theme';

export const FAB_SIZE = 58;

// Round light-pill "+" that floats over a screen's content. Position it with
// `style` (it's absolutely placed by the caller).
export default function FloatingAddButton({ onPress, style, accessibilityLabel = 'Add transaction' }) {
  const pressed = useSharedValue(0);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - pressed.value * 0.07 }] }));
  const setPressed = (value) => {
    pressed.value = withTiming(value, { duration: 120, easing: Easing.out(Easing.quad) });
  };

  return (
    <Animated.View style={[styles.shadow, scaleStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => setPressed(1)}
        onPressOut={() => setPressed(0)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={6}
        style={styles.button}
      >
        <Ionicons name="add" size={30} color={colors.pillText} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: { width: FAB_SIZE, height: FAB_SIZE, borderRadius: FAB_SIZE / 2, ...shadows.floating },
  button: {
    flex: 1,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
