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

const SECTIONS = ['headline', 'about', 'experience'];

export default function LinkedinOptimizeScreen() {
  const [section, setSection] = useState('headline');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleOptimize = async () => {
    if (!content) { Toast.show({ type: 'error', text1: 'Please enter your content' }); return; }
    setLoading(true);
    try {
      const res = await aiApi.linkedinOptimize({ profile_section: section, content });
      setResult(res.data.data.optimized);
    } catch (err) { Toast.show({ type: 'error', text1: 'Optimization failed' }); } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
        <Text style={styles.title}>LinkedIn Optimizer</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.sectionLabel}>Profile Section</Text>
      <View style={styles.sectionRow}>
        {SECTIONS.map((s) => (
          <TouchableOpacity key={s} style={[styles.sectionChip, section === s && styles.sectionChipActive]} onPress={() => setSection(s)}>
            <Text style={[styles.sectionChipText, section === s && styles.sectionChipTextActive]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input label={`Your ${section}`} value={content} onChangeText={setContent} placeholder={`Paste your current ${section} here...`} multiline numberOfLines={5} />
      <Button title="Optimize with AI" onPress={handleOptimize} loading={loading} icon={<Ionicons name="sparkles" size={20} color={colors.white} />} />

      {result && (
        <Card style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultLabel}>Optimized {section}</Text>
            <TouchableOpacity onPress={() => Toast.show({ type: 'success', text1: 'Copied!' })}><Ionicons name="copy-outline" size={20} color={colors.primary} /></TouchableOpacity>
          </View>
          <Text style={styles.resultText}>{result}</Text>
        </Card>
      )}
      {loading && <Loader message="AI is optimizing your profile..." />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  sectionLabel: { color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: spacing.sm },
  sectionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  sectionChip: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  sectionChipActive: { borderColor: colors.primary, backgroundColor: '#1e3a5f' },
  sectionChipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  sectionChipTextActive: { color: colors.primary },
  resultCard: { marginTop: spacing.lg },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  resultLabel: { color: colors.text, fontSize: 16, fontWeight: '600' },
  resultText: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
});
