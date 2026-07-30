import React, { useRef } from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface GlowButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: string;
}

export default function GlowButton({ onPress, loading, disabled, children }: GlowButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, stiffness: 400, damping: 20, useNativeDriver: Platform.OS !== `web` }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, stiffness: 400, damping: 20, useNativeDriver: Platform.OS !== `web` }).start()}
      disabled={loading || disabled}
      activeOpacity={1}
    >
      <Animated.View style={[styles.shadowWrap, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={['#4F7CFF', '#6E5BFF', '#7C5CFF'] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btn}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.text}>{children}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 6 }} />
            </>
          )}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: 18,
    shadowColor: '#4F7CFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  btn: {
    height: 56, borderRadius: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28,
  },
  text: {
    color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3,
  },
});

