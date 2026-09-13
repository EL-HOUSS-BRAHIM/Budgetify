import { formatMoney, money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, Screen } from '../../src/components/ui';
import { useTheme } from '../../src/theme/ThemeProvider';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface CategoryVelocity {
  name: string;
  detail: string;
  spent: number;
  cap: number;
  icon: IconName;
  tone: 'income' | 'warning' | 'expense' | 'info';
}

const categoryVelocities: CategoryVelocity[] = [
  {
    name: 'Food & Groceries',
    detail: 'Pacing: Normal',
    spent: 80000,
    cap: 100000,
    icon: 'cart-outline',
    tone: 'income',
  },
  {
    name: 'Transport',
    detail: 'Pacing: 15% below average',
    spent: 20000,
    cap: 40000,
    icon: 'car-outline',
    tone: 'income',
  },
  {
    name: 'Restaurants & Dining',
    detail: 'Pacing: High · Triggered alert',
    spent: 60000,
    cap: 30000,
    icon: 'restaurant-outline',
    tone: 'expense',
  },
  {
    name: 'Utilities',
    detail: 'Pacing: On schedule',
    spent: 40900,
    cap: 50000,
    icon: 'flash-outline',
    tone: 'info',
  },
];

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

function formatAmount(amount: number): string {
  return formatMoney(money(amount, 'MAD'), { compactZeroFraction: true });
}

function ToneIcon({
  name,
  tone,
}: {
  name: IconName;
  tone: CategoryVelocity['tone'];
}): React.ReactElement {
  const { colors } = useTheme();
  const color = colors.semantic[tone];
  const backgroundColor =
    tone === 'income'
      ? colors.semantic.incomeLight
      : tone === 'expense'
        ? colors.semantic.expenseLight
        : tone === 'warning'
          ? colors.semantic.warningLight
          : colors.brand.accentLight;
  return (
    <View style={[styles.categoryIcon, { backgroundColor }]}>
      <DecorativeIcon name={name} size={15} color={color} />
    </View>
  );
}

