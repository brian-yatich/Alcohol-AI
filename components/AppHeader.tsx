import { Activity } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export function AppHeader() {
  return (
    <View style={styles.row}>
      <View style={styles.logo}>
        <Activity color="#fff" size={22} />
      </View>
      <View>
        <Text style={styles.title}>DigiCBT</Text>
        <Text style={styles.subtitle}>Alcohol Recovery System</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.gradientStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.textOnDark,
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textOnDarkMuted,
    fontSize: 12,
    marginTop: 1,
  },
});
