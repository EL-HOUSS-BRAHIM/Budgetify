import { formatMoney, type Money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, EmptyState, Screen } from '../src/components/ui';
import { useSalaryAllocation } from '../src/features/finance/salary';
import { useTheme } from '../src/theme/ThemeProvider';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type AllocationTone = 'income' | 'warning' | 'info';

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

export default function SalaryDayScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const { allocation, isLoading, error, refresh } = useSalaryAllocation();
  const [isPrepared, setIsPrepared] = useState(false);

  return (
    <Screen
      contentContainerStyle={{ paddingTop: insets.top + 8 }}
      refreshControl={
        <RefreshControl
          colors={[colors.semantic.info]}
          onRefresh={() => {
            setIsPrepared(false);
            void refresh();
          }}
          refreshing={isLoading}
          tintColor={colors.semantic.info}
        />
      }
    >
      {isLoading ? (
        <View accessibilityLabel="Loading salary allocation" style={styles.loading}>
          <ActivityIndicator color={colors.semantic.info} />
        </View>
      ) : error ? (
        <Card style={styles.stateCard}>
          <DataNotice icon="alert-circle-outline" label={error} tone="expense" />
          <Button label="Try again" onPress={() => void refresh()} variant="secondary" />
        </Card>
      ) : !allocation ? (
        <Card>
          <EmptyState
            description="Budgetify needs account, income, or commitment data before it can recommend an allocation."
            icon="cash-outline"
            title="No allocation available"
          />
        </Card>
      ) : (
        <>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={6}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.headerButton,
                { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
              ]}
            >
              <DecorativeIcon name="chevron-back" size={20} color={colors.text.primary} />
            </Pressable>
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
            </View>
          </View>

          <View style={styles.hero}>
            <View style={[styles.salaryIcon, { backgroundColor: colors.semantic.incomeLight }]}>
              <DecorativeIcon name="cash-outline" size={27} color={colors.semantic.income} />
            </View>
            <Text
              style={[
                styles.eyebrow,
                { color: colors.semantic.income, fontFamily: fontFamily.semibold },
              ]}
            >
              ALLOCATION READY
            </Text>
            <Text style={[typography.h2, { color: colors.text.primary }]}>Income assigned.</Text>
            <Text
              style={[
                styles.salaryAmount,
                { color: colors.semantic.income, fontFamily: fontFamily.semibold },
              ]}
            >
              {formatMoney(allocation.sourceAmount)}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
              {allocation.sourceLabel}
            </Text>
          </View>

          <Card style={[styles.intelligenceCard, { borderColor: colors.brand.accent }]}>
            <DecorativeIcon name="sparkles" size={17} color={colors.semantic.info} />
            <Text
              style={[
                typography.bodySmall,
                styles.intelligenceCopy,
                { color: colors.text.secondary },
              ]}
            >
              {allocation.explanation}
            </Text>
          </Card>

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text.primary, fontFamily: fontFamily.medium },
            ]}
          >
            Allocation Waterfall
          </Text>
          <Card style={styles.waterfallCard}>
            <AllocationRow
              amount={allocation.fixedBills}
              detail={allocation.billNames}
              icon="card-outline"
              source={allocation.sourceAmount}
              title="Fixed Bills & Utilities"
              tone="warning"
            />
            <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
            <AllocationRow
              amount={allocation.goals}
              detail={allocation.goalNames}
              icon="flag-outline"
              source={allocation.sourceAmount}
              title="Active Goals"
              tone="info"
            />
            <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
            <AllocationRow
              amount={allocation.reserve}
              detail="Liquidity reserved before flexible spending"
              icon="shield-checkmark-outline"
              source={allocation.sourceAmount}
              title="Reserve"
              tone="income"
            />
            <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
            <AllocationRow
              amount={allocation.safetyBuffer}
              detail="Protected floor"
              icon="lock-closed-outline"
              source={allocation.sourceAmount}
              title="Safety Buffer"
              tone="warning"
            />
            <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
            <AllocationRow
              amount={allocation.safeToSpend}
              detail="Remaining flexible spending"
              icon="happy-outline"
              source={allocation.sourceAmount}
              title="Safe-to-Spend"
              tone="income"
            />
          </Card>

          {allocation.status === 'empty' && (
            <DataNotice
              icon="information-circle-outline"
              label="Add income or account balances before applying an allocation."
              tone="warning"
            />
          )}

          {!isPrepared ? (
            <View style={styles.actions}>
              <Button
                disabled={allocation.status === 'empty'}
                label="Prepare Distribution"
                onPress={() => setIsPrepared(true)}
                style={styles.actionButton}
                variant="secondary"
              />
              <Button
                label="Modify Plan"
                onPress={() => router.push('/(tabs)/planning')}
                style={styles.actionButton}
                variant="text"
              />
            </View>
          ) : (
            <Card style={[styles.preparedCard, { borderColor: colors.semantic.income }]}>
              <DataNotice
                icon="checkmark-circle-outline"
                label="Distribution prepared for review. No transfer was created."
                tone="info"
              />
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}

function AllocationRow({
  amount,
  detail,
  icon,
  source,
  title,
  tone,
}: {
  amount: Money;
  detail: string;
  icon: IconName;
  source: Money;
  title: string;
  tone: AllocationTone;
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  const color = colors.semantic[tone];
  const backgroundColor =
    tone === 'income'
      ? colors.semantic.incomeLight
      : tone === 'warning'
        ? colors.semantic.warningLight
        : colors.brand.accentLight;
  const percent = source.amount > 0 ? Math.round((amount.amount / source.amount) * 100) : 0;
  return (
    <View style={styles.allocationRow}>
      <View style={[styles.allocationIcon, { backgroundColor }]}>
        <DecorativeIcon name={icon} size={17} color={color} />
      </View>
      <View style={styles.allocationCopy}>
        <Text
          style={[
            styles.allocationTitle,
            { color: colors.text.primary, fontFamily: fontFamily.medium },
          ]}
        >
          {title}
        </Text>
        <Text style={[styles.allocationDetail, { color: colors.text.tertiary }]}>{detail}</Text>
        <View style={[styles.track, { backgroundColor: colors.border.subtle }]}>
          <View
            style={[styles.fill, { backgroundColor: color, width: `${Math.min(percent, 100)}%` }]}
          />
        </View>
      </View>
      <View style={styles.allocationAmount}>
        <Text style={[styles.amount, { color, fontFamily: fontFamily.semibold }]}>
          {formatMoney(amount)}
        </Text>
        <Text style={[styles.percent, { color: colors.text.tertiary }]}>{percent}%</Text>
      </View>
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
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
  hero: { marginTop: 20, alignItems: 'center', gap: 5 },
  salaryIcon: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  eyebrow: { fontSize: 10, lineHeight: 14, letterSpacing: 0 },
  salaryAmount: { fontSize: 30, lineHeight: 36, fontVariant: ['tabular-nums'] },
  intelligenceCard: { marginTop: 18, padding: 12, flexDirection: 'row', gap: 9, borderWidth: 1 },
  intelligenceCopy: { flex: 1, lineHeight: 19 },
  sectionTitle: { marginTop: 22, fontSize: 16, lineHeight: 22 },
  waterfallCard: { marginTop: 8, paddingHorizontal: 12 },
  allocationRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 9,
  },
  allocationIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allocationCopy: { flex: 1, minWidth: 0 },
  allocationTitle: { fontSize: 12, lineHeight: 16 },
  allocationDetail: { marginTop: 2, fontSize: 9, lineHeight: 13 },
  track: { height: 4, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  allocationAmount: { width: 91, alignItems: 'flex-end' },
  amount: { fontSize: 11, lineHeight: 15, textAlign: 'right', fontVariant: ['tabular-nums'] },
  percent: { marginTop: 2, fontSize: 9, lineHeight: 13 },
  divider: { height: 1, marginVertical: 2 },
  actions: { marginTop: 12, flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, paddingHorizontal: 8 },
  preparedCard: { marginTop: 12, padding: 14 },
});
