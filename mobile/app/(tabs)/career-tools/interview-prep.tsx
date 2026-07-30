import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, RefreshControl } from 'react-native';
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

const QUESTIONS = [
  {
    category: 'General',
    icon: 'person',
    questions: ['Tell me about yourself.', 'Why do you want to work here?', 'Where do you see yourself in 5 years?', 'What are your greatest strengths and weaknesses?'],
  },
  {
    category: 'Technical',
    icon: 'code-slash',
    questions: ['Explain a challenging project you worked on.', 'How do you stay updated with industry trends?', 'Describe your development workflow.', 'How do you handle technical debt?'],
  },
  {
    category: 'Behavioral',
    icon: 'people',
    questions: ['Describe a time you had a conflict at work.', 'Tell me about a failure and what you learned.', 'How do you handle tight deadlines?', 'Give an example of leadership.'],
  },
  {
    category: 'Career',
    icon: 'trending-up',
    questions: ['Why are you leaving your current role?', 'What type of work environment do you prefer?', 'What are your salary expectations?', 'Do you have any questions for us?'],
  },
];

const TIPS = [
  { icon: 'mic-outline', title: 'Practice Out Loud', body: 'Record yourself answering questions to improve delivery and confidence.' },
  { icon: 'search-outline', title: 'Research the Company', body: 'Understand their products, culture, and recent news before the interview.' },
  { icon: 'chatbubbles-outline', title: 'Use the STAR Method', body: 'Structure answers with Situation, Task, Action, Result for clarity.' },
  { icon: 'time-outline', title: 'Prepare Questions', body: 'Always have 3-5 thoughtful questions ready for the interviewer.' },
];

