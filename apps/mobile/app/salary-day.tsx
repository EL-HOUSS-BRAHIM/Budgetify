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

type Account = Tables<'accounts'>;
type PlanItem = Tables<'plan_items'>;
type Goal = Tables<'goals'>;
type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface SalaryModel {
  status: 'preview' | 'live';
  currency: string;
  salary: number;
  origin: string;
  fixedBills: number;
  goals: number;
  reserve: number;
  safetyBuffer: number;
  safeToSpend: number;
  goalNames: string;
  billNames: string;
}

const previewModel: SalaryModel = { status: 'preview', currency: 'MAD', salary: 500000, origin: 'Primary Salary Inflow', fixedBills: 110000, goals: 100000, reserve: 70000, safetyBuffer: 50000, safeToSpend: 170000, goalNames: 'Motorcycle reserve · Studio setup', billNames: 'Wi-Fi · Electricity · Phone · Rent floor' };

function DecorativeIcon(props: React.ComponentProps<typeof Ionicons>): React.ReactElement {
  return <Ionicons {...props} accessibilityElementsHidden accessible={false} importantForAccessibility="no-hide-descendants" />;
}

function formatAmount(amount: number, currency: string): string {
  return formatMoney(money(amount, currency), { compactZeroFraction: true });
}

function toModel(accounts: Account[], items: PlanItem[], goals: Goal[], currency: string): SalaryModel {
  const available = accounts.filter((account) => account.currency === currency).reduce((sum, account) => sum + account.current_balance, 0);
  const fixedItems = items.filter((item) => item.currency === currency && !item.is_done);
  const fixedBills = fixedItems.reduce((sum, item) => sum + item.expected_amount, 0);
  const activeGoals = goals.filter((goal) => goal.currency === currency);
  const goalAllocation = Math.min(Math.max(0, available - fixedBills), activeGoals.length * 30000);
  const reserve = Math.min(Math.max(0, available - fixedBills - goalAllocation), 70000);
  const safetyBuffer = Math.min(Math.max(0, available - fixedBills - goalAllocation - reserve), 50000);
  return { status: 'live', currency, salary: available, origin: accounts.find((account) => account.is_default)?.name ?? 'Available account balance', fixedBills, goals: goalAllocation, reserve, safetyBuffer, safeToSpend: Math.max(0, available - fixedBills - goalAllocation - reserve - safetyBuffer), goalNames: activeGoals.map((goal) => goal.name).slice(0, 2).join(' · ') || 'No active goals', billNames: fixedItems.map((item) => item.title).slice(0, 3).join(' · ') || 'No upcoming commitments' };
}

