import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface PasswordStrengthProps {
  password: string;
}

const LEVELS = [
  { min: 0, label: 'Weak', color: '#EF4444', bars: 1 },
  { min: 6, label: 'Fair', color: '#F59E0B', bars: 2 },
  { min: 8, label: 'Good', color: '#3B82F6', bars: 3 },
  { min: 12, label: 'Strong', color: '#22C55E', bars: 4 },
];

function getLevel(password: string) {
  if (!password) return null;
  const score = password.length < 6 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  return LEVELS[score];
}

function Bar({ active, color, delayMs }: { active: boolean; color: string; delayMs: number }) {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (active) {
      Animated.timing(w, { toValue: 1, duration: 300, delay: delayMs, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: false }).start();
    } else {
      Animated.timing(w, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
  }, [active]);
  return <Animated.View style={[styles.bar, { opacity: w, backgroundColor: active ? color : '#E5E7EB' }]} />;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const level = getLevel(password);
  if (!level) return null;

  return (
    <View style={styles.row}>
      <View style={styles.bars}>
        {[0, 1, 2, 3].map((i) => (
          <Bar key={i} active={i < level.bars} color={level.color} delayMs={i * 50} />
        ))}
      </View>
      <Text style={[styles.label, { color: level.color }]}>{level.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, marginBottom: 2 },
  bars: { flexDirection: 'row', gap: 4, flex: 1 },
  bar: { flex: 1, height: 3, borderRadius: 2, backgroundColor: '#E5E7EB' },
  label: { fontSize: 11, fontWeight: '700' },
});
