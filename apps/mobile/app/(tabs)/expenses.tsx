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
  useTransactions,
} from '../../src/features/finance/transactions';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function ExpensesScreen(): React.ReactElement {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { transactions, isLoading, error, refresh } = useTransactions(search);

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
            color: item.type === 'expense' ? colors.semantic.expense : colors.semantic.income,
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
      </View>

      {error && (
        <View style={styles.noticeWrap}>
          <DataNotice icon="alert-circle-outline" label={error} tone="expense" />
        </View>
      )}

      <FlatList
        data={transactions}
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
