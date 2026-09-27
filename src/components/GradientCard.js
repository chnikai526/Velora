import React, { useId } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { radius as radii } from '../theme';

// Each tone is a base fill plus stacked radial glows, painted with SVG so
// they look the same on iOS, Android and web.
// `stops` are [offset, color, opacity].
const TONES = {
  // Dark card with a golden ring of light — the hero "41" card.
  halo: {
    base: '#1C1A18',
    glows: [
      { cx: '50%', cy: '38%', r: '75%', stops: [[0, '#000000', 0], [0.42, '#3A2710', 0.1], [0.6, '#E0A24A', 0.55], [0.74, '#8A5A22', 0.28], [1, '#1C1A18', 0]] },
      { cx: '50%', cy: '0%', r: '70%', stops: [[0, '#F2C475', 0.45], [0.6, '#7A4E1E', 0.15], [1, '#1C1A18', 0]] },
    ],
  },
  // Halo relit in sage — income and "owed to you" moments.
  meadow: {
    base: '#161A15',
    glows: [
      { cx: '50%', cy: '38%', r: '75%', stops: [[0, '#000000', 0], [0.42, '#1C3319', 0.1], [0.6, '#79C173', 0.5], [0.74, '#3E7039', 0.26], [1, '#161A15', 0]] },
      { cx: '50%', cy: '0%', r: '70%', stops: [[0, '#B5E3AE', 0.4], [0.6, '#2E5A2A', 0.15], [1, '#161A15', 0]] },
    ],
  },
  // Halo relit in rose — money you borrowed or owe.
  rose: {
    base: '#1C1716',
    glows: [
      { cx: '50%', cy: '38%', r: '75%', stops: [[0, '#000000', 0], [0.42, '#3A1C19', 0.1], [0.6, '#E0857C', 0.5], [0.74, '#8A3F38', 0.26], [1, '#1C1716', 0]] },
      { cx: '50%', cy: '0%', r: '70%', stops: [[0, '#F4B8B1', 0.4], [0.6, '#6A2E28', 0.15], [1, '#1C1716', 0]] },
    ],
  },
  // Dark card warmed by a rust glow rising from the bottom.
  ember: {
    base: '#211C1A',
    glows: [
      { cx: '55%', cy: '125%', r: '95%', stops: [[0, '#C9683A', 0.95], [0.45, '#7A3A1E', 0.55], [1, '#211C1A', 0]] },
      { cx: '0%', cy: '50%', r: '60%', stops: [[0, '#5A3424', 0.35], [1, '#211C1A', 0]] },
    ],
  },
  // Orange top, milky blue bottom.
  dawn: {
    base: '#C99079',
    glows: [
      { cx: '15%', cy: '0%', r: '100%', stops: [[0, '#C9542C', 1], [0.55, '#D77A4F', 0.55], [1, '#D77A4F', 0]] },
      { cx: '10%', cy: '100%', r: '90%', stops: [[0, '#C8DDEA', 1], [0.6, '#A9C4D8', 0.5], [1, '#A9C4D8', 0]] },
      { cx: '100%', cy: '60%', r: '60%', stops: [[0, '#E6B49E', 0.7], [1, '#E6B49E', 0]] },
    ],
  },
  // Teal top-left, rust right, blush bottom.
  dusk: {
    base: '#9A6456',
    glows: [
      { cx: '0%', cy: '0%', r: '90%', stops: [[0, '#8FB4B6', 1], [0.55, '#7D9C9A', 0.5], [1, '#7D9C9A', 0]] },
      { cx: '100%', cy: '35%', r: '75%', stops: [[0, '#B4461F', 1], [0.6, '#A2502E', 0.5], [1, '#A2502E', 0]] },
      { cx: '70%', cy: '110%', r: '70%', stops: [[0, '#EDB5A2', 0.9], [1, '#EDB5A2', 0]] },
    ],
  },
};

export default function GradientCard({ tone = 'ember', children, style, contentStyle, radius = radii.lg, onPress, onLongPress, accessibilityLabel }) {
  const palette = TONES[tone] || TONES.ember;
  // SVG ids are document-global on web, so every card needs its own.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const body = (
    <>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none" pointerEvents="none">
        <Defs>
          {palette.glows.map((glow, index) => (
            <RadialGradient key={index} id={`g${uid}${index}`} cx={glow.cx} cy={glow.cy} r={glow.r} fx={glow.cx} fy={glow.cy}>
              {glow.stops.map(([offset, color, opacity]) => (
                <Stop key={offset} offset={offset} stopColor={color} stopOpacity={opacity} />
              ))}
            </RadialGradient>
          ))}
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={palette.base} />
        {palette.glows.map((_, index) => (
          <Rect key={index} x="0" y="0" width="100%" height="100%" fill={`url(#g${uid}${index})`} />
        ))}
      </Svg>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </>
  );

  if (onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.base, { borderRadius: radius }, pressed && styles.pressed, style]}
      >
        {body}
      </Pressable>
    );
  }

  return <View style={[styles.base, { borderRadius: radius }, style]}>{body}</View>;
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
  content: { padding: 20 },
  pressed: { opacity: 0.9 },
});
