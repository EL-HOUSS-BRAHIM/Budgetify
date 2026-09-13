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

const previewTransaction: TransactionView = {
  id: 'TXN-MAR-2023-8849204',
  merchant: 'Carrefour Market',
  category: 'Groceries & Household',
  amount: 42750,
  currency: 'MAD',
  date: 'Today, 18:43',
  account: 'Attijariwafa Card · •••• 4102',
  type: 'expense',
};
const receiptItems = [
  ['Organic Eggs (30pk)', 'Ferme Du Rif · Qty 1', 4200],
  ['Whole Milk (6L)', 'Centrale Danone · Pack', 5400],
  ['Fresh Salmon Fillet', 'Pescherie Poissonnerie · 0.42kg', 7850],
  ['Extra Virgin Olive Oil 2L', 'Zouitina Gold', 8500],
  ['Greek Style Yogurt', 'Carrefour Bio · 4x125g', 2800],
  ['Avocado Hass', 'Produce Local · 1kg', 3600],
] as const;

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
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || id === 'preview') {
        setTransaction(previewTransaction);
        setIsPreview(true);
        return;
      }
      const { data, error: queryError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (queryError) throw queryError;
      if (!data) {
        setTransaction(previewTransaction);
        setIsPreview(true);
        return;
      }
      setTransaction(toView(data));
      setIsPreview(false);
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
          {isPreview && (
            <DataNotice
              icon="eye-outline"
              label="Design preview · sample transaction"
              tone="info"
            />
          )}
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
            <DetailRow
              icon="sparkles"
              label="AI Category Classification"
              value={`${transaction.category} · 94% confidence`}
            />
          </Card>
          <Card style={[styles.aiCard, { borderColor: colors.brand.accent }]}>
            <View style={styles.aiHeader}>
              <View style={[styles.aiPill, { backgroundColor: colors.brand.accentLight }]}>
                <DecorativeIcon name="sparkles" size={13} color={colors.semantic.info} />
                <Text
                  style={[
                    styles.aiPillText,
                    { color: colors.semantic.info, fontFamily: fontFamily.semibold },
                  ]}
                >
                  LYVORA ENGINE
                </Text>
              </View>
              <Text
                style={[
                  styles.confidence,
                  { color: colors.semantic.income, fontFamily: fontFamily.medium },
                ]}
              >
                94% confidence
              </Text>
            </View>
            <Text style={[typography.bodySmall, styles.aiText, { color: colors.text.secondary }]}>
              Categorized via deep merchant match. The classification is based on comparable
              category patterns and can be reviewed before any change.
            </Text>
            <View style={styles.aiActions}>
              <Button
                label="Re-train label"
                onPress={() => setNotice('Category training review prepared locally.')}
                style={styles.aiButton}
                variant="secondary"
              />
              <Button
                label="Split expense"
                onPress={() => setNotice('Expense split draft prepared locally.')}
                style={styles.aiButton}
                variant="text"
              />
            </View>
          </Card>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text.primary, fontFamily: fontFamily.medium },
            ]}
          >
            Behavioral Context
          </Text>
          <Card style={styles.contextCard}>
            <View style={[styles.contextIcon, { backgroundColor: colors.semantic.warningLight }]}>
              <DecorativeIcon name="trending-up" size={18} color={colors.semantic.warning} />
            </View>
            <View style={styles.contextCopy}>
              <Text
                style={[
                  styles.contextTitle,
                  { color: colors.semantic.warning, fontFamily: fontFamily.semibold },
                ]}
              >
                12% above 30-day grocery average
              </Text>
              <Text style={[typography.bodySmall, { color: colors.text.secondary }]}>
                Your typical basket is {formatAmount(38100, transaction.currency)}. This difference
                may reflect a larger pantry restock.
              </Text>
            </View>
          </Card>
          <Card style={[styles.envelopeCard, { backgroundColor: colors.background.tertiary }]}>
            <View>
              <Text
                style={[
                  styles.envelopeTitle,
                  { color: colors.text.primary, fontFamily: fontFamily.medium },
                ]}
              >
                Monthly Groceries Envelope
              </Text>
              <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
                Healthy burn rate · Refreshes on Oct 1
              </Text>
            </View>
            <Text
              style={[
                styles.envelopeAmount,
                { color: colors.semantic.income, fontFamily: fontFamily.semibold },
              ]}
            >
              {formatAmount(57250, transaction.currency)} left
            </Text>
          </Card>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text.primary, fontFamily: fontFamily.medium },
            ]}
          >
            Digital Receipt & OCR
          </Text>
          <Card style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <View>
                <Text
                  style={[
                    styles.receiptTitle,
                    { color: colors.text.primary, fontFamily: fontFamily.semibold },
                  ]}
                >
                  12 items parsed
                </Text>
                <Text style={[styles.receiptMeta, { color: colors.text.tertiary }]}>
                  OCR matrix · 99.2% match
                </Text>
              </View>
              <Pressable
                accessibilityLabel="View original receipt scan"
                accessibilityRole="button"
                onPress={() =>
                  setNotice('Original receipt viewing is not connected in this preview.')
                }
                style={({ pressed }) => [
                  styles.scanButton,
                  { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
                ]}
              >
                <DecorativeIcon name="scan-outline" size={17} color={colors.semantic.info} />
              </Pressable>
            </View>
            {receiptItems.map(([name, detail, amount], index) => (
              <React.Fragment key={name}>
                <View style={styles.receiptRow}>
                  <View style={styles.receiptCopy}>
                    <Text
                      style={[
                        styles.receiptName,
                        { color: colors.text.primary, fontFamily: fontFamily.medium },
                      ]}
                    >
                      {name}
                    </Text>
                    <Text style={[styles.receiptDetail, { color: colors.text.tertiary }]}>
                      {detail}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.receiptAmount,
                      { color: colors.text.primary, fontFamily: fontFamily.medium },
                    ]}
                  >
                    {formatAmount(amount, transaction.currency)}
                  </Text>
                </View>
                {index < receiptItems.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
                )}
              </React.Fragment>
            ))}
          </Card>
          <Text style={[styles.transactionId, { color: colors.text.muted }]}>
            Transaction ID: {transaction.id} · Synchronized securely
          </Text>
          {notice && <DataNotice label={notice} tone="info" />}
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
