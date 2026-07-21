import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
    if (!role || !title) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }
    setLoading(true);
    try {
      const res = await resumeApi.createVersion(resumeId!, { title, target_role: role });
      setVersions((prev) => [...prev, res.data.data]);
      Toast.show({ type: 'success', text1: 'Version created!' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Creation failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Resume Versions</Text>
        <View style={{ width: 24 }} />
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
        <TouchableOpacity
          style={[styles.roleChip, targetRole === 'custom' && styles.roleChipActive]}
          onPress={() => setTargetRole('custom')}
        >
          <Text style={[styles.roleChipText, targetRole === 'custom' && styles.roleChipTextActive]}>Custom</Text>
        </TouchableOpacity>
      </View>

      {targetRole === 'custom' && (
        <Input label="Custom Role" value={customRole} onChangeText={setCustomRole} placeholder="e.g. DevOps Engineer" />
      )}

      <Input label="Version Name" value={title} onChangeText={setTitle} placeholder="e.g. Google Apply V1" />

      <Button
        title={loading ? 'Creating...' : 'Create Optimized Version'}
        onPress={handleCreate}
        loading={loading}
        icon={<Ionicons name="sparkles" size={20} color={colors.white} />}
      />

      {versions.length > 0 && (
        <View style={styles.versionsSection}>
          <Text style={styles.sectionTitle}>Created Versions</Text>
          {versions.map((v) => (
            <Card key={v.id} style={styles.versionCard}>
              <View style={styles.versionHeader}>
                <Ionicons name="document-text" size={24} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.versionTitle}>{v.title}</Text>
                  <Text style={styles.versionRole}>{v.target_role}</Text>
                </View>
                <TouchableOpacity onPress={() => Toast.show({ type: 'success', text1: 'Exported!' })}>
                  <Ionicons name="download-outline" size={22} color={colors.primary} />
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
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  sectionLabel: { color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: spacing.sm },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  roleChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  roleChipActive: { borderColor: colors.primary, backgroundColor: '#1e3a5f' },
  roleChipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  roleChipTextActive: { color: colors.primary },
  versionsSection: { marginTop: spacing.xl },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: spacing.md },
  versionCard: { marginBottom: spacing.sm },
  versionHeader: { flexDirection: 'row', alignItems: 'center' },
  versionTitle: { color: colors.text, fontSize: 15, fontWeight: '500' },
  versionRole: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
});
