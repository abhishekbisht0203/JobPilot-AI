import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, RefreshControl,
  TextInput, FlatList, Share, Platform, Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withSequence, Easing, interpolate, FadeInDown, FadeInUp, FadeIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { useResponsive } from '../../lib/responsive';
import { GlassCard } from '../../components/ui/GlassCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { JobCardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { MatchScoreRingSimple } from '../../components/ui/MatchScoreRing';
import { getTabListBottomPadding } from '../../components/ui/TabBarHeight';
import { jobsApi } from '../../lib/api';
import { useJobStore } from '../../store';
import { Job } from '../../types';
import { formatSalary, timeAgo, getMatchColor, getInitials, truncate } from '../../lib/helpers';

const PLATFORM_FILTERS = [
  { key: '', label: 'All', icon: 'apps' },
  { key: 'remote', label: 'Remote', icon: 'wifi' },
  { key: 'full-time', label: 'Full Time', icon: 'briefcase' },
  { key: 'contract', label: 'Contract', icon: 'document-text' },
  { key: 'internship', label: 'Internship', icon: 'school' },
] as const;

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest', icon: 'time' },
  { key: 'salary_high', label: 'Salary', icon: 'cash' },
  { key: 'match_score', label: 'Match', icon: 'analytics' },
] as const;

const EXPERIENCE_LEVELS = [
  { key: '', label: 'Any' },
  { key: 'entry', label: 'Entry' },
  { key: 'mid', label: 'Mid' },
  { key: 'senior', label: 'Senior' },
  { key: 'lead', label: 'Lead' },
] as const;

const PER_PAGE = 10;

