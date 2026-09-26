import { formatMoney, money, parseMoney } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Button, Card, DataNotice, Screen } from '../../src/components/ui';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { createAccount, useAccounts } from '../../src/features/finance/accounts';
import { useProfile } from '../../src/features/profile/profile';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeProvider';
import { layout } from '../../src/theme/tokens';

const ACCOUNT_TYPES = ['checking', 'cash', 'savings', 'credit'] as const;
type AccountType = (typeof ACCOUNT_TYPES)[number];

type AccountRow = ReturnType<typeof useAccounts>['accounts'][number];

function SectionLabel({ children }: { children: string }): React.ReactElement {
  const { colors, spacing, typography } = useTheme();
  return (
    <Text
      style={[
        typography.caption,
        {
          color: colors.text.tertiary,
          marginTop: spacing.xl,
          marginBottom: spacing.sm,
          marginLeft: spacing.xs,
        },
      ]}
    >
      {children}
    </Text>
  );
}

function Divider(): React.ReactElement {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />;
}

function AccountRowView({ account }: { account: AccountRow }): React.ReactElement {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.settingRow}>
      <View style={styles.rowCopy}>
        <Text
          numberOfLines={1}
          style={[typography.bodyLarge, { color: colors.text.primary }]}
        >
          {account.name}
        </Text>
        <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
          {account.type}
        </Text>
      </View>
      <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>
        {formatMoney(money(account.current_balance, account.currency))}
      </Text>
    </View>
  );
}

