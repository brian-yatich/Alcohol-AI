import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import { Card } from '../components/Card';
import { ACQ_ITEMS, scoreCraving } from '../lib/scoring';
import { colors, radius, spacing } from '../theme';
import { CravingEntry } from '../types';

export function Craving({ onSubmit }: { onSubmit: (entry: CravingEntry) => void }) {
  const [responses, setResponses] = useState<Record<number, number>>({});

  const allAnswered = ACQ_ITEMS.every((item) => responses[item.id] != null);

  const submit = () => {
    const scores = scoreCraving(responses);
    onSubmit({
      date: new Date().toISOString(),
      responses,
      ...scores,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Card style={styles.introCard}>
        <Text style={styles.title}>Alcohol Craving Questionnaire</Text>
        <Text style={styles.subtitle}>ACQ-SF-R · a validated clinical screening tool</Text>
        <Text style={styles.instructions}>
          Please indicate how much you agree or disagree with each statement, thinking about how you feel
          right now. Choose 1 for Strongly Disagree through 7 for Strongly Agree.
        </Text>
      </Card>

      {ACQ_ITEMS.map((item) => (
        <Card key={item.id} style={styles.itemCard}>
          <Text style={styles.itemText}>{item.id}. {item.text}</Text>
          <View style={styles.scaleRow}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => {
              const selected = responses[item.id] === n;
              return (
                <TouchableOpacity
                  key={n}
                  style={[styles.scaleDot, selected && styles.scaleDotSelected]}
                  onPress={() => setResponses((r) => ({ ...r, [item.id]: n }))}
                >
                  <Text style={[styles.scaleDotText, selected && styles.scaleDotTextSelected]}>{n}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.scaleLabels}>
            <Text style={styles.scaleLabelText}>Strongly disagree</Text>
            <Text style={styles.scaleLabelText}>Strongly agree</Text>
          </View>
        </Card>
      ))}

      <PrimaryButton title="Submit questionnaire" onPress={submit} disabled={!allAnswered} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  introCard: {
    marginBottom: 0,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  instructions: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  itemCard: {
    marginBottom: 0,
  },
  itemText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.md,
    lineHeight: 19,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleDot: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleDotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scaleDotText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  scaleDotTextSelected: {
    color: '#fff',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  scaleLabelText: {
    fontSize: 10,
    color: colors.textMuted,
  },
});
