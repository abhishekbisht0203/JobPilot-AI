import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, RefreshControl,
  TextInput, FlatList, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  FadeInDown, FadeInUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { useResponsive } from '../../lib/responsive';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getTabListBottomPadding } from '../../components/ui/TabBarHeight';
import { jobsApi } from '../../lib/api';
import { Job, Company } from '../../types';
import { getInitials, truncate } from '../../lib/helpers';

const COMPANY_GRADIENTS: (keyof typeof colors.gradient)[] = [
  'blue', 'purple', 'coral', 'sunset', 'teal', 'indigo',
  'primary', 'success', 'warning', 'error', 'aurora', 'nebula',
];

function deriveIndustry(jobs: Job[]): string {
  const text = jobs.map(j => j.title + ' ' + (j.description || '')).join(' ').toLowerCase();
  if (text.includes('health') || text.includes('medical') || text.includes('pharma') || text.includes('nurse')) return 'Healthcare';
  if (text.includes('finance') || text.includes('bank') || text.includes('accounting') || text.includes('investment')) return 'Finance';
  if (text.includes('market') || text.includes('advertising') || text.includes('pr ') || text.includes('seo')) return 'Marketing';
  if (text.includes('educat') || text.includes('teach') || text.includes('training') || text.includes('professor')) return 'Education';
  if (text.includes('engineer') || text.includes('software') || text.includes('developer') || text.includes('devops') || text.includes('data')) return 'Technology';
  if (text.includes('design') || text.includes('creative') || text.includes('ui') || text.includes('ux') || text.includes('art')) return 'Design';
  if (text.includes('consult') || text.includes('strategy') || text.includes('analyst')) return 'Consulting';
  if (text.includes('legal') || text.includes('law') || text.includes('attorney') || text.includes('paralegal')) return 'Legal';
  if (text.includes('hr ') || text.includes('recruit') || text.includes('talent') || text.includes('people')) return 'HR';
  if (text.includes('sales') || text.includes('account executive')) return 'Sales';
  if (text.includes('logistics') || text.includes('supply chain') || text.includes('operations')) return 'Operations';
  if (text.includes('hospitality') || text.includes('hotel') || text.includes('restaurant')) return 'Hospitality';
  return 'Technology';
}

function extractCompanies(jobs: Job[]): Company[] {
  const map = new Map<string, Job[]>();
  for (const job of jobs) {
    if (!job.company) continue;
    if (!map.has(job.company)) map.set(job.company, []);
    map.get(job.company)!.push(job);
  }

  return Array.from(map.entries()).map(([name, companyJobs]) => {
    const allSkills = [...new Set(companyJobs.flatMap(j => j.skills || []))];
    const locations = [...new Set(companyJobs.map(j => j.location).filter(Boolean) as string[])];
    const firstDesc = companyJobs.find(j => j.description)?.description || '';

    return {
      name,
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      industry: deriveIndustry(companyJobs),
      description: truncate(firstDesc, 160),
      location: locations[0] || 'Remote',
      open_jobs_count: companyJobs.length,
      tech_stack: allSkills.slice(0, 25),
      hiring: true,
      created_at: new Date().toISOString(),
    } as Company;
  });
}

