import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: W, height: H } = Dimensions.get('window');

const BLOBS = [
  { size: 320, startX: -80, startY: -100, moveX: 40, moveY: 30, dur: 7000, colors: ['rgba(79,124,255,0.15)', 'rgba(110,91,255,0.08)'] as const },
  { size: 260, startX: W - 180, startY: H * 0.2, moveX: -30, moveY: 40, dur: 9000, colors: ['rgba(110,91,255,0.12)', 'rgba(139,92,246,0.06)'] as const },
  { size: 200, startX: -40, startY: H * 0.6, moveX: 35, moveY: -25, dur: 8000, colors: ['rgba(79,124,255,0.1)', 'rgba(139,92,246,0.05)'] as const },
  { size: 280, startX: W * 0.5, startY: H - 160, moveX: -25, moveY: -35, dur: 10000, colors: ['rgba(139,92,246,0.12)', 'rgba(79,124,255,0.06)'] as const },
];

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i, size: 2 + (i % 3) * 1.5,
  x: Math.random() * W, y: Math.random() * H,
  dur: 8000 + Math.random() * 6000, delay: Math.random() * 4000,
  xDrift: (Math.random() - 0.5) * 40,
}));

function Blob({ blob }: { blob: typeof BLOBS[0] }) {
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(tx, { toValue: blob.moveX, duration: blob.dur, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== `web` }),
          Animated.timing(ty, { toValue: blob.moveY, duration: blob.dur * 1.2, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== `web` }),
        ]),
        Animated.parallel([
          Animated.timing(tx, { toValue: 0, duration: blob.dur, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== `web` }),
          Animated.timing(ty, { toValue: 0, duration: blob.dur * 1.2, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== `web` }),
        ]),
      ]),
      { iterations: -1 },
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.blob, { width: blob.size, height: blob.size, borderRadius: blob.size / 2, left: blob.startX, top: blob.startY }, { transform: [{ translateX: tx }, { translateY: ty }] }]}>
      <LinearGradient colors={blob.colors} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
    </Animated.View>
  );
}

function Particle({ p }: { p: typeof PARTICLES[0] }) {
  const y = useRef(new Animated.Value(p.y)).current;
  const x = useRef(new Animated.Value(p.x)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(y, { toValue: -20, duration: p.dur, easing: Easing.linear, useNativeDriver: Platform.OS !== `web` }),
        Animated.sequence([
          Animated.timing(x, { toValue: p.x + p.xDrift, duration: p.dur * 0.5, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== `web` }),
          Animated.timing(x, { toValue: p.x, duration: p.dur * 0.5, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== `web` }),
        ]),
        Animated.loop(
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.6, duration: p.dur * 0.5, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== `web` }),
            Animated.timing(opacity, { toValue: 0.3, duration: p.dur * 0.5, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== `web` }),
          ]),
          { iterations: -1 },
        ),
      ]),
      { iterations: -1 },
    ).start();
  }, []);
  return <Animated.View style={[styles.particle, { width: p.size, height: p.size, borderRadius: p.size / 2, opacity, transform: [{ translateX: x }, { translateY: y }] }]} />;
}

export default function AnimatedBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#F8FAFF', '#EEF4FF'] as const} style={StyleSheet.absoluteFill} />
      {BLOBS.map((b, i) => <Blob key={i} blob={b} />)}
      {PARTICLES.map((p) => <Particle key={p.id} p={p} />)}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: { position: 'absolute', opacity: 0.8 },
  particle: { position: 'absolute', backgroundColor: '#4F7CFF' },
  glowTop: {
    position: 'absolute', top: -100, right: -60, width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#4F7CFF', opacity: 0.03,
  },
  glowBottom: {
    position: 'absolute', bottom: -80, left: -50, width: 180, height: 180, borderRadius: 90,
    backgroundColor: '#8B5CF6', opacity: 0.025,
  },
});

