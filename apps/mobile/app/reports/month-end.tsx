import { formatMoney, money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, Screen } from '../../src/components/ui';
import { useTheme } from '../../src/theme/ThemeProvider';
const amount = (n: number) => formatMoney(money(n, 'MAD'), { compactZeroFraction: true });
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
export default function MonthEndReport(): React.ReactElement {
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
            styles.back,
            { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <Icon name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <Text
          style={[styles.head, { color: colors.text.secondary, fontFamily: fontFamily.medium }]}
        >
          Month-End Report
        </Text>
        <View style={styles.back} />
      </View>
      <View style={styles.hero}>
        <Text
          style={[
            styles.eyebrow,
            { color: colors.semantic.warning, fontFamily: fontFamily.semibold },
          ]}
        >
          SEPTEMBER · UNFILTERED REVIEW
        </Text>
        <Text style={[typography.h2, { color: colors.text.primary }]}>The brutal report</Text>
        <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
          Design preview · sample monthly insights
        </Text>
      </View>
      <Card style={[styles.score, { borderColor: colors.semantic.warning }]}>
        <Text style={[styles.small, { color: colors.text.tertiary }]}>FINANCIAL DISCIPLINE</Text>
        <Text
          style={[
            styles.scoreValue,
            { color: colors.text.primary, fontFamily: fontFamily.semibold },
          ]}
        >
          74 / 100
        </Text>
        <Text style={[typography.bodySmall, { color: colors.semantic.warning }]}>
          You are solvent, but dining and impulse spending need attention.
        </Text>
      </Card>
      <Text style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.medium }]}>
        Month in numbers
      </Text>
      <Card style={styles.card}>
        <Stat label="Income captured" value={amount(500000)} tone="income" />
        <Stat label="Committed spending" value={amount(310000)} tone="warning" />
        <Stat label="Goal contribution" value={amount(100000)} tone="info" />
      </Card>
      <Text style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.medium }]}>
        The honest take
      </Text>
      <Card style={styles.card}>
        <Text
          style={[
            typography.bodyMedium,
            { color: colors.text.primary, fontFamily: fontFamily.medium },
          ]}
        >
          Dining ran 15% above your intended pace.
        </Text>
        <Text
          style={[
            typography.bodySmall,
            { color: colors.text.secondary, marginTop: 7, lineHeight: 19 },
          ]}
        >
          You kept the safety floor intact, but two unplanned nights out reduced the motorcycle goal
          velocity. Redirecting 300 MAD next month restores the target date.
        </Text>
      </Card>
      <View style={styles.actions}>
        <Button
          label="Prepare next-month plan"
          onPress={() => setNotice('Next-month plan prepared locally. No budget was changed.')}
          style={styles.action}
          variant="secondary"
        />
        <Button
          label="Ask Copilot"
          onPress={() => router.push('/(tabs)/assistant')}
          style={styles.action}
          variant="text"
        />
      </View>
      {notice && <DataNotice label={notice} tone="info" />}
    </Screen>
  );
}
function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'income' | 'warning' | 'info';
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[styles.small, { color: colors.text.tertiary }]}>{label}</Text>
      <Text
        style={[
          styles.statValue,
          { color: colors.semantic[tone], fontFamily: fontFamily.semibold },
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
  head: { fontSize: 12, lineHeight: 18 },
  hero: { marginTop: 20, alignItems: 'center', gap: 6 },
  eyebrow: { fontSize: 10, lineHeight: 14 },
  score: { marginTop: 20, padding: 14, alignItems: 'center' },
  small: { fontSize: 10, lineHeight: 14 },
  scoreValue: { marginVertical: 5, fontSize: 30, lineHeight: 36 },
  section: { marginTop: 22, fontSize: 16, lineHeight: 22 },
  card: { marginTop: 8, padding: 14 },
  stat: { minHeight: 50, justifyContent: 'center' },
  statValue: { marginTop: 2, fontSize: 16, lineHeight: 22, fontVariant: ['tabular-nums'] },
  actions: { marginTop: 12, flexDirection: 'row', gap: 8 },
  action: { flex: 1, paddingHorizontal: 8 },
});
