import { formatMoney, money } from '@budgetify/core';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeProvider';

interface TransactionItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  type: 'expense' | 'income';
}

export default function DashboardScreen(): React.ReactElement {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [currency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [totalBudgetCents, setTotalBudgetCents] = useState(320000); // $3,200.00
  const [totalSpentCents, setTotalSpentCents] = useState(184050); // $1,840.50
  const [transactions, setTransactions] = useState<TransactionItem[]>([
    {
      id: '1',
      title: 'Groceries & Supplies',
      category: 'Food & Dining',
      amount: 8520,
      date: 'Today, 2:30 PM',
      type: 'expense',
    },
    {
      id: '2',
      title: 'Monthly Metro Pass',
      category: 'Transportation',
      amount: 4500,
      date: 'Yesterday',
      type: 'expense',
    },
    {
      id: '3',
      title: 'Salary Deposit',
      category: 'Salary & Income',
      amount: 350000,
      date: 'Sep 1',
      type: 'income',
    },
  ]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

      if (!txError && txData && txData.length > 0) {
        let spentSum = 0;
        const mapped = (
          txData as Array<{
            id: string;
            description: string;
            category_name: string;
            amount: number;
            date: string;
            type: 'expense' | 'income';
          }>
        ).map((row) => {
          if (row.type === 'expense') spentSum += Number(row.amount);
          return {
            id: String(row.id),
            title: row.description || 'Expense',
            category: row.category_name || 'General',
            amount: Number(row.amount),
            date: new Date(row.date).toLocaleDateString(),
            type: row.type || 'expense',
          };
        });
        setTransactions(mapped);
        setTotalSpentCents(spentSum);
      }

      const { data: bgData, error: bgError } = await supabase.from('budgets').select('amount');

      if (!bgError && bgData && bgData.length > 0) {
        const bgSum = (bgData as Array<{ amount: number }>).reduce((s, b) => s + Number(b.amount), 0);
        if (bgSum > 0) setTotalBudgetCents(bgSum);
      }
    } catch {
      // Offline fallback is preserved
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadData();
  };

  const remainingCents = Math.max(0, totalBudgetCents - totalSpentCents);
  const totalBudget = money(totalBudgetCents, currency);
  const totalSpent = money(totalSpentCents, currency);
  const remaining = money(remainingCents, currency);
  const spentPercent =
    totalBudgetCents > 0 ? Math.min(100, Math.round((totalSpentCents / totalBudgetCents) * 100)) : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.brand.primary]}
          tintColor={colors.brand.primary}
        />
      }
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

      {loading && !refreshing ? (
        <ActivityIndicator size="small" color={colors.brand.primary} style={{ marginVertical: 20 }} />
      ) : (
        <View
          style={[
            styles.listContainer,
            { backgroundColor: colors.background.card, borderColor: colors.border.default },
          ]}
        >
          {transactions.map((tx, idx) => (
            <View
              key={tx.id}
              style={[
                styles.txRow,
                idx < transactions.length - 1 && {
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
                {formatMoney(money(tx.amount, currency))}
              </Text>
            </View>
          ))}
        </View>
      )}
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
