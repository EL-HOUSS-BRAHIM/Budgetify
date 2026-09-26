import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, DataNotice, Screen } from '../src/components/ui';
import { useProfile } from '../src/features/profile/profile';
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

export default function PrivacyScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const { isLoading, isSaving, error } = useProfile();

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
        <Text style={[typography.h2, { color: colors.text.primary }]}>Privacy & Data Access</Text>
        <Text style={[typography.bodySmall, styles.heroCopy, { color: colors.text.tertiary }]}>
          Keep your ledger, spending, and savings data under user-controlled manual access.
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
                Your finance preferences are stored with your profile and restored after sign-in.
              </Text>
            </View>
          </Card>

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text.primary, fontFamily: fontFamily.medium },
            ]}
          >
            Manual Finance Controls
          </Text>
          <Card style={styles.permissionCard}>
            <View style={styles.permissionRow}>
              <View style={styles.permissionCopy}>
                <Text
                  style={[
                    styles.permissionLabel,
                    { color: colors.text.primary, fontFamily: fontFamily.medium },
                  ]}
                >
                  Explicit ledger actions
                </Text>
                <Text style={[styles.permissionDescription, { color: colors.text.tertiary }]}>
                  Every account, transaction, budget, and goal change requires your approval.
                </Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: colors.semantic.incomeLight }]}>
                <Text
                  style={[
                    styles.statusText,
                    { color: colors.semantic.income, fontFamily: fontFamily.medium },
                  ]}
                >
                  Enabled
                </Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
            <View style={styles.permissionRow}>
              <View style={styles.permissionCopy}>
                <Text
                  style={[
                    styles.permissionLabel,
                    { color: colors.text.primary, fontFamily: fontFamily.medium },
                  ]}
                >
                  Smart automation
                </Text>
                <Text style={[styles.permissionDescription, { color: colors.text.tertiary }]}>
                  Not included in Core V1. Category, budget, and goal edits stay in your control.
                </Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: colors.semantic.warningLight }]}>
                <Text
                  style={[
                    styles.statusText,
                    { color: colors.semantic.warning, fontFamily: fontFamily.medium },
                  ]}
                >
                  Locked
                </Text>
              </View>
            </View>
          </Card>
          {isSaving && (
            <DataNotice icon="cloud-upload-outline" label="Saving preference..." tone="info" />
          )}
        </>
      )}
    </Screen>
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
  statusPill: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 4 },
  statusText: { fontSize: 9, lineHeight: 13, textAlign: 'center' },
});
