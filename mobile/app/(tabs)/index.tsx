import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, RefreshControl,
  FlatList, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat,
  withSequence, Easing, interpolate, FadeInDown, FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { useResponsive } from '../../lib/responsive';
import { MeshGradient } from '../../components/ui/MeshGradient';
import { GlassCard } from '../../components/ui/GlassCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton, JobCardSkeleton } from '../../components/ui/Skeleton';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { getTabListBottomPadding } from '../../components/ui/TabBarHeight';
import { jobsApi, applicationsApi, analyticsApi, resumeApi, notificationsApi } from '../../lib/api';
import { useJobStore, useAuthStore } from '../../store';
import { Job, Application, Notification } from '../../types';
import { formatSalary, timeAgo, formatDate, getInitials, getMatchColor } from '../../lib/helpers';

const AI_TIPS = [
  'Tailor your resume keywords to match the job description for higher ATS scores.',
  'Follow up within 48 hours of applying to increase response rate by 40%.',
  'Customize your cover letter for each application \u2014 it increases interview chances by 30%.',
  'Keep your LinkedIn profile updated \u2014 87% of recruiters check it before hiring.',
  'Practice STAR method answers for behavioral interview questions.',
  'Set daily application goals to maintain momentum in your job search.',
  'Network with industry professionals on LinkedIn before applying.',
  'Use quantifiable achievements in your resume to stand out.',
  'Prepare 3 thoughtful questions to ask at the end of every interview.',
];

const JOB_CATEGORIES = [
  { name: 'Frontend', icon: 'code-slash', color: colors.accent.blue },
  { name: 'Backend', icon: 'server', color: colors.accent.indigo },
  { name: 'Full Stack', icon: 'layers', color: colors.accent.violet },
  { name: 'DevOps', icon: 'cloud', color: colors.accent.cyan },
  { name: 'Data', icon: 'analytics', color: colors.accent.teal },
  { name: 'Design', icon: 'color-palette', color: colors.accent.pink },
  { name: 'Mobile', icon: 'phone-portrait', color: colors.accent.orange },
  { name: 'AI/ML', icon: 'cube', color: colors.accent.emerald },
];

const STAGGER_BASE = 80;

function useFloatingAnimation(amplitude = 5) {
  const translateY = useSharedValue(0);
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-amplitude, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(amplitude, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, true,
    );
  }, []);
  return useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
}

function useBreathingScale() {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, true,
    );
  }, []);
  return useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
}

function usePulseGlow() {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, true,
    );
  }, []);
  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}

function HeroSection({ user, dateStr, profileCompletion }: { user: any; dateStr: string; profileCompletion: number }) {
  const floatStyle = useFloatingAnimation(4);
  const breatheStyle = useBreathingScale();
  const glowStyle = usePulseGlow();
  const initials = getInitials(user?.name || 'U');

  return (
    <Animated.View entering={FadeInDown.delay(0).springify().damping(14)}>
      <View style={styles.heroRow}>
        <View style={{ flex: 1 }}>
          <Animated.Text entering={FadeInDown.delay(80).springify().damping(14)} style={styles.greeting}>
            Hello{'\n'}
            <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'there'}</Text>
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(160).springify().damping(14)}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
              <Text style={styles.dateText}>{dateStr}</Text>
            </View>
          </Animated.View>
        </View>
        <Animated.View entering={FadeInDown.delay(120).springify().damping(14)} style={floatStyle}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.8}>
            <Animated.View style={[styles.avatarOuter, breatheStyle]}>
              <Animated.View style={[styles.avatarGlow, glowStyle]} />
              <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.avatarGradient}>
                <Text style={styles.avatarText}>{initials}</Text>
              </LinearGradient>
            </Animated.View>
            <View style={styles.onlineDot} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(200).springify().damping(14)}>
        <GlassCard style={styles.profileSummaryCard} glowColor={colors.primary}>
          <View style={styles.profileSummaryRow}>
            <View style={styles.planBadge}>
              <LinearGradient colors={colors.gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.planBadgeInner}>
                <Ionicons name={user?.plan_tier === 'pro' ? 'diamond' : user?.plan_tier === 'team' ? 'people' : 'rocket-outline'} size={12} color="#FFFFFF" />
                <Text style={styles.planBadgeText}>{(user?.plan_tier || 'free').toUpperCase()}</Text>
              </LinearGradient>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.profileSummaryLabel}>Profile Completion</Text>
              <View style={styles.profileMiniBar}>
                <View style={styles.profileMiniBarBg}>
                  <View style={[styles.profileMiniBarFill, { width: `${Math.min(profileCompletion, 100)}%` }]} />
                </View>
                <Text style={styles.profileMiniPct}>{Math.round(profileCompletion)}%</Text>
              </View>
            </View>
          </View>
        </GlassCard>
      </Animated.View>
    </Animated.View>
  );
}