function CompanyCard({ company, index }: { company: Company; index: number }) {
  const gradientKey = COMPANY_GRADIENTS[index % COMPANY_GRADIENTS.length];
  const gradientColors = colors.gradient[gradientKey];
  const initials = getInitials(company.name);
  const scale = useSharedValue(1);

  return (
    <Animated.View entering={FadeInUp.delay(index * 60).springify().damping(14)}>
      <TouchableOpacity
        onPress={() => router.push(`/(tabs)/companies/${encodeURIComponent(company.name)}`)}
        onPressIn={() => { scale.value = withSpring(0.97, { stiffness: 400, damping: 12 }); }}
        onPressOut={() => { scale.value = withSpring(1, { stiffness: 300, damping: 15 }); }}
        activeOpacity={1}
      >
        <Animated.View style={[{ transform: [{ scale }] }]}>
          <GlassCard style={styles.companyCard} glowColor={gradientColors[0]}>
            <View style={styles.cardTop}>
              <LinearGradient colors={gradientColors} style={styles.companyIcon}>
                <Text style={styles.companyIconText}>{initials}</Text>
              </LinearGradient>
              <View style={styles.cardTopInfo}>
                <Text style={styles.companyName} numberOfLines={1}>{company.name}</Text>
                <View style={styles.cardMetaRow}>
                  {company.industry && <Badge label={company.industry} variant="info" size="sm" />}
                  {company.location && (
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                      <Text style={styles.locationText} numberOfLines={1}>{company.location}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.jobCountBadge}>
                <Text style={styles.jobCountNumber}>{company.open_jobs_count}</Text>
                <Text style={styles.jobCountLabel}>{company.open_jobs_count === 1 ? 'Job' : 'Jobs'}</Text>
              </View>
            </View>

            {company.description ? (
              <Text style={styles.companyDesc} numberOfLines={2}>{company.description}</Text>
            ) : null}

            {company.tech_stack && company.tech_stack.length > 0 && (
              <View style={styles.skillsRow}>
                {company.tech_stack.slice(0, 4).map((skill, i) => (
                  <View key={i} style={styles.skillChip}>
                    <Text style={styles.skillChipText}>{skill}</Text>
                  </View>
                ))}
                {company.tech_stack.length > 4 && (
                  <Text style={styles.moreSkills}>+{company.tech_stack.length - 4}</Text>
                )}
              </View>
            )}

            <View style={styles.cardFooter}>
              <View style={styles.footerMeta}>
                <Ionicons name="briefcase-outline" size={14} color={colors.textMuted} />
                <Text style={styles.footerText}>{company.open_jobs_count} open position{company.open_jobs_count !== 1 ? 's' : ''}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          </GlassCard>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function CompanySkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonTop}>
        <Skeleton height={52} width={52} borderRadiusValue={16} />
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Skeleton height={18} width="65%" />
          <Skeleton height={14} width="45%" style={{ marginTop: 6 }} />
        </View>
        <Skeleton height={46} width={46} borderRadiusValue={12} />
      </View>
      <Skeleton height={14} width="100%" style={{ marginTop: spacing.sm }} />
      <Skeleton height={14} width="80%" style={{ marginTop: 6 }} />
      <View style={styles.skeletonTags}>
        <Skeleton height={26} width={72} borderRadiusValue={13} />
        <Skeleton height={26} width={88} borderRadiusValue={13} />
        <Skeleton height={26} width={60} borderRadiusValue={13} />
        <Skeleton height={26} width={78} borderRadiusValue={13} />
      </View>
    </View>
  );
}

