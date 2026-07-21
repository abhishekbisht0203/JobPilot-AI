import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../lib/theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loader } from '../../components/ui/Loader';
import { applicationsApi } from '../../lib/api';
import { Application } from '../../types';
import { formatDate } from '../../lib/helpers';

const STATUS_TABS = ['all', 'saved', 'applied', 'interviewing', 'offer', 'rejected'] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const STATUS_CONFIG: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default'; icon: keyof typeof Ionicons.glyphMap }> = {
  saved: { label: 'Saved', variant: 'info', icon: 'bookmark-outline' },
  applied: { label: 'Applied', variant: 'primary', icon: 'send-outline' },
  interviewing: { label: 'Interviewing', variant: 'warning', icon: 'chatbubbles-outline' },
  offer: { label: 'Offer', variant: 'success', icon: 'trophy-outline' },
  rejected: { label: 'Rejected', variant: 'error', icon: 'close-circle-outline' },
};

export default function ApplicationsScreen() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [stats, setStats] = useState<any>({});

  const fetchApplications = async () => {
    try {
      const res = await applicationsApi.list();
      setApplications(res.data.data || []);
    } catch (err) {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await applicationsApi.getStats();
      setStats(res.data.data || {});
    } catch (err) {}
  };

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const filtered = activeTab === 'all'
    ? applications
    : applications.filter((a) => a.status === activeTab);

  const renderApp = ({ item }: { item: Application }) => {
    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.saved;
    return (
      <Card style={styles.appCard}>
        <View style={styles.appHeader}>
          <View style={styles.appInfo}>
            <Text style={styles.appTitle}>{item.job?.title || 'Unknown Position'}</Text>
            <Text style={styles.appCompany}>{item.job?.company || 'Unknown Company'}</Text>
          </View>
          <Badge label={config.label} variant={config.variant} size="sm" />
        </View>
        <View style={styles.appMeta}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.appMetaText}>Applied {item.applied_at ? formatDate(item.applied_at) : '\u2014'}</Text>
        </View>
        {item.notes && <Text style={styles.appNotes}>{item.notes}</Text>}
        {item.follow_up_at && (
          <View style={styles.followUp}>
            <Ionicons name="alarm-outline" size={14} color={colors.warning} />
            <Text style={styles.followUpText}>Follow up: {formatDate(item.follow_up_at)}</Text>
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Applications</Text>
        <Text style={styles.subtitle}>{applications.length} total</Text>
      </View>

      <View style={styles.statsRow}>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <View key={key} style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors[config.variant === 'default' ? 'text' : config.variant] }]}>
              {stats[key] || 0}
            </Text>
            <Text style={styles.statLabel}>{config.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          data={STATUS_TABS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tab, activeTab === item && styles.tabActive]}
              onPress={() => setActiveTab(item)}
            >
              <Text style={[styles.tabText, activeTab === item && styles.tabTextActive]}>
                {item === 'all' ? 'All' : STATUS_CONFIG[item].label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        renderItem={renderApp}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchApplications(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          loading ? <Loader /> : (
            <EmptyState
              icon="briefcase-outline"
              title="No applications yet"
              message="Start applying to jobs and track them here."
              actionLabel="Browse Jobs"
              onAction={() => {}}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: spacing.xs },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  tabsContainer: { marginTop: spacing.md },
  tabsContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  tabTextActive: { color: colors.white },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  appCard: { marginBottom: spacing.md },
  appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appInfo: { flex: 1, marginRight: spacing.sm },
  appTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  appCompany: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  appMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  appMetaText: { color: colors.textMuted, fontSize: 12 },
  appNotes: { color: colors.textSecondary, fontSize: 13, marginTop: spacing.sm, lineHeight: 18 },
  followUp: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  followUpText: { color: colors.warning, fontSize: 12 },
});
