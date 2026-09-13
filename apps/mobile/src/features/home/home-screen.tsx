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

interface LyvoraHeaderProps {
  displayName: string;
  locationLabel: string;
  onInboxPress: () => void;
  onProfilePress: () => void;
}

function LyvoraHeader({
  displayName,
  locationLabel,
  onInboxPress,
  onProfilePress,
}: LyvoraHeaderProps): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();
  const avatarLabel = displayName.trim().charAt(0).toUpperCase() || 'B';

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
            Lyvora
          </Text>
          <Text
            style={[styles.brandSub, { color: colors.text.tertiary, fontFamily: fontFamily.regular }]}
          >
            | Home
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="Open AI Inbox"
            accessibilityRole="button"
            hitSlop={6}
            onPress={onInboxPress}
            style={({ pressed }) => [
              styles.headerIconButton,
              { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <DecorativeIcon
              name="notifications-outline"
              size={19}
              color={colors.text.secondary}
            />
            <View style={[styles.notificationDot, { backgroundColor: colors.semantic.info }]} />
          </Pressable>
          <Pressable
            accessibilityLabel="Open profile and settings"
            accessibilityRole="button"
            hitSlop={6}
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
          <View style={styles.greetingTitleRow}>
            <Text style={[typography.h3, { color: colors.text.primary, fontFamily: fontFamily.bold }]}>
              Good evening, {displayName}
            </Text>
            <Text style={styles.waveEmoji}>👋</Text>
          </View>
          <View style={styles.syncRow}>
            <View style={[styles.syncDot, { backgroundColor: colors.semantic.income }]} />
            <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
              {locationLabel}
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityLabel="View financial insights"
          accessibilityRole="button"
          hitSlop={6}
          onPress={onInboxPress}
          style={({ pressed }) => [
            styles.insightsButton,
            { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <DecorativeIcon name="analytics" size={18} color={colors.semantic.info} />
        </Pressable>
      </View>
    </View>
  );
}

function SnapshotCard({ model }: { model: HomeViewModel }): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();
  const safeNumberOnly =
    model.safeToSpend === null ? 'Not ready' : (model.safeToSpend / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <Card style={[styles.snapshotCard, { backgroundColor: '#292A2D', borderColor: '#343538' }]}>
      <View style={styles.snapshotLabelRow}>
        <View style={styles.labelWithIcon}>
          <Text
            style={[
              styles.eyebrow,
              { color: colors.text.tertiary, fontFamily: fontFamily.semibold },
            ]}
          >
            SAFE-TO-SPEND
          </Text>
          <DecorativeIcon
            name="help-circle-outline"
            size={13}
            color={colors.text.tertiary}
          />
        </View>
        <View style={[styles.horizonPill, { backgroundColor: '#1F1F23' }]}>
          <Text
            style={[styles.horizon, { color: colors.semantic.info, fontFamily: fontFamily.medium }]}
          >
            {model.horizonLabel}
          </Text>
        </View>
      </View>

      <View style={styles.heroAmountRow}>
        <Text style={[styles.heroCurrency, { color: colors.text.tertiary, fontFamily: fontFamily.medium }]}>
          {model.currency}
        </Text>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          numberOfLines={1}
          style={[
            styles.safeAmount,
            {
              color: model.safeToSpend === null ? colors.text.secondary : colors.text.primary,
              fontFamily: fontFamily.bold,
            },
          ]}
        >
          {safeNumberOnly}
        </Text>
      </View>
      <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 2 }]}>
        {model.safeToSpendDetail}
      </Text>

      {/* Telemetry Pill Bar */}
      <View style={[styles.telemetryBar, { backgroundColor: '#1B1B1F' }]}>
        <View style={styles.telemetryItem}>
          <View style={[styles.metricDot, { backgroundColor: colors.semantic.income }]} />
          <Text style={[styles.telemetryLabel, { color: colors.text.tertiary }]}>Available:</Text>
          <Text style={[styles.telemetryValue, { color: colors.text.primary, fontFamily: fontFamily.medium }]}>
            {formatAmount(model.available, model.currency)}
          </Text>
        </View>
        <Text style={[styles.telemetrySep, { color: colors.border.strong }]}>·</Text>
        <View style={styles.telemetryItem}>
          <View style={[styles.metricDot, { backgroundColor: colors.semantic.info }]} />
          <Text style={[styles.telemetryLabel, { color: colors.text.tertiary }]}>Upcoming:</Text>
          <Text style={[styles.telemetryValue, { color: colors.text.primary, fontFamily: fontFamily.medium }]}>
            {formatAmount(model.upcoming, model.currency)}
          </Text>
        </View>
        <Text style={[styles.telemetrySep, { color: colors.border.strong }]}>·</Text>
        <View style={styles.telemetryItem}>
          <View style={[styles.metricDot, { backgroundColor: colors.text.secondary }]} />
          <Text style={[styles.telemetryLabel, { color: colors.text.tertiary }]}>Savings:</Text>
          <Text style={[styles.telemetryValue, { color: colors.text.primary, fontFamily: fontFamily.medium }]}>
            {formatAmount(model.savings, model.currency)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

function HealthCard({ model }: { model: HomeViewModel }): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();
  const score = model.healthScore;

  return (
    <Card style={[styles.healthCard, { backgroundColor: '#1F1F23', borderColor: '#292A2D' }]}>
      <View style={styles.healthHeader}>
        <View style={[styles.healthPill, { backgroundColor: 'rgba(78, 222, 163, 0.15)' }]}>
          <View style={[styles.syncDot, { backgroundColor: colors.semantic.income }]} />
          <Text
            style={[
              styles.healthPillText,
              { color: colors.semantic.income, fontFamily: fontFamily.semibold },
            ]}
          >
            {score === null ? 'Health pending' : `${score}/100 Financial Health`}
          </Text>
        </View>
        <Text
          style={[
            styles.pulseLabel,
            { color: colors.text.tertiary, fontFamily: fontFamily.medium },
          ]}
        >
          Lyvora Pulse™
        </Text>
      </View>

      <View style={styles.healthContentRow}>
        <View
          style={[
            styles.healthRing,
            { borderColor: score === null ? colors.border.strong : colors.semantic.income },
          ]}
        >
          <Text
            style={[
              styles.healthRingText,
              { color: colors.text.primary, fontFamily: fontFamily.bold },
            ]}
          >
            {score === null ? '--' : `${score}%`}
          </Text>
        </View>
        <View style={[styles.healthInsightBox, { backgroundColor: '#1B1B1F' }]}>
          <Text style={[typography.bodySmall, { color: colors.text.primary, lineHeight: 18 }]}>
            <Text style={{ color: colors.semantic.info, fontFamily: fontFamily.semibold }}>
              AI Insight:{' '}
            </Text>
            Spending is{' '}
            <Text style={{ color: colors.semantic.income, fontFamily: fontFamily.semibold }}>
              8% below
            </Text>{' '}
            your monthly average, and you've achieved{' '}
            <Text style={{ color: colors.semantic.income, fontFamily: fontFamily.semibold }}>
              70%
            </Text>{' '}
            of your active motorcycle savings reserve.
          </Text>
        </View>
      </View>
    </Card>
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
    <Card style={[styles.inboxCard, { backgroundColor: '#292A2D', borderColor: '#343538' }]}>
      <View style={styles.inboxHeader}>
        <View style={[styles.inboxPill, { backgroundColor: 'rgba(192, 193, 255, 0.15)' }]}>
          <DecorativeIcon name="sparkles" size={11} color={colors.semantic.info} />
          <Text
            style={[
              styles.inboxPillText,
              { color: colors.semantic.info, fontFamily: fontFamily.bold },
            ]}
          >
            AI INBOX · 1 ACTION REQUIRED
          </Text>
        </View>
        <Text style={[styles.inboxType, { color: colors.text.tertiary }]}>Recurring Bill</Text>
      </View>

      <View style={styles.inboxContent}>
        <View style={[styles.inboxIcon, { backgroundColor: '#343538' }]}>
          <DecorativeIcon
            name="film-outline"
            size={18}
            color={colors.semantic.info}
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
          <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 2 }]}>
            Auto-detected notice: rate adjusts from{' '}
            <Text style={{ color: colors.text.primary, fontFamily: fontFamily.medium }}>98 MAD</Text>{' '}
            to{' '}
            <Text style={{ color: colors.text.primary, fontFamily: fontFamily.medium }}>120 MAD</Text>{' '}
            starting next billing cycle (Sep 15).
          </Text>
        </View>
      </View>

      <View style={styles.inboxActions}>
        <Pressable
          accessibilityLabel="Review tier"
          accessibilityRole="button"
          onPress={onReview}
          style={({ pressed }) => [
            styles.inboxReviewBtn,
            { backgroundColor: '#343538', opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <Text style={[styles.inboxReviewText, { color: colors.text.primary, fontFamily: fontFamily.medium }]}>
            Review Tier
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Accept change"
          accessibilityRole="button"
          onPress={onReview}
          style={({ pressed }) => [
            styles.inboxAcceptBtn,
            { backgroundColor: '#FFFFFF', opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.inboxAcceptText, { color: '#121316', fontFamily: fontFamily.semibold }]}>
            Accept Change
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

function Timeline({ model }: { model: HomeViewModel }): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();

  return (
    <Card style={[styles.timelineCard, { backgroundColor: '#1F1F23', borderColor: '#292A2D' }]}>
      <View style={styles.timelineHeader}>
        <View style={[styles.labelWithIcon, styles.timelineHeading]}>
          <DecorativeIcon name="trending-up" size={17} color={colors.semantic.info} />
          <Text style={[typography.h4, styles.timelineHeadingText, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}>
            Continuum Timeline
          </Text>
        </View>
        <Text
          style={[
            styles.timelineMode,
            { color: colors.text.tertiary, fontFamily: fontFamily.medium },
          ]}
        >
          Past ⇄ Projected
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

      {/* Dotted Separation Indicator */}
      <View style={styles.projectionArcRow}>
        <View style={[styles.arcLine, { backgroundColor: '#343538' }]} />
        <Text style={[styles.arcText, { color: colors.text.tertiary }]}>AI Projection Arc</Text>
        <View style={[styles.arcLine, { backgroundColor: '#343538' }]} />
      </View>

      {/* Forecast Card Node */}
      <View
        style={[
          styles.forecastCard,
          { backgroundColor: '#292A2D', borderColor: '#343538' },
        ]}
      >
        <View style={styles.forecastHeader}>
          <View style={[styles.labelWithIcon, styles.forecastHeading]}>
            <DecorativeIcon name="stats-chart" size={15} color={colors.semantic.info} />
            <Text
              style={[
                styles.forecastDate,
                { color: colors.text.primary, fontFamily: fontFamily.medium },
              ]}
            >
              ≈ Sep 30 · End-of-Month Forecast
            </Text>
          </View>
          {model.forecastConfidence !== null && (
            <View style={[styles.confidencePill, { backgroundColor: 'rgba(78, 222, 163, 0.15)' }]}>
              <Text
                style={[
                  styles.confidence,
                  { color: colors.semantic.income, fontFamily: fontFamily.semibold },
                ]}
              >
                {model.forecastConfidence}% confidence
              </Text>
            </View>
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
              { color: colors.text.primary, fontFamily: fontFamily.bold },
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
  const isSettled = entry.state === 'settled';
  const isAutomated = entry.state === 'automated';
  const dotColor = isSettled ? '#343538' : isAutomated ? colors.semantic.income : colors.semantic.info;
  const badgeBg = isSettled ? '#343538' : isAutomated ? '#343538' : 'rgba(49, 49, 192, 0.4)';
  const badgeColor = isSettled ? colors.text.secondary : isAutomated ? colors.semantic.income : colors.semantic.info;
  const signedAmount = entry.direction === 'expense' ? -entry.amount : entry.amount;
  const stateDisplay = entry.state === 'direct_debit' ? 'Direct Debit' : entry.state.charAt(0).toUpperCase() + entry.state.slice(1);

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <View style={[styles.timelineDot, { backgroundColor: dotColor, borderColor: '#1F1F23' }]} />
        {!isLast && (
          <View style={[styles.timelineLine, { backgroundColor: '#343538' }]} />
        )}
      </View>
      <View style={styles.timelineCopy}>
        <View style={styles.timelineTitleRow}>
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
          <View style={[styles.datePill, { backgroundColor: badgeBg }]}>
            <Text style={[styles.datePillText, { color: badgeColor, fontFamily: fontFamily.medium }]}>
              {entry.dateLabel}
            </Text>
          </View>
        </View>
        <Text style={[styles.timelineSubtitle, { color: colors.text.tertiary }]}>
          {entry.subtitle}
        </Text>
      </View>
      <View style={styles.timelineMeta}>
        <Text
          style={[
            styles.timelineAmount,
            {
              color: isAutomated ? colors.semantic.income : colors.text.primary,
              fontFamily: fontFamily.medium,
            },
          ]}
        >
          {formatAmount(signedAmount, entry.currency, true)}
        </Text>
        <Text
          style={[
            styles.timelineState,
            { color: isSettled ? colors.semantic.income : colors.text.tertiary, fontFamily: fontFamily.regular },
          ]}
        >
          {stateDisplay}
        </Text>
      </View>
    </View>
  );
}

interface ActionTileProps {
  icon: IconName;
  iconColor?: string;
  label: string;
  detail: string;
  onPress: () => void;
}

function ActionTile({ icon, iconColor, label, detail, onPress }: ActionTileProps): React.ReactElement {
  const { colors, fontFamily } = useTheme();

  return (
    <Pressable
      accessibilityLabel={`${label}. ${detail}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionTile,
        {
          backgroundColor: '#1F1F23',
          borderColor: '#292A2D',
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: '#343538' }]}>
        <DecorativeIcon name={icon} size={18} color={iconColor || colors.text.primary} />
      </View>
      <View style={styles.actionCopy}>
        <Text
          style={[
            styles.actionLabel,
            { color: colors.text.primary, fontFamily: fontFamily.semibold },
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
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 32 }}
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
            Synchronizing Lyvora
          </Text>
        </View>
      ) : model.status === 'empty' ? (
        <>
          <LyvoraHeader
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
          <LyvoraHeader
            displayName={model.displayName}
            locationLabel={model.locationLabel}
            onInboxPress={openAssistant}
            onProfilePress={() => router.push('/settings')}
          />
          <SnapshotCard model={model} />
          <HealthCard model={model} />
          <InboxCard model={model} onReview={openAssistant} />
          <Timeline model={model} />
          <View style={styles.actionRow}>
            <ActionTile
              detail="Log Cash Outflow"
              icon="add"
              iconColor="#FFFFFF"
              label="Manual Entry"
              onPress={() => router.push('/modal')}
            />
            <ActionTile
              detail="+MAD 200 to Vault"
              icon="wallet-outline"
              iconColor={colors.semantic.info}
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
  brandIdentity: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 16, lineHeight: 22 },
  brandSub: { fontSize: 13, lineHeight: 18, marginLeft: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: { position: 'absolute', width: 6, height: 6, borderRadius: 3, right: 9, top: 9 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, lineHeight: 18 },
  greetingRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greetingCopy: { flex: 1, gap: 3 },
  greetingTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  waveEmoji: { fontSize: 18 },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  syncDot: { width: 6, height: 6, borderRadius: 3 },
  insightsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snapshotCard: { marginTop: 16, padding: 16, borderRadius: 16, borderWidth: 1 },
  snapshotLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  labelWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eyebrow: { fontSize: 10, letterSpacing: 0.8 },
  horizonPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  horizon: { fontSize: 10 },
  heroAmountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 8 },
  heroCurrency: { fontSize: 14 },
  safeAmount: { fontSize: 34, lineHeight: 40, fontVariant: ['tabular-nums'] },
  telemetryBar: {
    marginTop: 14,
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  telemetryItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  telemetrySep: { fontSize: 12 },
  telemetryLabel: { fontSize: 10 },
  telemetryValue: { fontSize: 10, fontVariant: ['tabular-nums'] },
  metricDot: { width: 5, height: 5, borderRadius: 3 },
  healthCard: { marginTop: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  healthPillText: { fontSize: 11 },
  pulseLabel: { fontSize: 11 },
  healthContentRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  healthRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  healthRingText: { fontSize: 11 },
  healthInsightBox: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
  },
  inboxCard: { marginTop: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  inboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  inboxPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inboxPillText: { fontSize: 9, letterSpacing: 0.5 },
  inboxType: { fontSize: 11 },
  inboxContent: { marginTop: 12, flexDirection: 'row', gap: 10 },
  inboxIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  inboxCopy: { flex: 1 },
  inboxActions: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  inboxReviewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
  },
  inboxReviewText: { fontSize: 11 },
  inboxAcceptBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
  },
  inboxAcceptText: { fontSize: 11 },
  timelineCard: { marginTop: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineHeading: { flexShrink: 1, minWidth: 0 },
  timelineHeadingText: { flexShrink: 1 },
  timelineMode: { fontSize: 10 },
  timelineList: { marginTop: 14 },
  timelineRow: { minHeight: 52, flexDirection: 'row' },
  timelineRail: { width: 18, alignItems: 'center' },
  timelineDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, borderWidth: 1.5 },
  timelineLine: { width: 1.5, flex: 1, marginVertical: 3 },
  timelineCopy: { flex: 1, paddingRight: 8, paddingBottom: 10 },
  timelineTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  timelineTitle: { fontSize: 13 },
  datePill: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  datePillText: { fontSize: 9 },
  timelineSubtitle: { marginTop: 2, fontSize: 10 },
  timelineMeta: { minWidth: 90, alignItems: 'flex-end', paddingBottom: 10 },
  timelineAmount: { fontSize: 12, fontVariant: ['tabular-nums'] },
  timelineState: { marginTop: 2, fontSize: 10 },
  projectionArcRow: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arcLine: { flex: 1, height: 1 },
  arcText: { fontSize: 10 },
  forecastCard: { borderWidth: 1, borderRadius: 8, padding: 12 },
  forecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  forecastHeading: { flexShrink: 1, minWidth: 0 },
  forecastDate: { fontSize: 12 },
  confidencePill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  confidence: { fontSize: 9 },
  forecastAmountRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  forecastLabel: { flexShrink: 1 },
  forecastAmount: { fontSize: 15, fontVariant: ['tabular-nums'] },
  actionRow: { marginTop: 12, flexDirection: 'row', gap: 10 },
  actionTile: {
    flex: 1,
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: { flex: 1 },
  actionLabel: { fontSize: 12 },
  actionDetail: { marginTop: 1, fontSize: 10 },
  loadingState: { minHeight: 560, alignItems: 'center', justifyContent: 'center', gap: 10 },
  errorCard: { marginTop: 80, padding: 16, gap: 16 },
  emptyCard: { marginTop: 24 },
});
