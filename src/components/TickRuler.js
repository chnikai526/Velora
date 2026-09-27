import React from 'react';
import { StyleSheet, View } from 'react-native';

// Ruler of thin ticks with a tall marker, as under the hero number. `ratio`
// (0–1) positions the marker; ticks fade toward both edges.
export default function TickRuler({ ratio = 0.5, count = 41, style }) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0.5));
  const markerIndex = Math.round(clamped * (count - 1));
  return (
    <View style={[styles.row, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: count }, (_, index) => {
        const isMarker = index === markerIndex;
        const edge = Math.min(index, count - 1 - index) / ((count - 1) / 2);
        const opacity = isMarker ? 1 : 0.18 + edge * 0.45;
        const height = isMarker ? 34 : index % 5 === 0 ? 18 : 10;
        return <View key={index} style={[styles.tick, { height, opacity }, isMarker && styles.marker]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 34 },
  tick: { width: 1, backgroundColor: '#FFFFFF' },
  marker: { width: 1.5 },
});
