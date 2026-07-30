import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedProps, withTiming, interpolate } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loader } from '../../../components/ui/Loader';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { resumeApi } from '../../../lib/api';
import { Resume } from '../../../types';
import { formatDate } from '../../../lib/helpers';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const BREAKDOWN_SEGMENTS = [
  { label: 'Keyword Optimization', weight: 35, icon: 'key', color: colors.primary },
  { label: 'Format & Structure', weight: 25, icon: 'grid', color: colors.secondary },
  { label: 'Content Quality', weight: 20, icon: 'document-text', color: colors.success },
  { label: 'Experience Relevance', weight: 20, icon: 'briefcase', color: colors.info },
];

const ATS_TIPS = [
  { icon: 'document-text', tip: 'Use standard section headings like "Experience", "Education", "Skills"' },
  { icon: 'key', tip: 'Include relevant keywords from the job description throughout your resume' },
  { icon: 'image', tip: 'Avoid images, graphics, charts, and non-standard fonts' },
  { icon: 'grid', tip: 'Use a single-column layout - ATS struggles with tables and columns' },
  { icon: 'file-tray', tip: 'Submit in .docx format as it is most ATS-friendly' },
  { icon: 'text', tip: 'Use bullet points with action verbs to describe achievements' },
];

function BreakdownRing({ score }: { score: number }) {
  const progress = useSharedValue(0);
  const radius = 48;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    progress.value = withTiming(score / 100, { duration: 1800 });
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(progress.value, [0, 1], [circumference, 0]),
  }));

  const ringColor = score >= 80 ? colors.success : score >= 60 ? colors.warning : colors.error;

  return (
    <View style={styles.bigRing}>
      <Svg width={110} height={110}>
        <Circle cx={55} cy={55} r={radius} fill="none" stroke={colors.borderLight} strokeWidth={8} />
        <AnimatedCircle
          cx={55} cy={55} r={radius}
          fill="none" stroke={ringColor}
          strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 55 55)`}
        />
      </Svg>
      <View style={styles.bigRingLabel}>
        <Text style={[styles.bigRingScore, { color: ringColor }]}>{Math.round(score)}</Text>
        <Text style={styles.bigRingSub}>ATS Score</Text>
      </View>
    </View>
  );
}

export default function ATSScoreScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await resumeApi.list();
      setResumes(res.data.data || []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchResumes(); }, []);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      setUploading(true);
      const file = result.assets[0];
      const formData = new FormData();
      formData.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'application/pdf' } as any);
      await resumeApi.upload(formData);
      await fetchResumes();
    } catch {} finally {
      setUploading(false);
    }
  };

  const selected = selectedId ? resumes.find(r => r._id === selectedId) : resumes[0] || null;
  const displayScore = selected?.ats_score || 0;
  const computedScores = BREAKDOWN_SEGMENTS.map(s => ({
    ...s,
    value: Math.round(displayScore * (s.weight / 100)),
  }));

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchResumes(); }} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        <Animated.View entering={FadeInUp.delay(100).springify().damping(14)} style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>ATS Score</Text>
          <Text style={styles.subtitle}>Deep ATS compatibility analysis</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
          <TouchableOpacity onPress={handleUpload} disabled={uploading} activeOpacity={0.8}>
            <LinearGradient colors={['#06B6D4', '#14B8A6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.uploadBtn}>
              <Ionicons name={uploading ? 'hourglass-outline' : 'cloud-upload-outline'} size={20} color="#FFFFFF" />
              <Text style={styles.uploadText}>{uploading ? 'Uploading...' : 'Upload Resume for ATS Analysis'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {loading && <Loader />}

        {!loading && resumes.length === 0 && (
          <EmptyState icon="speedometer-outline" title="No resumes analyzed" message="Upload a resume to get a detailed ATS score breakdown." actionLabel="Upload Resume" onAction={handleUpload} />
        )}

        {!loading && resumes.length > 0 && (
          <>
            <Animated.View entering={FadeInDown.delay(200).springify().damping(14)}>
              <GlassCard style={styles.scoreHero} glowColor={displayScore >= 80 ? colors.success : displayScore >= 60 ? colors.warning : colors.error}>
                <View style={styles.heroRow}>
                  <BreakdownRing score={displayScore} />
                  <View style={styles.heroInfo}>
                    <Text style={styles.heroTitle}>Overall ATS Score</Text>
                    <Text style={styles.heroDesc}>
                      {displayScore >= 80 ? 'Excellent ATS compatibility. Ready for submission.' :
                       displayScore >= 60 ? 'Good score. Minor optimizations recommended.' :
                       displayScore > 0 ? 'Below average. Significant improvements needed.' :
                       'Upload to see your ATS score'}
                    </Text>
                    {selected && (
                      <Text style={styles.heroFile} numberOfLines={1}>{selected.original_filename}</Text>
                    )}
                  </View>
                </View>
              </GlassCard>
            </Animated.View>

            <Text style={styles.sectionTitle}>Score Breakdown</Text>
            {computedScores.map((seg, index) => (
              <Animated.View key={seg.label} entering={FadeInDown.delay(250 + index * 50).springify().damping(14)}>
                <BlurView intensity={40} tint="light" style={styles.breakdownCard}>
                  <View style={styles.breakdownTop}>
                    <View style={styles.breakdownLeft}>
                      <View style={[styles.breakIcon, { backgroundColor: seg.color + '18' }]}>
                        <Ionicons name={seg.icon as any} size={14} color={seg.color} />
                      </View>
                      <Text style={styles.breakLabel}>{seg.label}</Text>
                    </View>
                    <Text style={[styles.breakValue, { color: seg.value >= 80 ? colors.success : seg.value >= 60 ? colors.warning : colors.error }]}>
                      {seg.value}%
                    </Text>
                  </View>
                  <View style={styles.breakBarBg}>
                    <View style={[styles.breakBarFill, { width: `${seg.value}%`, backgroundColor: seg.color }]} />
                  </View>
                </BlurView>
              </Animated.View>
            ))}

            <TouchableOpacity onPress={() => setShowTips(!showTips)} activeOpacity={0.7}>
              <BlurView intensity={40} tint="light" style={styles.tipsToggle}>
                <Ionicons name="bulb-outline" size={16} color={colors.warning} />
                <Text style={styles.tipsToggleText}>
                  {showTips ? 'Hide' : 'Show'} ATS Optimization Tips
                </Text>
                <Ionicons name={showTips ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textMuted} />
              </BlurView>
            </TouchableOpacity>

            {showTips && (
              <View style={styles.tipsList}>
                {ATS_TIPS.map((tip, index) => (
                  <Animated.View key={index} entering={FadeInDown.delay(100 + index * 40).springify().damping(14)}>
                    <BlurView intensity={40} tint="light" style={styles.tipItem}>
                      <Ionicons name={tip.icon as any} size={16} color={colors.warning} />
                      <Text style={styles.tipText}>{tip.tip}</Text>
                    </BlurView>
                  </Animated.View>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>Analyzed Resumes</Text>
            {resumes.map((resume, index) => (
              <Animated.View key={resume._id} entering={FadeInDown.delay(300 + index * 50).springify().damping(14)}>
                <TouchableOpacity onPress={() => setSelectedId(resume._id)} activeOpacity={0.8}>
                  <BlurView intensity={40} tint="light" style={[styles.resumeCard, selectedId === resume._id && styles.resumeCardActive]}>
                    <LinearGradient colors={['#06B6D4', '#14B8A6']} style={styles.resumeIcon}>
                      <Ionicons name="document-text" size={18} color="#FFFFFF" />
                    </LinearGradient>
                    <View style={styles.resumeInfo}>
                      <Text style={styles.resumeName} numberOfLines={1}>{resume.original_filename}</Text>
                      <Text style={styles.resumeDate}>{formatDate(resume.created_at || '')}</Text>
                    </View>
                    <Badge label={`${resume.ats_score! || 0} ATS`} variant={resume.ats_score! >= 80 ? 'success' : resume.ats_score! >= 60 ? 'warning' : 'error'} size="sm" />
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding() },
  header: { paddingBottom: spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, borderRadius: borderRadius.lg, gap: spacing.sm, ...shadow.lg, marginBottom: spacing.md },
  uploadText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  scoreHero: { marginBottom: spacing.md },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bigRing: { width: 110, height: 110, alignItems: 'center', justifyContent: 'center' },
  bigRingLabel: { position: 'absolute', alignItems: 'center' },
  bigRingScore: { fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] },
  bigRingSub: { fontSize: 10, fontWeight: '600', color: colors.textMuted, marginTop: 1 },
  heroInfo: { flex: 1 },
  heroTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  heroDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  heroFile: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm, fontStyle: 'italic' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  breakdownCard: { padding: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.sm, overflow: 'hidden' },
  breakdownTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  breakIcon: { width: 28, height: 28, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
  breakLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  breakValue: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  breakBarBg: { height: 5, backgroundColor: colors.borderLight, borderRadius: 3, overflow: 'hidden' },
  breakBarFill: { height: 5, borderRadius: 3 },
  tipsToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, padding: spacing.md, borderRadius: borderRadius.xl, marginTop: spacing.sm, overflow: 'hidden' },
  tipsToggleText: { fontSize: 13, fontWeight: '600', color: colors.warning },
  tipsList: { gap: spacing.sm, marginTop: spacing.sm },
  tipItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: borderRadius.xl, overflow: 'hidden' },
  tipText: { fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 18 },
  resumeCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.sm, overflow: 'hidden' },
  resumeCardActive: { borderWidth: 1, borderColor: colors.info },
  resumeIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  resumeInfo: { flex: 1, marginLeft: spacing.sm },
  resumeName: { fontSize: 14, fontWeight: '600', color: colors.text },
  resumeDate: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
});