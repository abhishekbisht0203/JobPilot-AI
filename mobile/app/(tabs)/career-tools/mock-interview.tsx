import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import {
  GradientCard, FeatureList, SessionCard, PrimaryButton,
  CTSectionHeader, LoadingState,
} from '../../../components/career-tools/shared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FEATURES = [
  { icon: 'chatbubbles', text: 'AI-powered interview simulation' },
  { icon: 'mic', text: 'Real-time voice feedback' },
  { icon: 'chatbox-ellipses', text: 'Communication analysis' },
  { icon: 'trending-up', text: 'Track your progress over time' },
];

const MOCK_SESSIONS = [
  { id: '1', title: 'Frontend Interview', duration: '25 min', date: 'Jul 28, 2026', score: 88 },
  { id: '2', title: 'System Design', duration: '30 min', date: 'Jul 25, 2026', score: 72 },
  { id: '3', title: 'Behavioral Round', duration: '20 min', date: 'Jul 22, 2026', score: 91 },
  { id: '4', title: 'Data Structures', duration: '35 min', date: 'Jul 20, 2026', score: 65 },
];

export default function MockInterviewScreen() {
  const { horizontalPadding } = useResponsive();
  const [loading, setLoading] = useState(false);

  const floatY = useSharedValue(0);
  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(8, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, true,
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: floatY.value }] }));

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100).springify().damping(14)} style={{ marginTop: spacing.md }}>
          <LinearGradient colors={['#14B8A6', '#0D9488']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Mock Interview</Text>
              <Text style={styles.heroSub}>Practice with AI-powered simulations</Text>
              <FeatureList items={FEATURES} color="#5EEAD4" />
            </View>
            <Animated.View style={[styles.heroIllustration, floatStyle]}>
              <View style={styles.robotIcon}>
                <Ionicons name="mic-circle" size={64} color="rgba(255,255,255,0.15)" />
              </View>
              <View style={styles.floatingDot1} />
              <View style={styles.floatingDot2} />
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify().damping(14)} style={{ marginTop: spacing.lg }}>
          <PrimaryButton
            title="Start Interview"
            icon="mic"
            onPress={() => router.push('/ai/mock-interview' as any)}
            gradient={['#14B8A6', '#0D9488']}
          />
        </Animated.View>

        <CTSectionHeader title="Recent Sessions" icon="time-outline" badge={MOCK_SESSIONS.length} />

        {loading ? (
          <LoadingState count={4} />
        ) : (
          MOCK_SESSIONS.map((s, i) => (
            <SessionCard
              key={s.id}
              title={s.title}
              duration={s.duration}
              date={s.date}
              score={s.score}
              gradientColors={['#14B8A6', '#0D9488']}
              onPress={() => router.push('/ai/mock-interview' as any)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding() + spacing.xl },
  heroCard: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    ...shadow.lg,
  },
  heroTitle: { color: '#FFF', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: spacing.xs, marginBottom: spacing.md, lineHeight: 20 },
  heroIllustration: { marginLeft: spacing.md, justifyContent: 'center', alignItems: 'center', width: 80 },
  robotIcon: { alignItems: 'center' },
  floatingDot1: {
    position: 'absolute', width: 12, height: 12, borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)', top: 0, right: 0,
  },
  floatingDot2: {
    position: 'absolute', width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)', bottom: 10, left: 0,
  },
});
