import React, { useId, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { colors, type } from '../theme';

const CHART_HEIGHT = 120;
const AXIS_WIDTH = 40;
const LABEL_HEIGHT = 18;
const GRID_STEPS = 4;

// Month status against the monthly budget, drawn as the legend dots.
const STATUS_COLORS = { over: colors.negative, near: colors.accent, under: colors.positive };
const statusFor = (value, budget) => {
  if (!budget) return 'near';
  if (value > budget) return 'over';
  if (value > budget * 0.8) return 'near';
  return 'under';
};

// Rounds up to 1/2/2.5/5 × 10^n so the axis labels are clean numbers.
const niceMax = (value) => {
  if (value <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * magnitude >= value);
  return step * magnitude;
};

const shortNumber = (value) => {
  if (value >= 1000) return `${(value / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k`;
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

// Catmull-Rom spline through the points, expressed as cubic Béziers, so the
// line curves smoothly instead of zig-zagging between months.
const smoothPath = (points) => {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
};

// `data` is [{ label, value }] oldest → newest; the last point is highlighted.
export default function SpendingChart({ data, budget = 0 }) {
  const [width, setWidth] = useState(0);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const maxValue = niceMax(Math.max(budget, ...data.map((item) => item.value)));
  const plotWidth = Math.max(0, width - AXIS_WIDTH - 8);
  const inset = 10;
  const stepX = data.length > 1 ? (plotWidth - inset * 2) / (data.length - 1) : 0;
  const yFor = (value) => 8 + (CHART_HEIGHT - 16) * (1 - value / maxValue);

  const points = data.map((item, index) => ({
    x: AXIS_WIDTH + inset + index * stepX,
    y: yFor(item.value),
    status: statusFor(item.value, budget),
  }));
  const line = smoothPath(points);
  const last = points[points.length - 1];
  const area = line && last ? `${line} L ${last.x} ${CHART_HEIGHT} L ${points[0].x} ${CHART_HEIGHT} Z` : '';

  return (
    <View>
      <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={styles.chart}>
        {width > 0 && (
          <Svg width={width} height={CHART_HEIGHT + LABEL_HEIGHT}>
            <Defs>
              <LinearGradient id={`line${uid}`} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors.negative} />
                <Stop offset="0.5" stopColor={colors.accent} />
                <Stop offset="1" stopColor="#F4DDB8" />
              </LinearGradient>
              <LinearGradient id={`area${uid}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.accent} stopOpacity="0.22" />
                <Stop offset="1" stopColor={colors.accent} stopOpacity="0" />
              </LinearGradient>
            </Defs>

            {Array.from({ length: GRID_STEPS + 1 }, (_, index) => {
              const value = (maxValue / GRID_STEPS) * (GRID_STEPS - index);
              const y = yFor(value);
              return (
                <React.Fragment key={index}>
                  <SvgText x={0} y={y + 3.5} fill={colors.textMuted} fontSize="10" fontFamily="Inter_400Regular">{shortNumber(value)}</SvgText>
                  <Line x1={AXIS_WIDTH} x2={width} y1={y} y2={y} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 4" strokeWidth={1} />
                </React.Fragment>
              );
            })}

            {area ? <Path d={area} fill={`url(#area${uid})`} /> : null}
            {line ? <Path d={line} stroke={`url(#line${uid})`} strokeWidth={2} fill="none" strokeLinecap="round" /> : null}

            {points.slice(0, -1).map((point, index) => (
              <Circle key={index} cx={point.x} cy={point.y} r={3} fill={STATUS_COLORS[point.status]} />
            ))}
            {last && (
              <>
                <Line x1={last.x} x2={last.x} y1={last.y} y2={CHART_HEIGHT} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
                <Circle cx={last.x} cy={last.y} r={7} fill={colors.surface} stroke={STATUS_COLORS[last.status]} strokeWidth={2} />
                <Circle cx={last.x} cy={last.y} r={3} fill={STATUS_COLORS[last.status]} />
              </>
            )}

            {data.map((item, index) => (
              <SvgText
                key={item.label + index}
                x={points[index].x}
                y={CHART_HEIGHT + LABEL_HEIGHT - 3}
                fill={index === data.length - 1 ? colors.text : colors.textMuted}
                fontSize="10"
                fontFamily="Inter_400Regular"
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            ))}
          </Svg>
        )}
      </View>

      {budget > 0 && (
        <View style={styles.legend}>
          {[['over', 'Over budget'], ['near', 'Near limit'], ['under', 'Under budget']].map(([key, label]) => (
            <View key={key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS[key] }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { height: CHART_HEIGHT + LABEL_HEIGHT },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { ...type.caption, fontSize: 11, color: colors.textSoft },
});
