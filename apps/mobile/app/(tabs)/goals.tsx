import { formatMoney, money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import type { Tables } from '@budgetify/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, EmptyState, Screen } from '../../src/components/ui';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeProvider';

type Goal = Tables<'goals'>;
type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface GoalView {
  id: string;
  name: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
  currency: string;
  deadline: string;
  monthlyAmount: number;
  icon: IconName;
  protected: boolean;
}

const previewGoals: GoalView[] = [
  {
    id: 'preview-moto',
    name: 'Yamaha MT-07',
    description: 'Cyan Storm Edition · Performance Twin',
    currentAmount: 1240000,
    targetAmount: 2000000,
    currency: 'MAD',
    deadline: 'Jan 2027',
    monthlyAmount: 70000,
    icon: 'bicycle-outline',
    protected: false,
  },
  {
    id: 'preview-studio',
    name: 'Ultimate M3 Max Setup',
    description: 'Studio Display & Ergonomic Architecture',
    currentAmount: 420000,
    targetAmount: 1800000,
    currency: 'MAD',
    deadline: 'Jun 2027',
    monthlyAmount: 45000,
    icon: 'laptop-outline',
    protected: false,
  },
  {
    id: 'preview-reserve',
    name: 'Emergency Fortress',
    description: '6 Months Liquidity Runway in Vault',
    currentAmount: 850000,
    targetAmount: 1500000,
    currency: 'MAD',
    deadline: 'Essential anchor',
    monthlyAmount: 70000,
    icon: 'shield-checkmark-outline',
    protected: true,
  },
];

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

function mapGoal(goal: Goal, index: number): GoalView {
  const icons: IconName[] = ['flag-outline', 'laptop-outline', 'shield-checkmark-outline'];
  return {
    id: goal.id,
    name: goal.name,
    description: goal.deadline ? `Target reserve · ${goal.deadline}` : 'Active capital target',
    currentAmount: goal.current_amount,
    targetAmount: goal.target_amount,
    currency: goal.currency,
    deadline: goal.deadline ?? 'No target date',
    monthlyAmount: 0,
    icon: icons[index % icons.length] ?? 'flag-outline',
    protected: index === 0,
  };
}

export default function GoalsScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [goals, setGoals] = useState<GoalView[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scenarioAmount, setScenarioAmount] = useState(350000);
  const [scenarioNotice, setScenarioNotice] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setGoals(previewGoals);
        setIsPreview(true);
        return;
      }
      const { data, error: queryError } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      if (queryError) throw queryError;
      setGoals(data.map(mapGoal));
      setIsPreview(false);
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
  const refresh = () => {
    setIsRefreshing(true);
    void loadGoals();
  };
  const totalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const currency = goals[0]?.currency ?? 'MAD';
  const selectedGoal = goals[0];
  const delayMonths = Math.max(1, Math.round(scenarioAmount / 230000));
  const safeRunway = Math.max(0, 55000 - Math.round(scenarioAmount / 10));

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
            actionLabel="Plan a goal with AI"
            description="Describe what you want, the target amount, and when you need it."
            icon="flag-outline"
            onAction={() => router.push('/(tabs)/assistant')}
            title="No goals yet"
          />
        </Card>
      ) : (
        <>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={[styles.brandMark, { borderColor: colors.semantic.income }]}>
                <DecorativeIcon name="sparkles" size={13} color={colors.semantic.income} />
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
            <Pressable
              accessibilityLabel="Goal settings"
              accessibilityRole="button"
              hitSlop={6}
              style={({ pressed }) => [
                styles.headerButton,
                { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
              ]}
            >
              <DecorativeIcon name="options-outline" size={19} color={colors.text.secondary} />
            </Pressable>
          </View>
          <View style={styles.titleRow}>
            <View style={styles.titleCopy}>
              <Text
                style={[
                  styles.eyebrow,
                  { color: colors.semantic.info, fontFamily: fontFamily.semibold },
                ]}
              >
                HORIZON BLUEPRINT
              </Text>
              <Text style={[typography.h2, { color: colors.text.primary }]}>
                Goals & Future Horizon
              </Text>
              <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
                Algorithmic timeline mapping for daily decisions
              </Text>
            </View>
            <View style={[styles.monthlyPill, { backgroundColor: colors.semantic.incomeLight }]}>
              <DecorativeIcon name="trending-up" size={13} color={colors.semantic.income} />
              <Text
                style={[
                  styles.monthlyPillText,
                  { color: colors.semantic.income, fontFamily: fontFamily.semibold },
                ]}
              >
                +1,850 MAD/mo
              </Text>
            </View>
          </View>
          {isPreview && (
            <DataNotice icon="eye-outline" label="Design preview · sample goals" tone="info" />
          )}
          <Card style={styles.aggregateCard}>
            <Text style={[styles.aggregateLabel, { color: colors.text.tertiary }]}>
              AGGREGATE CAPITAL RESERVED
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
              accessibilityLabel={`${Math.round((totalCurrent / totalTarget) * 100)}% cumulative progress`}
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 0,
                max: 100,
                now: Math.round((totalCurrent / totalTarget) * 100),
              }}
              style={[styles.progressTrack, { backgroundColor: colors.border.subtle }]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.semantic.income,
                    width: `${Math.min(100, (totalCurrent / totalTarget) * 100)}%`,
                  },
                ]}
              />
            </View>
          </Card>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text.primary, fontFamily: fontFamily.medium },
            ]}
          >
            Active Capital Targets
          </Text>
          <View style={styles.goalList}>
            {goals.map((goal) => (
              <GoalCard goal={goal} key={goal.id} />
            ))}
          </View>
          <View style={styles.simHeader}>
            <View>
              <Text
                style={[
                  styles.eyebrow,
                  { color: colors.semantic.info, fontFamily: fontFamily.semibold },
                ]}
              >
                THE WHAT-IF SIMULATOR
              </Text>
              <Text style={[typography.h3, { color: colors.text.primary }]}>
                Opportunity Cost Engine
              </Text>
            </View>
            <Text
              style={[
                styles.liveLabel,
                { color: colors.semantic.income, fontFamily: fontFamily.medium },
              ]}
            >
              Live sandboxing
            </Text>
          </View>
          <Card style={[styles.simulatorCard, { borderColor: colors.brand.accent }]}>
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.text.primary, fontFamily: fontFamily.medium },
              ]}
            >
              Simulate Purchase
            </Text>
            <Text
              style={[
                styles.scenarioAmount,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              {formatAmount(scenarioAmount, currency)}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
              Discretionary outflow · preview only
            </Text>
            <View style={styles.presetRow}>
              {[50000, 150000, 350000, 700000].map((amount) => (
                <Pressable
                  accessibilityLabel={`Simulate ${formatAmount(amount, currency)} purchase`}
                  accessibilityRole="button"
                  key={amount}
                  onPress={() => setScenarioAmount(amount)}
                  style={({ pressed }) => [
                    styles.preset,
                    {
                      borderColor:
                        amount === scenarioAmount ? colors.semantic.info : colors.border.default,
                      backgroundColor:
                        amount === scenarioAmount
                          ? colors.brand.accentLight
                          : colors.background.tertiary,
                      opacity: pressed ? 0.72 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      {
                        color:
                          amount === scenarioAmount ? colors.semantic.info : colors.text.secondary,
                        fontFamily: fontFamily.medium,
                      },
                    ]}
                  >
                    {formatAmount(amount, currency)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={[styles.impactPanel, { backgroundColor: colors.background.tertiary }]}>
              <ImpactRow
                icon="calendar-outline"
                label={`${selectedGoal?.name ?? 'Primary goal'} horizon`}
                value={`+${delayMonths} months`}
                detail={`Moves to ${delayMonths > 2 ? 'Mar' : 'Feb'} 2027`}
                tone="warning"
              />
              <ImpactRow
                icon="shield-checkmark-outline"
                label="Safe-to-Spend runway"
                value={formatAmount(safeRunway, currency)}
                detail="High cash-flow strain"
                tone="expense"
              />
              <ImpactRow
                icon="lock-closed-outline"
                label="Emergency Reserve Shield"
                value={formatAmount(850000, currency)}
                detail="Untouched & fortified"
                tone="income"
              />
            </View>
            <View style={[styles.verdict, { backgroundColor: colors.semantic.expenseLight }]}>
              <DecorativeIcon
                name="alert-circle-outline"
                size={17}
                color={colors.semantic.expense}
              />
              <View style={styles.verdictCopy}>
                <Text
                  style={[
                    styles.verdictTitle,
                    { color: colors.semantic.expense, fontFamily: fontFamily.semibold },
                  ]}
                >
                  Lyvora Copilot Verdict · Not Recommended
                </Text>
                <Text style={[typography.bodySmall, { color: colors.text.secondary }]}>
                  This purchase causes liquidity stress before your next salary. Split it into
                  installments or defer it by 45 days to preserve your goal schedule.
                </Text>
              </View>
            </View>
            <View style={styles.simActions}>
              <Button
                label="Installments"
                onPress={() => setScenarioNotice('Installment planning is a local preview.')}
                style={styles.simAction}
                variant="secondary"
              />
              <Button
                label="Queue Wishlist"
                onPress={() => setScenarioNotice('Wishlisted locally. No purchase was created.')}
                style={styles.simAction}
                variant="text"
              />
            </View>
          </Card>
          {scenarioNotice && <DataNotice label={scenarioNotice} tone="info" />}
        </>
      )}
    </Screen>
  );
}

function GoalCard({ goal }: { goal: GoalView }): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  return (
    <Card style={styles.goalCard}>
      <View style={styles.goalTop}>
        <View
          style={[
            styles.goalIcon,
            {
              backgroundColor: goal.protected
                ? colors.semantic.incomeLight
                : colors.brand.accentLight,
            },
          ]}
        >
          <DecorativeIcon
            name={goal.icon}
            size={20}
            color={goal.protected ? colors.semantic.income : colors.semantic.info}
          />
        </View>
        <View style={styles.goalCopy}>
          <Text
            style={[typography.h4, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
          >
            {goal.name}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
            {goal.description}
          </Text>
        </View>
        <View style={[styles.trackPill, { backgroundColor: colors.semantic.incomeLight }]}>
          <Text
            style={[
              styles.trackText,
              { color: colors.semantic.income, fontFamily: fontFamily.medium },
            ]}
          >
            {goal.protected ? 'Shield active' : 'On track'}
          </Text>
        </View>
      </View>
      <View style={styles.goalNumbers}>
        <Text
          style={[
            styles.goalAmount,
            { color: colors.text.primary, fontFamily: fontFamily.semibold },
          ]}
        >
          {formatAmount(goal.currentAmount, goal.currency)}{' '}
          <Text style={[styles.goalTarget, { color: colors.text.tertiary }]}>
            / {formatAmount(goal.targetAmount, goal.currency)}
          </Text>
        </Text>
        <Text
          style={[
            styles.goalPercent,
            { color: colors.semantic.income, fontFamily: fontFamily.semibold },
          ]}
        >
          {progress}%
        </Text>
      </View>
      <View
        accessibilityLabel={`${goal.name}, ${progress}% complete`}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: progress }}
        style={[styles.progressTrack, { backgroundColor: colors.border.subtle }]}
      >
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: goal.protected ? colors.semantic.income : colors.semantic.info,
              width: `${progress}%`,
            },
          ]}
        />
      </View>
      <View style={styles.goalFooter}>
        <Text style={[styles.goalDetail, { color: colors.text.tertiary }]}>{goal.deadline}</Text>
        <Text style={[styles.goalDetail, { color: colors.text.tertiary }]}>
          {goal.monthlyAmount
            ? `${formatAmount(goal.monthlyAmount, goal.currency)}/mo`
            : 'Live target'}
        </Text>
      </View>
      <Pressable
        accessibilityLabel={`Open strategy for ${goal.name}`}
        accessibilityRole="button"
        onPress={() => router.push(`/goals/${goal.id}/strategy`)}
        style={({ pressed }) => [styles.strategyLink, { borderTopColor: colors.border.subtle, opacity: pressed ? 0.7 : 1 }]}
      >
        <Text style={[styles.strategyLinkText, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}>Open deep strategy</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.semantic.info} />
      </Pressable>
    </Card>
  );
}

