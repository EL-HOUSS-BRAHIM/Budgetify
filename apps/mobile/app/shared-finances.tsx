import { formatMoney, money } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, Screen } from '../src/components/ui';
import { useTheme } from '../src/theme/ThemeProvider';

const amount = (value: number) => formatMoney(money(value, 'MAD'), { compactZeroFraction: true });

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

export default function SharedFinancesScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [settlementPrepared, setSettlementPrepared] = useState(false);
  const [nudgePrepared, setNudgePrepared] = useState(false);

  return (
    <Screen contentContainerStyle={{ paddingTop: insets.top + 8 }}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.headerButton,
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
          Shared Finances Sub-view
        </Text>
        <View style={styles.headerButton} />
      </View>

      <Text
        style={[styles.eyebrow, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}
      >
        SHARED FINANCES · PREVIEW
      </Text>
      <DataNotice
        icon="eye-outline"
        label="Design preview · no invitations, settlements, nudges, or payments are executed"
        tone="info"
      />

      <Card style={[styles.netCard, { borderColor: colors.brand.accent }]}>
        <Text style={[styles.label, { color: colors.text.tertiary }]}>NET POSITION</Text>
        <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 2 }]}>
          In your favor
        </Text>
        <Text
          style={[styles.netAmount, { color: colors.semantic.income, fontFamily: fontFamily.bold }]}
        >
          + {amount(14000)}
        </Text>
        <Text style={[styles.small, { color: colors.text.tertiary }]}>
          Across 3 active peer connections
        </Text>
      </Card>

      <View style={styles.duoRow}>
        <Card style={styles.duoCard}>
          <Text style={[styles.label, { color: colors.text.tertiary }]}>OWED TO YOU</Text>
          <Text
            style={[
              styles.duoAmount,
              { color: colors.semantic.income, fontFamily: fontFamily.semibold },
            ]}
          >
            {amount(30000)}
          </Text>
          <Text style={[styles.small, { color: colors.text.tertiary }]}>Mehdi · Padel booking</Text>
        </Card>
        <Card style={styles.duoCard}>
          <Text style={[styles.label, { color: colors.text.tertiary }]}>YOU OWE</Text>
          <Text
            style={[
              styles.duoAmount,
              { color: colors.semantic.warning, fontFamily: fontFamily.semibold },
            ]}
          >
            {amount(16000)}
          </Text>
          <Text style={[styles.small, { color: colors.text.tertiary }]}>
            Ahmed · Dar Naji dinner
          </Text>
        </Card>
      </View>

      <Card style={styles.nlpCard}>
        <View style={styles.nlpHeader}>
          <View style={[styles.iconSmall, { backgroundColor: colors.brand.accentLight }]}>
            <Icon name="mic-outline" size={17} color={colors.semantic.info} />
          </View>
          <View style={styles.flex}>
            <Text
              style={[
                styles.rowTitle,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              Multiplayer Intelligence
            </Text>
            <Text style={[styles.small, { color: colors.semantic.income }]}>NLP Active</Text>
          </View>
        </View>
        <View style={styles.chipRow}>
          <View style={[styles.chip, { borderColor: colors.border.default }]}>
            <Text style={[styles.chipText, { color: colors.text.secondary }]}>
              “Taxi 45 split 3 ways”
            </Text>
          </View>
          <View style={[styles.chip, { borderColor: colors.border.default }]}>
            <Text style={[styles.chipText, { color: colors.text.secondary }]}>
              “Coffee 60 with Sara”
            </Text>
          </View>
        </View>
        <Text style={[styles.small, { color: colors.text.tertiary }]}>
          Spoken split intents compile to local draft splits only.
        </Text>
      </Card>

      <Text
        style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
      >
        Household · You & Sara
      </Text>
      <Card style={styles.card}>
        <View style={styles.poolHeader}>
          <View style={[styles.icon, { backgroundColor: colors.brand.accentLight }]}>
            <Icon name="home-outline" size={18} color={colors.semantic.info} />
          </View>
          <View style={styles.flex}>
            <Text
              style={[
                styles.rowTitle,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              Apartment Rent & Utilities
            </Text>
            <Text style={[styles.small, { color: colors.text.tertiary }]}>
              {amount(400000)} monthly pool
            </Text>
          </View>
        </View>
        <MemberRow
          detail="Settled · Checking"
          name="Brahim (You)"
          share="50%"
          tone="income"
          value={200000}
        />
        <MemberRow
          detail="Settled · In-App verified"
          last
          name="Sara"
          share="50%"
          tone="income"
          value={200000}
        />
        <View style={[styles.poolFooter, { borderTopColor: colors.border.subtle }]}>
          <Icon name="checkmark-circle" size={14} color={colors.semantic.income} />
          <Text style={[styles.small, styles.flex, { color: colors.semantic.income }]}>
            Fully settled for October · Zero friction
          </Text>
        </View>
      </Card>

      <Text
        style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
      >
        Group expense
      </Text>
      <Card style={styles.card}>
        <View style={styles.expenseHeader}>
          <View style={[styles.icon, { backgroundColor: colors.semantic.warningLight }]}>
            <Icon name="restaurant-outline" size={18} color={colors.semantic.warning} />
          </View>
          <View style={styles.flex}>
            <Text
              numberOfLines={2}
              style={[
                styles.rowTitle,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              Dinner at Dar Naji, Casablanca
            </Text>
            <Text style={[styles.small, { color: colors.text.tertiary }]}>
              Today 21:15 · Social gathering
            </Text>
          </View>
          <View style={styles.expenseTotal}>
            <Text
              style={[
                styles.duoAmount,
                { color: colors.semantic.expense, fontFamily: fontFamily.semibold },
              ]}
            >
              - {amount(48000)}
            </Text>
            <Text style={[styles.small, { color: colors.text.tertiary, textAlign: 'right' }]}>
              Group total
            </Text>
          </View>
        </View>
        <View style={[styles.quoteBox, { backgroundColor: colors.background.tertiary }]}>
          <Text style={[styles.quote, { color: colors.text.secondary }]}>
            “Me, Ahmed, and Sara. Ahmed paid the bill.”
          </Text>
          <Text style={[styles.small, { color: colors.text.tertiary }]}>
            Parsed via Lyvora NLP Engine · Audio transcribed (preview)
          </Text>
        </View>
        <Text style={[styles.breakdown, { color: colors.text.tertiary }]}>
          Breakdown: {amount(48000)} ÷ 3 people = {amount(16000)} / person
        </Text>
        <LedgerRow detail="Covered" name="Ahmed" tone="income" value={`+ ${amount(48000)}`} />
        <LedgerRow detail="Owes Ahmed · Pending" name="Sara" tone="warning" value={amount(16000)} />
        <LedgerRow
          detail="Owe Ahmed"
          last
          name="You (Brahim)"
          tone="warning"
          value={amount(16000)}
        />
      </Card>
      {settlementPrepared ? (
        <Card style={styles.confirmation}>
          <DataNotice
            icon="checkmark-circle-outline"
            label="Settlement review prepared locally. No payment was sent."
            tone="info"
          />
        </Card>
      ) : (
        <Button
          icon="flash-outline"
          label={`Prepare ${amount(16000)} settlement to Ahmed`}
          onPress={() => setSettlementPrepared(true)}
          style={styles.action}
        />
      )}
      <Text style={[styles.small, { color: colors.text.tertiary, marginTop: 6 }]}>
        Direct peer settlement is a future provider integration; this build only prepares a local
        review.
      </Text>

      <Text
        style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
      >
        Open peer ledger
      </Text>
      <Text style={[styles.small, { color: colors.text.tertiary, marginTop: 2 }]}>2 pending</Text>
      <Card style={styles.card}>
        <View style={styles.ledgerPersonRow}>
          <View style={[styles.avatar, { backgroundColor: colors.brand.accentLight }]}>
            <Text style={[styles.avatarText, { color: colors.semantic.info }]}>MB</Text>
          </View>
          <View style={styles.flex}>
            <Text
              style={[
                styles.rowTitle,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              Mehdi Benjelloun
            </Text>
            <Text style={[styles.small, { color: colors.text.tertiary }]}>
              Padel Court at Oasis Sports · Sunday
            </Text>
          </View>
          <Text
            style={[
              styles.duoAmount,
              { color: colors.semantic.income, fontFamily: fontFamily.semibold },
            ]}
          >
            + {amount(30000)}
          </Text>
        </View>
      </Card>
      {nudgePrepared ? (
        <Card style={styles.confirmation}>
          <DataNotice
            icon="checkmark-circle-outline"
            label="Nudge drafted locally. Nothing was sent."
            tone="info"
          />
        </Card>
      ) : (
        <Button
          icon="paper-plane-outline"
          label="Prepare payment nudge"
          onPress={() => setNudgePrepared(true)}
          style={styles.action}
          variant="secondary"
        />
      )}

      <Card style={styles.qrCard}>
        <View style={[styles.icon, { backgroundColor: colors.background.tertiary }]}>
          <Icon name="qr-code-outline" size={22} color={colors.text.secondary} />
        </View>
        <View style={styles.flex}>
          <Text
            style={[styles.rowTitle, { color: colors.text.primary, fontFamily: fontFamily.medium }]}
          >
            Show my Lyvora split QR / Scan friend
          </Text>
          <Text style={[styles.small, { color: colors.text.tertiary }]}>
            Preview only · no QR identity is generated in this build
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

function MemberRow({
  detail,
  last = false,
  name,
  share,
  tone,
  value,
}: {
  detail: string;
  last?: boolean;
  name: string;
  share: string;
  tone: 'income' | 'warning';
  value: number;
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View
      style={[
        styles.memberRow,
        !last && { borderBottomColor: colors.border.subtle, borderBottomWidth: 1 },
      ]}
    >
      <View style={styles.flex}>
        <Text
          style={[styles.rowTitle, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
        >
          {name} · {share}
        </Text>
        <Text style={[styles.small, { color: colors.semantic[tone] }]}>{detail}</Text>
      </View>
      <Text
        style={[styles.memberValue, { color: colors.text.primary, fontFamily: fontFamily.medium }]}
      >
        {amount(value)}
      </Text>
    </View>
  );
}

function LedgerRow({
  detail,
  last = false,
  name,
  tone,
  value,
}: {
  detail: string;
  last?: boolean;
  name: string;
  tone: 'income' | 'warning';
  value: string;
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View
      style={[
        styles.memberRow,
        !last && { borderBottomColor: colors.border.subtle, borderBottomWidth: 1 },
      ]}
    >
      <View
        style={[
          styles.statusDot,
          {
            backgroundColor: tone === 'income' ? colors.semantic.income : colors.semantic.warning,
          },
        ]}
      />
      <View style={styles.flex}>
        <Text
          style={[styles.rowTitle, { color: colors.text.primary, fontFamily: fontFamily.medium }]}
        >
          {name}
        </Text>
        <Text style={[styles.small, { color: colors.text.tertiary }]}>{detail}</Text>
      </View>
      <Text
        style={[
          styles.memberValue,
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
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 12, lineHeight: 18 },
  eyebrow: { marginTop: 20, fontSize: 10, lineHeight: 14 },
  netCard: { marginTop: 14, padding: 16 },
  label: { fontSize: 9, lineHeight: 13, letterSpacing: 0.5 },
  netAmount: { marginTop: 4, fontSize: 30, lineHeight: 38, fontVariant: ['tabular-nums'] },
  small: { fontSize: 10, lineHeight: 14 },
  duoRow: { marginTop: 10, flexDirection: 'row', gap: 10 },
  duoCard: { flex: 1, padding: 12 },
  duoAmount: { marginTop: 4, fontSize: 16, lineHeight: 22, fontVariant: ['tabular-nums'] },
  nlpCard: { marginTop: 10, padding: 12 },
  nlpHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chipRow: { marginTop: 10, flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontSize: 10, lineHeight: 14 },
  section: { marginTop: 22, fontSize: 16, lineHeight: 22 },
  card: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4 },
  poolHeader: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: { width: 38, height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  iconSmall: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  rowTitle: { fontSize: 12, lineHeight: 17 },
  memberRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10 },
  memberValue: { fontSize: 12, lineHeight: 17, fontVariant: ['tabular-nums'] },
  poolFooter: {
    minHeight: 40,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expenseHeader: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10 },
  expenseTotal: { alignItems: 'flex-end' },
  quoteBox: { marginTop: 4, borderRadius: 8, padding: 10 },
  quote: { fontSize: 11, lineHeight: 16, fontStyle: 'italic' },
  breakdown: { marginVertical: 8, fontSize: 10, lineHeight: 14 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  action: { marginTop: 12 },
  confirmation: { marginTop: 12, padding: 14 },
  ledgerPersonRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 12, lineHeight: 16 },
  qrCard: { marginTop: 14, marginBottom: 8, padding: 14, flexDirection: 'row', gap: 10 },
});
