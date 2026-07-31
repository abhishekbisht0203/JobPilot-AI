import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import { aiApi } from '../../lib/api';
import {
  ScreenHeader, GradientButton, SectionHeader, TabBar,
  AnimatedScoreRing, InfoCard, ProgressBar, EmptyToolState,
} from '../../components/career-tools';
import {
  GradientCard, FeatureList, PrimaryButton, CTSectionHeader,
} from '../../components/career-tools/shared';
import { MockInterviewIllus } from '../../components/career-tools/illustrations';
import { GlobalHeader } from '../../components/GlobalHeader';

type Difficulty = 'easy' | 'medium' | 'hard';
type QuestionStatus = 'correct' | 'partial' | 'incorrect' | 'unanswered';
type ViewState = 'welcome' | 'interview' | 'evaluating' | 'results' | 'history';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: readonly [string, string];
  description: string;
}

interface QuestionResult {
  question: string;
  answer: string;
  score: number;
  status: QuestionStatus;
  feedback: string;
  idealAnswer: string;
  suggestions: string[];
  strengths: string[];
}

interface InterviewSession {
  id: string;
  date: string;
  category: string;
  difficulty: Difficulty;
  totalQuestions: number;
  timePerQuestion: number;
  jobDescription: string;
  questions: QuestionResult[];
  overallScore: number;
}

const HERO_GRADIENT = ['#059669', '#10B981'] as const;

const HERO_FEATURES = [
  { icon: 'mic', text: 'AI Interviewer' },
  { icon: 'chatbubbles', text: 'Real Questions' },
  { icon: 'flash', text: 'Instant Feedback' },
  { icon: 'trending-up', text: 'Track Progress' },
];

const CATEGORIES: Category[] = [
  { id: 'general', name: 'General', icon: 'chatbubbles', color: colors.accent.blue, gradient: ['#0A66C2', '#2563EB'] as const, description: 'Common interview questions for any role' },
  { id: 'technical', name: 'Technical', icon: 'code-slash', color: colors.accent.violet, gradient: ['#7C3AED', '#4F46E5'] as const, description: 'Coding, system design & technical concepts' },
  { id: 'behavioral', name: 'Behavioral', icon: 'people', color: colors.accent.teal, gradient: ['#0D9488', '#0891B2'] as const, description: 'STAR method & soft skill questions' },
  { id: 'leadership', name: 'Leadership', icon: 'trending-up', color: colors.accent.amber, gradient: ['#D97706', '#F59E0B'] as const, description: 'Management & leadership scenarios' },
  { id: 'problem-solving', name: 'Problem Solving', icon: 'bulb', color: colors.accent.pink, gradient: ['#DB2777', '#E11D48'] as const, description: 'Analytical & critical thinking challenges' },
  { id: 'situational', name: 'Situational', icon: 'alert-circle', color: colors.accent.orange, gradient: ['#EA580C', '#D97706'] as const, description: 'Hypothetical work scenarios & responses' },
];

const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
];

const QUESTION_COUNTS = [3, 5, 7];

const TIME_OPTIONS = [
  { label: '60s', value: 60 },
  { label: '120s', value: 120 },
  { label: '180s', value: 180 },
];

