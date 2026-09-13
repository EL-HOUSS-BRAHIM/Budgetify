import { formatMoney, money } from '@budgetify/core';
import type { Tables } from '@budgetify/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Button, Card, DataNotice, EmptyState, Screen } from '../../src/components/ui';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeProvider';

type Goal = Tables<'goals'>;

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'No target date';

  return `Target ${new Intl.DateTimeFormat(undefined, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${deadline}T00:00:00Z`))}`;
}

export default function GoalsScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadGoals = useCallback(async () => {
    setError(null);

    const { data, error: queryError } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryError) {
      setError('Goals could not be loaded. Your existing data has not been changed.');
    } else {
      setGoals(data);
    }

    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    void loadGoals();
  }, [loadGoals]);

  const refresh = () => {
    setIsRefreshing(true);
    void loadGoals();
  };

  const openGoalPlanning = () => router.push('/(tabs)/assistant');

  return (
    <Screen
      refreshControl={
        <RefreshControl
          colors={[colors.brand.primary]}
          onRefresh={refresh}
          refreshing={isRefreshing}
          tintColor={colors.brand.primary}
        />
      }
    >
      {isLoading ? (
        <View accessibilityLabel="Loading goals" style={styles.loadingState}>
          <ActivityIndicator color={colors.brand.primary} />
        </View>
      ) : error ? (
        <Card style={styles.stateCard}>
          <DataNotice icon="alert-circle-outline" label={error} tone="expense" />
          <Button label="Try again" onPress={() => void loadGoals()} variant="secondary" />
        </Card>
      ) : goals.length === 0 ? (
        <Card>
          <EmptyState
            actionLabel="Plan a goal with AI"
            description="Describe what you want, the target amount, and when you need it."
            icon="flag-outline"
            onAction={openGoalPlanning}
            title="No goals yet"
          />
        </Card>
      ) : (
        <View style={styles.goalList}>
          {goals.map((goal) => {
            const progress = Math.min(
              100,
              Math.round((goal.current_amount / goal.target_amount) * 100),
            );
            const isComplete = goal.current_amount >= goal.target_amount;

            return (
              <Card key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalCopy}>
                    <Text
                      style={[
                        typography.h4,
                        { color: colors.text.primary, fontFamily: fontFamily.semibold },
                      ]}
                    >
                      {goal.name}
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
                      {isComplete ? 'Goal reached' : formatDeadline(goal.deadline)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      typography.h4,
                      {
                        color: isComplete ? colors.semantic.income : colors.text.primary,
                        fontFamily: fontFamily.bold,
                      },
                    ]}
                  >
                    {progress}%
                  </Text>
                </View>

                <View
                  accessibilityLabel={`${progress}% complete`}
                  accessibilityRole="progressbar"
                  accessibilityValue={{ min: 0, max: 100, now: progress }}
                  style={[styles.progressTrack, { backgroundColor: colors.background.tertiary }]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.brand.primary,
                        width: `${progress}%`,
                      },
                    ]}
                  />
                </View>

                <View style={styles.amountRow}>
                  <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>Saved</Text>
                  <Text
                    style={[
                      typography.bodyMedium,
                      { color: colors.text.primary, fontFamily: fontFamily.semibold },
                    ]}
                  >
                    {formatMoney(money(goal.current_amount, goal.currency))} of{' '}
                    {formatMoney(money(goal.target_amount, goal.currency))}
                  </Text>
                </View>
              </Card>
            );
          })}

          <Button
            icon="sparkles-outline"
            label="Plan another goal"
            onPress={openGoalPlanning}
            variant="secondary"
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingState: { minHeight: 240, alignItems: 'center', justifyContent: 'center' },
  stateCard: { padding: 16, gap: 16 },
  goalList: { gap: 12 },
  goalCard: { padding: 16 },
  goalHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  goalCopy: { flex: 1, gap: 2 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 16 },
  progressFill: { height: '100%', borderRadius: 4 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
});
