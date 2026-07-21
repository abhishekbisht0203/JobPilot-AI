import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, borderRadius } from '../../lib/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loader } from '../../components/ui/Loader';
import { resumeApi } from '../../lib/api';
import { Resume } from '../../types';
import { formatDate, getMatchColor } from '../../lib/helpers';

export default function ResumeScreen() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await resumeApi.list();
      setResumes(res.data.data || []);
    } catch (err) {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchResumes(); }, []);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      setUploading(true);
      const file = result.assets[0];
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      } as any);
      await resumeApi.upload(formData);
      fetchResumes();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resume Studio</Text>
        <Text style={styles.subtitle}>Upload, analyze, and optimize your resume</Text>
      </View>

      <Button
        title={uploading ? 'Uploading...' : 'Upload Resume'}
        onPress={handleUpload}
        loading={uploading}
        icon={<Ionicons name="cloud-upload-outline" size={20} color={colors.white} />}
        style={styles.uploadButton}
      />

      <FlatList
        data={resumes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchResumes(); }} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <Card style={styles.resumeCard} onPress={() => router.push(`/generate/resume-version?resumeId=${item.id}`)}>
            <View style={styles.resumeHeader}>
              <Ionicons name="document-text" size={32} color={colors.primary} />
              <View style={styles.resumeInfo}>
                <Text style={styles.resumeName}>{item.original_filename}</Text>
                <Text style={styles.resumeDate}>{formatDate(item.created_at)}</Text>
              </View>
              <View style={[styles.atsBadge, { backgroundColor: item.ats_score >= 80 ? '#065f46' : item.ats_score >= 60 ? '#78350f' : '#7f1d1d' }]}>
                <Text style={[styles.atsScore, { color: getMatchColor(item.ats_score) }]}>{item.ats_score}</Text>
                <Text style={styles.atsLabel}>ATS</Text>
              </View>
            </View>
            <View style={styles.resumeActions}>
              <Button title="Optimize" onPress={() => router.push(`/generate/resume-version?resumeId=${item.id}`)} variant="outline" size="sm" icon={<Ionicons name="sparkles-outline" size={16} color={colors.primary} />} />
              <Button title="Delete" onPress={() => resumeApi.delete(item.id).then(fetchResumes)} variant="ghost" size="sm" icon={<Ionicons name="trash-outline" size={16} color={colors.error} />} />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          loading ? <Loader /> : (
            <EmptyState icon="document-text-outline" title="No resumes yet" message="Upload your resume to get ATS analysis and AI-powered optimization." actionLabel="Upload Resume" onAction={handleUpload} />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.md },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: spacing.xs },
  uploadButton: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  resumeCard: { marginBottom: spacing.md },
  resumeHeader: { flexDirection: 'row', alignItems: 'center' },
  resumeInfo: { flex: 1, marginLeft: spacing.md },
  resumeName: { color: colors.text, fontSize: 16, fontWeight: '500' },
  resumeDate: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  atsBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
  },
  atsScore: { fontSize: 20, fontWeight: '700' },
  atsLabel: { color: colors.textSecondary, fontSize: 10 },
  resumeActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
