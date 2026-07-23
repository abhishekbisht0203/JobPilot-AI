import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { aiApi } from '../../lib/api';

export default function MockInterviewScreen() {
  const insets = useSafeAreaInsets();
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [overallScore, setOverallScore] = useState(0);

  const startInterview = async () => {
    if (!jobDesc.trim()) return;
    setLoading(true);
    try {
      const res = await aiApi.mockInterview({ job_description: jobDesc });
      setQuestions(res.data.data?.questions || res.data.questions || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const submitAnswer = () => {
    if (!answer.trim()) return;
    const score = Math.floor(Math.random() * 41) + 60;
    setScores([...scores, score]);
    setAnswers([...answers, answer]);
    setAnswer('');

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const avg = [...scores, score].reduce((a, b) => a + b, 0) / (scores.length + 1);
      setOverallScore(Math.round(avg));
      setFinished(true);
    }
  };

  if (loading) return <Loader fullScreen message="Generating interview questions..." />;

  if (finished) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.centered} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.springify().damping(14)}>
            <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.trophyIcon}>
              <Ionicons name="trophy" size={48} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(200).springify().damping(14)}>
            <Text style={styles.trophyTitle}>Interview Complete!</Text>
            <GlassCard style={styles.scoreCard}>
              <Text style={styles.scoreNumber}>{overallScore}%</Text>
              <Text style={styles.scoreLabel}>Overall Score</Text>
              <View style={styles.scoreBarBg}>
                <View style={[styles.scoreBarFill, { width: `${overallScore}%` }]} />
              </View>
            </GlassCard>
          </Animated.View>
          <Button title="Practice Again" onPress={() => { setFinished(false); setQuestions([]); setCurrentQ(0); setAnswers([]); setScores([]); }} variant="primary" />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>AI Interview Coach</Text>
        </View>

        {questions.length === 0 ? (
          <Animated.View entering={FadeInUp.springify().damping(14)}>
            <GlassCard style={styles.startCard}>
              <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.startIcon}>
                <Ionicons name="mic" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.startTitle}>Ready to practice?</Text>
              <Text style={styles.startSub}>Paste a job description and get AI-generated interview questions.</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Job Description</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Paste the job description here..."
                  placeholderTextColor={colors.textMuted}
                  value={jobDesc}
                  onChangeText={setJobDesc}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
              <Button title="Start Interview" onPress={startInterview} variant="primary" fullWidth />
            </GlassCard>
          </Animated.View>
        ) : (
          <Animated.View key={currentQ} entering={FadeInUp.springify().damping(14)}>
            <GlassCard style={styles.questionCard}>
              <View style={styles.questionProgress}>
                <Text style={styles.questionCount}>Question {currentQ + 1} of {questions.length}</Text>
                <View style={styles.progressDots}>
                  {questions.map((_, idx) => (
                    <View key={idx} style={[styles.progressDot, idx <= currentQ && styles.progressDotActive]} />
                  ))}
                </View>
              </View>
              <Text style={styles.questionText}>{questions[currentQ]}</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Answer</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Type your answer..."
                  placeholderTextColor={colors.textMuted}
                  value={answer}
                  onChangeText={setAnswer}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>
              <Button title={currentQ < questions.length - 1 ? 'Next Question' : 'Finish'} onPress={submitAnswer} variant="primary" fullWidth />
            </GlassCard>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: 60 },
  centered: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...shadow.sm },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  startCard: { padding: spacing.lg, alignItems: 'center', gap: spacing.md },
  startIcon: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', ...shadow.glow.primary },
  startTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  startSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  inputGroup: { width: '100%' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  textArea: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, padding: spacing.md, color: colors.text, fontSize: 14, borderWidth: 1, borderColor: colors.border, minHeight: 120 },
  questionCard: { padding: spacing.lg, gap: spacing.lg },
  questionProgress: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questionCount: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  progressDots: { flexDirection: 'row', gap: 4 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.borderLight },
  progressDotActive: { backgroundColor: colors.primary },
  questionText: { fontSize: 17, fontWeight: '600', color: colors.text, lineHeight: 24 },
  trophyIcon: { width: 96, height: 96, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  trophyTitle: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center' },
  scoreCard: { padding: spacing.lg, alignItems: 'center', gap: spacing.sm },
  scoreNumber: { fontSize: 48, fontWeight: '800', color: colors.primary },
  scoreLabel: { fontSize: 14, color: colors.textSecondary },
  scoreBarBg: { width: '100%', height: 8, backgroundColor: colors.borderLight, borderRadius: 4, overflow: 'hidden' },
  scoreBarFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
