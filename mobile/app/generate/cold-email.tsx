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
import { Loader } from '../../components/ui/Loader';
import { coverLetterApi } from '../../lib/api';

export default function ColdEmailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ company?: string; jobTitle?: string }>();
  const [company, setCompany] = useState(params.company || '');
  const [jobTitle, setJobTitle] = useState(params.jobTitle || '');
  const [recruiterName, setRecruiterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);

  const generate = async () => {
    if (!company || !jobTitle) return;
    setLoading(true);
    try {
      const res = await coverLetterApi.generate({ job_description: '', company, job_title: jobTitle });
      const data = res.data.data || res.data;
      setResult({ subject: data.subject || '', body: data.body || '' });
      setError(null);
    } catch { setError('Failed to generate email. Check your connection.'); }
    finally { setLoading(false); }
  };

  const copyResult = () => {
    try {
      Share.share({ message: `Subject: ${result?.subject}\n\n${result?.body}` });
    } catch {}
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Cold Email</Text>
        </View>

        {!result ? (
          <Animated.View entering={FadeInUp.springify().damping(14)}>
            <GlassCard style={styles.card}>
              <LinearGradient colors={['#F472B6', '#EC4899']} style={styles.icon}>
                <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.cardTitle}>Draft Cold Email</Text>
              <Text style={styles.cardSub}>AI-crafted outreach emails to recruiters.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Company</Text>
                <View style={styles.inputWrap}>
                  <TextInput style={styles.input} placeholder="e.g. Google" placeholderTextColor={colors.textMuted} value={company} onChangeText={setCompany} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Job Title</Text>
                <View style={styles.inputWrap}>
                  <TextInput style={styles.input} placeholder="e.g. Software Engineer" placeholderTextColor={colors.textMuted} value={jobTitle} onChangeText={setJobTitle} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Recruiter Name (optional)</Text>
                <View style={styles.inputWrap}>
                  <TextInput style={styles.input} placeholder="e.g. Sarah" placeholderTextColor={colors.textMuted} value={recruiterName} onChangeText={setRecruiterName} />
                </View>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}
              <Button title={loading ? 'Generating...' : 'Generate Email'} onPress={generate} variant="primary" fullWidth loading={loading} />
            </GlassCard>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInUp.springify().damping(14)}>
            <GlassCard style={styles.card}>
              <Text style={styles.sectionTitle}>Subject</Text>
              <Text style={styles.subjectText}>{result.subject}</Text>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Body</Text>
              <Text style={styles.bodyText}>{result.body}</Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <Button title="Copy & Share" onPress={copyResult} variant="primary" icon="copy-outline" style={{ flex: 1 }} />
                <Button title="New" onPress={() => setResult(null)} variant="outline" style={{ flex: 1 }} />
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
  icon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', ...shadow.glow.primary },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center' },
  cardSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  inputGroup: { width: '100%' },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: 48, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 0 },
  errorText: { color: colors.error, fontSize: 13, textAlign: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subjectText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.sm },
  bodyText: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
});
