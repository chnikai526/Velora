import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '../theme';

const VARIANTS = {
  // Translucent circle used for the corner arrows, back and help buttons.
  glass: { bg: colors.glass, borderColor: 'transparent', borderWidth: 0 },
  // Glass with a hairline rim — sheet headers and other top-level chrome.
  outline: { bg: colors.glass, borderColor: colors.hairline, borderWidth: StyleSheet.hairlineWidth },
  secondary: { bg: colors.surfaceRaised, borderColor: 'transparent', borderWidth: 0 },
  ghost: { bg: 'transparent', borderColor: colors.borderStrong, borderWidth: 1 },
  primary: { bg: colors.pill, borderColor: 'transparent', borderWidth: 0 },
};

export default function IconButton({ icon, size = 40, variant = 'glass', onPress, disabled = false, style, accessibilityLabel }) {
  const palette = VARIANTS[variant] || VARIANTS.glass;
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.06 }],
    opacity: 1 - pressed.value * 0.15,
  }));

  const setPressed = (value) => {
    pressed.value = withTiming(value, { duration: 120, easing: Easing.out(Easing.quad) });
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <View style={disabled && styles.disabled}>
        <Pressable
          disabled={disabled || !onPress}
          onPress={onPress}
          onPressIn={() => setPressed(1)}
          onPressOut={() => setPressed(0)}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled: disabled || !onPress }}
          hitSlop={6}
          style={[
            styles.base,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: palette.bg,
              borderColor: palette.borderColor,
              borderWidth: palette.borderWidth,
            },
          ]}
        >
          {icon}
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.45 },
});
