import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { JobCardSkeleton } from '../../../components/ui/Skeleton';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { useSavedJobsStore } from '../../../store';
import { jobApi } from '../../../lib/api';
import { Job } from '../../../types';
import { formatSalary, timeAgo } from '../../../lib/helpers';

const PLATFORMS = ['all', 'LinkedIn', 'Indeed', 'Naukri', 'Glassdoor', 'AngelList'];

export default function SavedJobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activePlatform, setActivePlatform] = useState('all');
  const savedIds = useSavedJobsStore((s) => s.savedIds)
  const toggleSave = useSavedJobsStore((s) => s.toggleSave);
  const { horizontalPadding } = useResponsive();
  const insets = useSafeAreaInsets();

  const fetchSavedJobs = useCallback(async () => {
    try {
      const savedIds = useSavedJobsStore.getState().savedIds;
      if (savedIds.length === 0) {
        setJobs([]);
        return;
      }
      const res = await jobApi.list({ page: 1, per_page: 50 });
      const allJobs: Job[] = res.data.data || [];
      setJobs(allJobs.filter((j) => savedIds.includes(j.id)));
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchSavedJobs(); }, [savedIds.length]);

  const filtered = activePlatform === 'all'
    ? jobs
    : jobs.filter((j) => j.platform === activePlatform);

  const renderJob = ({ item, index }: { item: Job; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 60).springify().damping(14)}>
      <Card onPress={() => router.push(`/job/${item.id}`)} style={styles.jobCard} glowColor={colors.primary}>
        <View style={styles.jobHeader}>
          <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.jobIcon}>
            <Text style={styles.jobIconText}>{(item.company || 'C')[0].toUpperCase()}</Text>
          </LinearGradient>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.jobCompany} numberOfLines={1}>{item.company}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleSave(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="bookmark" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.jobTags}>
          {item.match_score ? (
            <Badge label={`${item.match_score}% Match`} variant={item.match_score >= 80 ? 'success' : item.match_score >= 60 ? 'warning' : 'default'} size="sm" animated />
          ) : <Badge label="Saved" variant="info" size="sm" />}
          {item.location && <Badge label={item.location} variant="default" size="sm" />}
          {item.posted_at && <Badge label={timeAgo(item.posted_at)} variant="default" size="sm" />}
          {item.platform && <Badge label={item.platform} variant="default" size="sm" />}
        </View>

        <Text style={styles.jobDesc} numberOfLines={2}>{item.description}</Text>

        {item.salary_min && (
          <Text style={styles.jobSalary}>{formatSalary(item.salary_min, item.salary_max, item.currency)}</Text>
        )}
      </Card>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        renderItem={renderJob}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: getTabListBottomPadding() + spacing.md,
          paddingHorizontal: horizontalPadding,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchSavedJobs(); }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <>
            <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>Saved Jobs</Text>
                  <Text style={styles.subtitle}>{jobs.length} saved positions</Text>
                </View>
                <TouchableOpacity onPress={() => router.back()}>
                  <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.backIcon}>
                    <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {jobs.length > 0 && (
              <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
                <FlatList
                  horizontal
                  data={PLATFORMS}
                  keyExtractor={(item) => item}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: spacing.sm, marginBottom: spacing.md }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => setActivePlatform(item)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.platformTab, activePlatform === item && styles.platformTabActive]}>
                        <Text style={[styles.platformTabText, activePlatform === item && styles.platformTabTextActive]}>
                          {item === 'all' ? 'All' : item}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </Animated.View>
            )}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ padding: spacing.md, gap: spacing.md }}>
              {[1, 2, 3].map((i) => <JobCardSkeleton key={i} />)}
            </View>
          ) : (
            <EmptyState
              icon="bookmark-outline"
              title="No saved jobs"
              message="Save jobs you're interested in to find them here quickly."
              actionLabel="Browse Jobs"
              onAction={() => router.push('/(tabs)/find-jobs')}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  backIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  platformTab: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, ...shadow.xs,
  },
  platformTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  platformTabText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  platformTabTextActive: { color: colors.white, fontWeight: '600' },
  jobCard: { marginBottom: spacing.md },
  jobHeader: { flexDirection: 'row', alignItems: 'center' },
  jobIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  jobIconText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  jobTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  jobCompany: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  jobTags: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm, flexWrap: 'wrap' },
  jobDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginTop: spacing.sm },
  jobSalary: { fontSize: 13, fontWeight: '600', color: colors.success, marginTop: spacing.sm },
});