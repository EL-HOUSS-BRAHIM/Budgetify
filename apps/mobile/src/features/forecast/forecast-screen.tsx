import { formatMoney, money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, EmptyState, Screen } from '../../components/ui';
import { useTheme } from '../../theme/ThemeProvider';
import {
  type CalendarDayTone,
  type ForecastCalendarDay,
  type ForecastEvent,
  type ForecastViewModel,
  useForecastData,
} from './use-forecast-data';

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

function formatAmount(amount: number, currency: string, signed = false): string {
  return formatMoney(money(amount, currency), {
    compactZeroFraction: false,
    signDisplay: signed ? 'always' : 'auto',
  });
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function chunkIntoWeeks(days: ForecastCalendarDay[]): ForecastCalendarDay[][] {
  const weeks: ForecastCalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

function toneColor(
  tone: CalendarDayTone | undefined,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  switch (tone) {
    case 'income':
      return colors.semantic.income;
    case 'goal':
      return colors.semantic.info;
    case 'projected':
      return colors.text.tertiary;
    default:
      return colors.text.primary;
  }
}

interface CalendarCellProps {
  day: ForecastCalendarDay;
  isSelected: boolean;
  onSelect: (eventId: string) => void;
}

function CalendarCell({ day, isSelected, onSelect }: CalendarCellProps): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  const color = day.inCurrentMonth ? toneColor(day.tone, colors) : colors.text.muted;
  const isInteractive = Boolean(day.eventId);
  const backgroundColor = day.highlighted
    ? colors.background.card
    : day.eventId
      ? colors.background.tertiary
      : 'transparent';

  const content = (
    <View
      style={[
        styles.dayCell,
        {
          backgroundColor,
          borderColor: isSelected ? colors.semantic.info : 'transparent',
          borderWidth: isSelected ? 1.5 : 0,
          opacity: day.inCurrentMonth ? 1 : 0.35,
        },
      ]}
    >
      <Text
        style={[
          styles.dayNumber,
          {
            color,
            fontFamily:
              day.highlighted || day.tone === 'projected'
                ? fontFamily.semibold
                : fontFamily.regular,
          },
        ]}
      >
        {day.day}
      </Text>
      {day.emoji && <Text style={styles.dayEmoji}>{day.emoji}</Text>}
      {day.glyph && (
        <Text
          style={[
            styles.dayGlyph,
            { color: colors.semantic.info, fontFamily: fontFamily.semibold },
          ]}
        >
          {day.glyph}
        </Text>
      )}
    </View>
  );

  if (!isInteractive) return content;

  return (
    <Pressable
      accessibilityLabel={`Day ${day.day}, has a scheduled event`}
      accessibilityRole="button"
      hitSlop={2}
      onPress={() => onSelect(day.eventId as string)}
      style={({ pressed }) => [styles.dayCellPressable, { opacity: pressed ? 0.72 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

function EventRow({
  event,
  isSelected,
  onSelect,
}: {
  event: ForecastEvent;
  isSelected: boolean;
  onSelect: (eventId: string) => void;
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  const signedAmount = event.direction === 'expense' ? -event.amount : event.amount;
  const amountColor = event.tone === 'income' ? colors.semantic.income : colors.text.primary;
  const badgeColor =
    event.tone === 'income'
      ? colors.semantic.income
      : event.tone === 'goal'
        ? colors.semantic.info
        : colors.text.tertiary;

  return (
    <Pressable
      accessibilityLabel={`${event.title}, ${event.dateLabel}, ${event.subtitle}`}
      accessibilityRole="button"
      onPress={() => onSelect(event.id)}
      style={({ pressed }) => [
        styles.eventRow,
        {
          backgroundColor: isSelected ? colors.background.tertiary : 'transparent',
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <View style={[styles.eventIcon, { backgroundColor: colors.background.primary }]}>
        <Text style={styles.eventEmoji}>{event.emoji}</Text>
      </View>
      <View style={styles.eventCopy}>
        <View style={styles.eventTitleRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.eventTitle,
              { color: colors.text.primary, fontFamily: fontFamily.medium },
            ]}
          >
            {event.title}
          </Text>
          <View style={[styles.eventBadge, { backgroundColor: colors.background.tertiary }]}>
            <Text
              style={[styles.eventBadgeText, { color: badgeColor, fontFamily: fontFamily.medium }]}
            >
              {event.dateLabel}
            </Text>
          </View>
        </View>
        <Text numberOfLines={1} style={[styles.eventSubtitle, { color: colors.text.tertiary }]}>
          {event.subtitle}
        </Text>
      </View>
      <Text style={[styles.eventAmount, { color: amountColor, fontFamily: fontFamily.semibold }]}>
        {formatAmount(signedAmount, event.currency, true)}
      </Text>
    </Pressable>
  );
}

function ForecastEngineCard({ model }: { model: ForecastViewModel }): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();

  if (model.forecastConfidence === null || model.forecastAmount === null) {
    return (
      <Card style={styles.lockedCard}>
        <DataNotice
          icon="lock-closed-outline"
          label="30-day forecasting unlocks after your baseline setup is complete."
          tone="info"
        />
      </Card>
    );
  }

  return (
    <Card style={styles.engineCard}>
      <View style={styles.engineTopRow}>
        <View>
          <Text style={[styles.engineEyebrow, { color: colors.text.tertiary }]}>
            FORECAST RELIABILITY
          </Text>
          <View style={styles.engineScoreRow}>
            <Text
              style={[
                typography.h2,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              {model.forecastConfidence}%
            </Text>
            <Text
              style={[
                styles.engineScoreLabel,
                { color: colors.semantic.income, fontFamily: fontFamily.medium },
              ]}
            >
              High Precision
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.reliabilityRing,
            { borderColor: colors.border.subtle, borderTopColor: colors.semantic.info },
          ]}
        >
          <DecorativeIcon name="trending-up" size={16} color={colors.semantic.info} />
        </View>
      </View>

      <View style={[styles.explanationBox, { backgroundColor: colors.background.primary }]}>
        <View style={styles.explanationHeader}>
          <View style={[styles.dotSmall, { backgroundColor: colors.semantic.info }]} />
          <Text
            style={[
              styles.explanationLabel,
              { color: colors.semantic.info, fontFamily: fontFamily.semibold },
            ]}
          >
            DETERMINISTIC ML MODEL
          </Text>
        </View>
        <Text style={[typography.bodySmall, { color: colors.text.primary, lineHeight: 19 }]}>
          {model.forecastNarrative}
        </Text>
      </View>

      {model.overdraftRiskLabel && (
        <View style={[styles.overdraftPill, { backgroundColor: colors.background.tertiary }]}>
          <DecorativeIcon name="checkmark-circle" size={15} color={colors.semantic.income} />
          <Text
            style={[
              styles.overdraftText,
              { color: colors.text.primary, fontFamily: fontFamily.medium },
            ]}
          >
            {model.overdraftRiskLabel}
          </Text>
        </View>
      )}
    </Card>
  );
}

export function ForecastScreen(): React.ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, fontFamily, typography } = useTheme();
  const { model, isLoading, isRefreshing, error, refresh } = useForecastData();
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const toggleSelection = (eventId: string) => {
    setSelectedEventId((current) => (current === eventId ? null : eventId));
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
      <View style={styles.header}>
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
        <View style={styles.brandRow}>
          <View style={[styles.brandMark, { borderColor: colors.semantic.income }]}>
            <DecorativeIcon name="sparkles" size={13} color={colors.semantic.income} />
          </View>
          <Text
            style={[styles.brandName, { color: colors.text.primary, fontFamily: fontFamily.bold }]}
          >
            Lyvora
          </Text>
          <Text style={[styles.brandSection, { color: colors.text.tertiary }]}>| Forecast</Text>
        </View>
        <View style={[styles.headerButton, { backgroundColor: colors.background.tertiary }]}>
          <DecorativeIcon name="calendar-outline" size={18} color={colors.text.secondary} />
        </View>
      </View>

      {error ? (
        <Card style={styles.errorCard}>
          <DataNotice icon="cloud-offline-outline" label={error} tone="expense" />
          <Button label="Try again" onPress={refresh} variant="secondary" />
        </Card>
      ) : isLoading || !model ? (
        <View accessibilityLabel="Loading forecast calendar" style={styles.loadingState}>
          <ActivityIndicator color={colors.semantic.info} />
          <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
            Synchronizing forecast
          </Text>
        </View>
      ) : (
        <>
          {model.status === 'preview' && (
            <DataNotice icon="eye-outline" label="Design preview · sample forecast" tone="info" />
          )}

          <View style={styles.monthRow}>
            <View style={[styles.monthPill, { backgroundColor: colors.background.tertiary }]}>
              <Text style={[typography.h4, { color: colors.text.primary }]}>
                {model.monthLabel}
              </Text>
              <DecorativeIcon name="chevron-down" size={16} color={colors.semantic.info} />
            </View>
            <Pressable
              accessibilityLabel={isLegendOpen ? 'Hide legend' : 'Show legend'}
              accessibilityRole="button"
              onPress={() => setIsLegendOpen((open) => !open)}
              style={({ pressed }) => [
                styles.legendToggle,
                { backgroundColor: colors.background.secondary, opacity: pressed ? 0.72 : 1 },
              ]}
            >
              <DecorativeIcon name="options-outline" size={14} color={colors.semantic.info} />
              <Text style={[styles.legendToggleText, { color: colors.text.secondary }]}>
                Legend
              </Text>
            </Pressable>
          </View>

          {isLegendOpen && (
            <View style={[styles.legendTray, { backgroundColor: colors.background.secondary }]}>
              <LegendChip color={colors.semantic.income} label="Inflow / Income" />
              <LegendChip color={colors.text.tertiary} label="Recurring Fixed" />
              <LegendChip color={colors.semantic.info} label="Goals & Buffers" />
              <LegendChip color={colors.text.muted} label="Projected EOM" />
            </View>
          )}

          <Card style={styles.calendarCard}>
            <View style={styles.weekdayRow}>
              {WEEKDAY_LABELS.map((label, index) => (
                <Text
                  key={`${label}-${index}`}
                  style={[styles.weekdayLabel, { color: colors.text.tertiary }]}
                >
                  {label}
                </Text>
              ))}
            </View>
            {chunkIntoWeeks(model.calendarDays).map((week, weekIndex) => (
              <View key={`week-${weekIndex}`} style={styles.weekRow}>
                {week.map((day) => (
                  <CalendarCell
                    day={day}
                    isSelected={Boolean(day.eventId) && day.eventId === selectedEventId}
                    key={day.key}
                    onSelect={toggleSelection}
                  />
                ))}
              </View>
            ))}
          </Card>

          <View style={styles.eventsHeader}>
            <Text style={[styles.eventsEyebrow, { color: colors.text.tertiary }]}>
              UPCOMING CASH FLOW GRAVITY (THIS WEEK)
            </Text>
            <Text style={[styles.eventsCount, { color: colors.semantic.info }]}>
              {model.events.length} Event{model.events.length === 1 ? '' : 's'}
            </Text>
          </View>

          {model.events.length === 0 ? (
            <Card style={styles.emptyEventsCard}>
              <EmptyState
                description="Upcoming bills, income, and goal transfers for this month will appear here."
                icon="calendar-clear-outline"
                title="No upcoming events this month"
              />
            </Card>
          ) : (
            <Card style={styles.eventsCard}>
              {model.events.map((event) => (
                <EventRow
                  event={event}
                  isSelected={selectedEventId === event.id}
                  key={event.id}
                  onSelect={toggleSelection}
                />
              ))}
            </Card>
          )}

          <View style={styles.engineHeader}>
            <DecorativeIcon name="sparkles" size={15} color={colors.semantic.info} />
            <Text style={[styles.engineHeaderText, { color: colors.text.tertiary }]}>
              30-DAY FORECAST ENGINE
            </Text>
          </View>
          <ForecastEngineCard model={model} />
        </>
      )}
    </Screen>
  );
}

function LegendChip({ color, label }: { color: string; label: string }): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View style={[styles.legendChip, { backgroundColor: colors.background.tertiary }]}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text
        style={[styles.legendLabel, { color: colors.text.primary, fontFamily: fontFamily.medium }]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandMark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 15, lineHeight: 20 },
  brandSection: { fontSize: 13, lineHeight: 18, marginLeft: 2 },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingState: { minHeight: 480, alignItems: 'center', justifyContent: 'center', gap: 10 },
  errorCard: { marginTop: 80, padding: 16, gap: 16 },
  monthRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  legendToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    minHeight: 32,
  },
  legendToggleText: { fontSize: 11 },
  legendTray: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 10 },
  calendarCard: { marginTop: 12, padding: 14, borderRadius: 16 },
  weekdayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekdayLabel: { flex: 1, textAlign: 'center', fontSize: 11 },
  weekRow: { flexDirection: 'row', marginTop: 4 },
  dayCellPressable: { flex: 1 },
  dayCell: {
    flex: 1,
    minHeight: 44,
    marginHorizontal: 1,
    borderRadius: 8,
    alignItems: 'center',
    paddingTop: 5,
  },
  dayNumber: { fontSize: 11 },
  dayEmoji: { fontSize: 12, marginTop: 2 },
  dayGlyph: { fontSize: 13, marginTop: 2 },
  eventsHeader: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventsEyebrow: { fontSize: 10, letterSpacing: 0.6 },
  eventsCount: { fontSize: 11 },
  eventsCard: { marginTop: 8, padding: 6, borderRadius: 16 },
  emptyEventsCard: { marginTop: 8 },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 10,
    minHeight: 56,
  },
  eventIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  eventEmoji: { fontSize: 16 },
  eventCopy: { flex: 1, minWidth: 0 },
  eventTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventTitle: { flexShrink: 1, fontSize: 13 },
  eventBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  eventBadgeText: { fontSize: 9 },
  eventSubtitle: { marginTop: 2, fontSize: 11 },
  eventAmount: { fontSize: 12, fontVariant: ['tabular-nums'], flexShrink: 0 },
  engineHeader: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  engineHeaderText: { fontSize: 10, letterSpacing: 0.6 },
  lockedCard: { marginTop: 8, padding: 16 },
  engineCard: { marginTop: 8, padding: 16, borderRadius: 16, gap: 12 },
  engineTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  engineEyebrow: { fontSize: 10, letterSpacing: 0.6 },
  engineScoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  engineScoreLabel: { fontSize: 12 },
  reliabilityRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explanationBox: { padding: 12, borderRadius: 10, gap: 6 },
  explanationHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dotSmall: { width: 6, height: 6, borderRadius: 3 },
  explanationLabel: { fontSize: 10, letterSpacing: 0.6 },
  overdraftPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  overdraftText: { fontSize: 11 },
});
