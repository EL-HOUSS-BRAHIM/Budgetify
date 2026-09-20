import { formatMoney, money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, EmptyState, Screen } from '../../src/components/ui';
import {
  type PlanningSummary,
  type PlanItemRow,
  usePlanningData,
} from '../../src/features/finance/planning';
import { useTheme } from '../../src/theme/ThemeProvider';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function DecorativeIcon(props: React.ComponentProps<typeof Ionicons>): React.ReactElement {
  return (
    <Ionicons
      {...props}
      accessibilityElementsHidden
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    />
  );
}

function formatAmount(amount: number, currency: string): string {
  return formatMoney(money(amount, currency), { compactZeroFraction: true });
}

function summaryTone(summary: PlanningSummary): 'income' | 'warning' | 'expense' {
  if (summary.status === 'over') return 'expense';
  if (summary.status === 'warning') return 'warning';
  return 'income';
}

function iconForCategory(category: string): IconName {
  const name = category.toLowerCase();
  if (name.includes('food') || name.includes('dining')) return 'restaurant-outline';
  if (name.includes('transport')) return 'car-outline';
  if (name.includes('housing') || name.includes('rent')) return 'home-outline';
  if (name.includes('util') || name.includes('bill')) return 'flash-outline';
  if (name.includes('shopping')) return 'bag-outline';
  return 'pricetag-outline';
}

