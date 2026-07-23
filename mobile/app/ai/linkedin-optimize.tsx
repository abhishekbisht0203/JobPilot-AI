import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../../lib/theme';
import { Card } from '../../components/ui/Card';
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
      <LinearGradient colors={['#EFF6FF', '#F5F7FB']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>LinkedIn Optimizer</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.sectionLabel}>Profile Section</Text>
      <View style={styles.sectionRow}>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.sectionChip, section === s && styles.sectionChipActive]}
            onPress={() => setSection(s)}
          >
            <Text style={[styles.sectionChipText, section === s && styles.sectionChipTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input label={`Your ${section.charAt(0).toUpperCase() + section.slice(1)}`} value={content} onChangeText={setContent} placeholder={`Paste your current ${section} here...`} multiline numberOfLines={5} icon="logo-linkedin" />

      <TouchableOpacity onPress={handleOptimize} disabled={loading}>
        <LinearGradient colors={['#2563EB', '#4F8CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.optimizeBtn}>
          <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          <Text style={styles.optimizeText}>{loading ? 'Optimizing...' : 'Optimize with AI'}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {result && (
        <Card style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultLabel}>Optimized {section.charAt(0).toUpperCase() + section.slice(1)}</Text>
            <TouchableOpacity onPress={() => Toast.show({ type: 'success', text1: 'Copied!' })}>
              <Ionicons name="copy-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.resultText}>{result}</Text>
        </Card>
      )}
      {loading && <Loader message="AI is optimizing your profile..." />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...({ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 } as any) },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  sectionLabel: { color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: spacing.sm },
  sectionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  sectionChip: { flex: 1, paddingVertical: 10, borderRadius: borderRadius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  sectionChipActive: { borderColor: colors.primary, backgroundColor: '#EFF6FF' },
  sectionChipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  sectionChipTextActive: { color: colors.primary },
  optimizeBtn: { flexDirection: 'row', height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  optimizeText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  resultCard: { marginTop: spacing.lg },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  resultLabel: { color: colors.text, fontSize: 16, fontWeight: '600' },
  resultText: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
});
