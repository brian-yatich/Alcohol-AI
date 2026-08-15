import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { RiskLevel } from '../types';

const colorFor = (color: 'green' | 'orange' | 'red') =>
  color === 'green' ? colors.success : color === 'orange' ? colors.warning : colors.danger;

export function RiskGauge({
  level,
  color,
  percentage,
}: {
  level: RiskLevel;
  color: 'green' | 'orange' | 'red';
  percentage: number;
}) {
  const tint = colorFor(color);
  return (
    <View>
      <View style={styles.row}>
        <Text style={[styles.level, { color: tint }]}>{level} Risk</Text>
        <Text style={styles.pct}>{percentage}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: tint }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  level: {
    fontSize: 16,
    fontWeight: '700',
  },
  pct: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
