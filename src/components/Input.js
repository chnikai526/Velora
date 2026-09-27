import React, { useState } from 'react';
import { Animated, StyleSheet, TextInput, View } from 'react-native';
import { colors, radius, type } from '../theme';

// Filled text field; a soft gold outline fades in on focus.
export default function Input({
  icon = null,
  containerStyle,
  style,
  onFocus,
  onBlur,
  multiline = false,
  ...inputProps
}) {
  const [focusValue] = useState(() => new Animated.Value(0));

  const handleFocus = (event) => {
    Animated.timing(focusValue, { toValue: 1, duration: 150, useNativeDriver: false }).start();
    onFocus?.(event);
  };
  const handleBlur = (event) => {
    Animated.timing(focusValue, { toValue: 0, duration: 150, useNativeDriver: false }).start();
    onBlur?.(event);
  };

  const borderColor = focusValue.interpolate({ inputRange: [0, 1], outputRange: ['rgba(0,0,0,0)', colors.accentBorder] });

  return (
    <Animated.View style={[styles.wrap, multiline && styles.multiline, { borderColor }, containerStyle]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <TextInput
        {...inputProps}
        multiline={multiline}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholderTextColor={inputProps.placeholderTextColor || colors.textFaint}
        selectionColor={colors.accent}
        style={[styles.input, icon && styles.inputWithIcon, multiline && styles.inputMultiline, style]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    // Translucent so the field reads on both the page and a card surface.
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 14,
  },
  multiline: { alignItems: 'flex-start', height: undefined, minHeight: 54 },
  icon: { paddingLeft: 18 },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    ...type.body,
    color: colors.text,
    paddingHorizontal: 18,
  },
  inputWithIcon: { paddingLeft: 12 },
  inputMultiline: { paddingTop: 16, minHeight: 90, textAlignVertical: 'top' },
});
