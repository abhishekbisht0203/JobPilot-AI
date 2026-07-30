import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FeaturePillProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  index?: number;
}

const FLOATS = [-2, 2, -1, 3, -3, 1];

export default function FeaturePill({ icon, label, index = 0 }: FeaturePillProps) {
  const float = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const baseDelay = 800 + index * 120;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: baseDelay, useNativeDriver: Platform.OS !== `web` }),
      Animated.timing(scale, { toValue: 1, duration: 400, delay: baseDelay, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: Platform.OS !== `web` }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: FLOATS[index % FLOATS.length], duration: 3000 + index * 400, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== `web` }),
        Animated.timing(float, { toValue: 0, duration: 3000 + index * 400, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== `web` }),
      ]),
      { iterations: -1 },
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.pill, { opacity, transform: [{ scale }, { translateY: float }] }]}>
      <Ionicons name={icon} size={13} color="#4F7CFF" />
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.85)',
    shadowColor: 'rgba(70,90,150,0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  label: {
    fontSize: 12, fontWeight: '600', color: '#4F7CFF', letterSpacing: 0.2,
  },
});

