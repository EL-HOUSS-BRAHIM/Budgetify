import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, DataNotice } from '../src/components/ui';
import { createBudget } from '../src/features/finance/budgets';
import { useProfile } from '../src/features/profile/profile';
import { useTheme } from '../src/theme/ThemeProvider';

export default function BudgetModal(): React.ReactElement {
  const { colors, typography } = useTheme();
  const { profile } = useProfile();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState('Food & Dining');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    const value = Number(amount.replace(',', '.'));
    if (!category.trim() || !Number.isFinite(value) || value <= 0) {
      setError('Enter a category and a monthly amount greater than zero.');
      return;
    }
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setSaving(true);
    setError(null);
    try {
      await createBudget({
        category_name: category.trim(),
        amount: Math.round(value * 100),
        currency: profile?.currency ?? 'USD',
        start_date: start.toISOString().slice(0, 10),
        end_date: end.toISOString().slice(0, 10),
        period: 'monthly',
      });
      router.back();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to create budget.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={[typography.bodySmall, { color: colors.text.secondary }]}>Category</Text>
        <TextInput
          value={category}
          onChangeText={setCategory}
          placeholder="Food & Dining"
          placeholderTextColor={colors.text.muted}
          style={[styles.input, { color: colors.text.primary, borderColor: colors.border.default }]}
        />
        <Text style={[typography.bodySmall, styles.label, { color: colors.text.secondary }]}>
          Monthly limit
        </Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder={`0 ${profile?.currency ?? 'USD'}`}
          placeholderTextColor={colors.text.muted}
          style={[styles.input, { color: colors.text.primary, borderColor: colors.border.default }]}
        />
        {error && <DataNotice icon="alert-circle-outline" label={error} tone="expense" />}
        <Button
          label="Create budget"
          loading={saving}
          disabled={saving}
          onPress={() => void save()}
          variant="primary"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  label: { marginTop: 16, marginBottom: 6 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    marginTop: 6,
  },
});
