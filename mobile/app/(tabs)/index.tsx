import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../lib/theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { JobCardSkeleton } from '../../components/ui/Skeleton';
import { MatchScoreRingSimple } from '../../components/ui/MatchScoreRing';
import { jobsApi } from '../../lib/api';
import { useJobStore } from '../../store';
import { Job } from '../../types';
import { formatSalary, timeAgo } from '../../lib/helpers';

export default function DashboardScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { savedJobs, toggleSaveJob } = useJobStore();

  const fetchJobs = useCallback(async (pageNum: number, refresh = false) => {
    try {
      const res = await jobsApi.list({ page: pageNum, per_page: 20 });
      const newJobs = res.data.data || [];
      if (refresh) {
        setJobs(newJobs);
      } else {
        setJobs(prev => [...prev, ...newJobs]);
      }
      setHasMore(newJobs.length === 20);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(1, true);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchJobs(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchJobs(nextPage);
    }
  };

  const renderJobCard = ({ item }: { item: Job }) => {
    const isSaved = savedJobs.includes(item.id);
    return (
      <Card
        onPress={() => router.push(`/job/${item.id}`)}
        style={styles.jobCard}
      >
        <View style={styles.jobHeader}>
          <View style={styles.jobHeaderLeft}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.companyName}>{item.company}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleSaveJob(item.id)} style={styles.saveButton}>
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isSaved ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.jobMeta}>
          {item.location && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{item.location}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{formatSalary(item.salary_min, item.salary_max, item.currency)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{timeAgo(item.posted_at)}</Text>
          </View>
        </View>

        <Text style={styles.jobDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.jobFooter}>
          <View style={styles.skillsRow}>
            {item.skills?.slice(0, 3).map((skill, idx) => (
              <Badge key={idx} label={skill} variant="info" size="sm" />
            ))}
            {item.skills && item.skills.length > 3 && (
              <Text style={styles.moreSkills}>+{item.skills.length - 3}</Text>
            )}
          </View>
          <Badge
            label={item.platform}
            variant="default"
            size="sm"
          />
        </View>

        {item.match_score !== undefined && (
          <View style={styles.matchRow}>
            <MatchScoreRingSimple score={item.match_score} size={40} />
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>JobPilot</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs, companies..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterRow}>
        <Text style={styles.sectionTitle}>
          {loading ? 'Loading jobs...' : `${jobs.length} jobs found`}
        </Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="funnel-outline" size={18} color={colors.primary} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={jobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          loading ? (
            <View style={styles.skeletonContainer}>
              {[1, 2, 3, 4].map((i) => <JobCardSkeleton key={i} />)}
            </View>
          ) : (
            <EmptyState
              icon="briefcase-outline"
              title="No jobs found"
              message="We couldn't find any jobs matching your criteria."
              actionLabel="Refresh"
              onAction={onRefresh}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  greeting: { color: colors.text, fontSize: 28, fontWeight: '700' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, color: colors.text, fontSize: 16 },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: { color: colors.textSecondary, fontSize: 14 },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  filterText: { color: colors.primary, fontSize: 14, fontWeight: '500' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  jobCard: { marginBottom: spacing.md },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  jobHeaderLeft: { flex: 1, marginRight: spacing.sm },
  jobTitle: { color: colors.text, fontSize: 18, fontWeight: '600' },
  companyName: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  saveButton: { padding: spacing.xs },
  jobMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: colors.textSecondary, fontSize: 12 },
  jobDescription: { color: colors.textSecondary, fontSize: 13, marginTop: spacing.sm, lineHeight: 18 },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  skillsRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center', flex: 1, flexWrap: 'wrap' },
  moreSkills: { color: colors.textMuted, fontSize: 12, marginLeft: 2 },
  matchRow: { position: 'absolute', top: spacing.md, right: spacing.md },
  skeletonContainer: { paddingTop: spacing.md },
});
