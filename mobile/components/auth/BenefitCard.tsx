import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface BenefitCardProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}

export default function BenefitCard({ icon, title, description, delay = 0 }: BenefitCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, alignItems: 'center', padding: 14,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    shadowColor: 'rgba(70,90,150,0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 16, elevation: 2,
  },
  icon: { fontSize: 22, marginBottom: 6 },
  title: { fontSize: 12, fontWeight: '700', color: '#111827', marginBottom: 3, textAlign: 'center' },
  desc: { fontSize: 10, color: '#6B7280', textAlign: 'center', lineHeight: 14 },
});
