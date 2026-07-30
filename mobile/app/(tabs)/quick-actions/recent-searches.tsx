import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';

interface RecentSearch {
  id: string;
  term: string;
  createdAt: string;
}

export function useRecentSearches() {
  const [searches, setSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('recent-searches');
      if (raw) setSearches(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (updated: RecentSearch[]) => {
    setSearches(updated);
    try { localStorage.setItem('recent-searches', JSON.stringify(updated)); } catch {}
  };

  const addSearch = (term: string) => {
    const updated = [
      { id: Date.now().toString(), term, createdAt: new Date().toISOString() },
      ...searches.filter((s) => s.term.toLowerCase() !== term.toLowerCase()),
    ].slice(0, 20);
    persist(updated);
  };

  const clearAll = () => persist([]);

  const removeSearch = (id: string) => persist(searches.filter((s) => s.id !== id));

  return { searches, addSearch, clearAll, removeSearch };
}

export { useRecentSearches as useRecentSearchesStore };

function SearchItem({ item, onTap, onRemove, index }: {
  item: RecentSearch; onTap: (term: string) => void; onRemove: (id: string) => void; index: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(index * 40).springify().damping(14)} layout={Layout.springify()}>
      <TouchableOpacity onPress={() => onTap(item.term)} activeOpacity={0.7}>
        <GlassCard style={styles.searchCard}>
          <View style={styles.searchRow}>
            <LinearGradient colors={['#EFF6FF', '#F5F3FF']} style={styles.searchIconBg}>
              <Ionicons name="search" size={16} color={colors.primary} />
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.searchTerm} numberOfLines={1}>{item.term}</Text>
              <Text style={styles.searchDate}>
                {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <TouchableOpacity onPress={() => onRemove(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RecentSearchesScreen() {
  const { searches, clearAll, removeSearch } = useRecentSearches();
  const { horizontalPadding } = useResponsive();
  const insets = useSafeAreaInsets();

  const handleTapSearch = (term: string) => {
    router.push({ pathname: '/(tabs)/find-jobs', params: { search: term } });
  };

  const handleClearAll = () => {
    if (searches.length === 0) return;
    Alert.alert('Clear All', 'Are you sure you want to clear all recent searches?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearAll },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={searches}
        renderItem={({ item, index }) => (
          <SearchItem item={item} onTap={handleTapSearch} onRemove={removeSearch} index={index} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: getTabListBottomPadding() + spacing.md,
          paddingHorizontal: horizontalPadding,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color={colors.text} />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.title}>Recent Searches</Text>
                <Text style={styles.subtitle}>{searches.length} searches</Text>
              </View>
              {searches.length > 0 && (
                <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No recent searches"
            message="Your search history will appear here as you search for jobs."
            actionLabel="Search Jobs"
            onAction={() => router.push('/(tabs)/find-jobs')}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  clearBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...shadow.xs },
  searchCard: { padding: spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  searchIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  searchTerm: { fontSize: 15, fontWeight: '600', color: colors.text },
  searchDate: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
});
