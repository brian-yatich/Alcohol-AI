import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ButtonRow, PrimaryButton, SecondaryButton } from '../components/Buttons';
import { Card } from '../components/Card';
import { ChoiceGroup, FieldLabel, ProgressBar, SliderField, TextField } from '../components/Fields';
import { colors, spacing } from '../theme';
import { BaselineData } from '../types';

const TOTAL_STEPS = 6;

const GENDER_OPTIONS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];
const OCCUPATION_OPTIONS = ['Employed', 'Unemployed', 'Student', 'Retired', 'Other'];
const ATTEMPT_OPTIONS = ['This is my first attempt', '1-2 times', '3-5 times', '6+ times'];
const SUPPORT_OPTIONS = ['Yes, currently', 'In the past', 'No'];
const TRIGGER_OPTIONS = ['Stress', 'Loneliness', 'Boredom', 'Social pressure', 'Celebrations', 'Conflict', 'Anxiety', 'Fatigue'];
const SLEEP_PATTERN_OPTIONS = ['Consistent & restful', 'Somewhat irregular', 'Frequently disrupted'];
const COPING_OPTIONS = ['Exercise', 'Talking to someone', 'Journaling', 'Meditation', 'Hobbies', 'Support meetings', 'Deep breathing'];

export function Onboarding({ onComplete }: { onComplete: (data: BaselineData) => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<BaselineData>({});

  const set = <K extends keyof BaselineData>(key: K, value: BaselineData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const next = () => (step < TOTAL_STEPS ? setStep(step + 1) : onComplete(data));
  const back = () => step > 1 && setStep(step - 1);

  const stepValid = (() => {
    switch (step) {
      case 1:
        return !!data.age && data.age >= 16 && !!data.gender;
      case 2:
        return !!data.occupationType;
      case 3:
        return !!data.previousAttempts && !!data.professionalSupport && !!data.motivationLevel;
      case 4:
        return !!data.recoveryDurationMonths && (data.triggers?.length ?? 0) > 0;
      case 5:
        return !!data.sleepPattern && (data.copingStrategies?.length ?? 0) > 0;
      case 6:
        return true;
      default:
        return true;
    }
  })();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Card>
          <View style={styles.stepHeader}>
            <Text style={styles.stepLabel}>Step {step} of {TOTAL_STEPS}</Text>
            <Text style={styles.stepPct}>{Math.round((step / TOTAL_STEPS) * 100)}%</Text>
          </View>
          <ProgressBar pct={(step / TOTAL_STEPS) * 100} />

          <View style={styles.body}>
            {step === 1 && (
              <>
                <Text style={styles.title}>Demographics</Text>
                <View style={styles.field}>
                  <FieldLabel>What is your age?</FieldLabel>
                  <TextField
                    value={data.age ? String(data.age) : ''}
                    onChangeText={(v) => set('age', v ? Number(v.replace(/[^0-9]/g, '')) : undefined)}
                    placeholder="Enter your age (minimum 16)"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.field}>
                  <FieldLabel>How do you describe your gender?</FieldLabel>
                  <ChoiceGroup options={GENDER_OPTIONS} value={data.gender ? [data.gender] : []} onChange={(v) => set('gender', v[0])} />
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.title}>Lifestyle</Text>
                <View style={styles.field}>
                  <FieldLabel>What is your employment status?</FieldLabel>
                  <ChoiceGroup options={OCCUPATION_OPTIONS} value={data.occupationType ? [data.occupationType] : []} onChange={(v) => set('occupationType', v[0])} />
                </View>
                <View style={styles.row2}>
                  <View style={styles.half}>
                    <FieldLabel>Work starts</FieldLabel>
                    <TextField value={data.scheduleStart ?? ''} onChangeText={(v) => set('scheduleStart', v)} placeholder="e.g. 09:00" />
                  </View>
                  <View style={styles.half}>
                    <FieldLabel>Work ends</FieldLabel>
                    <TextField value={data.scheduleEnd ?? ''} onChangeText={(v) => set('scheduleEnd', v)} placeholder="e.g. 17:00" />
                  </View>
                </View>
                <View style={styles.row2}>
                  <View style={styles.half}>
                    <FieldLabel>Usual bedtime</FieldLabel>
                    <TextField value={data.sleepTime ?? ''} onChangeText={(v) => set('sleepTime', v)} placeholder="e.g. 22:30" />
                  </View>
                  <View style={styles.half}>
                    <FieldLabel>Usual wake time</FieldLabel>
                    <TextField value={data.wakeTime ?? ''} onChangeText={(v) => set('wakeTime', v)} placeholder="e.g. 07:00" />
                  </View>
                </View>
              </>
            )}

            {step === 3 && (
              <>
                <Text style={styles.title}>Recovery History</Text>
                <View style={styles.field}>
                  <FieldLabel>How many previous attempts to quit or cut down have you made?</FieldLabel>
                  <ChoiceGroup options={ATTEMPT_OPTIONS} value={data.previousAttempts ? [data.previousAttempts] : []} onChange={(v) => set('previousAttempts', v[0])} />
                </View>
                <View style={styles.field}>
                  <FieldLabel>Have you received professional support (therapy, counseling, programs)?</FieldLabel>
                  <ChoiceGroup options={SUPPORT_OPTIONS} value={data.professionalSupport ? [data.professionalSupport] : []} onChange={(v) => set('professionalSupport', v[0])} />
                </View>
                <View style={styles.field}>
                  <FieldLabel>How motivated are you to stay sober right now?</FieldLabel>
                  <SliderField value={data.motivationLevel ?? 5} onChange={(v) => set('motivationLevel', v)} lowLabel="Not at all" highLabel="Extremely" />
                </View>
              </>
            )}

            {step === 4 && (
              <>
                <Text style={styles.title}>Recovery Profile</Text>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    This is an alcohol recovery system. The information you share here helps personalize your
                    tracking and insights — it stays private on your device.
                  </Text>
                </View>
                <View style={styles.field}>
                  <FieldLabel>How long have you been in recovery? (months)</FieldLabel>
                  <TextField
                    value={data.recoveryDurationMonths ? String(data.recoveryDurationMonths) : ''}
                    onChangeText={(v) => set('recoveryDurationMonths', v ? Number(v.replace(/[^0-9]/g, '')) : undefined)}
                    placeholder="e.g. 3"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.field}>
                  <FieldLabel>What are your personal triggers? (select all that apply)</FieldLabel>
                  <ChoiceGroup multi options={TRIGGER_OPTIONS} value={data.triggers ?? []} onChange={(v) => set('triggers', v)} />
                </View>
              </>
            )}

            {step === 5 && (
              <>
                <Text style={styles.title}>Support & Wellbeing</Text>
                <View style={styles.field}>
                  <FieldLabel>How strong is your social support network?</FieldLabel>
                  <SliderField value={data.socialSupportLevel ?? 5} onChange={(v) => set('socialSupportLevel', v)} lowLabel="Very weak" highLabel="Very strong" />
                </View>
                <View style={styles.field}>
                  <FieldLabel>What is your baseline anxiety level?</FieldLabel>
                  <SliderField value={data.baselineAnxiety ?? 5} onChange={(v) => set('baselineAnxiety', v)} lowLabel="Calm" highLabel="Very anxious" />
                </View>
                <View style={styles.field}>
                  <FieldLabel>How would you describe your sleep pattern?</FieldLabel>
                  <ChoiceGroup options={SLEEP_PATTERN_OPTIONS} value={data.sleepPattern ? [data.sleepPattern] : []} onChange={(v) => set('sleepPattern', v[0])} />
                </View>
                <View style={styles.field}>
                  <FieldLabel>Which coping strategies do you already use? (select all that apply)</FieldLabel>
                  <ChoiceGroup multi options={COPING_OPTIONS} value={data.copingStrategies ?? []} onChange={(v) => set('copingStrategies', v)} />
                </View>
              </>
            )}

            {step === 6 && (
              <>
                <Text style={styles.title}>Review</Text>
                <Text style={styles.reviewIntro}>Here's what you've told us. You can go back to change anything.</Text>
                {[
                  ['Age', data.age ? String(data.age) : '—'],
                  ['Gender', data.gender ?? '—'],
                  ['Employment', data.occupationType ?? '—'],
                  ['Previous attempts', data.previousAttempts ?? '—'],
                  ['Professional support', data.professionalSupport ?? '—'],
                  ['Motivation', data.motivationLevel ? `${data.motivationLevel}/10` : '—'],
                  ['Months in recovery', data.recoveryDurationMonths ? String(data.recoveryDurationMonths) : '—'],
                  ['Triggers', (data.triggers ?? []).join(', ') || '—'],
                  ['Social support', data.socialSupportLevel ? `${data.socialSupportLevel}/10` : '—'],
                  ['Baseline anxiety', data.baselineAnxiety ? `${data.baselineAnxiety}/10` : '—'],
                  ['Sleep pattern', data.sleepPattern ?? '—'],
                  ['Coping strategies', (data.copingStrategies ?? []).join(', ') || '—'],
                ].map(([label, value]) => (
                  <View key={label} style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>{label}</Text>
                    <Text style={styles.reviewValue}>{value}</Text>
                  </View>
                ))}
              </>
            )}
          </View>

          <ButtonRow>
            {step > 1 && <SecondaryButton title="Back" onPress={back} />}
            <PrimaryButton title={step === TOTAL_STEPS ? 'Finish setup' : 'Continue'} onPress={next} disabled={!stepValid} />
          </ButtonRow>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  stepPct: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  body: {
    marginTop: spacing.lg,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  row2: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  infoBox: {
    backgroundColor: colors.primaryMuted,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    fontSize: 13,
    color: colors.primary,
    lineHeight: 18,
  },
  reviewIntro: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  reviewLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  reviewValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
});
