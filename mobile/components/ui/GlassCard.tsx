import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing, interpolateColor,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  intensity?: number;
  glowColor?: string;
  gradient?: boolean;
  gradientColors?: readonly [string, string];
}

export function GlassCard({
  children, style, onPress, intensity = 40, glowColor, gradient, gradientColors,
}: GlassCardProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { stiffness: 400, damping: 12 });
    if (glowColor) glow.value = withTiming(1, { duration: 150 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { stiffness: 300, damping: 15 });
    if (glowColor) glow.value = withTiming(0, { duration: 200 });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + glow.value * 0.35,
    transform: [{ scale: 1 + glow.value * 0.02 }],
  }));

  const content = (
    <Animated.View style={[styles.wrapper, cardStyle]}>
      {glowColor && (
        <Animated.View style={[styles.glow, { backgroundColor: glowColor }, glowStyle]} />
      )}
      <BlurView intensity={intensity} tint="light" style={styles.blur}>
        {gradient ? (
          <LinearGradient
            colors={gradientColors || ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.content, style]}
          >
            {children}
          </LinearGradient>
        ) : (
          <View style={[styles.content, style]}>
            {children}
          </View>
        )}
        <View style={styles.border} pointerEvents="none" />
      </BlurView>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadow.lg,
  },
  blur: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  content: {
    padding: spacing.md,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    opacity: 0.15,
  },
});
