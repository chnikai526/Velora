import React, { useId } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme';
import SheetHeader from './SheetHeader';

// Glow colors match the GradientCard tones: gold (halo), green (meadow),
// rose. The glow sits behind the header and fades out well before the
// content, so sheets feel lit like the home hero without muddying text.
const GLOWS = {
  gold: ['#D9914A', '#6E3F1C'],
  green: ['#6FAE68', '#24401F'],
  rose: ['#D0736B', '#5A2622'],
};

export function SheetGlow({ tone = 'gold', height = 440 }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [inner, outer] = GLOWS[tone] || GLOWS.gold;
  return (
    <Svg style={[styles.glow, { height }]} width="100%" height={height} pointerEvents="none">
      <Defs>
        <RadialGradient id={`sheet${uid}`} cx="50%" cy="-8%" r="78%" fx="50%" fy="-8%">
          <Stop offset="0" stopColor={inner} stopOpacity="0.34" />
          <Stop offset="0.55" stopColor={outer} stopOpacity="0.12" />
          <Stop offset="1" stopColor={colors.bg} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#sheet${uid})`} />
    </Svg>
  );
}

// The page itself: near-black canvas with the warm glow at the top. Used
// directly by full-screen routes (Add transaction, Exchange rates) and via
// <Sheet> for modal sheets.
export function SheetSurface({ glow = 'gold', style, children }) {
  return (
    <View style={[styles.surface, style]}>
      <SheetGlow tone={glow} />
      {children}
    </View>
  );
}

export default function Sheet({
  visible,
  onClose,
  onShow,
  title,
  subtitle,
  closeIcon,
  headerRight,
  glow,
  children,
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose} onShow={onShow}>
      <SheetSurface glow={glow}>
        <SheetHeader title={title} subtitle={subtitle} onClose={onClose} closeIcon={closeIcon} right={headerRight} />
        {children}
      </SheetSurface>
    </Modal>
  );
}

const styles = StyleSheet.create({
  surface: { flex: 1, backgroundColor: colors.bg },
  glow: { position: 'absolute', top: 0, left: 0, right: 0 },
});