export default function PlanningScreen(): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [isCorrectionApplied, setIsCorrectionApplied] = useState(false);
  const [newExpense, setNewExpense] = useState('');
  const [unplannedAmount, setUnplannedAmount] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const remainingFlexible = isCorrectionApplied ? 0 : -30000;
  const applyCorrection = () => {
    setIsCorrectionApplied(true);
    setNotice('Preview correction applied. No money was moved.');
  };
  const addUnplanned = () => {
    if (!newExpense.trim() || !unplannedAmount.trim()) return;
    setNotice(`${newExpense.trim()} was added to this local preview.`);
    setNewExpense('');
    setUnplannedAmount('');
  };

  return (
    <Screen contentContainerStyle={{ paddingTop: insets.top + 8 }}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={[styles.brandMark, { borderColor: colors.semantic.income }]}>
            <DecorativeIcon name="sparkles" size={13} color={colors.semantic.income} />
          </View>
          <Text
            style={[styles.brandName, { color: colors.text.primary, fontFamily: fontFamily.bold }]}
          >
            Lyvora
          </Text>
          <Text style={[styles.brandSection, { color: colors.text.tertiary }]}>| Plan</Text>
        </View>
        <Pressable
          accessibilityLabel="Plan notifications"
          accessibilityRole="button"
          hitSlop={6}
          style={({ pressed }) => [
            styles.headerButton,
            { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <DecorativeIcon name="notifications-outline" size={18} color={colors.text.secondary} />
        </Pressable>
      </View>

      <View style={styles.planTitleRow}>
        <View>
          <View style={styles.titleWithIcon}>
            <DecorativeIcon name="calendar-outline" size={17} color={colors.text.primary} />
            <Text style={[typography.h3, { color: colors.text.primary }]}>October Plan</Text>
          </View>
          <Text style={[styles.dayLine, { color: colors.text.tertiary }]}>
            Day 20 of 31 · 10 days remaining
          </Text>
        </View>
        <View style={[styles.rebalancePill, { backgroundColor: colors.background.tertiary }]}>
          <Text
            style={[
              styles.rebalanceText,
              { color: colors.text.secondary, fontFamily: fontFamily.medium },
            ]}
          >
            Active Rebalancing
          </Text>
        </View>
      </View>
      <View style={[styles.monthProgress, { backgroundColor: colors.border.subtle }]}>
        <View style={[styles.monthProgressFill, { backgroundColor: colors.semantic.info }]} />
      </View>

      <Card style={styles.summaryCard}>
        <BudgetSummary
          icon="checkmark-circle"
          label="Essentials"
          detail="Housing, Utilities, Groceries"
          amount="1,200 MAD left"
          progress={74}
          tone="income"
        />
        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
        <BudgetSummary
          icon="flash"
          label="Flexible Spending"
          detail="Dining, Entertainment, Lifestyle"
          amount={`${formatAmount(remainingFlexible)} ${isCorrectionApplied ? 'balanced' : 'over limit'}`}
          progress={100}
          tone="expense"
        />
      </Card>

      {!isCorrectionApplied ? (
        <Card style={[styles.correctionCard, { borderColor: colors.semantic.expense }]}>
          <View style={styles.correctionHeader}>
            <View style={[styles.alertPill, { backgroundColor: colors.semantic.expenseLight }]}>
              <DecorativeIcon name="warning" size={13} color={colors.semantic.expense} />
              <Text
                style={[
                  styles.alertText,
                  { color: colors.semantic.expense, fontFamily: fontFamily.semibold },
                ]}
              >
                ADAPTIVE CORRECTION NEEDED
              </Text>
            </View>
            <Text style={[styles.engineLabel, { color: colors.text.tertiary }]}>
              Forgiving Pacing OS
            </Text>
          </View>
          <Text
            style={[typography.bodySmall, styles.correctionCopy, { color: colors.text.secondary }]}
          >
            You have 10 days left, but you are 300 MAD over your Flexible spending limit due to
            dining out.
          </Text>
          <View style={[styles.proposal, { backgroundColor: colors.background.tertiary }]}>
            <DecorativeIcon name="sparkles" size={15} color={colors.semantic.info} />
            <Text style={[styles.proposalCopy, { color: colors.text.secondary }]}>
              Move 300 MAD from Emergency Buffer to cover this deficit without hurting your monthly
              motorcycle goal?
            </Text>
          </View>
          <View style={styles.correctionActions}>
            <Button
              label="Apply Fix (1-Tap)"
              onPress={applyCorrection}
              style={styles.fixButton}
              variant="secondary"
            />
            <Button
              label="Find Another Way"
              onPress={() => setNotice('Alternative reallocations are shown below.')}
              style={styles.fixButton}
              variant="text"
            />
          </View>
        </Card>
      ) : (
        <Card style={[styles.appliedCard, { borderColor: colors.semantic.income }]}>
          <DataNotice
            icon="checkmark-circle-outline"
            label="Your flexible-spending preview is balanced."
            tone="info"
          />
        </Card>
      )}

      <View style={styles.alternativeHeader}>
        <Text style={[typography.h4, { color: colors.text.primary }]}>
          Alternative Reallocations
        </Text>
        <Text style={[styles.previewLabel, { color: colors.text.tertiary }]}>Preview only</Text>
      </View>
      <Card style={styles.alternativesCard}>
        <Alternative label="Defer from Weekend Leisure budget" value="+300 MAD" />
        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
        <Alternative label="Deduct evenly over next month" value="-10 MAD/day" />
      </Card>

      <Text style={[typography.h4, styles.sectionTitle, { color: colors.text.primary }]}>
        Category Velocities
      </Text>
      <Text style={[styles.sectionSubtitle, { color: colors.text.tertiary }]}>
        Live pacing pulse
      </Text>
      <Card style={styles.velocityCard}>
        {categoryVelocities.map((category, index) => (
          <React.Fragment key={category.name}>
            <VelocityRow category={category} />
            {index < categoryVelocities.length - 1 && (
              <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
            )}
          </React.Fragment>
        ))}
      </Card>

      <Card style={[styles.engineCard, { backgroundColor: colors.background.tertiary }]}>
        <DecorativeIcon name="bulb-outline" size={16} color={colors.semantic.info} />
        <View style={styles.engineCopy}>
          <Text
            style={[
              styles.engineTitle,
              { color: colors.text.primary, fontFamily: fontFamily.medium },
            ]}
          >
            Lyvora Behavioral Finance Engine
          </Text>
          <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
            Adaptive budgeting rebalances your system so a single night out does not derail your
            annual trajectory.
          </Text>
        </View>
      </Card>

      <Card style={styles.manualCard}>
        <Text style={[typography.h4, { color: colors.text.primary }]}>
          Log an unplanned expense
        </Text>
        <View style={styles.manualFields}>
          <TextInput
            accessibilityLabel="Unplanned expense description"
            placeholder="Description"
            placeholderTextColor={colors.text.muted}
            onChangeText={setNewExpense}
            value={newExpense}
            style={[
              styles.input,
              {
                color: colors.text.primary,
                backgroundColor: colors.surface.input,
                borderColor: colors.border.default,
                fontFamily: fontFamily.regular,
              },
            ]}
          />
          <TextInput
            accessibilityLabel="Unplanned expense amount"
            keyboardType="decimal-pad"
            placeholder="MAD"
            placeholderTextColor={colors.text.muted}
            onChangeText={setUnplannedAmount}
            value={unplannedAmount}
            style={[
              styles.amountInput,
              {
                color: colors.text.primary,
                backgroundColor: colors.surface.input,
                borderColor: colors.border.default,
                fontFamily: fontFamily.regular,
              },
            ]}
          />
        </View>
        <Button
          disabled={!newExpense.trim() || !unplannedAmount.trim()}
          label="Add to preview"
          onPress={addUnplanned}
          variant="secondary"
        />
      </Card>
      {notice && <DataNotice label={notice} tone="info" />}
    </Screen>
  );
}

function BudgetSummary({
  icon,
  label,
  detail,
  amount,
  progress,
  tone,
}: {
  icon: IconName;
  label: string;
  detail: string;
  amount: string;
  progress: number;
  tone: 'income' | 'expense';
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  const color = colors.semantic[tone];
  return (
    <View style={styles.summaryRow}>
      <ToneIcon name={icon} tone={tone} />
      <View style={styles.summaryCopy}>
        <Text
          style={[
            styles.summaryLabel,
            { color: colors.text.primary, fontFamily: fontFamily.semibold },
          ]}
        >
          {label}
        </Text>
        <Text style={[styles.summaryDetail, { color: colors.text.tertiary }]}>{detail}</Text>
        <View style={[styles.pacingTrack, { backgroundColor: colors.border.subtle }]}>
          <View style={[styles.pacingFill, { backgroundColor: color, width: `${progress}%` }]} />
        </View>
      </View>
      <View style={styles.summaryAmount}>
        <Text style={[styles.summaryAmountText, { color, fontFamily: fontFamily.semibold }]}>
          {amount}
        </Text>
        <Text style={[styles.summaryDetail, { color: colors.text.tertiary }]}>
          {progress}% used
        </Text>
      </View>
    </View>
  );
}

function Alternative({ label, value }: { label: string; value: string }): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <Pressable
      accessibilityLabel={`${label}, ${value}`}
      accessibilityRole="button"
      style={({ pressed }) => [styles.alternativeRow, { opacity: pressed ? 0.72 : 1 }]}
    >
      <Text style={[styles.alternativeLabel, { color: colors.text.secondary }]}>{label}</Text>
      <Text
        style={[
          styles.alternativeValue,
          { color: colors.semantic.income, fontFamily: fontFamily.semibold },
        ]}
      >
        {value}
      </Text>
    </Pressable>
  );
}

function VelocityRow({ category }: { category: CategoryVelocity }): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  const color = colors.semantic[category.tone];
  const progress = Math.min(100, Math.round((category.spent / category.cap) * 100));
  return (
    <View style={styles.velocityRow}>
      <ToneIcon name={category.icon} tone={category.tone} />
      <View style={styles.velocityCopy}>
        <View style={styles.velocityTitleRow}>
          <Text
            style={[
              styles.velocityName,
              { color: colors.text.primary, fontFamily: fontFamily.medium },
            ]}
          >
            {category.name}
          </Text>
          <Text
            style={[
              styles.velocityAmount,
              { color: colors.text.secondary, fontFamily: fontFamily.medium },
            ]}
          >
            {formatAmount(category.spent)} / {formatAmount(category.cap)}
          </Text>
        </View>
        <Text style={[styles.velocityDetail, { color }]}>{category.detail}</Text>
        <View style={[styles.pacingTrack, { backgroundColor: colors.border.subtle }]}>
          <View style={[styles.pacingFill, { backgroundColor: color, width: `${progress}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  planTitleRow: {
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dayLine: { marginTop: 4, fontSize: 10, lineHeight: 14 },
  rebalancePill: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 4 },
  rebalanceText: { fontSize: 9, lineHeight: 13 },
  monthProgress: { height: 4, borderRadius: 2, marginTop: 12, overflow: 'hidden' },
  monthProgressFill: { height: 4, width: '65%', borderRadius: 2 },
  summaryCard: { marginTop: 16, padding: 12 },
  summaryRow: { minHeight: 65, flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCopy: { flex: 1, minWidth: 0 },
  summaryLabel: { fontSize: 12, lineHeight: 16 },
  summaryDetail: { marginTop: 2, fontSize: 9, lineHeight: 13 },
  summaryAmount: { width: 100, alignItems: 'flex-end' },
  summaryAmountText: { fontSize: 11, lineHeight: 15, textAlign: 'right' },
  divider: { height: 1, marginVertical: 10 },
  pacingTrack: { height: 4, borderRadius: 2, marginTop: 7, overflow: 'hidden' },
  pacingFill: { height: 4, borderRadius: 2 },
  correctionCard: { marginTop: 12, padding: 12 },
  correctionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 4,
  },
  alertText: { fontSize: 9, lineHeight: 13 },
  engineLabel: { fontSize: 9, lineHeight: 13, textAlign: 'right' },
  correctionCopy: { marginTop: 10, lineHeight: 19 },
  proposal: { marginTop: 10, padding: 9, borderRadius: 8, flexDirection: 'row', gap: 7 },
  proposalCopy: { flex: 1, fontSize: 11, lineHeight: 16 },
  correctionActions: { marginTop: 10, flexDirection: 'row', gap: 8 },
  fixButton: { flex: 1, paddingHorizontal: 8 },
  appliedCard: { marginTop: 12, padding: 14 },
  alternativeHeader: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewLabel: { fontSize: 10, lineHeight: 14 },
  alternativesCard: { marginTop: 8, paddingHorizontal: 12 },
  alternativeRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  alternativeLabel: { flex: 1, fontSize: 11, lineHeight: 16 },
  alternativeValue: { fontSize: 11, lineHeight: 16 },
  sectionTitle: { marginTop: 20 },
  sectionSubtitle: { marginTop: 2, fontSize: 10, lineHeight: 14 },
  velocityCard: { marginTop: 8, padding: 12 },
  velocityRow: { minHeight: 55, flexDirection: 'row', gap: 9 },
  velocityCopy: { flex: 1, minWidth: 0 },
  velocityTitleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  velocityName: { flex: 1, fontSize: 11, lineHeight: 15 },
  velocityAmount: { fontSize: 10, lineHeight: 14, fontVariant: ['tabular-nums'] },
  velocityDetail: { marginTop: 2, fontSize: 9, lineHeight: 13 },
  engineCard: { marginTop: 12, padding: 12, flexDirection: 'row', gap: 9 },
  engineCopy: { flex: 1, gap: 4 },
  engineTitle: { fontSize: 11, lineHeight: 15 },
  manualCard: { marginTop: 12, padding: 12, gap: 10 },
  manualFields: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  amountInput: {
    width: 88,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
  },
});
