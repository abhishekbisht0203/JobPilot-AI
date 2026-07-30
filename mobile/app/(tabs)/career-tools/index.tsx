import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Badge } from '../../../components/ui/Badge';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { CareerTool } from '../../../types';

const TOOLS: CareerTool[] = [
  { id: 'resume-builder', name: 'AI Resume Builder', description: 'Craft ATS-optimized resumes with AI guidance', icon: 'document-text', color: '#3B82F6', route: '/career-tools/resume-builder', status: 'available' },
  { id: 'cover-letter', name: 'Cover Letter Generator', description: 'Generate tailored cover letters instantly', icon: 'mail', color: '#8B5CF6', route: '/career-tools/cover-letter', status: 'available' },
  { id: 'mock-interview', name: 'Mock Interview', description: 'Practice with AI-powered interview simulations', icon: 'mic', color: '#14B8A6', route: '/career-tools/mock-interview', status: 'available' },
  { id: 'resume-checker', name: 'Resume Checker', description: 'Check ATS compatibility and get suggestions', icon: 'checkmark-circle', color: '#10B981', route: '/career-tools/resume-checker', status: 'available' },
  { id: 'salary-explorer', name: 'Salary Explorer', description: 'Explore salary trends by role and location', icon: 'cash', color: '#F59E0B', route: '/career-tools/salary-explorer', status: 'available' },
  { id: 'career-roadmap', name: 'Career Roadmap', description: 'Plan your career growth with AI insights', icon: 'trending-up', color: '#6366F1', route: '/career-tools/career-roadmap', status: 'available' },
  { id: 'interview-prep', name: 'Interview Preparation', description: 'Get tips, questions, and practice guidance', icon: 'school', color: '#EC4899', route: '/career-tools/interview-prep', status: 'available' },
  { id: 'ats-score', name: 'ATS Score', description: 'Analyze your resume against ATS algorithms', icon: 'speedometer', color: '#06B6D4', route: '/career-tools/ats-score', status: 'premium' },
];

const TOOL_COLORS: Record<string, readonly [string, string]> = {
  '3B82F6': colors.gradient.blue,
  '8B5CF6': colors.gradient.purple,
  '14B8A6': colors.gradient.teal,
  '10B981': colors.gradient.success,
  'F59E0B': colors.gradient.warning,
  '6366F1': colors.gradient.indigo,
  'EC4899': colors.gradient.coral,
  '06B6D4': colors.gradient.aurora,
};

function ToolCard({ tool, index }: { tool: CareerTool; index: number }) {
  const gradientColors = TOOL_COLORS[tool.color.replace('#', '')] || colors.gradient.primary;

  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 60).springify().damping(14)}>
      <TouchableOpacity
        onPress={() => {
          if (tool.status === 'coming_soon') return;
          router.push(tool.route as any);
        }}
        activeOpacity={tool.status === 'coming_soon' ? 0.6 : 0.8}
      >
        <BlurView intensity={50} tint="light" style={styles.toolCard}>
          <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.toolIcon}>
            <Ionicons name={tool.icon as any} size={22} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.toolInfo}>
            <Text style={styles.toolName} numberOfLines={1}>{tool.name}</Text>
            <Text style={styles.toolDesc} numberOfLines={2}>{tool.description}</Text>
          </View>
          <View style={styles.toolMeta}>
            {tool.status === 'premium' && <Badge label="Premium" variant="premium" size="sm" />}
            {tool.status === 'coming_soon' && <Badge label="Coming Soon" variant="warning" size="sm" />}
            {tool.status === 'available' && (
              <View style={styles.arrowCircle}>
                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
              </View>
            )}
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CareerToolsScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100).springify().damping(14)}>
          <Text style={styles.title}>Career Tools</Text>
          <Text style={styles.subtitle}>Supercharge your job search with AI-powered tools</Text>
        </Animated.View>

        <GlassCard style={styles.statsCard} glowColor={colors.primary}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{TOOLS.filter(t => t.status === 'available').length}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{TOOLS.filter(t => t.status === 'premium').length}</Text>
              <Text style={styles.statLabel}>Premium</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{TOOLS.filter(t => t.status === 'coming_soon').length}</Text>
              <Text style={styles.statLabel}>Coming</Text>
            </View>
          </View>
        </GlassCard>

        <View style={styles.grid}>
          {TOOLS.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
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
  statsCard: { marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: spacing.sm },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '500', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.borderLight },
  grid: { gap: spacing.sm },
  toolCard: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: borderRadius.xl, overflow: 'hidden', gap: spacing.sm,
  },
  toolIcon: {
    width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  toolInfo: { flex: 1 },
  toolName: { fontSize: 15, fontWeight: '600', color: colors.text },
  toolDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 16, marginTop: 2 },
  toolMeta: { alignItems: 'flex-end' },
  arrowCircle: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: colors.surfaceLight,
    justifyContent: 'center', alignItems: 'center',
  },
});
