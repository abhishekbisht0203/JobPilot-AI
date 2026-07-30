import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loader } from '../../../components/ui/Loader';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { jobsApi } from '../../../lib/api';
import { Job } from '../../../types';
import { formatSalary } from '../../../lib/helpers';

export default function SalaryExplorerScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const fetchJobs = useCallback(async () => {
    try {
      const res = await jobsApi.list({ page: 1, per_page: 100 });
      setJobs(res.data.data || []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, []);

  const platforms = useMemo(() => {
    const set = new Set(jobs.map(j => j.platform).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [jobs]);

  const filteredJobs = useMemo(
    () => selectedPlatform === 'all' ? jobs : jobs.filter(j => j.platform === selectedPlatform),
    [jobs, selectedPlatform]
  );

  const salariedJobs = useMemo(() => filteredJobs.filter(j => j.salary_min != null), [filteredJobs]);

  const stats = useMemo(() => {
    if (salariedJobs.length === 0) return { avgMin: 0, avgMax: 0, count: 0, min: 0, max: 0 };
    const mins = salariedJobs.map(j => j.salary_min!);
    const maxs = salariedJobs.map(j => j.salary_max!);
    return {
      avgMin: Math.round(mins.reduce((a, b) => a + b, 0) / mins.length),
      avgMax: Math.round(maxs.reduce((a, b) => a + b, 0) / maxs.length),
      count: salariedJobs.length,
      min: Math.min(...mins),
      max: Math.max(...maxs),
    };
  }, [salariedJobs]);

  const currency = salariedJobs[0]?.currency || 'USD';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchJobs(); }} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        <Animated.View entering={FadeInUp.delay(100).springify().damping(14)} style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Salary Explorer</Text>
          <Text style={styles.subtitle}>Live salary data from job listings</Text>
        </Animated.View>

        {loading && <Loader />}

        {!loading && salariedJobs.length > 0 && (
          <>
            <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
              <GlassCard style={styles.statsCard} glowColor={colors.success}>
                <View style={styles.statGrid}>
                  <View style={styles.statBlock}>
                    <Text style={styles.statLabel}>Average Range</Text>
                    <View style={styles.statValueRow}>
                      <AnimatedCounter value={stats.avgMin} prefix={currency === 'INR' ? '\u20B9' : '$'} style={styles.statValueLarge} spring />
                      <Text style={styles.statDash}>-</Text>
                      <AnimatedCounter value={stats.avgMax} prefix={currency === 'INR' ? '\u20B9' : '$'} style={styles.statValueLarge} spring />
                    </View>
                  </View>
                  <View style={styles.statRow}>
                    <View style={styles.statBlock}>
                      <Text style={styles.statLabel}>Lowest</Text>
                      <Text style={styles.statValue}>{formatSalary(stats.min, undefined, currency)}</Text>
                    </View>
                    <View style={styles.statBlock}>
                      <Text style={styles.statLabel}>Highest</Text>
                      <Text style={styles.statValue}>{formatSalary(undefined, stats.max, currency)}</Text>
                    </View>
                    <View style={styles.statBlock}>
                      <Text style={styles.statLabel}>Listings</Text>
                      <Text style={styles.statValue}>{stats.count}/{filteredJobs.length}</Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>

            <View style={styles.filterRow}>
              <Text style={styles.sectionLabel}>Platform</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
                {platforms.map(p => (
                  <TouchableOpacity key={p} onPress={() => setSelectedPlatform(p)} activeOpacity={0.7}>
                    <BlurView intensity={40} tint="light" style={[styles.chip, selectedPlatform === p && styles.chipActive]}>
                      <Text style={[styles.chipText, selectedPlatform === p && styles.chipTextActive]}>
                        {p === 'all' ? 'All' : p}
                      </Text>
                    </BlurView>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.sectionTitle}>Salary Details</Text>
            {salariedJobs.slice(0, 30).map((job, index) => (
              <Animated.View key={job.id} entering={FadeInDown.delay(200 + index * 40).springify().damping(14)}>
                <Card style={styles.jobCard} glowColor={colors.primary}>
                  <View style={styles.jobTop}>
                    <LinearGradient colors={['#10B981', '#34D399']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.salaryPill}>
                      <Ionicons name="cash" size={12} color="#FFFFFF" />
                      <Text style={styles.salaryPillText}>{formatSalary(job.salary_min, job.salary_max, job.currency)}</Text>
                    </LinearGradient>
                    {job.platform && <Badge label={job.platform} variant="info" size="sm" />}
                  </View>
                  <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                  <Text style={styles.jobCompany} numberOfLines={1}>{job.company}</Text>
                  {job.location && (
                    <View style={styles.jobLocation}>
                      <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                      <Text style={styles.jobLocationText}>{job.location}</Text>
                    </View>
                  )}
                </Card>
              </Animated.View>
            ))}
          </>
        )}

        {!loading && filteredJobs.length > 0 && salariedJobs.length === 0 && (
          <EmptyState icon="cash-outline" title="No salary data" message="These listings don't include salary information." />
        )}

        {!loading && filteredJobs.length === 0 && (
          <EmptyState icon="cash-outline" title="No jobs found" message="Try a different platform or pull to refresh." />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding() },
  header: { paddingBottom: spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  statsCard: { marginBottom: spacing.md },
  statGrid: { gap: spacing.md },
  statBlock: {},
  statLabel: { fontSize: 12, fontWeight: '500', color: colors.textMuted, marginBottom: 2 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  statValueLarge: { fontSize: 22, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  statDash: { fontSize: 18, fontWeight: '700', color: colors.textMuted },
  statRow: { flexDirection: 'row', gap: spacing.lg },
  statValue: { fontSize: 16, fontWeight: '600', color: colors.success },
  filterRow: { marginBottom: spacing.md },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  filterChips: { gap: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: borderRadius.full, overflow: 'hidden' },
  chipActive: { backgroundColor: colors.primary + '20' },
  chipText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  jobCard: { marginBottom: spacing.sm },
  jobTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  salaryPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full },
  salaryPillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  jobTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  jobCompany: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  jobLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  jobLocationText: { fontSize: 12, color: colors.textMuted },
});
