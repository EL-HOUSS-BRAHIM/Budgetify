import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, DataNotice, Screen } from '../src/components/ui';
import { useProfile, type AiContextScope, type ProfileRow } from '../src/features/profile/profile';
import { useTheme } from '../src/theme/ThemeProvider';

function DecorativeIcon(props: React.ComponentProps<typeof Ionicons>): React.ReactElement {
  return (
    <Ionicons
      {...props}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

function profileScope(profile: ProfileRow | null): AiContextScope {
  const value = profile?.ai_context_scope;
  if (value === 'limited' || value === 'none') return value;
  return 'full';
}

export default function PrivacyScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, isLoading, isSaving, error, updateProfile } = useProfile();
  const [notice, setNotice] = useState<string | null>(null);
  const scope = profileScope(profile);

  const saveScope = async (nextScope: AiContextScope) => {
    try {
      await updateProfile({ aiContextScope: nextScope });
      setNotice('AI context scope saved.');
    } catch {
      setNotice('AI context scope could not be saved.');
    }
  };

  const saveToggle = async (
    key: 'autoCategorizeEnabled' | 'intelligentAlertsEnabled',
    value: boolean,
  ) => {
    try {
      await updateProfile({ [key]: value });
      setNotice('Privacy preference saved.');
    } catch {
      setNotice('Privacy preference could not be saved.');
    }
  };

  return (
    <Screen contentContainerStyle={{ paddingTop: insets.top + 8 }}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <DecorativeIcon name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            { color: colors.text.secondary, fontFamily: fontFamily.medium },
          ]}
        >
          Privacy Settings
        </Text>
        <View style={styles.iconButton} />
      </View>
      <View style={styles.hero}>
        <View style={[styles.heroIcon, { backgroundColor: colors.semantic.incomeLight }]}>
          <DecorativeIcon
            name="shield-checkmark-outline"
            size={27}
            color={colors.semantic.income}
          />
        </View>
        <Text
          style={[styles.eyebrow, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}
        >
          SECURITY & GOVERNANCE
        </Text>
        <Text style={[typography.h2, { color: colors.text.primary }]}>Privacy & AI Access</Text>
        <Text style={[typography.bodySmall, styles.heroCopy, { color: colors.text.tertiary }]}>
          Control what Lyvora may inspect when producing explanations and recommendations.
        </Text>
      </View>

      {isLoading ? (
        <View accessibilityLabel="Loading privacy settings" style={styles.loading}>
          <ActivityIndicator color={colors.semantic.info} />
        </View>
      ) : error ? (
        <DataNotice icon="alert-circle-outline" label={error} tone="expense" />
      ) : (
        <>
          <Card style={[styles.vaultCard, { borderColor: colors.semantic.income }]}>
            <View style={[styles.vaultIcon, { backgroundColor: colors.semantic.incomeLight }]}>
              <DecorativeIcon name="lock-closed-outline" size={18} color={colors.semantic.income} />
            </View>
            <View style={styles.vaultCopy}>
              <Text
                style={[
                  styles.vaultTitle,
                  { color: colors.text.primary, fontFamily: fontFamily.semibold },
                ]}
              >
                Profile-scoped controls
              </Text>
              <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
                These choices are stored in your profile and restored after sign-in.
              </Text>
            </View>
          </Card>

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text.primary, fontFamily: fontFamily.medium },
            ]}
          >
            AI Context Scope
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.text.tertiary }]}>
            Choose what Lyvora can inspect for analysis.
          </Text>
          <ScopeCard
            active={scope === 'full'}
            description="Balances, goals, salary cycles, and transaction history for liquidity and forecast calculations."
            icon="analytics-outline"
            onPress={() => void saveScope('full')}
            title="Full Financial Context"
            tone="info"
          />
          <ScopeCard
            active={scope === 'limited'}
            description="Transaction categories only. Lyvora cannot use balances or goals for recommendations."
            icon="receipt-outline"
            onPress={() => void saveScope('limited')}
            title="Transactions & Categories Only"
            tone="income"
          />
          <ScopeCard
            active={scope === 'none'}
            description="Disables financial AI context. Manual ledger screens continue to work."
            icon="hand-left-outline"
            onPress={() => void saveScope('none')}
            title="No Financial AI"
            tone="warning"
          />

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text.primary, fontFamily: fontFamily.medium },
            ]}
          >
            Automation Permissions
          </Text>
          <Card style={styles.permissionCard}>
            <PermissionRow
              description="High-confidence transaction classification only."
              label="Auto-categorize transactions"
              onChange={(value) => void saveToggle('autoCategorizeEnabled', value)}
              value={profile?.auto_categorize_enabled ?? true}
            />
            <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
            <PermissionRow
              description="Scans recurring charges for fee increases and commitment risk."
              label="Intelligent push alerts"
              onChange={(value) => void saveToggle('intelligentAlertsEnabled', value)}
              value={profile?.intelligent_alerts_enabled ?? true}
            />
            <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
            <View style={styles.permissionRow}>
              <View style={styles.permissionCopy}>
                <Text
                  style={[
                    styles.permissionLabel,
                    { color: colors.text.primary, fontFamily: fontFamily.medium },
                  ]}
                >
                  Auto-transfer money to savings
                </Text>
                <Text style={[styles.permissionDescription, { color: colors.text.tertiary }]}>
                  Unavailable. Every transfer requires explicit approval and a supported account
                  connection.
                </Text>
              </View>
              <View style={[styles.blockedPill, { backgroundColor: colors.semantic.warningLight }]}>
                <Text
                  style={[
                    styles.blockedText,
                    { color: colors.semantic.warning, fontFamily: fontFamily.medium },
                  ]}
                >
                  Approval required
                </Text>
              </View>
            </View>
          </Card>
          {isSaving && (
            <DataNotice icon="cloud-upload-outline" label="Saving preference..." tone="info" />
          )}
          {notice && <DataNotice label={notice} tone="info" />}
        </>
      )}
    </Screen>
  );
}

