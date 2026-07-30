import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Badge } from '../../../components/ui/Badge';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { timeAgo } from '../../../lib/helpers';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  readTime: string;
  date: string;
  tags: string[];
  gradient: readonly [string, string];
}

const BLOG_POSTS: BlogPost[] = [
  { id: '1', title: '10 Ways to Optimize Your Resume for ATS in 2026', excerpt: 'Applicant Tracking Systems filter out 75% of resumes. Learn how to craft an ATS-friendly resume that gets you past the bots and into human hands.', author: 'Sarah Chen', authorRole: 'HR Tech Specialist', readTime: '8 min read', date: '2026-07-28', tags: ['Resume', 'ATS', 'Career Tips'], gradient: colors.gradient.blue },
  { id: '2', title: 'The Rise of AI in Recruitment: What Job Seekers Need to Know', excerpt: 'AI is transforming how companies hire. Understand the algorithms, tools, and strategies to work with AI recruiters rather than against them.', author: 'Marcus Johnson', authorRole: 'AI Recruitment Analyst', readTime: '10 min read', date: '2026-07-25', tags: ['AI', 'Recruitment', 'Trends'], gradient: colors.gradient.purple },
  { id: '3', title: 'Mastering the Behavioral Interview: STAR Method Deep Dive', excerpt: 'Situation, Task, Action, Result. Master this framework to ace behavioral questions and land offers at top companies.', author: 'Emily Rodriguez', authorRole: 'Career Coach', readTime: '6 min read', date: '2026-07-22', tags: ['Interview', 'Behavioral', 'Preparation'], gradient: colors.gradient.coral },
  { id: '4', title: 'Networking in the Digital Age: Building Meaningful Connections', excerpt: 'Forget cold DMs. Learn modern networking strategies that actually work, from virtual coffee chats to LinkedIn engagement tactics.', author: 'David Park', authorRole: 'Networking Expert', readTime: '7 min read', date: '2026-07-19', tags: ['Networking', 'LinkedIn', 'Career Growth'], gradient: colors.gradient.teal },
  { id: '5', title: 'Salary Negotiation: Proven Tactics for 2026 Job Market', excerpt: 'Don\'t leave money on the table. Research-backed negotiation strategies that can increase your offer by 10-25%.', author: 'Aisha Patel', authorRole: 'Compensation Analyst', readTime: '9 min read', date: '2026-07-16', tags: ['Salary', 'Negotiation', 'Career'], gradient: colors.gradient.sunset },
  { id: '6', title: 'Remote vs Hybrid vs On-site: Choosing the Right Work Model', excerpt: 'The work landscape has changed. Evaluate which work model aligns with your lifestyle, productivity style, and career ambitions.', author: 'James Wilson', authorRole: 'Workplace Strategist', readTime: '5 min read', date: '2026-07-13', tags: ['Remote Work', 'Hybrid', 'Workplace'], gradient: colors.gradient.indigo },
  { id: '7', title: 'Building a Personal Brand That Opens Doors', excerpt: 'Your online presence is your new resume. Learn to craft a compelling personal brand that attracts recruiters and opportunities.', author: 'Lisa Thompson', authorRole: 'Branding Consultant', readTime: '11 min read', date: '2026-07-10', tags: ['Personal Brand', 'LinkedIn', 'Career'], gradient: colors.gradient.success },
  { id: '8', title: 'Upskilling for the Future: Top Skills Employers Want in 2026', excerpt: 'The job market evolves fast. Discover the most in-demand skills across industries and how to acquire them efficiently.', author: 'Dr. Kevin Lee', authorRole: 'Workforce Analyst', readTime: '8 min read', date: '2026-07-07', tags: ['Skills', 'Learning', 'Career Growth'], gradient: colors.gradient.aurora },
];

const ALL_TAGS = Array.from(new Set(BLOG_POSTS.flatMap(p => p.tags))).sort();

