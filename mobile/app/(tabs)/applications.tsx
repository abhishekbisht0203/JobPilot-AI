import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown, FadeInUp, useSharedValue, withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { useResponsive } from '../../lib/responsive';
import { GlassCard } from '../../components/ui/GlassCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loader } from '../../components/ui/Loader';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { getTabListBottomPadding } from '../../components/ui/TabBarHeight';
import { applicationApi } from '../../lib/api';
import { Application } from '../../types';
import { formatDate, formatSalary, formatSalaryFromString } from '../../lib/helpers';

const STATUS_TABS = ['all', 'pending', 'accepted', 'rejected'] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  pending: { label: 'Pending', color: colors.warning, icon: 'time-outline' },
  accepted: { label: 'Accepted', color: colors.success, icon: 'checkmark-circle-outline' },
  rejected: { label: 'Rejected', color: colors.error, icon: 'close-circle-outline' },
};

const STATS_KEYS = ['pending', 'accepted', 'rejected'] as const;

function StatusPill({ tab, active, onPress }: { tab: StatusTab; active: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.94, { stiffness: 400, damping: 12 }); }}
      onPressOut={() => { scale.value = withSpring(1, { stiffness: 300, damping: 15 }); }}
      activeOpacity={1}
    >
      <Animated.View style={[{ transform: [{ scale }] }]}>
        <View style={[styles.tab, active && styles.tabActive]}>
          {tab !== 'all' && (
            <Ionicons name={STATUS_CONFIG[tab]?.icon || 'ellipse'} size={12} color={active ? colors.white : colors.textSecondary} style={{ marginRight: 4 }} />
          )}
          <Text style={[styles.tabText, active && styles.tabTextActive]}>
            {tab === 'all' ? 'All' : (STATUS_CONFIG[tab]?.label || tab)}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function ApplicationsScreen() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { horizontalPadding } = useResponsive();
  const insets = useSafeAreaInsets();

  const fetchData = useCallback(async () => {
    try {
      const res = await applicationApi.list();
      setApplications(res.data.data || []);
      setFetchError(null);
    } catch {
      setFetchError('Unable to load applications. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const filtered = activeTab === 'all'
    ? applications
    : applications.filter((a) => a.status === activeTab);

  const stats = {
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  const renderApp = ({ item, index }: { item: Application; index: number }) => {
    const jobTitle = typeof item.job === 'object' ? item.job?.title : 'Unknown Position';
    const companyName = typeof item.job === 'object'
      ? (item.job?.company)
      : 'Unknown Company';
    const jobSalaryMin = typeof item.job === 'object' ? item.job?.salary_min : undefined;
    const jobSalaryMax = typeof item.job === 'object' ? item.job?.salary_max : undefined;
    const jobCurrency = typeof item.job === 'object' ? item.job?.currency : undefined;
    const iconColors = item.status === 'rejected' ? colors.gradient.error : colors.gradient.success;

    return (
      <Animated.View entering={FadeInUp.delay(index * 60).springify().damping(14)}>
        <Card style={styles.appCard}>
          <View style={styles.appHeader}>
            <LinearGradient colors={iconColors} style={styles.appIcon}>
              <Ionicons name="document-text" size={16} color="#FFFFFF" />
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.appTitle} numberOfLines={1}>{jobTitle}</Text>
              <Text style={styles.appCompany} numberOfLines={1}>{companyName}</Text>
            </View>
            <Badge label={item.status} variant={item.status as any} size="sm" animated />
          </View>

          <View style={styles.appMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.metaText}>Applied {item.created_at ? formatDate(item.created_at) : '\u2014'}</Text>
            </View>
            {(jobSalaryMin || jobSalaryMax) && (
              <View style={styles.metaItem}>
                <Ionicons name="cash-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.metaText}>{formatSalary(jobSalaryMin, jobSalaryMax, jobCurrency)}</Text>
              </View>
            )}
          </View>
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        renderItem={renderApp}
        keyExtractor={(item: any) => item.id || item._id}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: getTabListBottomPadding(),
          paddingHorizontal: horizontalPadding,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <>
            <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
              <Text style={styles.title}>Applications</Text>
              <Text style={styles.subtitle}>
                <AnimatedCounter value={applications.length} duration={600} /> total
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
              <GlassCard style={styles.statsRow}>
                <View style={styles.statsInner}>
                  {STATS_KEYS.map((key) => {
                    const config = STATUS_CONFIG[key];
                    const count = stats[key] || 0;
                    return (
                      <View key={key} style={styles.statItem}>
                        <AnimatedCounter value={count} style={[styles.statValue, { color: config?.color || colors.textMuted }]} spring />
                        <Text style={styles.statLabel}>{config?.label || key}</Text>
                      </View>
                    );
                  })}
                </View>
              </GlassCard>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).springify().damping(14)}>
              <View style={styles.tabsContainer}>
                <FlatList
                  horizontal
                  data={STATUS_TABS}
                  keyExtractor={(item) => item}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: spacing.sm }}
                  renderItem={({ item }) => (
                    <StatusPill tab={item} active={activeTab === item} onPress={() => setActiveTab(item)} />
                  )}
                />
              </View>
            </Animated.View>
          </>
        }
        ListEmptyComponent={
          loading ? <Loader /> : fetchError ? (
            <EmptyState
              icon="cloud-offline-outline"
              title="Connection Error"
              message={fetchError}
              actionLabel="Retry"
              onAction={() => { setLoading(true); fetchData(); }}
            />
          ) : (
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
  title: { color: colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 2, marginBottom: spacing.md },
  statsRow: { padding: spacing.md, marginBottom: spacing.md },
  statsInner: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', minWidth: 48, flex: 1 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  tabsContainer: { marginBottom: spacing.md },
  tab: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, ...shadow.xs,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  tabTextActive: { color: colors.white, fontWeight: '600' },
  appCard: { marginBottom: spacing.md },
  appHeader: { flexDirection: 'row', alignItems: 'center' },
  appIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  appTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  appCompany: { color: colors.textSecondary, fontSize: 13, marginTop: 1 },
  appMeta: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { color: colors.textMuted, fontSize: 12 },
});