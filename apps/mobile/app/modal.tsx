import { parseMoney } from '@budgetify/core';
import { useRouter } from 'expo-router';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/ThemeProvider';

export default function AddTransactionModal(): React.ReactElement {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState('Food & Dining');

  const categories = [
    'Food & Dining',
    'Housing',
    'Transport',
    'Entertainment',
    'Shopping',
    'Other',
  ];

  const handleSave = () => {
    if (!title.trim() || !amountStr.trim()) return;
    try {
      // Validate using @budgetify/core
      parseMoney(amountStr, 'USD');
      router.back();
    } catch {
      // Amount parse error
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {/* Type Selector */}
        <View
          style={[
            styles.typeSelector,
            { backgroundColor: colors.background.card, borderColor: colors.border.default },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.typeTab,
              type === 'expense' && { backgroundColor: colors.semantic.expenseLight },
            ]}
            onPress={() => setType('expense')}
          >
            <Text
              style={[
                typography.bodyMedium,
                {
                  color: type === 'expense' ? colors.semantic.expense : colors.text.secondary,
                  fontWeight: '700',
                },
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeTab,
              type === 'income' && { backgroundColor: colors.brand.primaryLight },
            ]}
            onPress={() => setType('income')}
          >
            <Text
              style={[
                typography.bodyMedium,
                {
                  color: type === 'income' ? colors.brand.primary : colors.text.secondary,
                  fontWeight: '700',
                },
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={[typography.caption, { color: colors.text.tertiary, textAlign: 'center' }]}>
            AMOUNT
          </Text>
          <TextInput
            style={[styles.amountInput, { color: colors.text.primary }]}
            placeholder="$0.00"
            placeholderTextColor={colors.text.muted}
            keyboardType="decimal-pad"
            value={amountStr}
            onChangeText={setAmountStr}
            autoFocus
          />
        </View>

        {/* Title Input */}
        <Text
          style={[
            typography.bodySmall,
            { color: colors.text.secondary, marginBottom: 6, fontWeight: '600' },
          ]}
        >
          Description
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background.card,
              color: colors.text.primary,
              borderColor: colors.border.default,
            },
          ]}
          placeholder="e.g. Trader Joe's Groceries"
          placeholderTextColor={colors.text.muted}
          value={title}
          onChangeText={setTitle}
        />

        {/* Category Picker Chips */}
        <Text
          style={[
            typography.bodySmall,
            { color: colors.text.secondary, marginTop: 16, marginBottom: 8, fontWeight: '600' },
          ]}
        >
          Category
        </Text>
        <View style={styles.chipGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                { backgroundColor: colors.background.card, borderColor: colors.border.default },
                category === cat && {
                  backgroundColor: colors.brand.primary,
                  borderColor: colors.brand.primary,
                },
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  typography.bodySmall,
                  {
                    color: category === cat ? colors.text.inverse : colors.text.primary,
                    fontWeight: '600',
                  },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.brand.primary, marginTop: 32 }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={[typography.bodyLarge, { color: colors.text.inverse, fontWeight: '700' }]}>
            Save Transaction
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 20,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountInput: {
    fontSize: 38,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
