import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Badge } from '../../../components/ui/Badge';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';

interface GuideStep {
  step: number;
  title: string;
  description: string;
  duration: string;
}

interface CareerGuide {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
  steps: GuideStep[];
  totalDuration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const GUIDES: CareerGuide[] = [
  {
    id: '1', title: 'Career Change Roadmap', description: 'Switch industries or roles with confidence using this structured approach', icon: 'swap-horizontal', gradient: colors.gradient.blue,
    steps: [
      { step: 1, title: 'Self-Assessment', description: 'Identify your transferable skills, values, and interests', duration: '2 days' },
      { step: 2, title: 'Market Research', description: 'Explore target industries and roles that align with your profile', duration: '3 days' },
      { step: 3, title: 'Skill Gap Analysis', description: 'Identify missing skills and create a learning plan', duration: '2 days' },
      { step: 4, title: 'Rebrand Your Resume', description: 'Tailor your resume to highlight relevant experience', duration: '3 days' },
      { step: 5, title: 'Network Strategically', description: 'Connect with professionals in your target field', duration: '5 days' },
      { step: 6, title: 'Apply & Interview', description: 'Targeted applications and interview preparation', duration: '14 days' },
    ], totalDuration: '4 weeks', difficulty: 'Intermediate',
  },
  {
    id: '2', title: 'First Job Hunt Guide', description: 'Everything a fresh graduate needs to land their first role', icon: 'school', gradient: colors.gradient.purple,
    steps: [
      { step: 1, title: 'Craft Your Story', description: 'Build a compelling narrative around your education and projects', duration: '2 days' },
      { step: 2, title: 'Build a Strong Resume', description: 'Create a professional resume with no work experience', duration: '3 days' },
      { step: 3, title: 'Master LinkedIn', description: 'Optimize your profile and start building your network', duration: '2 days' },
      { step: 4, title: 'Find Entry-Level Roles', description: 'Identify companies and roles perfect for beginners', duration: '3 days' },
      { step: 5, title: 'Ace the Interview', description: 'Prepare for common entry-level interview questions', duration: '5 days' },
      { step: 6, title: 'Evaluate Offers', description: 'Compare offers and negotiate your first salary', duration: '3 days' },
    ], totalDuration: '3 weeks', difficulty: 'Beginner',
  },
  {
    id: '3', title: 'Leadership Career Path', description: 'Develop the skills and mindset to move into management', icon: 'trending-up', gradient: colors.gradient.teal,
    steps: [
      { step: 1, title: 'Leadership Self-Assessment', description: 'Evaluate your leadership style and areas for growth', duration: '2 days' },
      { step: 2, title: 'Develop Emotional Intelligence', description: 'Master self-awareness, empathy, and relationship management', duration: '5 days' },
      { step: 3, title: 'Build Strategic Thinking', description: 'Learn to think beyond your role and contribute strategically', duration: '4 days' },
      { step: 4, title: 'Communication Mastery', description: 'Develop executive presence and persuasive communication', duration: '3 days' },
      { step: 5, title: 'People Management Skills', description: 'Learn to mentor, delegate, and inspire teams', duration: '7 days' },
      { step: 6, title: 'Make Your Move', description: 'Position yourself for promotion and ace the transition', duration: '5 days' },
    ], totalDuration: '6 weeks', difficulty: 'Advanced',
  },
  {
    id: '4', title: 'Tech Industry Break-In', description: 'Land a job in tech without a CS degree', icon: 'code-slash', gradient: colors.gradient.coral,
    steps: [
      { step: 1, title: 'Choose Your Path', description: 'Decide between frontend, backend, data, or other tech roles', duration: '2 days' },
      { step: 2, title: 'Build Foundational Skills', description: 'Learn core technologies through structured resources', duration: '4 weeks' },
      { step: 3, title: 'Create Portfolio Projects', description: 'Build real-world projects that demonstrate your skills', duration: '3 weeks' },
      { step: 4, title: 'Contribute to Open Source', description: 'Gain experience and visibility through community contributions', duration: '2 weeks' },
      { step: 5, title: 'Network in Tech', description: 'Connect with tech professionals at meetups and online', duration: '1 week' },
      { step: 6, title: 'Interview Prep', description: 'Practice coding challenges and system design questions', duration: '2 weeks' },
    ], totalDuration: '12 weeks', difficulty: 'Intermediate',
  },
];

function GuideCard({ guide, index }: { guide: CareerGuide; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const height = useSharedValue(0);

  const toggleExpand = () => {
    if (expanded) {
      height.value = withTiming(0, { duration: 300 });
    } else {
      height.value = withSpring(guide.steps.length * 72, { stiffness: 200, damping: 20 });
    }
    setExpanded(!expanded);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: height.value > 0 ? withTiming(1) : 0,
    overflow: 'hidden',
  }));

