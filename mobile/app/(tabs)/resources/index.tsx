import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';

interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
  route: string;
  count: number;
}

const CATEGORIES: ResourceCategory[] = [
  { id: 'blogs', name: 'Blogs', description: 'Career advice and insights', icon: 'newspaper', gradient: colors.gradient.blue, route: '/(tabs)/resources/blogs', count: 24 },
  { id: 'career-guides', name: 'Career Guides', description: 'Step-by-step career paths', icon: 'compass', gradient: colors.gradient.purple, route: '/(tabs)/resources/career-guides', count: 18 },
  { id: 'resume-templates', name: 'Resume Templates', description: 'ATS-optimized templates', icon: 'document-text', gradient: colors.gradient.teal, route: '/(tabs)/resources/resume-templates', count: 12 },
  { id: 'interview-questions', name: 'Interview Questions', description: 'Prepare with confidence', icon: 'chatbubbles', gradient: colors.gradient.coral, route: '/(tabs)/resources/interview-questions', count: 85 },
  { id: 'learning', name: 'Learning Resources', description: 'Courses, books & tutorials', icon: 'school', gradient: colors.gradient.sunset, route: '/(tabs)/resources/learning-resources', count: 36 },
  { id: 'help-center', name: 'Help Center', description: 'Get support and answers', icon: 'help-buoy', gradient: colors.gradient.indigo, route: '/(tabs)/resources/help-center', count: 42 },
  { id: 'faq', name: 'FAQ', description: 'Frequently asked questions', icon: 'help-circle', gradient: colors.gradient.success, route: '/(tabs)/resources/faq', count: 28 },
  { id: 'articles', name: 'Articles', description: 'Industry trends & tips', icon: 'book', gradient: colors.gradient.aurora, route: '/(tabs)/resources/blogs', count: 31 },
];

function CategoryCard({ item, index, search }: { item: ResourceCategory; index: number; search: string }) {
  if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.description.toLowerCase().includes(search.toLowerCase())) {
    return null;
  }

  return (
    <Animated.View entering={FadeInDown.delay(80 + index * 60).springify().damping(16)}>
      <TouchableOpacity
        onPress={() => router.push(item.route as any)}
        activeOpacity={0.85}
      >
        <BlurView intensity={55} tint="light" style={styles.categoryCard}>
          <LinearGradient colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.categoryIcon}>
            <Ionicons name={item.icon} size={24} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.categoryDesc} numberOfLines={2}>{item.description}</Text>
          </View>
          <View style={styles.categoryMeta}>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{item.count}</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={{ marginTop: 4 }} />
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ResourcesScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [search, setSearch] = useState('');

  const visibleCount = useMemo(() => {
    if (!search) return CATEGORIES.length;
    return CATEGORIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())).length;
  }, [search]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.delay(50).springify().damping(14)}>
          <Text style={styles.title}>Resources</Text>
          <Text style={styles.subtitle}>Everything you need to succeed in your career</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).springify().damping(14)}>
          <BlurView intensity={60} tint="light" style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search resources..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </BlurView>
        </Animated.View>

        <GlassCard style={styles.statsBanner} glowColor={colors.primary}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{CATEGORIES.length}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{CATEGORIES.reduce((s, c) => s + c.count, 0)}+</Text>
              <Text style={styles.statLabel}>Resources</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>Free</Text>
              <Text style={styles.statLabel}>Access</Text>
            </View>
          </View>
        </GlassCard>

        <View style={styles.grid}>
          {CATEGORIES.map((cat, index) => (
            <CategoryCard key={cat.id} item={cat} index={index} search={search} />
          ))}
        </View>

        {search && visibleCount === 0 && (
          <Animated.View entering={FadeInUp.springify()} style={styles.noResults}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={styles.noResultsTitle}>No resources found</Text>
            <Text style={styles.noResultsDesc}>Try a different search term</Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding() + spacing.md },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.md },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl, height: 48, marginBottom: spacing.md, gap: spacing.sm,
    overflow: 'hidden',
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15 },
  statsBanner: { marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: spacing.sm },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '500', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.borderLight },
  grid: { gap: spacing.sm },
  categoryCard: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: borderRadius.xl, overflow: 'hidden', gap: spacing.sm,
  },
  categoryIcon: {
    width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: 16, fontWeight: '600', color: colors.text },
  categoryDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 16, marginTop: 2 },
  categoryMeta: { alignItems: 'center', gap: 2 },
  countBadge: {
    backgroundColor: colors.primaryBg, paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  countText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  noResults: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm },
  noResultsTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  noResultsDesc: { fontSize: 14, color: colors.textMuted },
});
