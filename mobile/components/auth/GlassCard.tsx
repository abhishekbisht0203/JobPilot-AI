import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Platform } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}

export default function GlassCard({ children, delay = 0, style }: GlassCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, delay, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: Platform.OS !== `web` }),
      Animated.timing(translateY, { toValue: 0, duration: 600, delay, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: Platform.OS !== `web` }),
      Animated.timing(scale, { toValue: 1, duration: 600, delay, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: Platform.OS !== `web` }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity, transform: [{ translateY }, { scale }] }, style]}>
      <View style={styles.gradientBorder} />
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 32,
    padding: 28,
    shadowColor: 'rgba(70,90,150,0.12)',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 12,
    overflow: 'hidden',
  },
  gradientBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
});

