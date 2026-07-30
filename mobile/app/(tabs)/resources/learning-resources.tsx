import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Badge } from '../../../components/ui/Badge';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';

type ResourceType = 'All' | 'Course' | 'Tutorial' | 'Book';

interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  platform: string;
  gradient: readonly [string, string];
  icon: keyof typeof Ionicons.glyphMap;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  url?: string;
  topics: string[];
  rating: number;
}

const RESOURCES: LearningResource[] = [
  { id: '1', title: 'Complete Web Development Bootcamp', description: 'Full-stack web development from HTML to deployment with real-world projects', type: 'Course', platform: 'Udemy', gradient: colors.gradient.blue, icon: 'code-slash', duration: '60 hours', level: 'Beginner', topics: ['HTML/CSS', 'JavaScript', 'React', 'Node.js'], rating: 4.7 },
  { id: '2', title: 'Data Structures & Algorithms', description: 'Master coding interviews with comprehensive DSA coverage in Python', type: 'Course', platform: 'Coursera', gradient: colors.gradient.purple, icon: 'server', duration: '40 hours', level: 'Intermediate', topics: ['Arrays', 'Trees', 'Graphs', 'DP'], rating: 4.8 },
  { id: '3', title: 'System Design Interview Guide', description: 'Learn to design scalable systems like a senior engineer', type: 'Tutorial', platform: 'GitHub', gradient: colors.gradient.teal, icon: 'layers', duration: '15 hours', level: 'Advanced', topics: ['Scalability', 'Microservices', 'Databases', 'Caching'], rating: 4.6 },
  { id: '4', title: 'Cracking the Coding Interview', description: 'The definitive guide to acing FAANG and top-tier tech interviews', type: 'Book', platform: 'Book', gradient: colors.gradient.coral, icon: 'book', duration: '800 pages', level: 'Intermediate', topics: ['Algorithms', 'Coding', 'Behavioral', 'Math'], rating: 4.9 },
  { id: '5', title: 'Machine Learning A-Z', description: 'Hands-on machine learning with Python from basics to advanced models', type: 'Course', platform: 'Udemy', gradient: colors.gradient.sunset, icon: 'stats-chart', duration: '45 hours', level: 'Intermediate', topics: ['ML Algorithms', 'Python', 'TensorFlow', 'NLP'], rating: 4.6 },
  { id: '6', title: 'Clean Code by Robert C. Martin', description: 'Essential principles for writing maintainable, readable, and professional code', type: 'Book', platform: 'Book', gradient: colors.gradient.indigo, icon: 'book', duration: '464 pages', level: 'Beginner', topics: ['Code Quality', 'Refactoring', 'Best Practices', 'TDD'], rating: 4.8 },
  { id: '7', title: 'AWS Certified Solutions Architect', description: 'Complete preparation for the AWS SAA-C03 certification exam', type: 'Course', platform: 'A Cloud Guru', gradient: colors.gradient.success, icon: 'cloud', duration: '35 hours', level: 'Advanced', topics: ['AWS Services', 'Architecture', 'Security', 'Cost'], rating: 4.7 },
  { id: '8', title: 'React Native Practical Guide', description: 'Build cross-platform mobile apps with React Native and Expo', type: 'Tutorial', platform: 'Medium', gradient: colors.gradient.aurora, icon: 'phone-portrait', duration: '10 hours', level: 'Intermediate', topics: ['React Native', 'Expo', 'Navigation', 'State'], rating: 4.5 },
  { id: '9', title: 'Designing Data-Intensive Applications', description: 'Deep dive into distributed systems, databases, and data processing', type: 'Book', platform: 'Book', gradient: colors.gradient.nebula, icon: 'book', duration: '616 pages', level: 'Advanced', topics: ['Distributed Systems', 'Databases', 'Streaming', 'Consistency'], rating: 4.9 },
  { id: '10', title: 'JavaScript Algorithms & Data Structures', description: 'FreeCodeCamp\'s comprehensive JavaScript curriculum with certifications', type: 'Tutorial', platform: 'FreeCodeCamp', gradient: colors.gradient.warning, icon: 'logo-javascript', duration: '300 hours', level: 'Beginner', topics: ['JavaScript', 'DSA', 'Projects', 'Certification'], rating: 4.7 },
  { id: '11', title: 'Digital Marketing Specialization', description: 'Master SEO, SEM, social media marketing, and analytics', type: 'Course', platform: 'Google Digital Garage', gradient: colors.gradient.primary, icon: 'megaphone', duration: '25 hours', level: 'Beginner', topics: ['SEO', 'SEM', 'Social Media', 'Analytics'], rating: 4.5 },
  { id: '12', title: 'The Pragmatic Programmer', description: 'Timeless tips for becoming a better, more effective software developer', type: 'Book', platform: 'Book', gradient: colors.gradient.midnight, icon: 'book', duration: '352 pages', level: 'Intermediate', topics: ['Career', 'Craftsmanship', 'Tools', 'Mindset'], rating: 4.7 },
];

