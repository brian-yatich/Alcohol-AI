import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { colors, radius, spacing } from '../theme';

type Tone = 'blue' | 'green' | 'orange' | 'red' | 'purple';

const toneMap: Record<Tone, { bg: string; fg: string }> = {
  blue: { bg: colors.primaryMuted, fg: colors.primary },
  green: { bg: colors.successMuted, fg: '#16a34a' },
  orange: { bg: colors.warningMuted, fg: '#ea580c' },
  red: { bg: colors.dangerMuted, fg: '#dc2626' },
  purple: { bg: colors.purpleMuted, fg: colors.purple },
};

export function OutputCard({
  icon: Icon,
  tone = 'blue',
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  tone?: Tone;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  const t = toneMap[tone];
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: t.bg }]}>
          <Icon size={18} color={t.fg} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
