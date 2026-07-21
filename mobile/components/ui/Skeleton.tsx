import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../../lib/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  borderRadiusValue?: number;
}

export function Skeleton({
  width = '100%',
  height = 20,
  style,
  borderRadiusValue = borderRadius.sm,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius: borderRadiusValue, opacity },
        style,
      ]}
    />
  );
}

export function JobCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={20} width="60%" />
      <Skeleton height={14} width="40%" style={{ marginTop: 8 }} />
      <Skeleton height={14} width="80%" style={{ marginTop: 12 }} />
      <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
        <Skeleton height={24} width={60} borderRadiusValue={12} />
        <Skeleton height={24} width={80} borderRadiusValue={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: { backgroundColor: colors.surfaceLight },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
