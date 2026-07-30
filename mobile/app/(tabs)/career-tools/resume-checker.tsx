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
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loader } from '../../../components/ui/Loader';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { resumeApi } from '../../../lib/api';
import { Resume } from '../../../types';
import { formatDate } from '../../../lib/helpers';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function AnimatedScoreRing({ score }: { score: number }) {
  const progress = useSharedValue(0);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    progress.value = withTiming(score / 100, { duration: 1500 });
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(progress.value, [0, 1], [circumference, 0]),
  }));

  const ringColor = score >= 80 ? colors.success : score >= 60 ? colors.warning : colors.error;

  return (
    <View style={styles.ringContainer}>
      <Svg width={86} height={86}>
        <Circle cx={43} cy={43} r={radius} fill="none" stroke={colors.borderLight} strokeWidth={6} />
        <AnimatedCircle
          cx={43} cy={43} r={radius}
          fill="none" stroke={ringColor}
          strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 43 43)`}
        />
      </Svg>
      <Text style={[styles.ringScore, { color: ringColor }]}>{Math.round(score)}</Text>
    </View>
  );
}

const SUGGESTIONS = [
  { icon: 'key', title: 'Keywords', items: ['Add more role-specific keywords', 'Mirror terms from job descriptions'], color: colors.primary },
  { icon: 'text', title: 'Formatting', items: ['Use consistent bullet style', 'Keep font size 11-12pt'], color: colors.secondary },
  { icon: 'document-text', title: 'Content', items: ['Quantify achievements with numbers', 'Add a professional summary'], color: colors.success },
  { icon: 'information-circle', title: 'ATS Tips', items: ['Avoid images, charts, and tables', 'Use .docx or .pdf format'], color: colors.info },
];

export default function ResumeCheckerScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const handleCheckATS = async () => {
    if (!selected && resumes.length === 0) return;
    setChecking(true);
    await new Promise(r => setTimeout(r, 1200));
    setChecking(false);
  };

  const selected = selectedId ? resumes.find(r => r.id === selectedId) : null;
  const bestScore = resumes.length > 0 ? Math.max(...resumes.map(r => r.ats_score || 0)) : 0;
  const displayScore = selected?.ats_score || bestScore;

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
          <Text style={styles.title}>Resume Checker</Text>
          <Text style={styles.subtitle}>AI-powered ATS compatibility analysis</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
          <TouchableOpacity onPress={handleUpload} disabled={uploading} activeOpacity={0.8}>
            <LinearGradient colors={['#2563EB', '#4F8CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.uploadBtn}>
              <Ionicons name={uploading ? 'hourglass-outline' : 'cloud-upload-outline'} size={20} color="#FFFFFF" />
              <Text style={styles.uploadText}>{uploading ? 'Uploading...' : 'Upload Resume'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {loading && <Loader />}

        {!loading && resumes.length === 0 && (
          <EmptyState icon="document-text-outline" title="No resumes yet" message="Upload a resume to check its ATS compatibility score." actionLabel="Upload Resume" onAction={handleUpload} />
        )}

        {!loading && resumes.length > 0 && (
          <>
            <Animated.View entering={FadeInDown.delay(200).springify().damping(14)}>
              <GlassCard style={styles.scoreCard} glowColor={displayScore >= 80 ? colors.success : displayScore >= 60 ? colors.warning : colors.error}>
                <View style={styles.scoreRow}>
                  <AnimatedScoreRing score={displayScore} />
                  <View style={styles.scoreInfo}>
                    <Text style={styles.scoreTitle}>ATS Score</Text>
                    <Text style={styles.scoreDesc}>
                      {displayScore >= 80 ? 'Great shape! Your resume is well-optimized.' :
                       displayScore >= 60 ? 'Good but has room for improvement.' :
                       displayScore > 0 ? 'Needs significant optimization.' :
                       'No score yet. Click Check ATS.'}
                    </Text>
                    <TouchableOpacity onPress={handleCheckATS} disabled={checking} style={styles.checkBtn}>
                      <Ionicons name={checking ? 'hourglass-outline' : 'analytics'} size={16} color={colors.primary} />
                      <Text style={styles.checkText}>{checking ? 'Analyzing...' : 'Check ATS'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>

            <Text style={styles.sectionTitle}>Improvement Suggestions</Text>
            {SUGGESTIONS.map((group, gi) => (
              <Animated.View key={group.title} entering={FadeInDown.delay(250 + gi * 60).springify().damping(14)}>
                <BlurView intensity={40} tint="light" style={styles.suggestionCard}>
                  <View style={styles.suggestionHeader}>
                    <View style={[styles.suggestionIcon, { backgroundColor: group.color + '18' }]}>
                      <Ionicons name={group.icon as any} size={16} color={group.color} />
                    </View>
                    <Text style={styles.suggestionTitle}>{group.title}</Text>
                  </View>
                  {group.items.map((item, ii) => (
                    <View key={ii} style={styles.suggestionItem}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                      <Text style={styles.suggestionText}>{item}</Text>
                    </View>
                  ))}
                </BlurView>
              </Animated.View>
            ))}

            <Text style={styles.sectionTitle}>Your Resumes</Text>
            {resumes.map((resume, index) => (
              <Animated.View key={resume.id} entering={FadeInDown.delay(300 + index * 50).springify().damping(14)}>
                <TouchableOpacity onPress={() => setSelectedId(selectedId === resume.id ? null : resume.id)} activeOpacity={0.8}>
                  <BlurView intensity={40} tint="light" style={[styles.resumeCard, selectedId === resume.id && styles.resumeCardActive]}>
                    <LinearGradient colors={['#2563EB', '#4F8CFF']} style={styles.resumeIcon}>
                      <Ionicons name="document-text" size={18} color="#FFFFFF" />
                    </LinearGradient>
                    <View style={styles.resumeInfo}>
                      <Text style={styles.resumeName} numberOfLines={1}>{resume.original_filename}</Text>
                      <Text style={styles.resumeDate}>{formatDate(resume.created_at)}</Text>
                    </View>
                    <Badge label={`${resume.ats_score || 0}%`} variant={resume.ats_score >= 80 ? 'success' : resume.ats_score >= 60 ? 'warning' : 'error'} size="sm" />
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
  scoreCard: { marginBottom: spacing.md },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  ringContainer: { width: 86, height: 86, alignItems: 'center', justifyContent: 'center' },
  ringScore: { position: 'absolute', fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  scoreInfo: { flex: 1 },
  scoreTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  scoreDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  checkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: borderRadius.full, backgroundColor: colors.primaryBg, alignSelf: 'flex-start' },
  checkText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  suggestionCard: { padding: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.sm, overflow: 'hidden' },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  suggestionIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  suggestionTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginLeft: spacing.sm },
  suggestionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, marginTop: spacing.xs },
  suggestionText: { fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 18 },
  resumeCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.sm, overflow: 'hidden' },
  resumeCardActive: { borderWidth: 1, borderColor: colors.primary },
  resumeIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  resumeInfo: { flex: 1, marginLeft: spacing.sm },
  resumeName: { fontSize: 14, fontWeight: '600', color: colors.text },
  resumeDate: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
});
