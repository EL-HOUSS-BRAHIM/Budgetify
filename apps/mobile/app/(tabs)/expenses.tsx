import { formatMoney, monthKeyFromDate, monthLabel, shiftMonth, type MonthKey } from '@budgetify/core';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  DataNotice,
  EmptyState,
  MonthSwitcher,
  StatGrid,
} from '../../src/components/ui';
import {
  formatTransactionAmount,
  type TransactionListItem,
  useTransactions,
} from '../../src/features/finance/transactions';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useResponsiveLayout } from '../../src/theme/useResponsiveLayout';
import { layout } from '../../src/theme/tokens';

const FILTERS = ['all', 'income', 'expense', 'transfer'] as const;
type Filter = (typeof FILTERS)[number];

function filterLabel(value: Filter): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function TransactionsScreen(): React.ReactElement {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const responsive = useResponsiveLayout();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [month, setMonth] = useState<MonthKey>(() => monthKeyFromDate(new Date()));
  const currentMonth = monthKeyFromDate(new Date());
  const { transactions, totals, isLoading, error, refresh } = useTransactions(search, month);

  const visibleTransactions =
    filter === 'all' ? transactions : transactions.filter((item) => item.type === filter);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const runRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  const renderTransaction = ({ item }: { item: TransactionListItem }) => (
    <Pressable
      accessibilityLabel={`${item.title}, ${formatTransactionAmount(item)}, ${item.dateLabel}`}
      accessibilityRole="button"
      onPress={() => router.push(`/transaction/${item.id}`)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.background.card,
          borderColor: colors.border.default,
          opacity: pressed ? 0.76 : 1,
        },
      ]}
    >
      <View style={styles.rowCopy}>
        <Text
          numberOfLines={2}
          style={[typography.bodyLarge, { color: colors.text.primary, fontWeight: '600' }]}
        >
          {item.title}
        </Text>
        <Text
          numberOfLines={1}
          style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 4 }]}
        >
          {item.category} • {item.dateLabel}
          {item.isForeignCurrency ? ' • other currency' : ''}
        </Text>
      </View>

      <Text
        style={[
          typography.bodyLarge,
          styles.amount,
          {
            color:
              item.type === 'expense'
                ? colors.semantic.expense
                : item.type === 'income'
                  ? colors.semantic.income
                  : colors.semantic.info,
            fontWeight: '700',
          },
        ]}
      >
        {formatTransactionAmount(item)}
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background.card,
            borderBottomColor: colors.border.default,
            paddingHorizontal: responsive.contentPadding,
          },
        ]}
      >
        <MonthSwitcher
          canGoNext={month < currentMonth}
          label={monthLabel(month)}
          onNext={() => setMonth((value) => shiftMonth(value, 1))}
          onPrevious={() => setMonth((value) => shiftMonth(value, -1))}
        />
        <TextInput
          accessibilityLabel="Search transactions"
          onChangeText={setSearch}
          placeholder="Search transactions..."
          placeholderTextColor={colors.text.muted}
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
              borderColor: colors.border.default,
            },
          ]}
          value={search}
        />
        <View style={styles.filters}>
          {FILTERS.map((value) => (
            <Pressable
              accessibilityLabel={`Show ${filterLabel(value)} only`}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === value }}
              key={value}
              onPress={() => setFilter(value)}
              style={({ pressed }) => [
                styles.filter,
                {
                  borderColor: filter === value ? colors.brand.primary : colors.border.default,
                  backgroundColor: filter === value ? colors.brand.primary : 'transparent',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  typography.caption,
                  { color: filter === value ? colors.text.inverse : colors.text.secondary },
                ]}
              >
                {filterLabel(value)}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.totals}>
          <StatGrid
            tiles={[
              { label: 'Income', value: formatMoney(totals.income), color: colors.semantic.income },
              {
                label: 'Expenses',
                value: formatMoney(totals.expenses),
                color: colors.semantic.expense,
              },
              {
                label: totals.net.amount < 0 ? 'Overspent' : 'Net',
                value: formatMoney({
                  amount: Math.abs(totals.net.amount),
                  currency: totals.net.currency,
                }),
                color: totals.net.amount < 0 ? colors.semantic.expense : colors.semantic.info,
              },
            ]}
          />
        </View>
      </View>

      {error && (
        <View style={[styles.noticeWrap, { paddingHorizontal: responsive.contentPadding }]}>
          <DataNotice icon="alert-circle-outline" label={error} tone="expense" />
        </View>
      )}

      <FlatList
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: responsive.contentPadding,
            paddingBottom: insets.bottom + responsive.gutter * 2,
            maxWidth: responsive.maxContentWidth + responsive.gutter * 2,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        data={visibleTransactions}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={colors.brand.primary} />
              <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
                Loading transactions
              </Text>
            </View>
          ) : (
            <EmptyState
              actionLabel="Add transaction"
              description={
                search.trim()
                  ? 'Try another search term.'
                  : `Nothing recorded in ${monthLabel(month)} yet.`
              }
              icon="receipt-outline"
              onAction={() => router.push('/modal')}
              title={search.trim() ? 'No matching transactions' : 'No transactions yet'}
            />
          )
        }
        ListFooterComponent={
          transactions.length > 0 ? (
            <Button label="Add transaction" icon="add" onPress={() => router.push('/modal')} />
          ) : null
        }
        onRefresh={runRefresh}
        refreshing={isLoading && transactions.length > 0}
        renderItem={renderTransaction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 12, paddingBottom: 12, borderBottomWidth: 1, gap: 10 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: layout.minTouchTarget - 12,
    justifyContent: 'center',
  },
  searchInput: {
    minHeight: layout.minTouchTarget,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  totals: { marginTop: 2 },
  listContent: { paddingTop: 12, gap: 12, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  rowCopy: { flex: 1, minWidth: 0 },
  amount: { textAlign: 'right' },
  noticeWrap: { paddingTop: 12 },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 40,
  },
});
