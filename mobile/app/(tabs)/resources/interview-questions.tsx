import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Badge } from '../../../components/ui/Badge';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';

type QuestionCategory = 'Behavioral' | 'Technical' | 'HR' | 'Role-Specific' | 'All';

interface InterviewQ {
  id: string;
  question: string;
  answer: string;
  category: QuestionCategory;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  company?: string;
}

const QUESTIONS: InterviewQ[] = [
  { id: '1', question: 'Tell me about yourself', answer: 'Start with your current role, highlight 2-3 key achievements, and explain why you are looking for the next opportunity. Keep it under 2 minutes and connect your experience to the role.', category: 'Behavioral', difficulty: 'Easy' },
  { id: '2', question: 'Describe a time you faced a challenge at work', answer: 'Use the STAR method: describe the Situation, Task, Action you took, and Result. Choose a challenge that shows problem-solving, resilience, and a positive outcome.', category: 'Behavioral', difficulty: 'Medium' },
  { id: '3', question: 'Why do you want to work here?', answer: 'Research the company thoroughly. Mention specific projects, values, or culture aspects that resonate with you. Connect your skills to their needs and show genuine enthusiasm.', category: 'Behavioral', difficulty: 'Easy' },
  { id: '4', question: 'Tell me about a time you worked in a team', answer: 'Describe a collaborative project where you contributed to team success. Highlight communication, conflict resolution, and how you handled differing opinions.', category: 'Behavioral', difficulty: 'Medium' },
  { id: '5', question: 'What is your greatest weakness?', answer: 'Choose a real weakness that you are actively working to improve. Explain the steps you are taking and show self-awareness. Avoid clichés like "I work too hard."', category: 'Behavioral', difficulty: 'Easy' },
  { id: '6', question: 'Explain the difference between var, let, and const', answer: 'var is function-scoped and can be redeclared. let is block-scoped and can be reassigned. const is block-scoped and cannot be reassigned. Use const by default, let when reassignment is needed.', category: 'Technical', difficulty: 'Easy', company: 'Tech' },
  { id: '7', question: 'What is the time complexity of binary search?', answer: 'Binary search has O(log n) time complexity. It works by repeatedly dividing the search interval in half. Requires a sorted array and is much faster than linear search for large datasets.', category: 'Technical', difficulty: 'Medium', company: 'Tech' },
  { id: '8', question: 'Explain RESTful API design principles', answer: 'REST uses HTTP methods (GET, POST, PUT, DELETE) for CRUD operations. Resources are identified by URLs. Stateless communication, proper status codes, and consistent naming conventions are key.', category: 'Technical', difficulty: 'Medium', company: 'Tech' },
  { id: '9', question: 'What is the difference between SQL and NoSQL?', answer: 'SQL databases are relational with structured schemas and ACID compliance. NoSQL databases are flexible, scale horizontally, and handle unstructured data well. Choose based on your data model needs.', category: 'Technical', difficulty: 'Medium', company: 'Tech' },
  { id: '10', question: 'Explain the concept of Big O notation', answer: 'Big O describes algorithm efficiency in terms of input size. It measures worst-case time or space complexity. Common complexities: O(1), O(log n), O(n), O(n log n), O(n²).', category: 'Technical', difficulty: 'Hard', company: 'Tech' },
  { id: '11', question: 'Where do you see yourself in 5 years?', answer: 'Be honest but align your goals with growth opportunities at the company. Mention skills you want to develop and roles you aspire to. Show ambition without suggesting you will leave soon.', category: 'HR', difficulty: 'Easy' },
  { id: '12', question: 'Why did you leave your last job?', answer: 'Focus on positive reasons like seeking growth, new challenges, or career alignment. Never badmouth previous employers. Frame it as a strategic move toward your career goals.', category: 'HR', difficulty: 'Medium' },
  { id: '13', question: 'What are your salary expectations?', answer: 'Research market rates for the role and location. Provide a range based on your research. Say you are open to discussion based on the total compensation package.', category: 'HR', difficulty: 'Medium' },
  { id: '14', question: 'How do you handle stress and pressure?', answer: 'Describe specific techniques: prioritization, time management, exercise, or meditation. Give an example of a high-pressure situation you managed effectively.', category: 'HR', difficulty: 'Easy' },
  { id: '15', question: 'What made you apply for this specific role?', answer: 'Connect your skills and experience to the job requirements. Mention specific aspects of the role that excite you. Show you have read the description carefully.', category: 'Role-Specific', difficulty: 'Easy' },
  { id: '16', question: 'How would you approach your first 30 days?', answer: 'Focus on learning: understand the team, product, and processes. Set up meetings with stakeholders. Identify quick wins and areas where you can contribute immediately.', category: 'Role-Specific', difficulty: 'Medium' },
  { id: '17', question: 'Describe a project you are most proud of', answer: 'Choose a project that demonstrates relevant skills. Explain your role, challenges faced, and measurable impact. Quantify results when possible.', category: 'Role-Specific', difficulty: 'Medium' },
  { id: '18', question: 'How do you stay updated with industry trends?', answer: 'Mention specific sources: blogs, podcasts, conferences, courses, or communities. Show genuine curiosity and commitment to continuous learning.', category: 'Role-Specific', difficulty: 'Easy' },
];

