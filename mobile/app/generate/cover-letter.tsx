import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../lib/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { coverLetterApi } from '../../lib/api';
import Toast from 'react-native-toast-message';

const TONES = ['professional', 'casual', 'enthusiastic'] as const;

export default function CoverLetterScreen() {
  const { jobTitle, company, jobDescription } = useLocalSearchParams<{ jobTitle?: string; company?: string; jobDescription?: string }>();
  const [jobTitleState, setJobTitle] = useState(jobTitle || '');
  const [companyState, setCompany] = useState(company || '');
  const [jobDesc, setJobDesc] = useState(jobDescription || '');
  const [tone, setTone] = useState<(typeof TONES)[number]>('professional');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleGenerate = async () => {
    if (!jobTitleState || !companyState || !jobDesc) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }
    setLoading(true);
    try {
      const res = await coverLetterApi.generate({
        job_title: jobTitleState,
        company: companyState,
        job_description: jobDesc,
        tone,
      });
      setResult(res.data.data.content);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Generation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    Toast.show({ type: 'success', text1: 'Copied to clipboard!' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Cover Letter</Text>
        <View style={{ width: 24 }} />
      </View>

      <Input label="Job Title" value={jobTitleState} onChangeText={setJobTitle} placeholder="e.g. Senior Frontend Engineer" />
      <Input label="Company" value={companyState} onChangeText={setCompany} placeholder="e.g. Google" />
      <Input label="Job Description" value={jobDesc} onChangeText={setJobDesc} placeholder="Paste the job description here..." multiline numberOfLines={6} />

      <Text style={styles.toneLabel}>Tone</Text>
      <View style={styles.toneRow}>
        {TONES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.toneOption, tone === t && styles.toneOptionActive]}
            onPress={() => setTone(t)}
          >
            <Text style={[styles.toneText, tone === t && styles.toneTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Generate Cover Letter" onPress={handleGenerate} loading={loading} icon={<Ionicons name="sparkles" size={20} color={colors.white} />} style={styles.generateButton} />

      {result ? (
        <Card style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultLabel}>Your Cover Letter</Text>
            <TouchableOpacity onPress={handleCopy}>
              <Ionicons name="copy-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.resultText}>{result}</Text>
        </Card>
      ) : null}

      {loading && <Loader message="AI is writing your cover letter..." />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  toneLabel: { color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: spacing.sm },
  toneRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  toneOption: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  toneOptionActive: { borderColor: colors.primary, backgroundColor: '#1e3a5f' },
  toneText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  toneTextActive: { color: colors.primary },
  generateButton: { marginTop: spacing.md },
  resultCard: { marginTop: spacing.lg },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  resultLabel: { color: colors.text, fontSize: 16, fontWeight: '600' },
  resultText: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
});
