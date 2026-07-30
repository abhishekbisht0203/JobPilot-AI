import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { coldEmailApi } from '../../lib/api';
import { ToolHeader } from '../../components/career-tools';

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional', icon: 'briefcase' },
  { value: 'friendly', label: 'Friendly', icon: 'happy' },
  { value: 'enthusiastic', label: 'Enthusiast', icon: 'flame' },
];

export default function ColdEmailScreen() {
  const insets = useSafeAreaInsets();
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const generate = async () => {
    if (!company.trim() || !jobTitle.trim()) {
      Alert.alert('Required', 'Company and Job Title are required.');
      return;
    }
    setLoading(true);
    setError(null);
    setSubject('');
    setBody('');
    try {
      const res = await coldEmailApi.generate({
        company: company.trim(),
        job_title: jobTitle.trim(),
        recruiter_name: recruiterName.trim() || undefined,
      });
      const result = res.data?.data || res.data;
      if (!result?.subject || !result?.body) {
        Alert.alert('Error', 'Generated content is empty. Please try again.');
        setLoading(false);
        return;
      }
      setSubject(result.subject);
      setBody(result.body);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to generate email. Check your connection.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const text = `Subject: ${subject}\n\n${body}`;
    Share.share({ message: text }).catch(() => {});
  };

  const handleNew = () => {
    setCompany('');
    setJobTitle('');
    setRecruiterName('');
    setTone('professional');
    setSubject('');
    setBody('');
    setError(null);
  };

  const hasResult = subject && body;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ToolHeader
        title="Cold Email"
        subtitle="AI-crafted outreach emails to recruiters."
        gradient={['#0EA5E9', '#06B6D4']}
        icon="mail"
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!hasResult ? (
          <Animated.View entering={FadeInUp.springify().damping(14)}>
            <GlassCard style={styles.card}>
              <View style={styles.icon}>
                <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.cardTitle}>Draft Cold Email</Text>
              <Text style={styles.cardSub}>AI-crafted outreach emails to recruiters.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Company <Text style={styles.required}>*</Text></Text>
                <View style={styles.inputWrap}>
                  <TextInput style={styles.input} placeholder="e.g. Google" placeholderTextColor={colors.textMuted} value={company} onChangeText={setCompany} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Job Title <Text style={styles.required}>*</Text></Text>
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tone</Text>
                <View style={styles.toneRow}>
                  {TONE_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setTone(opt.value)}
                      style={[styles.toneChip, tone === opt.value && styles.toneChipActive]}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={opt.icon as any}
                        size={14}
                        color={tone === opt.value ? '#FFF' : colors.textSecondary}
                      />
                      <Text style={[styles.toneChipText, tone === opt.value && styles.toneChipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Button title={loading ? 'Generating...' : 'Generate Email'} onPress={generate} variant="primary" fullWidth loading={loading} />
            </GlassCard>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInUp.springify().damping(14)}>
            <GlassCard style={styles.card}>
              {loading && <Loader message="Generating..." />}

              <Text style={styles.sectionTitle}>Subject</Text>
              <View style={styles.subjectBox}>
                <Text style={styles.subjectText}>{subject}</Text>
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Body</Text>
              <View style={styles.bodyBox}>
                <Text style={styles.bodyText}>{body}</Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
                  <Ionicons name="share-outline" size={18} color="#FFF" />
                  <Text style={styles.shareBtnText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleNew} style={styles.newBtn}>
                  <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                  <Text style={styles.newBtnText}>New</Text>
                </TouchableOpacity>
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
  card: { padding: spacing.lg, gap: spacing.md },
  icon: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: '#0EA5E9', justifyContent: 'center',
    alignItems: 'center', alignSelf: 'center',
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center' },
  cardSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  inputGroup: { width: '100%' },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  required: { color: colors.error },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, height: 48,
    borderWidth: 1, borderColor: colors.border,
  },
  input: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 0 },
  toneRow: { flexDirection: 'row', gap: spacing.xs },
  toneChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full, backgroundColor: colors.surfaceLight,
    borderWidth: 1, borderColor: colors.border,
  },
  toneChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toneChipText: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  toneChipTextActive: { color: '#FFF' },
  errorText: { color: colors.error, fontSize: 13, textAlign: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subjectBox: {
    backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  subjectText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.sm },
  bodyBox: {
    backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    minHeight: 200,
  },
  bodyText: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  buttonRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  shareBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
  },
  shareBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  newBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    backgroundColor: colors.primaryBg, borderRadius: borderRadius.md,
    paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  newBtnText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
