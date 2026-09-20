import { formatMoney, money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import type { Tables } from '@budgetify/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, EmptyState, Screen } from '../src/components/ui';
import { supabase } from '../src/lib/supabase';
import { useTheme } from '../src/theme/ThemeProvider';

type PlanItem = Tables<'plan_items'>;
type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface BillContract {
  id: string;
  title: string;
  detail: string;
  amount: number;
  currency: string;
  dueLabel: string;
  icon: IconName;
  status: string;
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

function dueLabel(value: string | null): string {
  if (!value) return 'Unscheduled';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Unscheduled';
  return `Due ${new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)}`;
}

function toContract(item: PlanItem): BillContract {
  return {
    id: item.id,
    title: item.title,
    detail: item.category_name,
    amount: item.expected_amount,
    currency: item.currency,
    dueLabel: dueLabel(item.due_date),
    icon: item.category_name.toLowerCase().includes('utility')
      ? 'flash-outline'
      : 'receipt-outline',
    status: item.is_done ? 'Paid' : item.is_recurring ? 'Recurring' : 'Scheduled',
  };
}

export default function BillsScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [contracts, setContracts] = useState<BillContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBills = useCallback(async () => {
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setContracts([]);
        return;
      }
      const { data, error: queryError } = await supabase
        .from('plan_items')
        .select('*')
        .eq('is_recurring', true)
        .order('due_date', { ascending: true });
      if (queryError) throw queryError;
      setContracts(data.map(toContract));
    } catch {
      setError('Subscriptions could not be loaded. Your existing data was not changed.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadBills();
  }, [loadBills]);
  const refresh = () => {
    setIsRefreshing(true);
    void loadBills();
  };
  const currency = contracts[0]?.currency ?? 'MAD';
  const recurringTotal = contracts
    .filter((contract) => contract.status !== 'Paid')
    .reduce((sum, contract) => sum + contract.amount, 0);

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
        <View accessibilityLabel="Loading subscriptions" style={styles.loading}>
          <ActivityIndicator color={colors.semantic.info} />
        </View>
      ) : error ? (
        <Card style={styles.stateCard}>
          <DataNotice icon="alert-circle-outline" label={error} tone="expense" />
          <Button label="Try again" onPress={refresh} variant="secondary" />
        </Card>
      ) : contracts.length === 0 ? (
        <Card>
          <EmptyState
            actionLabel="Plan recurring cost with AI"
            description="Recurring plan items will appear here when you add them to your plan."
            icon="receipt-outline"
            onAction={() => router.push('/(tabs)/assistant')}
            title="No recurring contracts"
          />
        </Card>
      ) : (
        <>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={[styles.brandMark, { borderColor: colors.semantic.income }]}>
                <DecorativeIcon name="sparkles" size={13} color={colors.semantic.income} />
              </View>
              <Text
                style={[
                  styles.brandName,
                  { color: colors.text.primary, fontFamily: fontFamily.bold },
                ]}
              >
                Lyvora
              </Text>
              <Text style={[styles.brandSection, { color: colors.text.tertiary }]}>| Money</Text>
            </View>
            <Pressable
              accessibilityLabel="Bills notifications"
              accessibilityRole="button"
              hitSlop={6}
              style={({ pressed }) => [
                styles.headerButton,
                { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
              ]}
            >
              <DecorativeIcon
                name="notifications-outline"
                size={19}
                color={colors.text.secondary}
              />
            </Pressable>
          </View>
          <View style={styles.titleRow}>
            <View style={styles.titleCopy}>
              <Text
                style={[
                  styles.eyebrow,
                  { color: colors.semantic.info, fontFamily: fontFamily.semibold },
                ]}
              >
                AGENT SURVEILLANCE LIVE
              </Text>
              <Text style={[typography.h2, { color: colors.text.primary }]}>
                Payments & Subscriptions
              </Text>
              <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
                Recurring payment engine & leak surveillance
              </Text>
            </View>
            <View style={[styles.lockPill, { backgroundColor: colors.semantic.incomeLight }]}>
              <DecorativeIcon
                name="shield-checkmark-outline"
                size={13}
                color={colors.semantic.income}
              />
              <Text
                style={[
                  styles.lockText,
                  { color: colors.semantic.income, fontFamily: fontFamily.semibold },
                ]}
              >
                Cash-flow lock
              </Text>
            </View>
          </View>
          <Card style={styles.loadCard}>
            <View>
              <Text style={[styles.loadLabel, { color: colors.text.tertiary }]}>
                RECURRING LOAD
              </Text>
              <Text
                style={[
                  styles.loadAmount,
                  { color: colors.text.primary, fontFamily: fontFamily.semibold },
                ]}
              >
                {formatAmount(recurringTotal, currency)}
                <Text style={[styles.loadSuffix, { color: colors.text.tertiary }]}> / month</Text>
              </Text>
              <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
                ~{formatAmount(recurringTotal * 12, currency)} / year
              </Text>
            </View>
            <View style={styles.loadMeta}>
              <Text
                style={[
                  styles.activeCount,
                  { color: colors.semantic.income, fontFamily: fontFamily.semibold },
                ]}
              >
                {contracts.length} active contracts
              </Text>
              <Text style={[styles.bufferText, { color: colors.text.tertiary }]}>
                From active recurring plan items
              </Text>
            </View>
          </Card>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text.primary, fontFamily: fontFamily.medium },
            ]}
          >
            Active Subscriptions
          </Text>
          <Card style={styles.contractsCard}>
            {contracts.map((contract, index) => (
              <React.Fragment key={contract.id}>
                <ContractRow contract={contract} />
                {index < contracts.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
                )}
              </React.Fragment>
            ))}
          </Card>
          <Card style={[styles.shieldCard, { backgroundColor: colors.background.tertiary }]}>
            <DecorativeIcon
              name="shield-checkmark-outline"
              size={18}
              color={colors.semantic.income}
            />
            <View style={styles.shieldCopy}>
              <Text
                style={[
                  styles.shieldTitle,
                  { color: colors.text.primary, fontFamily: fontFamily.medium },
                ]}
              >
                Zero-Leak Shield
              </Text>
              <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
                Renewal intelligence and cancellation proposals will appear after the insights and
                action-review contracts are implemented.
              </Text>
            </View>
          </Card>
        </>
      )}
    </Screen>
  );
}

