import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';

export default function AdminPlaceholder({ title }: { title?: string }) {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const pageTitle = title || 'Section';

  return (
    <View style={s.container}>
      <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={s.title}>{pageTitle}</Text>
      <Text style={s.desc}>This section will be available soon.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 60, left: 20, width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  desc: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
});