function StatCard({ label, value, icon, colors: gradColors, index, suffix = '', prefix = '' }: {
  label: string; value: number; icon: keyof typeof Ionicons.glyphMap;
  colors: readonly [string, string]; index: number; suffix?: string; prefix?: string;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(300 + index * STAGGER_BASE).springify().damping(14)} style={styles.statCard}>
      <LinearGradient colors={gradColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statIconBg}>
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      </LinearGradient>
      <AnimatedCounter value={value} suffix={suffix} prefix={prefix} style={styles.statValue} spring />
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

function StatsGrid({ stats }: { stats: { totalApplications: number; interviewsScheduled: number; offersReceived: number; responseRate: number } }) {
  return (
    <View style={styles.statsGrid}>
      <StatCard label="Applications" value={stats.totalApplications} icon="send" colors={colors.gradient.blue} index={0} />
      <StatCard label="Interviews" value={stats.interviewsScheduled} icon="calendar" colors={colors.gradient.purple} index={1} />
      <StatCard label="Offers" value={stats.offersReceived} icon="trophy" colors={colors.gradient.success} index={2} />
      <StatCard label="Response Rate" value={stats.responseRate} icon="trending-up" colors={colors.gradient.teal} index={3} suffix="%" />
    </View>
  );
}

function RecentlyViewedJobs({ jobs }: { jobs: Job[] }) {
  if (!jobs.length) return null;
  return (
    <View style={styles.section}>
      <Animated.View entering={FadeInDown.delay(400).springify().damping(14)}>
        <Text style={styles.sectionTitle}>Recently Viewed</Text>
      </Animated.View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={jobs.slice(0, 10)}
        keyExtractor={(item) => `rv-${item.id}`}
        contentContainerStyle={styles.horizontalListContent}
        renderItem={({ item, index }) => (
          <Animated.View entering={SlideInRight.delay(420 + index * 60).springify().damping(14)}>
            <TouchableOpacity onPress={() => router.push(`/job/${item.id}`)} activeOpacity={0.9}>
              <GlassCard style={styles.recentJobCard} glowColor={colors.primary}>
                <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.recentJobIcon}>
                  <Text style={styles.recentJobIconText}>{(item.company || 'C')[0]}</Text>
                </LinearGradient>
                <Text style={styles.recentJobTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.recentJobCompany} numberOfLines={1}>{item.company}</Text>
                {item.salary_min && (
                  <Text style={styles.recentJobSalary}>{formatSalary(item.salary_min, item.salary_max, item.currency)}</Text>
                )}
              </GlassCard>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </View>
  );
}

function FeaturedCompaniesSection({ companies }: { companies: string[] }) {
  if (!companies.length) return null;
  return (
    <View style={styles.section}>
      <Animated.View entering={FadeInDown.delay(450).springify().damping(14)}>
        <Text style={styles.sectionTitle}>Featured Companies</Text>
      </Animated.View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={companies}
        keyExtractor={(item) => `fc-${item}`}
        contentContainerStyle={styles.horizontalListContent}
        renderItem={({ item, index }) => (
          <Animated.View entering={SlideInRight.delay(470 + index * 60).springify().damping(14)}>
            <GlassCard style={styles.companyCard} glowColor={colors.secondary}>
              <LinearGradient colors={[colors.secondary, colors.accent.indigo]} style={styles.companyIconRound}>
                <Text style={styles.companyIconText}>{(item || 'C')[0]}</Text>
              </LinearGradient>
              <Text style={styles.companyName} numberOfLines={1}>{item}</Text>
              <Badge label="Hiring" variant="success" size="sm" animated />
            </GlassCard>
          </Animated.View>
        )}
      />
    </View>
  );
}

function CategoriesSection() {
  return (
    <View style={styles.section}>
      <Animated.View entering={FadeInDown.delay(500).springify().damping(14)}>
        <Text style={styles.sectionTitle}>Job Categories</Text>
      </Animated.View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
        {JOB_CATEGORIES.map((cat, index) => (
          <Animated.View key={cat.name} entering={FadeInUp.delay(520 + index * 40).springify().damping(14)}>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(tabs)/find-jobs', params: { q: cat.name } })}
              activeOpacity={0.7}
            >
              <BlurView intensity={40} tint="light" style={styles.categoryChip}>
                <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                <Ionicons name={cat.icon as any} size={14} color={cat.color} />
                <Text style={[styles.categoryText, { color: cat.color }]}>{cat.name}</Text>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

function UpcomingInterviewsSection({ applications: apps }: { applications: Application[] }) {
  if (!apps.length) return null;
  return (
    <View style={styles.section}>
      <Animated.View entering={FadeInDown.delay(550).springify().damping(14)}>
        <Text style={styles.sectionTitle}>
          Upcoming Interviews
          <Text style={styles.sectionCount}>  \u2022  {apps.length}</Text>
        </Text>
      </Animated.View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={apps}
        keyExtractor={(item) => `int-${item.id}`}
        contentContainerStyle={styles.horizontalListContent}
        renderItem={({ item, index }) => (
          <Animated.View entering={SlideInRight.delay(570 + index * 60).springify().damping(14)}>
            <TouchableOpacity onPress={() => item.job && router.push(`/job/${item.job.id}`)} activeOpacity={0.9}>
              <GlassCard style={styles.interviewCard} glowColor={colors.success}>
                <View style={styles.interviewCardTop}>
                  <LinearGradient colors={colors.gradient.success} style={styles.interviewIcon}>
                    <Ionicons name="videocam" size={18} color="#FFFFFF" />
                  </LinearGradient>
                  <Badge label="Interviewing" variant="success" size="sm" animated />
                </View>
                <Text style={styles.interviewTitle} numberOfLines={1}>{item.job?.title || 'Interview'}</Text>
                <Text style={styles.interviewCompany} numberOfLines={1}>{item.job?.company || 'Company'}</Text>
                {item.follow_up_at && (
                  <View style={styles.interviewDateRow}>
                    <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                    <Text style={styles.interviewDate}>{formatDate(item.follow_up_at)}</Text>
                  </View>
                )}
              </GlassCard>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </View>
  );
}

function ResumeScoreSection({ score }: { score: number }) {
  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score > 0) return 'Needs Work';
    return 'No Score';
  };
  const getScoreDesc = () => {
    if (score >= 80) return 'Your resume is well-optimized!';
    if (score >= 60) return 'Room for improvement.';
    if (score > 0) return 'Consider optimizing.';
    return 'Upload a resume to see your score.';
  };
  const ringColor = score >= 80 ? 'auto' : score >= 60 ? 'auto' : 'auto';
  return (
    <Animated.View entering={FadeInUp.delay(600).springify().damping(14)} style={styles.section}>
      <TouchableOpacity onPress={() => router.push('/(tabs)/resume')} activeOpacity={0.9}>
        <GlassCard style={styles.resumeScoreCard} glowColor={getMatchColor(score)}>
          <View style={styles.resumeScoreRow}>
            <ProgressRing progress={score} size={64} strokeWidth={6} color="auto" spring />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.resumeScoreTitle}>Resume Score</Text>
              <Text style={[styles.resumeScoreLabel, { color: getMatchColor(score) }]}>{getScoreLabel()}</Text>
              <Text style={styles.resumeScoreDesc}>{getScoreDesc()}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ProfileCompletionSection({ completion }: { completion: number }) {
  const fillWidth = useSharedValue(0);
  const pct = Math.min(completion / 100, 1);
  useEffect(() => {
    fillWidth.value = withTiming(pct, { duration: 1500, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  }, [pct]);
  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${interpolate(fillWidth.value, [0, 1], [0, 100])}%` as any,
  }));
  const barColor = completion >= 80 ? colors.gradient.success : completion >= 50 ? colors.gradient.warning : colors.gradient.primary;
  return (
    <Animated.View entering={FadeInUp.delay(650).springify().damping(14)} style={styles.section}>
      <GlassCard style={styles.profileCompletionCard} glowColor={barColor[0]}>
        <View style={styles.profileCompletionHeader}>
          <View style={styles.profileCompletionTitleRow}>
            <LinearGradient colors={barColor} style={styles.profileCompletionIcon}>
              <Ionicons name="person" size={16} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.profileCompletionTitle}>Profile Completion</Text>
          </View>
          <Text style={[styles.profileCompletionPct, { color: barColor[1] }]}>{Math.round(completion)}%</Text>
        </View>
        <View style={styles.profileCompletionBarBg}>
          <Animated.View style={[styles.profileCompletionBarFill, animatedFillStyle]} />
        </View>
        <View style={styles.profileCompletionSteps}>
          <View style={[styles.stepDot, completion >= 25 && styles.stepDotActive]} />
          <View style={[styles.stepLine, completion >= 25 && styles.stepLineActive]} />
          <View style={[styles.stepDot, completion >= 50 && styles.stepDotActive]} />
          <View style={[styles.stepLine, completion >= 50 && styles.stepLineActive]} />
          <View style={[styles.stepDot, completion >= 75 && styles.stepDotActive]} />
          <View style={[styles.stepLine, completion >= 75 && styles.stepLineActive]} />
          <View style={[styles.stepDot, completion >= 100 && styles.stepDotActive]} />
        </View>
      </GlassCard>
    </Animated.View>
  );
}

function NotificationsPreviewSection({ notifications }: { notifications: Notification[] }) {
  if (!notifications.length) return null;
  return (
    <View style={styles.section}>
      <Animated.View entering={FadeInDown.delay(700).springify().damping(14)}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
      </Animated.View>
      {notifications.slice(0, 3).map((notif, index) => (
        <Animated.View key={notif.id} entering={FadeInUp.delay(720 + index * 60).springify().damping(14)}>
          <GlassCard style={styles.notifCard} glowColor={notif.read ? undefined : colors.primary}>
            <View style={styles.notifRow}>
              <View style={[styles.notifDot, !notif.read && styles.notifDotUnread]} />
              <View style={styles.notifIconWrap}>
                <Ionicons
                  name={notif.type === 'interview' ? 'calendar' : notif.type === 'offer' ? 'trophy' : notif.type === 'message' ? 'chatbubble' : 'notifications'}
                  size={16}
                  color={notif.type === 'interview' ? colors.accent.teal : notif.type === 'offer' ? colors.success : notif.type === 'message' ? colors.accent.violet : colors.primary}
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.notifTitle} numberOfLines={1}>{notif.title}</Text>
                <Text style={styles.notifBody} numberOfLines={1}>{notif.body}</Text>
              </View>
              <Text style={styles.notifTime}>{timeAgo(notif.created_at)}</Text>
            </View>
          </GlassCard>
        </Animated.View>
      ))}
    </View>
  );
}

function AITipSection() {
  const [tip] = useState(() => AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)]);
  const pulseIcon = useSharedValue(1);
  useEffect(() => {
    pulseIcon.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
      ), -1, true,
    );
  }, []);
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseIcon.value }] }));
  return (
    <Animated.View entering={FadeInUp.delay(150).springify().damping(14)} style={styles.section}>
      <GlassCard style={styles.aiTipCard} glowColor={colors.secondary}>
        <View style={styles.aiTipRow}>
          <Animated.View style={iconStyle}>
            <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.aiTipIconBg}>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.aiTipTitle}>AI Career Tip</Text>
            <Text style={styles.aiTipBody}>{tip}</Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

function RecommendedJobsSection({ jobs, savedJobs, onToggleSave }: {
  jobs: Job[]; savedJobs: string[]; onToggleSave: (id: string) => void;
}) {
  if (!jobs.length) return null;
  return (
    <View style={styles.section}>
      <Animated.View entering={FadeInDown.delay(800).springify().damping(14)}>
        <Text style={styles.sectionTitle}>Recommended Jobs</Text>
      </Animated.View>
      {jobs.slice(0, 5).map((item, index) => (
        <Animated.View key={item.id} entering={FadeInUp.delay(820 + index * 60).springify().damping(14)}>
          <Card onPress={() => router.push(`/job/${item.id}`)} style={styles.jobCard} glowColor={colors.primary}>
            <View style={styles.jobHeader}>
              <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.jobIcon}>
                <Text style={styles.jobIconText}>{(item.company || 'C')[0].toUpperCase()}</Text>
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.jobCompany} numberOfLines={1}>{item.company}</Text>
              </View>
              <TouchableOpacity onPress={() => onToggleSave(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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
      ))}
    </View>
  );
}

function DashboardSkeleton() {
  return (
    <View style={{ padding: spacing.lg }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={{ marginBottom: spacing.md }}>
          <Skeleton height={i === 1 ? 80 : i === 2 ? 60 : i === 3 ? 120 : i === 4 ? 80 : i === 5 ? 90 : 70} borderRadiusValue={borderRadius.xl} />
        </View>
      ))}
      <View style={{ gap: spacing.md, marginTop: spacing.md }}>
        {[1, 2, 3].map((j) => <JobCardSkeleton key={j} />)}
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({ totalApplications: 0, interviewsScheduled: 0, offersReceived: 0, responseRate: 0 });
  const [analyticsExtra, setAnalyticsExtra] = useState({ currentStreak: 0, weeklyProgress: 0, profileCompletion: 0 });
  const [resumeScore, setResumeScore] = useState(0);
  const [companies, setCompanies] = useState<string[]>([]);

  const { savedJobs, toggleSaveJob } = useJobStore();
  const user = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();

  const dateStr = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }, []);

  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const timeout = (ms: number) => new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), ms));
      const fetchAll = async () => {
        const results = await Promise.allSettled([
          jobsApi.list({ page: 1, per_page: 20 }).catch(() => ({ data: { data: [] as Job[] } })),
          applicationsApi.list().catch(() => ({ data: { data: [] as Application[] } })),
          analyticsApi.getDashboard().catch(() => ({ data: { data: {} } })),
          resumeApi.list().catch(() => ({ data: { data: [] as any[] } })),
          notificationsApi.list().catch(() => ({ data: { data: [] as Notification[] } })),
        ]);
        return results;
      };

      const results = await Promise.race([fetchAll(), timeout(15000)]);
      if (!mountedRef.current) return;

      const extract = (res: any, key: string = 'data') => {
        if (res?.status === 'fulfilled') return res.value?.data?.data ?? res.value?.data ?? [];
        if (res?.data?.data) return res.data.data;
        if (res?.data) return Array.isArray(res.data) ? res.data : res.data.data || [];
        return [];
      };

      const fetchedJobs: Job[] = extract(results?.[0]);
      if (fetchedJobs.length > 0) {
        setJobs(fetchedJobs);
        const uniqueCompanies = [...new Set(fetchedJobs.map((j: Job) => j.company).filter(Boolean))] as string[];
        setCompanies(uniqueCompanies);
      }

      const apps: Application[] = extract(results?.[1]);
      if (apps.length > 0) {
        setApplications(apps);
        const interviewing = apps.filter((a: Application) => a.status === 'interviewing');
        const offers = apps.filter((a: Application) => a.status === 'offer');
        const total = apps.length;
        setStats({
          totalApplications: total,
          interviewsScheduled: interviewing.length,
          offersReceived: offers.length,
          responseRate: total > 0 ? Math.round(((interviewing.length + offers.length) / total) * 100) : 0,
        });
      }

      const analyticsData = extract(results?.[2]);
      if (analyticsData && typeof analyticsData === 'object' && !Array.isArray(analyticsData)) {
        setAnalyticsExtra({
          currentStreak: analyticsData.current_streak || 0,
          weeklyProgress: analyticsData.weekly_applications || 0,
          profileCompletion: analyticsData.profile_completion || 0,
        });
        if (analyticsData.recently_viewed_jobs && fetchedJobs.length === 0) {
          setJobs(analyticsData.recently_viewed_jobs);
        }
      }

      const resumes = extract(results?.[3]);
      if (resumes.length > 0) {
        setResumeScore(Math.max(...resumes.map((r: any) => r.ats_score || 0)));
      }

      const notifs: Notification[] = extract(results?.[4]);
      if (notifs.length > 0) {
        setNotifications(notifs);
      }
    } catch {} finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const interviewingApps = useMemo(() => applications.filter((a) => a.status === 'interviewing'), [applications]);
  const profileCompletion = analyticsExtra.profileCompletion || Math.min((stats.totalApplications > 0 ? 40 : 0) + (resumeScore > 0 ? 30 : 0) + (user?.name ? 15 : 0) + (stats.interviewsScheduled > 0 ? 15 : 0), 100);

  const renderHeader = useCallback(() => (
    <View style={{ paddingBottom: spacing.md }}>
      <MeshGradient opacity={0.3} />
      <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <View style={[styles.content, { paddingHorizontal: horizontalPadding }]}>
          <HeroSection user={user} dateStr={dateStr} profileCompletion={profileCompletion} />

          {!loading && (
            <>
              <StatsGrid stats={stats} />

              <RecentlyViewedJobs jobs={jobs.slice(0, 6)} />

              <FeaturedCompaniesSection companies={companies} />

              <CategoriesSection />

              <UpcomingInterviewsSection applications={interviewingApps} />

              <ResumeScoreSection score={resumeScore} />

              <ProfileCompletionSection completion={profileCompletion} />

              <NotificationsPreviewSection notifications={notifications} />

              <AITipSection />

              <RecommendedJobsSection jobs={jobs} savedJobs={savedJobs} onToggleSave={toggleSaveJob} />

              <Animated.View entering={FadeInDown.delay(900).springify().damping(14)} style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {jobs.length > 0 ? `${jobs.length} opportunities for you` : 'All Opportunities'}
                </Text>
              </Animated.View>
            </>
          )}
        </View>
      </View>
    </View>
  ), [user, dateStr, stats, jobs, companies, interviewingApps, resumeScore, profileCompletion, notifications, savedJobs, toggleSaveJob, loading, horizontalPadding, insets.top]);

  const renderJob = useCallback(({ item, index }: { item: Job; index: number }) => (
    <Animated.View entering={FadeInUp.delay(100 + index * 30).springify().damping(14)}>
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
  ), [savedJobs, toggleSaveJob]);

  if (loading) {
    return (
      <View style={styles.container}>
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <View style={{ paddingTop: insets.top }}>
              <DashboardSkeleton />
            </View>
          }
          contentContainerStyle={{ paddingBottom: getTabListBottomPadding() + spacing.md }}
        />
      </View>
    );
  }

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.primary} colors={[colors.primary]} progressViewOffset={insets.top + 60} />
        }
        ListEmptyComponent={
          <View style={{ padding: spacing.md, alignItems: 'center', paddingTop: spacing.xl }}>
            <Ionicons name="briefcase-outline" size={48} color={colors.textMuted} />
            <Text style={{ marginTop: spacing.md, fontSize: 16, fontWeight: '600', color: colors.text }}>No jobs found</Text>
            <Text style={{ marginTop: spacing.xs, fontSize: 13, color: colors.textMuted, textAlign: 'center' }}>
              Check back later for new opportunities
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    paddingBottom: spacing.md,
  },
  heroRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  greeting: {
    fontSize: 32, fontWeight: '300', color: colors.text, lineHeight: 38,
  },
  userName: { fontWeight: '800', color: colors.text },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  dateText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  avatarOuter: {
    width: 54, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 27,
    backgroundColor: colors.primary,
    opacity: 0.2,
  },
  avatarGradient: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    ...shadow.glow.primary,
  },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6,
    backgroundColor: colors.success, borderWidth: 2, borderColor: colors.surface,
  },
  profileSummaryCard: {
    padding: spacing.md,
    marginTop: spacing.md,
  },
  profileSummaryRow: {
    flexDirection: 'row', alignItems: 'center',
  },
  planBadge: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  planBadgeInner: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  planBadgeText: {
    color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.6,
  },
  profileSummaryLabel: {
    fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginBottom: 4,
  },
  profileMiniBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  profileMiniBarBg: {
    flex: 1, height: 6, backgroundColor: colors.borderLight, borderRadius: 3, overflow: 'hidden',
  },
  profileMiniBarFill: {
    height: 6, borderRadius: 3, backgroundColor: colors.primary,
  },
  profileMiniPct: {
    fontSize: 13, fontWeight: '700', color: colors.primary, fontVariant: ['tabular-nums'],
  },
  content: {
    gap: spacing.md,
  },
  section: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 20, fontWeight: '700', color: colors.text,
    marginBottom: spacing.sm, letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 14, fontWeight: '500', color: colors.textMuted,
  },
  horizontalListContent: {
    paddingRight: spacing.lg, gap: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
    marginTop: spacing.xs,
  },
  statCard: {
    width: '47%', flexGrow: 1, minWidth: 140,
    backgroundColor: colors.surface, borderRadius: borderRadius.xl,
    padding: spacing.md, ...shadow.md,
  },
  statIconBg: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  statValue: {
    fontSize: 26, fontWeight: '800', color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 12, color: colors.textMuted, fontWeight: '500', marginTop: 2,
  },
  recentJobCard: {
    padding: spacing.md,
    width: 160, marginRight: spacing.sm,
  },
  recentJobIcon: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recentJobIconText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  recentJobTitle: {
    fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 2,
  },
  recentJobCompany: {
    fontSize: 12, color: colors.textSecondary,
  },
  recentJobSalary: {
    fontSize: 12, fontWeight: '600', color: colors.success, marginTop: 4,
  },
  companyCard: {
    padding: spacing.md,
    width: 140, marginRight: spacing.sm,
    alignItems: 'center',
  },
  companyIconRound: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  companyIconText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  companyName: {
    fontSize: 13, fontWeight: '600', color: colors.text,
    textAlign: 'center', marginBottom: 6,
  },
  categoriesContent: {
    gap: spacing.sm, paddingRight: spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryDot: {
    width: 8, height: 8, borderRadius: 4,
  },
  categoryText: {
    fontSize: 13, fontWeight: '600',
  },
  interviewCard: {
    padding: spacing.md,
    width: 200, marginRight: spacing.sm,
  },
  interviewCardTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  interviewIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  interviewTitle: {
    fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 2,
  },
  interviewCompany: {
    fontSize: 12, color: colors.textSecondary,
  },
  interviewDateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: spacing.sm,
  },
  interviewDate: {
    fontSize: 11, color: colors.textMuted, fontWeight: '500',
  },
  resumeScoreCard: {
    padding: spacing.md,
  },
  resumeScoreRow: {
    flexDirection: 'row', alignItems: 'center',
  },
  resumeScoreTitle: {
    fontSize: 16, fontWeight: '700', color: colors.text,
  },
  resumeScoreLabel: {
    fontSize: 14, fontWeight: '600', marginTop: 2,
  },
  resumeScoreDesc: {
    fontSize: 12, color: colors.textSecondary, marginTop: 2,
  },
  profileCompletionCard: {
    padding: spacing.md,
  },
  profileCompletionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  profileCompletionTitleRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  profileCompletionIcon: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  profileCompletionTitle: {
    fontSize: 15, fontWeight: '600', color: colors.text,
  },
  profileCompletionPct: {
    fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'],
  },
  profileCompletionBarBg: {
    height: 8, backgroundColor: colors.borderLight, borderRadius: 4, overflow: 'hidden',
  },
  profileCompletionBarFill: {
    height: 8, borderRadius: 4,
  },
  profileCompletionSteps: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginTop: spacing.sm,
    gap: 2,
  },
  stepDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.borderLight,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepLine: {
    width: 24, height: 2, borderRadius: 1,
    backgroundColor: colors.borderLight,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  notifCard: {
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  notifRow: {
    flexDirection: 'row', alignItems: 'center',
  },
  notifDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'transparent',
    marginRight: spacing.xs,
  },
  notifDotUnread: {
    backgroundColor: colors.primary,
  },
  notifIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.surfaceLight,
  },
  notifTitle: {
    fontSize: 13, fontWeight: '600', color: colors.text,
  },
  notifBody: {
    fontSize: 12, color: colors.textSecondary, marginTop: 1,
  },
  notifTime: {
    fontSize: 10, color: colors.textMuted, fontWeight: '500',
    marginLeft: spacing.sm,
  },
  aiTipCard: {
    padding: spacing.md,
  },
  aiTipRow: {
    flexDirection: 'row', alignItems: 'center',
  },
  aiTipIconBg: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    ...shadow.glow.purple,
  },
  aiTipTitle: {
    fontSize: 14, fontWeight: '600', color: colors.text,
  },
  aiTipBody: {
    fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginTop: 2,
  },
  jobCard: {
    marginBottom: spacing.md,
  },
  jobHeader: {
    flexDirection: 'row', alignItems: 'center',
  },
  jobIcon: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
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