function ImpactRow({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: IconName;
  label: string;
  value: string;
  detail: string;
  tone: 'income' | 'warning' | 'expense';
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View style={styles.impactRow}>
      <View
        style={[
          styles.impactIcon,
          {
            backgroundColor:
              tone === 'income'
                ? colors.semantic.incomeLight
                : tone === 'expense'
                  ? colors.semantic.expenseLight
                  : colors.semantic.warningLight,
          },
        ]}
      >
        <DecorativeIcon name={icon} size={15} color={colors.semantic[tone]} />
      </View>
      <View style={styles.impactCopy}>
        <Text
          style={[
            styles.impactLabel,
            { color: colors.text.primary, fontFamily: fontFamily.medium },
          ]}
        >
          {label}
        </Text>
        <Text style={[styles.impactDetail, { color: colors.text.tertiary }]}>{detail}</Text>
      </View>
      <Text
        style={[
          styles.impactValue,
          { color: colors.semantic[tone], fontFamily: fontFamily.semibold },
        ]}
      >
        {value}
      </Text>
    </View>
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
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleCopy: { flexGrow: 1, flexShrink: 1, minWidth: 220 },
  eyebrow: { fontSize: 10, lineHeight: 14 },
  monthlyPill: {
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  monthlyPillText: { fontSize: 9, lineHeight: 13 },
  aggregateCard: { marginTop: 14, padding: 14 },
  aggregateLabel: { fontSize: 10, lineHeight: 14 },
  aggregateAmount: { marginTop: 5, fontSize: 22, lineHeight: 28, fontVariant: ['tabular-nums'] },
  aggregateOf: { fontSize: 13, lineHeight: 18 },
  progressTrack: { height: 5, borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3 },
  sectionTitle: { marginTop: 20, fontSize: 16, lineHeight: 22 },
  goalList: { marginTop: 10, gap: 10 },
  goalCard: { padding: 12 },
  goalTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCopy: { flex: 1, minWidth: 0 },
  trackPill: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 10 },
  trackText: { fontSize: 9, lineHeight: 13 },
  goalNumbers: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  goalAmount: { flex: 1, fontSize: 15, lineHeight: 20, fontVariant: ['tabular-nums'] },
  goalTarget: { fontSize: 11, lineHeight: 15 },
  goalPercent: { fontSize: 13, lineHeight: 18 },
  goalFooter: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  goalDetail: { fontSize: 10, lineHeight: 14 },
  strategyLink: {
    minHeight: 44,
    marginTop: 10,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strategyLinkText: { fontSize: 11, lineHeight: 16 },
  simHeader: {
    marginTop: 26,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  liveLabel: { fontSize: 10, lineHeight: 14, marginTop: 18 },
  simulatorCard: { marginTop: 10, padding: 14 },
  scenarioAmount: { marginTop: 6, fontSize: 28, lineHeight: 34, fontVariant: ['tabular-nums'] },
  presetRow: { marginTop: 12, flexDirection: 'row', gap: 6 },
  preset: {
    flex: 1,
    minHeight: 36,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  presetText: { fontSize: 9, lineHeight: 13, textAlign: 'center' },
  impactPanel: { marginTop: 14, borderRadius: 8, padding: 10, gap: 10 },
  impactRow: { minHeight: 37, flexDirection: 'row', alignItems: 'center', gap: 8 },
  impactIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  impactCopy: { flex: 1, minWidth: 0 },
  impactLabel: { fontSize: 10, lineHeight: 14 },
  impactDetail: { fontSize: 9, lineHeight: 13 },
  impactValue: { maxWidth: 105, fontSize: 11, lineHeight: 15, textAlign: 'right' },
  verdict: { marginTop: 14, padding: 10, borderRadius: 8, flexDirection: 'row', gap: 8 },
  verdictCopy: { flex: 1, gap: 4 },
  verdictTitle: { fontSize: 10, lineHeight: 14 },
  simActions: { marginTop: 12, flexDirection: 'row', gap: 8 },
  simAction: { flex: 1, paddingHorizontal: 8 },
});
