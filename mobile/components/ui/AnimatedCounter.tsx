import React, { useEffect } from 'react';
import { Text, TextStyle, Platform } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedProps, withSpring, withTiming,
  interpolate, Extrapolation, Easing,
} from 'react-native-reanimated';
import { colors, typography } from '../../lib/theme';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  style?: TextStyle | TextStyle[];
  decimals?: number;
  spring?: boolean;
}

export function AnimatedCounter({
  value, suffix = '', prefix = '', duration = 1200,
  style, decimals = 0, spring = false,
}: AnimatedCounterProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (spring) {
      progress.value = 0;
      progress.value = withSpring(1, { stiffness: 60, damping: 12, mass: 0.5 });
    } else {
      progress.value = 0;
      progress.value = withTiming(1, { duration, easing: Easing.bezier(0.16, 1, 0.3, 1) });
    }
  }, [value, spring]);

  const animatedProps = useAnimatedProps(() => {
    const current = interpolate(progress.value, [0, 1], [0, value], Extrapolation.CLAMP);
    const formatted = current.toFixed(decimals);
    return {
      text: `${prefix}${formatted}${suffix}`,
    } as any;
  });

  return (
    <AnimatedText
      animatedProps={animatedProps}
      style={[{ fontVariant: ['tabular-nums'] }, style]}
    />
  );
}
