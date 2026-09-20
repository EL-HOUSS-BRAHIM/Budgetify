import React from 'react';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, DataNotice } from '../../src/components/ui';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { useProfile } from '../../src/features/profile/profile';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function SettingsScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, isDark, toggleTheme, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { profile, isLoading, isSaving, error, updateProfile } = useProfile();
  const [displayName, setDisplayName] = React.useState('');
  const [currency, setCurrency] = React.useState('USD');
  const [notice, setNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDisplayName(profile?.display_name ?? '');
    setCurrency(profile?.currency ?? 'USD');
  }, [profile]);

  const saveProfile = async () => {
    setNotice(null);
    try {
      await updateProfile({ displayName, currency });
      setNotice('Profile preferences saved.');
    } catch (profileError) {
      setNotice(profileError instanceof Error ? profileError.message : 'Unable to save profile.');
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/auth/sign-in');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
    >
      {/* Profile Section */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.background.card, borderColor: colors.border.default },
        ]}
      >
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: colors.brand.primaryLight }]}>
            <Text style={[styles.avatarText, { color: colors.brand.primary }]}>
              {(profile?.display_name || session?.user.email || 'B').slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[typography.h4, { color: colors.text.primary }]}>
              {profile?.display_name || session?.user.email?.split('@')[0] || 'Budgetify user'}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
              {session?.user.email ?? 'Signed in'}
            </Text>
          </View>
        </View>
      </View>

      {(error || notice) && (
        <View style={styles.noticeWrap}>
          <DataNotice
            icon={error ? 'alert-circle-outline' : 'checkmark-circle-outline'}
            label={error ?? notice ?? ''}
            tone={error ? 'expense' : 'info'}
          />
        </View>
      )}

      {/* Preferences */}
      <Text
        style={[
          typography.caption,
          { color: colors.text.tertiary, marginTop: spacing.lg, marginBottom: 8, marginLeft: 4 },
        ]}
      >
        PREFERENCES
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.background.card, borderColor: colors.border.default },
        ]}
      >
        <View style={styles.settingRow}>
          <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border.strong, true: colors.brand.primary }}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />

        <View style={styles.formBlock}>
          <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>Profile</Text>
          <TextInput
            editable={!isLoading && !isSaving}
            onChangeText={setDisplayName}
            placeholder="Display name"
            placeholderTextColor={colors.text.muted}
            style={[
              styles.input,
              { borderColor: colors.border.default, color: colors.text.primary },
            ]}
            value={displayName}
          />
          <TextInput
            autoCapitalize="characters"
            editable={!isLoading && !isSaving}
            maxLength={3}
            onChangeText={(value) => setCurrency(value.toUpperCase())}
            placeholder="USD"
            placeholderTextColor={colors.text.muted}
            style={[
              styles.input,
              { borderColor: colors.border.default, color: colors.text.primary },
            ]}
            value={currency}
          />
          <Button
            disabled={isLoading || !currency.trim()}
            label="Save profile"
            loading={isSaving}
            onPress={saveProfile}
            variant="secondary"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />

        <View style={styles.settingRow}>
          <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>
            Biometric Unlock
          </Text>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: colors.border.strong, true: colors.brand.primary }}
          />
        </View>
      </View>

      <Text
        style={[
          typography.caption,
          { color: colors.text.tertiary, marginTop: spacing.lg, marginBottom: 8, marginLeft: 4 },
        ]}
      >
        SECONDARY TOOLS
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.background.card, borderColor: colors.border.default },
        ]}
      >
        {[
          ['Subscriptions & Bills', '/bills'],
          ['Salary Day', '/salary-day'],
          ['Privacy & AI Access', '/privacy'],
          ['End-of-Month Report', '/reports/month-end'],
          ['AI Personality Settings', '/settings/ai'],
          ['Financial Health Deep-Dive', '/financial-health'],
          ['Intelligent Onboarding', '/onboarding'],
        ].map(([label, route], index) => (
          <React.Fragment key={route}>
            {index > 0 && (
              <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
            )}
            <TouchableOpacity
              accessibilityLabel={`Open ${label}`}
              accessibilityRole="button"
              activeOpacity={0.7}
              onPress={() => router.push(route as never)}
              style={styles.settingRow}
            >
              <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>{label}</Text>
              <Text style={[typography.bodyLarge, { color: colors.text.tertiary }]}>›</Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>

      <Text
        style={[
          typography.caption,
          { color: colors.text.tertiary, marginTop: spacing.lg, marginBottom: 8, marginLeft: 4 },
        ]}
      >
        LAB / PREVIEW ROUTES
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.background.card, borderColor: colors.border.default },
        ]}
      >
        {[
          ['Financial Forecast', '/forecast'],
          ['Irregular Income Mode', '/income-mode'],
          ['Emergency Lockdown Mode', '/lockdown'],
          ['Credit Card Hub', '/credit-cards'],
          ['Capital Allocation Engine', '/allocation'],
          ['Financial Automation Engine', '/automations'],
          ['Voice-First Driving Mode', '/driving-mode'],
          ['Shared Finances & Splitting', '/shared-finances'],
          ['Document Vault', '/vault'],
          ['Lock Screen & Dynamic Island Reference', '/platform-surface'],
          ['Desktop Command Center Reference', '/desktop-reference'],
        ].map(([label, route], index) => (
          <React.Fragment key={route}>
            {index > 0 && (
              <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />
            )}
            <TouchableOpacity
              accessibilityLabel={`Open ${label}`}
              accessibilityRole="button"
              activeOpacity={0.7}
              onPress={() => router.push(route as never)}
              style={styles.settingRow}
            >
              <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>{label}</Text>
              <Text style={[typography.bodyLarge, { color: colors.text.tertiary }]}>›</Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>

      {/* Data & Privacy (GDPR) */}
      <Text
        style={[
          typography.caption,
          { color: colors.text.tertiary, marginTop: spacing.lg, marginBottom: 8, marginLeft: 4 },
        ]}
      >
        DATA & PRIVACY (GDPR)
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.background.card, borderColor: colors.border.default },
        ]}
      >
        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>
            Export All My Data (JSON / CSV)
          </Text>
          <Text style={[typography.bodyLarge, { color: colors.text.tertiary }]}>›</Text>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />

        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>Privacy Policy</Text>
          <Text style={[typography.bodyLarge, { color: colors.text.tertiary }]}>›</Text>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />

        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <Text
            style={[typography.bodyLarge, { color: colors.semantic.expense, fontWeight: '600' }]}
          >
            Delete Account & Purge Data
          </Text>
          <Text style={[typography.bodyLarge, { color: colors.semantic.expense }]}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.signOutWrap}>
        <Button label="Sign out" onPress={signOut} variant="danger" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  noticeWrap: {
    marginTop: 12,
  },
  formBlock: {
    gap: 10,
    paddingVertical: 10,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  signOutWrap: {
    marginTop: 16,
  },
});
