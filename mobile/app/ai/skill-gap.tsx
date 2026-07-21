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

export default function SkillGapScreen() {
  const [targetRole, setTargetRole] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ current_skills: string[]; missing_skills: string[]; recommendations: string[] } | null>(null);

  const handleAnalyze = async () => {
    if (!targetRole || !skillsText) { Toast.show({ type: 'error', text1: 'Please fill all fields' }); return; }
    setLoading(true);
    try {
      const res = await aiApi.skillGap({ target_role: targetRole, current_skills: skillsText.split(',').map(s => s.trim()) });
      setResult(res.data.data);
    } catch (err) { Toast.show({ type: 'error', text1: 'Analysis failed' }); } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
        <Text style={styles.title}>Skill Gap Analysis</Text>
        <View style={{ width: 24 }} />
      </View>

      <Input label="Target Role" value={targetRole} onChangeText={setTargetRole} placeholder="e.g. Senior React Native Developer" />
      <Input label="Your Skills (comma separated)" value={skillsText} onChangeText={setSkillsText} placeholder="React, TypeScript, Node.js, ..." multiline numberOfLines={3} />
      <Button title="Analyze" onPress={handleAnalyze} loading={loading} icon={<Ionicons name="analytics-outline" size={20} color={colors.white} />} />

      {result && (
        <>
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Current Skills</Text>
            <View style={styles.skillsWrap}>{result.current_skills.map((s, i) => <View key={i} style={styles.skillBadge}><Text style={styles.skillBadgeText}>{s}</Text></View>)}</View>
          </Card>
          <Card style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: colors.error }]}>Missing Skills</Text>
            <View style={styles.skillsWrap}>{result.missing_skills.map((s, i) => <View key={i} style={[styles.skillBadge, { backgroundColor: '#7f1d1d', borderColor: colors.error }]}><Text style={[styles.skillBadgeText, { color: colors.error }]}>{s}</Text></View>)}</View>
          </Card>
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {result.recommendations.map((r, i) => <Text key={i} style={styles.recommendation}>{i + 1}. {r}</Text>)}
          </Card>
        </>
      )}
      {loading && <Loader message="Analyzing skill gaps..." />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  sectionCard: { marginTop: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.sm },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skillBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#1e3a5f', borderWidth: 1, borderColor: colors.primary },
  skillBadgeText: { color: colors.primary, fontSize: 13, fontWeight: '500' },
  recommendation: { color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: spacing.xs },
});
