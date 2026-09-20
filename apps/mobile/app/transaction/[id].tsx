import { formatMoney, money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import type { Tables } from '@budgetify/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, EmptyState, Screen } from '../../src/components/ui';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeProvider';

type Transaction = Tables<'transactions'>;
type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface TransactionView {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  account: string;
  type: 'expense' | 'income';
}

function DecorativeIcon(props: React.ComponentProps<typeof Ionicons>): React.ReactElement {
  return (
    <Ionicons
      {...props}
      accessibilityElementsHidden
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    />
  );
}

function formatAmount(amount: number, currency: string): string {
  return formatMoney(money(amount, currency), { compactZeroFraction: true });
}

function toView(transaction: Transaction): TransactionView {
  return {
    id: transaction.id,
    merchant: transaction.description || transaction.category_name,
    category: transaction.category_name,
    amount: transaction.amount,
    currency: transaction.currency,
    date: new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(transaction.date)),
    account: transaction.account_id ? 'Linked account' : 'Unassigned account',
    type: transaction.type === 'income' ? 'income' : 'expense',
  };
}

export default function TransactionDetailScreen(): React.ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [transaction, setTransaction] = useState<TransactionView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || !id) {
        setTransaction(null);
        return;
      }
      const { data, error: queryError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (queryError) throw queryError;
      if (!data) {
        setTransaction(null);
        return;
      }
      setTransaction(toView(data));
    } catch {
      setError('This transaction could not be loaded. Your existing data was not changed.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);
  const refresh = () => {
    setIsRefreshing(true);
    void load();
  };

  return (
    <Screen
      contentContainerStyle={{ paddingTop: insets.top + 8 }}
      refreshControl={
        <RefreshControl
          colors={[colors.semantic.info]}
          onRefresh={refresh}
          refreshing={isRefreshing}
          tintColor={colors.semantic.info}
        />
      }
    >
      {isLoading ? (
        <View accessibilityLabel="Loading transaction detail" style={styles.loading}>
          <ActivityIndicator color={colors.semantic.info} />
        </View>
      ) : error ? (
        <Card style={styles.stateCard}>
          <DataNotice icon="alert-circle-outline" label={error} tone="expense" />
          <Button label="Try again" onPress={refresh} variant="secondary" />
        </Card>
      ) : !transaction ? (
        <Card>
          <EmptyState
            description="The requested transaction is unavailable."
            icon="receipt-outline"
            title="Transaction not found"
          />
        </Card>
      ) : (
        <>
          <View style={styles.topRow}>
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={6}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
              ]}
            >
              <DecorativeIcon name="chevron-back" size={20} color={colors.text.primary} />
            </Pressable>
            <Text
              style={[
                styles.topTitle,
                { color: colors.text.secondary, fontFamily: fontFamily.medium },
              ]}
            >
              Transaction Detail
            </Text>
            <Pressable
              accessibilityLabel="Transaction settings"
              accessibilityRole="button"
              hitSlop={6}
              style={({ pressed }) => [
                styles.backButton,
                { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
              ]}
            >
              <DecorativeIcon name="options-outline" size={20} color={colors.text.primary} />
            </Pressable>
          </View>
          <View style={styles.hero}>
            <View style={[styles.merchantIcon, { backgroundColor: colors.brand.accentLight }]}>
              <DecorativeIcon name="cart-outline" size={30} color={colors.semantic.info} />
            </View>
            <Text style={[typography.h2, { color: colors.text.primary }]}>
              {transaction.merchant}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
              {transaction.category} · Casablanca
            </Text>
            <Text
              style={[
                styles.total,
                {
                  color:
                    transaction.type === 'income' ? colors.semantic.income : colors.text.primary,
                  fontFamily: fontFamily.semibold,
                },
              ]}
            >
              {transaction.type === 'expense' ? '-' : '+'}
              {formatAmount(transaction.amount, transaction.currency)}
            </Text>
            <View style={[styles.settledPill, { backgroundColor: colors.semantic.incomeLight }]}>
              <DecorativeIcon
                name="checkmark-circle-outline"
                size={14}
                color={colors.semantic.income}
              />
              <Text
                style={[
                  styles.settledText,
                  { color: colors.semantic.income, fontFamily: fontFamily.medium },
                ]}
              >
                Settled
              </Text>
            </View>
          </View>
          <Card style={styles.detailCard}>
            <DetailRow
              icon="calendar-outline"
              label={transaction.date}
              value={transaction.account}
            />
            <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
            <DetailRow icon="pricetag-outline" label="Category" value={transaction.category} />
          </Card>
          <Card style={styles.stateCard}>
            <DataNotice
              icon="information-circle-outline"
              label="Receipt OCR, splits, and behavioral insights will appear here only after their backend contracts exist."
              tone="info"
            />
          </Card>
          <Text style={[styles.transactionId, { color: colors.text.muted }]}>
            Transaction ID: {transaction.id} · Synchronized securely
          </Text>
        </>
      )}
    </Screen>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View style={styles.detailRow}>
      <View style={[styles.detailIcon, { backgroundColor: colors.background.tertiary }]}>
        <DecorativeIcon name={icon} size={16} color={colors.semantic.info} />
      </View>
      <View style={styles.detailCopy}>
        <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>{label}</Text>
        <Text
          style={[
            styles.detailValue,
            { color: colors.text.primary, fontFamily: fontFamily.medium },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { minHeight: 320, alignItems: 'center', justifyContent: 'center' },
  stateCard: { padding: 16, gap: 16 },
  topRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { fontSize: 12, lineHeight: 18 },
  hero: { marginTop: 18, alignItems: 'center', gap: 6 },
  merchantIcon: {
    width: 58,
    height: 58,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  total: { marginTop: 8, fontSize: 30, lineHeight: 36, fontVariant: ['tabular-nums'] },
  settledPill: {
    marginTop: 2,
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  settledText: { fontSize: 10, lineHeight: 14 },
  detailCard: { marginTop: 18, paddingHorizontal: 12 },
  detailRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 9 },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCopy: { flex: 1, gap: 2 },
  detailLabel: { fontSize: 10, lineHeight: 14 },
  detailValue: { fontSize: 12, lineHeight: 16 },
  divider: { height: 1, marginVertical: 2 },
  aiCard: { marginTop: 12, padding: 12 },
  aiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 4,
  },
  aiPillText: { fontSize: 9, lineHeight: 13 },
  confidence: { fontSize: 10, lineHeight: 14 },
  aiText: { marginTop: 10, lineHeight: 19 },
  aiActions: { marginTop: 10, flexDirection: 'row', gap: 8 },
  aiButton: { flex: 1, paddingHorizontal: 8 },
  sectionTitle: { marginTop: 20, fontSize: 16, lineHeight: 22 },
  contextCard: { marginTop: 8, padding: 12, flexDirection: 'row', gap: 9 },
  contextIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextCopy: { flex: 1, gap: 4 },
  contextTitle: { fontSize: 11, lineHeight: 16 },
  envelopeCard: {
    marginTop: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  envelopeTitle: { fontSize: 11, lineHeight: 15 },
  envelopeAmount: { fontSize: 12, lineHeight: 16, textAlign: 'right' },
  receiptCard: { marginTop: 8, paddingHorizontal: 12 },
  receiptHeader: {
    minHeight: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiptTitle: { fontSize: 12, lineHeight: 16 },
  receiptMeta: { marginTop: 2, fontSize: 9, lineHeight: 13 },
  scanButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 },
  receiptCopy: { flex: 1, minWidth: 0 },
  receiptName: { fontSize: 11, lineHeight: 15 },
  receiptDetail: { marginTop: 2, fontSize: 9, lineHeight: 13 },
  receiptAmount: { maxWidth: 90, fontSize: 10, lineHeight: 14, fontVariant: ['tabular-nums'] },
  transactionId: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 9,
    lineHeight: 13,
    textAlign: 'center',
  },
});
