import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../lib/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import { MatchScoreRingSimple } from '../../components/ui/MatchScoreRing';
import { jobsApi, applicationsApi } from '../../lib/api';
import { Job } from '../../types';
import { formatSalary, timeAgo } from '../../lib/helpers';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (id) {
      jobsApi.get(id).then((res) => setJob(res.data.data)).finally(() => setLoading(false));
    }
  }, [id]);

  const handleApply = async () => {
    if (!job) return;
    setApplying(true);
    try {
      await applicationsApi.create({ job_id: job.id });
      if (job.url) {
        Linking.openURL(job.url);
      }
    } catch (err) {} finally {
      setApplying(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!job) return <View style={styles.container}><Text style={styles.errorText}>Job not found</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <Card style={styles.jobHeader}>
        <View style={styles.jobHeaderTop}>
          <View style={styles.jobIcon}>
            <Ionicons name="briefcase" size={28} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.company}>{job.company}</Text>
          </View>
          {job.match_score !== undefined && <MatchScoreRingSimple score={job.match_score} size={48} />}
        </View>
      </Card>

      <View style={styles.metaRow}>
        {job.location && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>{job.location}</Text>
          </View>
        )}
        <View style={styles.metaItem}>
          <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.metaText}>{formatSalary(job.salary_min, job.salary_max, job.currency)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.metaText}>{timeAgo(job.posted_at)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="globe-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.metaText}>{job.platform}</Text>
        </View>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{job.description}</Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Required Skills</Text>
        <View style={styles.skillsRow}>
          {job.skills?.map((skill, idx) => (
            <Badge key={idx} label={skill} variant="info" size="md" />
          ))}
        </View>
      </Card>

      <View style={styles.actionRow}>
        <Button title="Generate Cover Letter" onPress={() => router.push(`/generate/cover-letter?jobTitle=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&jobDescription=${encodeURIComponent(job.description)}`)} variant="outline" style={{ flex: 1 }} icon={<Ionicons name="document-text-outline" size={18} color={colors.primary} />} />
        <Button title="Cold Email" onPress={() => router.push(`/generate/cold-email?company=${encodeURIComponent(job.company)}&jobTitle=${encodeURIComponent(job.title)}`)} variant="outline" style={{ flex: 1 }} icon={<Ionicons name="mail-outline" size={18} color={colors.primary} />} />
      </View>

      <Button
        title={applying ? 'Opening...' : 'Apply Now'}
        onPress={handleApply}
        loading={applying}
        size="lg"
        icon={<Ionicons name="send-outline" size={20} color={colors.white} />}
        style={styles.applyButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  backButton: { marginBottom: spacing.md, alignSelf: 'flex-start' },
  jobHeader: { marginBottom: spacing.md },
  jobHeaderTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  jobIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#1e3a5f', justifyContent: 'center', alignItems: 'center' },
  jobTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  company: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: colors.textSecondary, fontSize: 13 },
  section: { marginBottom: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.sm },
  description: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  applyButton: {},
  errorText: { color: colors.error, textAlign: 'center', marginTop: 100, fontSize: 16 },
});
