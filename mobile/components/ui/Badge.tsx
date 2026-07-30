import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius } from '../../lib/theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default' | 'premium';
  size?: 'sm' | 'md';
  icon?: keyof typeof Ionicons.glyphMap;
  animated?: boolean;
}

const variantColors = {
  primary: { bg: '#EFF6FF', text: colors.primary, dot: colors.primary },
  success: { bg: colors.successLight, text: '#16A34A', dot: colors.success },
  warning: { bg: colors.warningLight, text: '#D97706', dot: colors.warning },
  error: { bg: colors.errorLight, text: '#DC2626', dot: colors.error },
  info: { bg: '#ECFEFF', text: '#0891B2', dot: colors.info },
  default: { bg: colors.surfaceLight, text: colors.textSecondary, dot: colors.textMuted },
  premium: { bg: '#FEF3C7', text: '#D97706', dot: '#F59E0B' },
};

export function Badge({ label, variant = 'default', size = 'sm', icon, animated = false }: BadgeProps) {
  const vc = variantColors[variant];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.85, duration: 1000, useNativeDriver: Platform.OS !== `web`, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: Platform.OS !== `web`, easing: Easing.inOut(Easing.sin) }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [animated]);

  const content = (
    <View style={[styles.badge, { backgroundColor: vc.bg }, size === 'md' && styles.md]}>
      {vc.dot && variant !== 'default' && variant !== 'premium' && (
        <View style={[styles.dot, { backgroundColor: vc.dot }]} />
      )}
      {variant === 'premium' && (
        <Text style={styles.star}>✦</Text>
      )}
      {icon && (
        <Ionicons name={icon} size={size === 'md' ? 13 : 11} color={vc.text as any} />
      )}
      <Text style={[styles.text, { color: vc.text }, size === 'md' && styles.mdText]}>
        {label}
      </Text>
    </View>
  );

  if (animated) {
    return <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>{content}</Animated.View>;
  }
  return content;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: borderRadius.full, alignSelf: 'flex-start',
  },
  md: { paddingHorizontal: 14, paddingVertical: 6 },
  text: { fontSize: 12, fontWeight: '600' },
  mdText: { fontSize: 13 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  star: { fontSize: 12, color: '#F59E0B', marginRight: 1 },
});

