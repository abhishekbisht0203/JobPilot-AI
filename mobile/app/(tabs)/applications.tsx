import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown, FadeInUp, useSharedValue, withSpring, withTiming, useAnimatedStyle, Easing,
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
import { applicationsApi } from '../../lib/api';
import { Application } from '../../types';
import { formatDate } from '../../lib/helpers';

const STATUS_TABS = ['all', 'saved', 'applied', 'interviewing', 'offer', 'rejected'] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  saved: { label: 'Saved', color: colors.info, icon: 'bookmark-outline' },
  applied: { label: 'Applied', color: colors.primary, icon: 'send-outline' },
  interviewing: { label: 'Interviewing', color: colors.warning, icon: 'chatbubbles-outline' },
  offer: { label: 'Offer', color: colors.success, icon: 'trophy-outline' },
  rejected: { label: 'Rejected', color: colors.error, icon: 'close-circle-outline' },
};

const STATS_KEYS = ['saved', 'applied', 'interviewing', 'offer', 'rejected'] as const;

function StatusPill({ tab, active, onPress }: { tab: StatusTab; active: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.94, { stiffness: 400, damping: 12 }); }}
      onPressOut={() => { scale.value = withSpring(1, { stiffness: 300, damping: 15 }); }}
      activeOpacity={1}
    >
      <Animated.View style={[{ transform: [{ scale: scale.value }] }]}>
        <View style={[styles.tab, active && styles.tabActive]}>
          {tab !== 'all' && (
            <Ionicons name={STATUS_CONFIG[tab].icon} size={12} color={active ? colors.white : STATUS_CONFIG[tab].color} style={{ marginRight: 4 }} />
          )}
          <Text style={[styles.tabText, active && styles.tabTextActive]}>
            {tab === 'all' ? 'All' : STATUS_CONFIG[tab].label}
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
  const [stats, setStats] = useState<Record<string, number>>({});
  const { horizontalPadding } = useResponsive();
  const insets = useSafeAreaInsets();

  const fetchData = useCallback(async () => {
    try {
      const [appsRes, statsRes] = await Promise.all([
        applicationsApi.list(),
        applicationsApi.getStats(),
      ]);
      setApplications(appsRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const filtered = activeTab === 'all'
    ? applications
    : applications.filter((a) => a.status === activeTab);

  const renderApp = ({ item, index }: { item: Application; index: number }) => {
    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.saved;

    return (
      <Animated.View entering={FadeInUp.delay(index * 60).springify().damping(14)}>
        <Card style={styles.appCard} glowColor={config.color}>
          <View style={styles.appHeader}>
            <LinearGradient
              colors={item.status === 'offer' ? colors.gradient.success :
                      item.status === 'rejected' ? colors.gradient.error :
                      colors.gradient.blue}
              style={styles.appIcon}
            >
              <Ionicons name={config.icon} size={16} color="#FFFFFF" />
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.appTitle} numberOfLines={1}>{item.job?.title || 'Unknown Position'}</Text>
              <Text style={styles.appCompany} numberOfLines={1}>{item.job?.company || 'Unknown Company'}</Text>
            </View>
            <Badge label={config.label} variant={item.status as any} size="sm" animated />
          </View>

          <View style={styles.appMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.metaText}>Applied {item.applied_at ? formatDate(item.applied_at) : '\u2014'}</Text>
            </View>
            {item.job?.salary_min && (
              <View style={styles.metaItem}>
                <Ionicons name="cash-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  {item.job.currency || '$'}{item.job.salary_min}K{item.job.salary_max ? ` - ${item.job.currency || '$'}${item.job.salary_max}K` : ''}
                </Text>
              </View>
            )}
          </View>

          {item.notes && (
            <Text style={styles.appNotes} numberOfLines={2}>{item.notes}</Text>
          )}

          {item.follow_up_at && (
            <View style={styles.followUp}>
              <Ionicons name="alarm-outline" size={13} color={colors.warning} />
              <Text style={styles.followUpText}>Follow up: {formatDate(item.follow_up_at)}</Text>
            </View>
          )}

          {item.job?.skills && item.job.skills.length > 0 && (
            <View style={styles.skillsRow}>
              {item.job.skills.slice(0, 3).map((skill, idx) => (
                <View key={idx} style={styles.skillChip}>
                  <Text style={styles.skillChipText}>{skill}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        renderItem={renderApp}
        keyExtractor={(item) => item.id}
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
                        <AnimatedCounter value={count} style={[styles.statValue, { color: config.color }]} spring />
                        <Text style={styles.statLabel}>{config.label}</Text>
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
  appNotes: { color: colors.textSecondary, fontSize: 13, marginTop: spacing.sm, lineHeight: 18 },
  followUp: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm,
    paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  followUpText: { color: colors.warning, fontSize: 12 },
  skillsRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm, flexWrap: 'wrap' },
  skillChip: {
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: colors.primaryBg, borderRadius: borderRadius.sm,
  },
  skillChipText: { fontSize: 11, fontWeight: '500', color: colors.primary },
});
