import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../lib/theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md';
}

const variantColors = {
  primary: { bg: '#1e40af', text: '#93c5fd' },
  success: { bg: '#065f46', text: '#6ee7b7' },
  warning: { bg: '#78350f', text: '#fcd34d' },
  error: { bg: '#7f1d1d', text: '#fca5a5' },
  info: { bg: '#0e7490', text: '#67e8f9' },
  default: { bg: colors.surface, text: colors.textSecondary },
};

export function Badge({ label, variant = 'default', size = 'sm' }: BadgeProps) {
  const vc = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: vc.bg }, size === 'md' && styles.md]}>
      <Text style={[styles.text, { color: vc.text }, size === 'md' && styles.mdText]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  md: { paddingHorizontal: 12, paddingVertical: 5 },
  text: { fontSize: 11, fontWeight: '600' },
  mdText: { fontSize: 13 },
});
