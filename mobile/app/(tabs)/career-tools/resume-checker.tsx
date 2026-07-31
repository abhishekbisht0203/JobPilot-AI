import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Badge } from '../../../components/ui/Badge';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import {
  ScreenHeader, GradientButton, AnimatedScoreRing, SectionHeader, TabBar, InfoCard, EmptyToolState
} from '../../../components/career-tools';
import { UploadCard, AnimatedCard, BadgePill, GradientCard, FeatureList } from '../../../components/career-tools/shared';
import { ResumeCheckerIllus } from '../../../components/career-tools/illustrations';
import { resumeApi } from '../../../lib/api';
import { Resume } from '../../../types';
import { formatDate } from '../../../lib/helpers';

const HERO_GRADIENT = colors.tool.resumeChecker;
const HERO_FEATURES = [
  { icon: 'checkmark-circle', text: 'ATS Score' },
  { icon: 'checkmark-circle', text: 'Matched Skills' },
  { icon: 'checkmark-circle', text: 'AI Feedback' },
  { icon: 'checkmark-circle', text: 'Improvement Tips' },
];

interface GrammarIssue {
  issue: string;
  suggestion: string;
  severity: string;
  context?: string;
}

interface SpellingIssue {
  word: string;
  suggestion: string;
}

interface FormattingIssue {
  issue: string;
  suggestion: string;
  severity: string;
}

interface FormattingDetails {
  estimatedWordCount: number;
  pageCount: number;
  atsFriendlyFont: boolean;
  hasTables: boolean;
}

interface RewriteSuggestion {
  section: string;
  original: string;
  improved: string;
  explanation: string;
}

interface AnalysisResult {
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
  confidenceScore: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  matchedKeywords?: string[];
  missingKeywords?: string[];
  suggestedKeywords?: string[];
  overusedKeywords?: string[];
  grammarIssues?: GrammarIssue[];
  spellingIssues?: SpellingIssue[];
  formattingIssues?: FormattingIssue[];
  formattingDetails?: FormattingDetails;
  rewriteSuggestions?: RewriteSuggestion[];
}

function getScoreColor(score: number): string {
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.warning;
  return colors.error;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Poor';
}

function SkeletonBlock({ width, height, style, br }: { width?: any; height?: number; style?: any; br?: number }) {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[{ width: width || '100%', height: height || 16, backgroundColor: colors.borderLight, borderRadius: br || borderRadius.sm }, animatedStyle, style]} />
  );
}

function AnalysisSkeleton() {
  return (
    <View style={styles.analysisSkeleton}>
      <SkeletonBlock height={120} br={borderRadius.xl} />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <SkeletonBlock style={{ flex: 1 }} height={80} br={borderRadius.lg} />
        <SkeletonBlock style={{ flex: 1 }} height={80} br={borderRadius.lg} />
      </View>
      <SkeletonBlock height={200} br={borderRadius.xl} />
    </View>
  );
}

