import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../lib/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { emailApi } from '../../lib/api';
import Toast from 'react-native-toast-message';

export default function ColdEmailScreen() {
  const params = useLocalSearchParams<{ company?: string; jobTitle?: string }>();
  const [company, setCompany] = useState(params.company || '');
  const [jobTitle, setJobTitle] = useState(params.jobTitle || '');
  const [recruiterName, setRecruiterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);

  const handleGenerate = async () => {
    if (!company || !jobTitle) {
      Toast.show({ type: 'error', text1: 'Please fill company and job title' });
      return;
    }
    setLoading(true);
    try {
      const res = await emailApi.generate({ company, job_title: jobTitle, recruiter_name: recruiterName || undefined });
      setResult(res.data.data);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Generation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    Toast.show({ type: 'success', text1: 'Email sent! (Demo)' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Cold Email</Text>
        <View style={{ width: 24 }} />
      </View>

      <Input label="Company" value={company} onChangeText={setCompany} placeholder="e.g. Google" icon="business-outline" />
      <Input label="Job Title" value={jobTitle} onChangeText={setJobTitle} placeholder="e.g. Frontend Engineer" icon="briefcase-outline" />
      <Input label="Recruiter Name (optional)" value={recruiterName} onChangeText={setRecruiterName} placeholder="e.g. Sarah Johnson" icon="person-outline" />

      <Button title="Generate Email" onPress={handleGenerate} loading={loading} icon={<Ionicons name="mail-outline" size={20} color={colors.white} />} style={styles.generateButton} />

      {result && (
        <Card style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Ionicons name="mail" size={20} color={colors.primary} />
            <Text style={styles.resultLabel}>Your Email</Text>
            <TouchableOpacity onPress={() => Toast.show({ type: 'success', text1: 'Copied!' })}>
              <Ionicons name="copy-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subjectLabel}>Subject:</Text>
          <Text style={styles.subjectText}>{result.subject}</Text>
          <View style={styles.divider} />
          <Text style={styles.bodyText}>{result.body}</Text>
          <Button title="Send Email" onPress={handleSend} variant="secondary" size="sm" icon={<Ionicons name="send-outline" size={16} color={colors.white} />} style={styles.sendButton} />
        </Card>
      )}
      {loading && <Loader message="Crafting your email..." />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  generateButton: { marginTop: spacing.md },
  resultCard: { marginTop: spacing.lg },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  resultLabel: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '600' },
  subjectLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 2 },
  subjectText: { color: colors.text, fontSize: 15, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  bodyText: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  sendButton: { marginTop: spacing.md, alignSelf: 'flex-end' },
});
