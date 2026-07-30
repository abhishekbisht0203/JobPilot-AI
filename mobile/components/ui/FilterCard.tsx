import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../lib/useThemeColors';
import { spacing, borderRadius, typography as typographyTokens } from '../../lib/theme';
import type { TextStyle } from 'react-native';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterSection {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  options: FilterOption[];
  multi?: boolean;
  selected: string[];
  onSelect: (values: string[]) => void;
}

interface FilterCardProps {
  sections: FilterSection[];
  onClearAll?: () => void;
  onApply?: () => void;
  showApply?: boolean;
  title?: string;
}

function FilterSection({ section }: { section: FilterSection }) {
  const c = useThemeColors();
  const [expanded, setExpanded] = useState(true);
  const isMulti = section.multi !== false;

  const toggleOption = useCallback(
    (value: string) => {
      if (isMulti) {
        const next = section.selected.includes(value)
          ? section.selected.filter((v) => v !== value)
          : [...section.selected, value];
        section.onSelect(next);
      } else {
        section.onSelect([value]);
      }
    },
    [section, isMulti]
  );

  return (
    <View style={[styles.section, { borderBottomColor: c.border }]}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded((e) => !e)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          {section.icon && (
            <Ionicons name={section.icon} size={16} color={c.primary} style={{ marginRight: 6 }} />
          )}
          <Text style={[styles.sectionTitle, { color: c.text }]}>{section.title}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={c.textMuted}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.sectionBody}>
          {section.options.map((opt) => {
            const selected = section.selected.includes(opt.value);
            return (
              <TouchableOpacity
                key={opt.value}
                style={styles.optionRow}
                onPress={() => toggleOption(opt.value)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: selected ? c.primary : c.border,
                      backgroundColor: selected ? c.primary : 'transparent',
                    },
                    !isMulti && styles.radio,
                  ]}
                >
                  {selected && (
                    <Ionicons
                      name={isMulti ? 'checkmark' : 'ellipse'}
                      size={isMulti ? 12 : 8}
                      color="#FFF"
                    />
                  )}
                </View>
                <Text style={[styles.optionLabel, { color: c.text }]}>{opt.label}</Text>
                {opt.count !== undefined && (
                  <View style={[styles.countBadge, { backgroundColor: c.highlight }]}>
                    <Text style={[styles.countText, { color: c.primary }]}>{opt.count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function FilterCard({
  sections,
  onClearAll,
  onApply,
  showApply = false,
  title = 'Filters',
}: FilterCardProps) {
  const c = useThemeColors();
  const totalSelected = sections.reduce((sum, s) => sum + s.selected.length, 0);

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={[styles.cardHeader, { borderBottomColor: c.border }]}>
        <Text style={[styles.cardTitle, { color: c.text }]}>{title}</Text>
        {totalSelected > 0 && (
          <TouchableOpacity onPress={onClearAll} activeOpacity={0.7}>
            <Text style={[styles.clearText, { color: c.primary }]}>
              Clear ({totalSelected})
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        style={styles.cardBody}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {sections.map((section, idx) => (
          <FilterSection key={idx} section={section} />
        ))}
      </ScrollView>
      {showApply && (
        <TouchableOpacity
          style={[styles.applyBtn, { backgroundColor: c.primary }]}
          onPress={onApply}
          activeOpacity={0.8}
        >
          <Text style={styles.applyText}>Apply Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: 500,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
  },
  cardTitle: {
    ...typographyTokens.subtitle as TextStyle,
  },
  clearText: {
    ...typographyTokens.caption,
    fontWeight: '600',
  },
  cardBody: {},
  section: {
    borderBottomWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typographyTokens.caption,
    fontWeight: '600' as TextStyle['fontWeight'],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  radio: {
    borderRadius: 10,
  },
  optionLabel: {
    ...typographyTokens.bodySmall,
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  countText: {
    ...typographyTokens.captionSmall,
    fontWeight: '600',
  },
  applyBtn: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  applyText: {
    color: '#FFFFFF',
    ...typographyTokens.button,
  } as TextStyle,
});
