import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, DataNotice, Screen } from '../../src/components/ui';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function SignUpScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signUp = async () => {
    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setIsSubmitting(false);

    if (signUpError) {
      setError('Could not create that account. Check the details and try again.');
      return;
    }

    if (data.session) {
      router.replace('/');
      return;
    }

    setNotice('Check your email to confirm the account, then sign in.');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <Screen keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[typography.h2, { color: colors.text.primary }]}>Create account</Text>
          <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
            Start with a private ledger protected by Supabase Auth and RLS.
          </Text>
        </View>
        <Card style={styles.form}>
          {error && <DataNotice icon="alert-circle-outline" label={error} tone="expense" />}
          {notice && <DataNotice icon="mail-outline" label={notice} tone="info" />}
          <Text
            style={[
              styles.label,
              { color: colors.text.secondary, fontFamily: fontFamily.semibold },
            ]}
          >
            Email
          </Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.text.muted}
            style={[
              styles.input,
              { borderColor: colors.border.default, color: colors.text.primary },
            ]}
            value={email}
          />
          <Text
            style={[
              styles.label,
              { color: colors.text.secondary, fontFamily: fontFamily.semibold },
            ]}
          >
            Password
          </Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="new-password"
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.text.muted}
            secureTextEntry
            style={[
              styles.input,
              { borderColor: colors.border.default, color: colors.text.primary },
            ]}
            value={password}
          />
          <Button
            disabled={!email.trim() || password.length < 6}
            label="Create account"
            loading={isSubmitting}
            onPress={() => void signUp()}
          />
        </Card>
        <Link
          href="/auth/sign-in"
          style={[styles.link, { color: colors.brand.primary, fontFamily: fontFamily.semibold }]}
        >
          Already have an account? Sign in
        </Link>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', gap: 20 },
  header: { gap: 6 },
  form: { padding: 16, gap: 10 },
  label: { fontSize: 13, lineHeight: 18 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, fontSize: 15 },
  link: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
