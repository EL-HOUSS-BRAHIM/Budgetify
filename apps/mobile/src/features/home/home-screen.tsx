import { formatMoney, money } from '@budgetify/core';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, EmptyState, Screen } from '../../components/ui';
import { useTheme } from '../../theme/ThemeProvider';
import { useHomeData } from './use-home-data';

function amount(value: number, currency: string): string {
  return formatMoney(money(value, currency), { compactZeroFraction: false });
}

export function HomeScreen(): React.ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useTheme();
  const [monthDate, setMonthDate] = React.useState(() => new Date());
  const { model, isLoading, isRefreshing, error, refresh } = useHomeData(monthDate);

  if (isLoading && !model)
    return (
      <Screen>
        <Text style={[typography.bodyMedium, { color: colors.text.secondary }]}>
          Loading your money...
        </Text>
      </Screen>
    );
  if (error && !model)
    return (
      <Screen>
        <DataNotice icon="alert-circle-outline" label={error} tone="expense" />
        <Button label="Retry" onPress={refresh} variant="secondary" />
      </Screen>
    );
  if (!model || model.status === 'empty') {
    return (
      <Screen>
        <Text style={[typography.h2, { color: colors.text.primary }]}>Your money, clearly.</Text>
        <Text style={[typography.bodyMedium, { color: colors.text.secondary, marginTop: 8 }]}>
          Start by adding an account, then record your first transaction.
        </Text>
        <Button label="Open Settings" onPress={() => router.push('/settings')} variant="primary" />
        <Button label="Add transaction" onPress={() => router.push('/modal')} variant="secondary" />
      </Screen>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background.primary }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.caption, { color: colors.text.tertiary }]}>
            LYVORA · {model.monthLabel}
          </Text>
          <Text style={[typography.h2, { color: colors.text.primary, marginTop: 6 }]}>
            Good morning, {model.displayName}
          </Text>
        </View>
        <Pressable accessibilityLabel="Add transaction" onPress={() => router.push('/modal')}>
          <Text style={[styles.add, { color: colors.brand.primary }]}>＋</Text>
        </Pressable>
      </View>
      <View style={styles.monthNav}>
        <Pressable
          accessibilityLabel="Previous month"
          onPress={() =>
            setMonthDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))
          }
        >
          <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>‹</Text>
        </Pressable>
        <Text style={[typography.bodyMedium, { color: colors.text.secondary }]}>
          {model.monthLabel}
        </Text>
        <Pressable
          accessibilityLabel="Next month"
          onPress={() =>
            setMonthDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))
          }
        >
          <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>›</Text>
        </Pressable>
      </View>
      <Card
        style={[
          styles.balanceCard,
          { backgroundColor: colors.background.card, borderColor: colors.border.default },
        ]}
      >
        <Text style={[typography.caption, { color: colors.text.tertiary }]}>TOTAL BALANCE</Text>
        <Text style={[styles.balance, { color: colors.text.primary }]}>
          {amount(model.balance, model.currency)}
        </Text>
        <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
          Across your accounts
        </Text>
      </Card>
      <View style={styles.statGrid}>
        {[
          ['Income', model.income, colors.semantic.income],
          ['Expenses', model.expenses, colors.semantic.expense],
          ['Saved', model.saved, colors.semantic.info],
        ].map(([label, value, color]) => (
          <Card
            key={String(label)}
            style={[
              styles.statCard,
              { backgroundColor: colors.background.card, borderColor: colors.border.default },
            ]}
          >
            <Text style={[typography.caption, { color: colors.text.tertiary }]}>{label}</Text>
            <Text style={[styles.statValue, { color: color as string }]}>
              {amount(value as number, model.currency)}
            </Text>
          </Card>
        ))}
      </View>
      <SectionTitle title="Spending this month" />
      <Card
        style={[
          styles.sectionCard,
          { backgroundColor: colors.background.card, borderColor: colors.border.default },
        ]}
      >
        {model.spendingByCategory.length === 0 ? (
          <Text style={[typography.bodyMedium, { color: colors.text.secondary }]}>
            No expenses recorded this month.
          </Text>
        ) : (
          model.spendingByCategory.map((item) => (
            <View key={item.name} style={styles.row}>
              <Text style={[typography.bodyMedium, { color: colors.text.primary }]}>
                {item.name}
              </Text>
              <Text style={[typography.bodyMedium, { color: colors.text.primary }]}>
                {amount(item.amount, model.currency)}
              </Text>
            </View>
          ))
        )}
      </Card>
      <SectionTitle title="Upcoming" />
      <Card
        style={[
          styles.sectionCard,
          { backgroundColor: colors.background.card, borderColor: colors.border.default },
        ]}
      >
        {model.upcoming.length === 0 ? (
          <Text style={[typography.bodyMedium, { color: colors.text.secondary }]}>
            No upcoming transactions.
          </Text>
        ) : (
          model.upcoming.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyMedium, { color: colors.text.primary }]}>
                  {item.name}
                </Text>
                <Text style={[typography.caption, { color: colors.text.tertiary }]}>
                    {item.next_date}
                </Text>
              </View>
              <Text style={[typography.bodyMedium, { color: colors.text.primary }]}>
                  {amount(item.amount, item.currency)}
              </Text>
            </View>
          ))
        )}
      </Card>
      <SectionTitle title="Goals" />
      {model.goals.length === 0 ? (
        <EmptyState
          icon="flag-outline"
          title="No goals yet"
          description="Create a goal to start tracking progress."
          actionLabel="Open Goals"
          onAction={() => router.push('/(tabs)/goals')}
        />
      ) : (
        model.goals.map((goal) => {
          const progress = Math.min(
            100,
            Math.round((goal.current_amount / goal.target_amount) * 100),
          );
          return (
            <Card
              key={goal.id}
              style={[
                styles.sectionCard,
                { backgroundColor: colors.background.card, borderColor: colors.border.default },
              ]}
            >
              <View style={styles.row}>
                <Text style={[typography.bodyLarge, { color: colors.text.primary, flex: 1 }]}>
                  {goal.name}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  {progress}%
                </Text>
              </View>
              <Text style={[typography.caption, { color: colors.text.tertiary, marginTop: 6 }]}>
                {amount(goal.current_amount, goal.currency)} of{' '}
                {amount(goal.target_amount, goal.currency)}
              </Text>
              <View style={[styles.progressTrack, { backgroundColor: colors.border.subtle }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%`, backgroundColor: colors.brand.primary },
                  ]}
                />
              </View>
            </Card>
          );
        })
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
  content: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  add: { fontSize: 38, lineHeight: 40 },
  balanceCard: { padding: 20, borderWidth: 1, borderRadius: 18 },
  balance: { fontSize: 32, fontWeight: '800', marginVertical: 8 },
  statGrid: { flexDirection: 'row', gap: 8, marginTop: 10 },
  statCard: { flex: 1, padding: 12, borderWidth: 1, borderRadius: 14 },
  statValue: { fontSize: 15, fontWeight: '700', marginTop: 6 },
  sectionCard: { padding: 14, borderWidth: 1, borderRadius: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 10 },
  progressFill: { height: '100%', borderRadius: 4 },
});
