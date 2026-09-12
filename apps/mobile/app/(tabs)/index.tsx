import { formatMoney, money } from '@budgetify/core';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function DashboardScreen(): React.ReactElement {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Active currency
  const [currency] = useState('USD');

  // Real amounts calculated via @budgetify/core (in minor units / cents)
  const totalBudget = money(320000, currency); // $3,200.00
  const totalSpent = money(184050, currency); // $1,840.50
  const remaining = money(135950, currency); // $1,359.50

  const spentPercent = Math.min(100, Math.round((totalSpent.amount / totalBudget.amount) * 100));

  const recentTransactions = [
    {
      id: '1',
      title: 'Groceries & Supplies',
      category: 'Food',
      amount: money(8520, currency),
      date: 'Today, 2:30 PM',
      type: 'expense',
    },
    {
      id: '2',
      title: 'Monthly Metro Pass',
      category: 'Transport',
      amount: money(4500, currency),
      date: 'Yesterday',
      type: 'expense',
    },
    {
      id: '3',
      title: 'Salary Deposit',
      category: 'Income',
      amount: money(350000, currency),
      date: 'Sep 1',
      type: 'income',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
    >
      {/* Overview Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.background.card, borderColor: colors.border.default },
        ]}
      >
        <Text style={[typography.caption, { color: colors.text.tertiary }]}>
          TOTAL REMAINING THIS MONTH
        </Text>
        <Text style={[typography.h1, { color: colors.brand.primary, marginTop: spacing.xs }]}>
          {formatMoney(remaining)}
        </Text>

        {/* Progress bar */}
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: colors.background.tertiary, marginTop: spacing.md },
          ]}
        >
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: spentPercent > 90 ? colors.semantic.expense : colors.brand.primary,
                width: `${spentPercent}%`,
              },
            ]}
          />
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>Spent</Text>
            <Text style={[typography.bodyLarge, { color: colors.text.primary, fontWeight: '600' }]}>
              {formatMoney(totalSpent)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>Budget</Text>
            <Text style={[typography.bodyLarge, { color: colors.text.primary, fontWeight: '600' }]}>
              {formatMoney(totalBudget)}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.brand.primary }]}
          onPress={() => router.push('/modal')}
          activeOpacity={0.8}
        >
          <Text style={[typography.bodyMedium, { color: colors.text.inverse, fontWeight: '600' }]}>
            + Add Expense
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtnSecondary,
            { backgroundColor: colors.background.card, borderColor: colors.border.default },
          ]}
          onPress={() => router.push('/(tabs)/planning')}
          activeOpacity={0.8}
        >
          <Text style={[typography.bodyMedium, { color: colors.text.primary, fontWeight: '600' }]}>
            📝 Plan Checklist
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
        <Text style={[typography.h4, { color: colors.text.primary }]}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/expenses')}>
          <Text style={[typography.bodySmall, { color: colors.brand.primary, fontWeight: '600' }]}>
            See all
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.listContainer,
          { backgroundColor: colors.background.card, borderColor: colors.border.default },
        ]}
      >
        {recentTransactions.map((tx, idx) => (
          <View
            key={tx.id}
            style={[
              styles.txRow,
              idx < recentTransactions.length - 1 && {
                borderBottomColor: colors.border.subtle,
                borderBottomWidth: 1,
              },
            ]}
          >
            <View style={styles.txInfo}>
              <Text
                style={[typography.bodyMedium, { color: colors.text.primary, fontWeight: '600' }]}
              >
                {tx.title}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 2 }]}>
                {tx.category} • {tx.date}
              </Text>
            </View>

            <Text
              style={[
                typography.bodyLarge,
                {
                  fontWeight: '700',
                  color: tx.type === 'income' ? colors.semantic.income : colors.text.primary,
                },
              ]}
            >
              {tx.type === 'income' ? '+' : '-'}
              {formatMoney(tx.amount)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  txInfo: {
    flex: 1,
  },
});
