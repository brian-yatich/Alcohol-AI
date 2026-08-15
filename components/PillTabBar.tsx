import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export interface TabDef {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  locked?: boolean;
}

export function PillTabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        const Icon = tab.icon;
        return (
          <TouchableOpacity
            key={tab.key}
            disabled={tab.locked}
            onPress={() => onChange(tab.key)}
            style={[styles.pill, isActive && styles.pillActive, tab.locked && styles.pillLocked]}
          >
            <Icon size={15} color={isActive ? '#fff' : tab.locked ? colors.textMuted : colors.textSecondary} />
            <Text style={[styles.label, isActive && styles.labelActive, tab.locked && styles.labelLocked]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.bg,
  },
  row: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  pillLocked: {
    opacity: 0.5,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: '#fff',
  },
  labelLocked: {
    color: colors.textMuted,
  },
});
