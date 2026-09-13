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

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Tone = 'default' | 'brand' | 'info' | 'warning' | 'expense' | 'income';

interface ScreenProps extends ScrollViewProps {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  contentContainerStyle,
  ...props
}: ScreenProps): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      {...props}
      style={[styles.screen, { backgroundColor: colors.background.primary }, props.style]}
      contentContainerStyle={[
        styles.screenContent,
        { paddingBottom: insets.bottom + 32 },
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
  screenContent: { padding: 16 },
  card: { borderWidth: 1, overflow: 'hidden' },
  button: {
    minHeight: 48,
    borderWidth: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonLabel: { fontSize: 14, lineHeight: 20 },
  sectionHeader: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listRow: {
    minHeight: 64,
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
  rowCopy: { flex: 1, gap: 2 },
  amount: { fontVariant: ['tabular-nums'] },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  noticeText: { flex: 1 },
  emptyState: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 40, gap: 8 },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyDescription: { textAlign: 'center', maxWidth: 280 },
  emptyAction: { marginTop: 8, alignSelf: 'stretch' },
});
