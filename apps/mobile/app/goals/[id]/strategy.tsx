import { formatMoney, money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, Screen } from '../../../src/components/ui';
import { useTheme } from '../../../src/theme/ThemeProvider';

const amount = (value: number) => formatMoney(money(value, 'MAD'), { compactZeroFraction: true });

function Icon(props: React.ComponentProps<typeof Ionicons>): React.ReactElement {
  return <Ionicons {...props} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />;
}

export default function GoalStrategyScreen(): React.ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [prepared, setPrepared] = useState(false);
  const goalName = id && id !== 'preview' ? 'Selected capital target' : 'Yamaha MT-07';

  return (
    <Screen contentContainerStyle={{ paddingTop: insets.top + 8 }}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerButton, { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.7 : 1 }]}
        >
          <Icon name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.secondary, fontFamily: fontFamily.medium }]}>Goal Strategy</Text>
        <View style={styles.headerButton} />
      </View>
      <Text style={[styles.eyebrow, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}>DEEP GOAL STRATEGY · PREVIEW</Text>
      <Text style={[typography.h2, { color: colors.text.primary, marginTop: 5 }]}>{goalName}</Text>
      <DataNotice icon="eye-outline" label="Design preview · strategy recommendations are sample guidance" tone="info" />

      <Card style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={[styles.icon, { backgroundColor: colors.brand.accentLight }]}><Icon name="flag-outline" size={22} color={colors.semantic.info} /></View>
          <View style={styles.flex}>
            <Text style={[styles.label, { color: colors.text.tertiary }]}>TARGET HORIZON</Text>
            <Text style={[styles.heroAmount, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}>{amount(2000000)}</Text>
            <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>Jan 2027 · 62% funded</Text>
          </View>
          <Text style={[styles.health, { color: colors.semantic.income, fontFamily: fontFamily.semibold }]}>ON TRACK</Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.border.subtle }]}><View style={[styles.fill, { backgroundColor: colors.semantic.income, width: '62%' }]} /></View>
      </Card>

      <Text style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}>Strategy layers</Text>
      <Card style={styles.card}>
        <StrategyRow icon="speedometer-outline" title="Protect the runway" detail="Keep 5.4 months of essential liquidity untouched." tone="warning" />
        <StrategyRow icon="trending-up-outline" title="Increase monthly velocity" detail="Add 70,000 MAD after fixed commitments clear." tone="income" />
        <StrategyRow icon="calendar-outline" title="Use a milestone checkpoint" detail="Review progress again after the next salary day." tone="info" last />
      </Card>
      <Card style={[styles.proposal, { borderColor: colors.brand.accent }]}>
        <Text style={[styles.label, { color: colors.semantic.info }]}>ADAPTIVE PROPOSAL</Text>
        <Text style={[styles.proposalTitle, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}>Keep the target date, trim impulse spend</Text>
        <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>A 12,000 MAD monthly flexibility buffer preserves momentum without reducing your safety floor.</Text>
      </Card>
      {prepared ? (
        <Card style={styles.confirmation}><DataNotice icon="checkmark-circle-outline" label="Strategy review prepared locally. No goal or transfer was changed." tone="info" /></Card>
      ) : (
        <Button icon="sparkles-outline" label="Prepare strategy review" onPress={() => setPrepared(true)} style={styles.action} />
      )}
    </Screen>
  );
}

function StrategyRow({ icon, title, detail, tone, last = false }: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; detail: string; tone: 'warning' | 'income' | 'info'; last?: boolean }): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return <View style={[styles.strategyRow, !last && { borderBottomColor: colors.border.subtle, borderBottomWidth: 1 }]}><View style={[styles.iconSmall, { backgroundColor: tone === 'warning' ? colors.semantic.warningLight : tone === 'income' ? colors.semantic.incomeLight : colors.brand.accentLight }]}><Icon name={icon} size={17} color={colors.semantic[tone]} /></View><View style={styles.flex}><Text style={[styles.rowTitle, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}>{title}</Text><Text style={[styles.rowDetail, { color: colors.text.tertiary }]}>{detail}</Text></View></View>;
}

const styles = StyleSheet.create({
  header: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 12, lineHeight: 18 },
  eyebrow: { marginTop: 22, fontSize: 10, lineHeight: 14 },
  heroCard: { marginTop: 14, padding: 14 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 46, height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconSmall: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  label: { fontSize: 9, lineHeight: 13, letterSpacing: 0.5 },
  heroAmount: { marginTop: 2, fontSize: 21, lineHeight: 27 },
  health: { fontSize: 9, lineHeight: 14 },
  track: { height: 7, marginTop: 14, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  section: { marginTop: 22, fontSize: 16, lineHeight: 22 },
  card: { marginTop: 8, paddingHorizontal: 12 },
  strategyRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowTitle: { fontSize: 12, lineHeight: 17 },
  rowDetail: { marginTop: 2, fontSize: 10, lineHeight: 14 },
  proposal: { marginTop: 14, padding: 14 },
  proposalTitle: { marginTop: 5, fontSize: 14, lineHeight: 20 },
  confirmation: { marginTop: 14, padding: 14 },
  action: { marginTop: 14 },
});