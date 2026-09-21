import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, EmptyState } from '../src/components/ui';
import {
  createRecurringTransaction,
  useRecurringTransactions,
} from '../src/features/finance/recurring';
import { useProfile } from '../src/features/profile/profile';
import { useTheme } from '../src/theme/ThemeProvider';

export default function RecurringScreen(): React.ReactElement {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useProfile();
  const { items, isLoading, error, refresh } = useRecurringTransactions();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    const value = Number(amount.replace(',', '.'));
    if (!name.trim() || !Number.isFinite(value) || value <= 0 || !date.trim()) return;
    setSaving(true);
    try {
      await createRecurringTransaction({
        name: name.trim(),
        amount: Math.round(value * 100),
        currency: profile?.currency ?? 'USD',
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
    } finally {
      setSaving(false);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}>
        <Text style={[typography.h2, { color: colors.text.primary }]}>Recurring transactions</Text>
        <Text style={[typography.bodySmall, { color: colors.text.secondary, marginTop: 6 }]}>
          Add predictable income or expenses manually.
        </Text>
        {items.map((item) => (
          <Card
            key={item.id}
            style={[
              styles.card,
              { backgroundColor: colors.background.card, borderColor: colors.border.default },
            ]}
          >
            <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>{item.name}</Text>
            <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
              {(item.amount / 100).toFixed(2)} {item.currency} · {item.frequency} · next{' '}
              {item.next_date}
            </Text>
          </Card>
        ))}
        {!isLoading && !items.length && !error && (
          <EmptyState
            icon="repeat-outline"
            title="No recurring transactions"
            description="Add your first recurring payment below."
          />
        )}
        {error && <DataNotice icon="alert-circle-outline" label={error} tone="expense" />}
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Netflix"
          placeholderTextColor={colors.text.muted}
          style={[styles.input, { color: colors.text.primary, borderColor: colors.border.default }]}
        />
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder={`Amount (${profile?.currency ?? 'USD'})`}
          placeholderTextColor={colors.text.muted}
          style={[styles.input, { color: colors.text.primary, borderColor: colors.border.default }]}
        />
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="Next date (YYYY-MM-DD)"
          placeholderTextColor={colors.text.muted}
          style={[styles.input, { color: colors.text.primary, borderColor: colors.border.default }]}
        />
        <View style={styles.frequencyRow}>
          {(['weekly', 'monthly', 'yearly'] as const).map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => setFrequency(value)}
              style={[
                styles.frequency,
                { borderColor: colors.border.default },
                frequency === value && {
                  backgroundColor: colors.brand.primary,
                  borderColor: colors.brand.primary,
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
            </TouchableOpacity>
          ))}
        </View>
        <Button
          label="Add recurring transaction"
          disabled={saving}
          loading={saving}
          onPress={save}
          variant="primary"
        />
        <Button label="Done" onPress={() => router.back()} variant="secondary" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  card: { padding: 14, borderWidth: 1, borderRadius: 14, marginTop: 10 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    marginTop: 12,
  },
  frequencyRow: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  frequency: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
});
