import { formatMoney, money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, Screen } from '../src/components/ui';
import { useTheme } from '../src/theme/ThemeProvider';

const amount = (value: number) => formatMoney(money(value, 'MAD'), { compactZeroFraction: true });
function Icon(props: React.ComponentProps<typeof Ionicons>): React.ReactElement { return <Ionicons {...props} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />; }

export default function SharedFinancesScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [prepared, setPrepared] = useState(false);
  return (
    <Screen contentContainerStyle={{ paddingTop: insets.top + 8 }}>
      <View style={styles.header}><Pressable accessibilityLabel="Go back" accessibilityRole="button" hitSlop={6} onPress={() => router.back()} style={[styles.headerButton, { backgroundColor: colors.background.tertiary }]}><Icon name="chevron-back" size={20} color={colors.text.primary} /></Pressable><Text style={[styles.headerTitle, { color: colors.text.secondary, fontFamily: fontFamily.medium }]}>Shared Finances</Text><View style={styles.headerButton} /></View>
      <Text style={[styles.eyebrow, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}>SHARED FINANCES · PREVIEW</Text>
      <Text style={[typography.h2, { color: colors.text.primary, marginTop: 5 }]}>Split with clarity</Text>
      <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 4 }]}>A private view of shared commitments, balances, and fair contribution.</Text>
      <DataNotice icon="eye-outline" label="Design preview · no invitations, payments, or account changes" tone="info" />
      <Card style={styles.balanceCard}><Text style={[styles.label, { color: colors.text.tertiary }]}>HOUSEHOLD COMMITMENTS</Text><Text style={[styles.balance, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}>{amount(184500)}</Text><View style={styles.splitLine}><Text style={[styles.small, { color: colors.text.tertiary }]}>You cover 58%</Text><Text style={[styles.small, { color: colors.semantic.info }]}>Partner covers 42%</Text></View><View style={[styles.track, { backgroundColor: colors.border.subtle }]}><View style={[styles.fill, { backgroundColor: colors.semantic.info, width: '58%' }]} /></View></Card>
      <Text style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}>Shared commitments</Text>
      <Card style={styles.card}><Commitment icon="home-outline" title="Home & utilities" detail="Due across the next 14 days" value={92000} /><Commitment icon="cart-outline" title="Groceries & household" detail="Flexible envelope · this month" value={58500} /><Commitment icon="car-outline" title="Mobility" detail="Fuel, maintenance, and transit" value={34000} last /></Card>
      <Card style={[styles.proposal, { borderColor: colors.semantic.info }]}><Text style={[styles.label, { color: colors.semantic.info }]}>FAIRNESS CHECK</Text><Text style={[styles.proposalTitle, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}>One adjustment keeps the split balanced</Text><Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>A 6,800 MAD settlement would align contributions with the agreed 58 / 42 share.</Text></Card>
      {prepared ? <Card style={styles.confirmation}><DataNotice icon="checkmark-circle-outline" label="Split review prepared locally. No request or payment was created." tone="info" /></Card> : <Button icon="git-compare-outline" label="Prepare split review" onPress={() => setPrepared(true)} style={styles.action} />}
    </Screen>
  );
}

function Commitment({ icon, title, detail, value, last = false }: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; detail: string; value: number; last?: boolean }): React.ReactElement { const { colors, fontFamily } = useTheme(); return <View style={[styles.row, !last && { borderBottomColor: colors.border.subtle, borderBottomWidth: 1 }]}><View style={[styles.icon, { backgroundColor: colors.brand.accentLight }]}><Icon name={icon} size={18} color={colors.semantic.info} /></View><View style={styles.flex}><Text style={[styles.rowTitle, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}>{title}</Text><Text style={[styles.small, { color: colors.text.tertiary }]}>{detail}</Text></View><Text style={[styles.value, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}>{amount(value)}</Text></View>; }

const styles = StyleSheet.create({ header: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, headerButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, headerTitle: { fontSize: 12, lineHeight: 18 }, eyebrow: { marginTop: 22, fontSize: 10, lineHeight: 14 }, balanceCard: { marginTop: 16, padding: 16 }, label: { fontSize: 9, lineHeight: 13, letterSpacing: 0.5 }, balance: { marginTop: 6, fontSize: 28, lineHeight: 35 }, splitLine: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between' }, track: { height: 8, marginTop: 7, borderRadius: 4, overflow: 'hidden' }, fill: { height: '100%', borderRadius: 4 }, section: { marginTop: 22, fontSize: 16, lineHeight: 22 }, card: { marginTop: 8, paddingHorizontal: 12 }, row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 10 }, icon: { width: 38, height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, flex: { flex: 1 }, rowTitle: { fontSize: 12, lineHeight: 17 }, small: { fontSize: 10, lineHeight: 14 }, value: { fontSize: 12, lineHeight: 17 }, proposal: { marginTop: 14, padding: 14 }, proposalTitle: { marginTop: 5, fontSize: 14, lineHeight: 20 }, confirmation: { marginTop: 14, padding: 14 }, action: { marginTop: 14 }, });