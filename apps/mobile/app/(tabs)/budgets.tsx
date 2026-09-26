import { formatMoney, monthKeyFromDate, monthLabel, shiftMonth, type MonthKey } from '@budgetify/core';
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
import { DataNotice, EmptyState, MonthSwitcher, ProgressBar, StatGrid } from '../../src/components/ui';
import { type BudgetProgressItem, useBudgetProgress } from '../../src/features/finance/budgets';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useResponsiveLayout } from '../../src/theme/useResponsiveLayout';

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

/** Plain-language budget status. No percentages as the only signal. */
function budgetStatusLabel(item: BudgetProgressItem, isCurrentMonth: boolean): string {
  if (item.status === 'over') {
    return `${formatMoney({ amount: Math.abs(item.remaining.amount), currency: item.limit.currency })} over`;
  }
  if (item.status === 'warning') return `${item.percentSpent}% of the limit used`;
  if (isCurrentMonth && item.dailyAllowance.amount > 0) {
    return `${formatMoney(item.dailyAllowance)} a day left to spend`;
  }
  return `${formatMoney(item.remaining)} left`;
}

export default function BudgetsScreen(): React.ReactElement {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const responsive = useResponsiveLayout();
  const [month, setMonth] = React.useState<MonthKey>(() => monthKeyFromDate(new Date()));
  const currentMonth = monthKeyFromDate(new Date());
  const isCurrentMonth = month === currentMonth;
  const { budgets, totals, isLoading, error, refresh } = useBudgetProgress(month);

  useFocusEffect(
    React.useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const runRefresh = React.useCallback(() => {
    void refresh();
  }, [refresh]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: insets.bottom + responsive.gutter * 2,
          paddingHorizontal: responsive.contentPadding,
          maxWidth: responsive.maxContentWidth + responsive.gutter * 2,
          alignSelf: 'center',
          width: '100%',
        },
      ]}
      refreshControl={
        <RefreshControl
          colors={[colors.brand.primary]}
          onRefresh={runRefresh}
          refreshing={isLoading && budgets.length > 0}
          tintColor={colors.brand.primary}
        />
      }
    >
      <Text style={[typography.h3, { color: colors.text.primary, marginBottom: spacing.md }]}>
        Budgets
      </Text>
      <MonthSwitcher
        canGoNext={month < currentMonth}
        label={monthLabel(month)}
        onNext={() => setMonth((value) => shiftMonth(value, 1))}
        onPrevious={() => setMonth((value) => shiftMonth(value, -1))}
      />

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
          actionLabel="Create budget"
          description={`Set a monthly limit per category. Progress for ${monthLabel(month)} appears here once you have budgets.`}
          icon="wallet-outline"
          onAction={() => router.push('/budget-modal')}
          title="No active budgets"
        />
      ) : (
        <>
          <View style={styles.totals}>
            <StatGrid
              tiles={[
                { label: 'Total limit', value: formatMoney(totals.limit) },
                {
                  label: 'Spent',
                  value: formatMoney(totals.spent),
                  color: colors.semantic.expense,
                },
                {
                  label: totals.remaining.amount < 0 ? 'Over by' : 'Left to spend',
                  value: formatMoney({
                    amount: Math.abs(totals.remaining.amount),
                    currency: totals.remaining.currency,
                  }),
                  color:
                    totals.remaining.amount < 0 ? colors.semantic.expense : colors.semantic.income,
                },
              ]}
            />
          </View>

          {budgets.map((item) => {
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
                    <View style={styles.titleCopy}>
                      <Text
                        numberOfLines={1}
                        style={[typography.bodyLarge, { color: colors.text.primary, fontWeight: '600' }]}
                      >
                        {item.categoryName}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={[
                          typography.bodySmall,
                          { color: isOver ? colors.semantic.expense : colors.text.tertiary },
                        ]}
                      >
                        {budgetStatusLabel(item, isCurrentMonth)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.amounts}>
                    <Text
                      style={[typography.bodyLarge, { color: colors.text.primary, fontWeight: '700' }]}
                    >
                      {formatMoney(item.spent)}
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
                      of {formatMoney(item.limit)}
                    </Text>
                  </View>
                </View>

                <View style={{ marginTop: spacing.md }}>
                  <ProgressBar
                    accessibilityLabel={`${item.categoryName}: ${item.percentSpent}% of the limit used`}
                    color={
                      isOver
                        ? colors.semantic.expense
                        : percent > 80
                          ? colors.semantic.warning
                          : colors.brand.primary
                    }
                    percent={percent}
                    trackColor={colors.background.tertiary}
                  />
                </View>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 16, flexGrow: 1 },
  totals: { marginTop: 16, marginBottom: 4 },
  budgetCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  titleCopy: { flex: 1, minWidth: 0 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amounts: { alignItems: 'flex-end' },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 40,
  },
});
