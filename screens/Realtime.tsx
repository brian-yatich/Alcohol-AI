import { AlertCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import { Card } from '../components/Card';
import { ChoiceGroup, FieldLabel, SliderField, TextField } from '../components/Fields';
import { colors, radius, spacing } from '../theme';
import { RealtimeEntry } from '../types';

const TRIGGER_OPTIONS = ['Stress', 'Loneliness', 'Boredom', 'Social pressure', 'Celebrations', 'Conflict', 'Anxiety', 'Fatigue', 'Other'];

export function Realtime({ onSubmit }: { onSubmit: (entry: RealtimeEntry) => void }) {
  const [riskLevel, setRiskLevel] = useState(5);
  const [trigger, setTrigger] = useState('');
  const [copingAction, setCopingAction] = useState('');
  const [confidence, setConfidence] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    onSubmit({
      date: new Date().toISOString(),
      riskLevel,
      trigger,
      copingAction,
      confidence,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.title}>Logged. You're not alone.</Text>
          <Text style={styles.doneText}>
            Your entry has been saved. Take a slow breath, and consider reaching out to someone in your
            support network right now if you can.
          </Text>
          <PrimaryButton title="Log another moment" onPress={() => setSubmitted(false)} />
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Card style={styles.banner}>
        <View style={styles.bannerRow}>
          <AlertCircle size={20} color="#dc2626" />
          <Text style={styles.bannerText}>
            Use this if you're in a high-risk moment right now. Logging it can help you get through it — and
            helps your Analysis view spot patterns over time.
          </Text>
        </View>
      </Card>

      <Card>
        <View style={styles.field}>
          <FieldLabel>Current risk level</FieldLabel>
          <SliderField value={riskLevel} onChange={setRiskLevel} lowLabel="Manageable" highLabel="Very high" />
        </View>
        <View style={styles.field}>
          <FieldLabel>What triggered this urge?</FieldLabel>
          <ChoiceGroup options={TRIGGER_OPTIONS} value={trigger ? [trigger] : []} onChange={(v) => setTrigger(v[0])} />
        </View>
        <View style={styles.field}>
          <FieldLabel>What coping action are you taking (or will take)?</FieldLabel>
          <TextField value={copingAction} onChangeText={setCopingAction} placeholder="e.g. Calling a friend, going for a walk..." />
        </View>
        <View style={styles.field}>
          <FieldLabel>How confident are you that you can resist?</FieldLabel>
          <SliderField value={confidence} onChange={setConfidence} lowLabel="Not confident" highLabel="Very confident" />
        </View>

        <PrimaryButton title="Save this moment" onPress={submit} disabled={!trigger || !copingAction} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  banner: {
    backgroundColor: colors.dangerMuted,
    borderColor: '#fecaca',
  },
  bannerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: '#991b1b',
    lineHeight: 18,
  },
  field: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  doneText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
});