export default function BlogsScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      if (search && !post.title.toLowerCase().includes(search.toLowerCase()) && !post.excerpt.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (selectedTag && !post.tags.includes(selectedTag)) {
        return false;
      }
      return true;
    });
  }, [search, selectedTag]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1200));
    setRefreshing(false);
  }, []);

  const renderBlogCard = useCallback(({ item, index }: { item: BlogPost; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(16)}>
      <TouchableOpacity activeOpacity={0.85}>
        <BlurView intensity={50} tint="light" style={styles.blogCard}>
          <LinearGradient colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.blogAccent} />
          <View style={styles.blogContent}>
            <View style={styles.blogMeta}>
              <Badge label={item.tags[0]} variant="primary" size="sm" />
              <Text style={styles.blogReadTime}>{item.readTime}</Text>
            </View>
            <Text style={styles.blogTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.blogExcerpt} numberOfLines={2}>{item.excerpt}</Text>
            <View style={styles.blogFooter}>
              <View style={styles.authorRow}>
                <LinearGradient colors={item.gradient} style={styles.authorAvatar}>
                  <Text style={styles.authorInitial}>{item.author[0]}</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.authorName} numberOfLines={1}>{item.author}</Text>
                  <Text style={styles.authorRole} numberOfLines={1}>{item.authorRole}</Text>
                </View>
              </View>
              <Text style={styles.dateText}>{timeAgo(item.date)}</Text>
            </View>
            <View style={styles.tagRow}>
              {item.tags.slice(1).map(tag => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  ), []);

  const renderHeader = () => (
    <View style={{ paddingBottom: spacing.md }}>
      <Animated.View entering={FadeInUp.delay(50).springify().damping(14)}>
        <Text style={styles.title}>Blogs</Text>
        <Text style={styles.subtitle}>Career advice and industry insights</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(100).springify().damping(14)}>
        <BlurView intensity={60} tint="light" style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search blog posts..."
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

      <Animated.View entering={FadeInUp.delay(150).springify().damping(14)}>
        <FlatList
          horizontal
          data={ALL_TAGS}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedTag(selectedTag === item ? null : item)}
              activeOpacity={0.7}
            >
              <BlurView intensity={selectedTag === item ? 70 : 40} tint="light" style={[styles.filterChip, selectedTag === item && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, selectedTag === item && styles.filterChipTextActive]}>
                  {item}
                </Text>
              </BlurView>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.sm }}
        />
      </Animated.View>

      <Text style={styles.sectionCount}>{filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredPosts}
        renderItem={renderBlogCard}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[styles.list, { paddingHorizontal: horizontalPadding, paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="newspaper-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No articles found</Text>
            <Text style={styles.emptyDesc}>Try adjusting your search or filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingBottom: getTabListBottomPadding() + spacing.md },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.sm },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl, height: 48, marginBottom: spacing.xs, gap: spacing.sm,
    overflow: 'hidden',
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  filterChipActive: { backgroundColor: colors.primaryBg },
  filterChipText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  filterChipTextActive: { color: colors.primary, fontWeight: '600' },
  sectionCount: { fontSize: 13, color: colors.textMuted, fontWeight: '500', marginTop: spacing.xs },
  blogCard: {
    flexDirection: 'row', borderRadius: borderRadius.xl, overflow: 'hidden',
    marginBottom: spacing.sm, ...shadow.md,
  },
  blogAccent: { width: 4 },
  blogContent: { flex: 1, padding: spacing.md },
  blogMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  blogReadTime: { fontSize: 12, color: colors.textMuted },
  blogTitle: { fontSize: 17, fontWeight: '700', color: colors.text, lineHeight: 22 },
  blogExcerpt: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginTop: spacing.xs },
  blogFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  authorAvatar: {
    width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
  },
  authorInitial: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  authorName: { fontSize: 13, fontWeight: '600', color: colors.text },
  authorRole: { fontSize: 11, color: colors.textMuted },
  dateText: { fontSize: 11, color: colors.textMuted },
  tagRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm, flexWrap: 'wrap' },
  tagChip: {
    paddingHorizontal: 8, paddingVertical: 3, backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
  },
  tagChipText: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  emptyDesc: { fontSize: 14, color: colors.textMuted },
});
