import { formatMoney, type GoalProgress, type Money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Button, Card, DataNotice, EmptyState, ProgressBar, Screen } from '../../src/components/ui';
import { useGoals } from '../../src/features/finance/goals';
import { useTheme } from '../../src/theme/ThemeProvider';

function format(amount: Money): string {
  return formatMoney(amount, { compactZeroFraction: true });
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'No target date';
  return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(
    new Date(`${deadline}T00:00:00`),
  );
}

/** One honest sentence about pace. Never a bare percentage with no meaning. */
function statusLine(goal: GoalProgress): string {
  switch (goal.status) {
    case 'funded':
      return 'Funded. This goal is done.';
    case 'overdue':
      return 'Past its target date and not yet funded.';
    case 'not_started':
      return goal.monthlyContribution.amount > 0
        ? `Nothing saved yet. ${format(goal.monthlyContribution)} a month would get you there.`
        : 'Nothing saved yet.';
    case 'at_risk':
      return `Behind pace. ${format(goal.monthlyContribution)} a month to reach the target.`;
    default:
      return goal.monthlyContribution.amount > 0
        ? `On track at ${format(goal.monthlyContribution)} a month.`
        : 'On track.';
  }
}

function statusColor(goal: GoalProgress, colors: ReturnType<typeof useTheme>['colors']): string {
  if (goal.status === 'funded') return colors.semantic.income;
  if (goal.status === 'overdue' || goal.status === 'at_risk') return colors.semantic.expense;
  return colors.semantic.info;
}

export default function GoalsScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const { goals, aggregate, isLoading, isRefreshing, error, refresh } = useGoals();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const runRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  return (
    <Screen
      refreshControl={
        <RefreshControl
          colors={[colors.semantic.info]}
          onRefresh={runRefresh}
          refreshing={isRefreshing}
          tintColor={colors.semantic.info}
        />
      }
      topInset
    >
      {isLoading ? (
        <View accessibilityLabel="Loading goals" style={styles.loading}>
          <ActivityIndicator color={colors.semantic.info} />
        </View>
      ) : error ? (
        <Card style={styles.stateCard}>
          <DataNotice icon="alert-circle-outline" label={error} tone="expense" />
          <Button label="Try again" onPress={runRefresh} variant="secondary" />
        </Card>
      ) : goals.length === 0 ? (
        <Card>
          <EmptyState
            actionLabel="Add your first goal"
            description="Describe what you want, the target amount, and when you need it."
            icon="flag-outline"
            onAction={() => router.push('/goal-modal')}
            title="No goals yet"
          />
        </Card>
      ) : (
        <>
          <View style={styles.header}>
            <View style={[styles.brandMark, { borderColor: colors.semantic.income }]}>
              <Ionicons name="sparkles" size={13} color={colors.semantic.income} />
            </View>
            <Text
              style={[
                styles.brandName,
                { color: colors.text.primary, fontFamily: fontFamily.bold },
              ]}
            >
              Lyvora
            </Text>
            <Text style={[styles.brandSection, { color: colors.text.tertiary }]}>| Goals</Text>
          </View>

          <View style={styles.titleRow}>
            <View style={styles.titleCopy}>
              <Text
                style={[
                  styles.eyebrow,
                  { color: colors.semantic.info, fontFamily: fontFamily.semibold },
                ]}
              >
                CAPITAL TARGETS
              </Text>
              <Text style={[typography.h2, { color: colors.text.primary }]}>Goals</Text>
              <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
                Real savings targets from your ledger
              </Text>
            </View>
          </View>

          <Card style={styles.aggregateCard}>
            <Text style={[styles.aggregateLabel, { color: colors.text.tertiary }]}>
              AGGREGATE RESERVED
            </Text>
            <Text
              style={[
                styles.aggregateAmount,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              {format(aggregate.saved)}{' '}
              <Text style={{ color: colors.text.tertiary }}>/ {format(aggregate.target)}</Text>
            </Text>
            <ProgressBar
              accessibilityLabel={`${aggregate.percentComplete}% of your savings goals funded`}
              color={colors.semantic.income}
              percent={aggregate.percentComplete}
              trackColor={colors.border.subtle}
            />
            <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
              {aggregate.fundedCount} of {aggregate.goalCount} funded
            </Text>
            {aggregate.excludedCount > 0 && (
              <DataNotice
                label={`${aggregate.excludedCount} goal(s) use another currency and are excluded from this aggregate.`}
                tone="warning"
              />
            )}
          </Card>

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text.primary, fontFamily: fontFamily.medium },
            ]}
          >
            Active Goals
          </Text>
          <View style={styles.goalList}>
            {goals.map((goal) => (
              <GoalCard goal={goal} key={goal.id} />
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

function GoalCard({ goal }: { goal: GoalProgress }): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const accent = statusColor(goal, colors);

  return (
    <Card style={styles.goalCard}>
      <View style={styles.goalTop}>
        <View style={[styles.goalIcon, { backgroundColor: colors.brand.accentLight }]}>
          <Ionicons name="flag-outline" size={20} color={accent} />
        </View>
        <View style={styles.goalCopy}>
          <Text
            numberOfLines={2}
            style={[typography.h4, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
          >
            {goal.name}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
            Target date · {formatDeadline(goal.deadline ?? null)}
          </Text>
        </View>
      </View>
      <View style={styles.goalMetricRow}>
        <Text
          style={[
            styles.goalAmount,
            { color: colors.text.primary, fontFamily: fontFamily.semibold },
          ]}
        >
          {format(goal.saved)}
        </Text>
        <Text style={[styles.goalTarget, { color: colors.text.tertiary }]}>
          of {format(goal.target)}
        </Text>
      </View>
      <ProgressBar
        accessibilityLabel={`${goal.percentComplete}% progress for ${goal.name}`}
        color={accent}
        percent={goal.percentComplete}
        trackColor={colors.border.subtle}
      />
      <Text style={[typography.bodySmall, { color: accent }]}>{statusLine(goal)}</Text>
      <Button
        label="Review strategy"
        onPress={() => router.push(`/goals/${goal.id}/strategy`)}
        variant="text"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  loading: { minHeight: 240, alignItems: 'center', justifyContent: 'center' },
  stateCard: { padding: 16, gap: 16 },
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
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
  titleRow: { marginTop: 18, flexDirection: 'row', gap: 12 },
  titleCopy: { flex: 1, gap: 3, minWidth: 0 },
  eyebrow: { fontSize: 10, lineHeight: 14 },
  aggregateCard: { marginTop: 16, padding: 14, gap: 10 },
  aggregateLabel: { fontSize: 10, lineHeight: 14 },
  aggregateAmount: { fontSize: 26, lineHeight: 32, fontVariant: ['tabular-nums'] },
  sectionTitle: { marginTop: 20, marginBottom: 10, fontSize: 16, lineHeight: 22 },
  goalList: { gap: 12 },
  goalCard: { padding: 14, gap: 12 },
  goalTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCopy: { flex: 1, minWidth: 0 },
  goalMetricRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  goalAmount: { fontSize: 16, lineHeight: 22, fontVariant: ['tabular-nums'] },
  goalTarget: { fontSize: 12, lineHeight: 18 },
});
