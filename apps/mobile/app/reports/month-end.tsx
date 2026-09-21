import { formatMoney } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, EmptyState, Screen } from '../../src/components/ui';
import { useMonthEndReport } from '../../src/features/finance/insights';
import { useTheme } from '../../src/theme/ThemeProvider';

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

function formatPeriod(start: string, end: string): string {
  const formatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
  return `${formatter.format(new Date(`${start}T00:00:00`))} - ${formatter.format(new Date(`${end}T00:00:00`))}`;
}

export default function MonthEndReport(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const { data, isLoading, error, refresh } = useMonthEndReport();

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
          style={({ pressed }) => [
            styles.back,
            { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <Icon name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <Text
          style={[styles.head, { color: colors.text.secondary, fontFamily: fontFamily.medium }]}
        >
          Month-End Report
        </Text>
        <View style={styles.back} />
      </View>

      {isLoading ? (
        <View accessibilityLabel="Loading month-end report" style={styles.loading}>
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
            description="Budgetify needs this month’s ledger activity before it can summarize the cycle."
            icon="document-text-outline"
            title="No report yet"
          />
        </Card>
      ) : (
        <>
          <View style={styles.hero}>
            <Text
              style={[
                styles.eyebrow,
                { color: colors.semantic.warning, fontFamily: fontFamily.semibold },
              ]}
            >
              {formatPeriod(data.periodStart, data.periodEnd)}
            </Text>
            <Text style={[typography.h2, { color: colors.text.primary }]}>Monthly report</Text>
            <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
              Computed from posted ledger activity and planned commitments.
            </Text>
          </View>

          <Card style={[styles.score, { borderColor: colors.semantic.warning }]}>
            <Text style={[styles.small, { color: colors.text.tertiary }]}>
              FINANCIAL DISCIPLINE
            </Text>
            <Text
              style={[
                styles.scoreValue,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              {data.disciplineScore} / 100
            </Text>
            <Text style={[typography.bodySmall, { color: colors.semantic.warning }]}>
              {data.narrative}
            </Text>
          </Card>

          <Text
            style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.medium }]}
          >
            Month in numbers
          </Text>
          <Card style={styles.card}>
            <Stat label="Income captured" value={formatMoney(data.income)} tone="income" />
            <Stat label="Ledger spending" value={formatMoney(data.expense)} tone="warning" />
            <Stat
              label="Planned commitments"
              value={formatMoney(data.committedSpending)}
              tone="warning"
            />
            <Stat label="Saved toward goals" value={formatMoney(data.goalSavedTotal)} tone="info" />
          </Card>

          <View style={styles.actions}>
            <Button
              label="Review budget"
              onPress={() => router.push('/(tabs)/budgets')}
              style={styles.action}
              variant="secondary"
            />
          </View>
        </>
      )}
    </Screen>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'income' | 'warning' | 'info';
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[styles.small, { color: colors.text.tertiary }]}>{label}</Text>
      <Text
        style={[
          styles.statValue,
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
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  head: { fontSize: 12, lineHeight: 18 },
  hero: { marginTop: 20, alignItems: 'center', gap: 6 },
  eyebrow: { fontSize: 10, lineHeight: 14, letterSpacing: 0 },
  score: { marginTop: 20, padding: 14, alignItems: 'center', borderWidth: 1 },
  small: { fontSize: 10, lineHeight: 14 },
  scoreValue: { marginVertical: 5, fontSize: 30, lineHeight: 36, fontVariant: ['tabular-nums'] },
  section: { marginTop: 22, fontSize: 16, lineHeight: 22 },
  card: { marginTop: 8, padding: 14 },
  stat: { minHeight: 50, justifyContent: 'center' },
  statValue: { marginTop: 2, fontSize: 16, lineHeight: 22, fontVariant: ['tabular-nums'] },
  actions: { marginTop: 12, flexDirection: 'row', gap: 8 },
  action: { flex: 1, paddingHorizontal: 8 },
});