const TYPE_FILTERS: ResourceType[] = ['All', 'Course', 'Tutorial', 'Book'];

const LEVEL_COLORS = { Beginner: colors.success, Intermediate: colors.warning, Advanced: colors.error } as const;

function ResourceCard({ item, index }: { item: LearningResource; index: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(60 + index * 50).springify().damping(16)}>
      <TouchableOpacity activeOpacity={0.85} onPress={() => item.url && Linking.openURL(item.url)}>
        <BlurView intensity={50} tint="light" style={styles.resourceCard}>
          <View style={styles.resourceTop}>
            <LinearGradient colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.resourceIcon}>
              <Ionicons name={item.icon} size={22} color="#FFFFFF" />
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.resourceTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.resourcePlatform}>{item.platform}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
          <Text style={styles.resourceDesc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.resourceMeta}>
            <Badge label={item.type} variant={item.type === 'Course' ? 'primary' : item.type === 'Tutorial' ? 'info' : 'warning'} size="sm" />
            <Badge label={item.duration} variant="default" size="sm" icon="time-outline" />
            <Badge label={item.level} variant={item.level === 'Beginner' ? 'success' : item.level === 'Intermediate' ? 'warning' : 'error'} size="sm" />
          </View>
          <View style={styles.topicRow}>
            {item.topics.map(t => (
              <View key={t} style={styles.topicChip}>
                <Text style={styles.topicText}>{t}</Text>
              </View>
            ))}
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LearningResourcesScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [typeFilter, setTypeFilter] = useState<ResourceType>('All');

  const filtered = useMemo(() => {
    if (typeFilter === 'All') return RESOURCES;
    return RESOURCES.filter(r => r.type === typeFilter);
  }, [typeFilter]);

  const counts = useMemo(() => ({
    all: RESOURCES.length,
    courses: RESOURCES.filter(r => r.type === 'Course').length,
    tutorials: RESOURCES.filter(r => r.type === 'Tutorial').length,
    books: RESOURCES.filter(r => r.type === 'Book').length,
  }), []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(50).springify().damping(14)}>
          <Text style={styles.title}>Learning Resources</Text>
          <Text style={styles.subtitle}>Courses, tutorials, and books to level up your skills</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).springify().damping(14)}>
          <GlassCard style={styles.statsCard} glowColor={colors.primary}>
            <View style={styles.statsRow}>
              <TouchableOpacity style={[styles.statItem, typeFilter === 'All' && styles.statItemActive]} onPress={() => setTypeFilter('All')}>
                <Text style={[styles.statNumber, typeFilter === 'All' && styles.statNumberActive]}>{counts.all}</Text>
                <Text style={styles.statLabel}>All</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity style={[styles.statItem, typeFilter === 'Course' && styles.statItemActive]} onPress={() => setTypeFilter('Course')}>
                <Text style={[styles.statNumber, typeFilter === 'Course' && styles.statNumberActive]}>{counts.courses}</Text>
                <Text style={styles.statLabel}>Courses</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity style={[styles.statItem, typeFilter === 'Tutorial' && styles.statItemActive]} onPress={() => setTypeFilter('Tutorial')}>
                <Text style={[styles.statNumber, typeFilter === 'Tutorial' && styles.statNumberActive]}>{counts.tutorials}</Text>
                <Text style={styles.statLabel}>Tutorials</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity style={[styles.statItem, typeFilter === 'Book' && styles.statItemActive]} onPress={() => setTypeFilter('Book')}>
                <Text style={[styles.statNumber, typeFilter === 'Book' && styles.statNumberActive]}>{counts.books}</Text>
                <Text style={styles.statLabel}>Books</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>

        <View style={{ gap: spacing.sm }}>
          {filtered.map((r, i) => (
            <ResourceCard key={r.id} item={r} index={i} />
          ))}
        </View>

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No resources found</Text>
            <Text style={styles.emptyDesc}>Try a different category</Text>
          </View>
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
  statsCard: { marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: spacing.sm },
  statItem: { alignItems: 'center', padding: spacing.sm, borderRadius: borderRadius.md },
  statItemActive: { backgroundColor: colors.primaryBg },
  statNumber: { fontSize: 20, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  statNumberActive: { color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: colors.borderLight },
  resourceCard: { borderRadius: borderRadius.xl, overflow: 'hidden', padding: spacing.md, ...shadow.sm },
  resourceTop: { flexDirection: 'row', alignItems: 'center' },
  resourceIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  resourceTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  resourcePlatform: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.full },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#D97706' },
  resourceDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 16, marginTop: spacing.sm },
  resourceMeta: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm, flexWrap: 'wrap' },
  topicRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm, flexWrap: 'wrap' },
  topicChip: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: colors.surfaceLight, borderRadius: borderRadius.sm },
  topicText: { fontSize: 10, fontWeight: '500', color: colors.textSecondary },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  emptyDesc: { fontSize: 14, color: colors.textMuted },
});