function TimerBar({ remaining, total }: { remaining: number; total: number }) {
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const barColor = pct > 50 ? colors.success : pct > 20 ? colors.warning : colors.error;
  return (
    <View style={styles.timerRow}>
      <Ionicons name="time-outline" size={16} color={pct > 20 ? colors.textMuted : colors.error} />
      <View style={styles.timerBg}>
        <View style={[styles.timerFill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={[styles.timerText, { color: pct <= 20 ? colors.error : colors.textSecondary }]}>{remaining}s</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: QuestionStatus }) {
  const config: Record<QuestionStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'default'; icon: string }> = {
    correct: { label: 'Correct', variant: 'success', icon: 'checkmark-circle' },
    partial: { label: 'Partial', variant: 'warning', icon: 'help-circle' },
    incorrect: { label: 'Incorrect', variant: 'error', icon: 'close-circle' },
    unanswered: { label: 'Unanswered', variant: 'default', icon: 'ellipse-outline' },
  };
  const c = config[status];
  return <Badge label={c.label} variant={c.variant} icon={c.icon as any} size="sm" />;
}

function evaluateAnswer(answer: string, _question: string): { score: number; status: QuestionStatus; feedback: string; idealAnswer: string; suggestions: string[]; strengths: string[] } {
  const trimmed = answer.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  if (!trimmed) {
    return {
      score: 0, status: 'unanswered',
      feedback: 'No answer provided. Take your time and try to structure a response using the STAR method.',
      idealAnswer: 'A strong answer includes a clear structure, specific examples, and relevant details that directly address the question.',
      suggestions: ['Always provide at least a brief answer even if unsure', 'Use the STAR method: Situation, Task, Action, Result'],
      strengths: [],
    };
  }

  const strengths: string[] = [];
  const suggestions: string[] = [];

  if (wordCount >= 50) strengths.push('Good length and detail');
  else if (wordCount >= 20) strengths.push('Adequate response length');
  else suggestions.push('Expand your answer with more specific details and examples');

  const hasStructure = /^(first|firstly|second|secondly|third|finally|in conclusion|i believe|in my experience|for example|specifically|ultimately)/i.test(trimmed);
  if (hasStructure) strengths.push('Well-structured response');
  else suggestions.push('Use a clear structure with an introduction, body, and conclusion');

  const hasExamples = /(for example|for instance|specifically|in my role|at my|i handled|i led|i managed|i created|i developed|i implemented)/i.test(trimmed);
  if (hasExamples) strengths.push('Includes concrete examples');
  else suggestions.push('Include specific examples from your experience');

  const hasKeywords = /(result|outcome|achieved|improved|increased|reduced|delivered|completed|successfully|learned)/i.test(trimmed);
  if (hasKeywords) strengths.push('Highlights results and achievements');
  else suggestions.push('Quantify your results with metrics where possible');

  if (wordCount < 5) {
    suggestions.push('Provide a more comprehensive answer');
  }

  const rawScore = Math.min(
    wordCount >= 60 ? 10 : wordCount >= 40 ? 8 : wordCount >= 20 ? 6 : wordCount >= 10 ? 4 : 2,
    10
  );
  const bonus = (hasExamples ? 1 : 0) + (hasKeywords ? 1 : 0) + (hasStructure ? 1 : 0);
  const totalScore = Math.min(rawScore + bonus, 10);
  const score = Math.max(totalScore, 0);

  let status: QuestionStatus;
  if (score >= 7) status = 'correct';
  else if (score >= 4) status = 'partial';
  else status = 'incorrect';

  const feedback = status === 'correct'
    ? 'Strong answer! You provided a well-structured response with relevant details and examples.'
    : status === 'partial'
      ? 'Decent attempt but could be stronger. Try adding more specific examples and structuring your response more clearly.'
      : 'Your answer needs more substance. Focus on providing detailed examples and following a clear structure.';

  const idealAnswer = 'A comprehensive answer includes: (1) a clear direct response to the question, (2) a specific example from your experience using the STAR method, (3) quantifiable results where possible, and (4) a brief connection back to the role you are applying for.';

  return { score, status, feedback, idealAnswer, suggestions, strengths };
}

export default function MockInterviewScreen() {
  const [view, setView] = useState<ViewState>('welcome');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [timePerQuestion, setTimePerQuestion] = useState(120);
  const [jobDesc, setJobDesc] = useState('');

  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [results, setResults] = useState<QuestionResult[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [historySession, setHistorySession] = useState<InterviewSession | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (view !== 'interview' || submitting) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [view, currentIndex, submitting, timeLeft]);

  const startInterview = async () => {
    if (!selectedCategory) return;
    if (!jobDesc.trim()) { setError('Please paste a job description'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.mockInterview({ job_description: jobDesc });
      const qs = res.data.data?.questions || res.data.questions || [];
      if (qs.length === 0) { setError('No questions generated. Try a different job description.'); setLoading(false); return; }
      const sliced = qs.slice(0, Math.min(qs.length, questionCount));
      setQuestions(sliced);
      setAnswers([]);
      setCurrentIndex(0);
      setAnswer('');
      setTimeLeft(timePerQuestion);
      setView('interview');
    } catch {
      setError('Failed to generate questions. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (submitting) return;
    setSubmitting(true);
    const currentAnswer = answer;
    setAnswers(prev => [...prev, currentAnswer]);
    setAnswer('');

    if (currentIndex < questions.length - 1) {
      setView('evaluating');
      await new Promise(r => setTimeout(r, 800));
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(timePerQuestion);
      setSubmitting(false);
      setView('interview');
    } else {
      setView('evaluating');
      const allAnswers = [...answers, currentAnswer];
      const evalResults = questions.map((q, i) => ({
        question: q,
        answer: allAnswers[i] || '',
        ...evaluateAnswer(allAnswers[i] || '', q),
      }));
      const total = evalResults.reduce((sum, r) => sum + r.score, 0);
      const avg = questions.length > 0 ? (total / (questions.length * 10)) * 100 : 0;
      setResults(evalResults);
      setOverallScore(Math.round(avg));

      await new Promise(r => setTimeout(r, 600));

      const session: InterviewSession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        category: selectedCategory?.name || 'General',
        difficulty,
        totalQuestions: questions.length,
        timePerQuestion,
        jobDescription: jobDesc,
        questions: evalResults,
        overallScore: Math.round(avg),
      };
      setHistory(prev => [session, ...prev]);
      setSubmitting(false);
      setView('results');
    }
  };

  const handleAutoSubmit = () => {
    if (submitting) return;
    setAnswer(prev => prev || '');
    submitAnswer();
  };

  const resetAll = () => {
    setView('welcome');
    setQuestions([]);
    setCurrentIndex(0);
    setAnswer('');
    setAnswers([]);
    setResults([]);
    setOverallScore(0);
    setError(null);
    setSubmitting(false);
  };

  const viewSession = (session: InterviewSession) => {
    setHistorySession(session);
    setView('history');
  };

  const renderCategoryCard = (cat: Category, idx: number) => {
    const isSelected = selectedCategory?.id === cat.id;
    return (
      <Animated.View key={cat.id} entering={FadeInDown.delay(idx * 80).springify().damping(14)} style={styles.catWrap}>
        <TouchableOpacity onPress={() => setSelectedCategory(isSelected ? null : cat)} activeOpacity={0.8}>
          <BlurView intensity={40} tint="light" style={[styles.catCard, isSelected && { borderColor: cat.color, borderWidth: 2 }]}>
            <LinearGradient colors={cat.gradient} style={styles.catIcon}>
              <Ionicons name={cat.icon as any} size={22} color="#FFF" />
            </LinearGradient>
            <Text style={styles.catName}>{cat.name}</Text>
            <Text style={styles.catDesc}>{cat.description}</Text>
            {isSelected && (
              <View style={[styles.catSelectedRing, { backgroundColor: cat.color }]}>
                <Ionicons name="checkmark" size={14} color="#FFF" />
              </View>
            )}
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderWelcome = () => (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Mock Interview" subtitle="AI-powered interview practice" icon="mic" iconColors={HERO_GRADIENT} />

      <View style={styles.content}>
        <GradientCard colors={HERO_GRADIENT} illustration={<MockInterviewIllus />} title="Practice with AI Interviewer">
          <Text style={styles.heroSub}>Face real interview questions with instant AI feedback and score your performance.</Text>
          <FeatureList items={HERO_FEATURES} />
        </GradientCard>

        <View style={styles.section}>
          <CTSectionHeader title="Category" icon="grid-outline" />
          <View style={styles.catGrid}>
            {CATEGORIES.map((cat, i) => renderCategoryCard(cat, i))}
          </View>
        </View>

        <Animated.View entering={FadeInDown.delay(300).springify().damping(14)} style={styles.section}>
          <CTSectionHeader title="Configuration" icon="settings-outline" />
          <GlassCard style={styles.configCard}>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>Difficulty</Text>
              <View style={styles.segmentRow}>
                {DIFFICULTIES.map(d => (
                  <TouchableOpacity key={d.key} onPress={() => setDifficulty(d.key)} activeOpacity={0.7}
                    style={[styles.segment, difficulty === d.key && styles.segmentActive]}>
                    <Text style={[styles.segmentText, difficulty === d.key && styles.segmentTextActive]}>{d.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>Questions</Text>
              <View style={styles.segmentRow}>
                {QUESTION_COUNTS.map(n => (
                  <TouchableOpacity key={n} onPress={() => setQuestionCount(n)} activeOpacity={0.7}
                    style={[styles.segment, questionCount === n && styles.segmentActive]}>
                    <Text style={[styles.segmentText, questionCount === n && styles.segmentTextActive]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>Time per Q</Text>
              <View style={styles.segmentRow}>
                {TIME_OPTIONS.map(t => (
                  <TouchableOpacity key={t.value} onPress={() => setTimePerQuestion(t.value)} activeOpacity={0.7}
                    style={[styles.segment, timePerQuestion === t.value && styles.segmentActive]}>
                    <Text style={[styles.segmentText, timePerQuestion === t.value && styles.segmentTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify().damping(14)} style={styles.section}>
          <CTSectionHeader title="Job Description" icon="document-text-outline" />
          <GlassCard style={styles.descCard}>
            <TextInput
              style={styles.textArea}
              placeholder="Paste the job description here to get tailored questions..."
              placeholderTextColor={colors.textMuted}
              value={jobDesc}
              onChangeText={setJobDesc}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </GlassCard>
        </Animated.View>

        {error && (
          <Animated.View entering={FadeInUp.springify().damping(14)} style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}

        <View style={styles.startBtnWrap}>
          <PrimaryButton
            title="Start Mock Interview"
            icon="mic"
            onPress={startInterview}
            loading={loading}
            disabled={!selectedCategory || !jobDesc.trim() || loading}
            gradient={HERO_GRADIENT}
          />
          {history.length > 0 && (
            <TouchableOpacity onPress={() => { setHistorySession(null); setView('history'); }} style={styles.historyBtn}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.historyBtnText}>History ({history.length})</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );

  const renderInterview = () => {
    if (!questions.length) return <Loader fullScreen message="Loading questions..." />;
    const question = questions[currentIndex];
    const total = questions.length;
    const progress = ((currentIndex) / total) * 100;

    return (
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Mock Interview" subtitle={`${selectedCategory?.name || 'Interview'} · ${difficulty}`} icon="mic" iconColors={HERO_GRADIENT} />

        <View style={styles.content}>
          <Animated.View key={currentIndex} entering={FadeInUp.springify().damping(14)}>
            <GlassCard style={styles.interviewCard}>
              <View style={styles.qHeader}>
                <View style={styles.qMeta}>
                  <Badge label={`Q${currentIndex + 1}/${total}`} variant="primary" size="sm" />
                  <Badge label={difficulty} variant="default" size="sm" />
                </View>
                <View style={styles.progressDots}>
                  {Array.from({ length: total }).map((_, i) => (
                    <View key={i} style={[styles.dot, i <= currentIndex && styles.dotActive]} />
                  ))}
                </View>
              </View>

              <ProgressBar value={progress} color={colors.accent.emerald} height={4} />

              <View style={styles.timerSection}>
                <TimerBar remaining={timeLeft} total={timePerQuestion} />
              </View>

              <Text style={styles.questionText}>{question}</Text>

              <View style={styles.answerSection}>
                <Text style={styles.answerLabel}>Your Answer</Text>
                <TextInput
                  style={styles.answerInput}
                  placeholder="Type your answer here..."
                  placeholderTextColor={colors.textMuted}
                  value={answer}
                  onChangeText={setAnswer}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{answer.length} characters</Text>
              </View>

              <GradientButton
                title={currentIndex < total - 1 ? 'Next Question' : 'Finish'}
                icon={currentIndex < total - 1 ? 'arrow-forward' : 'checkmark'}
                onPress={submitAnswer}
                loading={submitting}
                disabled={!answer.trim() || submitting}
                gradient={HERO_GRADIENT}
              />

              {currentIndex < total - 1 && (
                <TouchableOpacity onPress={handleAutoSubmit} disabled={submitting} style={styles.skipBtn}>
                  <Text style={styles.skipText}>Skip question (time expires automatically)</Text>
                </TouchableOpacity>
              )}
            </GlassCard>
          </Animated.View>
        </View>
      </ScrollView>
    );
  };

  const renderEvaluating = () => (
    <View style={styles.loadingContainer}>
      <Loader fullScreen message="Evaluating your answer..." />
      <View style={styles.evalSteps}>
        {['Analyzing response', 'Checking structure', 'Scoring quality', 'Generating feedback'].map((step, i) => (
          <Animated.View key={step} entering={FadeInUp.delay(i * 200).springify().damping(14)} style={styles.evalStep}>
            <LinearGradient colors={HERO_GRADIENT} style={styles.evalDot} />
            <Text style={styles.evalStepText}>{step}...</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const renderResults = () => {
    const correct = results.filter(r => r.status === 'correct').length;
    const partial = results.filter(r => r.status === 'partial').length;
    const incorrect = results.filter(r => r.status === 'incorrect').length;
    const unanswered = results.filter(r => r.status === 'unanswered').length;

    return (
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Interview Complete" subtitle="Here is your performance summary" icon="trophy" iconColors={HERO_GRADIENT} />

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.springify().damping(14)} style={styles.section}>
            <GlassCard style={styles.scoreOverview}>
              <AnimatedScoreRing score={overallScore} size={120} strokeWidth={8} label="Overall" />
              <Text style={styles.scoreMessage}>{overallScore >= 80 ? 'Excellent!' : overallScore >= 60 ? 'Good Job!' : overallScore >= 40 ? 'Keep Practicing' : 'Needs Improvement'}</Text>
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownNum, { color: colors.success }]}>{correct}</Text>
                  <Text style={styles.breakdownLabel}>Correct</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownNum, { color: colors.warning }]}>{partial}</Text>
                  <Text style={styles.breakdownLabel}>Partial</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownNum, { color: colors.error }]}>{incorrect}</Text>
                  <Text style={styles.breakdownLabel}>Incorrect</Text>
                </View>
                {unanswered > 0 && (
                  <View style={styles.breakdownItem}>
                    <Text style={[styles.breakdownNum, { color: colors.textMuted }]}>{unanswered}</Text>
                    <Text style={styles.breakdownLabel}>Unanswered</Text>
                  </View>
                )}
              </View>
            </GlassCard>
          </Animated.View>

          <View style={styles.section}>
            <SectionHeader title="Question Review" icon="list-outline" />
            {results.map((r, i) => (
              <Animated.View key={i} entering={FadeInDown.delay(i * 100).springify().damping(14)}>
                <GlassCard style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewQMeta}>
                      <Text style={styles.reviewQNum}>Q{i + 1}</Text>
                      <StatusBadge status={r.status} />
                    </View>
                    <Text style={[styles.reviewScore, { color: r.score >= 7 ? colors.success : r.score >= 4 ? colors.warning : colors.error }]}>{r.score}/10</Text>
                  </View>
                  <Text style={styles.reviewQuestion}>{r.question}</Text>

                  <View style={styles.reviewSection}>
                    <Text style={styles.reviewSectionLabel}>Your Answer:</Text>
                    <Text style={styles.reviewSectionText}>{r.answer || 'No answer provided'}</Text>
                  </View>

                  <View style={[styles.reviewSection, styles.idealSection]}>
                    <Text style={styles.idealLabel}>Ideal Answer:</Text>
                    <Text style={styles.idealText}>{r.idealAnswer}</Text>
                  </View>

                  <View style={[styles.reviewSection, styles.feedbackSection]}>
                    <Text style={styles.feedbackLabel}>AI Feedback:</Text>
                    <Text style={styles.feedbackText}>{r.feedback}</Text>
                  </View>

                  {r.suggestions.length > 0 && (
                    <View style={styles.reviewSection}>
                      <Text style={styles.suggestionsLabel}>Suggestions:</Text>
                      {r.suggestions.map((s, si) => (
                        <View key={si} style={styles.suggestionRow}>
                          <Ionicons name="arrow-forward" size={12} color={colors.accent.amber} />
                          <Text style={styles.suggestionText}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {r.strengths.length > 0 && (
                    <View style={styles.reviewSection}>
                      <Text style={styles.strengthsLabel}>Strengths:</Text>
                      {r.strengths.map((s, si) => (
                        <View key={si} style={styles.suggestionRow}>
                          <Ionicons name="checkmark" size={12} color={colors.success} />
                          <Text style={styles.strengthText}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </GlassCard>
              </Animated.View>
            ))}
          </View>

          <View style={styles.resultsActions}>
            <GradientButton title="Practice Again" icon="refresh" onPress={resetAll} gradient={HERO_GRADIENT} />
            <TouchableOpacity onPress={() => console.log('PDF report export - session:', { overallScore, results, category: selectedCategory?.name, difficulty, date: new Date().toISOString() })} style={styles.pdfBtn}>
              <Ionicons name="document-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.pdfBtnText}>Export PDF Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderHistory = () => {
    const sessions = historySession ? [historySession] : history;

    if (sessions.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <EmptyToolState icon="time-outline" title="No History" message="Complete an interview to see your past sessions here." actionLabel="Start Interview" onAction={resetAll} />
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Interview History" subtitle="Your past practice sessions" icon="time" iconColors={HERO_GRADIENT} />

        <View style={styles.content}>
          <View style={styles.section}>
            {!historySession && (
              <TouchableOpacity onPress={resetAll} style={styles.backLink}>
                <Ionicons name="arrow-back" size={18} color={colors.accent.emerald} />
                <Text style={styles.backLinkText}>Back to Interview</Text>
              </TouchableOpacity>
            )}

            {sessions.map((s, i) => {
              const statusCount = {
                correct: s.questions.filter(q => q.status === 'correct').length,
                partial: s.questions.filter(q => q.status === 'partial').length,
                incorrect: s.questions.filter(q => q.status === 'incorrect').length,
              };
              return (
                <Animated.View key={s.id} entering={FadeInDown.delay(i * 80).springify().damping(14)}>
                  <TouchableOpacity onPress={() => historySession ? null : viewSession(s)} activeOpacity={historySession ? 1 : 0.7}>
                    <GlassCard style={styles.historyCard}>
                      <View style={styles.historyTop}>
                        <View style={styles.historyMeta}>
                          <LinearGradient colors={HERO_GRADIENT} style={styles.historyIcon}>
                            <Ionicons name="mic" size={18} color="#FFF" />
                          </LinearGradient>
                          <View>
                            <Text style={styles.historyCategory}>{s.category}</Text>
                            <Text style={styles.historyDate}>{new Date(s.date).toLocaleDateString()} · {s.difficulty} · {s.totalQuestions} questions</Text>
                          </View>
                        </View>
                        <Text style={[styles.historyScore, { color: s.overallScore >= 60 ? colors.accent.emerald : colors.error }]}>{s.overallScore}%</Text>
                      </View>
                      {!historySession && (
                        <View style={styles.historyStatusRow}>
                          <View style={styles.historyStatusItem}><Text style={[styles.historyStatusNum, { color: colors.success }]}>{statusCount.correct}</Text><Text style={styles.historyStatusLabel}>Correct</Text></View>
                          <View style={styles.historyStatusItem}><Text style={[styles.historyStatusNum, { color: colors.warning }]}>{statusCount.partial}</Text><Text style={styles.historyStatusLabel}>Partial</Text></View>
                          <View style={styles.historyStatusItem}><Text style={[styles.historyStatusNum, { color: colors.error }]}>{statusCount.incorrect}</Text><Text style={styles.historyStatusLabel}>Incorrect</Text></View>
                        </View>
                      )}
                      {!historySession && (
                        <View style={styles.historyArrow}>
                          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                        </View>
                      )}
                      {historySession && (
                        <View style={styles.historyDetailSection}>
                          <Text style={styles.jdLabel}>Job Description:</Text>
                          <Text style={styles.jdText} numberOfLines={3}>{s.jobDescription}</Text>
                        </View>
                      )}
                    </GlassCard>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {historySession && (
            <View style={styles.historyBackWrap}>
              <GradientButton title="Back to History" icon="arrow-back" onPress={() => setHistorySession(null)} gradient={['#4B5563', '#6B7280']} />
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <GlobalHeader />
      {view === 'welcome' && renderWelcome()}
      {view === 'interview' && renderInterview()}
      {view === 'evaluating' && renderEvaluating()}
      {view === 'results' && renderResults()}
      {view === 'history' && renderHistory()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 60 },
  content: { paddingHorizontal: spacing.lg },
  section: { marginTop: spacing.lg },
  loadingContainer: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },

  heroSub: { color: 'rgba(255,255,255,0.92)', fontSize: 13, lineHeight: 19, marginBottom: spacing.md },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catWrap: { width: '48%' },
  catCard: { padding: spacing.md, borderRadius: borderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderLight, minHeight: 130, ...shadow.sm },
  catIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  catName: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
  catDesc: { fontSize: 11, color: colors.textMuted, lineHeight: 15 },
  catSelectedRing: { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },

  configCard: { padding: spacing.md, gap: spacing.md },
  configRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  configLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  segmentRow: { flexDirection: 'row', gap: spacing.xs },
  segment: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  segmentActive: { backgroundColor: colors.accent.emerald, borderColor: colors.accent.emerald },
  segmentText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  segmentTextActive: { color: '#FFF', fontWeight: '600' },

  descCard: { padding: spacing.md },
  textArea: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, padding: spacing.md, color: colors.text, fontSize: 14, borderWidth: 1, borderColor: colors.border, minHeight: 120, textAlignVertical: 'top' },

  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.errorLight, borderRadius: borderRadius.md },
  errorText: { color: colors.error, fontSize: 13, flex: 1 },

  startBtnWrap: { paddingTop: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  historyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.md },
  historyBtnText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },

  interviewCard: { padding: spacing.lg, gap: spacing.md },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qMeta: { flexDirection: 'row', gap: spacing.xs },
  progressDots: { flexDirection: 'row', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.borderLight },
  dotActive: { backgroundColor: colors.accent.emerald },

  timerSection: { marginVertical: spacing.xs },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  timerBg: { flex: 1, height: 6, backgroundColor: colors.borderLight, borderRadius: 3, overflow: 'hidden' },
  timerFill: { height: 6, borderRadius: 3 },
  timerText: { fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'], minWidth: 40, textAlign: 'right' },

  questionText: { fontSize: 17, fontWeight: '600', color: colors.text, lineHeight: 26 },

  answerSection: { gap: spacing.sm },
  answerLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  answerInput: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, padding: spacing.md, color: colors.text, fontSize: 14, borderWidth: 1, borderColor: colors.border, minHeight: 140, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: colors.textMuted, textAlign: 'right' },

  skipBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  skipText: { fontSize: 12, color: colors.textMuted },

  evalSteps: { paddingHorizontal: spacing.xl, gap: spacing.md, marginTop: spacing.xxl },
  evalStep: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  evalDot: { width: 10, height: 10, borderRadius: 5 },
  evalStepText: { fontSize: 14, color: colors.textSecondary },

  scoreOverview: { padding: spacing.lg, alignItems: 'center', gap: spacing.md },
  scoreMessage: { fontSize: 20, fontWeight: '700', color: colors.text },
  breakdownRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  breakdownItem: { alignItems: 'center' },
  breakdownNum: { fontSize: 22, fontWeight: '800' },
  breakdownLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  reviewCard: { padding: spacing.md, gap: spacing.sm, marginBottom: spacing.sm },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewQMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reviewQNum: { fontSize: 15, fontWeight: '700', color: colors.text },
  reviewScore: { fontSize: 18, fontWeight: '800' },
  reviewQuestion: { fontSize: 14, color: colors.text, fontWeight: '500', lineHeight: 20 },

  reviewSection: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, padding: spacing.md },
  reviewSectionLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.xs },
  reviewSectionText: { fontSize: 13, color: colors.text, lineHeight: 18 },

  idealSection: { backgroundColor: colors.successLight },
  idealLabel: { fontSize: 12, fontWeight: '600', color: colors.success, marginBottom: spacing.xs },
  idealText: { fontSize: 13, color: colors.success, lineHeight: 18 },

  feedbackSection: { backgroundColor: colors.warningLight },
  feedbackLabel: { fontSize: 12, fontWeight: '600', color: colors.warning, marginBottom: spacing.xs },
  feedbackText: { fontSize: 13, color: colors.text, lineHeight: 18 },

  suggestionsLabel: { fontSize: 12, fontWeight: '600', color: colors.accent.amber, marginBottom: spacing.xs },
  suggestionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, marginBottom: 2 },
  suggestionText: { fontSize: 13, color: colors.textSecondary, flex: 1 },

  strengthsLabel: { fontSize: 12, fontWeight: '600', color: colors.success, marginBottom: spacing.xs },
  strengthText: { fontSize: 13, color: colors.textSecondary, flex: 1 },

  resultsActions: { paddingTop: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  pdfBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.md },
  pdfBtnText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },

  backLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  backLinkText: { fontSize: 14, color: colors.accent.emerald, fontWeight: '500' },

  historyCard: { padding: spacing.md, gap: spacing.sm, marginBottom: spacing.sm },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  historyIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  historyCategory: { fontSize: 15, fontWeight: '700', color: colors.text },
  historyDate: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  historyScore: { fontSize: 20, fontWeight: '800' },
  historyStatusRow: { flexDirection: 'row', gap: spacing.lg, marginLeft: 52 },
  historyStatusItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  historyStatusNum: { fontSize: 14, fontWeight: '700' },
  historyStatusLabel: { fontSize: 11, color: colors.textMuted },
  historyArrow: { position: 'absolute', right: spacing.md, top: '50%', marginTop: -9 },
  historyDetailSection: { marginTop: spacing.sm },
  jdLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', marginBottom: 2 },
  jdText: { fontSize: 12, color: colors.textSecondary, lineHeight: 16 },
  historyBackWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
});
