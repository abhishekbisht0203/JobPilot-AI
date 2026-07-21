import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store';
import { authApi } from '../../lib/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await authApi.login(email, password);
      setAuth(response.data.user, response.data.token);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Ionicons name="rocket-outline" size={48} color={colors.primary} />
          <Text style={styles.title}>JobPilot AI</Text>
          <Text style={styles.subtitle}>One click. AI applies everywhere.</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            icon="lock-closed-outline"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={styles.loginButton}
          />

          <Button
            title="Continue with Google"
            onPress={() => {}}
            variant="outline"
            size="lg"
            style={styles.googleButton}
            icon={<Ionicons name="logo-google" size={20} color={colors.primary} />}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Button
              title="Sign Up"
              onPress={() => router.push('/(auth)/register')}
              variant="ghost"
              size="sm"
            />
          </View>

          <Button
            title="Forgot Password?"
            onPress={() => router.push('/(auth)/forgot-password')}
            variant="ghost"
            size="sm"
            style={styles.forgotButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  title: { color: colors.text, fontSize: 32, fontWeight: '700', marginTop: spacing.md },
  subtitle: { color: colors.textSecondary, fontSize: 16, marginTop: spacing.xs },
  form: { width: '100%' },
  error: { color: colors.error, textAlign: 'center', marginBottom: spacing.md },
  loginButton: { marginTop: spacing.md },
  googleButton: { marginTop: spacing.sm },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: { color: colors.textSecondary, fontSize: 14 },
  forgotButton: { marginTop: spacing.xs, alignSelf: 'center' },
});
