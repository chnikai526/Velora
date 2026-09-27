import React, { useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, type } from '../theme';
import { sanitizeAmountInput } from '../lib/format';

// Big centered money input with a hairline underline that lights up on focus.
// The input is sized to its own text via a hidden twin (see inputWrap for why
// its parent is a row): without an explicit
// width, web inputs default to ~20 characters wide at this font size, which
// shoved the centered row off-screen. Long values step the font down so a
// seven-figure amount still fits on one line instead of scrolling inside the
// field. Input is sanitized (see sanitizeAmountInput) before it reaches the
// caller.
export default function AmountField({ label = 'Amount', value, onChangeText, fontSize = 64, prefix = '$', suffix, style, autoFocus = false, accessibilityLabel }) {
  const [focusValue] = useState(() => new Animated.Value(0));
  const [textWidth, setTextWidth] = useState(0);

  const setFocused = (focused) => {
    Animated.timing(focusValue, { toValue: focused ? 1 : 0, duration: 150, easing: Easing.linear, useNativeDriver: false }).start();
  };
  const underlineColor = focusValue.interpolate({ inputRange: [0, 1], outputRange: [colors.borderStrong, colors.accent] });
  const length = (value || '0.00').length;
  const size = length <= 6 ? fontSize : Math.max(30, Math.round((fontSize * 6) / length));
  const lineHeight = Math.round(size * 1.15);
  const textStyle = [styles.input, { fontSize: size, lineHeight }];

  return (
    <View style={[styles.block, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.row, { minHeight: Math.round(fontSize * 1.15) }]}>
        {prefix ? <Text style={[styles.affix, { fontSize: Math.round(size * 0.55), lineHeight }]}>{prefix}</Text> : null}
        <View style={styles.inputWrap}>
          <Text
            style={[textStyle, styles.measure]}
            numberOfLines={1}
            onLayout={(event) => setTextWidth(event.nativeEvent.layout.width)}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {value || '0.00'}
          </Text>
          <TextInput
            value={value}
            onChangeText={(text) => onChangeText(sanitizeAmountInput(text))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="rgba(247,245,242,0.28)"
            selectionColor={colors.accent}
            autoFocus={autoFocus}
            accessibilityLabel={accessibilityLabel || label || 'Amount'}
            style={[textStyle, { width: Math.ceil(textWidth) + 6 }]}
          />
        </View>
        {suffix ? <Text style={[styles.suffix, { lineHeight }]}>{suffix}</Text> : null}
      </View>
      <Animated.View style={[styles.underline, { borderBottomColor: underlineColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: { alignItems: 'center' },
  label: { ...type.heading, fontSize: 17, color: colors.textSoft, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', maxWidth: '100%' },
  affix: { ...type.hero, color: 'rgba(247,245,242,0.55)', marginRight: 4 },
  suffix: { ...type.heading, fontSize: 20, color: colors.textMuted, marginLeft: 8, alignSelf: 'flex-end' },
  // Must be a row: Yoga caps an absolute child of a *column* at its parent's
  // width, so the measuring twin was clipped to the old input width ("10"
  // measured as "1…") and the newest digit rendered half cut off on iOS and
  // Android. Absolute children of a row are measured at their natural width.
  inputWrap: { flexShrink: 1, flexDirection: 'row' },
  input: { ...type.hero, color: colors.text, padding: 0, minWidth: 40, maxWidth: 300 },
  // Laid out off-screen purely to measure the rendered width of the value.
  measure: { position: 'absolute', opacity: 0, left: 0, top: 0, width: undefined, minWidth: 0, maxWidth: undefined },
  underline: { width: 200, marginTop: 10, borderBottomWidth: 1 },
});
