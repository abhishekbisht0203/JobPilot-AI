import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../lib/theme';

interface MatchScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function MatchScoreRing({ score, size = 56, strokeWidth = 4 }: MatchScoreRingProps) {
  const getColor = (s: number) => {
    if (s >= 80) return colors.success;
    if (s >= 60) return colors.warning;
    return colors.error;
  };

  const color = getColor(score);
  const halfSize = size / 2;
  const radius = halfSize - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <svg width={size} height={size}>
        <circle
          cx={halfSize}
          cy={halfSize}
          r={radius}
          stroke={colors.surfaceLight}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={halfSize}
          cy={halfSize}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${halfSize} ${halfSize})`}
        />
      </svg>
      <View style={styles.labelContainer}>
        <Text style={[styles.score, { color }]}>{Math.round(score)}%</Text>
      </View>
    </View>
  );
}

export function MatchScoreRingSimple({ score, size = 56 }: MatchScoreRingProps) {
  const getColor = (s: number) => {
    if (s >= 80) return colors.success;
    if (s >= 60) return colors.warning;
    return colors.error;
  };

  const color = getColor(score);
  return (
    <View style={[styles.simpleContainer, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}>
      <View
        style={[
          styles.simpleInner,
          { width: size - 8, height: size - 8, borderRadius: (size - 8) / 2 },
        ]}
      >
        <Text style={[styles.score, { color, fontSize: size * 0.22 }]}>{Math.round(score)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', justifyContent: 'center', alignItems: 'center' },
  labelContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  score: { fontWeight: '700' as const },
  simpleContainer: {
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  simpleInner: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
