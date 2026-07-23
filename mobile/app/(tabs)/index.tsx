import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedProps, useAnimatedStyle, withSpring, withTiming, withRepeat,
  withSequence, Easing, interpolate, FadeInDown, FadeInUp, FadeIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { useResponsive } from '../../lib/responsive';
import { MeshGradient } from '../../components/ui/MeshGradient';
import { GlassCard } from '../../components/ui/GlassCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { JobCardSkeleton } from '../../components/ui/Skeleton';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { getTabListBottomPadding } from '../../components/ui/TabBarHeight';
import { jobsApi, applicationsApi, analyticsApi, resumeApi } from '../../lib/api';
import { useJobStore, useAuthStore, useDashboardStore } from '../../store';
import { Job } from '../../types';
import { formatSalary, timeAgo } from '../../lib/helpers';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AI_TIPS = [
  'Tailor your resume keywords to match the job description for higher ATS scores.',
  'Follow up within 48 hours of applying to increase response rate by 40%.',
  'Customize your cover letter for each application \u2014 it increases interview chances by 30%.',
  'Keep your LinkedIn profile updated \u2014 87% of recruiters check it before hiring.',
  'Practice STAR method answers for behavioral interview questions.',
  'Set daily application goals to maintain momentum in your job search.',
  'Network with industry professionals on LinkedIn before applying.',
];

const QUICK_ACTIONS = [
  { icon: 'document-text', label: 'Resume Studio', subtitle: 'Optimize & analyze', route: '/(tabs)/resume', gradient: colors.gradient.blue },
  { icon: 'mail', label: 'Cover Letter', subtitle: 'AI-generated', route: '/generate/cover-letter', gradient: colors.gradient.purple },
  { icon: 'chatbubbles', label: 'Cold Email', subtitle: 'Auto-draft', route: '/generate/cold-email', gradient: colors.gradient.coral },
  { icon: 'mic', label: 'Interview Coach', subtitle: 'AI practice', route: '/ai/mock-interview', gradient: colors.gradient.teal },
  { icon: 'analytics', label: 'Skill Gap', subtitle: 'Find missing skills', route: '/ai/skill-gap', gradient: colors.gradient.sunset },
  { icon: 'trending-up', label: 'Career Roadmap', subtitle: 'Plan your growth', route: '/ai/skill-gap', gradient: colors.gradient.indigo },
];

function AnimatedActionCard({ item, index }: { item: typeof QUICK_ACTIONS[number]; index: number }) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + glow.value * 0.3,
  }));

  return (
    <Animated.View entering={FadeInDown.delay(200 + index * 80).springify().damping(15)}>
      <TouchableOpacity
        onPress={() => router.push(item.route as any)}
        onPressIn={() => { scale.value = withSpring(0.94, { stiffness: 400, damping: 12 }); glow.value = withTiming(1, { duration: 100 }); }}
        onPressOut={() => { scale.value = withSpring(1, { stiffness: 300, damping: 15 }); glow.value = withTiming(0, { duration: 200 }); }}
        activeOpacity={1}
      >
        <Animated.View style={cardStyle}>
          <BlurView intensity={60} tint="light" style={styles.actionCard}>
            <Animated.View style={[styles.actionGlow, { backgroundColor: item.gradient[0] }, glowStyle]} />
            <LinearGradient colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionIcon}>
              <Ionicons name={item.icon as any} size={20} color="#FFFFFF" />
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.actionLabel} numberOfLines={1}>{item.label}</Text>
              <Text style={styles.actionSubtitle} numberOfLines={1}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </BlurView>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function StatCard({ label, value, icon, color, index }: {
  label: string; value: number; icon: keyof typeof Ionicons.glyphMap; color: string; index: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(300 + index * 100).springify().damping(14)} style={styles.statCard}>
      <View style={[styles.statIconRing, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <AnimatedCounter value={value} style={[styles.statValue, { color }]} spring />
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

function AITipCard() {
  const [tip] = useState(() => AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)]);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
      ), -1, true,
    );
  }, []);

  return (
    <Animated.View entering={FadeInUp.delay(250).springify().damping(14)}>
      <GlassCard style={styles.tipCard} glowColor={colors.secondary}>
        <View style={styles.tipRow}>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.tipIconGradient}>
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.tipTitle}>AI Career Tip</Text>
            <Text style={styles.tipBody}>{tip}</Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

