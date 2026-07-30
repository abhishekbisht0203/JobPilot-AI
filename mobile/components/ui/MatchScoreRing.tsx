import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadow } from '../../lib/theme';

interface MatchScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
}

export function MatchScoreRing({ score, size = 56, strokeWidth = 4, animated = true }: MatchScoreRingProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const getColor = (s: number) => {
    if (s >= 80) return colors.success;
    if (s >= 60) return colors.warning;
    return colors.error;
  };

  const color = getColor(score);
  const halfSize = size / 2;
  const radius = halfSize - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (animated) {
      Animated.timing(progress, {
        toValue: score / 100, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: false,
      }).start();
    } else {
      progress.setValue(score / 100);
    }
  }, [score, animated]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const animatedScore = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, score],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <svg width={size} height={size}>
        <circle
          cx={halfSize} cy={halfSize} r={radius}
          stroke="#E5E7EB" strokeWidth={strokeWidth} fill="none"
        />
        <AnimatedCircle
          cx={halfSize} cy={halfSize} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${halfSize} ${halfSize})`}
        />
      </svg>
      <View style={styles.labelContainer}>
        <Animated.Text style={[styles.score, { color, fontSize: size * 0.22 }]}>
          {animated ? null : Math.round(score)}%
        </Animated.Text>
      </View>
    </View>
  );
}

export function MatchScoreRingSimple({ score, size = 56, animated = true }: MatchScoreRingProps) {
  const getColor = (s: number) => {
    if (s >= 80) return colors.success;
    if (s >= 60) return colors.warning;
    return colors.error;
  };

  const color = getColor(score);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.spring(scaleAnim, { toValue: 1, stiffness: 100, damping: 15, useNativeDriver: Platform.OS !== `web` }).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [score, animated]);

  return (
    <Animated.View
      style={[
        styles.simpleContainer,
        { width: size, height: size, borderRadius: size / 2, borderColor: color, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={[styles.simpleInner, { width: size - 8, height: size - 8, borderRadius: (size - 8) / 2 }]}
      >
        <Text style={[styles.score, { color, fontSize: size * 0.22 }]}>{Math.round(score)}%</Text>
      </LinearGradient>
    </Animated.View>
  );
}

function AnimatedCircle(props: any) {
  const { cx, cy, r, ...rest } = props;
  return (
    <circle cx={cx} cy={cy} r={r} {...rest} />
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', justifyContent: 'center', alignItems: 'center' },
  labelContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  score: { fontWeight: '700' as const },
  simpleContainer: {
    borderWidth: 3, justifyContent: 'center', alignItems: 'center',
    ...shadow.sm,
  },
  simpleInner: { justifyContent: 'center', alignItems: 'center' },
});

