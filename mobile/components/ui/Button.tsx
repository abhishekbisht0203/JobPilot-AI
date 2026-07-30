import React, { useRef, useCallback } from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated, ViewStyle, TextStyle, Platform, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: boolean;
  fullWidth?: boolean;
  success?: boolean;
  successLabel?: string;
}

export function Button({
  title, onPress, variant = 'primary', size = 'md', loading = false,
  disabled = false, icon, style, textStyle, gradient = false,
  fullWidth = false, success = false, successLabel,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.96, stiffness: 400, damping: 25, useNativeDriver: Platform.OS !== `web` }).start();
  }, []);

  const pressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, stiffness: 400, damping: 25, useNativeDriver: Platform.OS !== `web` }).start();
  }, []);

  const showGradient = gradient && !disabled && (variant === 'primary' || variant === 'success' || variant === 'danger');

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : success && successLabel ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>{successLabel}</Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon && icon}
          <Text style={[baseText, sizeText[size], variantText[variant], textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </>
  );

  const getContainer = (children: React.ReactNode) => {
    if (showGradient) {
      const gradColors: any = {
        primary: colors.gradient.primary,
        success: colors.gradient.success,
        danger: colors.gradient.error,
      };
      return (
        <LinearGradient
          colors={gradColors[variant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, sizeStyles[size], fullWidth && { width: '100%' }, styles.shadow]}
        >
          {children}
        </LinearGradient>
      );
    }
    return (
      <View style={[
        styles.base, sizeStyles[size], fullWidth && { width: '100%' },
        variantStyles[variant], variantShadow[variant],
        disabled && styles.disabled,
      ]}>
        {children}
      </View>
    );
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && { width: '100%' }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
      >
        {getContainer(content)}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    borderRadius: borderRadius.md,
  },
  shadow: {
    ...shadow.glow.primary,
  },
  disabled: { opacity: 0.5 },
});

const sizeStyles = StyleSheet.create({
  sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, height: 36 },
  md: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg, height: 48 },
  lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, height: 56 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  success: { backgroundColor: colors.success },
  danger: { backgroundColor: colors.error },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent' },
});

const variantShadow = StyleSheet.create({
  primary: { ...shadow.glow.primary },
  secondary: {},
  success: { ...shadow.glow.success },
  danger: {},
  outline: {},
  ghost: {},
});

const baseText: TextStyle = { fontWeight: '600' as const };

const sizeText = StyleSheet.create({
  sm: { fontSize: 14 },
  md: { fontSize: 16 },
  lg: { fontSize: 18 },
});

const variantText = StyleSheet.create({
  primary: { color: colors.white },
  secondary: { color: colors.white },
  success: { color: colors.white },
  danger: { color: colors.white },
  outline: { color: colors.primary },
  ghost: { color: colors.primary },
});

