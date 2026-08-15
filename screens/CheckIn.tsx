import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import { Card } from '../components/Card';
import { ChoiceGroup, FieldLabel, SliderField } from '../components/Fields';
import { colors, spacing } from '../theme';
import { TrackingEntry } from '../types';

const SLEEP_OPTIONS = ['good', 'okay', 'poor'];
const YES_NO = ['Yes', 'No'];
const COPING_OPTIONS = ['Exercise', 'Talking to someone', 'Journaling', 'Meditation', 'Hobbies', 'Support meetings', 'Deep breathing'];

export function CheckIn({ onSubmit }: { onSubmit: (entry: TrackingEntry) => void }) {
  const [mood, setMood] = useState(5);
  const [stress, setStress] = useState(5);
  const [anxiety, setAnxiety] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [sleepQuality, setSleepQuality] = useState<'good' | 'okay' | 'poor'>('okay');
  const [triggerEncountered, setTriggerEncountered] = useState<string>('No');
  const [motivationToday, setMotivationToday] = useState(5);
  const [routineConsistency, setRoutineConsistency] = useState(5);
  const [copingStrategiesUsed, setCopingStrategiesUsed] = useState<string[]>([]);

  const submit = () => {
    onSubmit({
      date: new Date().toISOString(),
      mood,
      stress,
      anxiety,
      energy,
      sleepQuality,
      triggerEncountered: triggerEncountered === 'Yes',
      motivationToday,
      routineConsistency,
      copingStrategiesUsed,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Card>
        <Text style={styles.title}>Daily Check-In</Text>
        <Text style={styles.subtitle}>How are you doing today?</Text>

        <View style={styles.field}>
          <FieldLabel>Mood</FieldLabel>
          <SliderField value={mood} onChange={setMood} lowLabel="Low" highLabel="Great" />
        </View>
        <View style={styles.field}>
          <FieldLabel>Stress</FieldLabel>
          <SliderField value={stress} onChange={setStress} lowLabel="Calm" highLabel="Overwhelmed" />
        </View>
        <View style={styles.field}>
          <FieldLabel>Anxiety</FieldLabel>
          <SliderField value={anxiety} onChange={setAnxiety} lowLabel="Calm" highLabel="Very anxious" />
        </View>
        <View style={styles.field}>
          <FieldLabel>Energy</FieldLabel>
          <SliderField value={energy} onChange={setEnergy} lowLabel="Drained" highLabel="Energized" />
        </View>
        <View style={styles.field}>
          <FieldLabel>Sleep quality last night</FieldLabel>
          <ChoiceGroup options={SLEEP_OPTIONS} value={[sleepQuality]} onChange={(v) => setSleepQuality(v[0] as 'good' | 'okay' | 'poor')} />
        </View>
        <View style={styles.field}>
          <FieldLabel>Did you encounter a trigger today?</FieldLabel>
          <ChoiceGroup options={YES_NO} value={[triggerEncountered]} onChange={(v) => setTriggerEncountered(v[0])} />
        </View>
        <View style={styles.field}>
          <FieldLabel>Motivation to stay sober today</FieldLabel>
          <SliderField value={motivationToday} onChange={setMotivationToday} lowLabel="Low" highLabel="High" />
        </View>
        <View style={styles.field}>
          <FieldLabel>Routine consistency today</FieldLabel>
          <SliderField value={routineConsistency} onChange={setRoutineConsistency} lowLabel="Off track" highLabel="On track" />
        </View>
        <View style={styles.field}>
          <FieldLabel>Coping strategies used today (select all that apply)</FieldLabel>
          <ChoiceGroup multi options={COPING_OPTIONS} value={copingStrategiesUsed} onChange={setCopingStrategiesUsed} />
        </View>

        <PrimaryButton title="Submit check-in" onPress={submit} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
});
