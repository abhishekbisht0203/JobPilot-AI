import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import { jobsApi, applicationsApi } from '../../lib/api';
import { Job } from '../../types';
import { formatSalary, timeAgo, formatDate } from '../../lib/helpers';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!id) return;
    setFetchError(null);
    jobsApi.get(id).then((res) => setJob(res.data.data || res.data)).catch(() => setFetchError('Unable to load job details.')).finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!job) return;
    setApplying(true);
    try {
      await applicationsApi.create({ job_id: job.id });
      Linking.openURL(job.url);
    } catch (err) {
      Linking.openURL(job.url);
    } finally { setApplying(false); }
  };

  if (loading) return <Loader fullScreen />;
  if (fetchError || !job) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
        <Text style={{ color: colors.text, fontSize: 16, marginTop: 16 }}>{fetchError || 'Job not found'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
          <LinearGradient colors={['#3B82F6', '#6366F1']} style={[styles.hero, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.heroContent}>
              <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']} style={styles.heroIcon}>
                <Text style={styles.heroIconText}>{(job.company || 'C')[0].toUpperCase()}</Text>
              </LinearGradient>
              <Text style={styles.heroTitle}>{job.title}</Text>
              <Text style={styles.heroCompany}>{job.company}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={[styles.content, { paddingHorizontal: spacing.lg }]}>
          <Animated.View entering={FadeInUp.delay(200).springify().damping(14)}>
            <GlassCard style={styles.metaCard}>
              <View style={styles.metaRow}>
                {job.match_score !== undefined && (
                  <View style={styles.matchBadge}>
                    <Text style={[styles.matchText, { color: job.match_score >= 80 ? colors.success : job.match_score >= 60 ? colors.warning : colors.error }]}>
                      {job.match_score}% Match
                    </Text>
                  </View>
                )}
                <Badge label={job.platform} variant="info" size="sm" />
              </View>
              <View style={styles.metaGrid}>
                {job.location && (
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.metaText}>{job.location}</Text>
                  </View>
                )}
                <View style={styles.metaItem}>
                  <Ionicons name="cash-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.metaText}>{formatSalary(job.salary_min, job.salary_max, job.currency)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.metaText}>{timeAgo(job.posted_at)}</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(250).springify().damping(14)}>
            <Text style={styles.sectionTitle}>Description</Text>
            <GlassCard style={styles.sectionCard}>
              <Text style={styles.descriptionText}>{job.description}</Text>
            </GlassCard>
          </Animated.View>

          {job.skills && job.skills.length > 0 && (
            <Animated.View entering={FadeInUp.delay(300).springify().damping(14)}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <GlassCard style={styles.sectionCard}>
                <View style={styles.skillsGrid}>
                  {job.skills.map((skill, idx) => (
                    <View key={idx} style={styles.skillChip}>
                      <Text style={styles.skillChipText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </Animated.View>
          )}

          <Animated.View entering={FadeInUp.delay(350).springify().damping(14)}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push(`/generate/cover-letter?jobTitle=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&jobDescription=${encodeURIComponent(job.description)}`)}
              >
                <LinearGradient colors={colors.gradient.purple} style={styles.actionBtnGrad}>
                  <Ionicons name="document-text" size={20} color="#FFF" />
                </LinearGradient>
                <Text style={styles.actionBtnLabel}>Cover Letter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push(`/generate/cold-email?company=${encodeURIComponent(job.company)}&jobTitle=${encodeURIComponent(job.title)}`)}
              >
                <LinearGradient colors={colors.gradient.coral} style={styles.actionBtnGrad}>
                  <Ionicons name="chatbubbles" size={20} color="#FFF" />
                </LinearGradient>
                <Text style={styles.actionBtnLabel}>Cold Email</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity onPress={handleApply} disabled={applying} activeOpacity={0.9}>
          <LinearGradient colors={['#3B82F6', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.applyBtn}>
            <Ionicons name="send" size={18} color="#FFF" />
            <Text style={styles.applyText}>{applying ? 'Opening...' : 'Apply Now'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  heroContent: { alignItems: 'center' },
  heroIcon: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  heroIconText: { color: '#FFFFFF', fontSize: 28, fontWeight: '700' },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', textAlign: 'center' },
  heroCompany: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 4, textAlign: 'center' },
  content: { gap: spacing.md, marginTop: -20 },
  metaCard: { padding: spacing.md },
  metaRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  matchBadge: { paddingHorizontal: 10, paddingVertical: 3, backgroundColor: colors.surfaceLight, borderRadius: borderRadius.sm },
  matchText: { fontSize: 13, fontWeight: '600' },
  metaGrid: { gap: spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaText: { color: colors.textSecondary, fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  sectionCard: { padding: spacing.md },
  descriptionText: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  skillChip: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.primaryBg, borderRadius: borderRadius.sm },
  skillChipText: { fontSize: 12, fontWeight: '500', color: colors.primary },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1, alignItems: 'center' },
  actionBtnGrad: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xs, ...shadow.md },
  actionBtnLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '500' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, backgroundColor: colors.surface, ...shadow.xl },
  applyBtn: { flexDirection: 'row', height: 52, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, ...shadow.glow.primary },
  applyText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
