import { Link } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, DataNotice, Screen } from '../../src/components/ui';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function ResetPasswordScreen(): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetPassword = async () => {
    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
    setIsSubmitting(false);

    if (resetError) {
      setError('Could not send a reset email. Check the address and try again.');
      return;
    }

    setNotice('Password reset email sent.');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <Screen keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[typography.h2, { color: colors.text.primary }]}>Reset password</Text>
          <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
            Send a secure reset link to your email.
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
          <Button
            disabled={!email.trim()}
            label="Send reset email"
            loading={isSubmitting}
            onPress={resetPassword}
          />
        </Card>
        <Link
          href="/auth/sign-in"
          style={[styles.link, { color: colors.brand.primary, fontFamily: fontFamily.semibold }]}
        >
          Back to sign in
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
