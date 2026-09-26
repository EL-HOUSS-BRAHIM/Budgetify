import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { DataNotice } from '../src/components/ui';
import { createTransaction, type TransactionType } from '../src/features/finance/transactions';
import { useAccounts } from '../src/features/finance/accounts';
import { createCategory, useCategories } from '../src/features/finance/categories';
import { useProfile } from '../src/features/profile/profile';
import { useTheme } from '../src/theme/ThemeProvider';
import { useResponsiveLayout } from '../src/theme/useResponsiveLayout';

export default function AddTransactionModal(): React.ReactElement {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const responsive = useResponsiveLayout();
  const { profile } = useProfile();
  const { accounts } = useAccounts();
  const currency = profile?.currency ?? 'USD';

  const [type, setType] = useState<TransactionType>('expense');
  const { categories, refresh: refreshCategories } = useCategories(
    type === 'income' ? 'income' : 'expense',
  );
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState('Other');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sourceAccountId, setSourceAccountId] = useState<string | undefined>(
    accounts.find((account) => account.is_default)?.id ?? accounts[0]?.id,
  );
  const [destinationAccountId, setDestinationAccountId] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  // Keep the default account selected as accounts load in, but never overwrite
  // a choice the user has already made.
  useEffect(() => {
    if (!sourceAccountId && accounts.length > 0) {
      setSourceAccountId(accounts.find((account) => account.is_default)?.id ?? accounts[0]?.id);
    }
  }, [accounts, sourceAccountId]);

  const createNewCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const created = await createCategory({
        name: newCategory.trim(),
        type: type === 'income' ? 'income' : 'expense',
        icon: '📦',
        color: '#10B981',
        is_system: false,
      });
      await refreshCategories();
      setCategory(created.name);
      setCategoryId(created.id);
      setNewCategory('');
    } catch (categoryError) {
      setError(
        categoryError instanceof Error ? categoryError.message : 'Unable to create category.',
      );
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !amountStr.trim() || isSaving) return;
    setError(null);
    setIsSaving(true);
    try {
      await createTransaction({
        type,
        title,
        amountText: amountStr,
        categoryName: category,
        currency,
        ...(categoryId ? { categoryId } : {}),
        ...(sourceAccountId ? { sourceAccountId } : {}),
        ...(destinationAccountId ? { destinationAccountId } : {}),
      });
      router.back();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save this transaction.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom + responsive.gutter * 2,
            paddingHorizontal: responsive.contentPadding,
            maxWidth: responsive.maxContentWidth + responsive.gutter * 2,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
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
              type === 'transfer' && { backgroundColor: colors.semantic.infoLight },
            ]}
            onPress={() => setType('transfer')}
          >
            <Text
              style={[
                typography.bodyMedium,
                {
                  color: type === 'transfer' ? colors.semantic.info : colors.text.secondary,
                  fontWeight: '700',
                },
              ]}
            >
              Transfer
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

        <Text
          style={[
            typography.bodySmall,
            { color: colors.text.secondary, marginBottom: 8, fontWeight: '600' },
          ]}
        >
          Account
        </Text>
        <View style={styles.chipGrid}>
          {accounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              onPress={() => setSourceAccountId(account.id)}
              style={[
                styles.chip,
                { backgroundColor: colors.background.card, borderColor: colors.border.default },
                sourceAccountId === account.id && {
                  backgroundColor: colors.brand.primary,
                  borderColor: colors.brand.primary,
                },
              ]}
            >
              <Text
                style={[
                  typography.bodySmall,
                  {
                    color:
                      sourceAccountId === account.id ? colors.text.inverse : colors.text.primary,
                    fontWeight: '600',
                  },
                ]}
              >
                {account.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {type === 'transfer' && (
          <>
            <Text
              style={[
                typography.bodySmall,
                { color: colors.text.secondary, marginTop: 16, marginBottom: 8, fontWeight: '600' },
              ]}
            >
              Destination account
            </Text>
            <View style={styles.chipGrid}>
              {accounts
                .filter((account) => account.id !== sourceAccountId)
                .map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    onPress={() => setDestinationAccountId(account.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: colors.background.card,
                        borderColor: colors.border.default,
                      },
                      destinationAccountId === account.id && {
                        backgroundColor: colors.brand.primary,
                        borderColor: colors.brand.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.bodySmall,
                        {
                          color:
                            destinationAccountId === account.id
                              ? colors.text.inverse
                              : colors.text.primary,
                          fontWeight: '600',
                        },
                      ]}
                    >
                      {account.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </>
        )}

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={[typography.caption, { color: colors.text.tertiary, textAlign: 'center' }]}>
            AMOUNT
          </Text>
          <TextInput
            style={[styles.amountInput, { color: colors.text.primary }]}
            placeholder={`${currency} 0.00`}
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
              key={cat.id}
              style={[
                styles.chip,
                { backgroundColor: colors.background.card, borderColor: colors.border.default },
                categoryId === cat.id && {
                  backgroundColor: colors.brand.primary,
                  borderColor: colors.brand.primary,
                },
              ]}
              onPress={() => {
                setCategory(cat.name);
                setCategoryId(cat.id);
              }}
            >
              <Text
                style={[
                  typography.bodySmall,
                  {
                    color: categoryId === cat.id ? colors.text.inverse : colors.text.primary,
                    fontWeight: '600',
                  },
                ]}
              >
                {cat.icon} {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
          <TextInput
            value={newCategory}
            onChangeText={setNewCategory}
            placeholder="New category"
            placeholderTextColor={colors.text.muted}
            style={[
              styles.categoryInput,
              { color: colors.text.primary, borderColor: colors.border.default },
            ]}
            onSubmitEditing={() => void createNewCategory()}
          />
        </View>

        {error && <DataNotice icon="alert-circle-outline" label={error} tone="expense" />}

        {/* Submit button */}
        <TouchableOpacity
          disabled={isSaving || !title.trim() || !amountStr.trim()}
          style={[
            styles.saveBtn,
            {
              backgroundColor: colors.brand.primary,
              marginTop: 32,
              opacity: isSaving || !title.trim() || !amountStr.trim() ? 0.45 : 1,
            },
          ]}
          onPress={() => void handleSave()}
          activeOpacity={0.8}
        >
          <Text style={[typography.bodyLarge, { color: colors.text.inverse, fontWeight: '700' }]}>
            {isSaving ? 'Saving...' : 'Save Transaction'}
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
  categoryInput: {
    minWidth: 130,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
