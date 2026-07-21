import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store';
import { authApi } from '../../lib/api';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await authApi.register(name, email, password);
      setAuth(response.data.user, response.data.token);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
          <Ionicons name="person-add-outline" size={40} color={colors.primary} />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join JobPilot AI and simplify your job search</Text>
        </View>

        <View style={styles.form}>
          <Input label="Full Name" value={name} onChangeText={setName} placeholder="John Doe" icon="person-outline" />
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="john@example.com" keyboardType="email-address" autoCapitalize="none" icon="mail-outline" />
          <Input label="Password" value={password} onChangeText={setPassword} placeholder="Min. 6 characters" secureTextEntry icon="lock-closed-outline" />
          <Input label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repeat your password" secureTextEntry icon="lock-closed-outline" />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Create Account" onPress={handleRegister} loading={loading} size="lg" style={styles.registerButton} />

          <Button title="Continue with Google" onPress={() => {}} variant="outline" size="lg" style={styles.googleButton} icon={<Ionicons name="logo-google" size={20} color={colors.primary} />} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Button title="Sign In" onPress={() => router.back()} variant="ghost" size="sm" />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', marginTop: spacing.md },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: spacing.xs, textAlign: 'center' },
  form: { width: '100%' },
  error: { color: colors.error, textAlign: 'center', marginBottom: spacing.md },
  registerButton: { marginTop: spacing.md },
  googleButton: { marginTop: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg },
  footerText: { color: colors.textSecondary, fontSize: 14 },
});