function AnimatedSearchBar({ value, onChangeText }: {
  value: string; onChangeText: (t: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.1 + glow.value * 0.3,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { stiffness: 400, damping: 12 });
    glow.value = withTiming(1, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 300, damping: 15 });
    glow.value = withTiming(0, { duration: 200 });
  };

  return (
    <Animated.View style={containerStyle}>
      <BlurView intensity={focused ? 80 : 50} tint="light" style={styles.searchBlur}>
        <Animated.View style={[styles.searchGlow, { backgroundColor: colors.primary }, glowStyle]} />
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={focused ? colors.primary : colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search companies by name, industry..."
            placeholderTextColor={colors.textMuted}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => { setFocused(true); handlePressIn(); }}
            onBlur={() => { setFocused(false); handlePressOut(); }}
            returnKeyType="search"
          />
          {value.length > 0 && (
            <TouchableOpacity onPress={() => onChangeText('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        {focused && <View style={styles.searchBorder} pointerEvents="none" />}
      </BlurView>
    </Animated.View>
  );
}

function FilterChip({ label, active, onPress }: {
  label: string; active: boolean; onPress: () => void;
}) {
  const scale = useSharedValue(1);
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.92, { stiffness: 400, damping: 12 }); }}
      onPressOut={() => { scale.value = withSpring(1, { stiffness: 300, damping: 15 }); }}
      activeOpacity={1}
    >
      <Animated.View style={[{ transform: [{ scale }] }]}>
        <View style={[styles.filterChip, active && styles.filterChipActive]}>
          <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function BrowseCompaniesScreen() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');

  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await jobsApi.list({ page: 1, per_page: 100 });
      const jobs: Job[] = res.data.data || [];
      const extracted = extractCompanies(jobs);
      setCompanies(extracted);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCompanies(); }, []);

  const industries = useMemo(() => {
    return [...new Set(companies.map(c => c.industry).filter(Boolean) as string[])];
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = c.name.toLowerCase();
        const industry = (c.industry || '').toLowerCase();
        const location = (c.location || '').toLowerCase();
        const skills = (c.tech_stack || []).join(' ').toLowerCase();
        if (!name.includes(q) && !industry.includes(q) && !location.includes(q) && !skills.includes(q)) return false;
      }
      if (selectedIndustry && c.industry !== selectedIndustry) return false;
      return true;
    });
  }, [companies, searchQuery, selectedIndustry]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCompanies();
  }, [fetchCompanies]);

  const totalJobs = useMemo(() => {
    return companies.reduce((sum, c) => sum + (c.open_jobs_count || 0), 0);
  }, [companies]);

  const renderHeader = () => (
    <View>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
          <Text style={styles.title}>Browse Companies</Text>
          <Text style={styles.subtitle}>
            {loading ? 'Loading companies...' : `${companies.length} companies · ${totalJobs} open positions`}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.searchSection}>
        <AnimatedSearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {industries.length > 0 && (
        <View style={styles.filterSection}>
          <FlatList
            horizontal
            data={industries}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: horizontalPadding }}
            ListHeaderComponent={
              <FilterChip label="All" active={selectedIndustry === ''} onPress={() => setSelectedIndustry('')} />
            }
            renderItem={({ item }) => (
              <FilterChip label={item} active={selectedIndustry === item} onPress={() => setSelectedIndustry(item)} />
            )}
          />
        </View>
      )}
    </View>
  );

  const renderCompany = useCallback(({ item, index }: { item: Company; index: number }) => (
    <CompanyCard company={item} index={index} />
  ), []);

  const renderSkeleton = () => (
    <View style={{ gap: spacing.md, paddingHorizontal: horizontalPadding }}>
      {[1, 2, 3, 4, 5].map((i) => <CompanySkeleton key={i} />)}
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    const hasFilters = searchQuery || selectedIndustry;
    return (
      <EmptyState
        icon="business-outline"
        title={hasFilters ? 'No companies found' : 'No companies available'}
        message={hasFilters
          ? 'Try adjusting your search or filters to find more companies.'
          : 'Jobs data will populate company listings once available.'}
        actionLabel={hasFilters ? 'Clear Filters' : undefined}
        onAction={hasFilters ? () => { setSearchQuery(''); setSelectedIndustry(''); } : undefined}
      />
    );
  };

  return (
    <View style={styles.container}>
      {loading ? renderSkeleton() : (
        <FlatList
          data={filteredCompanies}
          renderItem={renderCompany}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingBottom: getTabListBottomPadding() + spacing.md,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressViewOffset={insets.top + 60}
            />
          }
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={10}
          windowSize={7}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 0,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 30, fontWeight: '700', color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14, color: colors.textSecondary, marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: 0,
    paddingBottom: spacing.sm,
  },
  searchBlur: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  searchGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    opacity: 0.08,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1, fontSize: 16, color: colors.text,
    padding: 0, margin: 0,
  },
  searchBorder: {
    position: 'absolute', bottom: 0, left: spacing.md, right: spacing.md,
    height: 2, backgroundColor: colors.primary,
    borderTopLeftRadius: 2, borderTopRightRadius: 2,
  },
  filterSection: {
    paddingBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13, fontWeight: '500', color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white, fontWeight: '600',
  },
  companyCard: {
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row', alignItems: 'center',
  },
  companyIcon: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  companyIconText: {
    color: colors.white, fontSize: 20, fontWeight: '700',
  },
  cardTopInfo: {
    flex: 1, marginLeft: spacing.sm,
  },
  companyName: {
    fontSize: 17, fontWeight: '700', color: colors.text,
  },
  cardMetaRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 4, flexWrap: 'wrap',
  },
  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  locationText: {
    fontSize: 12, color: colors.textMuted, maxWidth: 120,
  },
  jobCountBadge: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: colors.primaryBg,
    justifyContent: 'center', alignItems: 'center',
    marginLeft: spacing.sm,
  },
  jobCountNumber: {
    fontSize: 16, fontWeight: '800', color: colors.primary,
    marginTop: -2,
  },
  jobCountLabel: {
    fontSize: 9, fontWeight: '600', color: colors.primary,
    textTransform: 'uppercase', letterSpacing: 0.3, marginTop: -1,
  },
  companyDesc: {
    fontSize: 13, color: colors.textSecondary, lineHeight: 18,
    marginTop: spacing.sm,
  },
  skillsRow: {
    flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm,
    alignItems: 'center', flexWrap: 'wrap',
  },
  skillChip: {
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: colors.primaryBg,
    borderRadius: borderRadius.sm,
  },
  skillChipText: {
    fontSize: 11, fontWeight: '500', color: colors.primary,
  },
  moreSkills: {
    fontSize: 12, color: colors.textMuted, fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md, paddingTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.glassBorder,
  },
  footerMeta: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
  },
  footerText: {
    fontSize: 12, color: colors.textMuted, fontWeight: '500',
  },
  skeletonCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md,
    marginBottom: spacing.md, ...shadow.sm,
  },
  skeletonTop: {
    flexDirection: 'row', alignItems: 'center',
  },
  skeletonTags: {
    flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm,
  },
});