export default function PlanningScreen(): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isLoading, error, refresh } = usePlanningData();

  useFocusEffect(
    React.useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <Screen
      contentContainerStyle={{ paddingTop: insets.top + 8 }}
      refreshControl={
        <RefreshControl
          colors={[colors.semantic.info]}
          onRefresh={refresh}
          refreshing={isLoading && !!data}
          tintColor={colors.semantic.info}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={[styles.brandMark, { borderColor: colors.semantic.income }]}>
            <DecorativeIcon name="sparkles" size={13} color={colors.semantic.income} />
          </View>
          <Text
            style={[styles.brandName, { color: colors.text.primary, fontFamily: fontFamily.bold }]}
          >
            Lyvora
          </Text>
          <Text style={[styles.brandSection, { color: colors.text.tertiary }]}>| Plan</Text>
        </View>
      </View>

      <View style={styles.planTitleRow}>
        <View>
          <View style={styles.titleWithIcon}>
            <DecorativeIcon name="calendar-outline" size={17} color={colors.text.primary} />
            <Text style={[typography.h3, { color: colors.text.primary }]}>Current Plan</Text>
          </View>
          <Text style={[styles.dayLine, { color: colors.text.tertiary }]}>
            {data
              ? `Day ${data.currentDay} of ${data.daysInMonth} · ${data.daysRemaining} days remaining`
              : 'Loading month progress'}
          </Text>
        </View>
        <View style={[styles.rebalancePill, { backgroundColor: colors.background.tertiary }]}>
          <Text
            style={[
              styles.rebalanceText,
              { color: colors.text.secondary, fontFamily: fontFamily.medium },
            ]}
          >
            Live Data
          </Text>
        </View>
      </View>

      {error && <DataNotice icon="alert-circle-outline" label={error} tone="expense" />}

      {isLoading && !data ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={colors.semantic.info} />
          <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
            Loading your plan
          </Text>
        </View>
      ) : !data || (data.budgetProgress.length === 0 && data.upcomingItems.length === 0) ? (
        <EmptyState
          icon="calendar-outline"
          title="No plan data yet"
          description="Add budgets, commitments, or transactions to build a real monthly plan."
          actionLabel="Add transaction"
          onAction={() => router.push('/modal')}
        />
      ) : (
        <>
          <Card style={styles.summaryCard}>
            {data.essentials && <BudgetSummary icon="checkmark-circle" summary={data.essentials} />}
            {data.essentials && data.flexible && (
              <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
            )}
            {data.flexible && <BudgetSummary icon="compass" summary={data.flexible} />}
            {!data.essentials && !data.flexible && (
              <DataNotice label="Active budgets do not have spend yet." tone="info" />
            )}
          </Card>

          <Card style={[styles.appliedCard, { borderColor: colors.semantic.info }]}>
            <DataNotice
              icon="information-circle-outline"
              label="Budget corrections and reallocations are disabled until persisted action-review contracts are implemented."
              tone="info"
            />
          </Card>

          <Text style={[typography.h4, styles.sectionTitle, { color: colors.text.primary }]}>
            Category Velocity
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.text.tertiary }]}>
            Calculated from active budgets and real transactions
          </Text>
          <Card style={styles.velocityCard}>
            {data.budgetProgress.length === 0 ? (
              <DataNotice label="No active budgets for this period." tone="info" />
            ) : (
              data.budgetProgress.map((item, index) => (
                <React.Fragment key={item.id}>
                  <View style={styles.velocityRow}>
                    <View
                      style={[styles.categoryIcon, { backgroundColor: colors.background.tertiary }]}
                    >
                      <DecorativeIcon
                        name={iconForCategory(item.categoryName)}
                        size={15}
                        color={colors.text.secondary}
                      />
                    </View>
                    <View style={styles.velocityCopy}>
                      <View style={styles.velocityTitleRow}>
                        <Text
                          style={[
                            styles.velocityName,
                            { color: colors.text.primary, fontFamily: fontFamily.medium },
                          ]}
                        >
                          {item.categoryName}
                        </Text>
                        <Text
                          style={[
                            styles.velocityAmount,
                            { color: colors.text.secondary, fontFamily: fontFamily.medium },
                          ]}
                        >
                          {formatMoney(item.spent)} / {formatMoney(item.limit)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.velocityDetail,
                          {
                            color:
                              item.status === 'over'
                                ? colors.semantic.expense
                                : item.status === 'warning'
                                  ? colors.semantic.warning
                                  : colors.semantic.income,
                          },
                        ]}
                      >
                        {item.status === 'over' ? 'Over budget' : `${item.percentSpent}% used`}
                      </Text>
                      <View style={[styles.pacingTrack, { backgroundColor: colors.border.subtle }]}>
                        <View
                          style={[
                            styles.pacingFill,
                            {
                              backgroundColor:
                                item.status === 'over'
                                  ? colors.semantic.expense
                                  : item.status === 'warning'
                                    ? colors.semantic.warning
                                    : colors.brand.primary,
                              width: `${Math.min(100, Math.max(0, item.percentSpent))}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                  {index < data.budgetProgress.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
                  )}
                </React.Fragment>
              ))
            )}
          </Card>

          <Text style={[typography.h4, styles.sectionTitle, { color: colors.text.primary }]}>
            Upcoming Commitments
          </Text>
          <Card style={styles.velocityCard}>
            {data.upcomingItems.length === 0 ? (
              <DataNotice label="No open plan items." tone="info" />
            ) : (
              data.upcomingItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <PlanItemRowView item={item} />
                  {index < data.upcomingItems.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
                  )}
                </React.Fragment>
              ))
            )}
          </Card>

          <Card style={styles.manualCard}>
            <Text style={[typography.h4, { color: colors.text.primary }]}>
              Log unplanned spending
            </Text>
            <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
              Use the transaction modal so the ledger, budgets, and plan refresh from the same
              source of truth.
            </Text>
            <Button
              label="Add transaction"
              icon="add"
              onPress={() => router.push('/modal')}
              variant="secondary"
            />
          </Card>
        </>
      )}
    </Screen>
  );
}

function BudgetSummary({
  icon,
  summary,
}: {
  icon: IconName;
  summary: PlanningSummary;
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  const tone = summaryTone(summary);
  const color = colors.semantic[tone];
  return (
    <View style={styles.summaryRow}>
      <View
        style={[
          styles.categoryIcon,
          {
            backgroundColor:
              tone === 'income'
                ? colors.semantic.incomeLight
                : tone === 'warning'
                  ? colors.semantic.warningLight
                  : colors.semantic.expenseLight,
          },
        ]}
      >
        <DecorativeIcon name={icon} size={15} color={color} />
      </View>
      <View style={styles.summaryCopy}>
        <Text
          style={[
            styles.summaryLabel,
            { color: colors.text.primary, fontFamily: fontFamily.semibold },
          ]}
        >
          {summary.label}
        </Text>
        <Text style={[styles.summaryDetail, { color: colors.text.tertiary }]}>
          {summary.detail}
        </Text>
        <View style={[styles.pacingTrack, { backgroundColor: colors.border.subtle }]}>
          <View
            style={[
              styles.pacingFill,
              { backgroundColor: color, width: `${summary.percentSpent}%` },
            ]}
          />
        </View>
      </View>
      <View style={styles.summaryAmount}>
        <Text style={[styles.summaryAmountText, { color, fontFamily: fontFamily.semibold }]}>
          {formatAmount(summary.remaining, summary.currency)} left
        </Text>
        <Text style={[styles.summaryDetail, { color: colors.text.tertiary }]}>
          {summary.percentSpent}% used
        </Text>
      </View>
    </View>
  );
}

function PlanItemRowView({ item }: { item: PlanItemRow }): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  const dueDate = item.due_date
    ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
        new Date(`${item.due_date}T00:00:00`),
      )
    : 'Unscheduled';

  return (
    <View style={styles.velocityRow}>
      <View style={[styles.categoryIcon, { backgroundColor: colors.background.tertiary }]}>
        <DecorativeIcon
          name={item.is_recurring ? 'repeat-outline' : 'checkbox-outline'}
          size={15}
          color={colors.text.secondary}
        />
      </View>
      <View style={styles.velocityCopy}>
        <View style={styles.velocityTitleRow}>
          <Text
            style={[
              styles.velocityName,
              { color: colors.text.primary, fontFamily: fontFamily.medium },
            ]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.velocityAmount,
              { color: colors.text.secondary, fontFamily: fontFamily.medium },
            ]}
          >
            {formatAmount(item.expected_amount, item.currency)}
          </Text>
        </View>
        <Text style={[styles.velocityDetail, { color: colors.text.tertiary }]}>
          {item.category_name} · {dueDate}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 14, lineHeight: 20 },
  brandSection: { fontSize: 12, lineHeight: 18 },
  planTitleRow: {
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dayLine: { marginTop: 4, fontSize: 10, lineHeight: 14 },
  rebalancePill: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 4 },
  rebalanceText: { fontSize: 9, lineHeight: 13 },
  summaryCard: { marginTop: 16, padding: 12 },
  summaryRow: { minHeight: 65, flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCopy: { flex: 1, minWidth: 0 },
  summaryLabel: { fontSize: 12, lineHeight: 16 },
  summaryDetail: { marginTop: 2, fontSize: 9, lineHeight: 13 },
  summaryAmount: { width: 100, alignItems: 'flex-end' },
  summaryAmountText: { fontSize: 11, lineHeight: 15, textAlign: 'right' },
  divider: { height: 1, marginVertical: 10 },
  pacingTrack: { height: 4, borderRadius: 2, marginTop: 7, overflow: 'hidden' },
  pacingFill: { height: 4, borderRadius: 2 },
  appliedCard: { marginTop: 12, padding: 14 },
  sectionTitle: { marginTop: 20 },
  sectionSubtitle: { marginTop: 2, fontSize: 10, lineHeight: 14 },
  velocityCard: { marginTop: 8, padding: 12 },
  velocityRow: { minHeight: 55, flexDirection: 'row', gap: 9 },
  velocityCopy: { flex: 1, minWidth: 0 },
  velocityTitleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  velocityName: { flex: 1, fontSize: 11, lineHeight: 15 },
  velocityAmount: { fontSize: 10, lineHeight: 14, fontVariant: ['tabular-nums'] },
  velocityDetail: { marginTop: 2, fontSize: 9, lineHeight: 13 },
  manualCard: { marginTop: 12, padding: 12, gap: 10 },
  loadingState: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 40 },
});
