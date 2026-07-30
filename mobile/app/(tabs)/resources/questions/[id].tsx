import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../../lib/theme';
import { GlassCard } from '../../../../components/ui/GlassCard';
import { Badge } from '../../../../components/ui/Badge';
import { Loader } from '../../../../components/ui/Loader';

export default function QuestionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [question, setQuestion] = useState<any>(null);
  const [loading] = useState(false);
  const insets = useSafeAreaInsets();

  const difficultyColor = question?.difficulty === 'Hard' ? colors.error : question?.difficulty === 'Medium' ? colors.warning : colors.success;

  if (loading) return <Loader fullScreen />;
  if (!question) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text, fontSize: 16 }}>Select a question from the list</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInDown.delay(50).springify().damping(14)} style={styles.content}>
          <GlassCard>
            <View style={styles.badgeRow}>
              <Badge label={question.category || ''} variant="primary" size="sm" />
              <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '20' }]}>
                <Text style={[styles.difficultyText, { color: difficultyColor }]}>{question.difficulty}</Text>
              </View>
              {question.company && <Badge label={question.company} variant="default" size="sm" />}
            </View>
            <Text style={styles.question}>{question.question}</Text>
          </GlassCard>

          <GlassCard glowColor={colors.primary}>
            <View style={styles.answerHeader}>
              <Ionicons name="bulb-outline" size={20} color={colors.warning} />
              <Text style={styles.answerTitle}>Suggested Answer</Text>
            </View>
            <Text style={styles.answerText}>{question.answer}</Text>
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 60 },
  header: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...shadow.sm },
  content: { padding: spacing.md, gap: spacing.md },
  badgeRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  difficultyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.sm },
  difficultyText: { fontSize: 11, fontWeight: '600' },
  question: { fontSize: 18, fontWeight: '700', color: colors.text, lineHeight: 26 },
  answerHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  answerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  answerText: { color: colors.textSecondary, fontSize: 15, lineHeight: 24 },
});
