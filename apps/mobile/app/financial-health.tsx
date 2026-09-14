import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, DataNotice, Screen } from '../src/components/ui';
import { useTheme } from '../src/theme/ThemeProvider';

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

export default function FinancialHealthScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Screen contentContainerStyle={{ paddingTop: insets.top + 8 }}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => router.back()}
          style={[styles.headerButton, { backgroundColor: colors.background.tertiary }]}
        >
          <Icon name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            { color: colors.text.secondary, fontFamily: fontFamily.medium },
          ]}
        >
          Financial Health
        </Text>
        <View style={styles.headerButton} />
      </View>
      <Text
        style={[styles.eyebrow, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}
      >
        FINANCIAL HEALTH · PREVIEW
      </Text>
      <Text style={[typography.h2, { color: colors.text.primary, marginTop: 5 }]}>
        The shape of your money
      </Text>
      <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 4 }]}>
        A deeper read of resilience, momentum, and decision quality.
      </Text>
      <DataNotice
        icon="eye-outline"
        label="Design preview · sample indicators are not a financial assessment"
        tone="info"
      />
      <Card style={styles.scoreCard}>
        <View style={styles.scoreRing}>
          <Text
            style={[
              styles.score,
              { color: colors.semantic.income, fontFamily: fontFamily.semibold },
            ]}
          >
            82
          </Text>
          <Text style={[styles.outOf, { color: colors.text.tertiary }]}>/100</Text>
        </View>
        <View style={styles.flex}>
          <Text style={[styles.label, { color: colors.text.tertiary }]}>CURRENT HEALTH</Text>
          <Text
            style={[styles.title, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
          >
            Resilient with room to grow
          </Text>
          <Text style={[styles.small, { color: colors.text.tertiary }]}>
            Up 6 points from the previous review cycle.
          </Text>
        </View>
      </Card>
      <Text
        style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
      >
        Health dimensions
      </Text>
      <Card style={styles.card}>
        <Dimension
          icon="shield-checkmark-outline"
          title="Liquidity resilience"
          value="91"
          detail="5.4 months of essential runway"
          tone="income"
        />
        <Dimension
          icon="trending-up-outline"
          title="Goal momentum"
          value="78"
          detail="Two targets remain on schedule"
          tone="info"
        />
        <Dimension
          icon="pulse-outline"
          title="Spending stability"
          value="73"
          detail="Flexible spend varies week to week"
          tone="warning"
          last
        />
      </Card>
      <Card style={[styles.insight, { borderColor: colors.brand.accent }]}>
        <Icon name="sparkles-outline" size={18} color={colors.semantic.info} />
        <View style={styles.flex}>
          <Text
            style={[styles.title, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
          >
            Most useful next move
          </Text>
          <Text style={[styles.small, { color: colors.text.tertiary }]}>
            Protect the current runway before accelerating discretionary goals.
          </Text>
        </View>
      </Card>
    </Screen>
  );
}
function Dimension({
  icon,
  title,
  value,
  detail,
  tone,
  last = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  value: string;
  detail: string;
  tone: 'income' | 'warning' | 'info';
  last?: boolean;
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View
      style={[
        styles.row,
        !last && { borderBottomColor: colors.border.subtle, borderBottomWidth: 1 },
      ]}
    >
      <View
        style={[
          styles.icon,
          {
            backgroundColor:
              tone === 'income'
                ? colors.semantic.incomeLight
                : tone === 'warning'
                  ? colors.semantic.warningLight
                  : colors.brand.accentLight,
          },
        ]}
      >
        <Icon name={icon} size={18} color={colors.semantic[tone]} />
      </View>
      <View style={styles.flex}>
        <Text
          style={[styles.title, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
        >
          {title}
        </Text>
        <Text style={[styles.small, { color: colors.text.tertiary }]}>{detail}</Text>
      </View>
      <Text
        style={[styles.value, { color: colors.semantic[tone], fontFamily: fontFamily.semibold }]}
      >
        {value}
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
  headerTitle: { fontSize: 12, lineHeight: 18 },
  eyebrow: { marginTop: 22, fontSize: 10, lineHeight: 14 },
  scoreCard: { marginTop: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  scoreRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 7,
    borderColor: '#4EDEA3',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  score: { fontSize: 27, lineHeight: 34 },
  outOf: { fontSize: 10, lineHeight: 14, marginTop: 13 },
  flex: { flex: 1 },
  label: { fontSize: 9, lineHeight: 13, letterSpacing: 0.5 },
  title: { fontSize: 12, lineHeight: 17 },
  small: { fontSize: 10, lineHeight: 15 },
  section: { marginTop: 22, fontSize: 16, lineHeight: 22 },
  card: { marginTop: 8, paddingHorizontal: 12 },
  row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 38, height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 16, lineHeight: 22 },
  insight: { marginTop: 14, padding: 14, flexDirection: 'row', gap: 10 },
});
