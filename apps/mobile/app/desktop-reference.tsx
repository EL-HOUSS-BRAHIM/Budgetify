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
export default function DesktopReferenceScreen(): React.ReactElement {
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
          Desktop Reference
        </Text>
        <View style={styles.headerButton} />
      </View>
      <Text
        style={[styles.eyebrow, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}
      >
        DESKTOP COMMAND CENTER · REFERENCE
      </Text>
      <Text style={[typography.h2, { color: colors.text.primary, marginTop: 5 }]}>
        The wide view of Lyvora
      </Text>
      <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 4 }]}>
        A composition reference for a future web and desktop experience.
      </Text>
      <DataNotice
        icon="desktop-outline"
        label="Reference only · this screen is not a desktop web implementation"
        tone="warning"
      />
      <Card style={styles.canvas}>
        <View style={styles.topbar}>
          <Text
            style={[styles.logo, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
          >
            Lyvora
          </Text>
          <View style={[styles.user, { backgroundColor: colors.semantic.incomeLight }]}>
            <Icon name="person-outline" size={16} color={colors.semantic.income} />
          </View>
        </View>
        <View style={styles.columns}>
          <View style={styles.sidebar}>
            <Text
              style={[
                styles.navActive,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              Command Center
            </Text>
            <Text style={[styles.nav, { color: colors.text.tertiary }]}>Money</Text>
            <Text style={[styles.nav, { color: colors.text.tertiary }]}>Plan</Text>
            <Text style={[styles.nav, { color: colors.text.tertiary }]}>Goals</Text>
          </View>
          <View style={styles.dashboard}>
            <Text
              style={[
                styles.dashTitle,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              Good morning, Brahim
            </Text>
            <View style={styles.metricRow}>
              <Metric label="Safe-to-Spend" value="2,450 MAD" tone="income" />
              <Metric label="Health" value="82 / 100" tone="info" />
            </View>
            <View style={[styles.widePanel, { backgroundColor: colors.background.tertiary }]}>
              <Text style={[styles.panelLabel, { color: colors.text.tertiary }]}>
                CONTINUUM TIMELINE
              </Text>
              <View style={styles.timeline}>
                <View style={[styles.timelineFill, { backgroundColor: colors.semantic.info }]} />
              </View>
              <Text style={[styles.panelText, { color: colors.text.secondary }]}>
                Salary day · bills · goals · projected month end
              </Text>
            </View>
          </View>
        </View>
      </Card>
      <Card style={styles.note}>
        <Icon name="code-slash-outline" size={18} color={colors.semantic.info} />
        <Text style={[styles.small, { color: colors.text.tertiary }]}>
          The future web build should reuse the same data boundaries, preview labeling, and
          approval-only financial actions as the mobile product.
        </Text>
      </Card>
    </Screen>
  );
}
function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'income' | 'info';
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View style={[styles.metric, { borderColor: colors.border.default }]}>
      <Text style={[styles.panelLabel, { color: colors.text.tertiary }]}>{label}</Text>
      <Text
        style={[
          styles.metricValue,
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
  eyebrow: { marginTop: 22, fontSize: 10, lineHeight: 14 },
  canvas: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#111B2C',
    borderColor: '#263A57',
    minHeight: 290,
  },
  topbar: {
    height: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: { fontSize: 14 },
  user: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  columns: { flex: 1, marginTop: 16, flexDirection: 'row', gap: 12 },
  sidebar: { width: 80, gap: 15 },
  navActive: { fontSize: 9, lineHeight: 13 },
  nav: { fontSize: 9, lineHeight: 13 },
  dashboard: { flex: 1 },
  dashTitle: { fontSize: 16, lineHeight: 22 },
  metricRow: { marginTop: 12, flexDirection: 'row', gap: 7 },
  metric: { flex: 1, padding: 8, borderWidth: 1, borderRadius: 6 },
  panelLabel: { fontSize: 8, lineHeight: 12, letterSpacing: 0.4 },
  metricValue: { marginTop: 5, fontSize: 13, lineHeight: 18 },
  widePanel: { marginTop: 10, padding: 10, borderRadius: 6 },
  timeline: {
    height: 6,
    marginTop: 10,
    borderRadius: 3,
    backgroundColor: '#29394C',
    overflow: 'hidden',
  },
  timelineFill: { width: '66%', height: '100%' },
  panelText: { marginTop: 8, fontSize: 9, lineHeight: 13 },
  note: { marginTop: 14, padding: 14, flexDirection: 'row', gap: 10 },
  small: { flex: 1, fontSize: 10, lineHeight: 15 },
});