export default function InterviewPrepScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(true);
  const [customQ, setCustomQ] = useState('');
  const [customQs, setCustomQs] = useState<string[]>([]);

  const addCustomQuestion = useCallback(() => {
    if (!customQ.trim()) return;
    setCustomQs(prev => [...prev, customQ.trim()]);
    setCustomQ('');
  }, [customQ]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.delay(100).springify().damping(14)} style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Interview Preparation</Text>
          <Text style={styles.subtitle}>Practice questions, tips, and guidance</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
          <GlassCard style={styles.toggleCard} glowColor={(colors.gradient.coral as readonly string[])[0]}>
            <View style={styles.toggleRow}>
              <TouchableOpacity onPress={() => setShowTips(true)} activeOpacity={0.7}>
                <BlurView intensity={40} tint="light" style={[styles.toggleBtn, showTips && styles.toggleBtnActive]}>
                  <Ionicons name="bulb-outline" size={16} color={showTips ? colors.text : colors.textSecondary} />
                  <Text style={[styles.toggleText, showTips && styles.toggleTextActive]}>Tips</Text>
                </BlurView>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowTips(false)} activeOpacity={0.7}>
                <BlurView intensity={40} tint="light" style={[styles.toggleBtn, !showTips && styles.toggleBtnActive]}>
                  <Ionicons name="help-circle-outline" size={16} color={!showTips ? colors.text : colors.textSecondary} />
                  <Text style={[styles.toggleText, !showTips && styles.toggleTextActive]}>Questions</Text>
                </BlurView>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>

        {showTips ? (
          <View>
            <Text style={styles.sectionTitle}>Interview Tips</Text>
            {TIPS.map((tip, index) => (
              <Animated.View key={tip.title} entering={FadeInDown.delay(200 + index * 60).springify().damping(14)}>
                <BlurView intensity={40} tint="light" style={styles.tipCard}>
                  <LinearGradient colors={['#F472B6', '#EC4899']} style={styles.tipIcon}>
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
        ) : (
          <View>
            <GlassCard style={styles.customCard} glowColor={(colors.gradient.coral as readonly string[])[0]}>
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
                <TouchableOpacity onPress={addCustomQuestion} disabled={!customQ.trim()} style={styles.customAddBtn}>
                  <Ionicons name="add" size={20} color={customQ.trim() ? '#FFFFFF' : colors.textMuted} />
                </TouchableOpacity>
              </View>
            </GlassCard>

            <Text style={styles.sectionTitle}>Practice Questions</Text>
            {QUESTIONS.map((cat, ci) => (
              <Animated.View key={cat.category} entering={FadeInDown.delay(200 + ci * 60).springify().damping(14)}>
                <TouchableOpacity onPress={() => setExpandedCat(expandedCat === cat.category ? null : cat.category)} activeOpacity={0.8}>
                  <BlurView intensity={40} tint="light" style={styles.categoryCard}>
                    <View style={styles.categoryHeader}>
                      <LinearGradient colors={['#F472B6', '#EC4899']} style={styles.categoryIcon}>
                        <Ionicons name={cat.icon as any} size={18} color="#FFFFFF" />
                      </LinearGradient>
                      <View style={{ flex: 1, marginLeft: spacing.sm }}>
                        <Text style={styles.categoryName}>{cat.category}</Text>
                        <Text style={styles.categoryCount}>{cat.questions.length} questions</Text>
                      </View>
                      <Ionicons
                        name={expandedCat === cat.category ? 'chevron-up' : 'chevron-down'}
                        size={18} color={colors.textMuted}
                      />
                    </View>
                    {expandedCat === cat.category && (
                      <View style={styles.qList}>
                        {cat.questions.map((q, qi) => (
                          <View key={qi} style={styles.qItem}>
                            <View style={styles.qDot} />
                            <Text style={styles.qText}>{q}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            ))}

            {customQs.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Your Questions</Text>
                {customQs.map((q, i) => (
                  <Animated.View key={i} entering={FadeInDown.delay(200 + i * 40).springify().damping(14)}>
                    <BlurView intensity={40} tint="light" style={styles.customQCard}>
                      <View style={styles.qDot} />
                      <Text style={styles.qText}>{q}</Text>
                    </BlurView>
                  </Animated.View>
                ))}
              </>
            )}

            <TouchableOpacity onPress={() => router.push('/ai/mock-interview')} style={styles.mockBtn} activeOpacity={0.8}>
              <LinearGradient colors={['#F472B6', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mockGradient}>
                <Ionicons name="mic" size={20} color="#FFFFFF" />
                <Text style={styles.mockText}>&nbsp;Practice with AI Mock Interview</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  toggleCard: { marginBottom: spacing.md },
  toggleRow: { flexDirection: 'row', gap: spacing.sm },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.full, overflow: 'hidden' },
  toggleBtnActive: { backgroundColor: (colors.gradient.coral as readonly string[])[0] + '20' },
  toggleText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  toggleTextActive: { color: colors.text, fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  tipCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.sm, overflow: 'hidden' },
  tipIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tipTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  tipBody: { fontSize: 13, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  customCard: { marginBottom: spacing.md },
  customTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  customRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  customInput: { flex: 1, backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: 14, color: colors.text },
  customAddBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: (colors.gradient.coral as readonly string[])[0] + '30', justifyContent: 'center', alignItems: 'center' },
  categoryCard: { padding: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.sm, overflow: 'hidden' },
  categoryHeader: { flexDirection: 'row', alignItems: 'center' },
  categoryIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  categoryName: { fontSize: 15, fontWeight: '600', color: colors.text },
  categoryCount: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  qList: { marginTop: spacing.md, gap: spacing.sm },
  qItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  qDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: (colors.gradient.coral as readonly string[])[0], marginTop: 6 },
  qText: { fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 18 },
  customQCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.sm, overflow: 'hidden' },
  mockBtn: { marginTop: spacing.lg, marginBottom: spacing.md },
  mockGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, borderRadius: borderRadius.lg, gap: spacing.sm, ...shadow.glow.primary },
  mockText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
