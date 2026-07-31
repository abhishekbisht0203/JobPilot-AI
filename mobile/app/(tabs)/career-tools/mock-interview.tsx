import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { colors, spacing, borderRadius } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import {
  GradientCard, FeatureList, SessionCard, PrimaryButton,
  CTSectionHeader, LoadingState,
} from '../../../components/career-tools/shared';
import { ScreenHeader } from '../../../components/career-tools';
import { MockInterviewIllus } from '../../../components/career-tools/illustrations';

const HERO_GRADIENT = colors.tool.mockInterview;

const FEATURES = [
  { icon: 'chatbubbles', text: 'AI Interview' },
  { icon: 'mic', text: 'Communication' },
  { icon: 'chatbox-ellipses', text: 'Feedback' },
  { icon: 'trending-up', text: 'Track Progress' },
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

  return (
    <View style={styles.container}>
      <ScreenHeader title="Mock Interview" subtitle="Practice with AI Interviewer" icon="mic" iconColors={HERO_GRADIENT} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100).springify().damping(14)}>
          <GradientCard
            colors={HERO_GRADIENT}
            illustration={<MockInterviewIllus />}
            title="Practice with AI Interviewer"
          >
            <FeatureList items={FEATURES} />
          </GradientCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify().damping(14)} style={{ marginTop: spacing.lg }}>
          <PrimaryButton
            title="Start Mock Interview"
            icon="mic"
            onPress={() => router.push('/ai/mock-interview' as any)}
            gradient={HERO_GRADIENT}
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
              gradientColors={HERO_GRADIENT}
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
  scroll: { paddingBottom: getTabListBottomPadding() + spacing.xl, paddingTop: spacing.md },
  heroCard: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    overflow: 'hidden',
    flexDirection: 'row',
  },
});
