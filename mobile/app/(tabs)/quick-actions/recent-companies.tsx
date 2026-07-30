import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loader } from '../../../components/ui/Loader';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { jobApi } from '../../../lib/api';
import { getInitials } from '../../../lib/helpers';

interface CompanyEntry {
  name: string;
  industry?: string;
  openJobsCount: number;
  lastViewed: string;
}

function CompanyCard({ item, index }: { item: CompanyEntry; index: number }) {
  const colorIndex = index % 6;
  const gradientOptions = [
    colors.gradient.blue,
    colors.gradient.purple,
    colors.gradient.teal,
    colors.gradient.sunset,
    colors.gradient.coral,
    colors.gradient.indigo,
  ];
  const gradient = gradientOptions[colorIndex];

  return (
    <Animated.View entering={FadeInUp.delay(index * 60).springify().damping(14)} layout={Layout.springify()}>
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/(tabs)/companies/[id]', params: { id: encodeURIComponent(item.name) } })}
        activeOpacity={0.7}
      >
        <GlassCard style={styles.companyCard} glowColor={gradient[0]}>
          <View style={styles.companyRow}>
            <LinearGradient colors={gradient} style={styles.companyIcon}>
              <Text style={styles.companyInitials}>{getInitials(item.name)}</Text>
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.companyName} numberOfLines={1}>{item.name}</Text>
              {item.industry && (
                <Text style={styles.companyIndustry} numberOfLines={1}>{item.industry}</Text>
              )}
            </View>
            <View style={styles.jobsCount}>
              <Badge label={`${item.openJobsCount} open`} variant="primary" size="sm" />
            </View>
          </View>
          <View style={styles.companyFooter}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={styles.companyFooterText}>
              Viewed {new Date(item.lastViewed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RecentCompaniesScreen() {
  const [companies, setCompanies] = useState<CompanyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { horizontalPadding } = useResponsive();
  const insets = useSafeAreaInsets();

  const fetchData = useCallback(async () => {
    try {
      const res = await jobApi.list({ page: 1, per_page: 50 });
      const jobs = res.data.data || [];

      const companyMap = new Map<string, { count: number; industry?: string }>();
      jobs.forEach((job: any) => {
        if (!job.company) return;
        const existing = companyMap.get(job.company);
        if (existing) {
          existing.count += 1;
        } else {
          companyMap.set(job.company, { count: 1, industry: job.industry });
        }
      });

      const sorted = Array.from(companyMap.entries())
        .map(([name, data]) => ({
          name,
          industry: data.industry,
          openJobsCount: data.count,
          lastViewed: new Date().toISOString(),
        }))
        .sort((a, b) => b.openJobsCount - a.openJobsCount)
        .slice(0, 20);

      setCompanies(sorted);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={companies}
        renderItem={({ item, index }) => <CompanyCard item={item} index={index} />}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: getTabListBottomPadding() + spacing.md,
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
          <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color={colors.text} />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.title}>Companies</Text>
                <Text style={styles.subtitle}>{companies.length} companies with open positions</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/browse-companies')} style={styles.browseBtn}>
                <Ionicons name="grid-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        }
        ListEmptyComponent={
          loading ? <Loader /> : (
            <EmptyState
              icon="business-outline"
              title="No companies yet"
              message="Companies with job openings will appear here."
              actionLabel="Browse Companies"
              onAction={() => router.push('/(tabs)/browse-companies')}
            />
          )
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
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
  browseBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...shadow.xs },
  companyCard: { padding: spacing.md },
  companyRow: { flexDirection: 'row', alignItems: 'center' },
  companyIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  companyInitials: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  companyName: { fontSize: 16, fontWeight: '600', color: colors.text },
  companyIndustry: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  jobsCount: { marginLeft: spacing.sm },
  companyFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight },
  companyFooterText: { fontSize: 11, color: colors.textMuted },
});