export default function SettingsScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, isDark, toggleTheme, typography } = useTheme();
  const { session } = useAuth();
  const { profile, isLoading, isSaving, error, updateProfile } = useProfile();
  const { accounts, refresh: refreshAccounts } = useAccounts();
  const [displayName, setDisplayName] = React.useState('');
  const [currency, setCurrency] = React.useState('USD');
  const [notice, setNotice] = React.useState<string | null>(null);
  const [accountName, setAccountName] = React.useState('');
  const [accountType, setAccountType] = React.useState<AccountType>('checking');
  const [accountBalance, setAccountBalance] = React.useState('');
  const [savingAccount, setSavingAccount] = React.useState(false);

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
    setNotice(null);
    try {
      await supabase.auth.signOut();
      router.replace('/auth/sign-in');
    } catch {
      setNotice('Sign out failed. Try again.');
    }
  };

  const addAccount = async () => {
    setNotice(null);
    if (!accountName.trim()) return setNotice('Give the account a name.');
    let startingBalance: number;
    try {
      startingBalance = parseMoney(accountBalance.trim(), currency).amount;
    } catch {
      return setNotice('Enter a valid starting balance.');
    }
    setSavingAccount(true);
    try {
      await createAccount({
        name: accountName.trim(),
        type: accountType,
        currency,
        current_balance: startingBalance,
        is_default: accounts.length === 0,
      });
      setAccountName('');
      setAccountBalance('');
      await refreshAccounts();
      setNotice('Account added.');
    } catch (accountError) {
      setNotice(accountError instanceof Error ? accountError.message : 'Unable to add account.');
    } finally {
      setSavingAccount(false);
    }
  };

  return (
    <Screen>
      <Card style={styles.card}>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: colors.brand.primaryLight }]}>
            <Text style={[styles.avatarText, { color: colors.brand.primary }]}>
              {(profile?.display_name || session?.user.email || 'B').slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={styles.rowCopy}>
            <Text
              numberOfLines={1}
              style={[typography.h4, { color: colors.text.primary }]}
            >
              {profile?.display_name || session?.user.email?.split('@')[0] || 'LYVORA user'}
            </Text>
            <Text
              numberOfLines={1}
              style={[typography.bodySmall, { color: colors.text.tertiary }]}
            >
              {session?.user.email ?? 'Signed in'}
            </Text>
          </View>
        </View>
      </Card>

      {(error || notice) && (
        <View style={styles.noticeWrap}>
          <DataNotice
            icon={error ? 'alert-circle-outline' : 'checkmark-circle-outline'}
            label={error ?? notice ?? ''}
            tone={error ? 'expense' : 'info'}
          />
        </View>
      )}

      <SectionLabel>ACCOUNTS</SectionLabel>
      <Card style={styles.card}>
        {accounts.length === 0 ? (
          <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
            No accounts yet. Add one below so transactions have somewhere to go.
          </Text>
        ) : (
          accounts.map((account, index) => (
            <React.Fragment key={account.id}>
              {index > 0 && <Divider />}
              <AccountRowView account={account} />
            </React.Fragment>
          ))
        )}
        <Divider />
        <TextInput
          accessibilityLabel="Account name"
          onChangeText={setAccountName}
          placeholder="Account name"
          placeholderTextColor={colors.text.muted}
          style={[
            styles.input,
            { borderColor: colors.border.default, color: colors.text.primary },
          ]}
          value={accountName}
        />
        <TextInput
          accessibilityLabel="Starting balance"
          keyboardType="decimal-pad"
          onChangeText={setAccountBalance}
          placeholder={`Starting balance (${currency})`}
          placeholderTextColor={colors.text.muted}
          style={[
            styles.input,
            { borderColor: colors.border.default, color: colors.text.primary },
          ]}
          value={accountBalance}
        />
        <View style={styles.accountTypes}>
          {ACCOUNT_TYPES.map((type) => (
            <Pressable
              accessibilityLabel={`Account type ${type}`}
              accessibilityRole="button"
              accessibilityState={{ selected: accountType === type }}
              key={type}
              onPress={() => setAccountType(type)}
              style={({ pressed }) => [
                styles.accountType,
                {
                  borderColor: accountType === type ? colors.brand.primary : colors.border.default,
                  backgroundColor:
                    accountType === type ? colors.brand.primary : 'transparent',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  typography.caption,
                  { color: accountType === type ? colors.text.inverse : colors.text.primary },
                ]}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </View>
        <Button
          label="Add account"
          loading={savingAccount}
          onPress={() => void addAccount()}
          variant="secondary"
        />
      </Card>

      <SectionLabel>PREFERENCES</SectionLabel>
      <Card style={styles.card}>
        <View style={styles.settingRow}>
          <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>Dark mode</Text>
          <Switch
            accessibilityLabel="Dark mode"
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border.strong, true: colors.brand.primary }}
            value={isDark}
          />
        </View>

        <Divider />

        <View style={styles.formBlock}>
          <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>Profile</Text>
          <TextInput
            accessibilityLabel="Display name"
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
            accessibilityLabel="Preferred currency"
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
            onPress={() => void saveProfile()}
            variant="secondary"
          />
        </View>
      </Card>

      <SectionLabel>FINANCE TOOLS</SectionLabel>
      <Card style={styles.card}>
        {[
          ['Recurring transactions', '/recurring'],
          ['Setup guide', '/onboarding'],
        ].map(([label, route], index) => (
          <React.Fragment key={route}>
            {index > 0 && <Divider />}
            <Pressable
              accessibilityLabel={`Open ${label}`}
              accessibilityRole="button"
              onPress={() => router.push(route as never)}
              style={({ pressed }) => [
                styles.settingRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>{label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
            </Pressable>
          </React.Fragment>
        ))}
      </Card>

      <View style={styles.signOutWrap}>
        <Button label="Sign out" onPress={() => void signOut()} variant="danger" />
      </View>
      <Text
        style={[
          typography.caption,
          { color: colors.text.tertiary, textAlign: 'center', marginTop: 8 },
        ]}
      >
        Your data stays on your Supabase project. Nothing is sent anywhere else.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, borderWidth: 1 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700' },
  rowCopy: { flex: 1, minWidth: 0 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    minHeight: layout.minTouchTarget,
  },
  divider: { height: 1, marginVertical: 4 },
  noticeWrap: { marginTop: 12 },
  formBlock: { gap: 10, paddingVertical: 10 },
  input: {
    minHeight: layout.minTouchTarget,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  signOutWrap: { marginTop: 24 },
  accountTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10 },
  accountType: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
});
