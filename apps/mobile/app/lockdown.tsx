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
export default function LockdownScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(true);
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
            styles.headerTitle,
            { color: colors.text.secondary, fontFamily: fontFamily.medium },
          ]}
        >
          Emergency Mode
        </Text>
        <View style={styles.back} />
      </View>
      <View style={styles.hero}>
        <View style={[styles.heroIcon, { backgroundColor: colors.semantic.expenseLight }]}>
          <Icon name="shield-outline" size={30} color={colors.semantic.expense} />
        </View>
        <Text
          style={[
            styles.eyebrow,
            { color: colors.semantic.expense, fontFamily: fontFamily.semibold },
          ]}
        >
          PROTOCOLS ENGAGED
        </Text>
        <Text style={[typography.h2, { color: colors.text.primary }]}>Emergency Mode</Text>
        <Text style={[typography.bodySmall, styles.center, { color: colors.text.tertiary }]}>
          Flexible allocations are frozen in this local protection preview to preserve essential
          liquidity.
        </Text>
      </View>
      <Card style={[styles.runway, { borderColor: colors.semantic.income }]}>
        <Text style={[styles.small, { color: colors.text.tertiary }]}>SURVIVAL RUNWAY HORIZON</Text>
        <Text
          style={[
            styles.runwayAmount,
            { color: colors.text.primary, fontFamily: fontFamily.semibold },
          ]}
        >
          4,650 MAD
        </Text>
        <Text style={[typography.bodySmall, { color: colors.semantic.income }]}>
          107.5% cash coverage · +350 MAD cushion
        </Text>
      </Card>
      <Text style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.medium }]}>
        Survival Directives (30D)
      </Text>
      <Card style={styles.card}>
        <Directive
          icon="home-outline"
          label="Housing & Rent"
          detail="Locked · due Oct 01"
          value="3,000 MAD"
        />
        <Directive
          icon="basket-outline"
          label="Essential Groceries"
          detail="Strict cap · 40 MAD/day max"
          value="1,200 MAD"
        />
        <Directive
          icon="flash-outline"
          label="Power & Work Fibre"
          detail="Electricity, water, fibre"
          value="450 MAD"
        />
      </Card>
      <Text style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.medium }]}>
        AI Containment Audits
      </Text>
      <Card style={styles.card}>
        <Directive
          icon="pause-circle-outline"
          label="Subscriptions suspended"
          detail="Drafted only; no provider permits revoked"
          value="+422 MAD"
        />
        <Directive
          icon="lock-closed-outline"
          label="Flexible envelopes"
          detail="Local plan set to zero"
          value="Enforced"
        />
        <Directive
          icon="shield-checkmark-outline"
          label="Reserve safeguard"
          detail="Non-essential spending review active"
          value="Armed"
        />
      </Card>
      <Card style={[styles.note, { backgroundColor: colors.background.tertiary }]}>
        <Icon name="information-circle-outline" size={17} color={colors.semantic.info} />
        <Text style={[typography.bodySmall, styles.flex, { color: colors.text.tertiary }]}>
          No external subscriptions, cards, or transfers are changed by this screen.
        </Text>
      </Card>
      {active ? (
        <Button
          label="Deactivate Emergency Mode"
          onPress={() => setActive(false)}
          variant="danger"
        />
      ) : (
        <Card style={[styles.done, { borderColor: colors.semantic.income }]}>
          <DataNotice
            icon="checkmark-circle-outline"
            label="Emergency-mode preview deactivated locally."
            tone="info"
          />
        </Card>
      )}
    </Screen>
  );
}
function Directive({
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
    <View style={styles.directive}>
      <View style={styles.directiveIcon}>
        <Icon name={icon} size={17} color={colors.semantic.info} />
      </View>
      <View style={styles.flex}>
        <Text
          style={[
            styles.directiveTitle,
            { color: colors.text.primary, fontFamily: fontFamily.medium },
          ]}
        >
          {label}
        </Text>
        <Text style={[styles.small, { color: colors.text.tertiary }]}>{detail}</Text>
      </View>
      <Text
        style={[
          styles.directiveValue,
          { color: colors.semantic.income, fontFamily: fontFamily.semibold },
        ]}
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
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 12, lineHeight: 18 },
  hero: { marginTop: 20, alignItems: 'center', gap: 6 },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: { fontSize: 10, lineHeight: 14 },
  center: { maxWidth: 320, textAlign: 'center', lineHeight: 19 },
  runway: { marginTop: 18, padding: 14, alignItems: 'center' },
  small: { fontSize: 10, lineHeight: 14 },
  runwayAmount: { marginTop: 4, fontSize: 30, lineHeight: 36, fontVariant: ['tabular-nums'] },
  section: { marginTop: 22, fontSize: 16, lineHeight: 22 },
  card: { marginTop: 8, paddingHorizontal: 12 },
  directive: { minHeight: 65, flexDirection: 'row', alignItems: 'center', gap: 9 },
  directiveIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  directiveTitle: { fontSize: 12, lineHeight: 16 },
  directiveValue: { maxWidth: 95, fontSize: 11, lineHeight: 15, textAlign: 'right' },
  note: { marginTop: 12, padding: 12, flexDirection: 'row', gap: 9, alignItems: 'center' },
  done: { marginTop: 12, padding: 14 },
});
