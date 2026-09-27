import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, radius, type } from '../theme';

const VARIANTS = {
  primary: { bg: colors.pill, borderColor: 'transparent', borderWidth: 0, text: colors.pillText },
  secondary: { bg: colors.surfaceRaised, borderColor: 'transparent', borderWidth: 0, text: colors.text },
  ghost: { bg: 'transparent', borderColor: colors.borderStrong, borderWidth: 1, text: colors.text },
  danger: { bg: colors.negativeDim, borderColor: 'transparent', borderWidth: 0, text: colors.negative },
};

const SIZES = {
  lg: { height: 56, paddingHorizontal: 24, fontSize: 16 },
  md: { height: 46, paddingHorizontal: 18, fontSize: 15 },
  sm: { height: 36, paddingHorizontal: 14, fontSize: 14 },
};

// Pill button. Primary is the light "4 Risks" pill: near-white fill, dark text.
export default function Button({
  label,
  children,
  onPress,
  onLongPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  icon = null,
  style,
  textStyle,
  accessibilityLabel,
}) {
  const palette = VARIANTS[variant] || VARIANTS.primary;
  const dims = SIZES[size] || SIZES.lg;
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.03 }],
    opacity: 1 - pressed.value * 0.1,
  }));

  const setPressed = (value) => {
    pressed.value = withTiming(value, { duration: 120, easing: Easing.out(Easing.quad) });
  };

  // The dimming lives on a plain inner view: Reanimated's animated opacity
  // always wins over a static one, so putting it beside `animatedStyle`
  // meant disabled buttons never actually looked disabled.
  return (
    <Animated.View style={[animatedStyle, style]}>
      <View style={disabled && styles.disabled}>
        <Pressable
          disabled={disabled}
          onPress={onPress}
          onLongPress={onLongPress}
          onPressIn={() => setPressed(1)}
          onPressOut={() => setPressed(0)}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || label}
          accessibilityState={{ disabled }}
          hitSlop={6}
          style={[
            styles.base,
            {
              height: dims.height,
              paddingHorizontal: dims.paddingHorizontal,
              backgroundColor: palette.bg,
              borderColor: palette.borderColor,
              borderWidth: palette.borderWidth,
            },
          ]}
        >
          {icon}
          {label ? (
            <Text numberOfLines={1} style={[styles.label, { color: palette.text, fontSize: dims.fontSize }, textStyle]}>
              {label}
            </Text>
          ) : (
            children
          )}
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    gap: 8,
  },
  label: { fontFamily: type.label.fontFamily, letterSpacing: -0.2 },
  disabled: { opacity: 0.45 },
});
