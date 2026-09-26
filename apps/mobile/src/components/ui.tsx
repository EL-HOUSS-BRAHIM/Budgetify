import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  Text,
  type StyleProp,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useResponsiveLayout } from '../theme/useResponsiveLayout';
import { layout } from '../theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Tone = 'default' | 'brand' | 'info' | 'warning' | 'expense' | 'income';

interface ScreenProps extends ScrollViewProps {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Extra top padding to clear a header this screen draws itself. */
  topInset?: boolean;
}

/**
 * The scrolling page every screen is built on.
 *
 * Padding comes from the live layout rather than a fixed 16, and the content
 * column is capped and centred so a tablet or an unfolded device does not turn
 * a list into 900 dp lines. Bottom padding clears the safe area and the tab bar.
 */
export function Screen({
  children,
  contentContainerStyle,
  topInset = false,
  ...props
}: ScreenProps): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const responsive = useResponsiveLayout();

  return (
    <ScrollView
      {...props}
      style={[styles.screen, { backgroundColor: colors.background.primary }, props.style]}
      contentContainerStyle={[
        styles.screenContent,
        {
          paddingTop: topInset ? insets.top + responsive.gutter / 2 : responsive.gutter,
          paddingBottom: insets.bottom + responsive.gutter * 2,
          paddingHorizontal: responsive.contentPadding,
          maxWidth: responsive.maxContentWidth + responsive.gutter * 2,
          alignSelf: 'center',
          width: '100%',
        },
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  );
}

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...props }: CardProps): React.ReactElement {
  const { colors, radius } = useTheme();

  return (
    <View
      {...props}
      style={[
        styles.card,
        {
          backgroundColor: colors.background.card,
          borderColor: colors.border.default,
          borderRadius: radius.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'danger' | 'text';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps): React.ReactElement {
  const { colors, fontFamily, radius } = useTheme();
  const isDisabled = disabled || loading;
  const foreground =
    variant === 'primary'
      ? colors.text.inverse
      : variant === 'danger'
        ? colors.semantic.expense
        : colors.brand.primary;
  const background =
    variant === 'primary'
      ? colors.brand.primary
      : variant === 'danger'
        ? colors.semantic.expenseLight
        : variant === 'text'
          ? 'transparent'
          : colors.background.card;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderColor:
            variant === 'text'
              ? 'transparent'
              : variant === 'danger'
                ? colors.semantic.expense
                : variant === 'primary'
                  ? colors.brand.primary
                  : colors.border.default,
          borderRadius: radius.md,
          opacity: isDisabled ? 0.45 : pressed ? 0.78 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} size="small" />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={19} color={foreground} />}
          <Text
            style={[styles.buttonLabel, { color: foreground, fontFamily: fontFamily.semibold }]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: SectionHeaderProps): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();

  return (
    <View style={styles.sectionHeader}>
      <Text style={[typography.h3, { color: colors.text.primary }]}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onAction}>
          <Text
            style={[
              typography.bodySmall,
              { color: colors.brand.primary, fontFamily: fontFamily.semibold },
            ]}
          >
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

interface MonthSwitcherProps {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  /** Disables forward navigation into months that have not happened yet. */
  canGoNext?: boolean;
}

/**
 * The month stepper shared by Home, Transactions and Budget.
 *
 * Built as a row of real touch targets rather than two text glyphs: the previous
 * and next hit areas are at least the platform minimum, which is what makes the
 * control usable one-handed and with a large system font.
 */
export function MonthSwitcher({
  label,
  onPrevious,
  onNext,
  canGoNext = true,
}: MonthSwitcherProps): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();

  return (
    <View style={styles.monthSwitcher}>
      <Pressable
        accessibilityLabel="Previous month"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onPrevious}
        style={({ pressed }) => [
          styles.monthStep,
          { borderColor: colors.border.default, opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Text style={[styles.monthStepGlyph, { color: colors.text.primary }]}>‹</Text>
      </Pressable>
      <Text
        accessibilityLiveRegion="polite"
        style={[
          styles.monthLabel,
          typography.bodyMedium,
          { color: colors.text.secondary, fontFamily: fontFamily.medium },
        ]}
      >
        {label}
      </Text>
      <Pressable
        accessibilityLabel="Next month"
        accessibilityRole="button"
        disabled={!canGoNext}
        hitSlop={8}
        onPress={onNext}
        style={({ pressed }) => [
          styles.monthStep,
          { borderColor: colors.border.default, opacity: !canGoNext ? 0.35 : pressed ? 0.6 : 1 },
        ]}
      >
        <Text style={[styles.monthStepGlyph, { color: colors.text.primary }]}>›</Text>
      </Pressable>
    </View>
  );
}

interface StatTile {
  label: string;
  value: string;
  color?: string;
}

/**
 * Headline figures in a grid that reflows to two columns on a wider screen
 * instead of squeezing three tiles into 320 dp.
 */
export function StatGrid({ tiles }: { tiles: readonly StatTile[] }): React.ReactElement {
  const { colors, radius, typography } = useTheme();
  const responsive = useResponsiveLayout();

  return (
    <View style={styles.statGrid}>
      {tiles.map((tile) => (
        <View
          key={tile.label}
          style={[
            styles.statTile,
            {
              backgroundColor: colors.background.card,
              borderColor: colors.border.default,
              borderRadius: radius.md,
              flexBasis: responsive.gridColumns === 2 ? '47%' : '100%',
            },
          ]}
        >
          <Text style={[typography.caption, { color: colors.text.tertiary }]}>{tile.label}</Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.statValue, { color: tile.color ?? colors.text.primary }]}
          >
            {tile.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

interface ProgressBarProps {
  /** 0..100. Values outside the range are clamped rather than overflowing. */
  percent: number;
  color: string;
  trackColor: string;
  accessibilityLabel: string;
}

/** A determinate progress bar that also reads as a progressbar to a screen reader. */
export function ProgressBar({
  percent,
  color,
  trackColor,
  accessibilityLabel,
}: ProgressBarProps): React.ReactElement {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      style={[styles.progressTrack, { backgroundColor: trackColor }]}
    >
      <View style={[styles.progressFill, { backgroundColor: color, width: `${clamped}%` }]} />
    </View>
  );
}

function toneColor(tone: Tone, colors: ReturnType<typeof useTheme>['colors']): string {
  switch (tone) {
    case 'brand':
      return colors.brand.primary;
    case 'info':
      return colors.semantic.info;
    case 'warning':
      return colors.semantic.warning;
    case 'expense':
      return colors.semantic.expense;
    case 'income':
      return colors.semantic.income;
    default:
      return colors.text.primary;
  }
}

interface ListRowProps {
  title: string;
  subtitle: string;
  icon: IconName;
  amount?: string;
  amountTone?: Tone;
  onPress?: () => void;
  isLast?: boolean;
  accessibilityLabel?: string;
}

export function ListRow({
  title,
  subtitle,
  icon,
  amount,
  amountTone = 'default',
  onPress,
  isLast = false,
  accessibilityLabel,
}: ListRowProps): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();
  const content = (
    <>
      <View style={[styles.rowIcon, { backgroundColor: colors.background.secondary }]}>
        <Ionicons name={icon} size={20} color={colors.text.secondary} />
      </View>
      <View style={styles.rowCopy}>
        <Text
          style={[
            typography.bodyMedium,
            { color: colors.text.primary, fontFamily: fontFamily.semibold },
          ]}
        >
          {title}
        </Text>
        <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>{subtitle}</Text>
      </View>
      {amount && (
        <Text
          style={[
            styles.amount,
            typography.bodyMedium,
            { color: toneColor(amountTone, colors), fontFamily: fontFamily.semibold },
          ]}
        >
          {amount}
        </Text>
      )}
      {onPress && <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />}
    </>
  );
  const rowStyle = [
    styles.listRow,
    !isLast && { borderBottomColor: colors.border.subtle, borderBottomWidth: 1 },
  ];

  return onPress ? (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        rowStyle,
        pressed && { backgroundColor: colors.background.secondary },
      ]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={rowStyle}>{content}</View>
  );
}

interface DataNoticeProps {
  label: string;
  tone?: Exclude<Tone, 'default' | 'income'>;
  icon?: IconName;
}

export function DataNotice({
  label,
  tone = 'info',
  icon = 'information-circle-outline',
}: DataNoticeProps): React.ReactElement {
  const { colors, typography } = useTheme();
  const color = toneColor(tone, colors);

  return (
    <View accessibilityRole="text" style={styles.notice}>
      <Ionicons name={icon} size={17} color={color} />
      <Text style={[typography.bodySmall, styles.noticeText, { color }]}>{label}</Text>
    </View>
  );
}

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();

  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.brand.primaryLight }]}>
        <Ionicons name={icon} size={24} color={colors.brand.primary} />
      </View>
      <Text
        style={[typography.h4, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
      >
        {title}
      </Text>
      <Text
        style={[typography.bodySmall, styles.emptyDescription, { color: colors.text.tertiary }]}
      >
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} style={styles.emptyAction} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenContent: { flexGrow: 1 },
  card: { borderWidth: 1, overflow: 'hidden' },
  button: {
    minHeight: layout.minTouchTarget,
    borderWidth: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  buttonLabel: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  sectionHeader: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  listRow: {
    minHeight: layout.minTouchTarget + 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: { flex: 1, gap: 2, minWidth: 0 },
  amount: { fontVariant: ['tabular-nums'] },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  noticeText: { flex: 1 },
  emptyState: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 32, gap: 8 },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyDescription: { textAlign: 'center', maxWidth: 320 },
  emptyAction: { marginTop: 8, alignSelf: 'stretch' },
  monthSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  monthStep: {
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget - 8,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  monthStepGlyph: { fontSize: 22, lineHeight: 26 },
  monthLabel: { flex: 1, textAlign: 'center' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statTile: { flexGrow: 1, padding: 12, borderWidth: 1, minWidth: 96 },
  statValue: { fontSize: 15, fontWeight: '700', marginTop: 6 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
});
