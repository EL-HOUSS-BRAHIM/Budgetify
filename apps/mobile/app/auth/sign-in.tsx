import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, DataNotice, Screen } from '../../src/components/ui';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function SignInScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signIn = async () => {
    setError(null);
    setIsSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsSubmitting(false);

    if (signInError) {
      setError('Check your email and password, then try again.');
      return;
    }

    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <Screen keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[typography.h2, { color: colors.text.primary }]}>Sign in</Text>
          <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
            Use your Supabase account to access your ledger.
          </Text>
        </View>
        <Card style={styles.form}>
          {error && <DataNotice icon="alert-circle-outline" label={error} tone="expense" />}
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
            autoComplete="password"
            onChangeText={setPassword}
            placeholder="Your password"
            placeholderTextColor={colors.text.muted}
            secureTextEntry
            style={[
              styles.input,
              { borderColor: colors.border.default, color: colors.text.primary },
            ]}
            value={password}
          />
          <Button
            disabled={!email.trim() || !password}
            label="Sign in"
            loading={isSubmitting}
            onPress={signIn}
          />
        </Card>
        <View style={styles.links}>
          <Link
            href="/auth/sign-up"
            style={[styles.link, { color: colors.brand.primary, fontFamily: fontFamily.semibold }]}
          >
            Create account
          </Link>
          <Link
            href="/auth/reset-password"
            style={[styles.link, { color: colors.brand.primary, fontFamily: fontFamily.semibold }]}
          >
            Reset password
          </Link>
        </View>
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
  links: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  link: { fontSize: 14, lineHeight: 20 },
});