function AnimatedSearchBar({ value, onChangeText, onSubmit }: {
  value: string; onChangeText: (t: string) => void; onSubmit: () => void;
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
            placeholder="Search jobs, companies, skills..."
            placeholderTextColor={colors.textMuted}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => { setFocused(true); handlePressIn(); }}
            onBlur={() => { setFocused(false); handlePressOut(); }}
            onSubmitEditing={onSubmit}
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

function FilterChip({ label, icon, active, onPress }: {
  label: string; icon?: keyof typeof Ionicons.glyphMap; active: boolean; onPress: () => void;
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
          {icon && (
            <Ionicons
              name={icon}
              size={13}
              color={active ? colors.white : colors.textSecondary}
              style={{ marginRight: 4 }}
            />
          )}
          <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

function SortPill({ label, icon, active, onPress }: {
  label: string; icon: keyof typeof Ionicons.glyphMap; active: boolean; onPress: () => void;
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
        <View style={[styles.sortPill, active && styles.sortPillActive]}>
          <Ionicons
            name={icon}
            size={14}
            color={active ? colors.white : colors.textSecondary}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.sortPillText, active && styles.sortPillTextActive]}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

function JobCard({ item, index, savedJobs, toggleSaveJob, onApply, onShare }: {
  item: Job; index: number; savedJobs: string[];
  toggleSaveJob: (id: string) => void;
  onApply: (job: Job) => void;
  onShare: (job: Job) => void;
}) {
  const isSaved = savedJobs.includes(item.id);
  const initials = getInitials(item.company);
  const matchScore = item.match_score ?? 0;
  const matchColor = getMatchColor(matchScore);

  return (
    <Animated.View entering={FadeInUp.delay(index * 60).springify().damping(14)}>
      <GlassCard style={styles.jobCard} glowColor={isSaved ? colors.primary : undefined}>
        <View style={styles.jobHeader}>
          <LinearGradient
            colors={isSaved ? colors.gradient.primary : colors.gradient.indigo}
            style={styles.companyIcon}
          >
            <Text style={styles.companyIconText}>{initials}</Text>
          </LinearGradient>
          <View style={styles.jobHeaderInfo}>
            <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.jobCompany} numberOfLines={1}>{item.company}</Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleSaveJob(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <LinearGradient
              colors={isSaved ? colors.gradient.primary : ['transparent', 'transparent']}
              style={[styles.saveBtn, isSaved && styles.saveBtnActive]}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={isSaved ? colors.white : colors.textMuted}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.jobMeta}>
          {item.location && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={13} color={colors.textMuted} />
              <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
            </View>
          )}
          {item.posted_at && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={colors.textMuted} />
              <Text style={styles.metaText}>{timeAgo(item.posted_at)}</Text>
            </View>
          )}
          {item.platform && (
            <View style={styles.metaItem}>
              <Ionicons name="globe-outline" size={13} color={colors.textMuted} />
              <Text style={styles.metaText} numberOfLines={1}>{item.platform}</Text>
            </View>
          )}
        </View>

        <View style={styles.jobDetailRow}>
          {item.salary_min && (
            <LinearGradient colors={colors.gradient.success} style={styles.salaryBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.salaryText}>{formatSalary(item.salary_min, item.salary_max, item.currency)}</Text>
            </LinearGradient>
          )}
          {matchScore > 0 && (
            <MatchScoreRingSimple score={matchScore} size={44} animated />
          )}
        </View>

        <View style={styles.skillsRow}>
          {item.skills?.slice(0, 3).map((s, i) => (
            <View key={i} style={styles.skillChip}>
              <Text style={styles.skillChipText}>{s}</Text>
            </View>
          ))}
          {item.skills && item.skills.length > 3 && (
            <Text style={styles.moreSkills}>+{item.skills.length - 3}</Text>
          )}
        </View>

        <View style={styles.jobActions}>
          <TouchableOpacity style={styles.applyBtn} onPress={() => onApply(item)} activeOpacity={0.8}>
            <LinearGradient colors={colors.gradient.primary} style={styles.applyGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="send" size={14} color={colors.white} style={{ marginRight: 4 }} />
              <Text style={styles.applyText}>Apply</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={() => onShare(item)} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export default function FindJobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlatform, setActivePlatform] = useState('');
  const [activeSort, setActiveSort] = useState('newest');
  const [locationFilter, setLocationFilter] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { savedJobs, toggleSaveJob } = useJobStore();
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchJobs = useCallback(async (pageNum: number, append: boolean) => {
    if (pageNum === 1 && !append) {
      setLoading(true);
    } else if (append) {
      setLoadingMore(true);
    }

    try {
      const params: any = {
        page: pageNum,
        per_page: PER_PAGE,
      };

      if (searchQuery) params.search = searchQuery;
      if (activePlatform) params.platform = activePlatform;

      const res = await jobsApi.list(params);
      const data = res.data;
      const fetchedJobs: Job[] = data.data || [];
      const totalCount = data.total || 0;
      const totalPages = data.total_pages || 1;

      if (append) {
        setJobs((prev) => [...prev, ...fetchedJobs]);
      } else {
        setJobs(fetchedJobs);
      }

      setTotal(totalCount);
      setHasMore(pageNum < totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [searchQuery, activePlatform]);

  useEffect(() => {
    fetchJobs(1, false);
  }, [activePlatform]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchJobs(1, false);
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobs(1, false);
  }, [fetchJobs]);

  const onEndReached = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchJobs(page + 1, true);
    }
  }, [loadingMore, hasMore, page, fetchJobs]);

  const sortedJobs = useMemo(() => {
    const sorted = [...jobs];
    if (activeSort === 'salary_high') {
      sorted.sort((a, b) => (b.salary_max ?? b.salary_min ?? 0) - (a.salary_max ?? a.salary_min ?? 0));
    } else if (activeSort === 'match_score') {
      sorted.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
    }
    return sorted;
  }, [jobs, activeSort]);

  const filteredJobs = useMemo(() => {
    return sortedJobs.filter((job) => {
      if (locationFilter) {
        const loc = (job.location ?? '').toLowerCase();
        if (!loc.includes(locationFilter.toLowerCase())) return false;
      }
      if (salaryMin && (job.salary_min ?? 0) < Number(salaryMin)) return false;
      if (salaryMax && (job.salary_max ?? 0) > Number(salaryMax)) return false;
      if (experienceLevel) {
        const title = job.title.toLowerCase();
        if (experienceLevel === 'entry' && !(title.includes('junior') || title.includes('entry') || title.includes('fresher'))) return false;
        if (experienceLevel === 'mid' && !(title.includes('mid') || title.includes('software engineer') || (!title.includes('senior') && !title.includes('junior') && !title.includes('lead')))) return false;
        if (experienceLevel === 'senior' && !title.includes('senior')) return false;
        if (experienceLevel === 'lead' && !(title.includes('lead') || title.includes('head') || title.includes('principal'))) return false;
      }
      return true;
    });
  }, [sortedJobs, locationFilter, salaryMin, salaryMax, experienceLevel]);

  const handleApply = useCallback((job: Job) => {
    if (job.url) {
      Linking.openURL(job.url);
    }
  }, []);

  const handleShare = useCallback(async (job: Job) => {
    try {
      await Share.share({
        message: `Check out this job: ${job.title} at ${job.company}${job.url ? `\n${job.url}` : ''}`,
        title: `${job.title} at ${job.company}`,
      });
    } catch {}
  }, []);

  const renderJob = useCallback(({ item, index }: { item: Job; index: number }) => (
    <JobCard
      item={item}
      index={index}
      savedJobs={savedJobs}
      toggleSaveJob={toggleSaveJob}
      onApply={handleApply}
      onShare={handleShare}
    />
  ), [savedJobs, toggleSaveJob, handleApply, handleShare]);

  const renderSkeleton = useCallback(() => (
    <View style={{ gap: spacing.md }}>
      {[1, 2, 3, 4, 5].map((i) => <JobCardSkeleton key={i} />)}
    </View>
  ), []);

  const renderHeader = () => (
    <View>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
          <Text style={styles.title}>Find Jobs</Text>
          <Text style={styles.subtitle}>
            {loading ? 'Searching...' : `${total} opportunities found`}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.searchSection}>
        <AnimatedSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={() => fetchJobs(1, false)}
        />
      </View>

      <View style={styles.filterSection}>
        <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
          <FlatList
            horizontal
            data={PLATFORM_FILTERS}
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: horizontalPadding }}
            renderItem={({ item }) => (
              <FilterChip
                label={item.label}
                icon={item.icon as any}
                active={activePlatform === item.key}
                onPress={() => setActivePlatform(item.key)}
              />
            )}
          />
        </Animated.View>

        <View style={[styles.sortRow, { paddingHorizontal: horizontalPadding }]}>
          <Animated.View entering={FadeInDown.delay(200).springify().damping(14)} style={styles.sortInner}>
            {SORT_OPTIONS.map((opt) => (
              <SortPill
                key={opt.key}
                label={opt.label}
                icon={opt.icon as any}
                active={activeSort === opt.key}
                onPress={() => setActiveSort(opt.key)}
              />
            ))}
          </Animated.View>
          <TouchableOpacity
            onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
            hitSlop={8}
          >
            <Animated.View>
              <View style={[styles.filterToggle, showAdvancedFilters && styles.filterToggleActive]}>
                <Ionicons
                  name="options"
                  size={18}
                  color={showAdvancedFilters ? colors.white : colors.textSecondary}
                />
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {showAdvancedFilters && (
          <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
            <GlassCard style={styles.advancedFilters}>
              <Text style={styles.advFilterTitle}>Location</Text>
              <View style={styles.advInputRow}>
                <Ionicons name="location-outline" size={16} color={colors.textMuted} style={{ marginRight: spacing.sm }} />
                <TextInput
                  style={styles.advInput}
                  placeholder="City, state, or remote"
                  placeholderTextColor={colors.textMuted}
                  value={locationFilter}
                  onChangeText={setLocationFilter}
                />
                {locationFilter.length > 0 && (
                  <TouchableOpacity onPress={() => setLocationFilter('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[styles.advFilterTitle, { marginTop: spacing.md }]}>Salary Range</Text>
              <View style={styles.salaryInputRow}>
                <View style={styles.salaryInputWrap}>
                  <Text style={styles.salaryPrefix}>{currencySymbol}</Text>
                  <TextInput
                    style={styles.salaryInput}
                    placeholder="Min"
                    placeholderTextColor={colors.textMuted}
                    value={salaryMin}
                    onChangeText={setSalaryMin}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.salaryDash}>-</Text>
                <View style={styles.salaryInputWrap}>
                  <Text style={styles.salaryPrefix}>{currencySymbol}</Text>
                  <TextInput
                    style={styles.salaryInput}
                    placeholder="Max"
                    placeholderTextColor={colors.textMuted}
                    value={salaryMax}
                    onChangeText={setSalaryMax}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={[styles.advFilterTitle, { marginTop: spacing.md }]}>Experience Level</Text>
              <View style={styles.expRow}>
                {EXPERIENCE_LEVELS.map((level) => (
                  <FilterChip
                    key={level.key}
                    label={level.label}
                    active={experienceLevel === level.key}
                    onPress={() => setExperienceLevel(level.key)}
                  />
                ))}
              </View>

              {(locationFilter || salaryMin || salaryMax || experienceLevel) && (
                <TouchableOpacity
                  onPress={() => { setLocationFilter(''); setSalaryMin(''); setSalaryMax(''); setExperienceLevel(''); }}
                  style={styles.clearFilters}
                >
                  <Text style={styles.clearFiltersText}>Clear all filters</Text>
                </TouchableOpacity>
              )}
            </GlassCard>
          </Animated.View>
        )}
      </View>
    </View>
  );

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    const hasFilters = searchQuery || activePlatform || locationFilter || salaryMin || salaryMax || experienceLevel;
    return (
      <EmptyState
        icon="search-outline"
        title={hasFilters ? 'No matching jobs' : 'No jobs available yet'}
        message={hasFilters
          ? 'Try adjusting your filters or search terms to find more opportunities.'
          : 'Check back later for new job listings.'}
        actionLabel={hasFilters ? 'Clear Filters' : undefined}
        onAction={hasFilters ? () => { setSearchQuery(''); setActivePlatform(''); setLocationFilter(''); setSalaryMin(''); setSalaryMax(''); setExperienceLevel(''); } : undefined}
      />
    );
  }, [loading, searchQuery, activePlatform, locationFilter, salaryMin, salaryMax, experienceLevel]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <View style={{ gap: spacing.md }}>
          {[1, 2].map((i) => <JobCardSkeleton key={`footer-${i}`} />)}
        </View>
      </View>
    );
  }, [loadingMore]);

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredJobs}
        renderItem={renderJob}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
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
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={10}
        windowSize={7}
      />
    </View>
  );
}

