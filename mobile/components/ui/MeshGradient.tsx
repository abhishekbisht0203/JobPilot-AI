import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  withSequence, Easing, interpolate, Extrapolation,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface BlobConfig {
  size: number;
  position: { x: number; y: number };
  colors: readonly [string, string];
  duration: number;
  amplitude: number;
}

const BLOBS: BlobConfig[] = [
  {
    size: 280,
    position: { x: -60, y: -80 },
    colors: ['#3B82F6', '#60A5FA'] as const,
    duration: 6000,
    amplitude: 40,
  },
  {
    size: 220,
    position: { x: width - 140, y: 60 },
    colors: ['#8B5CF6', '#A78BFA'] as const,
    duration: 8000,
    amplitude: 30,
  },
  {
    size: 200,
    position: { x: width * 0.3, y: height * 0.5 },
    colors: ['#EC4899', '#F472B6'] as const,
    duration: 7000,
    amplitude: 35,
  },
  {
    size: 180,
    position: { x: width * 0.1, y: height * 0.7 },
    colors: ['#14B8A6', '#34D399'] as const,
    duration: 9000,
    amplitude: 25,
  },
  {
    size: 240,
    position: { x: width * 0.6, y: height * 0.85 },
    colors: ['#6366F1', '#8B5CF6'] as const,
    duration: 7500,
    amplitude: 30,
  },
  {
    size: 160,
    position: { x: width * 0.8, y: height * 0.35 },
    colors: ['#F59E0B', '#FBBF24'] as const,
    duration: 5500,
    amplitude: 20,
  },
];

function Blob({ config }: { config: BlobConfig }) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    tx.value = withRepeat(
      withSequence(
        withTiming(-config.amplitude, { duration: config.duration / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(config.amplitude, { duration: config.duration / 2, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, true,
    );
    ty.value = withRepeat(
      withSequence(
        withTiming(config.amplitude * 0.6, { duration: config.duration / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(-config.amplitude * 0.6, { duration: config.duration / 2, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, true,
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: config.duration, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.85, { duration: config.duration, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.blob,
        {
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          left: config.position.x,
          top: config.position.y,
          opacity: 0.15,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={config.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

interface MeshGradientProps {
  opacity?: number;
  blobs?: BlobConfig[];
}

export function MeshGradient({ opacity = 1, blobs = BLOBS }: MeshGradientProps) {
  return (
    <View style={[styles.container, { opacity }]} pointerEvents="none">
      {blobs.map((config, index) => (
        <Blob key={index} config={config} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    overflow: 'hidden',
  },
});
