import React, { useRef } from 'react';
import { Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SocialButtonProps {
  provider: 'google' | 'linkedin' | 'github' | 'apple';
  onPress?: () => void;
}

const CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }> = {
  google: { icon: 'logo-google', label: 'Google', color: '#111827' },
  linkedin: { icon: 'logo-linkedin', label: 'LinkedIn', color: '#0A66C2' },
  github: { icon: 'logo-github', label: 'GitHub', color: '#111827' },
  apple: { icon: 'logo-apple', label: 'Apple', color: '#111827' },
};

export default function SocialButton({ provider, onPress }: SocialButtonProps) {
  const cfg = CONFIG[provider];
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, stiffness: 400, damping: 20, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, stiffness: 400, damping: 20, useNativeDriver: true }).start()}
      activeOpacity={1}
      style={{ flex: 1 }}
    >
      <Animated.View style={[styles.btn, { transform: [{ scale }] }]}>
        <Ionicons name={cfg.icon} size={18} color={cfg.color} />
        <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row', height: 48, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1, borderColor: 'rgba(226,232,240,0.8)',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: 'rgba(70,90,150,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 2,
  },
  label: { fontSize: 14, fontWeight: '600' },
});
