import { formatMoney } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, EmptyState, Screen } from '../../../src/components/ui';
import { useGoalStrategy, type GoalStrategy } from '../../../src/features/finance/goals';
import { useTheme } from '../../../src/theme/ThemeProvider';

type StrategyTone = 'income' | 'warning' | 'info';

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

function formatDate(value: string | null): string {
  if (!value) return 'No deadline';
  return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(
    new Date(`${value}T00:00:00`),
  );
}

function statusLabel(status: GoalStrategy['status']): string {
  switch (status) {
    case 'funded':
      return 'Funded';
    case 'on_track':
      return 'On track';
    case 'behind':
      return 'Behind target';
    case 'blocked':
      return 'Needs capacity';
    case 'no_deadline':
      return 'No deadline';
  }
}

function statusTone(status: GoalStrategy['status']): StrategyTone {
  if (status === 'funded' || status === 'on_track') return 'income';
  if (status === 'behind' || status === 'blocked') return 'warning';
  return 'info';
}

export default function GoalStrategyScreen(): React.ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const goalId = typeof id === 'string' ? id : undefined;
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const { strategy, isLoading, error, refresh } = useGoalStrategy(goalId);
  const tone = strategy ? statusTone(strategy.status) : 'info';
  const toneColor = colors.semantic[tone];

  return (
    <Screen
      contentContainerStyle={{ paddingTop: insets.top + 8 }}
      refreshControl={
        <RefreshControl
          colors={[colors.semantic.info]}
          onRefresh={() => {
            void refresh();
          }}
          refreshing={isLoading}
          tintColor={colors.semantic.info}
        />
      }
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.headerButton,
            { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <DecorativeIcon name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text
            style={[
              styles.headerTitle,
              { color: colors.text.primary, fontFamily: fontFamily.semibold },
            ]}
          >
            Goal Strategy
          </Text>
          <Text style={[styles.headerSub, { color: colors.text.tertiary }]}>Live contract</Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      {isLoading ? (
        <View accessibilityLabel="Loading goal strategy" style={styles.loading}>
          <ActivityIndicator color={colors.semantic.info} />
        </View>
      ) : error ? (
        <Card style={styles.stateCard}>
          <DataNotice icon="alert-circle-outline" label={error} tone="expense" />
          <Button label="Try again" onPress={() => void refresh()} variant="secondary" />
        </Card>
      ) : !strategy ? (
        <Card>
          <EmptyState
            description="Open this screen from a saved goal to review its trajectory."
            icon="flag-outline"
            title="No goal selected"
          />
        </Card>
      ) : (
        <>
          <Text
            style={[
              styles.eyebrow,
              { color: colors.semantic.info, fontFamily: fontFamily.semibold },
            ]}
          >
            GOAL TRAJECTORY
          </Text>
          <Text style={[typography.h2, { color: colors.text.primary, marginTop: 5 }]}>
            {strategy.name}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 3 }]}>
            {formatDate(strategy.deadline)} · {statusLabel(strategy.status)}
          </Text>

          <Card style={styles.heroCard}>
            <View style={styles.heroColumns}>
              <Metric label="Saved" value={formatMoney(strategy.currentAmount)} />
              <Metric label="Remaining" value={formatMoney(strategy.remainingAmount)} />
            </View>
            <View style={styles.progressRow}>
              <Text style={[styles.progressLabel, { color: toneColor }]}>
                {strategy.fundedPercent}% funded
              </Text>
              <Text style={[styles.progressLabel, { color: colors.text.tertiary }]}>
                Target {formatMoney(strategy.targetAmount)}
              </Text>
            </View>
            <View
              accessibilityLabel={`${strategy.fundedPercent}% funded`}
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: strategy.fundedPercent }}
              style={[styles.track, { backgroundColor: colors.border.subtle }]}
            >
              <View
                style={[
                  styles.fill,
                  { backgroundColor: toneColor, width: `${strategy.fundedPercent}%` },
                ]}
              />
            </View>
          </Card>

          <Text
            style={[
              styles.section,
              { color: colors.text.primary, fontFamily: fontFamily.semibold },
            ]}
          >
            Recommended Pace
          </Text>
          <Card style={styles.card}>
            <InsightRow
              icon="calendar-outline"
              label="Required monthly"
              value={formatMoney(strategy.requiredMonthly)}
            />
            <InsightRow
              icon="trending-up-outline"
              label="Recommended monthly"
              value={formatMoney(strategy.recommendedMonthly)}
            />
            <InsightRow
              icon="wallet-outline"
              label="Available capacity"
              value={formatMoney(strategy.monthlyCapacity)}
            />
            <InsightRow
              icon="flag-outline"
              label="Projected completion"
              last
              value={formatDate(strategy.projectedCompletion)}
            />
          </Card>

          <Card style={[styles.noticeCard, { borderColor: toneColor }]}>
            <DecorativeIcon name="information-circle-outline" size={18} color={toneColor} />
            <Text
              style={[typography.bodySmall, styles.noticeCopy, { color: colors.text.secondary }]}
            >
              {strategy.explanation}
            </Text>
          </Card>

          <View style={styles.actions}>
            <Button
              label="Adjust in Goals"
              onPress={() => router.push('/(tabs)/goals')}
              style={styles.actionButton}
              variant="secondary"
            />
            <Button
              label="Ask Lyvora"
              onPress={() => router.push('/(tabs)/assistant')}
              style={styles.actionButton}
              variant="text"
            />
          </View>
        </>
      )}
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View style={styles.metric}>
      <Text style={[styles.label, { color: colors.text.tertiary }]}>{label}</Text>
      <Text
        style={[
          styles.metricValue,
          { color: colors.text.primary, fontFamily: fontFamily.semibold },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function InsightRow({
  icon,
  label,
  last = false,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  last?: boolean;
  value: string;
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View
      style={[
        styles.insightRow,
        !last && { borderBottomColor: colors.border.subtle, borderBottomWidth: 1 },
      ]}
    >
      <View style={[styles.iconSmall, { backgroundColor: colors.background.secondary }]}>
        <DecorativeIcon name={icon} size={17} color={colors.semantic.info} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.text.secondary }]}>{label}</Text>
      <Text
        style={[styles.rowValue, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
      >
        {value}
      </Text>
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
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 13, lineHeight: 18 },
  headerSub: { fontSize: 10, lineHeight: 14 },
  loading: { minHeight: 320, alignItems: 'center', justifyContent: 'center' },
  stateCard: { padding: 16, gap: 16 },
  eyebrow: { marginTop: 20, fontSize: 10, lineHeight: 14, letterSpacing: 0 },
  heroCard: { marginTop: 14, padding: 14 },
  heroColumns: { flexDirection: 'row', gap: 12 },
  metric: { flex: 1, minWidth: 0 },
  label: { fontSize: 10, lineHeight: 14 },
  metricValue: { marginTop: 3, fontSize: 20, lineHeight: 26, fontVariant: ['tabular-nums'] },
  progressRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  progressLabel: { fontSize: 11, lineHeight: 16 },
  track: { height: 7, marginTop: 6, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  section: { marginTop: 22, fontSize: 16, lineHeight: 22 },
  card: { marginTop: 8, paddingHorizontal: 12 },
  insightRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconSmall: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 12, lineHeight: 17 },
  rowValue: { fontSize: 12, lineHeight: 17, fontVariant: ['tabular-nums'], textAlign: 'right' },
  noticeCard: { marginTop: 12, padding: 12, flexDirection: 'row', gap: 10, borderWidth: 1 },
  noticeCopy: { flex: 1, lineHeight: 19 },
  actions: { marginTop: 12, flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, paddingHorizontal: 8 },
});
