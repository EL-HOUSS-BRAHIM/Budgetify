import { formatMoney, money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, DataNotice } from '../../src/components/ui';
import { type BudgetProgressItem, useBudgetProgress } from '../../src/features/finance/budgets';
import { useTheme } from '../../src/theme/ThemeProvider';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function iconForCategory(category: string): IconName {
  const normalized = category.toLowerCase();
  if (normalized.includes('food') || normalized.includes('dining')) return 'restaurant-outline';
  if (normalized.includes('housing') || normalized.includes('rent')) return 'home-outline';
  if (normalized.includes('transport')) return 'car-outline';
  if (normalized.includes('entertainment')) return 'film-outline';
  if (normalized.includes('shopping')) return 'bag-outline';
  if (normalized.includes('health')) return 'medical-outline';
  return 'pricetag-outline';
}

function budgetStatusLabel(item: BudgetProgressItem): string {
  if (item.status === 'over')
    return `${formatMoney(money(Math.abs(item.remaining.amount), item.remaining.currency))} over`;
  if (item.status === 'warning') return `${item.percentSpent}% used`;
  return `${Math.max(0, 100 - item.percentSpent)}% remaining`;
}

export default function BudgetsScreen(): React.ReactElement {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { budgets, isLoading, error, refresh } = useBudgetProgress();

  useFocusEffect(
    React.useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      refreshControl={
        <RefreshControl
          colors={[colors.brand.primary]}
          onRefresh={refresh}
          refreshing={isLoading && budgets.length > 0}
          tintColor={colors.brand.primary}
        />
      }
    >
      <Text style={[typography.h3, { color: colors.text.primary, marginBottom: spacing.md }]}>
        Budgets
      </Text>

      {error && <DataNotice icon="alert-circle-outline" label={error} tone="expense" />}

      {isLoading && budgets.length === 0 ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={colors.brand.primary} />
          <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
            Loading budget progress
          </Text>
        </View>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          title="No active budgets"
          description="Create budgets from real categories before this screen can calculate progress."
          actionLabel="Add transaction"
          onAction={() => router.push('/modal')}
        />
      ) : (
        budgets.map((item) => {
          const percent = Math.min(100, Math.max(0, item.percentSpent));
          const isOver = item.status === 'over';

          return (
            <View
              key={item.id}
              style={[
                styles.budgetCard,
                { backgroundColor: colors.background.card, borderColor: colors.border.default },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                  <View style={[styles.iconWrap, { backgroundColor: colors.background.tertiary }]}>
                    <Ionicons
                      name={iconForCategory(item.categoryName)}
                      size={22}
                      color={colors.text.secondary}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        typography.bodyLarge,
                        { color: colors.text.primary, fontWeight: '600' },
                      ]}
                    >
                      {item.categoryName}
                    </Text>
                    <Text
                      style={[
                        typography.bodySmall,
                        { color: isOver ? colors.semantic.expense : colors.text.tertiary },
                      ]}
                    >
                      {budgetStatusLabel(item)}
                    </Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={[
                      typography.bodyLarge,
                      { color: colors.text.primary, fontWeight: '700' },
                    ]}
                  >
                    {formatMoney(item.spent)}
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
                    of {formatMoney(item.limit)}
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
        })
      )}
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
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 40,
  },
});
