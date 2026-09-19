import { formatMoney, money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, Screen } from '../../../src/components/ui';
import { useTheme } from '../../../src/theme/ThemeProvider';

const amount = (value: number) => formatMoney(money(value, 'MAD'), { compactZeroFraction: true });

type Resolution = 'a' | 'b';

function Icon(props: React.ComponentProps<typeof Ionicons>): React.ReactElement {
  return (
    <Ionicons
      {...props}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

export default function GoalStrategyScreen(): React.ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [prepared, setPrepared] = useState(false);
  const isPreview = !id || id === 'preview';
  const goalName = isPreview ? 'Ultimate M3 Max PC Setup' : 'Selected capital target';

  return (
    <Screen contentContainerStyle={{ paddingTop: insets.top + 8 }}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.headerButton,
            { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Icon name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text
            style={[
              styles.headerTitle,
              { color: colors.text.primary, fontFamily: fontFamily.semibold },
            ]}
          >
            Deterministic Plan
          </Text>
          <Text style={[styles.headerSub, { color: colors.text.tertiary }]}>
            Strategy & Trajectory
          </Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      <Text
        style={[styles.eyebrow, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}
      >
        HARDWARE ARCHITECTURE · PREVIEW
      </Text>
      <Text style={[typography.h2, { color: colors.text.primary, marginTop: 5 }]}>{goalName}</Text>
      <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 3 }]}>
        Hardware Rig · Productivity Station
      </Text>
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { borderColor: colors.semantic.info }]}>
          <Text style={[styles.badgeText, { color: colors.semantic.info }]}>TIER 01</Text>
        </View>
        <View style={[styles.badge, { borderColor: colors.semantic.income }]}>
          <Text style={[styles.badgeText, { color: colors.semantic.income }]}>YIELD-OPTIMIZED</Text>
        </View>
      </View>
      <DataNotice
        icon="eye-outline"
        label="Design preview · strategy guidance is sample data and changes nothing"
        tone="info"
      />

      <Card style={styles.heroCard}>
        <View style={styles.heroColumns}>
          <View style={styles.flex}>
            <Text style={[styles.label, { color: colors.text.tertiary }]}>SAVED TO DATE</Text>
            <Text
              style={[
                styles.heroAmount,
                { color: colors.semantic.income, fontFamily: fontFamily.semibold },
              ]}
            >
              {amount(500000)}
            </Text>
          </View>
          <View style={styles.flex}>
            <Text style={[styles.label, { color: colors.text.tertiary }]}>REMAINING GAP</Text>
            <Text
              style={[
                styles.heroAmount,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              {amount(1000000)}
            </Text>
          </View>
        </View>
        <View style={styles.progressRow}>
          <Text style={[styles.progressLabel, { color: colors.semantic.info }]}>33% Funded</Text>
          <Text style={[styles.progressLabel, { color: colors.text.tertiary }]}>
            Target: {amount(1500000)}
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.border.subtle }]}>
          <View style={[styles.fill, { backgroundColor: colors.semantic.info, width: '33%' }]} />
        </View>
      </Card>

      <Text
        style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
      >
        Algorithmic trajectory audit
      </Text>
      <Card style={styles.card}>
        <AuditRow label="TARGET DATE" tone="info" value="June 2027" />
        <AuditRow label="REQUIRED RUN-RATE" tone="info" value={`${amount(111000)} / mo`} />
        <AuditRow label="CURRENT VELOCITY" last tone="warning" value={`${amount(100000)} / mo`} />
      </Card>
      <Card style={[styles.warningCard, { borderColor: colors.semantic.warning }]}>
        <Icon name="warning-outline" size={18} color={colors.semantic.warning} />
        <Text style={[typography.bodySmall, styles.flex, { color: colors.text.secondary }]}>
          At your current velocity, you will miss your target milestone by 1.1 months. Projected
          completion shifts to July 2027.
        </Text>
      </Card>

      <Text
        style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
      >
        Resolution engine
      </Text>
      <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 2 }]}>
        Choose your path
      </Text>
      <ResolutionOption
        active={resolution === 'a'}
        badge="OPTIMAL"
        detail="Auto-divert 110 MAD/mo from Flexible Leisure & Dining to this envelope. Locks the June 2027 launch without depleting reserves."
        icon="flash-outline"
        onPress={() => {
          setResolution('a');
          setPrepared(false);
        }}
        outcome="Zero deadline slippage"
        title="Option A · Active Rebalance"
        tone="income"
      />
      <ResolutionOption
        active={resolution === 'b'}
        badge="+34 DAYS"
        detail="Maintains current 1,000 MAD/mo pacing. Absorbs the 34-day delay smoothly to keep day-to-day spending exactly as configured."
        icon="time-outline"
        onPress={() => {
          setResolution('b');
          setPrepared(false);
        }}
        outcome="Preserve lifestyle budgets"
        title="Option B · Pacing Acceptance"
        tone="warning"
      />
      {resolution && !prepared && (
        <Button
          icon="lock-closed-outline"
          label={
            resolution === 'a' ? 'Select Option A & lock target' : 'Accept July 2027 deadline'
          }
          onPress={() => setPrepared(true)}
          style={styles.action}
        />
      )}
      {prepared && (
        <Card style={styles.confirmation}>
          <DataNotice
            icon="checkmark-circle-outline"
            label="Resolution prepared locally for review. No goal, envelope, or transfer was changed."
            tone="info"
          />
        </Card>
      )}

      <Text
        style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
      >
        Projected balance sequence
      </Text>
      <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 2 }]}>
        Step model
      </Text>
      <Card style={styles.card}>
        <SequenceRow detail="Auto-Sweep + Salary Cycle" period="October 2024" value={611000} />
        <SequenceRow detail="Compound Yield Credit" period="November 2024" value={722000} />
        <SequenceRow detail="End-of-Year Rebalance" period="December 2024" value={833000} />
        <SequenceRow detail="Home Stretch Inflow" period="Q1 2027" value={1166000} />
        <SequenceRow
          detail="Target 100% Capitalized Rig"
          highlight
          last
          period="June 2027"
          value={1500000}
        />
      </Card>

      <Text
        style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
      >
        Automated pipeline
      </Text>
      <Card style={styles.card}>
        <View style={styles.pipelineRow}>
          <View style={[styles.iconSmall, { backgroundColor: colors.semantic.incomeLight }]}>
            <Icon name="swap-horizontal-outline" size={17} color={colors.semantic.income} />
          </View>
          <View style={styles.flex}>
            <Text
              style={[
                styles.rowTitle,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              Attijariwafa Checking Auto-Sweep
            </Text>
            <Text style={[styles.rowDetail, { color: colors.text.tertiary }]}>
              Next execution {amount(100000)} on Oct 1
            </Text>
          </View>
          <Text style={[styles.pipelineStatus, { color: colors.semantic.income }]}>ACTIVE</Text>
        </View>
        <View style={styles.pipelineRow}>
          <View style={[styles.iconSmall, { backgroundColor: colors.brand.accentLight }]}>
            <Icon name="trending-up-outline" size={17} color={colors.semantic.info} />
          </View>
          <View style={styles.flex}>
            <Text
              style={[
                styles.rowTitle,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              Sinking Vault Yield
            </Text>
            <Text style={[styles.rowDetail, { color: colors.text.tertiary }]}>
              Compound APY · preview reference
            </Text>
          </View>
          <Text style={[styles.pipelineStatus, { color: colors.semantic.info }]}>4.15%</Text>
        </View>
      </Card>
    </Screen>
  );
}

function AuditRow({
  label,
  last = false,
  tone,
  value,
}: {
  label: string;
  last?: boolean;
  tone: 'info' | 'warning';
  value: string;
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View
      style={[
        styles.auditRow,
        !last && { borderBottomColor: colors.border.subtle, borderBottomWidth: 1 },
      ]}
    >
      <Text style={[styles.label, { color: colors.text.tertiary }]}>{label}</Text>
      <Text
        style={[
          styles.auditValue,
          { color: colors.semantic[tone], fontFamily: fontFamily.semibold },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function ResolutionOption({
  active,
  badge,
  detail,
  icon,
  onPress,
  outcome,
  title,
  tone,
}: {
  active: boolean;
  badge: string;
  detail: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  outcome: string;
  title: string;
  tone: 'income' | 'warning';
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  const color = colors.semantic[tone];
  return (
    <Pressable
      accessibilityLabel={`${title}. ${outcome}`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        {
          borderColor: active ? color : colors.border.default,
          backgroundColor: colors.background.card,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <View style={styles.optionHeader}>
        <View
          style={[
            styles.iconSmall,
            {
              backgroundColor:
                tone === 'income' ? colors.semantic.incomeLight : colors.semantic.warningLight,
            },
          ]}
        >
          <Icon name={icon} size={17} color={color} />
        </View>
        <View style={styles.flex}>
          <Text
            style={[
              styles.rowTitle,
              { color: colors.text.primary, fontFamily: fontFamily.semibold },
            ]}
          >
            {title}
          </Text>
          <Text style={[styles.rowDetail, { color: colors.text.tertiary }]}>{outcome}</Text>
        </View>
        <View style={[styles.badge, { borderColor: color }]}>
          <Text style={[styles.badgeText, { color }]}>{badge}</Text>
        </View>
      </View>
      <Text style={[styles.optionDetail, { color: colors.text.secondary }]}>{detail}</Text>
    </Pressable>
  );
}

function SequenceRow({
  detail,
  highlight = false,
  last = false,
  period,
  value,
}: {
  detail: string;
  highlight?: boolean;
  last?: boolean;
  period: string;
  value: number;
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View
      style={[
        styles.sequenceRow,
        !last && { borderBottomColor: colors.border.subtle, borderBottomWidth: 1 },
      ]}
    >
      <View
        style={[
          styles.sequenceDot,
          { backgroundColor: highlight ? colors.semantic.income : colors.border.strong },
        ]}
      />
      <View style={styles.flex}>
        <Text
          style={[
            styles.rowTitle,
            { color: colors.text.primary, fontFamily: fontFamily.semibold },
          ]}
        >
          {period}
        </Text>
        <Text style={[styles.rowDetail, { color: colors.text.tertiary }]}>{detail}</Text>
      </View>
      <Text
        style={[
          styles.sequenceValue,
          {
            color: highlight ? colors.semantic.income : colors.text.primary,
            fontFamily: fontFamily.semibold,
          },
        ]}
      >
        {amount(value)}
      </Text>
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
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 13, lineHeight: 18 },
  headerSub: { fontSize: 10, lineHeight: 14 },
  eyebrow: { marginTop: 20, fontSize: 10, lineHeight: 14 },
  badgeRow: { marginTop: 10, flexDirection: 'row', gap: 8 },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 9, lineHeight: 13, letterSpacing: 0.5 },
  heroCard: { marginTop: 14, padding: 14 },
  heroColumns: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  label: { fontSize: 9, lineHeight: 13, letterSpacing: 0.5 },
  heroAmount: { marginTop: 3, fontSize: 20, lineHeight: 26, fontVariant: ['tabular-nums'] },
  progressRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 10, lineHeight: 14 },
  track: { height: 7, marginTop: 6, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  section: { marginTop: 22, fontSize: 16, lineHeight: 22 },
  card: { marginTop: 8, paddingHorizontal: 12 },
  auditRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  auditValue: { fontSize: 12, lineHeight: 17, fontVariant: ['tabular-nums'] },
  warningCard: { marginTop: 10, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'center' },
  option: { marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 12 },
  optionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  optionDetail: { marginTop: 8, fontSize: 10, lineHeight: 15 },
  iconSmall: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 12, lineHeight: 17 },
  rowDetail: { marginTop: 2, fontSize: 10, lineHeight: 14 },
  action: { marginTop: 12 },
  confirmation: { marginTop: 12, padding: 14 },
  sequenceRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sequenceDot: { width: 8, height: 8, borderRadius: 4 },
  sequenceValue: { fontSize: 12, lineHeight: 17, fontVariant: ['tabular-nums'] },
  pipelineRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10 },
  pipelineStatus: { fontSize: 9, lineHeight: 14 },
});
