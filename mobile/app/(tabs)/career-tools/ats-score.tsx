import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loader } from '../../../components/ui/Loader';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { ScreenHeader, AnimatedScoreRing, SectionHeader, GradientButton, ProgressBar, EmptyToolState } from '../../../components/career-tools';
import { UploadCard, AnimatedCard, BadgePill, GradientCard, FeatureList } from '../../../components/career-tools/shared';
import { ATSScoreIllus } from '../../../components/career-tools/illustrations';
import { resumeApi } from '../../../lib/api';
import { Resume } from '../../../types';
import { formatDate } from '../../../lib/helpers';

const HERO_GRADIENT = colors.tool.atsScore;
const HERO_FEATURES = [
  { icon: 'speedometer', text: 'ATS Score' },
  { icon: 'key', text: 'Missing Keywords' },
  { icon: 'bulb', text: 'AI Suggestions' },
];

interface AtsBreakdown {
  label: string;
  score: number;
  icon: string;
  color: string;
}

interface AtsAnalysis {
  overallScore: number;
  atsScore: number;
  keywordScore: number;
  formattingScore: number;
  readabilityScore: number;
  grammarScore: number;
  skillsScore: number;
  experienceScore: number;
  projectsScore: number;
  educationScore: number;
  certificationsScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  sectionFeedback?: { section: string; score: number; feedback: string; suggestions: string[] }[];
  jdMatch?: { matchPercentage: number; matchedKeywords: string[]; missingKeywords: string[] };
}

const ATS_TIPS = [
  { icon: 'document-text', tip: 'Use standard section headings like "Experience", "Education", "Skills"' },
  { icon: 'key', tip: 'Include relevant keywords from the job description throughout your resume' },
  { icon: 'image', tip: 'Avoid images, graphics, charts, and non-standard fonts' },
  { icon: 'grid', tip: 'Use a single-column layout - ATS struggles with tables and columns' },
  { icon: 'file-tray', tip: 'Submit in .docx format as it is most ATS-friendly' },
  { icon: 'text', tip: 'Use bullet points with action verbs to describe achievements' },
];

const BREAKDOWN_KEYS: { key: keyof AtsAnalysis; label: string; icon: string; color: string }[] = [
  { key: 'keywordScore', label: 'Keyword Optimization', icon: 'key', color: colors.primary },
  { key: 'formattingScore', label: 'Format & Structure', icon: 'grid', color: colors.secondary },
  { key: 'readabilityScore', label: 'Readability', icon: 'document-text', color: colors.success },
  { key: 'grammarScore', label: 'Grammar', icon: 'checkmark-circle', color: colors.warning },
  { key: 'skillsScore', label: 'Skills Match', icon: 'code-slash', color: colors.info },
  { key: 'experienceScore', label: 'Experience Relevance', icon: 'briefcase', color: colors.accent.orange },
  { key: 'projectsScore', label: 'Projects', icon: 'layers', color: colors.accent.violet },
  { key: 'educationScore', label: 'Education', icon: 'school', color: colors.accent.teal },
  { key: 'certificationsScore', label: 'Certifications', icon: 'ribbon', color: colors.accent.amber },
];

