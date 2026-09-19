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

export default function PlatformSurfaceScreen(): React.ReactElement {
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
          Platform Surface
        </Text>
        <View style={styles.headerButton} />
      </View>
      <Text
        style={[styles.eyebrow, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}
      >
        LOCK SCREEN & DYNAMIC ISLAND · REFERENCE
      </Text>
      <Text style={[typography.h2, { color: colors.text.primary, marginTop: 5 }]}>
        Ambient financial awareness
      </Text>
      <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 4 }]}>
        A native surface concept for moments when the app is not open.
      </Text>
      <DataNotice
        icon="information-circle-outline"
        label="Reference only · native lock-screen and live-activity APIs are not active in this build"
        tone="warning"
      />

      <Card style={styles.phone}>
        <View style={styles.statusBar}>
          <Text style={[styles.statusText, { color: colors.text.primary }]}>18:42</Text>
          <View style={styles.statusRight}>
            <Icon name="lock-closed" size={10} color={colors.text.tertiary} />
            <Text style={[styles.statusText, { color: colors.text.tertiary }]}>
              Secured by Lyvora
            </Text>
            <Icon name="battery-three-quarters-outline" size={12} color={colors.text.tertiary} />
            <Text style={[styles.statusText, { color: colors.text.tertiary }]}>88%</Text>
          </View>
        </View>

        <View style={styles.island}>
          <View style={[styles.dot, { backgroundColor: colors.semantic.income }]} />
          <View>
            <Text
              style={[
                styles.islandTitle,
                { color: colors.text.inverse, fontFamily: fontFamily.semibold },
              ]}
            >
              Lyvora Live · Active pulse
            </Text>
            <Text style={[styles.islandText, { color: colors.text.inverse }]}>
              Safe-to-Spend 1,160 MAD
            </Text>
          </View>
          <View style={styles.islandMeta}>
            <Text style={[styles.islandText, { color: colors.text.inverse }]}>Sun, Sep 13</Text>
            <Text style={[styles.islandText, { color: colors.text.inverse }]}>24°</Text>
          </View>
        </View>

        <View style={styles.notificationStack}>
          <View style={[styles.notification, { backgroundColor: '#18263A' }]}>
            <View style={styles.notificationHeader}>
              <Icon name="sparkles" size={13} color={colors.semantic.info} />
              <Text
                style={[
                  styles.notificationApp,
                  { color: colors.text.secondary, fontFamily: fontFamily.semibold },
                ]}
              >
                LYVORA INTELLIGENCE
              </Text>
              <Text style={[styles.notificationTime, { color: colors.text.tertiary }]}>
                Just now
              </Text>
            </View>
            <Text
              style={[
                styles.notificationTitle,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              Salary received · +5,000 MAD
            </Text>
            <Text style={[styles.notificationBody, { color: colors.text.tertiary }]}>
              Attijariwafa Bank direct deposit detected. Your zero-based October waterfall
              distribution is prepared.
            </Text>
            <View style={styles.waterfallRow}>
              <WaterfallChip label="Fixed bills" value="1,100" />
              <WaterfallChip label="Goals" value="1,000" />
              <WaterfallChip label="Buffer" value="500" />
              <WaterfallChip highlight label="Safe spend" value="1,700" />
            </View>
            <View style={styles.notificationActions}>
              <Text style={[styles.actionText, { color: colors.semantic.income }]}>
                Distribute now
              </Text>
              <Text style={[styles.actionText, { color: colors.semantic.info }]}>
                View details
              </Text>
            </View>
            <Text style={[styles.notificationFoot, { color: colors.semantic.income }]}>
              Waterfall executed cleanly · October envelopes locked
            </Text>
          </View>

          <View style={[styles.notification, { backgroundColor: '#18263A' }]}>
            <View style={styles.notificationHeader}>
              <Icon name="shield-checkmark-outline" size={13} color={colors.semantic.warning} />
              <Text
                style={[
                  styles.notificationApp,
                  { color: colors.text.secondary, fontFamily: fontFamily.semibold },
                ]}
              >
                LYVORA GUARD
              </Text>
              <Text style={[styles.notificationTime, { color: colors.text.tertiary }]}>2h ago</Text>
            </View>
            <Text
              style={[
                styles.notificationTitle,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              Budget velocity warning · Dining
            </Text>
            <Text style={[styles.notificationBody, { color: colors.text.tertiary }]}>
              You spent 85 MAD at Le Petit Rocher. Dining pacing is currently 18% above target.
            </Text>
            <Text style={[styles.notificationBody, { color: colors.semantic.warning }]}>
              Adjusted Safe-to-Spend · 1,075 MAD
            </Text>
            <View style={styles.notificationActions}>
              <Text style={[styles.actionText, { color: colors.semantic.info }]}>
                Read AI insight
              </Text>
              <Text style={[styles.actionText, { color: colors.text.tertiary }]}>Dismiss</Text>
            </View>
          </View>

          <View style={[styles.notification, { backgroundColor: '#18263A' }]}>
            <View style={styles.notificationHeader}>
              <Icon name="repeat-outline" size={13} color={colors.semantic.income} />
              <Text
                style={[
                  styles.notificationApp,
                  { color: colors.text.secondary, fontFamily: fontFamily.semibold },
                ]}
              >
                LYVORA CONTINUUM
              </Text>
              <Text style={[styles.notificationTime, { color: colors.text.tertiary }]}>
                Sep 15 · Verified
              </Text>
            </View>
            <Text style={[styles.notificationBody, { color: colors.text.tertiary }]}>
              Wi-Fi Fibre bill (199 MAD) auto-debit ready.
            </Text>
          </View>
        </View>

        <Text style={[styles.unlock, { color: colors.text.tertiary }]}>Swipe up to unlock</Text>
      </Card>

      <Card style={styles.notes}>
        <Text
          style={[styles.sectionTitle, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
        >
          Native handoff
        </Text>
        <Text style={[styles.small, { color: colors.text.tertiary }]}>
          The eventual implementation belongs in Android lock-screen notification and live-surface
          integrations. This preview defines the content contract — Safe-to-Spend status, salary
          waterfall, guard warnings, and continuum events — without claiming OS-level behavior.
        </Text>
      </Card>
    </Screen>
  );
}

function WaterfallChip({
  highlight = false,
  label,
  value,
}: {
  highlight?: boolean;
  label: string;
  value: string;
}): React.ReactElement {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: highlight ? '#123324' : '#101B2B',
          borderColor: highlight ? colors.semantic.income : '#263A57',
        },
      ]}
    >
      <Text style={[styles.chipLabel, { color: colors.text.tertiary }]}>{label}</Text>
      <Text
        style={[
          styles.chipValue,
          { color: highlight ? colors.semantic.income : colors.text.primary },
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
  phone: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#0B1322',
    borderColor: '#263A57',
    overflow: 'hidden',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: { fontSize: 10, lineHeight: 14 },
  statusRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  island: {
    alignSelf: 'center',
    marginTop: 10,
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#050A13',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  islandTitle: { fontSize: 9, lineHeight: 12 },
  islandText: { fontSize: 9, lineHeight: 13 },
  islandMeta: { alignItems: 'flex-end' },
  notificationStack: { marginTop: 14, gap: 10 },
  notification: { borderRadius: 12, padding: 12 },
  notificationHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notificationApp: { flex: 1, fontSize: 8, lineHeight: 12, letterSpacing: 0.6 },
  notificationTime: { fontSize: 8, lineHeight: 12 },
  notificationTitle: { marginTop: 6, fontSize: 12, lineHeight: 17 },
  notificationBody: { marginTop: 3, fontSize: 10, lineHeight: 15 },
  waterfallRow: { marginTop: 8, flexDirection: 'row', gap: 6 },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  chipLabel: { fontSize: 8, lineHeight: 11 },
  chipValue: { fontSize: 10, lineHeight: 14, fontVariant: ['tabular-nums'] },
  notificationActions: { marginTop: 8, flexDirection: 'row', gap: 16 },
  actionText: { fontSize: 10, lineHeight: 15 },
  notificationFoot: { marginTop: 8, fontSize: 9, lineHeight: 13 },
  unlock: { marginTop: 14, textAlign: 'center', fontSize: 10, lineHeight: 15 },
  notes: { marginTop: 14, marginBottom: 8, padding: 14 },
  sectionTitle: { fontSize: 16, lineHeight: 22, marginBottom: 5 },
  small: { fontSize: 10, lineHeight: 15 },
});
