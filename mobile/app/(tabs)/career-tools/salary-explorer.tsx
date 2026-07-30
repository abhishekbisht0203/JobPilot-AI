import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow, screen } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loader } from '../../../components/ui/Loader';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { jobApi } from '../../../lib/api';
import { Job } from '../../../types';
import { formatSalary, formatSalaryFromString } from '../../../lib/helpers';
import {
  ToolHeader, SectionHeader, StatCard, InfoCard, ChipFilter, TabBar, GradientButton, EmptyToolState
} from '../../../components/career-tools';
import { SearchBar, AnimatedCard, SalaryCard, BadgePill } from '../../../components/career-tools/shared';

const TABS = [
  { key: 'explore', label: 'Explore', icon: 'search' },
  { key: 'companies', label: 'Companies', icon: 'business' },
  { key: 'compare', label: 'Compare', icon: 'git-compare' },
];

export default function SalaryExplorerScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('explore');
  const [compareRole1, setCompareRole1] = useState('');
  const [compareRole2, setCompareRole2] = useState('');

  const fetchJobs = useCallback(async () => {
    try {
      const res = await jobApi.list({ page: 1, per_page: 50 });
      setJobs(res.data.data || []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, []);

  const platforms: string[] = useMemo(() => {
    const types = jobs.map(j => j.platform).filter((t): t is string => !!t);
    return ['all', ...Array.from(new Set(types))];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let result = selectedPlatform === 'all' ? jobs : jobs.filter(j => j.platform === selectedPlatform);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(j =>
        j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [jobs, selectedPlatform, searchQuery]);

  const salariedJobs = useMemo(() => filteredJobs.filter(j => (j.salary_min ?? 0) > 0 || (j.salary_max ?? 0) > 0), [filteredJobs]);

  const stats = useMemo(() => {
    if (salariedJobs.length === 0) return { avgMin: 0, avgMax: 0, count: 0, min: 0, max: 0 };
    const mins = salariedJobs.map(j => j.salary_min ?? 0).filter(v => v > 0);
    const maxs = salariedJobs.map(j => j.salary_max ?? 0).filter(v => v > 0);
    const all = [...mins, ...maxs];
    const avgMin = mins.length > 0 ? Math.round(mins.reduce((a, b) => a + b, 0) / mins.length) : 0;
    const avgMax = maxs.length > 0 ? Math.round(maxs.reduce((a, b) => a + b, 0) / maxs.length) : 0;
    return {
      avgMin,
      avgMax,
      count: salariedJobs.length,
      min: Math.min(...all),
      max: Math.max(...all),
    };
  }, [salariedJobs]);

  const companyGroups = useMemo(() => {
    const map = new Map<string, Job[]>();
    salariedJobs.forEach(j => {
      const key = j.company || 'Unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(j);
    });
    return Array.from(map.entries()).map(([company, jobs]) => {
      const mins = jobs.map(j => j.salary_min ?? 0).filter(v => v > 0);
      const maxs = jobs.map(j => j.salary_max ?? 0).filter(v => v > 0);
      const all = [...mins, ...maxs];
      return {
        company,
        count: jobs.length,
        avgMin: mins.length > 0 ? Math.round(mins.reduce((a, b) => a + b, 0) / mins.length) : 0,
        avgMax: maxs.length > 0 ? Math.round(maxs.reduce((a, b) => a + b, 0) / maxs.length) : 0,
        min: all.length > 0 ? Math.min(...all) : 0,
        max: all.length > 0 ? Math.max(...all) : 0,
        platforms: [...new Set(jobs.map(j => j.platform).filter(Boolean))],
      };
    }).sort((a, b) => b.avgMax - a.avgMax);
  }, [salariedJobs]);

  const matchedCompare1 = useMemo(() => {
    if (!compareRole1.trim()) return null;
    const q = compareRole1.toLowerCase();
    const matched = jobs.filter(j => j.title?.toLowerCase().includes(q) && ((j.salary_min ?? 0) > 0 || (j.salary_max ?? 0) > 0));
    if (matched.length === 0) return null;
    const mins = matched.map(j => j.salary_min ?? 0).filter(v => v > 0);
    const maxs = matched.map(j => j.salary_max ?? 0).filter(v => v > 0);
    return {
      role: compareRole1,
      count: matched.length,
      avgMin: mins.length > 0 ? Math.round(mins.reduce((a, b) => a + b, 0) / mins.length) : 0,
      avgMax: maxs.length > 0 ? Math.round(maxs.reduce((a, b) => a + b, 0) / maxs.length) : 0,
      companies: [...new Set(matched.map(j => j.company).filter(Boolean))],
    };
  }, [compareRole1, jobs]);

  const matchedCompare2 = useMemo(() => {
    if (!compareRole2.trim()) return null;
    const q = compareRole2.toLowerCase();
    const matched = jobs.filter(j => j.title?.toLowerCase().includes(q) && ((j.salary_min ?? 0) > 0 || (j.salary_max ?? 0) > 0));
    if (matched.length === 0) return null;
    const mins = matched.map(j => j.salary_min ?? 0).filter(v => v > 0);
    const maxs = matched.map(j => j.salary_max ?? 0).filter(v => v > 0);
    return {
      role: compareRole2,
      count: matched.length,
      avgMin: mins.length > 0 ? Math.round(mins.reduce((a, b) => a + b, 0) / mins.length) : 0,
      avgMax: maxs.length > 0 ? Math.round(maxs.reduce((a, b) => a + b, 0) / maxs.length) : 0,
      companies: [...new Set(matched.map(j => j.company).filter(Boolean))],
    };
  }, [compareRole2, jobs]);

  return (
    <View style={styles.container}>
      <ToolHeader
        title="Salary Explorer"
        subtitle="Live salary data from job listings"
        gradient={['#059669', '#0D9488']}
        icon="cash"
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchJobs(); }} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {loading && <Loader />}

        {!loading && (
          <>
            {salariedJobs.length > 0 && (
              <Animated.View entering={FadeInDown.delay(100).springify().damping(14)} style={styles.statsRow}>
                <StatCard label="Avg Min" value={stats.avgMin} icon="trending-down" color={colors.accent.emerald} prefix="$" />
                <StatCard label="Avg Max" value={stats.avgMax} icon="trending-up" color={colors.accent.teal} prefix="$" />
                <StatCard label="Lowest" value={stats.min} icon="arrow-down" color={colors.warning} prefix="$" />
                <StatCard label="Highest" value={stats.max} icon="arrow-up" color={colors.success} prefix="$" />
              </Animated.View>
            )}

            <SectionHeader title="Filters" />
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search by title or company..." />
            <ChipFilter options={platforms} selected={selectedPlatform} onSelect={setSelectedPlatform} />

            <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'explore' && (
              <>
                {salariedJobs.length > 0 && (
                  <>
                    <SectionHeader title={`Salaries (${salariedJobs.length})`} />
                    {salariedJobs.slice(0, 30).map((job, index) => {
                      const companyName = job.company || '';
                      return (
                        <AnimatedCard key={job._id} index={index} delay={200}>
                          <Card style={styles.jobCard} glowColor={colors.primary}>
                            <View style={styles.jobTop}>
                              <LinearGradient colors={['#10B981', '#34D399']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.salaryPill}>
                                <Ionicons name="cash" size={12} color="#FFFFFF" />
                                <Text style={styles.salaryPillText}>{formatSalary(job.salary_min, job.salary_max, job.currency)}</Text>
                              </LinearGradient>
                              {job.platform && <Badge label={job.platform} variant="info" size="sm" />}
                            </View>
                            <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                            <Text style={styles.jobCompany} numberOfLines={1}>{companyName}</Text>
                            {job.location && (
                              <View style={styles.jobLocation}>
                                <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                                <Text style={styles.jobLocationText}>{job.location}</Text>
                              </View>
                            )}
                          </Card>
                        </AnimatedCard>
                      );
                    })}
                  </>
                )}

                {salariedJobs.length === 0 && filteredJobs.length > 0 && (
                  <EmptyToolState icon="cash-outline" title="No salary data" message="These listings don't include salary information." />
                )}

                {filteredJobs.length === 0 && (
                  <EmptyToolState icon="search-outline" title="No jobs found" message="Try a different platform or search term." />
                )}
              </>
            )}

            {activeTab === 'companies' && (
              <>
                {companyGroups.length > 0 ? (
                  <>
                    <SectionHeader title={`Companies (${companyGroups.length})`} />
                    {companyGroups.map((c, index) => (
                      <Animated.View key={c.company} entering={FadeInDown.delay(200 + index * 40).springify().damping(14)}>
                        <GlassCard style={styles.companyCard}>
                          <View style={styles.companyHeader}>
                            <View style={styles.companyIcon}>
                              <Ionicons name="business" size={18} color={colors.accent.teal} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.companyName}>{c.company}</Text>
                              <Text style={styles.companyCount}>{c.count} listing{c.count !== 1 ? 's' : ''}</Text>
                            </View>
                          </View>
                          <View style={styles.companyStats}>
                            <View style={styles.companyStat}>
                              <Text style={styles.companyStatLabel}>Avg Range</Text>
                              <Text style={styles.companyStatValue}>${c.avgMin}K - ${c.avgMax}K</Text>
                            </View>
                            <View style={styles.companyStat}>
                              <Text style={styles.companyStatLabel}>Min</Text>
                              <Text style={styles.companyStatValue}>${c.min}K</Text>
                            </View>
                            <View style={styles.companyStat}>
                              <Text style={styles.companyStatLabel}>Max</Text>
                              <Text style={styles.companyStatValue}>${c.max}K</Text>
                            </View>
                          </View>
                          <View style={styles.companyPlatforms}>
                            {c.platforms.map(p => (
                              <Badge key={p} label={p} variant="info" size="sm" />
                            ))}
                          </View>
                        </GlassCard>
                      </Animated.View>
                    ))}
                  </>
                ) : (
                  <EmptyToolState icon="business-outline" title="No company data" message="No salary data available to group by company." />
                )}
              </>
            )}

            {activeTab === 'compare' && (
              <>
                <SectionHeader title="Compare Roles" icon="git-compare" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Role 1 (e.g. Software Engineer)"
                  placeholderTextColor={colors.textMuted}
                  value={compareRole1}
                  onChangeText={setCompareRole1}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Role 2 (e.g. Data Scientist)"
                  placeholderTextColor={colors.textMuted}
                  value={compareRole2}
                  onChangeText={setCompareRole2}
                />
                {matchedCompare1 && matchedCompare2 && (
                  <Animated.View entering={FadeInUp.springify().damping(14)} style={styles.compareGrid}>
                    <GlassCard style={styles.compareCard}>
                      <Text style={styles.compareRoleName}>{matchedCompare1.role}</Text>
                      <View style={styles.compareStat}>
                        <Text style={styles.compareStatLabel}>Avg Salary</Text>
                        <Text style={styles.compareStatValue}>${matchedCompare1.avgMin}K - ${matchedCompare1.avgMax}K</Text>
                      </View>
                      <View style={styles.compareStat}>
                        <Text style={styles.compareStatLabel}>Data Points</Text>
                        <Text style={styles.compareStatValue}>{matchedCompare1.count}</Text>
                      </View>
                      <View style={styles.compareStat}>
                        <Text style={styles.compareStatLabel}>Companies</Text>
                        <View style={styles.compareBadgeRow}>
                          {matchedCompare1.companies.slice(0, 3).map(c => (
                            <Badge key={c} label={c} variant="info" size="sm" />
                          ))}
                        </View>
                      </View>
                    </GlassCard>
                    <GlassCard style={styles.compareCard}>
                      <Text style={styles.compareRoleName}>{matchedCompare2.role}</Text>
                      <View style={styles.compareStat}>
                        <Text style={styles.compareStatLabel}>Avg Salary</Text>
                        <Text style={styles.compareStatValue}>${matchedCompare2.avgMin}K - ${matchedCompare2.avgMax}K</Text>
                      </View>
                      <View style={styles.compareStat}>
                        <Text style={styles.compareStatLabel}>Data Points</Text>
                        <Text style={styles.compareStatValue}>{matchedCompare2.count}</Text>
                      </View>
                      <View style={styles.compareStat}>
                        <Text style={styles.compareStatLabel}>Companies</Text>
                        <View style={styles.compareBadgeRow}>
                          {matchedCompare2.companies.slice(0, 3).map(c => (
                            <Badge key={c} label={c} variant="info" size="sm" />
                          ))}
                        </View>
                      </View>
                    </GlassCard>
                  </Animated.View>
                )}
                {!matchedCompare1 && !matchedCompare2 && compareRole1 === '' && compareRole2 === '' && (
                  <EmptyToolState icon="git-compare-outline" title="Compare Salaries" message="Enter two role titles above to compare salary data." />
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding() },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  jobCard: { marginBottom: spacing.sm },
  jobTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  salaryPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full },
  salaryPillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  jobTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  jobCompany: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  jobLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  jobLocationText: { fontSize: 12, color: colors.textMuted },
  companyCard: { marginBottom: spacing.sm, padding: spacing.md },
  companyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  companyIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.accent.teal + '18', justifyContent: 'center', alignItems: 'center' },
  companyName: { fontSize: 15, fontWeight: '600', color: colors.text },
  companyCount: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  companyStats: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  companyStat: {},
  companyStatLabel: { fontSize: 10, fontWeight: '500', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 },
  companyStatValue: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 1 },
  companyPlatforms: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  compareGrid: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  compareCard: { flex: 1, padding: spacing.md },
  compareRoleName: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  compareStat: { marginBottom: spacing.sm },
  compareStatLabel: { fontSize: 10, fontWeight: '500', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 },
  compareStatValue: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 1 },
  compareBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
});
