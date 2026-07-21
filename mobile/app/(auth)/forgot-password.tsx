import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../lib/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Button title="Back" onPress={() => router.back()} variant="ghost" size="sm" style={styles.backButton} icon={<Ionicons name="arrow-back" size={20} color={colors.primary} />} />
        <Ionicons name="key-outline" size={48} color={colors.primary} style={styles.icon} />
        <Text style={styles.title}>Reset Password</Text>
        {sent ? (
          <>
            <Text style={styles.successText}>Check your email for a password reset link.</Text>
            <Button title="Back to Login" onPress={() => router.replace('/(auth)/login')} style={styles.button} />
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>Enter your email and we'll send you a reset link.</Text>
            <Input label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" keyboardType="email-address" autoCapitalize="none" icon="mail-outline" />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Send Reset Link" onPress={handleSend} loading={loading} style={styles.button} />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  backButton: { position: 'absolute', top: spacing.xl, left: spacing.md },
  icon: { alignSelf: 'center', marginBottom: spacing.md },
  title: { color: colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginVertical: spacing.lg },
  successText: { color: colors.success, fontSize: 16, textAlign: 'center', marginVertical: spacing.lg },
  error: { color: colors.error, textAlign: 'center', marginBottom: spacing.md },
  button: { marginTop: spacing.md },
});
