import { formatMoney, money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, Screen } from '../src/components/ui';
import { useTheme } from '../src/theme/ThemeProvider';

const amount = (value: number) => formatMoney(money(value, 'MAD'), { compactZeroFraction: true });
function Icon(props: React.ComponentProps<typeof Ionicons>) {
  return (
    <Ionicons
      {...props}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

export default function AllocationScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [prepared, setPrepared] = useState(false);
  return (
    <Screen contentContainerStyle={{ paddingTop: insets.top + 8 }}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.back,
            { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <Icon name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <Text
          style={[
            styles.headerText,
            { color: colors.text.secondary, fontFamily: fontFamily.medium },
          ]}
        >
          Allocation Engine
        </Text>
        <View style={styles.back} />
      </View>
      <View style={styles.hero}>
        <Text
          style={[styles.eyebrow, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}
        >
          OPTIMAL PORTFOLIO ENGINE · PREVIEW
        </Text>
        <Text style={[typography.h2, { color: colors.text.primary }]}>Capital Allocation</Text>
        <Text
          style={[
            styles.surplus,
            { color: colors.semantic.income, fontFamily: fontFamily.semibold },
          ]}
        >
          + {amount(300000)} surplus capital
        </Text>
        <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
          Sample scenario · no account balance is changed
        </Text>
      </View>
      <Card style={[styles.note, { borderColor: colors.brand.accent }]}>
        <Icon name="sparkles" size={17} color={colors.semantic.info} />
        <Text style={[typography.bodySmall, styles.flex, { color: colors.text.secondary }]}>
          Mathematically optimal distribution considers liquidity, planned commitments, and goal
          timelines.
        </Text>
      </Card>
      <Text style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.medium }]}>
        Distribution
      </Text>
      <Card style={styles.card}>
        <Allocation
          icon="shield-checkmark-outline"
          title="Emergency Fortress"
          detail="Defensive runway from 4.6 to 5.4 months"
          value={150000}
          percent="50%"
          tone="income"
        />
        <Allocation
          icon="laptop-outline"
          title="Ultimate PC Setup"
          detail="Forecast moves forward by two months"
          value={100000}
          percent="33%"
          tone="info"
        />
        <Allocation
          icon="happy-outline"
          title="Guilt-Free Rewards"
          detail="Dedicated lifestyle reserve"
          value={50000}
          percent="17%"
          tone="warning"
        />
      </Card>
      <Card style={[styles.balance, { backgroundColor: colors.background.tertiary }]}>
        <Text style={[styles.small, { color: colors.text.tertiary }]}>ALLOCATED TOTAL</Text>
        <Text
          style={[
            styles.balanceText,
            { color: colors.text.primary, fontFamily: fontFamily.semibold },
          ]}
        >
          {amount(300000)} / {amount(300000)}
        </Text>
        <Text style={[styles.small, { color: colors.semantic.income }]}>
          100% balanced · zero impact forecast
        </Text>
      </Card>
      {prepared ? (
        <Card style={[styles.prepared, { borderColor: colors.semantic.income }]}>
          <DataNotice
            icon="checkmark-circle-outline"
            label="Allocation prepared locally. No transfer was created."
            tone="info"
          />
        </Card>
      ) : (
        <View style={styles.actions}>
          <Button
            label="Prepare distribution"
            onPress={() => setPrepared(true)}
            style={styles.action}
            variant="secondary"
          />
          <Button label="Customize" onPress={() => {}} style={styles.action} variant="text" />
        </View>
      )}
    </Screen>
  );
}
function Allocation({
  icon,
  title,
  detail,
  value,
  percent,
  tone,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  detail: string;
  value: number;
  percent: string;
  tone: 'income' | 'info' | 'warning';
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.rowIcon,
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
      <View>
        <Text
          style={[styles.value, { color: colors.semantic[tone], fontFamily: fontFamily.semibold }]}
        >
          + {amount(value)}
        </Text>
        <Text style={[styles.small, { color: colors.text.tertiary, textAlign: 'right' }]}>
          {percent}
        </Text>
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
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerText: { fontSize: 12, lineHeight: 18 },
  hero: { marginTop: 20, alignItems: 'center', gap: 6 },
  eyebrow: { fontSize: 10, lineHeight: 14 },
  surplus: { fontSize: 27, lineHeight: 34, fontVariant: ['tabular-nums'] },
  note: { marginTop: 18, padding: 12, flexDirection: 'row', gap: 9 },
  flex: { flex: 1 },
  section: { marginTop: 22, fontSize: 16, lineHeight: 22 },
  card: { marginTop: 8, paddingHorizontal: 12 },
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 9 },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 12, lineHeight: 16 },
  small: { fontSize: 9, lineHeight: 13 },
  value: { fontSize: 11, lineHeight: 15, fontVariant: ['tabular-nums'] },
  balance: { marginTop: 12, padding: 14, alignItems: 'center' },
  balanceText: { marginVertical: 4, fontSize: 18, lineHeight: 24, fontVariant: ['tabular-nums'] },
  actions: { marginTop: 12, flexDirection: 'row', gap: 8 },
  action: { flex: 1, paddingHorizontal: 8 },
  prepared: { marginTop: 12, padding: 14 },
});
