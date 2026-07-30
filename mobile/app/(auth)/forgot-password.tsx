import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform,
  TouchableOpacity, TextInput as RNTextInput, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { useResponsive } from '../../lib/responsive';
import { AnimatedBackground } from '../../components/ui/AnimatedBackground';
import { userApi } from '../../lib/api';

export default function ForgotPasswordScreen() {
  const { horizontalPadding } = useResponsive();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true); setError('');
    try {
      await userApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset email');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.iconWrap}>
            <LinearGradient colors={['#2563EB', '#4F8CFF']} style={styles.iconGradient}>
              <Ionicons name="key-outline" size={28} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>Reset Password</Text>

          {sent ? (
            <View style={styles.sentContainer}>
              <Ionicons name="checkmark-circle" size={64} color={colors.success} />
              <Text style={styles.successText}>Check your email for a password reset link.</Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')} activeOpacity={0.9}>
                <LinearGradient colors={['#2563EB', '#4F8CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
                  <Text style={styles.buttonText}>Back to Login</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>Enter your email and we'll send you a reset link.</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
                  <RNTextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={(t) => { setEmail(t); setError(''); }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="go"
                    onSubmitEditing={handleSend}
                  />
                </View>
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity onPress={handleSend} disabled={loading} activeOpacity={0.9}>
                <LinearGradient colors={['#2563EB', '#4F8CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
                  <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.xl },
  backButton: {
    position: 'absolute', top: 56, left: spacing.md, zIndex: 10,
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center',
    ...shadow.sm,
  },
  iconWrap: { alignSelf: 'center', marginBottom: spacing.md, ...shadow.glow.primary },
  iconGradient: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginVertical: spacing.lg },
  sentContainer: { alignItems: 'center', gap: spacing.md },
  successText: { color: colors.success, fontSize: 16, textAlign: 'center' },
  error: { color: colors.error, textAlign: 'center', marginBottom: spacing.md },
  gradientButton: {
    height: 52, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center',
    ...shadow.glow.primary,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  inputGroup: { marginBottom: spacing.md },
  inputLabel: { color: colors.text, fontSize: 13, fontWeight: '600', marginBottom: spacing.xs },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, height: 48,
    borderWidth: 1, borderColor: colors.border,
  },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 0 },
});
