import { formatMoney, money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, Screen } from '../src/components/ui';
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
const amount = (n: number) => formatMoney(money(n, 'MAD'), { compactZeroFraction: true });
export default function CreditCardsScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [notice, setNotice] = useState<string | null>(null);
  return (
    <Screen contentContainerStyle={{ paddingTop: insets.top + 8 }}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <Icon name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <Text
          style={[styles.head, { color: colors.text.secondary, fontFamily: fontFamily.medium }]}
        >
          Credit Card Hub
        </Text>
        <View style={styles.button} />
      </View>
      <Card style={[styles.card, { backgroundColor: colors.background.tertiary }]}>
        <Text style={[styles.cardType, { color: colors.text.tertiary }]}>TITANIUM · ACTIVE</Text>
        <Text
          style={[
            styles.cardNumber,
            { color: colors.text.primary, fontFamily: fontFamily.semibold },
          ]}
        >
          •••• •••• •••• 4102
        </Text>
        <Text style={[typography.bodySmall, { color: colors.text.secondary }]}>
          Cardholder · Lyvora member
        </Text>
      </Card>
      <View style={styles.summary}>
        <View>
          <Text style={[styles.small, { color: colors.text.tertiary }]}>AVAILABLE CREDIT</Text>
          <Text
            style={[
              styles.balance,
              { color: colors.semantic.income, fontFamily: fontFamily.semibold },
            ]}
          >
            {amount(385000)}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.small, { color: colors.text.tertiary }]}>CURRENT OBLIGATION</Text>
          <Text
            style={[
              styles.balance,
              { color: colors.text.primary, fontFamily: fontFamily.semibold },
            ]}
          >
            -{amount(115000)}
          </Text>
        </View>
      </View>
      <Card style={styles.util}>
        <View style={styles.utilHead}>
          <Text
            style={[
              styles.utilTitle,
              { color: colors.text.primary, fontFamily: fontFamily.medium },
            ]}
          >
            30% utilized
          </Text>
          <Text style={[styles.small, { color: colors.semantic.income }]}>
            Optimal tier under 30%
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.border.subtle }]}>
          <View style={[styles.fill, { backgroundColor: colors.semantic.income }]} />
        </View>
        <Text style={[styles.small, { color: colors.text.tertiary }]}>
          {' '}
          {amount(115000)} / {amount(500000)}
        </Text>
      </Card>
      <Text style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.medium }]}>
        Billing Timeline
      </Text>
      <Card style={styles.list}>
        <Row
          icon="receipt-outline"
          label="Statement closes"
          detail="Sep 28 · cycle locks 23:59"
          value="12d left"
        />
        <Row
          icon="calendar-outline"
          label="Payment due"
          detail="Oct 10 · auto-pay review ready"
          value="24d left"
        />
        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
        <Text
          style={[styles.full, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
        >
          Full statement balance · {amount(115000)}
        </Text>
        <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
          Paying in full protects against interest. This amount is a preview, not a scheduled
          payment.
        </Text>
      </Card>
      <Card style={[styles.shield, { borderColor: colors.semantic.income }]}>
        <Icon name="shield-checkmark-outline" size={19} color={colors.semantic.income} />
        <View style={styles.flex}>
          <Text
            style={[
              styles.utilTitle,
              { color: colors.text.primary, fontFamily: fontFamily.semibold },
            ]}
          >
            Zero-Interest Shield
          </Text>
          <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
            No payment is initiated. Use this plan to reserve cash before the due date.
          </Text>
        </View>
      </Card>
      <View style={styles.actions}>
        <Button
          label="Prepare statement plan"
          onPress={() => setNotice('Statement payment plan prepared locally. No payment was sent.')}
          style={styles.action}
          variant="secondary"
        />
        <Button
          label="Manage limits"
          onPress={() => setNotice('Card-limit review is not connected in this preview.')}
          style={styles.action}
          variant="text"
        />
      </View>
      {notice && <DataNotice label={notice} tone="info" />}
    </Screen>
  );
}
function Row({
  icon,
  label,
  detail,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  detail: string;
  value: string;
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Icon name={icon} size={17} color={colors.semantic.info} />
      </View>
      <View style={styles.flex}>
        <Text
          style={[styles.utilTitle, { color: colors.text.primary, fontFamily: fontFamily.medium }]}
        >
          {label}
        </Text>
        <Text style={[styles.small, { color: colors.text.tertiary }]}>{detail}</Text>
      </View>
      <Text
        style={[styles.small, { color: colors.semantic.income, fontFamily: fontFamily.semibold }]}
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
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: { fontSize: 12, lineHeight: 18 },
  card: { marginTop: 20, padding: 18, borderRadius: 8 },
  cardType: { fontSize: 10, lineHeight: 14 },
  cardNumber: { marginTop: 22, fontSize: 21, lineHeight: 28, letterSpacing: 1 },
  summary: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between' },
  right: { alignItems: 'flex-end' },
  small: { fontSize: 10, lineHeight: 14 },
  balance: { marginTop: 3, fontSize: 17, lineHeight: 23, fontVariant: ['tabular-nums'] },
  util: { marginTop: 14, padding: 14 },
  utilHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  utilTitle: { fontSize: 12, lineHeight: 16 },
  track: { height: 7, borderRadius: 4, overflow: 'hidden', marginVertical: 10 },
  fill: { height: 7, width: '30%', borderRadius: 4 },
  section: { marginTop: 22, fontSize: 16, lineHeight: 22 },
  list: { marginTop: 8, paddingHorizontal: 12 },
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 9 },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  divider: { height: 1, marginVertical: 4 },
  full: { marginTop: 10, fontSize: 13, lineHeight: 18 },
  shield: { marginTop: 12, padding: 12, flexDirection: 'row', gap: 9 },
  actions: { marginTop: 12, flexDirection: 'row', gap: 8 },
  action: { flex: 1, paddingHorizontal: 8 },
});