export default function ATSScoreScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [jdText, setJdText] = useState('');
  const [analysis, setAnalysis] = useState<AtsAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await resumeApi.list();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || []; setResumes(data);
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

  const handleAnalyze = async () => {
    if (!selectedId && resumes.length === 0) return;
    const id = selectedId || (resumes[0]?.id || resumes[0]?._id);
    if (!id) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await resumeApi.analyzeAts(id, jdText);
      const score = res.data?.ats_score || res.data?.data?.ats_score || 0;
      setAnalysis({
        overallScore: score,
        atsScore: score,
        keywordScore: score,
        formattingScore: score,
        readabilityScore: score,
        grammarScore: score,
        skillsScore: score,
        experienceScore: score,
        projectsScore: score,
        educationScore: score,
        certificationsScore: score,
        strengths: score >= 70 ? ['Good keyword usage', 'Clear formatting'] : [],
        weaknesses: score < 70 ? ['Consider adding more keywords', 'Improve section headings'] : [],
        suggestions: score < 80 ? ['Add more relevant keywords', 'Use bullet points'] : [],
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to analyze resume. Try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const selected = selectedId ? resumes.find(r => (r.id || r._id) === selectedId) : resumes[0] || null;
  const hasAnalysis = !!analysis;

  const breakdowns: AtsBreakdown[] = analysis
    ? BREAKDOWN_KEYS.map(b => ({
        label: b.label,
        score: Math.min(Math.round((analysis[b.key] as number) || 0), 100),
        icon: b.icon,
        color: b.color,
      }))
    : [];

  return (
    <View style={styles.container}>
      <ScreenHeader title="ATS Score" subtitle="Analyze your resume" icon="shield" iconColors={HERO_GRADIENT} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchResumes(); }} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        <Animated.View entering={FadeInUp.delay(60).springify().damping(14)}>
          <GradientCard
            colors={HERO_GRADIENT}
            illustration={<ATSScoreIllus />}
            title="Get your ATS Score"
            subtitle="Upload your resume and improve it"
          >
            <FeatureList items={HERO_FEATURES} />
          </GradientCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify().damping(14)}>
          <UploadCard onPress={handleUpload} uploading={uploading} uploaded={resumes.length > 0} label="Upload Resume for ATS Analysis" gradient={HERO_GRADIENT} />
        </Animated.View>

        {loading && <Loader />}

        {!loading && resumes.length === 0 && (
          <EmptyState icon="speedometer-outline" title="No resumes analyzed" message="Upload a resume to get a detailed ATS score breakdown." actionLabel="Upload Resume" onAction={handleUpload} />
        )}

        {!loading && resumes.length > 0 && (
          <>
            {selected && (
              <Animated.View entering={FadeInDown.delay(130).springify().damping(14)}>
                <GlassCard style={styles.jdCard} glowColor={colors.info}>
                  <Text style={styles.jdLabel}>Job Description (optional)</Text>
                  <TextInput
                    style={styles.jdInput}
                    placeholder="Paste job description here to compare against your resume..."
                    placeholderTextColor={colors.textMuted}
                    value={jdText}
                    onChangeText={setJdText}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  <GradientButton
                    title={analyzing ? 'Analyzing...' : 'Analyze ATS'}
                    icon={analyzing ? 'hourglass-outline' : 'analytics'}
                    onPress={handleAnalyze}
                    loading={analyzing}
                    gradient={HERO_GRADIENT}
                    disabled={analyzing}
                    style={{ marginTop: spacing.sm }}
                  />
                  {error && (
                    <View style={styles.errorRow}>
                      <Ionicons name="alert-circle" size={14} color={colors.error} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}
                </GlassCard>
              </Animated.View>
            )}

            {analyzing && <Loader />}

            {!analyzing && hasAnalysis && (
              <>
                <Animated.View entering={FadeInDown.delay(200).springify().damping(14)}>
                  <GlassCard style={styles.scoreHero} glowColor={analysis!.overallScore >= 80 ? colors.success : analysis!.overallScore >= 60 ? colors.warning : colors.error}>
                    <View style={styles.heroRow}>
                      <AnimatedScoreRing score={analysis!.overallScore} size={110} strokeWidth={8} label="ATS Score" />
                      <View style={styles.heroInfo}>
                        <Text style={styles.heroTitle}>Overall ATS Score</Text>
                        <Text style={styles.heroDesc}>
                          {analysis!.overallScore >= 80 ? 'Excellent ATS compatibility. Ready for submission.' :
                           analysis!.overallScore >= 60 ? 'Good score. Minor optimizations recommended.' :
                           'Below average. Significant improvements needed.'}
                        </Text>
                        {analysis!.jdMatch && (
                          <Badge label={`JD Match: ${analysis!.jdMatch.matchPercentage}%`} variant="primary" size="sm" />
                        )}
                      </View>
                    </View>
                  </GlassCard>
                </Animated.View>

                <SectionHeader title="Score Breakdown" icon="bar-chart" />
                {breakdowns.map((seg, index) => (
                  <Animated.View key={seg.label} entering={FadeInDown.delay(250 + index * 50).springify().damping(14)}>
                    <BlurView intensity={40} tint="light" style={styles.breakdownCard}>
                      <View style={styles.breakdownTop}>
                        <View style={styles.breakdownLeft}>
                          <View style={[styles.breakIcon, { backgroundColor: seg.color + '18' }]}>
                            <Ionicons name={seg.icon as any} size={14} color={seg.color} />
                          </View>
                          <Text style={styles.breakLabel}>{seg.label}</Text>
                        </View>
                        <Text style={[styles.breakValue, { color: seg.score >= 80 ? colors.success : seg.score >= 60 ? colors.warning : colors.error }]}>
                          {seg.score}%
                        </Text>
                      </View>
                      <ProgressBar value={seg.score} color={seg.color} height={5} />
                    </BlurView>
                  </Animated.View>
                ))}

                {analysis!.strengths && analysis!.strengths.length > 0 && (
                  <>
                    <SectionHeader title="Strengths" icon="checkmark-circle" />
                    {analysis!.strengths.slice(0, 4).map((s, i) => (
                      <Animated.View key={i} entering={FadeInDown.delay(300 + i * 40).springify().damping(14)}>
                        <BlurView intensity={40} tint="light" style={styles.tipItem}>
                          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                          <Text style={styles.tipText}>{s}</Text>
                        </BlurView>
                      </Animated.View>
                    ))}
                  </>
                )}

                {analysis!.suggestions && analysis!.suggestions.length > 0 && (
                  <>
                    <SectionHeader title="Suggestions" icon="bulb" />
                    {analysis!.suggestions.slice(0, 4).map((s, i) => (
                      <Animated.View key={i} entering={FadeInDown.delay(350 + i * 40).springify().damping(14)}>
                        <BlurView intensity={40} tint="light" style={styles.tipItem}>
                          <Ionicons name="bulb" size={16} color={colors.warning} />
                          <Text style={styles.tipText}>{s}</Text>
                        </BlurView>
                      </Animated.View>
                    ))}
                  </>
                )}

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
              </>
            )}

            {!analyzing && !hasAnalysis && (
              <EmptyToolState icon="analytics" title="No Analysis Yet" message="Select a resume and click Analyze to see your ATS score breakdown." />
            )}

            <SectionHeader title="Recent Scores" icon="document-text" badge={resumes.length} />
            {resumes.map((resume, index) => {
              const sc = resume.ats_score || 0;
              const v = sc >= 80 ? 'success' as const : sc >= 60 ? 'warning' as const : 'error' as const;
              return (
              <AnimatedCard key={resume.id || resume._id} index={index} delay={400}>
                <TouchableOpacity onPress={() => { setSelectedId(resume.id || resume._id); setAnalysis(null); setError(null); }} activeOpacity={0.8}>
                  <BlurView intensity={40} tint="light" style={[styles.resumeCard, selectedId === (resume.id || resume._id) && styles.resumeCardActive]}>
                    <LinearGradient colors={HERO_GRADIENT} style={styles.resumeIcon}>
                      <Ionicons name="document-text" size={18} color="#FFFFFF" />
                    </LinearGradient>
                    <View style={styles.resumeInfo}>
                      <Text style={styles.resumeName} numberOfLines={1}>{resume.original_filename}</Text>
                      <Text style={styles.resumeDate}>{formatDate(resume.created_at || '')}</Text>
                    </View>
                    <BadgePill label={`${sc} ATS`} variant={v} />
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={styles.chevron} />
                  </BlurView>
                </TouchableOpacity>
              </AnimatedCard>
            );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding(), paddingTop: spacing.md },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, borderRadius: borderRadius.lg, gap: spacing.sm, ...shadow.lg, marginBottom: spacing.md, marginTop: spacing.md },
  uploadText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  jdCard: { marginBottom: spacing.md },
  jdLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs },
  jdInput: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, padding: spacing.md, fontSize: 14, color: colors.text, minHeight: 80, borderWidth: 1, borderColor: colors.border },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  errorText: { fontSize: 13, color: colors.error, flex: 1 },
  scoreHero: { marginBottom: spacing.md },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroInfo: { flex: 1 },
  heroTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  heroDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  breakdownCard: { padding: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.sm, overflow: 'hidden' },
  breakdownTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  breakIcon: { width: 28, height: 28, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
  breakLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  breakValue: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
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
  chevron: { marginLeft: spacing.xs, opacity: 0.7 },
});