export default function SalaryDayScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [model, setModel] = useState<SalaryModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPrepared, setIsPrepared] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setModel(previewModel); return; }
      const [profileResult, accountResult, itemResult, goalResult] = await Promise.all([
        supabase.from('profiles').select('currency').eq('id', session.user.id).maybeSingle(),
        supabase.from('accounts').select('*').order('is_default', { ascending: false }),
        supabase.from('plan_items').select('*').eq('is_done', false).order('due_date', { ascending: true }),
        supabase.from('goals').select('*').order('created_at', { ascending: false }),
      ]);
      const queryError = profileResult.error || accountResult.error || itemResult.error || goalResult.error;
      if (queryError) throw queryError;
      const currency = profileResult.data?.currency || accountResult.data[0]?.currency || 'USD';
      setModel(toModel(accountResult.data, itemResult.data, goalResult.data, currency));
    } catch { setError('Salary allocation could not be loaded. Your existing data was not changed.'); }
    finally { setIsLoading(false); setIsRefreshing(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const refresh = () => { setIsRefreshing(true); void load(); };

  return <Screen contentContainerStyle={{ paddingTop: insets.top + 8 }} refreshControl={<RefreshControl colors={[colors.semantic.info]} onRefresh={refresh} refreshing={isRefreshing} tintColor={colors.semantic.info} />}>
    {isLoading ? <View accessibilityLabel="Loading salary allocation" style={styles.loading}><ActivityIndicator color={colors.semantic.info} /></View> : error ? <Card style={styles.stateCard}><DataNotice icon="alert-circle-outline" label={error} tone="expense" /><Button label="Try again" onPress={refresh} variant="secondary" /></Card> : !model ? <Card><EmptyState description="Income allocation is unavailable." icon="cash-outline" title="No allocation available" /></Card> : <>
      <View style={styles.header}><Pressable accessibilityLabel="Go back" accessibilityRole="button" hitSlop={6} onPress={() => router.back()} style={({ pressed }) => [styles.headerButton, { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 }]}><DecorativeIcon name="chevron-back" size={20} color={colors.text.primary} /></Pressable><View style={styles.brandRow}><View style={[styles.brandMark, { borderColor: colors.semantic.income }]}><DecorativeIcon name="sparkles" size={13} color={colors.semantic.income} /></View><Text style={[styles.brandName, { color: colors.text.primary, fontFamily: fontFamily.bold }]}>Lyvora</Text></View></View>
      <View style={styles.hero}><View style={[styles.salaryIcon, { backgroundColor: colors.semantic.incomeLight }]}><DecorativeIcon name="cash-outline" size={27} color={colors.semantic.income} /></View><Text style={[styles.eyebrow, { color: colors.semantic.income, fontFamily: fontFamily.semibold }]}>SALARY DETECTED</Text><Text style={[typography.h2, { color: colors.text.primary }]}>New income, assigned.</Text><Text style={[styles.salaryAmount, { color: colors.semantic.income, fontFamily: fontFamily.semibold }]}>+ {formatAmount(model.salary, model.currency)}</Text><Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>{model.origin} · allocation preview</Text></View>
      {model.status === 'preview' && <DataNotice icon="eye-outline" label="Design preview · sample salary allocation" tone="info" />}
      <Card style={[styles.intelligenceCard, { borderColor: colors.brand.accent }]}><DecorativeIcon name="sparkles" size={17} color={colors.semantic.info} /><Text style={[typography.bodySmall, styles.intelligenceCopy, { color: colors.text.secondary }]}>Lyvora has prepared a zero-based distribution around upcoming commitments, priority growth buckets, and your safety floor.</Text></Card>
      <Text style={[styles.sectionTitle, { color: colors.text.primary, fontFamily: fontFamily.medium }]}>Allocation Waterfall</Text>
      <Card style={styles.waterfallCard}>
        <AllocationRow icon="card-outline" title="Fixed Bills & Utilities" detail={model.billNames} amount={model.fixedBills} currency={model.currency} percent={model.salary ? Math.round(model.fixedBills / model.salary * 100) : 0} tone="warning" />
        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
        <AllocationRow icon="flag-outline" title="Active Ambitions" detail={model.goalNames} amount={model.goals} currency={model.currency} percent={model.salary ? Math.round(model.goals / model.salary * 100) : 0} tone="info" />
        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
        <AllocationRow icon="shield-checkmark-outline" title="Emergency Shield" detail="High-yield reserve · protected runway" amount={model.reserve} currency={model.currency} percent={model.salary ? Math.round(model.reserve / model.salary * 100) : 0} tone="income" />
        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
        <AllocationRow icon="lock-closed-outline" title="Safety Base Buffer" detail="Checking-balance floor · untouchable" amount={model.safetyBuffer} currency={model.currency} percent={model.salary ? Math.round(model.safetyBuffer / model.salary * 100) : 0} tone="warning" />
        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
        <AllocationRow icon="happy-outline" title="Safe-to-Spend" detail="Daily living, dining, and flexible discovery" amount={model.safeToSpend} currency={model.currency} percent={model.salary ? Math.round(model.safeToSpend / model.salary * 100) : 0} tone="income" />
      </Card>
      <Card style={[styles.retainCard, { backgroundColor: colors.background.tertiary }]}><DecorativeIcon name="wallet-outline" size={17} color={colors.semantic.info} /><View style={styles.retainCopy}><Text style={[styles.retainTitle, { color: colors.text.primary, fontFamily: fontFamily.medium }]}>100% assigned</Text><Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>Every allocation remains a prepared preview until you explicitly apply it through a supported account connection.</Text></View></Card>
      {!isPrepared ? <View style={styles.actions}><Button label="Prepare Distribution" onPress={() => setIsPrepared(true)} style={styles.actionButton} variant="secondary" /><Button label="Modify Plan" onPress={() => router.push('/(tabs)/planning')} style={styles.actionButton} variant="text" /></View> : <Card style={[styles.preparedCard, { borderColor: colors.semantic.income }]}><DataNotice icon="checkmark-circle-outline" label="Distribution prepared locally. No transfers were created." tone="info" /></Card>}
    </>}
  </Screen>;
}

function AllocationRow({ icon, title, detail, amount, currency, percent, tone }: { icon: IconName; title: string; detail: string; amount: number; currency: string; percent: number; tone: 'income' | 'warning' | 'info' }): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  const color = colors.semantic[tone];
  const backgroundColor = tone === 'income' ? colors.semantic.incomeLight : tone === 'warning' ? colors.semantic.warningLight : colors.brand.accentLight;
  return <View style={styles.allocationRow}><View style={[styles.allocationIcon, { backgroundColor }]}><DecorativeIcon name={icon} size={17} color={color} /></View><View style={styles.allocationCopy}><Text style={[styles.allocationTitle, { color: colors.text.primary, fontFamily: fontFamily.medium }]}>{title}</Text><Text style={[styles.allocationDetail, { color: colors.text.tertiary }]}>{detail}</Text><View style={[styles.track, { backgroundColor: colors.border.subtle }]}><View style={[styles.fill, { backgroundColor: color, width: `${Math.min(percent, 100)}%` }]} /></View></View><View style={styles.allocationAmount}><Text style={[styles.amount, { color, fontFamily: fontFamily.semibold }]}>- {formatAmount(amount, currency)}</Text><Text style={[styles.percent, { color: colors.text.tertiary }]}>{percent}%</Text></View></View>;
}

