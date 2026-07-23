import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Share } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import { coverLetterApi } from '../../lib/api';

const TONES = [
  { key: 'professional', label: 'Professional', icon: 'briefcase' },
  { key: 'casual', label: 'Casual', icon: 'happy' },
  { key: 'enthusiastic', label: 'Enthusiastic', icon: 'star' },
];

export default function CoverLetterScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ jobTitle?: string; company?: string; jobDescription?: string }>();
  const [jobTitle, setJobTitle] = useState(params.jobTitle || '');
  const [company, setCompany] = useState(params.company || '');
  const [jobDescription, setJobDescription] = useState(params.jobDescription || '');
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const generate = async () => {
    if (!jobTitle || !company || !jobDescription) return;
    setLoading(true);
    try {
      const res = await coverLetterApi.generate({
        job_title: jobTitle, company, job_description: jobDescription, tone,
      });
      setResult(res.data.data?.content || res.data.content || '');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const copyResult = () => {
    try {
      Share.share({ message: result });
    } catch {}
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Cover Letter</Text>
        </View>

        {!result ? (
          <Animated.View entering={FadeInUp.springify().damping(14)}>
            <GlassCard style={styles.card}>
              <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.icon}>
                <Ionicons name="document-text" size={28} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.cardTitle}>Generate Cover Letter</Text>
              <Text style={styles.cardSub}>AI-powered cover letters tailored to each job.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Job Title</Text>
                <View style={styles.inputWrap}>
                  <TextInput style={styles.input} placeholder="e.g. Software Engineer" placeholderTextColor={colors.textMuted} value={jobTitle} onChangeText={setJobTitle} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Company</Text>
                <View style={styles.inputWrap}>
                  <TextInput style={styles.input} placeholder="e.g. Google" placeholderTextColor={colors.textMuted} value={company} onChangeText={setCompany} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Job Description</Text>
                <TextInput style={styles.textArea} placeholder="Paste job description here..." placeholderTextColor={colors.textMuted} value={jobDescription} onChangeText={setJobDescription} multiline numberOfLines={5} textAlignVertical="top" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tone</Text>
                <View style={styles.toneRow}>
                  {TONES.map((t) => (
                    <TouchableOpacity key={t.key} onPress={() => setTone(t.key)} style={[styles.toneBtn, tone === t.key && styles.toneBtnActive]}>
                      <Ionicons name={t.icon as any} size={16} color={tone === t.key ? colors.white : colors.textMuted} />
                      <Text style={[styles.toneLabel, tone === t.key && styles.toneLabelActive]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Button title={loading ? 'Generating...' : 'Generate'} onPress={generate} variant="primary" fullWidth loading={loading} />
            </GlassCard>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInUp.springify().damping(14)}>
            <GlassCard style={styles.card}>
              <Text style={styles.sectionTitle}>Your Cover Letter</Text>
              <Text style={styles.resultText}>{result}</Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <Button title="Copy & Share" onPress={copyResult} variant="primary" icon="copy-outline" style={{ flex: 1 }} />
                <Button title="New" onPress={() => setResult('')} variant="outline" style={{ flex: 1 }} />
              </View>
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
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...shadow.sm },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  card: { padding: spacing.lg, gap: spacing.md },
  icon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', ...shadow.glow.purple },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center' },
  cardSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  inputGroup: { width: '100%' },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: 48, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 0 },
  textArea: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, padding: spacing.md, color: colors.text, fontSize: 14, borderWidth: 1, borderColor: colors.border, minHeight: 100, textAlignVertical: 'top' },
  toneRow: { flexDirection: 'row', gap: spacing.sm },
  toneBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: borderRadius.full, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  toneBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toneLabel: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  toneLabelActive: { color: colors.white },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  resultText: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
});
