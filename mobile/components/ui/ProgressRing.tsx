import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedProps, withTiming, withSpring, Easing, interpolate,
} from 'react-native-reanimated';
import { colors, spacing, typography } from '../../lib/theme';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  spring?: boolean;
}

export function ProgressRing({
  progress, size = 64, strokeWidth = 5, color = colors.primary,
  showLabel = true, label, animated = true, spring = false,
}: ProgressRingProps) {
  const animProgress = useSharedValue(0);
  const dim = size + strokeWidth * 2;
  const radius = size / 2;

  useEffect(() => {
    if (spring) {
      animProgress.value = withSpring(progress / 100, { stiffness: 60, damping: 12, mass: 0.3 });
    } else {
      animProgress.value = withTiming(progress / 100, {
        duration: 1200,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
    }
  }, [progress, spring]);

  const getColor = () => {
    if (progress >= 80) return colors.success;
    if (progress >= 60) return colors.warning;
    return colors.error;
  };

  const ringColor = color === 'auto' ? getColor() : color;

  const animatedStyle = (() => {
    const rotate = animProgress.value;
    const deg = interpolate(rotate, [0, 1], [0, 360]);
    return {
      transform: [{ rotate: `${deg}deg` }],
    };
  })();

  return (
    <View style={[styles.container, { width: dim, height: dim }]}>
      <View style={[styles.ringBg, {
        width: dim, height: dim, borderRadius: dim / 2,
        borderWidth: strokeWidth, borderColor: colors.borderLight,
      }]} />
      <Animated.View style={[styles.ringFill, {
        width: dim, height: dim, borderRadius: dim / 2,
        borderWidth: strokeWidth, borderColor: ringColor, borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
      }, animatedStyle]} />
      {showLabel && (
        <View style={[styles.label, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[styles.percent, { fontSize: size * 0.2 }]}>
            {Math.round(progress)}%
          </Text>
          {label && <Text style={styles.subLabel}>{label}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBg: {
    position: 'absolute',
  },
  ringFill: {
    position: 'absolute',
  },
  label: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  percent: {
    color: colors.text,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  subLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '500',
    marginTop: 1,
  },
});
