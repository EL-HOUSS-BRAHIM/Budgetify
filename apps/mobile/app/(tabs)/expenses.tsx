import { formatMoney, money, type Money } from '@budgetify/core';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeProvider';

interface ExpenseItem {
  id: string;
  title: string;
  category: string;
  amount: Money;
  date: string;
}

export default function ExpensesScreen(): React.ReactElement {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const currency = 'USD';
  const [search, setSearch] = useState('');

  const [expenses] = useState<ExpenseItem[]>([
    {
      id: '1',
      title: 'Supermarket Grocery',
      category: 'Food & Dining',
      amount: money(8520, currency),
      date: 'Sep 12, 2026',
    },
    {
      id: '2',
      title: 'Uber ride to station',
      category: 'Transportation',
      amount: money(1850, currency),
      date: 'Sep 11, 2026',
    },
    {
      id: '3',
      title: 'Netflix Subscription',
      category: 'Entertainment',
      amount: money(1599, currency),
      date: 'Sep 10, 2026',
    },
    {
      id: '4',
      title: 'Electric Bill',
      category: 'Housing & Utilities',
      amount: money(6500, currency),
      date: 'Sep 08, 2026',
    },
    {
      id: '5',
      title: 'Coffee & Bakery',
      category: 'Food & Dining',
      amount: money(750, currency),
      date: 'Sep 06, 2026',
    },
    {
      id: '6',
      title: 'Amazon Essentials',
      category: 'Shopping',
      amount: money(4230, currency),
      date: 'Sep 04, 2026',
    },
  ]);

  const filtered = expenses.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.background.card, borderBottomColor: colors.border.default },
        ]}
      >
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
              borderColor: colors.border.default,
            },
          ]}
          placeholder="Search expenses..."
          placeholderTextColor={colors.text.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
        renderItem={({ item }) => (
          <View
            style={[
              styles.expenseCard,
              { backgroundColor: colors.background.card, borderColor: colors.border.default },
            ]}
          >
            <View>
              <Text
                style={[typography.bodyLarge, { color: colors.text.primary, fontWeight: '600' }]}
              >
                {item.title}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 4 }]}>
                {item.category} • {item.date}
              </Text>
            </View>

            <Text
              style={[typography.bodyLarge, { color: colors.semantic.expense, fontWeight: '700' }]}
            >
              -{formatMoney(item.amount)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  expenseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
});
