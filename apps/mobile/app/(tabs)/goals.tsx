import { formatMoney, money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import type { Tables } from '@budgetify/types';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, EmptyState, Screen } from '../../src/components/ui';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeProvider';

type Goal = Tables<'goals'>;

function formatAmount(amount: number, currency: string): string {
  return formatMoney(money(amount, currency), { compactZeroFraction: true });
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'No target date';
  return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(
    new Date(`${deadline}T00:00:00`),
  );
}

export default function GoalsScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadGoals = useCallback(async () => {
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setGoals([]);
        return;
      }
      const { data, error: queryError } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      if (queryError) throw queryError;
      setGoals(data ?? []);
    } catch {
      setError('Goals could not be loaded. Your existing data was not changed.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadGoals();
  }, [loadGoals]);

  useFocusEffect(
    useCallback(() => {
      void loadGoals();
    }, [loadGoals]),
  );

  const refresh = () => {
    setIsRefreshing(true);
    void loadGoals();
  };

  const currency = goals[0]?.currency ?? 'USD';
  const sameCurrencyGoals = goals.filter((goal) => goal.currency === currency);
  const totalCurrent = sameCurrencyGoals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const totalTarget = sameCurrencyGoals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalProgress =
    totalTarget > 0 ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100)) : 0;

  return (
    <Screen
      contentContainerStyle={{ paddingTop: insets.top + 8 }}
      refreshControl={
        <RefreshControl
          colors={[colors.semantic.info]}
          onRefresh={refresh}
          refreshing={isRefreshing}
          tintColor={colors.semantic.info}
        />
      }
    >
      {isLoading ? (
        <View accessibilityLabel="Loading goals" style={styles.loading}>
          <ActivityIndicator color={colors.semantic.info} />
        </View>
      ) : error ? (
        <Card style={styles.stateCard}>
          <DataNotice icon="alert-circle-outline" label={error} tone="expense" />
          <Button label="Try again" onPress={refresh} variant="secondary" />
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
            <View style={styles.brandRow}>
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
              {formatAmount(totalCurrent, currency)}{' '}
              <Text style={[styles.aggregateOf, { color: colors.text.tertiary }]}>
                / {formatAmount(totalTarget, currency)}
              </Text>
            </Text>
            <View
              accessibilityLabel={`${totalProgress}% cumulative progress`}
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: totalProgress }}
              style={[styles.progressTrack, { backgroundColor: colors.border.subtle }]}
            >
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.semantic.income, width: `${totalProgress}%` },
                ]}
              />
            </View>
            {sameCurrencyGoals.length !== goals.length && (
              <DataNotice
                label="Some goals use another currency and are excluded from this aggregate."
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

function GoalCard({ goal }: { goal: Goal }): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const progress = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
  return (
    <Card style={styles.goalCard}>
      <View style={styles.goalTop}>
        <View style={[styles.goalIcon, { backgroundColor: colors.brand.accentLight }]}>
          <Ionicons name="flag-outline" size={20} color={colors.semantic.info} />
        </View>
        <View style={styles.goalCopy}>
          <Text
            style={[typography.h4, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
          >
            {goal.name}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
            Target date · {formatDeadline(goal.deadline)}
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
          {formatAmount(goal.current_amount, goal.currency)}
        </Text>
        <Text style={[styles.goalTarget, { color: colors.text.tertiary }]}>
          of {formatAmount(goal.target_amount, goal.currency)}
        </Text>
      </View>
      <View
        accessibilityLabel={`${progress}% progress for ${goal.name}`}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: progress }}
        style={[styles.progressTrack, { backgroundColor: colors.border.subtle }]}
      >
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.semantic.info, width: `${progress}%` },
          ]}
        />
      </View>
      <Button
        label="Review strategy"
        onPress={() => router.push(`/goals/${goal.id}/strategy`)}
        variant="text"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  loading: { minHeight: 320, alignItems: 'center', justifyContent: 'center' },
  stateCard: { padding: 16, gap: 16 },
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
  titleRow: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  titleCopy: { flex: 1, gap: 3 },
  eyebrow: { fontSize: 10, lineHeight: 14, letterSpacing: 0 },
  aggregateCard: { marginTop: 16, padding: 14, gap: 10 },
  aggregateLabel: { fontSize: 10, lineHeight: 14 },
  aggregateAmount: { fontSize: 26, lineHeight: 32, fontVariant: ['tabular-nums'] },
  aggregateOf: { fontSize: 14, lineHeight: 20 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
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
