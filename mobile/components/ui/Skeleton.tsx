import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, Easing, Platform } from 'react-native';
import { colors, borderRadius, shadow } from '../../lib/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  borderRadiusValue?: number;
}

export function Skeleton({ width = '100%', height = 20, style, borderRadiusValue = borderRadius.sm }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: useNative, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: useNative, easing: Easing.inOut(Easing.sin) }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.65] });

  return (
    <Animated.View
      style={[styles.skeleton, { width: width as any, height, borderRadius: borderRadiusValue, opacity }, style]}
    />
  );
}

export function JobCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Skeleton height={48} width={48} borderRadiusValue={12} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Skeleton height={18} width="70%" />
          <Skeleton height={14} width="45%" style={{ marginTop: 6 }} />
        </View>
      </View>
      <View style={styles.metaRow}>
        <Skeleton height={12} width="30%" borderRadiusValue={6} />
        <Skeleton height={12} width="25%" borderRadiusValue={6} />
        <Skeleton height={12} width="20%" borderRadiusValue={6} />
      </View>
      <Skeleton height={14} width="100%" style={{ marginTop: 8 }} />
      <Skeleton height={14} width="85%" style={{ marginTop: 6 }} />
      <View style={styles.tagRow}>
        <Skeleton height={26} width={70} borderRadiusValue={13} />
        <Skeleton height={26} width={90} borderRadiusValue={13} />
        <Skeleton height={26} width={60} borderRadiusValue={13} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: { backgroundColor: colors.border },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: 16,
    marginBottom: 12, ...shadow.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  tagRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
});
