import React, { useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padded?: boolean;
  glass?: boolean;
  gradient?: boolean;
  gradientColors?: readonly [string, string];
  glowColor?: string;
}

export function Card({
  children, onPress, style, padded = true, glass = false,
  gradient = false, gradientColors, glowColor,
}: CardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const pressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.97, stiffness: 300, damping: 20, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(glow, { toValue: 1, duration: 150, useNativeDriver: false }),
    ]).start();
  }, []);

  const pressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, stiffness: 300, damping: 20, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(glow, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
  }, []);

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.08] });
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });

  const Container = onPress ? TouchableOpacity : View;

  const cardStyle = [
    styles.card,
    glass && styles.glass,
    padded && styles.padded,
    style,
  ];

  const content = (
    <>
      {glowColor && (
        <Animated.View
          style={[
            styles.glowOverlay,
            { backgroundColor: glowColor, opacity: glowOpacity, transform: [{ scale: glowScale }] },
          ]}
          pointerEvents="none"
        />
      )}
      {gradient && gradientColors ? (
        <LinearGradient colors={gradientColors} style={[styles.card, styles.gradientCard, padded && styles.padded]}>
          {children}
        </LinearGradient>
      ) : (
        children
      )}
    </>
  );

  if (onPress) {
    return (
      <Animated.View style={[{ transform: [{ scale }] }]}>
        <Container
          onPress={onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          activeOpacity={1}
          style={cardStyle}
        >
          {content}
        </Container>
      </Animated.View>
    );
  }

  return <View style={cardStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadow.md,
    overflow: 'hidden',
  },
  glass: {
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  gradientCard: {
    backgroundColor: 'transparent',
    ...shadow.lg,
  },
  padded: { padding: spacing.md },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
  },
});
