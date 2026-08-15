import Slider from '@react-native-community/slider';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function TextField({
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      keyboardType={keyboardType ?? 'default'}
    />
  );
}

export function SliderField({
  value,
  onChange,
  min = 1,
  max = 10,
  lowLabel,
  highLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
}) {
  return (
    <View>
      <View style={styles.sliderRow}>
        <Text style={styles.sliderHint}>{lowLabel ?? min}</Text>
        <Text style={styles.sliderValue}>{value}</Text>
        <Text style={styles.sliderHint}>{highLabel ?? max}</Text>
      </View>
      <Slider
        minimumValue={min}
        maximumValue={max}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />
    </View>
  );
}

export function ChoiceGroup({
  options,
  value,
  onChange,
  multi,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  multi?: boolean;
}) {
  const toggle = (opt: string) => {
    if (multi) {
      onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
    } else {
      onChange([opt]);
    }
  };

  return (
    <View style={styles.choiceRow}>
      {options.map((opt) => {
        const selected = value.includes(opt);
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => toggle(opt)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function ProgressBar({ pct }: { pct: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, pct))}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sliderHint: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sliderValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.gradientStart,
  },
});