const CATEGORIES: QuestionCategory[] = ['All', 'Behavioral', 'Technical', 'HR', 'Role-Specific'];

function QuestionCard({ item, index }: { item: InterviewQ; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const height = useSharedValue(0);

  const toggleExpand = () => {
    if (expanded) {
      height.value = withTiming(0, { duration: 250 });
    } else {
      height.value = withSpring(120, { stiffness: 200, damping: 20 });
    }
    setExpanded(!expanded);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: height.value > 0 ? withTiming(1, { duration: 200 }) : 0,
    overflow: 'hidden',
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify().damping(16)}>
      <TouchableOpacity onPress={toggleExpand} activeOpacity={0.85}>
        <BlurView intensity={50} tint="light" style={styles.qCard}>
          <View style={styles.qHeader}>
            <LinearGradient
              colors={item.category === 'Technical' ? colors.gradient.teal : item.category === 'Behavioral' ? colors.gradient.blue : item.category === 'HR' ? colors.gradient.purple : colors.gradient.coral}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.qIcon}
            >
              <Ionicons name="help" size={18} color="#FFFFFF" />
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.qQuestion}>{item.question}</Text>
              <View style={styles.qMeta}>
                <Badge label={item.category} variant={item.category === 'Technical' ? 'info' : item.category === 'Behavioral' ? 'primary' : item.category === 'HR' ? 'warning' : 'success'} size="sm" />
                <Badge label={item.difficulty} variant={item.difficulty === 'Easy' ? 'success' : item.difficulty === 'Medium' ? 'warning' : 'error'} size="sm" />
                {item.company && <Badge label={item.company} variant="default" size="sm" />}
              </View>
            </View>
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
          </View>
          <Animated.View style={animatedStyle}>
            <View style={styles.qAnswer}>
              <Text style={styles.qAnswerLabel}>Suggested Answer</Text>
              <Text style={styles.qAnswerText}>{item.answer}</Text>
            </View>
          </Animated.View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function InterviewQuestionsScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory>('All');

  const filteredQuestions = useMemo(() => {
    return QUESTIONS.filter(q => {
      if (selectedCategory !== 'All' && q.category !== selectedCategory) return false;
      if (search && !q.question.toLowerCase().includes(search.toLowerCase()) && !q.answer.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, selectedCategory]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.delay(50).springify().damping(14)}>
          <Text style={styles.title}>Interview Questions</Text>
          <Text style={styles.subtitle}>Prepare with confidence — practice makes perfect</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).springify().damping(14)}>
          <BlurView intensity={60} tint="light" style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search questions..."
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.sm }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)} activeOpacity={0.7}>
                <BlurView intensity={selectedCategory === cat ? 70 : 40} tint="light" style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}>
                  <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>{cat}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        <GlassCard style={styles.statsBanner} glowColor={colors.primary}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{QUESTIONS.length}</Text>
              <Text style={styles.statLabel}>Total Questions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{QUESTIONS.filter(q => q.difficulty === 'Easy').length}</Text>
              <Text style={styles.statLabel}>Easy</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{QUESTIONS.filter(q => q.difficulty === 'Medium').length}</Text>
              <Text style={styles.statLabel}>Medium</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{QUESTIONS.filter(q => q.difficulty === 'Hard').length}</Text>
              <Text style={styles.statLabel}>Hard</Text>
            </View>
          </View>
        </GlassCard>

        <Text style={styles.sectionCount}>{filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}</Text>

        <View style={{ gap: spacing.sm }}>
          {filteredQuestions.map((q, index) => (
            <QuestionCard key={q.id} item={q} index={index} />
          ))}
        </View>

        {filteredQuestions.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="help-circle-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No questions found</Text>
            <Text style={styles.emptyDesc}>Try adjusting your search or category filter</Text>
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
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.sm },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl, height: 48, marginBottom: spacing.xs, gap: spacing.sm,
    overflow: 'hidden',
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15 },
  catChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: borderRadius.full, overflow: 'hidden' },
  catChipActive: { backgroundColor: colors.primaryBg },
  catChipText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  catChipTextActive: { color: colors.primary, fontWeight: '600' },
  statsBanner: { marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: spacing.sm },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: colors.borderLight },
  sectionCount: { fontSize: 13, color: colors.textMuted, fontWeight: '500', marginBottom: spacing.sm },
  qCard: { borderRadius: borderRadius.xl, overflow: 'hidden', ...shadow.sm },
  qHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  qIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  qQuestion: { fontSize: 14, fontWeight: '600', color: colors.text, lineHeight: 18 },
  qMeta: { flexDirection: 'row', gap: spacing.xs, marginTop: 4, flexWrap: 'wrap' },
  qAnswer: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  qAnswerLabel: { fontSize: 12, fontWeight: '700', color: colors.primary, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  qAnswerText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  emptyDesc: { fontSize: 14, color: colors.textMuted },
});
