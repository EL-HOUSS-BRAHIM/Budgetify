import { formatMoney } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, EmptyState, Screen } from '../src/components/ui';
import { useFinancialHealth } from '../src/features/finance/insights';
import { useTheme } from '../src/theme/ThemeProvider';

type DimensionTone = 'income' | 'warning' | 'info';

function Icon(props: React.ComponentProps<typeof Ionicons>): React.ReactElement {
  return (
    <Ionicons
      {...props}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

function scoreTone(score: number): DimensionTone {
  if (score >= 75) return 'income';
  if (score >= 50) return 'info';
  return 'warning';
}

export default function FinancialHealthScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const { data, isLoading, error, refresh } = useFinancialHealth();
  const tone = data ? scoreTone(data.score) : 'info';

  return (
    <Screen
      contentContainerStyle={{ paddingTop: insets.top + 8 }}
      refreshControl={
        <RefreshControl
          colors={[colors.semantic.info]}
          onRefresh={() => void refresh()}
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
          style={[styles.headerButton, { backgroundColor: colors.background.tertiary }]}
        >
          <Icon name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            { color: colors.text.secondary, fontFamily: fontFamily.medium },
          ]}
        >
          Financial Health
        </Text>
        <View style={styles.headerButton} />
      </View>

      {isLoading ? (
        <View accessibilityLabel="Loading financial health" style={styles.loading}>
          <ActivityIndicator color={colors.semantic.info} />
        </View>
      ) : error ? (
        <Card style={styles.stateCard}>
          <DataNotice icon="alert-circle-outline" label={error} tone="expense" />
          <Button label="Try again" onPress={() => void refresh()} variant="secondary" />
        </Card>
      ) : !data ? (
        <Card>
          <EmptyState
            description="Budgetify needs ledger activity before it can score financial health."
            icon="pulse-outline"
            title="No health score yet"
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
            FINANCIAL HEALTH
          </Text>
          <Text style={[typography.h2, { color: colors.text.primary, marginTop: 5 }]}>
            {data.label}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 4 }]}>
            Computed from accounts, this month’s ledger, plans, and goals.
          </Text>

          <Card style={styles.scoreCard}>
            <View style={[styles.scoreRing, { borderColor: colors.semantic[tone] }]}>
              <Text
                style={[
                  styles.score,
                  { color: colors.semantic[tone], fontFamily: fontFamily.semibold },
                ]}
              >
                {data.score}
              </Text>
              <Text style={[styles.outOf, { color: colors.text.tertiary }]}>/100</Text>
            </View>
            <View style={styles.flex}>
              <Text style={[styles.label, { color: colors.text.tertiary }]}>CURRENT HEALTH</Text>
              <Text
                style={[
                  styles.title,
                  { color: colors.text.primary, fontFamily: fontFamily.semibold },
                ]}
              >
                {formatMoney(data.available)} available
              </Text>
              <Text style={[styles.small, { color: colors.text.tertiary }]}>
                {formatMoney(data.upcomingCommitments)} upcoming commitments
              </Text>
            </View>
          </Card>

          <Text
            style={[
              styles.section,
              { color: colors.text.primary, fontFamily: fontFamily.semibold },
            ]}
          >
            Health dimensions
          </Text>
          <Card style={styles.card}>
            <Dimension
              detail={`${formatMoney(data.available)} available vs ${formatMoney(data.upcomingCommitments)} upcoming`}
              icon="shield-checkmark-outline"
              title="Liquidity resilience"
              value={data.liquidityScore}
            />
            <Dimension
              detail={`${formatMoney(data.goalSaved)} saved of ${formatMoney(data.goalTarget)} targeted`}
              icon="trending-up-outline"
              title="Goal momentum"
              value={data.goalScore}
            />
            <Dimension
              detail={`${formatMoney(data.monthlyExpense)} spent against ${formatMoney(data.monthlyIncome)} income`}
              icon="pulse-outline"
              last
              title="Spending stability"
              value={data.spendingScore}
            />
          </Card>
          <Card style={[styles.insight, { borderColor: colors.brand.accent }]}>
            <Icon name="sparkles-outline" size={18} color={colors.semantic.info} />
            <View style={styles.flex}>
              <Text
                style={[
                  styles.title,
                  { color: colors.text.primary, fontFamily: fontFamily.semibold },
                ]}
              >
                Most useful next move
              </Text>
              <Text style={[styles.small, { color: colors.text.tertiary }]}>{data.nextMove}</Text>
            </View>
          </Card>
        </>
      )}
    </Screen>
  );
}

function Dimension({
  detail,
  icon,
  last = false,
  title,
  value,
}: {
  detail: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  last?: boolean;
  title: string;
  value: number;
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  const tone = scoreTone(value);
  return (
    <View
      style={[
        styles.row,
        !last && { borderBottomColor: colors.border.subtle, borderBottomWidth: 1 },
      ]}
    >
      <View
        style={[
          styles.icon,
          {
            backgroundColor:
              tone === 'income'
                ? colors.semantic.incomeLight
                : tone === 'warning'
                  ? colors.semantic.warningLight
                  : colors.brand.accentLight,
          },
        ]}
      >
        <Icon name={icon} size={18} color={colors.semantic[tone]} />
      </View>
      <View style={styles.flex}>
        <Text
          style={[styles.title, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
        >
          {title}
        </Text>
        <Text style={[styles.small, { color: colors.text.tertiary }]}>{detail}</Text>
      </View>
      <Text
        style={[styles.value, { color: colors.semantic[tone], fontFamily: fontFamily.semibold }]}
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
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 12, lineHeight: 18 },
  eyebrow: { marginTop: 22, fontSize: 10, lineHeight: 14, letterSpacing: 0 },
  scoreCard: { marginTop: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  scoreRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 7,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  score: { fontSize: 27, lineHeight: 34 },
  outOf: { fontSize: 10, lineHeight: 14, marginTop: 13 },
  flex: { flex: 1, minWidth: 0 },
  label: { fontSize: 9, lineHeight: 13, letterSpacing: 0 },
  title: { fontSize: 12, lineHeight: 17 },
  small: { fontSize: 10, lineHeight: 15 },
  section: { marginTop: 22, fontSize: 16, lineHeight: 22 },
  card: { marginTop: 8, paddingHorizontal: 12 },
  row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 38, height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 16, lineHeight: 22, fontVariant: ['tabular-nums'] },
  insight: { marginTop: 14, padding: 14, flexDirection: 'row', gap: 10, borderWidth: 1 },
});
