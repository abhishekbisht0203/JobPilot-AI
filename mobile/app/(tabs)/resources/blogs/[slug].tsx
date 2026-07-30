import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../../lib/theme';
import { GlassCard } from '../../../../components/ui/GlassCard';
import { Badge } from '../../../../components/ui/Badge';
import { Loader } from '../../../../components/ui/Loader';
import { blogsApi } from '../../../../lib/api';
import { timeAgo } from '../../../../lib/helpers';

export default function BlogDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    blogsApi.get(slug)
      .then((res) => setPost(res.data.data || res.data))
      .catch(() => setError('Failed to load blog post'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = async () => {
    if (!post) return;
    await Share.share({ message: `${post.title}\n\n${post.excerpt || ''}` });
  };

  if (loading) return <Loader fullScreen />;
  if (error || !post) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
        <Text style={{ color: colors.text, fontSize: 16, marginTop: 16 }}>{error || 'Post not found'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInDown.delay(50).springify().damping(14)}>
          <LinearGradient
            colors={[post.gradient?.[0] || '#3B82F6', post.gradient?.[1] || '#6366F1']}
            style={styles.heroBanner}
          >
            <View style={styles.heroOverlay}>
              <Text style={styles.heroCategory}>{post.category || 'Article'}</Text>
              <Text style={styles.heroTitle}>{post.title}</Text>
              <View style={styles.heroMeta}>
                {post.tags?.slice(0, 3).map((t: string, i: number) => (
                  <Badge key={i} label={t} variant="default" size="sm" />
                ))}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.content}>
          <GlassCard style={styles.authorCard}>
            <LinearGradient colors={colors.gradient.primary} style={styles.authorAvatar}>
              <Text style={styles.authorInitials}>{(post.author || 'A')[0]}</Text>
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.authorName}>{post.author || 'Author'}</Text>
              <Text style={styles.authorRole}>{post.authorRole || ''}</Text>
              <Text style={styles.dateText}>{post.created_at ? timeAgo(post.created_at) : post.date || ''} · {post.readTime || ''}</Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.bodyCard}>
            <Text style={styles.bodyText}>{post.content || post.excerpt || post.description || ''}</Text>
          </GlassCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...shadow.sm },
  shareBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...shadow.sm },
  heroBanner: { marginHorizontal: spacing.md, borderRadius: borderRadius.xl, overflow: 'hidden', minHeight: 200 },
  heroOverlay: { padding: spacing.lg, backgroundColor: 'rgba(0,0,0,0.2)', gap: spacing.sm },
  heroCategory: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  heroTitle: { color: '#FFF', fontSize: 22, fontWeight: '700', lineHeight: 28 },
  heroMeta: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  content: { padding: spacing.md, gap: spacing.md },
  authorCard: { padding: spacing.md, flexDirection: 'row', alignItems: 'center' },
  authorAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  authorInitials: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  authorName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  authorRole: { color: colors.textSecondary, fontSize: 13 },
  dateText: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  bodyCard: { padding: spacing.lg },
  bodyText: { color: colors.textSecondary, fontSize: 15, lineHeight: 24 },
});
