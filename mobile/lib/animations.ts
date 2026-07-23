import { useRef, useEffect, useCallback } from 'react';
import { Animated, Easing } from 'react-native';
import {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withRepeat, withSequence, withDelay, Easing as ReEasing,
  interpolate, Extrapolation, SharedValue,
} from 'react-native-reanimated';

export function useFadeIn(delay = 0, duration = 500) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1, duration, delay, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true,
    }).start();
  }, []);
  return opacity;
}

export function useSlideUp(delay = 0, distance = 24, duration = 500) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, delay, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration, delay, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, translateY };
}

export function useScaleIn(delay = 0, duration = 500) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration, delay, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration, delay, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true }),
    ]).start();
  }, []);
  return { scale, opacity };
}

export function useStaggerAnimation(count: number, baseDelay = 80) {
  return Array.from({ length: count }, (_, i) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;
    useEffect(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, delay: baseDelay * i, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 400, delay: baseDelay * i, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true }),
      ]).start();
    }, []);
    return { opacity, translateY };
  });
}

export function usePulse(interval = 2000) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: interval / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: interval / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
}

export function useFloat(amplitude = 4, duration = 3000) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return anim.interpolate({ inputRange: [0, 1], outputRange: [-amplitude, amplitude] });
}

export function useSpringPress() {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, stiffness: 300, damping: 12 }).start();
  }, []);
  const pressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, stiffness: 200, damping: 15 }).start();
  }, []);
  return { scale, pressIn, pressOut };
}

export function useCountUp(target: number, duration = 1200, shouldAnimate = true) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (shouldAnimate) {
      value.setValue(0);
      Animated.timing(value, {
        toValue: target, duration, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: false,
      }).start();
    } else {
      value.setValue(target);
    }
  }, [target, shouldAnimate]);
  return value.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: Extrapolation.CLAMP,
  });
}

export function useShimmer() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.65] });
}

export function useReanimatedFadeIn(delay = 0) {
  const opacity = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500, easing: ReEasing.bezier(0.16, 1, 0.3, 1) }));
  }, []);
  return animatedStyle;
}

export function useReanimatedSlideUp(delay = 0) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  useEffect(() => {
    const config = { duration: 500, easing: ReEasing.bezier(0.16, 1, 0.3, 1) };
    opacity.value = withDelay(delay, withTiming(1, config));
    translateY.value = withDelay(delay, withTiming(0, config));
  }, []);
  return animatedStyle;
}

export function useReanimatedScaleIn(delay = 0) {
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  useEffect(() => {
    const config = { duration: 500, easing: ReEasing.bezier(0.16, 1, 0.3, 1) };
    opacity.value = withDelay(delay, withTiming(1, config));
    scale.value = withDelay(delay, withTiming(1, config));
  }, []);
  return animatedStyle;
}

export function useReanimatedSpringPress() {
  const scale = useSharedValue(1);
  const pressIn = useCallback(() => { scale.value = withSpring(0.95, { stiffness: 400, damping: 10 }); }, []);
  const pressOut = useCallback(() => { scale.value = withSpring(1, { stiffness: 300, damping: 15 }); }, []);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return { animatedStyle, pressIn, pressOut };
}

export function useReanimatedPulse() {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800, easing: ReEasing.inOut(ReEasing.sin) }),
        withTiming(1, { duration: 800, easing: ReEasing.inOut(ReEasing.sin) }),
      ),
      -1, true,
    );
  }, []);
  return useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
}

export function useReanimatedFloat(amplitude = 6) {
  const translateY = useSharedValue(0);
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-amplitude, { duration: 1500, easing: ReEasing.inOut(ReEasing.sin) }),
        withTiming(amplitude, { duration: 1500, easing: ReEasing.inOut(ReEasing.sin) }),
      ),
      -1, true,
    );
  }, []);
  return useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
}

export function useReanimatedShimmer() {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.65, { duration: 1000, easing: ReEasing.inOut(ReEasing.sin) }),
        withTiming(0.3, { duration: 1000, easing: ReEasing.inOut(ReEasing.sin) }),
      ),
      -1, true,
    );
  }, []);
  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}

export function useReanimatedGlow(glowOpacity = 0.4) {
  const opacity = useSharedValue(glowOpacity);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(glowOpacity * 0.4, { duration: 1200, easing: ReEasing.inOut(ReEasing.sin) }),
        withTiming(glowOpacity, { duration: 1200, easing: ReEasing.inOut(ReEasing.sin) }),
      ),
      -1, true,
    );
  }, []);
  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}

export function useStaggeredCards(count: number) {
  const values = Array.from({ length: count }, () => useSharedValue(0));
  const styles = values.map((v) =>
    useAnimatedStyle(() => ({
      opacity: v.value,
      transform: [{ translateY: interpolate(v.value, [0, 1], [20, 0], Extrapolation.CLAMP) }],
    }))
  );
  useEffect(() => {
    values.forEach((v, i) => {
      setTimeout(() => {
        v.value = withTiming(1, { duration: 400, easing: ReEasing.bezier(0.16, 1, 0.3, 1) });
      }, i * 80);
    });
  }, []);
  return styles;
}
