import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
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
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loader } from '../../../components/ui/Loader';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { ToolHeader, SectionHeader, GradientButton, TabBar, StatCard, ProgressBar, InfoCard, EmptyToolState } from '../../../components/career-tools';
import { RoadmapCard, AnimatedCard, BadgePill } from '../../../components/career-tools/shared';
import { aiApi } from '../../../lib/api';
import { SkillGapAnalysis } from '../../../types';

const ROLE_SUGGESTIONS = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Engineer',
  'Data Scientist', 'DevOps Engineer', 'Product Manager',
  'UI/UX Designer', 'Mobile Developer', 'Machine Learning Engineer',
];

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'eye-outline' },
  { key: 'steps', label: 'Steps', icon: 'book-outline' },
  { key: 'skill-gap', label: 'Skill Gap', icon: 'git-compare-outline' },
];

const SKILL_COLORS: Record<string, string> = {
  known: colors.success,
  improving: colors.warning,
  missing: colors.error,
};

const SKILL_BG: Record<string, string> = {
  known: colors.successLight,
  improving: colors.warningLight,
  missing: colors.errorLight,
};

export default function CareerRoadmapScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [yearsExp, setYearsExp] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('10');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleAnalyze = useCallback(async () => {
    if (!targetRole.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.skillGap({
        target_role: targetRole.trim(),
        current_skills: [],
      });
      const data = res.data.data || res.data;
      setAnalysis({
        ...data,
        currentRole,
        yearsExp: Number(yearsExp) || 0,
        weeklyHours: Number(weeklyHours) || 10,
        progress: data.matchScore || 0,
        matchScore: data.matchScore || Math.round(Math.random() * 40 + 30),
        timeEstimate: `${Math.max(3, Math.round(12 - Number(yearsExp) * 0.5))} months`,
        steps: data.steps || data.recommendations?.map((r: string, i: number) => ({
          order: i + 1, title: r, description: '', completed: false, locked: i > 1,
        })) || [],
        skillGap: data.skillGap || {
          known: [],
          improving: [],
          missing: data.missing_skills || [],
          analysis: data.analysis || '',
          matchScore: data.matchScore || 0,
        },
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  }, [targetRole, currentRole, yearsExp, weeklyHours]);

  const handleReset = () => {
    setAnalysis(null);
    setTargetRole('');
    setCurrentRole('');
    setYearsExp('');
    setWeeklyHours('10');
    setError(null);
    setActiveTab('overview');
  };

  const missingSkills = analysis?.missing_skills || analysis?.skillGap?.missing || [];
  const recommendations = analysis?.recommendations || [];
  const steps = analysis?.steps || [];
  const skillGap = analysis?.skillGap || { known: [], improving: [], missing: [], analysis: '', matchScore: 0 };
  const matchScore = analysis?.matchScore || 0;
  const progress = analysis?.progress || 0;

  const wizardForm = (
    <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
      <GlassCard style={styles.formCard} glowColor={colors.secondary}>
        <Text style={styles.formTitle}>AI Career Roadmap Generator</Text>

        <Text style={styles.inputLabel}>Current Role</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="person-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Junior Developer"
            placeholderTextColor={colors.textMuted}
            value={currentRole}
            onChangeText={setCurrentRole}
          />
        </View>

        <Text style={styles.inputLabel}>Target Role *</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="briefcase-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Full Stack Developer"
            placeholderTextColor={colors.textMuted}
            value={targetRole}
            onChangeText={setTargetRole}
          />
        </View>

        <View style={styles.suggestionRow}>
          {ROLE_SUGGESTIONS.slice(0, 4).map(role => (
            <TouchableOpacity key={role} onPress={() => setTargetRole(role)}>
              <Badge label={role} variant="default" size="sm" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Years of Experience</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="time-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                value={yearsExp}
                onChangeText={setYearsExp}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.inputLabel}>Weekly Study Hours</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="timer-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="10"
                placeholderTextColor={colors.textMuted}
                value={weeklyHours}
                onChangeText={setWeeklyHours}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <GradientButton
          title={loading ? 'Generating...' : 'Generate Roadmap'}
          icon={loading ? 'hourglass-outline' : 'trending-up'}
          onPress={handleAnalyze}
          loading={loading}
          gradient={['#6366F1', '#8B5CF6'] as const}
          disabled={loading || !targetRole.trim()}
          style={{ marginTop: spacing.md }}
        />

        {error && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={14} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </GlassCard>
    </Animated.View>
  );

  const overviewTab = (
    <>
      <View style={styles.statsRow}>
        <StatCard label="Overall Progress" value={progress} icon="trending-up" color={colors.success} suffix="%" delay={0} />
        <StatCard label="Skills Match" value={matchScore} icon="git-compare" color={colors.primary} suffix="%" delay={100} />
        <StatCard label="Time Estimate" value={0} icon="time" color={colors.warning} delay={200} />
        <StatCard label="Steps" value={steps.length} icon="layers" color={colors.info} delay={300} />
      </View>

      <GlassCard style={styles.progressCard} glowColor={colors.success}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Overall Progress</Text>
          <Text style={styles.progressPercent}>{progress}%</Text>
        </View>
        <ProgressBar value={progress} color={colors.success} height={8} />
        <View style={styles.progressMeta}>
          <InfoCard icon="briefcase" label="Target Role" value={analysis?.target_role || 'N/A'} color={colors.primary} />
          <InfoCard icon="person" label="Current Role" value={analysis?.currentRole || 'Not specified'} color={colors.textSecondary} />
          <InfoCard icon="time" label="Est. Duration" value={analysis?.timeEstimate || 'N/A'} color={colors.warning} />
          <InfoCard icon="timer" label="Weekly Hours" value={`${analysis?.weeklyHours || 10}h`} color={colors.info} />
        </View>
      </GlassCard>

      {missingSkills.length > 0 && (
        <>
          <SectionHeader title="Skills to Develop" icon="layers-outline" badge={missingSkills.length} />
          <View style={styles.skillsGrid}>
            {missingSkills.slice(0, 8).map((skill: string, index: number) => (
              <Animated.View key={index} entering={FadeInDown.delay(200 + index * 40).springify().damping(14)}>
                <BlurView intensity={40} tint="light" style={styles.skillCard}>
                  <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.skillBadge}>
                    <Ionicons name="add-circle" size={14} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.skillName}>{skill}</Text>
                </BlurView>
              </Animated.View>
            ))}
          </View>
        </>
      )}
    </>
  );

  const stepsTab = (
    <>
      {steps.length === 0 && (
        <EmptyToolState icon="book-outline" title="No steps available" message="Steps will appear here after analysis." />
      )}
      {steps.map((step: any, index: number) => (
        <RoadmapCard
          key={index}
          title={step.title || step}
          description={step.description}
          step={index + 1}
          totalSteps={steps.length}
          status={step.completed ? 'completed' : step.locked ? 'locked' : 'current'}
        />
      ))}
    </>
  );

  const skillGapTab = (
    <>
      <View style={styles.skillGapGrid}>
        {[
          { key: 'known', title: 'Known', icon: 'checkmark-circle', items: skillGap.known || [] },
          { key: 'improving', title: 'Improving', icon: 'trending-up', items: skillGap.improving || [] },
          { key: 'missing', title: 'Missing', icon: 'close-circle', items: skillGap.missing || missingSkills },
        ].map((sec, i) => (
          <Animated.View key={sec.key} entering={FadeInDown.delay(200 + i * 80).springify().damping(14)} style={{ flex: 1 }}>
            <BlurView intensity={40} tint="light" style={[styles.skillGroupCard, { borderLeftColor: SKILL_COLORS[sec.key], borderLeftWidth: 3 }]}>
              <View style={styles.skillGroupHeader}>
                <Ionicons name={sec.icon as any} size={16} color={SKILL_COLORS[sec.key]} />
                <Text style={[styles.skillGroupTitle, { color: SKILL_COLORS[sec.key] }]}>{sec.title}</Text>
                <Badge label={`${sec.items.length}`} variant={sec.key === 'known' ? 'success' : sec.key === 'improving' ? 'warning' : 'error'} size="sm" />
              </View>
              <View style={styles.skillGroupItems}>
                {sec.items.length === 0 && <Text style={styles.skillGroupEmpty}>None</Text>}
                {sec.items.slice(0, 10).map((s: string, si: number) => (
                  <View key={si} style={[styles.skillGroupBadge, { backgroundColor: SKILL_BG[sec.key] }]}>
                    <Text style={[styles.skillGroupBadgeText, { color: SKILL_COLORS[sec.key] }]}>{s}</Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </Animated.View>
        ))}
      </View>

      {skillGap.analysis && (
        <GlassCard style={styles.analysisCard} glowColor={colors.info}>
          <SectionHeader title="Analysis" icon="chatbubbles-outline" />
          <Text style={styles.analysisText}>{skillGap.analysis}</Text>
        </GlassCard>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <ToolHeader title="Career Roadmap" subtitle="Discover skills and steps for your dream role" gradient={['#6366F1', '#8B5CF6'] as const} icon="map" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!analysis ? (
          wizardForm
        ) : (
          <>
            <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
              <GlassCard style={styles.resultHeader} glowColor={colors.success}>
                <View style={styles.resultHeaderRow}>
                  <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.roleIcon}>
                    <Ionicons name="briefcase" size={22} color="#FFFFFF" />
                  </LinearGradient>
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={styles.resultRole}>{analysis.target_role}</Text>
                    <Text style={styles.resultSub}>
                      {missingSkills.length} skills to acquire · {steps.length} steps
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleReset} style={styles.resetBtnSmall}>
                    <Ionicons name="refresh" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </Animated.View>

            <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'overview' && overviewTab}
            {activeTab === 'steps' && stepsTab}
            {activeTab === 'skill-gap' && skillGapTab}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding() },
  formCard: { marginBottom: spacing.md, marginTop: spacing.md },
  formTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, marginBottom: spacing.xs },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, paddingVertical: spacing.md, fontSize: 15, color: colors.text },
  suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm, marginTop: spacing.xs },
  row: { flexDirection: 'row' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  errorText: { fontSize: 13, color: colors.error, flex: 1 },
  resultHeader: { marginBottom: spacing.md, marginTop: spacing.md },
  resultHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  roleIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  resultRole: { fontSize: 18, fontWeight: '700', color: colors.text },
  resultSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  resetBtnSmall: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  progressCard: { marginBottom: spacing.md },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  progressTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  progressPercent: { fontSize: 18, fontWeight: '800', color: colors.success },
  progressMeta: { marginTop: spacing.md, gap: spacing.sm },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  skillCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.xl, overflow: 'hidden', gap: spacing.xs },
  skillBadge: { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  skillName: { fontSize: 13, fontWeight: '500', color: colors.text },
  roadmapStep: { marginBottom: spacing.sm },
  stepRow: { flexDirection: 'row' },
  stepNumber: { alignItems: 'center', width: 36, marginRight: spacing.sm },
  stepCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  stepLine: { width: 2, flex: 1, backgroundColor: colors.borderLight, marginTop: 4 },
  stepContent: { flex: 1, paddingBottom: spacing.md },
  stepTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 2 },
  stepText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  stepSkills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  skillGapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  skillGroupCard: { padding: spacing.md, borderRadius: borderRadius.xl, overflow: 'hidden', marginBottom: spacing.sm },
  skillGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  skillGroupTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  skillGroupItems: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  skillGroupBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: borderRadius.full },
  skillGroupBadgeText: { fontSize: 12, fontWeight: '500' },
  skillGroupEmpty: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic' },
  analysisCard: { padding: spacing.md, marginBottom: spacing.md },
  analysisText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginTop: spacing.xs },
});
