import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../lib/useThemeColors';
import { borderRadius } from '../../lib/theme';

const LOGO_MAP: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  google: { icon: 'logo-google', color: '#4285F4', bg: '#E8F0FE' },
  microsoft: { icon: 'logo-windows', color: '#00A4EF', bg: '#E6F7FF' },
  amazon: { icon: 'cart', color: '#FF9900', bg: '#FFF3E0' },
  meta: { icon: 'logo-facebook', color: '#1877F2', bg: '#E7F3FF' },
  apple: { icon: 'logo-apple', color: '#000000', bg: '#F5F5F5' },
  netflix: { icon: 'film', color: '#E50914', bg: '#FDECEA' },
  spotify: { icon: 'musical-notes', color: '#1DB954', bg: '#E6F9ED' },
  twitter: { icon: 'logo-twitter', color: '#1DA1F2', bg: '#E8F5FE' },
  linkedin: { icon: 'logo-linkedin', color: '#0A66C2', bg: '#E8F0FE' },
  github: { icon: 'logo-github', color: '#333333', bg: '#F0F0F0' },
  stripe: { icon: 'flash', color: '#635BFF', bg: '#F0EFFF' },
  slack: { icon: 'chatbubbles', color: '#4A154B', bg: '#F3EAF4' },
  notion: { icon: 'document-text', color: '#000000', bg: '#F5F5F5' },
  figma: { icon: 'color-palette', color: '#F24E1E', bg: '#FEF0EB' },
  vercel: { icon: 'triangle', color: '#000000', bg: '#F5F5F5' },
  airbnb: { icon: 'bed', color: '#FF5A5F', bg: '#FFEEEF' },
  uber: { icon: 'car', color: '#000000', bg: '#F5F5F5' },
  lyft: { icon: 'car-sport', color: '#FF00BF', bg: '#FFE6F9' },
  dropbox: { icon: 'cloud-download', color: '#0061FF', bg: '#E6F0FF' },
  discord: { icon: 'logo-discord', color: '#5865F2', bg: '#EEF0FD' },
  zoom: { icon: 'videocam', color: '#2D8CFF', bg: '#EAF4FF' },
  stripe2: { icon: 'cash', color: '#00A16E', bg: '#E6F9F3' },
  shopify: { icon: 'bag-handle', color: '#7AB55C', bg: '#F2F9EE' },
  'coinbase': { icon: 'logo-bitcoin', color: '#0052FF', bg: '#E6F0FF' },
  pinterest: { icon: 'logo-pinterest', color: '#E60023', bg: '#FDE8EC' },
  tiktok: { icon: 'musical-note', color: '#000000', bg: '#F5F5F5' },
  snapchat: { icon: 'logo-snapchat', color: '#FFFC00', bg: '#FFFEE6' },
  adobe: { icon: 'image', color: '#FF0000', bg: '#FFE6E6' },
  salesforce: { icon: 'cloud', color: '#00A1E0', bg: '#E6F7FF' },
  intel: { icon: 'server', color: '#0071C5', bg: '#E6F2FC' },
  ibm: { icon: 'hardware-chip', color: '#052FAD', bg: '#E6EDFF' },
  default: { icon: 'business', color: '#6B7280', bg: '#F3F4F6' },
};

interface CompanyLogoProps {
  name: string;
  size?: number;
  showName?: boolean;
  url?: string;
}

export default function CompanyLogo({ name, size = 40, showName = false, url }: CompanyLogoProps) {
  const c = useThemeColors();
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const config = LOGO_MAP[key] || LOGO_MAP.default;
  const isDark = c.isDark;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.logo,
          {
            width: size,
            height: size,
            borderRadius: size / 4,
            backgroundColor: isDark ? '#1F2937' : config.bg,
          },
        ]}
      >
        <Ionicons
          name={config.icon}
          size={size * 0.5}
          color={isDark ? '#E5E7EB' : config.color}
        />
      </View>
      {showName && (
        <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
          {name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
});
