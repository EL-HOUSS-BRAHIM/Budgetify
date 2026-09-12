import { formatMoney, money } from '@budgetify/core';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function BudgetsScreen(): React.ReactElement {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const currency = 'USD';

  const categories = [
    {
      name: 'Food & Dining',
      spent: money(54000, currency),
      limit: money(70000, currency),
      icon: '🍔',
    },
    {
      name: 'Housing & Utilities',
      spent: money(120000, currency),
      limit: money(120000, currency),
      icon: '🏠',
    },
    {
      name: 'Transportation',
      spent: money(15000, currency),
      limit: money(30000, currency),
      icon: '🚗',
    },
    {
      name: 'Entertainment',
      spent: money(22000, currency),
      limit: money(20000, currency),
      icon: '🎬',
    },
    {
      name: 'Shopping & Misc',
      spent: money(11050, currency),
      limit: money(25000, currency),
      icon: '🛍️',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
    >
      <Text style={[typography.h3, { color: colors.text.primary, marginBottom: spacing.md }]}>
        September Budgets
      </Text>

      {categories.map((cat) => {
        const percent = Math.min(100, Math.round((cat.spent.amount / cat.limit.amount) * 100));
        const isOver = cat.spent.amount > cat.limit.amount;

        return (
          <View
            key={cat.name}
            style={[
              styles.budgetCard,
              { backgroundColor: colors.background.card, borderColor: colors.border.default },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <Text style={styles.icon}>{cat.icon}</Text>
                <View>
                  <Text
                    style={[
                      typography.bodyLarge,
                      { color: colors.text.primary, fontWeight: '600' },
                    ]}
                  >
                    {cat.name}
                  </Text>
                  <Text
                    style={[
                      typography.bodySmall,
                      { color: isOver ? colors.semantic.expense : colors.text.tertiary },
                    ]}
                  >
                    {isOver ? 'Over budget' : `${100 - percent}% remaining`}
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text
                  style={[typography.bodyLarge, { color: colors.text.primary, fontWeight: '700' }]}
                >
                  {formatMoney(cat.spent)}
                </Text>
                <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
                  of {formatMoney(cat.limit)}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.progressTrack,
                { backgroundColor: colors.background.tertiary, marginTop: spacing.md },
              ]}
            >
              <View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: isOver
                      ? colors.semantic.expense
                      : percent > 80
                        ? colors.semantic.warning
                        : colors.brand.primary,
                    width: `${percent}%`,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  budgetCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 24,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});
