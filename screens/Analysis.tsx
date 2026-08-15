import { Activity, BarChart3, Heart, Lightbulb, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { OutputCard } from '../components/OutputCard';
import { RiskGauge } from '../components/RiskGauge';
import { Series, TrendChart } from '../components/TrendChart';
import {
  buildRecommendations,
  calculateBehavioralStability,
  calculateEmotionalWellbeing,
  calculateRelapseRisk,
} from '../lib/scoring';
import { colors, spacing } from '../theme';
import { CravingEntry, TrackingEntry } from '../types';

export function Analysis({ tracking, craving }: { tracking: TrackingEntry[]; craving: CravingEntry[] }) {
  const latestTracking = tracking[tracking.length - 1];
  const latestCraving = craving[craving.length - 1];

  const risk = calculateRelapseRisk(latestTracking, latestCraving);
  const wellbeing = calculateEmotionalWellbeing(latestTracking);
  const stability = calculateBehavioralStability(latestTracking);
  const recommendations = buildRecommendations(risk, wellbeing, stability, latestTracking);

  const last7 = tracking.slice(-7);
  const cravingByDate = new Map(craving.map((c) => [c.date.slice(0, 10), c]));

  const series: Series[] = [
    { label: 'Mood', color: colors.primary, values: last7.map((t) => t.mood) },
    { label: 'Stress', color: colors.warning, values: last7.map((t) => t.stress) },
    {
      label: 'Craving',
      color: colors.danger,
      values: last7.map((t) => cravingByDate.get(t.date.slice(0, 10))?.cravingIntensity10 ?? 0),
    },
  ];
  const labels = last7.map((t) => new Date(t.date).toLocaleDateString(undefined, { weekday: 'short' }));

  const hasData = tracking.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Card style={styles.banner}>
        <Text style={styles.bannerTitle}>About this app</Text>
        <Text style={styles.bannerText}>
          DigiCBT is a digital CBT-based companion for people working on alcohol recovery. It tracks your
          daily mood, stress and cravings, gives you a validated craving screen, and turns that data into
          plain-language insights and coping recommendations — for personal use alongside, not instead of,
          professional care.
        </Text>
      </Card>

      {!hasData ? (
        <Card>
          <Text style={styles.emptyText}>
            Complete a Daily Check-In to start seeing your insights here.
          </Text>
        </Card>
      ) : (
        <>
          <OutputCard icon={Activity} tone={risk.color} title="Relapse Risk Score" subtitle="From cravings, stress, motivation & triggers">
            <RiskGauge level={risk.level} color={risk.color} percentage={risk.percentage} />
          </OutputCard>

          <OutputCard icon={Heart} tone="blue" title="Emotional Wellbeing" subtitle="From mood, anxiety, stress & energy">
            <Text style={styles.bigNumber}>{wellbeing}<Text style={styles.bigNumberUnit}>/100</Text></Text>
          </OutputCard>

          <OutputCard icon={BarChart3} tone="purple" title="Behavioral Stability" subtitle="From routine, sleep & coping strategies">
            <Text style={styles.bigNumber}>{stability}<Text style={styles.bigNumberUnit}>/100</Text></Text>
          </OutputCard>

          <OutputCard icon={TrendingUp} tone="green" title="7-Day Trend" subtitle="Mood, stress & craving intensity">
            <TrendChart series={series} labels={labels} />
          </OutputCard>

          <OutputCard icon={Lightbulb} tone="orange" title="Personalized Recommendations">
            {recommendations.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </OutputCard>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  banner: {
    backgroundColor: colors.primaryMuted,
    borderColor: '#bfdbfe',
    marginBottom: spacing.md,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 12.5,
    color: '#1e3a8a',
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bigNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  bigNumberUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.warning,
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
