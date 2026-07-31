import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { ScreenHeader, SectionHeader, GradientButton, TabBar, InfoCard, ProgressBar } from '../../../components/career-tools';
import { SearchBar, TopicCard, AnimatedCard, BadgePill, GradientCard, FeatureList } from '../../../components/career-tools/shared';
import { resourceApi } from '../../../lib/api';

const HERO_GRADIENT = colors.tool.interviewPrep;
const HERO_FEATURES = [
  { icon: 'help-circle', text: 'Curated Questions' },
  { icon: 'apps', text: 'Topic Wise' },
  { icon: 'trending-up', text: 'Track Progress' },
];

interface QuestionItem {
  text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface QuestionCategory {
  category: string;
  icon: string;
  questions: QuestionItem[];
}

const QUESTIONS: QuestionCategory[] = [
  {
    category: 'General',
    icon: 'person',
    questions: [
      { text: 'Tell me about yourself.', difficulty: 'Easy' },
      { text: 'Why do you want to work here?', difficulty: 'Easy' },
      { text: 'Where do you see yourself in 5 years?', difficulty: 'Medium' },
      { text: 'What are your greatest strengths and weaknesses?', difficulty: 'Medium' },
      { text: 'Describe your ideal work environment.', difficulty: 'Easy' },
      { text: 'What motivates you professionally?', difficulty: 'Medium' },
    ],
  },
  {
    category: 'Technical',
    icon: 'code-slash',
    questions: [
      { text: 'Explain a challenging project you worked on.', difficulty: 'Medium' },
      { text: 'How do you stay updated with industry trends?', difficulty: 'Easy' },
      { text: 'Describe your development workflow.', difficulty: 'Medium' },
      { text: 'How do you handle technical debt?', difficulty: 'Hard' },
      { text: 'Explain a time you optimized performance.', difficulty: 'Hard' },
      { text: 'How do you approach debugging?', difficulty: 'Medium' },
    ],
  },
  {
    category: 'Behavioral',
    icon: 'people',
    questions: [
      { text: 'Describe a time you had a conflict at work.', difficulty: 'Medium' },
      { text: 'Tell me about a failure and what you learned.', difficulty: 'Medium' },
      { text: 'How do you handle tight deadlines?', difficulty: 'Easy' },
      { text: 'Give an example of leadership.', difficulty: 'Hard' },
      { text: 'Describe a time you went above and beyond.', difficulty: 'Medium' },
      { text: 'How do you handle constructive criticism?', difficulty: 'Easy' },
    ],
  },
  {
    category: 'Career',
    icon: 'trending-up',
    questions: [
      { text: 'Why are you leaving your current role?', difficulty: 'Medium' },
      { text: 'What type of work environment do you prefer?', difficulty: 'Easy' },
      { text: 'What are your salary expectations?', difficulty: 'Hard' },
      { text: 'Do you have any questions for us?', difficulty: 'Easy' },
      { text: 'What do you know about our company?', difficulty: 'Easy' },
      { text: 'How does this role fit your career goals?', difficulty: 'Medium' },
    ],
  },
];

const TIPS = [
  { icon: 'mic-outline', title: 'Practice Out Loud', body: 'Record yourself answering questions to improve delivery and confidence.' },
  { icon: 'search-outline', title: 'Research the Company', body: 'Understand their products, culture, and recent news before the interview.' },
  { icon: 'chatbubbles-outline', title: 'Use the STAR Method', body: 'Structure answers with Situation, Task, Action, Result for clarity.' },
  { icon: 'time-outline', title: 'Prepare Questions', body: 'Always have 3-5 thoughtful questions ready for the interviewer.' },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: colors.success,
  Medium: colors.warning,
  Hard: colors.error,
};

const TABS = [
  { key: 'tips', label: 'Tips', icon: 'bulb-outline' },
  { key: 'questions', label: 'Questions', icon: 'help-circle-outline' },
  { key: 'custom', label: 'Custom', icon: 'add-circle-outline' },
];

export default function InterviewPrepScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [activeTab, setActiveTab] = useState('tips');
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customQ, setCustomQ] = useState('');
  const [customQs, setCustomQs] = useState<string[]>([]);
  const [reviewedCount, setReviewedCount] = useState<Record<string, number>>({});
  const [apiQuestions, setApiQuestions] = useState<QuestionCategory[] | null>(null);
  const [loadingApi, setLoadingApi] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await resourceApi.list({ type: 'question', per_page: 50 });
        const items = Array.isArray(res.data) ? res.data : res.data?.data || [];
        if (items.length > 0) {
          const cats: QuestionCategory[] = [];
          const map = new Map<string, any[]>();
          for (const q of items) {
            const cat = q.category || 'General';
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat)!.push({ text: q.title || q.question || q.content, difficulty: q.difficulty || 'Medium' });
          }
          const icons: Record<string, string> = { General: 'person', Technical: 'code-slash', Behavioral: 'people', Career: 'trending-up', Leadership: 'shield', 'Problem Solving': 'bulb' };
          for (const [category, questions] of map) {
            if (questions.length > 0) cats.push({ category, icon: icons[category] || 'help-circle', questions: questions.slice(0, 10) });
          }
          if (cats.length > 0) setApiQuestions(cats);
        }
      } catch {} finally { setLoadingApi(false); }
    })();
  }, []);

  const displayedCategories = apiQuestions || QUESTIONS;

  const addCustomQuestion = useCallback(() => {
    if (!customQ.trim()) return;
    setCustomQs(prev => [...prev, customQ.trim()]);
    setCustomQ('');
  }, [customQ]);

  const removeCustomQuestion = useCallback((index: number) => {
    setCustomQs(prev => prev.filter((_, i) => i !== index));
  }, []);

  const markReviewed = useCallback((category: string) => {
    setReviewedCount(prev => ({
      ...prev,
      [category]: Math.min((prev[category] || 0) + 1, displayedCategories.find(c => c.category === category)?.questions.length || 0),
    }));
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return displayedCategories;
    const q = searchQuery.toLowerCase();
    return displayedCategories.map(cat => ({
      ...cat,
      questions: cat.questions.filter(qi => qi.text.toLowerCase().includes(q)),
    })).filter(cat => cat.questions.length > 0);
  }, [searchQuery]);

  const tipsTab = (
    <View>
      <SectionHeader title="Interview Tips" icon="bulb-outline" />
      {TIPS.map((tip, index) => (
        <Animated.View key={tip.title} entering={FadeInDown.delay(200 + index * 60).springify().damping(14)}>
          <BlurView intensity={40} tint="light" style={styles.tipCard}>
            <LinearGradient colors={HERO_GRADIENT} style={styles.tipIcon}>
              <Ionicons name={tip.icon as any} size={18} color="#FFFFFF" />
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipBody}>{tip.body}</Text>
            </View>
          </BlurView>
        </Animated.View>
      ))}
    </View>
  );

  const questionsTab = (
    <View>
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search questions..." />

      <SectionHeader title="Practice Questions" icon="help-circle-outline" />
      {filteredCategories.map((cat, ci) => {
        const total = cat.questions.length;
        const reviewed = reviewedCount[cat.category] || 0;
        return (
          <TopicCard
            key={cat.category}
            title={cat.category}
            icon={cat.icon}
            completion={total > 0 ? Math.round((reviewed / total) * 100) : 0}
            questionCount={total}
            gradientColors={HERO_GRADIENT}
            onPress={() => setExpandedCat(expandedCat === cat.category ? null : cat.category)}
          />
        );
      })}

      {filteredCategories.length === 0 && (
        <EmptyState icon="search-outline" title="No questions found" message="Try a different search term." />
      )}
    </View>
  );

  const customTab = (
    <View>
      <GlassCard style={styles.customCard} glowColor={colors.accent.pink}>
        <Text style={styles.customTitle}>Add Your Own Question</Text>
        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            placeholder="Type a question..."
            placeholderTextColor={colors.textMuted}
            value={customQ}
            onChangeText={setCustomQ}
            onSubmitEditing={addCustomQuestion}
          />
          <TouchableOpacity onPress={addCustomQuestion} disabled={!customQ.trim()} style={[styles.customAddBtn, { opacity: customQ.trim() ? 1 : 0.5 }]}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </GlassCard>

      {customQs.length > 0 && (
        <>
          <SectionHeader title="Your Questions" icon="bookmark-outline" badge={customQs.length} />
          {customQs.map((q, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(200 + i * 40).springify().damping(14)}>
              <BlurView intensity={40} tint="light" style={styles.customQCard}>
                <View style={[styles.qDot, { backgroundColor: colors.accent.pink }]} />
                <Text style={styles.qText}>{q}</Text>
                <TouchableOpacity onPress={() => removeCustomQuestion(i)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                </TouchableOpacity>
              </BlurView>
            </Animated.View>
          ))}
        </>
      )}

      {customQs.length === 0 && (
        <EmptyState icon="bookmarks-outline" title="No custom questions" message="Add your own interview questions above to practice." />
      )}

      <TouchableOpacity onPress={() => (router as any).push?.('/ai/mock-interview')} style={styles.mockBtn} activeOpacity={0.8}>
        <LinearGradient colors={HERO_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mockGradient}>
          <Ionicons name="mic" size={20} color="#FFFFFF" />
          <Text style={styles.mockText}> Practice with AI Mock Interview</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Interview Prep" subtitle="Practice interview questions" icon="book" iconColors={HERO_GRADIENT} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.delay(60).springify().damping(14)}>
          <GradientCard
            colors={HERO_GRADIENT}
            icon="book"
            title="Prepare for your dream job"
            subtitle="Curated questions, tips, and guidance"
          >
            <FeatureList items={HERO_FEATURES} color="#BFDBFE" />
          </GradientCard>
        </Animated.View>

        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'tips' && tipsTab}
        {activeTab === 'questions' && questionsTab}
        {activeTab === 'custom' && customTab}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding(), paddingTop: spacing.md },
  tipCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.sm, overflow: 'hidden' },
  tipIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tipTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  tipBody: { fontSize: 13, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  searchCard: { marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: spacing.xs },
  categoryCard: { padding: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.sm, overflow: 'hidden' },
  categoryHeader: { flexDirection: 'row', alignItems: 'center' },
  categoryIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  categoryName: { fontSize: 15, fontWeight: '600', color: colors.text },
  categoryCount: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  categoryRight: { flexDirection: 'row', alignItems: 'center' },
  categoryProgress: { marginTop: spacing.sm, marginBottom: spacing.xs },
  qList: { marginTop: spacing.md, gap: spacing.sm },
  qItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  qDot: { width: 8, height: 8, borderRadius: 4 },
  qText: { fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 18 },
  customCard: { marginBottom: spacing.md },
  customTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  customRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  customInput: { flex: 1, backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: 14, color: colors.text },
  customAddBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accent.pink, justifyContent: 'center', alignItems: 'center' },
  customQCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.sm, overflow: 'hidden' },
  deleteBtn: { padding: spacing.xs },
  mockBtn: { marginTop: spacing.lg, marginBottom: spacing.md },
  mockGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, borderRadius: borderRadius.lg, gap: spacing.sm, ...shadow.glow.primary },
  mockText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
