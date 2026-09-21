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
import { Button, DataNotice, EmptyState } from '../../src/components/ui';
import {
  formatTransactionAmount,
  type TransactionListItem,
  type TransactionType,
  useTransactions,
} from '../../src/features/finance/transactions';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function ExpensesScreen(): React.ReactElement {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | TransactionType>('all');
  const [monthDate, setMonthDate] = useState(() => new Date());
  const { transactions, isLoading, error, refresh } = useTransactions(search, monthDate);
  const visibleTransactions =
    filter === 'all' ? transactions : transactions.filter((item) => item.type === filter);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const renderTransaction = ({ item }: { item: TransactionListItem }) => (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/transaction/${item.id}`)}
      style={({ pressed }) => [
        styles.expenseCard,
        {
          backgroundColor: colors.background.card,
          borderColor: colors.border.default,
          opacity: pressed ? 0.76 : 1,
        },
      ]}
    >
      <View style={styles.transactionCopy}>
        <Text style={[typography.bodyLarge, { color: colors.text.primary, fontWeight: '600' }]}>
          {item.title}
        </Text>
        <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 4 }]}>
          {item.category} • {item.dateLabel}
        </Text>
      </View>

      <Text
        style={[
          typography.bodyLarge,
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
          { backgroundColor: colors.background.card, borderBottomColor: colors.border.default },
        ]}
      >
        <View style={styles.monthNav}>
          <Pressable
            accessibilityLabel="Previous month"
            onPress={() =>
              setMonthDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))
            }
          >
            <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>‹</Text>
          </Pressable>
          <Text style={[typography.bodySmall, { color: colors.text.secondary }]}>
            {new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(
              monthDate,
            )}
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
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
              borderColor: colors.border.default,
            },
          ]}
          placeholder="Search transactions..."
          placeholderTextColor={colors.text.muted}
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.filters}>
          {(['all', 'income', 'expense', 'transfer'] as const).map((value) => (
            <Pressable
              key={value}
              onPress={() => setFilter(value)}
              style={[
                styles.filter,
                { borderColor: colors.border.default },
                filter === value && {
                  backgroundColor: colors.brand.primary,
                  borderColor: colors.brand.primary,
                },
              ]}
            >
              <Text
                style={[
                  typography.caption,
                  { color: filter === value ? colors.text.inverse : colors.text.secondary },
                ]}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {error && (
        <View style={styles.noticeWrap}>
          <DataNotice icon="alert-circle-outline" label={error} tone="expense" />
        </View>
      )}

      <FlatList
        data={visibleTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
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
              icon="receipt-outline"
              title={search.trim() ? 'No matching transactions' : 'No transactions yet'}
              description={
                search.trim()
                  ? 'Try another search term.'
                  : 'Add a real transaction to start building your ledger.'
              }
              actionLabel="Add transaction"
              onAction={() => router.push('/modal')}
            />
          )
        }
        ListFooterComponent={
          transactions.length > 0 ? (
            <Button label="Add transaction" icon="add" onPress={() => router.push('/modal')} />
          ) : null
        }
        onRefresh={refresh}
        refreshing={isLoading && transactions.length > 0}
        renderItem={renderTransaction}
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
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filter: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 7,
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
    flexGrow: 1,
  },
  expenseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  transactionCopy: {
    flex: 1,
    minWidth: 0,
  },
  noticeWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 40,
  },
});