  return (
    <Animated.View entering={FadeInDown.delay(80 + index * 80).springify().damping(16)}>
      <TouchableOpacity onPress={toggleExpand} activeOpacity={0.85}>
        <BlurView intensity={50} tint="light" style={styles.guideCard}>
          <View style={styles.guideHeader}>
            <LinearGradient colors={guide.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.guideIcon}>
              <Ionicons name={guide.icon} size={22} color="#FFFFFF" />
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <View style={styles.guideMetaRow}>
                <Text style={styles.guideTitle}>{guide.title}</Text>
                <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
              </View>
              <Text style={styles.guideDesc} numberOfLines={2}>{guide.description}</Text>
            </View>
          </View>
          <View style={styles.guideTags}>
            <Badge label={guide.difficulty} variant={guide.difficulty === 'Beginner' ? 'success' : guide.difficulty === 'Intermediate' ? 'warning' : 'error'} size="sm" />
            <Badge label={guide.totalDuration} variant="default" size="sm" icon="time-outline" />
            <Badge label={`${guide.steps.length} steps`} variant="info" size="sm" />
          </View>
          <Animated.View style={animatedStyle}>
            <View style={styles.stepsContainer}>
              {guide.steps.map((step) => (
                <View key={step.step} style={styles.stepRow}>
                  <View style={styles.stepDotOuter}>
                    <LinearGradient colors={guide.gradient} style={styles.stepDot}>
                      <Text style={styles.stepNumber}>{step.step}</Text>
                    </LinearGradient>
                    {step.step < guide.steps.length && <View style={[styles.stepLine, { backgroundColor: guide.gradient[0] + '30' }]} />}
                  </View>
                  <View style={styles.stepContent}>
                    <View style={styles.stepHeader}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Badge label={step.duration} variant="default" size="sm" />
                    </View>
                    <Text style={styles.stepDesc}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CareerGuidesScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(50).springify().damping(14)}>
          <Text style={styles.title}>Career Guides</Text>
          <Text style={styles.subtitle}>Step-by-step paths to achieve your career goals</Text>
        </Animated.View>

        <GlassCard style={styles.introCard} glowColor={colors.secondary}>
          <View style={styles.introRow}>
            <LinearGradient colors={colors.gradient.indigo} style={styles.introIcon}>
              <Ionicons name="compass" size={24} color="#FFFFFF" />
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.introTitle}>Follow a Structured Path</Text>
              <Text style={styles.introDesc}>Each guide breaks down your journey into manageable steps with estimated timelines.</Text>
            </View>
          </View>
        </GlassCard>

        <View style={{ gap: spacing.sm }}>
          {GUIDES.map((guide, index) => (
            <GuideCard key={guide.id} guide={guide} index={index} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding() + spacing.md },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.md },
  introCard: { padding: spacing.md, marginBottom: spacing.md },
  introRow: { flexDirection: 'row', alignItems: 'center' },
  introIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  introTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  introDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  guideCard: { borderRadius: borderRadius.xl, overflow: 'hidden', ...shadow.md },
  guideHeader: { flexDirection: 'row', padding: spacing.md, paddingBottom: spacing.sm },
  guideIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  guideMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  guideTitle: { fontSize: 16, fontWeight: '600', color: colors.text, flex: 1 },
  guideDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 16, marginTop: 2 },
  guideTags: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.md, paddingBottom: spacing.sm, flexWrap: 'wrap' },
  stepsContainer: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  stepRow: { flexDirection: 'row', marginBottom: spacing.sm },
  stepDotOuter: { alignItems: 'center', width: 28, marginRight: spacing.sm },
  stepDot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  stepNumber: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  stepLine: { width: 2, flex: 1, marginTop: 2 },
  stepContent: { flex: 1, paddingBottom: spacing.sm },
  stepHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  stepDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
});
