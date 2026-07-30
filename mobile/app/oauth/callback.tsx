import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store';
import { authApi } from '@/lib/api';

export default function OAuthCallbackScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { setCredentials } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/login');
      return;
    }

    const handleOAuth = async () => {
      try {
        setCredentials({ user: null as any, token });
        const res = await authApi.getProfile();
        const user = res.data?.user || res.data?.data || res.data;
        setCredentials({ user, token });

        if (user.profileCompleted === false) {
          router.replace('/(tabs)/profile');
        } else {
          router.replace('/(tabs)');
        }
      } catch {
        router.replace('/(auth)/login');
      }
    };

    handleOAuth();
  }, [token]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0A66C2" />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F2EF' },
  text: { marginTop: 16, fontSize: 16, color: '#6B7280' },
});