function ResumeScoreCard({ score }: { score: number }) {
  const progress = useSharedValue(0);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    progress.value = withTiming(score / 100, { duration: 1500, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(progress.value, [0, 1], [circumference, 0]),
  }));

  const getColor = () => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  return (
    <Animated.View entering={FadeInUp.delay(500).springify().damping(14)}>
      <TouchableOpacity onPress={() => router.push('/(tabs)/resume')} activeOpacity={0.9}>
        <GlassCard style={styles.scoreCard} glowColor={getColor()}>
          <View style={styles.scoreRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scoreTitle}>Resume Score</Text>
              <Text style={styles.scoreDesc}>
                {score >= 80 ? 'Excellent! Ready to apply.' :
                 score >= 60 ? 'Good, room for improvement.' :
                 score > 0 ? 'Needs optimization.' :
                 'Upload to see your score'}
              </Text>
            </View>
            <View style={{ width: 76, height: 76, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={76} height={76}>
                <Circle cx={38} cy={38} r={radius} fill="none" stroke={colors.borderLight} strokeWidth={5} />
                <AnimatedCircle
                  cx={38} cy={38} r={radius}
                  fill="none" stroke={getColor()}
                  strokeWidth={5} strokeLinecap="round"
                  strokeDasharray={circumference}
                  animatedProps={animatedProps}
                  transform={`rotate(-90 38 38)`}
                />
              </Svg>
              <Text style={[styles.scoreNumber, { color: getColor(), position: 'absolute' }]}>{score}</Text>
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

function StreakCard({ streak }: { streak: number }) {
  return (
    <Animated.View entering={FadeInUp.delay(400).springify().damping(14)}>
      <GlassCard style={styles.streakCard} glowColor={colors.warning}>
        <View style={styles.streakRow}>
          <View style={styles.streakLeft}>
            <Ionicons name="flame" size={28} color={colors.warning} />
            <View style={{ marginLeft: spacing.sm }}>
              <Text style={styles.streakCount}>{streak} day streak</Text>
              <Text style={styles.streakSub}>Keep going! You're on fire.</Text>
            </View>
          </View>
          <LinearGradient colors={['#F59E0B', '#FBBF24']} style={styles.streakBadge}>
            <Text style={styles.streakBadgeText}>🔥</Text>
          </LinearGradient>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

function ProgressSection({ progress, goal }: { progress: number; goal: number }) {
  const pct = Math.min(progress / goal, 1);
  const fillWidth = useSharedValue(0);

  useEffect(() => {
    fillWidth.value = withTiming(pct, { duration: 1500, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  }, [pct]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: (interpolate(fillWidth.value, [0, 1], [0, 100]) + '%') as any,
  }));

  return (
    <Animated.View entering={FadeInUp.delay(450).springify().damping(14)}>
      <GlassCard style={styles.progressCard} glowColor={colors.primary}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Weekly Goal</Text>
          <Text style={styles.progressCount}>{progress}/{goal} applications</Text>
        </View>
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, animatedFillStyle]} />
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export default function DashboardScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { savedJobs, toggleSaveJob } = useJobStore();
  const user = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();
  const dash = useDashboardStore();

  const fetchData = useCallback(async () => {
    try {
      const [jobsRes, appsRes, analyticsRes, resumeRes] = await Promise.allSettled([
        jobsApi.list({ page: 1, per_page: 20 }),
        applicationsApi.list(),
        analyticsApi.getDashboard(),
        resumeApi.list(),
      ]);

      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data.data || []);

      const updates: any = {};

      if (appsRes.status === 'fulfilled') {
        const apps = appsRes.value.data.data || [];
        const stats = (appsRes.value.data as any).stats || {};
        updates.totalApplications = apps.length;
        updates.weeklyApplications = apps.filter((a: any) => {
          if (!a.created_at) return false;
          return new Date(a.created_at) > new Date(Date.now() - 7 * 86400000);
        }).length;
        updates.interviewsScheduled = stats.interviewing || 0;
        updates.offersReceived = stats.offer || 0;
      }

      if (analyticsRes.status === 'fulfilled') {
        const d = analyticsRes.value.data.data || analyticsRes.value.data || {};
        updates.responseRate = d.response_rate || 0;
        updates.currentStreak = d.current_streak || 0;
        updates.weeklyProgress = d.weekly_applications || 0;
      }

      if (resumeRes.status === 'fulfilled') {
        const resumes = resumeRes.value.data.data || [];
        if (resumes.length > 0) {
          updates.resumeScore = Math.max(...resumes.map((r: any) => r.ats_score || 0));
        }
      }

      useDashboardStore.getState().setDashboardData(updates);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const renderHeader = () => (
    <View style={{ paddingBottom: spacing.md }}>
      <MeshGradient opacity={0.35} />
      <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Animated.Text entering={FadeInDown.delay(100).springify().damping(14)} style={styles.greeting}>
              Hello,{'\n'}<Text style={styles.userName}>{user?.name?.split(' ')[0] || 'there'}!</Text>
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(200).springify().damping(14)} style={styles.greetingSub}>
              Ready to land your dream role?
            </Animated.Text>
          </View>
          <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.avatarGradient}>
                <Text style={styles.avatarText}>{(user?.name || 'U')[0].toUpperCase()}</Text>
              </LinearGradient>
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <View style={[styles.content, { paddingHorizontal: 20 }]}>
        <AITipCard />

        <View style={styles.statsGrid}>
          <StatCard label="Apps Sent" value={dash.totalApplications} icon="send" color={colors.primary} index={0} />
          <StatCard label="Interviews" value={dash.interviewsScheduled} icon="calendar" color={colors.secondary} index={1} />
          <StatCard label="Offers" value={dash.offersReceived} icon="trophy" color={colors.success} index={2} />
          <StatCard label="Response" value={dash.responseRate} icon="trending-up" color={colors.info} index={3} />
        </View>

        <StreakCard streak={dash.currentStreak} />
        <ProgressSection progress={dash.weeklyProgress} goal={dash.weeklyGoal} />
        <ResumeScoreCard score={dash.resumeScore} />

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {QUICK_ACTIONS.map((item, index) => (
          <AnimatedActionCard key={item.label} item={item} index={index} />
        ))}

        <Text style={styles.sectionTitle}>
          {loading ? '' : `${jobs.length} opportunities for you`}
        </Text>
      </View>
    </View>
  );

  const renderJob = useCallback(({ item }: { item: Job }) => (
    <Animated.View entering={FadeInUp.springify().damping(14)}>
      <Card onPress={() => router.push(`/job/${item.id}`)} style={styles.jobCard} glowColor={colors.primary}>
        <View style={styles.jobHeader}>
          <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.jobIcon}>
            <Text style={styles.jobIconText}>{(item.company || 'C')[0].toUpperCase()}</Text>
          </LinearGradient>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.jobCompany} numberOfLines={1}>{item.company}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleSaveJob(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={savedJobs.includes(item.id) ? 'bookmark' : 'bookmark-outline'} size={20}
              color={savedJobs.includes(item.id) ? colors.primary : colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.jobTags}>
          {item.match_score ? (
            <Badge label={`${item.match_score}% Match`} variant={item.match_score >= 80 ? 'success' : item.match_score >= 60 ? 'warning' : 'default'} size="sm" animated />
          ) : <Badge label="New" variant="info" size="sm" />}
          {item.location && <Badge label={item.location} variant="default" size="sm" />}
          {item.posted_at && <Badge label={timeAgo(item.posted_at)} variant="default" size="sm" />}
        </View>

        <Text style={styles.jobDesc} numberOfLines={2}>{item.description}</Text>

        <View style={styles.jobFooter}>
          <View style={styles.jobSkills}>
            {item.skills?.slice(0, 3).map((s, i) => (
              <View key={i} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{s}</Text>
              </View>
            ))}
            {item.skills && item.skills.length > 3 && (
              <Text style={styles.moreSkills}>+{item.skills.length - 3}</Text>
            )}
          </View>
          {item.salary_min && (
            <Text style={styles.jobSalary}>{formatSalary(item.salary_min, item.salary_max, item.currency)}</Text>
          )}
        </View>
      </Card>
    </Animated.View>
  ), [savedJobs]);

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        renderItem={renderJob}
        keyExtractor={(item: Job) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: getTabListBottomPadding() + spacing.md }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }}
            tintColor={colors.primary} colors={[colors.primary]} progressViewOffset={insets.top + 60} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ padding: spacing.md, gap: spacing.md }}>
              {[1, 2, 3, 4].map((i) => <JobCardSkeleton key={i} />)}
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: spacing.md,
  },
  heroTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  greeting: {
    fontSize: 32, fontWeight: '300', color: colors.text, lineHeight: 38,
  },
  userName: { fontWeight: '800', color: colors.text },
  greetingSub: { fontSize: 15, color: colors.textSecondary, marginTop: 4 },
  avatarGradient: {
    width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center',
    ...shadow.glow.primary,
  },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  notifDot: {
    position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: 6,
    backgroundColor: colors.error, borderWidth: 2, borderColor: colors.surface,
  },
  content: { gap: spacing.md },
  tipCard: { padding: spacing.md },
  tipRow: { flexDirection: 'row', alignItems: 'center' },
  tipIconGradient: {
    width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  tipTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  tipBody: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '47%', flexGrow: 1, minWidth: 140,
    backgroundColor: colors.surface, borderRadius: borderRadius.xl,
    padding: spacing.md, ...shadow.md,
  },
  statIconRing: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  statValue: { fontSize: 26, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '500', marginTop: 2 },
  streakCard: { padding: spacing.md },
  streakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  streakCount: { fontSize: 18, fontWeight: '700', color: colors.text },
  streakSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  streakBadge: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  streakBadgeText: { fontSize: 20 },
  progressCard: { padding: spacing.md },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  progressTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  progressCount: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  progressBarBg: { height: 8, backgroundColor: colors.borderLight, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  scoreCard: { padding: spacing.md },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  scoreDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2, maxWidth: 180 },
  scoreNumber: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  sectionTitle: {
    fontSize: 20, fontWeight: '700', color: colors.text,
    marginTop: spacing.xs, letterSpacing: -0.3,
  },
  actionCard: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: borderRadius.xl, overflow: 'hidden', ...shadow.md,
  },
  actionGlow: { ...StyleSheet.absoluteFillObject, borderRadius: borderRadius.xl },
  actionIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  actionSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  jobCard: { marginBottom: spacing.md },
  jobHeader: { flexDirection: 'row', alignItems: 'center' },
  jobIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  jobIconText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  jobTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  jobCompany: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  jobTags: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm, flexWrap: 'wrap' },
  jobDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginTop: spacing.sm },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  jobSkills: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center', flex: 1, flexWrap: 'wrap' },
  skillChip: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: colors.primaryBg, borderRadius: borderRadius.sm },
  skillChipText: { fontSize: 11, fontWeight: '500', color: colors.primary },
  moreSkills: { fontSize: 12, color: colors.textMuted },
  jobSalary: { fontSize: 13, fontWeight: '600', color: colors.success },
});