function ScopeCard({
  active,
  description,
  icon,
  onPress,
  title,
  tone,
}: {
  active: boolean;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  title: string;
  tone: 'income' | 'warning' | 'info';
}): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();
  const color = colors.semantic[tone];
  return (
    <Pressable
      accessibilityLabel={`Select ${title}`}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.scopeCard,
        {
          backgroundColor: colors.background.card,
          borderColor: active ? color : colors.border.default,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.scopeIcon,
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
        <DecorativeIcon name={icon} size={18} color={color} />
      </View>
      <View style={styles.scopeCopy}>
        <Text
          style={[
            styles.scopeTitle,
            { color: colors.text.primary, fontFamily: fontFamily.semibold },
          ]}
        >
          {title}
        </Text>
        <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>{description}</Text>
      </View>
      <View style={[styles.radio, { borderColor: active ? color : colors.border.strong }]}>
        {active && <View style={[styles.radioFill, { backgroundColor: color }]} />}
      </View>
    </Pressable>
  );
}

function PermissionRow({
  description,
  label,
  onChange,
  value,
}: {
  description: string;
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View style={styles.permissionRow}>
      <View style={styles.permissionCopy}>
        <Text
          style={[
            styles.permissionLabel,
            { color: colors.text.primary, fontFamily: fontFamily.medium },
          ]}
        >
          {label}
        </Text>
        <Text style={[styles.permissionDescription, { color: colors.text.tertiary }]}>
          {description}
        </Text>
      </View>
      <Switch
        accessibilityLabel={label}
        onValueChange={onChange}
        trackColor={{ false: colors.border.strong, true: colors.semantic.income }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { minHeight: 180, alignItems: 'center', justifyContent: 'center' },
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 12, lineHeight: 18 },
  hero: { marginTop: 20, alignItems: 'center', gap: 6 },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  eyebrow: { fontSize: 10, lineHeight: 14, letterSpacing: 0 },
  heroCopy: { maxWidth: 320, textAlign: 'center', lineHeight: 19 },
  vaultCard: { marginTop: 18, padding: 12, flexDirection: 'row', gap: 9, borderWidth: 1 },
  vaultIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultCopy: { flex: 1, gap: 4 },
  vaultTitle: { fontSize: 11, lineHeight: 15 },
  sectionTitle: { marginTop: 22, fontSize: 16, lineHeight: 22 },
  sectionSubtitle: { marginTop: 3, fontSize: 10, lineHeight: 14 },
  scopeCard: {
    minHeight: 86,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  scopeIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scopeCopy: { flex: 1, gap: 3, minWidth: 0 },
  scopeTitle: { fontSize: 12, lineHeight: 16 },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioFill: { width: 10, height: 10, borderRadius: 5 },
  permissionCard: { marginTop: 8, paddingHorizontal: 12 },
  permissionRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  permissionCopy: { flex: 1, gap: 3, minWidth: 0 },
  permissionLabel: { fontSize: 11, lineHeight: 15 },
  permissionDescription: { fontSize: 9, lineHeight: 13 },
  divider: { height: 1 },
  blockedPill: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 4 },
  blockedText: { fontSize: 9, lineHeight: 13, textAlign: 'center' },
});
