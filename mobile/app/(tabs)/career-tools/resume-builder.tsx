import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import {
  GradientCard, FeatureList, ResumeCard, PrimaryButton, SecondaryButton,
  CTSectionHeader, LoadingState, AnimatedCard,
} from '../../../components/career-tools/shared';
import { ScreenHeader } from '../../../components/career-tools';
import { Badge } from '../../../components/ui/Badge';

const HERO_GRADIENT = colors.tool.resumeBuilder;

const FEATURES = [
  { icon: 'document-text', text: 'ATS-optimized templates' },
  { icon: 'sparkles', text: 'AI-powered content suggestions' },
  { icon: 'color-palette', text: 'Professional color schemes' },
  { icon: 'download', text: 'Export as PDF or DOCX' },
];

const MOCK_RESUMES = [
  { id: '1', name: 'Software Engineer Resume', date: 'Updated Jul 28, 2026', score: 92 },
  { id: '2', name: 'Frontend Developer Resume', date: 'Updated Jul 25, 2026', score: 85 },
  { id: '3', name: 'Full Stack Resume', date: 'Updated Jul 20, 2026', score: 78 },
];

export default function ResumeBuilderScreen() {
  const { horizontalPadding, width } = useResponsive();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleCreate = useCallback(() => {
    router.push('/generate/resume-version' as any);
  }, []);

  const cardWidth = (width - horizontalPadding * 2 - spacing.sm) / 2;

  return (
    <View style={styles.container}>
      <ScreenHeader title="AI Resume Builder" subtitle="Create ATS-friendly resumes" icon="sparkles" iconColors={HERO_GRADIENT} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100).springify().damping(14)}>
          <GradientCard
            colors={HERO_GRADIENT}
            icon="document-text"
            title="AI Resume Builder"
            subtitle="Build a professional resume that passes ATS scanners"
          >
            <FeatureList items={FEATURES} color="#A78BFA" />
          </GradientCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify().damping(14)} style={{ marginTop: spacing.lg }}>
          <PrimaryButton
            title="Create New Resume"
            icon="add-circle"
            onPress={handleCreate}
            gradient={HERO_GRADIENT}
          />
        </Animated.View>

        <CTSectionHeader title="My Resumes" icon="documents-outline" badge={MOCK_RESUMES.length} action={
          <SecondaryButton title="View All" icon="eye-outline" onPress={() => {}} />
        } />

        {loading ? (
          <LoadingState count={3} />
        ) : (
          MOCK_RESUMES.map((r, i) => (
            <ResumeCard
              key={r.id}
              name={r.name}
              date={r.date}
              score={r.score}
              gradientColors={HERO_GRADIENT}
              onPress={() => router.push('/generate/resume-version' as any)}
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
});
