import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, Easing } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');
const BLOB_COUNT = 4;

function Blob({ index, colors: gradientColors }: { index: number; colors: string[] }) {
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const size = 140 + index * 40;
  const offsets = [
    { x: 0.2, y: 0.3 }, { x: 0.7, y: 0.2 }, { x: 0.5, y: 0.7 }, { x: 0.8, y: 0.6 },
  ];

  useEffect(() => {
    const duration = 6000 + index * 2000;
    const animX = Animated.loop(
      Animated.sequence([
        Animated.timing(x, { toValue: 1, duration, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(x, { toValue: 0, duration, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    );
    const animY = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: 1, duration: duration * 1.2, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(y, { toValue: 0, duration: duration * 1.2, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    );
    const animScale = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.1, duration: duration * 0.6, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(scale, { toValue: 0.8, duration: duration * 0.6, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    );
    const animRotate = Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: duration * 1.5, useNativeDriver: true, easing: Easing.linear })
    );

    animX.start();
    animY.start();
    animScale.start();
    animRotate.start();
    return () => { animX.stop(); animY.stop(); animScale.stop(); animRotate.stop(); };
  }, []);

  const translateX = x.interpolate({
    inputRange: [0, 1],
    outputRange: [-20 + offsets[index].x * W * 0.1, 20 + offsets[index].x * W * 0.1],
  });
  const translateY = y.interpolate({
    inputRange: [0, 1],
    outputRange: [-10 + offsets[index].y * H * 0.1, 10 + offsets[index].y * H * 0.1],
  });
  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.blob,
        {
          width: size, height: size, borderRadius: size / 2,
          left: offsets[index].x * W - size / 2,
          top: offsets[index].y * H - size / 2,
          backgroundColor: gradientColors[index % gradientColors.length],
          opacity: 0.12 - index * 0.015,
          transform: [
            { translateX }, { translateY },
            { scale }, { rotate: rotation },
          ],
        },
      ]}
    />
  );
}

export function AnimatedBackground() {
  const gradientColors = ['#2563EB', '#4F8CFF', '#8B5CF6', '#F472B6'];

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: BLOB_COUNT }).map((_, i) => (
        <Blob key={i} index={i} colors={gradientColors} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject },
  blob: {
    position: 'absolute',
  },
});
