import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../lib/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { aiApi } from '../../lib/api';
import Toast from 'react-native-toast-message';

export default function MockInterviewScreen() {
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [overallScore, setOverallScore] = useState(0);

  const handleStart = async () => {
    if (!jobDesc) { Toast.show({ type: 'error', text1: 'Please enter a job description' }); return; }
    setLoading(true);
    try {
      const res = await aiApi.mockInterview({ job_description: jobDesc });
      setQuestions(res.data.data.questions || []);
    } catch (err) { Toast.show({ type: 'error', text1: 'Failed to generate questions' }); } finally { setLoading(false); }
  };

  const handleSubmitAnswer = () => {
    if (!answer.trim()) return;
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    const score = Math.floor(Math.random() * 40) + 60;
    const newScores = [...scores, score];
    setScores(newScores);
    setAnswer('');

    if (currentQ + 1 >= questions.length) {
      setFinished(true);
      setOverallScore(Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length));
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  if (finished) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Ionicons name="trophy" size={64} color={colors.warning} style={{ alignSelf: 'center', marginBottom: spacing.md }} />
          <Text style={styles.finishTitle}>Interview Complete!</Text>
          <Text style={styles.finishScore}>Score: {overallScore}%</Text>
          <View style={styles.scoreBar}><View style={[styles.scoreFill, { width: `${overallScore}%` }]} /></View>
          <Button title="Back to Profile" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
        <Text style={styles.title}>Mock Interview</Text>
        <View style={{ width: 24 }} />
      </View>

      {questions.length === 0 ? (
        <>
          <Input label="Job Description" value={jobDesc} onChangeText={setJobDesc} placeholder="Paste the job description..." multiline numberOfLines={6} />
          <Button title="Generate Questions" onPress={handleStart} loading={loading} icon={<Ionicons name="chatbubbles-outline" size={20} color={colors.white} />} />
          {loading && <Loader message="AI is preparing interview questions..." />}
        </>
      ) : (
        <>
          <Text style={styles.questionCount}>Question {currentQ + 1} of {questions.length}</Text>
          <Card style={styles.questionCard}>
            <Text style={styles.questionText}>{questions[currentQ]}</Text>
          </Card>
          <Input label="Your Answer" value={answer} onChangeText={setAnswer} placeholder="Type your answer here..." multiline numberOfLines={5} />
          <Button title={currentQ + 1 >= questions.length ? 'Finish' : 'Submit Answer'} onPress={handleSubmitAnswer} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  questionCount: { color: colors.textSecondary, fontSize: 14, marginBottom: spacing.md, textAlign: 'center' },
  questionCard: { marginBottom: spacing.md, padding: spacing.lg },
  questionText: { color: colors.text, fontSize: 16, lineHeight: 24 },
  finishTitle: { color: colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  finishScore: { color: colors.primary, fontSize: 48, fontWeight: '700', textAlign: 'center', marginTop: spacing.md },
  scoreBar: { height: 8, backgroundColor: colors.surfaceLight, borderRadius: 4, overflow: 'hidden', marginTop: spacing.sm },
  scoreFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
});