const currencySymbol = '$';

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
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  sortRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortInner: {
    flexDirection: 'row', gap: spacing.sm,
  },
  filterToggle: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  filterToggleActive: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
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
  sortPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
  },
  sortPillActive: {
    backgroundColor: colors.primary,
  },
  sortPillText: {
    fontSize: 12, fontWeight: '600', color: colors.textSecondary,
  },
  sortPillTextActive: {
    color: colors.white,
  },
  advancedFilters: {
    marginTop: spacing.sm,
  },
  advFilterTitle: {
    fontSize: 13, fontWeight: '600', color: colors.text,
    marginBottom: spacing.xs,
  },
  advInputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 42,
  },
  advInput: {
    flex: 1, fontSize: 14, color: colors.text,
    padding: 0, margin: 0,
  },
  salaryInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  salaryInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 42,
  },
  salaryPrefix: {
    fontSize: 14, fontWeight: '600', color: colors.textMuted,
    marginRight: spacing.xs,
  },
  salaryInput: {
    flex: 1, fontSize: 14, color: colors.text,
    padding: 0, margin: 0,
  },
  salaryDash: {
    fontSize: 14, color: colors.textMuted,
  },
  expRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
  },
  clearFilters: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  clearFiltersText: {
    fontSize: 13, fontWeight: '500', color: colors.primary,
  },
  jobCard: {
    marginBottom: spacing.md,
  },
  jobHeader: {
    flexDirection: 'row', alignItems: 'center',
  },
  companyIcon: {
    width: 46, height: 46, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  companyIconText: {
    color: colors.white, fontSize: 18, fontWeight: '700',
  },
  jobHeaderInfo: {
    flex: 1, marginLeft: spacing.sm,
  },
  jobTitle: {
    fontSize: 16, fontWeight: '600', color: colors.text,
  },
  jobCompany: {
    fontSize: 13, color: colors.textSecondary, marginTop: 2,
  },
  saveBtn: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  saveBtnActive: {
    borderWidth: 0,
  },
  jobMeta: {
    flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
  },
  metaText: {
    fontSize: 12, color: colors.textSecondary,
  },
  jobDetailRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginTop: spacing.sm,
  },
  salaryBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  salaryText: {
    fontSize: 12, fontWeight: '700', color: colors.white,
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
  jobActions: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginTop: spacing.md, paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.glassBorder,
  },
  applyBtn: {
    flex: 1,
  },
  applyGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  applyText: {
    color: colors.white, fontSize: 14, fontWeight: '600',
  },
  shareBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center', alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: spacing.md,
  },
});
