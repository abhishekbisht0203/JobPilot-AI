import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
  Animated, Easing, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { useSlideUp, useSpringPress } from '../../lib/animations';
import { useResponsive } from '../../lib/responsive';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loader } from '../../components/ui/Loader';
import { MatchScoreRing } from '../../components/ui/MatchScoreRing';
import { getTabListBottomPadding } from '../../components/ui/TabBarHeight';
import { resumeApi } from '../../lib/api';
import { Resume } from '../../types';
import { formatDate } from '../../lib/helpers';

export default function ResumeScreen() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { horizontalPadding } = useResponsive();
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(20)).current;
  const { scale, pressIn, pressOut } = useSpringPress();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web', easing: Easing.bezier(0.16, 1, 0.3, 1) }),
      Animated.timing(headerSlide, { toValue: 0, duration: 500, useNativeDriver: Platform.OS !== 'web', easing: Easing.bezier(0.16, 1, 0.3, 1) }),
    ]).start();
  }, []);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await resumeApi.list();
      setResumes(res.data.data || []);
    } catch (err) {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchResumes(); }, []);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      setUploading(true);
      const file = result.assets[0];
      const formData = new FormData();
      formData.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'application/pdf' } as any);
      await resumeApi.upload(formData);
      await fetchResumes();
    } catch (err) {} finally {
      setUploading(false);
    }
  };

  const bestScore = resumes.length > 0
    ? Math.max(...resumes.map((r) => r.ats_score || 0))
    : 0;

  const handleDelete = async (id: string) => {
    try {
      await resumeApi.delete(id);
      setResumes(prev => prev.filter(r => r.id !== id));
    } catch (err) {}
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchResumes(); }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerSlide }] }]}>
          <Text style={styles.title}>My Resume</Text>
          <Text style={styles.subtitle}>
            {resumes.length > 0
              ? `${resumes.length} resume${resumes.length > 1 ? 's' : ''} uploaded`
              : 'Upload your resume to get started'}
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: headerOpacity, transform: [{ translateY: headerSlide }] }}>
          <Card style={styles.scoreCard} gradient>
            <View style={styles.scoreInner}>
              <MatchScoreRing score={bestScore} size={64} animated strokeWidth={6} />
              <View style={styles.scoreText}>
                <Text style={styles.scoreValue}>Resume Strength</Text>
                <Text style={styles.scoreDesc}>
                  {bestScore >= 80 ? 'Strong match potential' :
                   bestScore >= 60 ? 'Good foundation' :
                   bestScore > 0 ? 'Room for improvement' :
                   'Upload a resume to see'}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            onPress={handleUpload}
            onPressIn={pressIn}
            onPressOut={pressOut}
            activeOpacity={1}
            disabled={uploading}
          >
            <LinearGradient
              colors={['#2563EB', '#4F8CFF']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.uploadButton}
            >
              <Ionicons
                name={uploading ? 'hourglass-outline' : 'cloud-upload-outline'}
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.uploadText}>
                {uploading ? 'Uploading...' : 'Upload New Resume'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {resumes.map((resume, index) => {
          const { opacity, translateY } = useSlideUp(30 + index * 20);
          const itemScale = useRef(new Animated.Value(1)).current;
          const itemPressIn = () => Animated.spring(itemScale, { toValue: 0.97, useNativeDriver: Platform.OS !== 'web' }).start();
          const itemPressOut = () => Animated.spring(itemScale, { toValue: 1, useNativeDriver: Platform.OS !== 'web' }).start();

          return (
            <Animated.View key={resume.id} style={{ opacity, transform: [{ translateY }] }}>
              <TouchableOpacity activeOpacity={1} onPressIn={itemPressIn} onPressOut={itemPressOut}>
                <Animated.View style={{ transform: [{ scale: itemScale }] }}>
                  <Card style={styles.resumeCard} glowColor={colors.primary}>
                    <View style={styles.resumeHeader}>
                      <LinearGradient colors={['#2563EB', '#4F8CFF']} style={styles.resumeIcon}>
                        <Ionicons name="document-text" size={20} color="#FFFFFF" />
                      </LinearGradient>
                      <View style={{ flex: 1, marginLeft: spacing.sm }}>
                        <Text style={styles.resumeName} numberOfLines={1}>{resume.original_filename}</Text>
                        <Text style={styles.resumeDate}>
                          {formatDate(resume.created_at)}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDelete(resume.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.resumeMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="checkmark-circle" size={14} color={resume.parsed_text ? colors.success : colors.textMuted} />
                        <Text style={styles.metaText}>{resume.parsed_text ? 'Parsed' : 'Pending parse'}</Text>
                      </View>
                    </View>

                    {resume.ats_score !== undefined && resume.ats_score > 0 && (
                      <View style={styles.matchBadge}>
                        <MatchScoreRing score={resume.ats_score} size={28} animated />
                        <Text style={styles.matchText}>{resume.ats_score}% match</Text>
                      </View>
                    )}
                  </Card>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {loading && <Loader />}

        {!loading && resumes.length === 0 && (
          <EmptyState
            icon="document-text-outline"
            title="No resumes yet"
            message="Upload your first resume to get AI-powered job matching."
            actionLabel="Upload Resume"
            onAction={handleUpload}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding() },
  header: { paddingTop: 52, paddingBottom: spacing.sm },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  scoreCard: { marginTop: spacing.md, marginBottom: spacing.md },
  scoreInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.sm },
  scoreText: { flex: 1 },
  scoreValue: { color: colors.text, fontSize: 18, fontWeight: '700' },
  scoreDesc: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  uploadButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.md + 4, borderRadius: borderRadius.lg, gap: spacing.sm,
    ...shadow.lg, marginBottom: spacing.lg,
  },
  uploadText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  resumeCard: { marginBottom: spacing.md },
  resumeHeader: { flexDirection: 'row', alignItems: 'center' },
  resumeIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  resumeName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  resumeDate: { color: colors.textMuted, fontSize: 12, marginTop: 1 },
  resumeMeta: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: colors.textSecondary, fontSize: 12 },
  matchBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight },
  matchText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
});
