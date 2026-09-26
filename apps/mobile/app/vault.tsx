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

export default function VaultScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [preparedAction, setPreparedAction] = useState<string | null>(null);

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
          Document Vault
        </Text>
        <View style={styles.headerButton} />
      </View>

      <Text
        style={[styles.eyebrow, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}
      >
        DOCUMENT VAULT · PREVIEW
      </Text>
      <Text style={[typography.h2, { color: colors.text.primary, marginTop: 5 }]}>
        Encrypted neural vault
      </Text>
      <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 4 }]}>
        Contracts, statements, and receipts parsed into decisions.
      </Text>
      <DataNotice
        icon="eye-outline"
        label="Design preview · documents are sample records; nothing is uploaded or shared"
        tone="info"
      />

      <Card style={styles.secureCard}>
        <View style={[styles.lock, { backgroundColor: colors.semantic.incomeLight }]}>
          <Icon name="lock-closed-outline" size={23} color={colors.semantic.income} />
        </View>
        <View style={styles.flex}>
          <Text
            style={[styles.title, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
          >
            Vault protected
          </Text>
          <Text style={[styles.small, { color: colors.text.tertiary }]}>
            Zero-retention cryptographic vault · local review only
          </Text>
        </View>
        <Text
          style={[
            styles.status,
            { color: colors.semantic.income, fontFamily: fontFamily.semibold },
          ]}
        >
          SECURE
        </Text>
      </Card>

      <Text
        style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
      >
        Latest extraction
      </Text>
      <Card style={styles.card}>
        <View style={styles.docHeader}>
          <View style={[styles.docIcon, { backgroundColor: colors.brand.accentLight }]}>
            <Icon name="document-text-outline" size={19} color={colors.semantic.info} />
          </View>
          <View style={styles.flex}>
            <Text
              style={[
                styles.title,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              Apartment Lease Agreement.pdf
            </Text>
            <Text style={[styles.small, { color: colors.text.tertiary }]}>
              Uploaded yesterday · 2.4 MB · sample record
            </Text>
          </View>
        </View>
        <View style={[styles.confidenceRow, { borderColor: colors.semantic.income }]}>
          <Icon name="sparkles-outline" size={15} color={colors.semantic.income} />
          <Text style={[styles.small, styles.flex, { color: colors.semantic.income }]}>
            AI parsed & verified · Extraction confidence 99.4%
          </Text>
        </View>
        <ExtractionRow label="RENT AMOUNT" value="3,500 MAD / mo" />
        <ExtractionRow label="DUE SCHEDULE" value="5th every month · auto-debit available" />
        <ExtractionRow label="NEXT ESCALATION" tone="warning" value="Jan 2027 · +5% NLP clause" />
        <ExtractionRow label="SECURITY DEPOSIT" last value="7,000 MAD · escrow" />
        <View style={styles.docActions}>
          <Button
            icon="flash-outline"
            label="Prepare bill addition"
            onPress={() => setPreparedAction('bill')}
            style={styles.docAction}
            variant="secondary"
          />
          <Button
            icon="calendar-outline"
            label="Prepare escalation reminder"
            onPress={() => setPreparedAction('reminder')}
            style={styles.docAction}
            variant="text"
          />
        </View>
        {preparedAction === 'bill' && (
          <DataNotice
            icon="checkmark-circle-outline"
            label="Bill addition prepared locally. No plan item was created."
            tone="info"
          />
        )}
        {preparedAction === 'reminder' && (
          <DataNotice
            icon="checkmark-circle-outline"
            label="Escalation reminder prepared locally. No calendar event was created."
            tone="info"
          />
        )}
        <Text style={[styles.small, { color: colors.text.tertiary, marginTop: 8 }]}>
          Lyvora AI has indexed this sample contract. In the full product you could query lease
          terms, notice periods, and deposit clauses directly in the copilot.
        </Text>
      </Card>

      <Text
        style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
      >
        Monitored contracts
      </Text>
      <Text style={[styles.small, { color: colors.text.tertiary, marginTop: 2 }]}>
        3 sample records under watch
      </Text>
      <Card style={styles.card}>
        <ContractRow
          detail="1,850 MAD/yr · Renews Nov 14, 2025"
          icon="car-outline"
          status="CALENDAR SYNCED"
          title="Allianz Car Insurance.pdf"
          tone="info"
        />
        <ContractRow
          detail="Notice period: 30 days prior"
          icon="fitness-outline"
          status="ARMED FOR OCT 15"
          title="CitySport Gym Terms.pdf"
          tone="warning"
        />
        <ContractRow
          detail="199 MAD/mo · 24-month lock · Expires Mar 2027"
          icon="wifi-outline"
          last
          status="LOCKED TERM"
          title="Maroc Telecom Fibre Contract.pdf"
          tone="income"
        />
      </Card>

      <Card style={[styles.upload, { borderColor: colors.border.strong }]}>
        <Icon name="cloud-upload-outline" size={22} color={colors.semantic.info} />
        <View style={styles.flex}>
          <Text
            style={[styles.title, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
          >
            Scan or drop a contract
          </Text>
          <Text style={[styles.small, { color: colors.text.tertiary }]}>
            PDF, HEIC, or scanned invoice · upload disabled in this preview build
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

function ExtractionRow({
  label,
  last = false,
  tone = 'info',
  value,
}: {
  label: string;
  last?: boolean;
  tone?: 'info' | 'warning';
  value: string;
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View
      style={[
        styles.extractRow,
        !last && { borderBottomColor: colors.border.subtle, borderBottomWidth: 1 },
      ]}
    >
      <Text style={[styles.label, { color: colors.text.tertiary }]}>{label}</Text>
      <Text
        style={[
          styles.extractValue,
          {
            color: tone === 'warning' ? colors.semantic.warning : colors.text.primary,
            fontFamily: fontFamily.semibold,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function ContractRow({
  detail,
  icon,
  last = false,
  status,
  title,
  tone,
}: {
  detail: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  last?: boolean;
  status: string;
  title: string;
  tone: 'income' | 'info' | 'warning';
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  const background =
    tone === 'income'
      ? colors.semantic.incomeLight
      : tone === 'warning'
        ? colors.semantic.warningLight
        : colors.brand.accentLight;
  return (
    <View
      style={[
        styles.contractRow,
        !last && { borderBottomColor: colors.border.subtle, borderBottomWidth: 1 },
      ]}
    >
      <View style={[styles.docIcon, { backgroundColor: background }]}>
        <Icon name={icon} size={18} color={colors.semantic[tone]} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.title, { color: colors.text.primary, fontFamily: fontFamily.medium }]}>
          {title}
        </Text>
        <Text style={[styles.small, { color: colors.text.tertiary }]}>{detail}</Text>
      </View>
      <Text style={[styles.status, { color: colors.semantic[tone] }]}>{status}</Text>
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
  secureCard: { marginTop: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  lock: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  title: { fontSize: 12, lineHeight: 17 },
  small: { fontSize: 10, lineHeight: 14 },
  status: { fontSize: 9, lineHeight: 14 },
  section: { marginTop: 22, fontSize: 16, lineHeight: 22 },
  card: { marginTop: 8, padding: 12 },
  docHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  docIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidenceRow: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 8,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  extractRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  label: { fontSize: 9, lineHeight: 13, letterSpacing: 0.5 },
  extractValue: { flexShrink: 1, textAlign: 'right', fontSize: 11, lineHeight: 15 },
  docActions: { marginTop: 10, flexDirection: 'row', gap: 8 },
  docAction: { flex: 1, paddingHorizontal: 6 },
  contractRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10 },
  upload: {
    marginTop: 14,
    marginBottom: 8,
    padding: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
