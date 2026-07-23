import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryAction?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction, secondaryAction, onSecondaryAction }: EmptyStateProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const iconFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, stiffness: 120, damping: 12, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.bezier(0.16, 1, 0.3, 1) }),
    ]).start();

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(iconFloat, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(iconFloat, { toValue: 0, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, []);

  const floatY = iconFloat.interpolate({ inputRange: [0, 1], outputRange: [-4, 4] });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }, { translateY: floatY }] }]}>
        <LinearGradient colors={['#EFF6FF', '#F5F3FF']} style={styles.iconBg}>
          <Ionicons name={icon} size={40} color={colors.primary} />
        </LinearGradient>
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {(actionLabel && onAction) && (
          <View style={styles.actions}>
            <Button title={actionLabel} onPress={onAction} variant="primary" gradient size="md" />
            {secondaryAction && onSecondaryAction && (
              <Button title={secondaryAction} onPress={onSecondaryAction} variant="ghost" size="sm" style={{ marginTop: 8 }} />
            )}
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: spacing.xl, paddingVertical: spacing.xxxl * 2,
  },
  iconWrap: {
    width: 88, height: 88, borderRadius: 44, marginBottom: spacing.lg,
    ...shadow.md,
  },
  iconBg: {
    width: 88, height: 88, borderRadius: 44,
    justifyContent: 'center', alignItems: 'center',
  },
  title: {
    color: colors.text, fontSize: 20, fontWeight: '600',
    marginTop: spacing.sm, textAlign: 'center',
  },
  message: {
    color: colors.textSecondary, fontSize: 14,
    marginTop: spacing.sm, textAlign: 'center', lineHeight: 20,
    maxWidth: 280,
  },
  actions: { alignItems: 'center', marginTop: spacing.lg, gap: spacing.xs },
});
