import {
  formatMoney,
  monthKeyFromDate,
  shiftMonth,
  type Money,
  type MonthKey,
} from '@budgetify/core';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  DataNotice,
  EmptyState,
  MonthSwitcher,
  ProgressBar,
  Screen,
  StatGrid,
} from '../../components/ui';
import { useTheme } from '../../theme/ThemeProvider';
import { useResponsiveLayout } from '../../theme/useResponsiveLayout';
import { useHomeData } from './use-home-data';

function format(amount: Money, compactZeroFraction = false): string {
  return formatMoney(amount, { compactZeroFraction });
}

export function HomeScreen(): React.ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useTheme();
  const responsive = useResponsiveLayout();
  const [month, setMonth] = React.useState<MonthKey>(() => monthKeyFromDate(new Date()));
  const currentMonth = monthKeyFromDate(new Date());
  const { model, isLoading, isRefreshing, error, refresh } = useHomeData(month);

  if (isLoading && !model)
    return (
      <Screen topInset>
        <Text style={[typography.bodyMedium, { color: colors.text.secondary }]}>
          Loading your money...
        </Text>
      </Screen>
    );
  if (error && !model)
    return (
      <Screen topInset>
        <DataNotice icon="alert-circle-outline" label={error} tone="expense" />
        <Button label="Retry" onPress={refresh} variant="secondary" />
      </Screen>
    );
  if (!model || model.status === 'empty') {
    return (
      <Screen topInset>
        <Text style={[typography.h2, { color: colors.text.primary }]}>Your money, clearly.</Text>
        <Text style={[typography.bodyMedium, { color: colors.text.secondary, marginTop: 8 }]}>
          Start by adding an account in Settings, then record your first transaction.
        </Text>
        <Button
          label="Open Settings"
          onPress={() => router.push('/(tabs)/settings')}
          variant="primary"
        />
        <Button
          label="Add transaction"
          onPress={() => router.push('/modal')}
          style={styles.spaced}
          variant="secondary"
        />
      </Screen>
    );
  }

  const { summary, goals, upcoming } = model;
  const netIsNegative = summary.net.amount < 0;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background.primary }}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + responsive.gutter / 2,
          paddingBottom: insets.bottom + responsive.gutter * 2,
          paddingHorizontal: responsive.contentPadding,
          maxWidth: responsive.maxContentWidth + responsive.gutter * 2,
          alignSelf: 'center',
          width: '100%',
        },
      ]}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[typography.caption, { color: colors.text.tertiary }]}>LYVORA</Text>
          <Text style={[typography.h2, { color: colors.text.primary, marginTop: 6 }]}>
            {model.displayName}
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Add transaction"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => router.push('/modal')}
          style={styles.addButton}
        >
          <Text style={[styles.addGlyph, { color: colors.brand.primary }]}>＋</Text>
        </Pressable>
      </View>

      <MonthSwitcher
        canGoNext={month < currentMonth}
        label={model.monthLabel}
        onNext={() => setMonth((current) => shiftMonth(current, 1))}
        onPrevious={() => setMonth((current) => shiftMonth(current, -1))}
      />

      <Card
        style={[
          styles.balanceCard,
          { backgroundColor: colors.background.card, borderColor: colors.border.default },
        ]}
      >
        <Text style={[typography.caption, { color: colors.text.tertiary }]}>TOTAL BALANCE</Text>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[styles.balance, { color: colors.text.primary }]}
        >
          {format(model.balance)}
        </Text>
        <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
          Across your {model.currency} accounts
        </Text>
      </Card>

      <StatGrid
        tiles={[
          {
            label: model.isCurrentMonth ? 'Income this month' : `Income in ${model.monthLabel}`,
            value: format(summary.income),
            color: colors.semantic.income,
          },
          {
            label: 'Expenses',
            value: format(summary.expenses),
            color: colors.semantic.expense,
          },
          {
            label: netIsNegative ? 'Overspent' : 'Saved',
            value: format({ amount: Math.abs(summary.net.amount), currency: model.currency }),
            color: netIsNegative ? colors.semantic.expense : colors.semantic.info,
          },
        ]}
      />

      <SectionTitle title={model.isCurrentMonth ? 'Spending this month' : 'Spending that month'} />
      <Card
        style={[
          styles.sectionCard,
          { backgroundColor: colors.background.card, borderColor: colors.border.default },
        ]}
      >
        {summary.spendingByCategory.length === 0 ? (
          <Text style={[typography.bodyMedium, { color: colors.text.secondary }]}>
            No expenses recorded in {model.monthLabel}.
          </Text>
        ) : (
          summary.spendingByCategory.map((item) => (
            <View key={item.name} style={styles.row}>
              <Text numberOfLines={1} style={[styles.rowLabel, { color: colors.text.primary }]}>
                {item.name}
              </Text>
              <Text style={[styles.rowValue, { color: colors.text.primary }]}>
                {format(item.amount)}
              </Text>
            </View>
          ))
        )}
        {summary.foreignCurrencyCount > 0 && (
          <DataNotice
            label={`${summary.foreignCurrencyCount} transaction(s) in another currency are not included in these totals.`}
            tone="warning"
          />
        )}
      </Card>

      <SectionTitle title="Upcoming" />
      <Card
        style={[
          styles.sectionCard,
          { backgroundColor: colors.background.card, borderColor: colors.border.default },
        ]}
      >
        {upcoming.length === 0 ? (
          <Text style={[typography.bodyMedium, { color: colors.text.secondary }]}>
            Nothing scheduled. Add a recurring transaction to see it here.
          </Text>
        ) : (
          upcoming.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={styles.rowCopy}>
                <Text
                  numberOfLines={1}
                  style={[typography.bodyMedium, { color: colors.text.primary }]}
                >
                  {item.name}
                </Text>
                <Text style={[typography.caption, { color: colors.text.tertiary }]}>
                  {item.needsAttention
                    ? 'Overdue'
                    : item.daysUntil === 0
                      ? 'Due today'
                      : `Due ${item.nextDate}`}
                </Text>
              </View>
              <Text style={[styles.rowValue, { color: colors.text.primary }]}>
                {formatMoney(
                  { amount: item.amount, currency: item.currency },
                  { compactZeroFraction: true },
                )}
              </Text>
            </View>
          ))
        )}
      </Card>

      <SectionTitle title="Goals" />
      {goals.goalCount === 0 ? (
        <EmptyState
          actionLabel="Open Goals"
          description="Create a savings goal to start tracking what you are putting aside."
          icon="flag-outline"
          onAction={() => router.push('/(tabs)/goals')}
          title="No goals yet"
        />
      ) : (
        <Card
          style={[
            styles.sectionCard,
            { backgroundColor: colors.background.card, borderColor: colors.border.default },
          ]}
        >
          <Text style={[typography.caption, { color: colors.text.tertiary }]}>
            {goals.fundedCount} of {goals.goalCount} funded
          </Text>
          <Text style={[styles.goalAmount, { color: colors.text.primary }]}>
            {format(goals.saved)}{' '}
            <Text style={{ color: colors.text.tertiary }}>of {format(goals.target)}</Text>
          </Text>
          <ProgressBar
            accessibilityLabel={`${goals.percentComplete}% of your savings goals funded`}
            color={colors.semantic.income}
            percent={goals.percentComplete}
            trackColor={colors.border.subtle}
          />
          {goals.excludedCount > 0 && (
            <DataNotice
              label={`${goals.excludedCount} goal(s) use another currency and are excluded from this total.`}
              tone="warning"
            />
          )}
        </Card>
      )}
    </ScrollView>
  );
}

function SectionTitle({ title }: { title: string }): React.ReactElement {
  const { colors, typography } = useTheme();
  return (
    <Text style={[typography.h4, { color: colors.text.primary, marginTop: 22, marginBottom: 10 }]}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 12 },
  headerCopy: { flex: 1, minWidth: 0 },
  addButton: { minWidth: 48, minHeight: 48, alignItems: 'flex-end', justifyContent: 'center' },
  addGlyph: { fontSize: 32, lineHeight: 36 },
  balanceCard: { padding: 20, borderWidth: 1, borderRadius: 18, marginTop: 12 },
  balance: { fontSize: 32, fontWeight: '800', marginVertical: 8 },
  sectionCard: { padding: 14, borderWidth: 1, borderRadius: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowCopy: { flex: 1, minWidth: 0 },
  rowLabel: { flex: 1, minWidth: 0, fontSize: 14, lineHeight: 20 },
  rowValue: { fontSize: 14, lineHeight: 20, fontVariant: ['tabular-nums'] },
  goalAmount: { fontSize: 18, fontWeight: '700' },
  spaced: { marginTop: 12 },
});
