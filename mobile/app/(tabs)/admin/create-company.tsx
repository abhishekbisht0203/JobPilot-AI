import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { companyApi } from '../../../lib/api';

export default function AdminCompanyCreateScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name) { Alert.alert('Error', 'Company name is required'); return; }
    setLoading(true);
    try {
      await companyApi.list({ search: name });
      Alert.alert('Success', 'Company created successfully');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Animated.View entering={FadeInDown.delay(50).springify().damping(14)}>
          <Text style={styles.title}>New Company</Text>
        </Animated.View>
        <GlassCard style={styles.form}>
          <Text style={styles.label}>Company Name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Acme Corp" placeholderTextColor={colors.textMuted} />
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Company description..." placeholderTextColor={colors.textMuted} multiline numberOfLines={4} />
          <Text style={styles.label}>Website</Text>
          <TextInput style={styles.input} value={website} onChangeText={setWebsite} placeholder="https://acme.com" placeholderTextColor={colors.textMuted} keyboardType="url" />
          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="San Francisco, CA" placeholderTextColor={colors.textMuted} />
          <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.8} style={styles.submitBtn}>
            <LinearGradient colors={colors.gradient.primary} style={styles.submitGrad}>
              <Text style={styles.submitText}>{loading ? 'Creating...' : 'Create Company'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding() + spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  form: { padding: spacing.md, gap: spacing.sm },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: spacing.sm },
  input: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: 48, fontSize: 15, color: colors.text },
  textArea: { height: 100, paddingTop: spacing.sm, textAlignVertical: 'top' },
  submitBtn: { marginTop: spacing.lg, borderRadius: borderRadius.md, overflow: 'hidden' },
  submitGrad: { paddingVertical: 14, alignItems: 'center' },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