function DashboardTab({ analysis }: { analysis: AnalysisResult }) {
  const score = analysis.overallScore || analysis.atsScore || 0;
  const strengths = analysis.strengths || [];
  const weaknesses = analysis.weaknesses || [];
  return (
    <Animated.View entering={FadeInUp.springify().damping(14)} style={{ gap: spacing.md }}>
      <GlassCard style={{ alignItems: 'center', padding: spacing.lg }}>
        <AnimatedScoreRing score={score} size={120} strokeWidth={8} label="Overall" />
        <Text style={[styles.scoreLabel, { color: getScoreColor(score) }]}>{getScoreLabel(score)}</Text>
      </GlassCard>
      {strengths.length > 0 && (
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <SectionHeader title="Strengths" icon="checkmark-circle" badge={strengths.length} />
          <View style={{ gap: spacing.xs }}>
            {strengths.map((s, i) => (
              <Animated.View key={i} entering={FadeInDown.delay(120 + i * 40).springify()}>
                <InfoCard icon="checkmark-circle" label={s} color={colors.success} />
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      )}
      {weaknesses.length > 0 && (
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <SectionHeader title="Areas for Improvement" icon="alert-circle" badge={weaknesses.length} />
          <View style={{ gap: spacing.xs }}>
            {weaknesses.map((w, i) => (
              <Animated.View key={i} entering={FadeInDown.delay(220 + i * 40).springify()}>
                <InfoCard icon="alert-circle" label={w} color={colors.warning} />
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

function KeywordsTab({ analysis }: { analysis: AnalysisResult }) {
  const matched = analysis.matchedKeywords || [];
  const missing = analysis.missingKeywords || [];
  const suggested = analysis.suggestedKeywords || [];
  const overused = analysis.overusedKeywords || [];

  return (
    <Animated.View entering={FadeInUp.springify().damping(14)} style={{ gap: spacing.md }}>
      {matched.length > 0 && (
        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <SectionHeader title="Matched Keywords" icon="checkmark-circle" badge={matched.length} />
          <View style={styles.pillRow}>
            {matched.slice(0, 20).map((k, i) => (
              <View key={i} style={[styles.pill, { backgroundColor: colors.successLight }]}>
                <Text style={[styles.pillText, { color: colors.success }]}>{k}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}
      {missing.length > 0 && (
        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <SectionHeader title="Missing Keywords" icon="close-circle" badge={missing.length} />
          <View style={styles.pillRow}>
            {missing.slice(0, 20).map((k, i) => (
              <View key={i} style={[styles.pill, { backgroundColor: colors.errorLight }]}>
                <Text style={[styles.pillText, { color: colors.error }]}>{k}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}
      {suggested.length > 0 && (
        <Animated.View entering={FadeInDown.delay(160).springify()}>
          <SectionHeader title="Suggested Keywords" icon="bulb" badge={suggested.length} />
          <View style={styles.pillRow}>
            {suggested.map((k, i) => (
              <View key={i} style={[styles.pill, { backgroundColor: colors.infoLight }]}>
                <Text style={[styles.pillText, { color: colors.info }]}>{k}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}
      {overused.length > 0 && (
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <SectionHeader title="Overused Keywords" icon="warning" badge={overused.length} />
          <View style={styles.pillRow}>
            {overused.map((k, i) => (
              <View key={i} style={[styles.pill, { backgroundColor: colors.warningLight }]}>
                <Text style={[styles.pillText, { color: colors.warning }]}>{k}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}
      {matched.length === 0 && missing.length === 0 && suggested.length === 0 && (
        <EmptyToolState icon="pricetags-outline" title="No Keyword Data" message="Keyword analysis was not performed for this resume." />
      )}
    </Animated.View>
  );
}

function GrammarTab({ analysis }: { analysis: AnalysisResult }) {
  const issues = analysis.grammarIssues || [];
  const spelling = analysis.spellingIssues || [];

  if (issues.length === 0 && spelling.length === 0) {
    return (
      <Animated.View entering={FadeInUp.springify()}>
        <EmptyToolState icon="checkmark-circle-outline" title="No Issues Found" message="Your resume looks grammatically clean!" />
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.springify().damping(14)} style={{ gap: spacing.sm }}>
      {issues.map((g, i) => (
        <Animated.View key={i} entering={FadeInDown.delay(i * 40).springify()}>
          <BlurView intensity={40} tint="light" style={[styles.issueCard, { borderLeftColor: g.severity === 'high' ? colors.error : g.severity === 'medium' ? colors.warning : colors.info, borderLeftWidth: 3 }]}>
            <Text style={styles.issueTitle}>{g.issue}</Text>
            <Text style={styles.issueSuggestion}>{g.suggestion}</Text>
            <Badge label={g.severity} variant={g.severity === 'high' ? 'error' : g.severity === 'medium' ? 'warning' : 'primary'} size="sm" />
          </BlurView>
        </Animated.View>
      ))}
      {spelling.map((s, i) => (
        <Animated.View key={`sp-${i}`} entering={FadeInDown.delay((issues.length + i) * 40).springify()}>
          <BlurView intensity={40} tint="light" style={[styles.issueCard, { borderLeftColor: colors.error, borderLeftWidth: 3 }]}>
            <Text style={styles.issueTitle}>{`Spelling: "${s.word}"`}</Text>
            <Text style={styles.issueSuggestion}>{`Correct to "${s.suggestion}"`}</Text>
            <Badge label="spelling" variant="error" size="sm" />
          </BlurView>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

function FormattingTab({ analysis }: { analysis: AnalysisResult }) {
  const issues = analysis.formattingIssues || [];
  const details = analysis.formattingDetails;

  if (issues.length === 0 && !details) {
    return (
      <Animated.View entering={FadeInUp.springify()}>
        <EmptyToolState icon="document-text-outline" title="No Formatting Issues" message="Your resume format looks ATS-friendly." />
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.springify().damping(14)} style={{ gap: spacing.md }}>
      {details && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {details.estimatedWordCount > 0 && (
            <View style={styles.detailBadge}>
              <Text style={styles.detailLabel}>Word Count</Text>
              <Text style={styles.detailValue}>{details.estimatedWordCount}</Text>
            </View>
          )}
          {details.pageCount > 0 && (
            <View style={styles.detailBadge}>
              <Text style={styles.detailLabel}>Pages</Text>
              <Text style={styles.detailValue}>{details.pageCount}</Text>
            </View>
          )}
          <View style={[styles.detailBadge, { borderColor: details.atsFriendlyFont ? colors.success : colors.error }]}>
            <Text style={styles.detailLabel}>Font</Text>
            <Text style={[styles.detailValue, { color: details.atsFriendlyFont ? colors.success : colors.error }]}>
              {details.atsFriendlyFont ? 'ATS-Friendly' : 'Check'}
            </Text>
          </View>
          <View style={[styles.detailBadge, { borderColor: details.hasTables ? colors.error : colors.success }]}>
            <Text style={styles.detailLabel}>Tables</Text>
            <Text style={[styles.detailValue, { color: details.hasTables ? colors.error : colors.success }]}>
              {details.hasTables ? 'Detected' : 'None'}
            </Text>
          </View>
        </View>
      )}
      {issues.map((f, i) => (
        <Animated.View key={i} entering={FadeInDown.delay(i * 40).springify()}>
          <BlurView intensity={40} tint="light" style={[styles.issueCard, { borderLeftColor: f.severity === 'high' ? colors.error : f.severity === 'medium' ? colors.warning : colors.info, borderLeftWidth: 3 }]}>
            <Text style={styles.issueTitle}>{f.issue}</Text>
            <Text style={styles.issueSuggestion}>{f.suggestion}</Text>
            <Badge label={f.severity} variant={f.severity === 'high' ? 'error' : f.severity === 'medium' ? 'warning' : 'primary'} size="sm" />
          </BlurView>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

function RewriteTab({ analysis }: { analysis: AnalysisResult }) {
  const rewrites = analysis.rewriteSuggestions || [];

  if (rewrites.length === 0) {
    return (
      <Animated.View entering={FadeInUp.springify()}>
        <EmptyToolState icon="flash-outline" title="No Rewrites" message="No AI rewrite suggestions available." />
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.springify().damping(14)} style={{ gap: spacing.md }}>
      {rewrites.slice(0, 5).map((rw, i) => (
        <Animated.View key={i} entering={FadeInDown.delay(i * 80).springify()}>
          <BlurView intensity={40} tint="light" style={styles.rewriteCard}>
            <View style={styles.rewriteHeader}>
              <Ionicons name="sparkles" size={16} color={colors.accent.rose || '#E11D48'} />
              <Text style={styles.rewriteSection}>{rw.section}</Text>
              <Badge label={rw.explanation} variant="primary" size="sm" />
            </View>
            <View style={styles.rewriteCompare}>
              <View style={styles.rewriteOriginal}>
                <Text style={styles.rewriteLabel}>Original</Text>
                <Text style={styles.rewriteText}>{rw.original.length > 200 ? rw.original.substring(0, 200) + '...' : rw.original}</Text>
              </View>
              <View style={styles.rewriteDivider} />
              <View style={styles.rewriteImproved}>
                <Text style={[styles.rewriteLabel, { color: colors.success }]}>Improved</Text>
                <Text style={styles.rewriteText}>{rw.improved.length > 200 ? rw.improved.substring(0, 200) + '...' : rw.improved}</Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

export default function ResumeCheckerScreen() {
  const { horizontalPadding } = useResponsive();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [jdText, setJdText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchResumes = useCallback(async () => {
    try {
      setError(null);
      const res = await resumeApi.list();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || []; setResumes(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load resumes');
    } finally {
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
      setError(null);
      const file = result.assets[0];
      const formData = new FormData();
      formData.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'application/pdf' } as any);
      await resumeApi.upload(formData);
      await fetchResumes();
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    const id = selectedId;
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
        confidenceScore: score,
        strengths: score >= 70 ? ['Good keyword usage', 'Clear formatting'] : [],
        weaknesses: score < 70 ? ['Consider adding more keywords', 'Improve section headings'] : [],
        suggestions: score < 80 ? ['Add more relevant keywords', 'Use bullet points'] : [],
        matchedKeywords: [],
        missingKeywords: [],
        grammarIssues: [],
        formattingIssues: [],
        rewriteSuggestions: [],
      });
      setActiveTab('dashboard');
    } catch (err: any) {
      setError(err?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const selected = selectedId ? resumes.find(r => (r.id || r._id) === selectedId) : null;
  const bestScore = resumes.length > 0 ? Math.max(...resumes.map(r => r.ats_score || 0)) : 0;
  const analysisScore = analysis?.overallScore || analysis?.atsScore || 0;
  const displayScore = analysisScore || selected?.ats_score || bestScore;

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: 'speedometer-outline' },
    { key: 'keywords', label: 'Keywords', icon: 'pricetags-outline' },
    { key: 'grammar', label: 'Grammar', icon: 'checkmark-circle-outline' },
    { key: 'formatting', label: 'Formatting', icon: 'document-text-outline' },
    { key: 'rewrite', label: 'AI Rewrite', icon: 'flash-outline' },
  ];

  const scoreDesc = displayScore >= 80 ? 'Great shape! Your resume is well-optimized.'
    : displayScore >= 60 ? 'Good but has room for improvement.'
    : displayScore > 0 ? 'Needs significant optimization.'
    : 'No score yet. Tap Analyze to check.';

  return (
    <View style={styles.container}>
      <ScreenHeader title="Resume Checker" subtitle="Check your resume & get AI feedback" icon="shield-checkmark" iconColors={HERO_GRADIENT} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchResumes(); }} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        <Animated.View entering={FadeInUp.delay(60).springify().damping(14)}>
          <GradientCard
            colors={HERO_GRADIENT}
            illustration={<ResumeCheckerIllus />}
            title="Improve your resume with AI suggestions"
          >
            <FeatureList items={HERO_FEATURES} />
          </GradientCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify().damping(14)} style={styles.uploadSection}>
          <UploadCard onPress={handleUpload} uploading={uploading} uploaded={resumes.length > 0} label="Upload Resume for Analysis" gradient={HERO_GRADIENT} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify().damping(14)}>
          <BlurView intensity={40} tint="light" style={styles.jdCard}>
            <Text style={styles.jdLabel}>Job Description <Text style={styles.jdOptional}>(Optional)</Text></Text>
            <TextInput
              value={jdText}
              onChangeText={setJdText}
              placeholder="Paste the job description here for ATS matching..."
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
              style={styles.jdInput}
            />
          </BlurView>
        </Animated.View>

        {loading && (
          <Animated.View entering={FadeInUp.springify()}>
            <AnalysisSkeleton />
          </Animated.View>
        )}

        {!loading && error && (
          <Animated.View entering={FadeInUp.springify()}>
            <GlassCard style={styles.errorCard}>
              <Ionicons name="alert-circle" size={32} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={fetchResumes} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </GlassCard>
          </Animated.View>
        )}

        {!loading && !error && resumes.length === 0 && (
          <EmptyToolState icon="document-text-outline" title="No resumes yet" message="Upload a resume to check its ATS compatibility score." actionLabel="Upload Resume" onAction={handleUpload} />
        )}

        {!loading && resumes.length > 0 && (
          <>
            <Animated.View entering={FadeInDown.delay(160).springify().damping(14)}>
              <GlassCard style={styles.scoreCard} glowColor={getScoreColor(displayScore)}>
                <View style={styles.scoreRow}>
                  <AnimatedScoreRing score={displayScore} label="ATS" />
                  <View style={styles.scoreInfo}>
                    <Text style={styles.scoreTitle}>ATS Score</Text>
                    <Text style={styles.scoreDesc}>{scoreDesc}</Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).springify().damping(14)}>
              <SectionHeader title="Recent Reports" icon="documents-outline" badge={resumes.length} />
            </Animated.View>
            {resumes.map((resume, index) => {
              const sc = resume.ats_score || 0;
              const v = sc >= 80 ? 'success' as const : sc >= 60 ? 'warning' as const : 'error' as const;
              return (
              <AnimatedCard key={resume.id || resume._id} index={index} delay={220}>
                <TouchableOpacity onPress={() => { setSelectedId(selectedId === (resume.id || resume._id) ? null : (resume.id || resume._id)); setAnalysis(null); }} activeOpacity={0.8}>
                  <BlurView intensity={40} tint="light" style={[styles.resumeCard, selectedId === resume._id && styles.resumeCardActive]}>
                    <LinearGradient colors={HERO_GRADIENT} style={styles.resumeIcon}>
                      <Ionicons name="document-text" size={18} color="#FFFFFF" />
                    </LinearGradient>
                    <View style={styles.resumeInfo}>
                      <Text style={styles.resumeName} numberOfLines={1}>{resume.original_filename}</Text>
                      <Text style={styles.resumeDate}>{formatDate(resume.created_at || '')}</Text>
                    </View>
                    <BadgePill label={`${sc}% ATS`} variant={v} />
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={styles.chevron} />
                  </BlurView>
                </TouchableOpacity>
              </AnimatedCard>
            );
            })}

            <Animated.View entering={FadeInDown.delay(300).springify().damping(14)} style={{ marginTop: spacing.sm }}>
              <GradientButton title={analyzing ? 'Analyzing...' : 'Analyze Resume'} icon="analytics" onPress={handleAnalyze} disabled={!selectedId} loading={analyzing} gradient={HERO_GRADIENT} />
            </Animated.View>

            {analyzing && (
              <Animated.View entering={FadeInUp.springify()} style={{ marginTop: spacing.md }}>
                <AnalysisSkeleton />
              </Animated.View>
            )}

            {analysis && !analyzing && (
              <Animated.View entering={FadeInUp.delay(100).springify().damping(14)} style={{ marginTop: spacing.md }}>
                <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                <View style={{ marginTop: spacing.md }}>
                  {activeTab === 'dashboard' && <DashboardTab analysis={analysis} />}
                  {activeTab === 'keywords' && <KeywordsTab analysis={analysis} />}
                  {activeTab === 'grammar' && <GrammarTab analysis={analysis} />}
                  {activeTab === 'formatting' && <FormattingTab analysis={analysis} />}
                  {activeTab === 'rewrite' && <RewriteTab analysis={analysis} />}
                </View>
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding(), paddingTop: spacing.md },
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
  chevron: { marginLeft: spacing.xs, opacity: 0.7 },
  uploadSection: { marginBottom: spacing.md, marginTop: spacing.md },
  jdCard: { padding: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.md, overflow: 'hidden' },
  jdLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  jdOptional: { fontSize: 12, fontWeight: '400', color: colors.textMuted },
  jdInput: { minHeight: 100, maxHeight: 180, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.sm + 4, fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.border, lineHeight: 20 },
  errorCard: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm, marginBottom: spacing.md },
  errorText: { fontSize: 14, color: colors.error, textAlign: 'center' },
  retryBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.error, borderRadius: borderRadius.full },
  retryText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  analysisSkeleton: { gap: spacing.md, paddingVertical: spacing.md },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pill: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs + 2, borderRadius: borderRadius.full },
  pillText: { fontSize: 12, fontWeight: '500' },
  issueCard: { padding: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.xs, overflow: 'hidden', gap: spacing.xs },
  issueTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  issueSuggestion: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  detailBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' },
  detailLabel: { fontSize: 11, fontWeight: '500', color: colors.textMuted },
  detailValue: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 1 },
  rewriteCard: { borderRadius: borderRadius.xl, overflow: 'hidden' },
  rewriteHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surfaceLight, borderBottomWidth: 1, borderBottomColor: colors.border },
  rewriteSection: { fontSize: 13, fontWeight: '600', color: colors.text, flex: 1, textTransform: 'capitalize' },
  rewriteCompare: { flexDirection: 'row' },
  rewriteOriginal: { flex: 1, padding: spacing.md, backgroundColor: colors.errorLight + '40' },
  rewriteImproved: { flex: 1, padding: spacing.md, backgroundColor: colors.successLight + '40' },
  rewriteDivider: { width: 1, backgroundColor: colors.border },
  rewriteLabel: { fontSize: 11, fontWeight: '700', color: colors.error, marginBottom: spacing.xs + 2, textTransform: 'uppercase' },
  rewriteText: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
  scoreLabel: { fontSize: 14, fontWeight: '700', marginTop: spacing.sm, textTransform: 'uppercase' },
});
