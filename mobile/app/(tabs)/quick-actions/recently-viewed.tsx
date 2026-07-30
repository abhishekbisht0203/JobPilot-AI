import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { jobsApi } from '../../../lib/api';
import { Job } from '../../../types';
import { formatSalary, timeAgo } from '../../../lib/helpers';

interface ViewedJobEntry {
  id: string;
  viewedAt: string;
}

export function useRecentlyViewed() {
  const [viewedIds, setViewedIds] = useState<ViewedJobEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('recently-viewed');
      if (raw) setViewedIds(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (updated: ViewedJobEntry[]) => {
    setViewedIds(updated);
    try { localStorage.setItem('recently-viewed', JSON.stringify(updated)); } catch {}
  };

  const addViewed = (jobId: string) => {
    const updated = [
      { id: jobId, viewedAt: new Date().toISOString() },
      ...viewedIds.filter((v) => v.id !== jobId),
    ].slice(0, 30);
    persist(updated);
  };

  const clearAll = () => persist([]);

  const removeViewed = (jobId: string) => persist(viewedIds.filter((v) => v.id !== jobId));

  return { viewedIds, addViewed, clearAll, removeViewed };
}

export default function RecentlyViewedScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { viewedIds, clearAll, removeViewed } = useRecentlyViewed();
  const { horizontalPadding } = useResponsive();
  const insets = useSafeAreaInsets();

  const fetchJobs = useCallback(async () => {
    try {
      const savedIds = viewedIds.map((v) => v.id);
      if (savedIds.length === 0) { setJobs([]); return; }
      const res = await jobsApi.list({ page: 1, per_page: 100 });
      const allJobs: Job[] = res.data.data || [];
      const filtered = allJobs
        .filter((j) => savedIds.includes(j.id))
        .map((j) => {
          const entry = viewedIds.find((v) => v.id === j.id);
          return { ...j, _viewedAt: entry?.viewedAt || j.created_at };
        })
        .sort((a, b) => new Date(b._viewedAt).getTime() - new Date(a._viewedAt).getTime());
      setJobs(filtered as any);
    } catch {} finally {
      setLoading(false);
    }
  }, [viewedIds.length]);

  useEffect(() => { fetchJobs(); }, [viewedIds.length]);

  const handleClearAll = () => {
    if (jobs.length === 0) return;
    Alert.alert('Clear History', 'Are you sure you want to clear your recently viewed jobs?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => { clearAll(); setJobs([]); } },
    ]);
  };

  const renderJob = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 60).springify().damping(14)} layout={Layout.springify()}>
      <Card onPress={() => router.push(`/job/${item.id}`)} style={styles.jobCard} glowColor={colors.primary}>
        <View style={styles.jobHeader}>
          <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.jobIcon}>
            <Text style={styles.jobIconText}>{(item.company || 'C')[0].toUpperCase()}</Text>
          </LinearGradient>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.jobCompany} numberOfLines={1}>{item.company}</Text>
          </View>
          <TouchableOpacity onPress={() => { removeViewed(item.id); setJobs((prev) => prev.filter((j: any) => j.id !== item.id)); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.jobTags}>
          {item.match_score ? (
            <Badge label={`${item.match_score}% Match`} variant={item.match_score >= 80 ? 'success' : item.match_score >= 60 ? 'warning' : 'default'} size="sm" animated />
          ) : <Badge label="New" variant="info" size="sm" />}
          {item.location && <Badge label={item.location} variant="default" size="sm" />}
          {item._viewedAt && <Badge label={timeAgo(item._viewedAt)} variant="default" size="sm" />}
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
        data={jobs}
        renderItem={renderJob}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: getTabListBottomPadding() + spacing.md,
          paddingHorizontal: horizontalPadding,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color={colors.text} />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.title}>Recently Viewed</Text>
                <Text style={styles.subtitle}>{jobs.length} jobs</Text>
              </View>
              {jobs.length > 0 && (
                <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        }
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="time-outline"
              title="No recently viewed jobs"
              message="Jobs you view will appear here for quick access."
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
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  clearBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...shadow.xs },
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