function ContractRow({ contract }: { contract: BillContract }): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();
  return (
    <View style={styles.contractRow}>
      <View style={[styles.contractIcon, { backgroundColor: colors.brand.accentLight }]}>
        <DecorativeIcon name={contract.icon} size={18} color={colors.semantic.info} />
      </View>
      <View style={styles.contractCopy}>
        <Text
          style={[
            typography.bodyMedium,
            { color: colors.text.primary, fontFamily: fontFamily.semibold },
          ]}
        >
          {contract.title}
        </Text>
        <Text style={[styles.contractDetail, { color: colors.text.tertiary }]}>
          {contract.detail}
        </Text>
        <Text style={[styles.contractStatus, { color: colors.semantic.income }]}>
          {contract.status} · {contract.dueLabel}
        </Text>
      </View>
      <Text
        style={[
          styles.contractAmount,
          { color: colors.text.primary, fontFamily: fontFamily.semibold },
        ]}
      >
        {formatAmount(contract.amount, contract.currency)}
        <Text style={[styles.contractMonth, { color: colors.text.tertiary }]}> / mo</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { minHeight: 320, alignItems: 'center', justifyContent: 'center' },
  stateCard: { padding: 16, gap: 16 },
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 14, lineHeight: 20 },
  brandSection: { fontSize: 12, lineHeight: 18 },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleCopy: { flexGrow: 1, flexShrink: 1, minWidth: 220 },
  eyebrow: { fontSize: 10, lineHeight: 14 },
  lockPill: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  lockText: { fontSize: 9, lineHeight: 13 },
  loadCard: {
    marginTop: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  loadLabel: { fontSize: 10, lineHeight: 14 },
  loadAmount: { marginTop: 4, fontSize: 22, lineHeight: 28, fontVariant: ['tabular-nums'] },
  loadSuffix: { fontSize: 12, lineHeight: 16 },
  loadMeta: { alignItems: 'flex-end', justifyContent: 'flex-end', gap: 5 },
  activeCount: { fontSize: 10, lineHeight: 14, textAlign: 'right' },
  bufferText: { fontSize: 9, lineHeight: 13, textAlign: 'right' },
  sectionTitle: { marginTop: 20, fontSize: 16, lineHeight: 22 },
  urgentCard: { marginTop: 8, padding: 12 },
  urgentTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  urgentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  urgentPillText: { fontSize: 9, lineHeight: 13 },
  autoLabel: { fontSize: 9, lineHeight: 13, textAlign: 'right' },
  verifiedStrip: { marginTop: 9, padding: 9, borderRadius: 8, flexDirection: 'row', gap: 7 },
  verifiedText: { flex: 1, fontSize: 10, lineHeight: 15 },
  urgentActions: { marginTop: 10, flexDirection: 'row', gap: 8 },
  urgentButton: { flex: 1, paddingHorizontal: 8 },
  contractRow: {
    minHeight: 73,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 10,
  },
  contractIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contractCopy: { flex: 1, minWidth: 0 },
  contractDetail: { marginTop: 2, fontSize: 9, lineHeight: 13 },
  contractStatus: { marginTop: 2, fontSize: 9, lineHeight: 13 },
  contractAmount: {
    maxWidth: 97,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  contractMonth: { fontSize: 9, lineHeight: 13 },
  leakCard: { marginTop: 8, padding: 12, gap: 11 },
  leakHeader: { flexDirection: 'row', gap: 9 },
  leakIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leakCopy: { flex: 1 },
  leakTitle: { fontSize: 13, lineHeight: 18 },
  leakDetail: { marginTop: 2, fontSize: 10, lineHeight: 14 },
  leakActions: { flexDirection: 'row', gap: 8 },
  contractsCard: { marginTop: 8, paddingHorizontal: 12 },
  divider: { height: 1, marginVertical: 2 },
  shieldCard: { marginTop: 12, padding: 12, flexDirection: 'row', gap: 9 },
  shieldCopy: { flex: 1, gap: 4 },
  shieldTitle: { fontSize: 11, lineHeight: 15 },
});
