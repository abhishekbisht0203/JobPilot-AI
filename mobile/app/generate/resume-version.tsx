import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../../lib/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { resumeApi } from '../../lib/api';
import Toast from 'react-native-toast-message';

const ROLES = ['Frontend', 'Backend', 'Full Stack', 'AI/ML'];

export default function ResumeVersionScreen() {
  const { resumeId } = useLocalSearchParams<{ resumeId: string }>();
  const [targetRole, setTargetRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<Array<{ id: string; title: string; target_role: string; content: string }>>([]);

  const handleCreate = async () => {
    const role = targetRole === 'custom' ? customRole : targetRole;
    if (!role || !title) { Toast.show({ type: 'error', text1: 'Please fill all fields' }); return; }
    setLoading(true);
    try {
      const res = await resumeApi.createVersion(resumeId!, { title, target_role: role });
      setVersions((prev) => [...prev, res.data.data]);
      Toast.show({ type: 'success', text1: 'Version created!' });
    } catch (err) { Toast.show({ type: 'error', text1: 'Creation failed' }); } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={['#EFF6FF', '#F5F7FB']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Resume Versions</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.sectionLabel}>Target Role</Text>
      <View style={styles.roleRow}>
        {ROLES.map((role) => (
          <TouchableOpacity
            key={role}
            style={[styles.roleChip, targetRole === role && styles.roleChipActive]}
            onPress={() => { setTargetRole(role); setCustomRole(''); }}
          >
            <Text style={[styles.roleChipText, targetRole === role && styles.roleChipTextActive]}>{role}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.roleChip, targetRole === 'custom' && styles.roleChipActive]} onPress={() => setTargetRole('custom')}>
          <Text style={[styles.roleChipText, targetRole === 'custom' && styles.roleChipTextActive]}>Custom</Text>
        </TouchableOpacity>
      </View>

      {targetRole === 'custom' && <Input label="Custom Role" value={customRole} onChangeText={setCustomRole} placeholder="e.g. DevOps Engineer" />}

      <Input label="Version Name" value={title} onChangeText={setTitle} placeholder="e.g. Google Apply V1" />

      <TouchableOpacity onPress={handleCreate} disabled={loading}>
        <LinearGradient colors={['#2563EB', '#4F8CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createBtn}>
          <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          <Text style={styles.createText}>{loading ? 'Creating...' : 'Create Optimized Version'}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {versions.length > 0 && (
        <View style={styles.versionsSection}>
          <Text style={styles.sectionTitle}>Created Versions</Text>
          {versions.map((v) => (
            <Card key={v.id} style={styles.versionCard}>
              <View style={styles.versionHeader}>
                <View style={styles.versionIcon}>
                  <Ionicons name="document-text" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.versionTitle}>{v.title}</Text>
                  <Text style={styles.versionRole}>{v.target_role}</Text>
                </View>
                <TouchableOpacity onPress={() => Toast.show({ type: 'success', text1: 'Exported!' })} style={styles.exportBtn}>
                  <Ionicons name="download-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      )}

      {loading && <Loader message="AI is optimizing your resume..." />}
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
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  roleChip: { paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: borderRadius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...({ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 } as any) },
  roleChipActive: { borderColor: colors.primary, backgroundColor: '#EFF6FF' },
  roleChipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  roleChipTextActive: { color: colors.primary },
  createBtn: { flexDirection: 'row', height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  createText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  versionsSection: { marginTop: spacing.xl },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: spacing.md },
  versionCard: { marginBottom: spacing.sm },
  versionHeader: { flexDirection: 'row', alignItems: 'center' },
  versionIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  versionTitle: { color: colors.text, fontSize: 15, fontWeight: '500' },
  versionRole: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  exportBtn: { padding: 4 },
});
