import { formatMoney, money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, EmptyState, Screen } from '../../components/ui';
import { useTheme } from '../../theme/ThemeProvider';
import { type HomeTimelineEntry, type HomeViewModel, useHomeData } from './use-home-data';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type IconProps = React.ComponentProps<typeof Ionicons>;

function DecorativeIcon(props: IconProps): React.ReactElement {
  return (
    <Ionicons
      {...props}
      accessibilityElementsHidden
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    />
  );
}

function formatAmount(amount: number, currency: string, signed = false): string {
  return formatMoney(money(amount, currency), {
    compactZeroFraction: false,
    signDisplay: signed ? 'always' : 'auto',
  });
}

interface AuraHeaderProps {
  displayName: string;
  locationLabel: string;
  onInboxPress: () => void;
  onProfilePress: () => void;
}

function AuraHeader({
  displayName,
  locationLabel,
  onInboxPress,
  onProfilePress,
}: AuraHeaderProps): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();
  const avatarLabel = displayName.trim().charAt(0).toUpperCase() || '?';

  return (
    <View>
      <View style={styles.brandRow}>
        <View style={styles.brandIdentity}>
          <View style={[styles.brandMark, { borderColor: colors.semantic.income }]}>
            <DecorativeIcon name="sparkles" size={13} color={colors.semantic.income} />
          </View>
          <Text
            style={[styles.brandName, { color: colors.text.primary, fontFamily: fontFamily.bold }]}
          >
            Aura
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="Open AI Inbox"
            accessibilityRole="button"
            hitSlop={4}
            onPress={onInboxPress}
            style={({ pressed }) => [
              styles.headerIconButton,
              { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <DecorativeIcon
              name="notifications-outline"
              size={18}
              color={colors.text.secondary}
            />
            <View style={[styles.notificationDot, { backgroundColor: colors.semantic.info }]} />
          </Pressable>
          <Pressable
            accessibilityLabel="Open profile and settings"
            accessibilityRole="button"
            hitSlop={4}
            onPress={onProfilePress}
            style={({ pressed }) => [
              styles.avatar,
              {
                backgroundColor: colors.background.tertiary,
                borderColor: colors.border.default,
                opacity: pressed ? 0.72 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              {avatarLabel}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.greetingRow}>
        <View style={styles.greetingCopy}>
          <Text style={[typography.h3, { color: colors.text.primary }]}>
            Good evening, {displayName}
          </Text>
          <View style={styles.syncRow}>
            <View style={[styles.syncDot, { backgroundColor: colors.semantic.income }]} />
            <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
              {locationLabel}
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityLabel="Edit financial profile"
          accessibilityRole="button"
          hitSlop={4}
          onPress={onProfilePress}
          style={({ pressed }) => [
            styles.editButton,
            { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <DecorativeIcon name="pencil" size={16} color={colors.text.secondary} />
        </Pressable>
      </View>
    </View>
  );
}

function SnapshotCard({ model }: { model: HomeViewModel }): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();
  const safeAmount =
    model.safeToSpend === null ? 'Not ready' : formatAmount(model.safeToSpend, model.currency);

  return (
    <Card style={styles.snapshotCard}>
      <View style={styles.snapshotLabelRow}>
        <View style={styles.labelWithIcon}>
          <DecorativeIcon name="analytics" size={16} color={colors.semantic.info} />
          <Text
            style={[
              styles.eyebrow,
              { color: colors.text.secondary, fontFamily: fontFamily.semibold },
            ]}
          >
            SAFE-TO-SPEND
          </Text>
          <DecorativeIcon
            name="help-circle-outline"
            size={14}
            color={colors.text.muted}
          />
        </View>
        <Text
          style={[styles.horizon, { color: colors.text.tertiary, fontFamily: fontFamily.medium }]}
        >
          {model.horizonLabel}
        </Text>
      </View>

      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        numberOfLines={1}
        style={[
          styles.safeAmount,
          {
            color: model.safeToSpend === null ? colors.text.secondary : colors.text.primary,
            fontFamily: fontFamily.semibold,
          },
        ]}
      >
        {safeAmount}
      </Text>
      <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
        {model.safeToSpendDetail}
      </Text>

      <View style={[styles.snapshotDivider, { backgroundColor: colors.border.subtle }]} />
      <View style={styles.metricRow}>
        <SnapshotMetric
          label="Available"
          amount={model.available}
          currency={model.currency}
          dotColor={colors.semantic.income}
        />
        <SnapshotMetric
          label="Upcoming"
          amount={model.upcoming}
          currency={model.currency}
          dotColor={colors.semantic.warning}
        />
        <SnapshotMetric
          label="Savings"
          amount={model.savings}
          currency={model.currency}
          dotColor={colors.semantic.info}
        />
      </View>

      <View style={styles.healthMetaRow}>
        <View style={[styles.healthPill, { backgroundColor: colors.semantic.incomeLight }]}>
          <DecorativeIcon name="pulse" size={13} color={colors.semantic.income} />
          <Text
            style={[
              styles.healthPillText,
              { color: colors.semantic.income, fontFamily: fontFamily.semibold },
            ]}
          >
            {model.healthScore === null
              ? 'Health pending'
              : `${model.healthScore}/100 Financial Health`}
          </Text>
        </View>
        <Text
          style={[
            styles.pulseLabel,
            { color: colors.text.tertiary, fontFamily: fontFamily.medium },
          ]}
        >
          Aura Pulse
        </Text>
      </View>
    </Card>
  );
}

interface SnapshotMetricProps {
  label: string;
  amount: number;
  currency: string;
  dotColor: string;
}

function SnapshotMetric({
  label,
  amount,
  currency,
  dotColor,
}: SnapshotMetricProps): React.ReactElement {
  const { colors, fontFamily } = useTheme();

  return (
    <View style={styles.metricItem}>
      <View style={[styles.metricDot, { backgroundColor: dotColor }]} />
      <Text style={[styles.metricLabel, { color: colors.text.tertiary }]}>{label}</Text>
      <Text
        numberOfLines={1}
        style={[styles.metricAmount, { color: colors.text.primary, fontFamily: fontFamily.medium }]}
      >
        {formatAmount(amount, currency)}
      </Text>
    </View>
  );
}

function HealthInsight({ model }: { model: HomeViewModel }): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();
  const score = model.healthScore;

  return (
    <View style={styles.insightRow}>
      <View
        style={[
          styles.healthRing,
          { borderColor: score === null ? colors.border.strong : colors.semantic.income },
        ]}
      >
        <Text
          style={[
            styles.healthRingText,
            { color: colors.text.primary, fontFamily: fontFamily.semibold },
          ]}
        >
          {score === null ? '--' : `${score}%`}
        </Text>
      </View>
      <Text style={[typography.bodySmall, styles.insightCopy, { color: colors.text.secondary }]}>
        <Text style={{ color: colors.semantic.info, fontFamily: fontFamily.semibold }}>
          AI Insight:{' '}
        </Text>
        {model.healthInsight}
      </Text>
    </View>
  );
}

interface InboxCardProps {
  model: HomeViewModel;
  onReview: () => void;
}

function InboxCard({ model, onReview }: InboxCardProps): React.ReactElement | null {
  const { colors, fontFamily, typography } = useTheme();
  if (!model.inboxItem) return null;

  return (
    <Card style={[styles.inboxCard, { borderColor: colors.brand.accent }]}>
      <View style={styles.inboxHeader}>
        <View style={[styles.inboxPill, { backgroundColor: colors.brand.accentLight }]}>
          <DecorativeIcon name="sparkles" size={13} color={colors.semantic.info} />
          <Text
            style={[
              styles.inboxPillText,
              { color: colors.semantic.info, fontFamily: fontFamily.semibold },
            ]}
          >
            AI INBOX · ACTION REQUIRED
          </Text>
        </View>
        <Text style={[styles.inboxType, { color: colors.text.tertiary }]}>Recurring bill</Text>
      </View>

      <View style={styles.inboxContent}>
        <View style={[styles.inboxIcon, { backgroundColor: colors.background.tertiary }]}>
          <DecorativeIcon
            name="card-outline"
            size={18}
            color={colors.text.secondary}
          />
        </View>
        <View style={styles.inboxCopy}>
          <Text
            style={[
              typography.bodyMedium,
              { color: colors.text.primary, fontFamily: fontFamily.semibold },
            ]}
          >
            {model.inboxItem.title}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
            {model.inboxItem.detail}
          </Text>
        </View>
      </View>

      <View style={styles.inboxActions}>
        <Button label="Review tier" onPress={onReview} style={styles.inboxButton} variant="text" />
        <Button
          disabled={model.status === 'preview'}
          label={model.status === 'preview' ? 'Preview only' : 'Accept change'}
          onPress={onReview}
          style={styles.inboxButton}
          variant="secondary"
        />
      </View>
    </Card>
  );
}

function Timeline({ model }: { model: HomeViewModel }): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();

  return (
    <Card style={styles.timelineCard}>
      <View style={styles.timelineHeader}>
        <View style={[styles.labelWithIcon, styles.timelineHeading]}>
          <DecorativeIcon name="trending-up" size={17} color={colors.text.primary} />
          <Text style={[typography.h4, styles.timelineHeadingText, { color: colors.text.primary }]}>
            Continuum Timeline
          </Text>
        </View>
        <Text
          style={[
            styles.timelineMode,
            { color: colors.text.tertiary, fontFamily: fontFamily.medium },
          ]}
        >
          Past · Projected
        </Text>
      </View>

      {model.timeline.length === 0 ? (
        <EmptyState
          description="Transactions and upcoming commitments will form your timeline."
          icon="git-commit-outline"
          title="No timeline activity"
        />
      ) : (
        <View style={styles.timelineList}>
          {model.timeline.map((entry, index) => (
            <TimelineRow
              entry={entry}
              isLast={index === model.timeline.length - 1}
              key={entry.id}
            />
          ))}
        </View>
      )}

      <View
        style={[
          styles.forecastCard,
          { backgroundColor: colors.background.tertiary, borderColor: colors.border.default },
        ]}
      >
        <View style={styles.forecastHeader}>
          <View style={[styles.labelWithIcon, styles.forecastHeading]}>
            <DecorativeIcon name="stats-chart" size={16} color={colors.semantic.info} />
            <Text
              style={[
                styles.forecastDate,
                { color: colors.text.secondary, fontFamily: fontFamily.medium },
              ]}
            >
              End-of-Month Forecast
            </Text>
          </View>
          {model.forecastConfidence !== null && (
            <Text
              style={[
                styles.confidence,
                { color: colors.semantic.income, fontFamily: fontFamily.semibold },
              ]}
            >
              {model.forecastConfidence}% confidence
            </Text>
          )}
        </View>
        <View style={styles.forecastAmountRow}>
          <Text
            style={[typography.bodySmall, styles.forecastLabel, { color: colors.text.tertiary }]}
          >
            Anticipated carryover liquidity
          </Text>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            numberOfLines={1}
            style={[
              styles.forecastAmount,
              { color: colors.text.primary, fontFamily: fontFamily.semibold },
            ]}
          >
            {model.forecastAmount === null
              ? 'Setup required'
              : formatAmount(model.forecastAmount, model.currency)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

function TimelineRow({
  entry,
  isLast,
}: {
  entry: HomeTimelineEntry;
  isLast: boolean;
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  const stateColor = entry.projected ? colors.semantic.income : colors.text.tertiary;
  const signedAmount = entry.direction === 'expense' ? -entry.amount : entry.amount;

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <View style={[styles.timelineDot, { backgroundColor: stateColor }]} />
        {!isLast && (
          <View style={[styles.timelineLine, { backgroundColor: colors.border.strong }]} />
        )}
      </View>
      <View style={styles.timelineCopy}>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.78}
          numberOfLines={1}
          style={[
            styles.timelineTitle,
            { color: colors.text.primary, fontFamily: fontFamily.medium },
          ]}
        >
          {entry.title}
        </Text>
        <Text style={[styles.timelineSubtitle, { color: colors.text.tertiary }]}>
          {entry.subtitle}
        </Text>
      </View>
      <View style={styles.timelineMeta}>
        <View
          style={[
            styles.datePill,
            {
              backgroundColor: entry.projected
                ? colors.semantic.incomeLight
                : colors.background.tertiary,
            },
          ]}
        >
          <Text style={[styles.datePillText, { color: stateColor, fontFamily: fontFamily.medium }]}>
            {entry.dateLabel}
          </Text>
        </View>
        <Text
          style={[
            styles.timelineAmount,
            {
              color: entry.direction === 'income' ? colors.semantic.income : colors.text.primary,
              fontFamily: fontFamily.semibold,
            },
          ]}
        >
          {formatAmount(signedAmount, entry.currency, true)}
        </Text>
        <Text style={[styles.timelineState, { color: colors.text.tertiary }]}>{entry.state}</Text>
      </View>
    </View>
  );
}

interface ActionTileProps {
  icon: IconName;
  label: string;
  detail: string;
  onPress: () => void;
}

function ActionTile({ icon, label, detail, onPress }: ActionTileProps): React.ReactElement {
  const { colors, fontFamily } = useTheme();

  return (
    <Pressable
      accessibilityLabel={`${label}. ${detail}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionTile,
        {
          backgroundColor: colors.background.card,
          borderColor: colors.border.default,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: colors.background.tertiary }]}>
        <DecorativeIcon name={icon} size={17} color={colors.text.secondary} />
      </View>
      <View style={styles.actionCopy}>
        <Text
          style={[
            styles.actionLabel,
            { color: colors.text.primary, fontFamily: fontFamily.medium },
          ]}
        >
          {label}
        </Text>
        <Text style={[styles.actionDetail, { color: colors.text.tertiary }]}>{detail}</Text>
      </View>
    </Pressable>
  );
}

export function HomeScreen(): React.ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useTheme();
  const { model, isLoading, isRefreshing, error, refresh } = useHomeData();

  const openAssistant = () => router.push('/(tabs)/assistant');

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
      {error ? (
        <Card style={styles.errorCard}>
          <DataNotice icon="cloud-offline-outline" label={error} tone="expense" />
          <Button label="Try again" onPress={refresh} variant="secondary" />
        </Card>
      ) : isLoading || !model ? (
        <View accessibilityLabel="Loading financial command center" style={styles.loadingState}>
          <ActivityIndicator color={colors.semantic.info} />
          <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
            Synchronizing Aura
          </Text>
        </View>
      ) : model.status === 'empty' ? (
        <>
          <AuraHeader
            displayName={model.displayName}
            locationLabel={model.locationLabel}
            onInboxPress={openAssistant}
            onProfilePress={() => router.push('/settings')}
          />
          <Card style={styles.emptyCard}>
            <EmptyState
              actionLabel="Add your first transaction"
              description="Add an account or transaction to start building your financial command center."
              icon="wallet-outline"
              onAction={() => router.push('/modal')}
              title="Your financial picture starts here"
            />
          </Card>
        </>
      ) : (
        <>
          <AuraHeader
            displayName={model.displayName}
            locationLabel={model.locationLabel}
            onInboxPress={openAssistant}
            onProfilePress={() => router.push('/settings')}
          />
          <SnapshotCard model={model} />
          <HealthInsight model={model} />
          <InboxCard model={model} onReview={openAssistant} />
          <Timeline model={model} />
          <View style={styles.actionRow}>
            <ActionTile
              detail="Log cash outflow"
              icon="add"
              label="Manual Entry"
              onPress={() => router.push('/modal')}
            />
            <ActionTile
              detail="Add to a reserve"
              icon="trending-up"
              label="Boost Goal"
              onPress={() => router.push('/(tabs)/goals')}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandIdentity: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 14, lineHeight: 20 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: { position: 'absolute', width: 5, height: 5, borderRadius: 3, right: 9, top: 8 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, lineHeight: 18 },
  greetingRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  greetingCopy: { flex: 1, gap: 4 },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  syncDot: { width: 5, height: 5, borderRadius: 3 },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snapshotCard: { marginTop: 18, padding: 16 },
  snapshotLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  labelWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eyebrow: { fontSize: 10, lineHeight: 14 },
  horizon: { flexShrink: 1, fontSize: 10, lineHeight: 14, textAlign: 'right' },
  safeAmount: { marginTop: 8, fontSize: 34, lineHeight: 40, fontVariant: ['tabular-nums'] },
  snapshotDivider: { height: 1, marginVertical: 14 },
  metricRow: { flexDirection: 'row', gap: 8 },
  metricItem: { flex: 1, minWidth: 0 },
  metricDot: { width: 5, height: 5, borderRadius: 3, marginBottom: 5 },
  metricLabel: { fontSize: 10, lineHeight: 14 },
  metricAmount: { marginTop: 2, fontSize: 10, lineHeight: 14, fontVariant: ['tabular-nums'] },
  healthMetaRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthPill: {
    minHeight: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  healthPillText: { fontSize: 10, lineHeight: 14 },
  pulseLabel: { fontSize: 10, lineHeight: 14 },
  insightRow: {
    paddingHorizontal: 5,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  healthRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthRingText: { fontSize: 10, lineHeight: 14 },
  insightCopy: { flex: 1 },
  inboxCard: { padding: 14 },
  inboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  inboxPill: {
    minHeight: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  inboxPillText: { fontSize: 9, lineHeight: 13 },
  inboxType: { fontSize: 10, lineHeight: 14 },
  inboxContent: { marginTop: 14, flexDirection: 'row', gap: 10 },
  inboxIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inboxCopy: { flex: 1, gap: 4 },
  inboxActions: { marginTop: 14, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  inboxButton: { minHeight: 48, paddingHorizontal: 12 },
  timelineCard: { marginTop: 12, padding: 14 },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  timelineHeading: { flexShrink: 1, minWidth: 0 },
  timelineHeadingText: { flexShrink: 1 },
  timelineMode: { fontSize: 10, lineHeight: 14 },
  timelineList: { marginTop: 14 },
  timelineRow: { minHeight: 58, flexDirection: 'row' },
  timelineRail: { width: 18, alignItems: 'center' },
  timelineDot: { width: 7, height: 7, borderRadius: 4, marginTop: 6 },
  timelineLine: { width: 1, flex: 1, marginVertical: 4 },
  timelineCopy: { flex: 1, paddingRight: 8, paddingBottom: 12 },
  timelineTitle: { fontSize: 12, lineHeight: 16 },
  timelineSubtitle: { marginTop: 2, fontSize: 10, lineHeight: 14 },
  timelineMeta: { width: 108, alignItems: 'flex-end', paddingBottom: 12 },
  datePill: { minHeight: 20, paddingHorizontal: 7, borderRadius: 10, justifyContent: 'center' },
  datePillText: { fontSize: 9, lineHeight: 13 },
  timelineAmount: { marginTop: 3, fontSize: 11, lineHeight: 15, fontVariant: ['tabular-nums'] },
  timelineState: { fontSize: 9, lineHeight: 13, textTransform: 'capitalize' },
  forecastCard: { borderWidth: 1, borderRadius: 8, padding: 12 },
  forecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  forecastHeading: { flexShrink: 1, minWidth: 0 },
  forecastDate: { fontSize: 11, lineHeight: 15 },
  confidence: { fontSize: 9, lineHeight: 13 },
  forecastAmountRow: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 4,
    gap: 8,
  },
  forecastLabel: { flexGrow: 1, flexShrink: 1, minWidth: 160 },
  forecastAmount: { flexShrink: 0, fontSize: 14, lineHeight: 20, fontVariant: ['tabular-nums'] },
  actionRow: { marginTop: 12, flexDirection: 'row', gap: 10 },
  actionTile: {
    flex: 1,
    minHeight: 64,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: { flex: 1 },
  actionLabel: { fontSize: 11, lineHeight: 15 },
  actionDetail: { marginTop: 2, fontSize: 9, lineHeight: 13 },
  loadingState: { minHeight: 560, alignItems: 'center', justifyContent: 'center', gap: 10 },
  errorCard: { marginTop: 80, padding: 16, gap: 16 },
  emptyCard: { marginTop: 24 },
});
