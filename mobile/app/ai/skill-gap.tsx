import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import { aiApi } from '../../lib/api';

export default function SkillGapScreen() {
  const insets = useSafeAreaInsets();
  const [targetRole, setTargetRole] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    if (!targetRole.trim()) return;
    setLoading(true);
    try {
      const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean);
      const res = await aiApi.skillGap({ target_role: targetRole, current_skills: skills });
      setResult(res.data.data || res.data);
      setError(null);
    } catch { setError('Failed to analyze. Check your connection.'); }
    finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Skill Gap Analysis</Text>
        </View>

        {!result && (
          <Animated.View entering={FadeInUp.springify().damping(14)}>
            <GlassCard style={styles.card}>
              <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.icon}>
                <Ionicons name="analytics" size={28} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.cardTitle}>Find missing skills</Text>
              <Text style={styles.cardSub}>Enter your target role and current skills to see what to learn.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Target Role</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="briefcase-outline" size={16} color={colors.textMuted} />
                  <TextInput style={styles.input} placeholder="e.g. Senior React Native Developer" placeholderTextColor={colors.textMuted} value={targetRole} onChangeText={setTargetRole} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Skills (comma separated)</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="code-slash-outline" size={16} color={colors.textMuted} />
                  <TextInput style={styles.input} placeholder="e.g. JavaScript, React, TypeScript" placeholderTextColor={colors.textMuted} value={skillsText} onChangeText={setSkillsText} />
                </View>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}
              <Button title={loading ? 'Analyzing...' : 'Analyze Skill Gap'} onPress={analyze} variant="primary" fullWidth loading={loading} />
            </GlassCard>
          </Animated.View>
        )}

        {result && (
          <View style={{ gap: spacing.md }}>
            <Animated.View entering={FadeInUp.delay(100).springify().damping(14)}>
              <GlassCard glowColor={colors.success}>
                <Text style={styles.sectionTitle}>Current Skills</Text>
                <View style={styles.skillsRow}>
                  {(result.current_skills || []).map((s: string, i: number) => (
                    <Badge key={i} label={s} variant="success" size="sm" />
                  ))}
                  {(!result.current_skills || result.current_skills.length === 0) && (
                    <Text style={styles.emptyText}>No current skills detected</Text>
                  )}
                </View>
              </GlassCard>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).springify().damping(14)}>
              <GlassCard glowColor={colors.error}>
                <Text style={styles.sectionTitle}>Missing Skills</Text>
                <View style={styles.skillsRow}>
                  {(result.missing_skills || []).map((s: string, i: number) => (
                    <Badge key={i} label={s} variant="error" size="sm" />
                  ))}
                  {(!result.missing_skills || result.missing_skills.length === 0) && (
                    <Text style={styles.emptyText}>No missing skills found</Text>
                  )}
                </View>
              </GlassCard>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(300).springify().damping(14)}>
              <GlassCard glowColor={colors.warning}>
                <Text style={styles.sectionTitle}>Recommendations</Text>
                {(result.recommendations || []).map((rec: string, i: number) => (
                  <View key={i} style={styles.recItem}>
                    <Ionicons name="bulb-outline" size={16} color={colors.warning} />
                    <Text style={styles.recText}>{rec}</Text>
                  </View>
                ))}
                {(!result.recommendations || result.recommendations.length === 0) && (
                  <Text style={styles.emptyText}>No recommendations</Text>
                )}
              </GlassCard>
            </Animated.View>

            <Button title="Analyze Another Role" onPress={() => setResult(null)} variant="outline" />
          </View>
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
  card: { padding: spacing.lg, gap: spacing.md, alignItems: 'center' },
  icon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', ...shadow.glow.primary },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  inputGroup: { width: '100%' },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: 48, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  errorText: { color: colors.error, fontSize: 13, textAlign: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 13 },
  recItem: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, alignItems: 'flex-start' },
  recText: { color: colors.textSecondary, fontSize: 14, flex: 1, lineHeight: 20 },
  cardGap: { height: spacing.lg },
});
