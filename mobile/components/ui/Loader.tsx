import React, { useEffect, useRef } from 'react';
import { View, Animated, Text, StyleSheet, Easing, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../../lib/theme';

interface LoaderProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'small' | 'large';
}

export function Loader({ fullScreen = false, message, size = 'large' }: LoaderProps) {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const loaderSize = size === 'large' ? 44 : 24;

  const renderLoader = () => (
    <View style={styles.loaderWrap}>
      <Animated.View style={[styles.spinner, { width: loaderSize, height: loaderSize, borderRadius: loaderSize / 2, transform: [{ rotate: spin }] }]}>
        <LinearGradient
          colors={['#2563EB', '#4F8CFF', '#8B5CF6']}
          style={[styles.spinnerInner, { width: loaderSize, height: loaderSize, borderRadius: loaderSize / 2 }]}
        />
      </Animated.View>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );

  if (fullScreen) {
    return <View style={styles.fullScreen}>{renderLoader()}</View>;
  }
  return <View style={styles.inline}>{renderLoader()}</View>;
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  inline: { padding: spacing.lg, justifyContent: 'center', alignItems: 'center' },
  loaderWrap: { alignItems: 'center', gap: spacing.md },
  spinner: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  spinnerInner: { justifyContent: 'center', alignItems: 'center' },
  message: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
});