const styles = StyleSheet.create({
  loading: { minHeight: 320, alignItems: 'center', justifyContent: 'center' }, stateCard: { padding: 16, gap: 16 }, header: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, headerButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, brandRow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, brandMark: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, brandName: { fontSize: 14, lineHeight: 20 },
  hero: { marginTop: 20, alignItems: 'center', gap: 5 }, salaryIcon: { width: 54, height: 54, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 5 }, eyebrow: { fontSize: 10, lineHeight: 14 }, salaryAmount: { fontSize: 30, lineHeight: 36, fontVariant: ['tabular-nums'] }, intelligenceCard: { marginTop: 18, padding: 12, flexDirection: 'row', gap: 9, borderWidth: 1 }, intelligenceCopy: { flex: 1, lineHeight: 19 }, sectionTitle: { marginTop: 22, fontSize: 16, lineHeight: 22 }, waterfallCard: { marginTop: 8, paddingHorizontal: 12 }, allocationRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 9 }, allocationIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, allocationCopy: { flex: 1, minWidth: 0 }, allocationTitle: { fontSize: 12, lineHeight: 16 }, allocationDetail: { marginTop: 2, fontSize: 9, lineHeight: 13 }, track: { height: 4, borderRadius: 2, marginTop: 6, overflow: 'hidden' }, fill: { height: 4, borderRadius: 2 }, allocationAmount: { width: 91, alignItems: 'flex-end' }, amount: { fontSize: 11, lineHeight: 15, textAlign: 'right', fontVariant: ['tabular-nums'] }, percent: { marginTop: 2, fontSize: 9, lineHeight: 13 }, divider: { height: 1, marginVertical: 2 }, retainCard: { marginTop: 12, padding: 12, flexDirection: 'row', gap: 9 }, retainCopy: { flex: 1, gap: 3 }, retainTitle: { fontSize: 11, lineHeight: 15 }, actions: { marginTop: 12, flexDirection: 'row', gap: 8 }, actionButton: { flex: 1, paddingHorizontal: 8 }, preparedCard: { marginTop: 12, padding: 14 },
});

