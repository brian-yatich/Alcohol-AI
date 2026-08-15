import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line as SvgLine, Polyline } from 'react-native-svg';
import { colors } from '../theme';

export interface Series {
  label: string;
  color: string;
  values: number[]; // 0-10 scale, aligned by index across all series
}

const WIDTH = 280;
const HEIGHT = 140;
const PAD = 12;

export function TrendChart({ series, labels }: { series: Series[]; labels: string[] }) {
  const maxPoints = Math.max(1, ...series.map((s) => s.values.length));
  const stepX = maxPoints > 1 ? (WIDTH - PAD * 2) / (maxPoints - 1) : 0;

  const toPoint = (v: number, i: number) => {
    const x = PAD + i * stepX;
    const y = HEIGHT - PAD - (Math.max(0, Math.min(10, v)) / 10) * (HEIGHT - PAD * 2);
    return { x, y };
  };

  return (
    <View>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <SvgLine
            key={f}
            x1={PAD}
            x2={WIDTH - PAD}
            y1={PAD + f * (HEIGHT - PAD * 2)}
            y2={PAD + f * (HEIGHT - PAD * 2)}
            stroke={colors.border}
            strokeWidth={1}
          />
        ))}
        {series.map((s) => {
          if (s.values.length === 0) return null;
          const points = s.values.map((v, i) => toPoint(v, i));
          return (
            <React.Fragment key={s.label}>
              <Polyline
                points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {points.map((p, i) => (
                <Circle key={i} cx={p.x} cy={p.y} r={3} fill={s.color} />
              ))}
            </React.Fragment>
          );
        })}
      </Svg>
      <View style={styles.legendRow}>
        {series.map((s) => (
          <View key={s.label} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <Text style={styles.legendText}>{s.label}</Text>
          </View>
        ))}
      </View>
      {labels.length > 0 ? (
        <View style={styles.axisRow}>
          {labels.map((l, i) => (
            <Text key={i} style={styles.axisText}>
              {l}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  legendRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  axisText: {
    fontSize: 9,
    color: colors.textMuted,
  },
});
