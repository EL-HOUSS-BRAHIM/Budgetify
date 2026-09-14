import React from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function SettingsScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, isDark, toggleTheme, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();

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
            <Text style={[styles.avatarText, { color: colors.brand.primary }]}>B</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[typography.h4, { color: colors.text.primary }]}>Brahim</Text>
            <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
              user@budgetify.app
            </Text>
          </View>
        </View>
      </View>

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

        <View style={styles.settingRow}>
          <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>
            Default Currency
          </Text>
          <Text style={[typography.bodyMedium, { color: colors.brand.primary, fontWeight: '700' }]}>
            USD ($)
          </Text>
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
        LYVORA PREVIEWS
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.background.card, borderColor: colors.border.default },
        ]}
      >
        {[
          ['Financial Forecast', '/forecast'],
          ['Subscriptions & Bills', '/bills'],
          ['Transaction Detail', '/transaction/preview'],
          ['Salary Day', '/salary-day'],
          ['Privacy & AI Access', '/privacy'],
          ['Irregular Income Mode', '/income-mode'],
          ['Emergency Lockdown Mode', '/lockdown'],
          ['Credit Card Hub', '/credit-cards'],
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
});
