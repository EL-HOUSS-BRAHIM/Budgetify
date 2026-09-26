import { formatMoney, money, type ScheduledRecurringEntry } from '@budgetify/core';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, EmptyState, Screen } from '../src/components/ui';
import { useProfile } from '../src/features/profile/profile';
import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  recurringTotals,
  useRecurringTransactions,
} from '../src/features/finance/recurring';
import { useTheme } from '../src/theme/ThemeProvider';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const FREQUENCIES = ['weekly', 'monthly', 'yearly'] as const;

function timingLabel(item: ScheduledRecurringEntry): string {
  if (item.needsAttention) return 'Overdue — not yet actioned';
  if (item.daysUntil === 0) return 'Due today';
  if (item.daysUntil === 1) return 'Due tomorrow';
  if (item.daysUntil <= 7) return `Due in ${item.daysUntil} days`;
  return `Due ${item.nextDate}`;
}

export default function RecurringScreen(): React.ReactElement {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useProfile();
  const { items, isLoading, error, refresh, advance } = useRecurringTransactions();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>('monthly');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const currency = (profile?.currency ?? 'USD').toUpperCase();
  const totals = recurringTotals(items);

  const save = async () => {
    setFormError(null);
    const value = Number(amount.replace(',', '.'));
    if (!name.trim()) return setFormError('Give this recurring entry a name.');
    if (!Number.isFinite(value) || value <= 0) {
      return setFormError('Enter an amount greater than zero.');
    }
    if (!DATE_PATTERN.test(date.trim())) {
      return setFormError('Use a date in YYYY-MM-DD form.');
    }
    setSaving(true);
    try {
      await createRecurringTransaction({
        name: name.trim(),
        amount: Math.round(value * 100),
        currency,
        type: 'expense',
        account_id: null,
        category_name: 'Other',
        frequency,
        next_date: date.trim(),
      });
      setName('');
      setAmount('');
      setDate('');
      await refresh();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Unable to save.');
    } finally {
      setSaving(false);
    }
  };

  const markHandled = async (id: string) => {
    setFormError(null);
    try {
      await advance(id);
    } catch (advanceError) {
      setFormError(
        advanceError instanceof Error ? advanceError.message : 'Unable to roll this entry forward.',
      );
    }
  };

  const remove = async (id: string) => {
    setFormError(null);
    try {
      await deleteRecurringTransaction(id);
      await refresh();
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : 'Unable to delete.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top + 44}
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <Screen>
        <Text style={[typography.h2, { color: colors.text.primary }]}>Recurring transactions</Text>
        <Text style={[typography.bodySmall, { color: colors.text.secondary, marginTop: 6 }]}>
          Predictable income and expenses you enter yourself.
        </Text>

        {error && <DataNotice icon="alert-circle-outline" label={error} tone="expense" />}

        {isLoading && items.length === 0 ? (
          <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 16 }]}>
            Loading recurring transactions…
          </Text>
        ) : items.length === 0 ? (
          <EmptyState
            description="Add your first recurring payment below and it will appear on Home."
            icon="repeat-outline"
            title="No recurring transactions"
          />
        ) : (
          <>
            <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 16 }]}>
              {formatMoney(totals.expense)} out · {formatMoney(totals.income)} in, per cycle
            </Text>
            {items.map((item) => (
              <Card
                key={item.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.background.card, borderColor: colors.border.default },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardCopy}>
                    <Text
                      numberOfLines={1}
                      style={[typography.bodyLarge, { color: colors.text.primary }]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={[
                        typography.bodySmall,
                        {
                          color: item.needsAttention
                            ? colors.semantic.expense
                            : colors.text.tertiary,
                        },
                      ]}
                    >
                      {timingLabel(item)} · {item.frequency}
                    </Text>
                  </View>
                  <Text style={[styles.amount, { color: colors.text.primary }]}>
                    {formatMoney(money(item.amount, item.currency), {
                      compactZeroFraction: true,
                    })}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <Button
                    label="Roll forward"
                    onPress={() => void markHandled(item.id)}
                    variant="secondary"
                  />
                  <Button
                    label="Delete"
                    onPress={() => void remove(item.id)}
                    variant="text"
                  />
                </View>
              </Card>
            ))}
          </>
        )}

        <Text
          style={[
            typography.h4,
            { color: colors.text.primary, marginTop: 28, marginBottom: 8 },
          ]}
        >
          Add one
        </Text>
        {formError && <DataNotice icon="alert-circle-outline" label={formError} tone="expense" />}
        <TextInput
          accessibilityLabel="Recurring entry name"
          onChangeText={setName}
          placeholder="Netflix"
          placeholderTextColor={colors.text.muted}
          style={[styles.input, { color: colors.text.primary, borderColor: colors.border.default }]}
          value={name}
        />
        <TextInput
          accessibilityLabel="Recurring amount"
          keyboardType="decimal-pad"
          onChangeText={setAmount}
          placeholder={`Amount (${currency})`}
          placeholderTextColor={colors.text.muted}
          style={[styles.input, { color: colors.text.primary, borderColor: colors.border.default }]}
          value={amount}
        />
        <TextInput
          accessibilityLabel="Next due date"
          autoCapitalize="none"
          onChangeText={setDate}
          placeholder="Next date (YYYY-MM-DD)"
          placeholderTextColor={colors.text.muted}
          style={[styles.input, { color: colors.text.primary, borderColor: colors.border.default }]}
          value={date}
        />
        <View style={styles.frequencyRow}>
          {FREQUENCIES.map((value) => (
            <Pressable
              accessibilityLabel={`Frequency ${value}`}
              accessibilityRole="button"
              accessibilityState={{ selected: frequency === value }}
              key={value}
              onPress={() => setFrequency(value)}
              style={({ pressed }) => [
                styles.frequency,
                {
                  borderColor: frequency === value ? colors.brand.primary : colors.border.default,
                  backgroundColor: frequency === value ? colors.brand.primary : 'transparent',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  typography.caption,
                  { color: frequency === value ? colors.text.inverse : colors.text.primary },
                ]}
              >
                {value}
              </Text>
            </Pressable>
          ))}
        </View>
        <Button
          disabled={saving}
          label="Add recurring transaction"
          loading={saving}
          onPress={() => void save()}
          variant="primary"
        />
        <Button label="Done" onPress={() => router.back()} variant="text" />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: 14, borderWidth: 1, borderRadius: 14, marginTop: 10, gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardCopy: { flex: 1, minWidth: 0 },
  cardActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amount: { fontSize: 16, lineHeight: 22, fontVariant: ['tabular-nums'] },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    marginTop: 12,
  },
  frequencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 },
  frequency: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
});
