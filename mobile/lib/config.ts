import { Platform } from 'react-native';

let devHost: string | null = null;
try {
  const Constants = require('expo-constants').default;
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    devHost = hostUri.split(':')[0];
  }
} catch {}

const envUrl = process.env.EXPO_PUBLIC_API_URL;

function getPlatformDefaultURL(): string {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }
  return 'http://localhost:8000/api/v1';
}

export const API_URL: string =
  envUrl || (devHost ? `http://${devHost}:8000/api/v1` : getPlatformDefaultURL());

export const API_TIMEOUT = 30000;
export const API_RETRY_COUNT = 2;
export const API_RETRY_DELAY = 1000;
