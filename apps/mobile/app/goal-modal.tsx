import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, DataNotice } from '../src/components/ui';
import { createGoal } from '../src/features/finance/goals';
import { useProfile } from '../src/features/profile/profile';
import { useTheme } from '../src/theme/ThemeProvider';

export default function GoalModal(): React.ReactElement {
  const { colors, typography } = useTheme();
  const { profile } = useProfile();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [starting, setStarting] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const targetAmount = Number(target.replace(',', '.'));
    const currentAmount = Number(starting.replace(',', '.')) || 0;
    if (!name.trim() || !Number.isFinite(targetAmount) || targetAmount <= 0) {
      setError('Enter a name and a target amount greater than zero.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createGoal({
        name: name.trim(),
        target_amount: Math.round(targetAmount * 100),
        current_amount: Math.max(0, Math.round(currentAmount * 100)),
        currency: profile?.currency ?? 'USD',
        ...(deadline.trim() ? { deadline: deadline.trim() } : {}),
      });
      router.back();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to create goal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={[typography.bodySmall, { color: colors.text.secondary }]}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="New PC"
          placeholderTextColor={colors.text.muted}
          style={[styles.input, { color: colors.text.primary, borderColor: colors.border.default }]}
        />
        <Text style={[typography.bodySmall, styles.label, { color: colors.text.secondary }]}>
          Target amount
        </Text>
        <TextInput
          value={target}
          onChangeText={setTarget}
          keyboardType="decimal-pad"
          placeholder={`0 ${profile?.currency ?? 'USD'}`}
          placeholderTextColor={colors.text.muted}
          style={[styles.input, { color: colors.text.primary, borderColor: colors.border.default }]}
        />
        <Text style={[typography.bodySmall, styles.label, { color: colors.text.secondary }]}>
          Starting amount
        </Text>
        <TextInput
          value={starting}
          onChangeText={setStarting}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.text.muted}
          style={[styles.input, { color: colors.text.primary, borderColor: colors.border.default }]}
        />
        <Text style={[typography.bodySmall, styles.label, { color: colors.text.secondary }]}>
          Target date (YYYY-MM-DD, optional)
        </Text>
        <TextInput
          value={deadline}
          onChangeText={setDeadline}
          placeholder="2027-06-01"
          placeholderTextColor={colors.text.muted}
          style={[styles.input, { color: colors.text.primary, borderColor: colors.border.default }]}
        />
        {error && <DataNotice icon="alert-circle-outline" label={error} tone="expense" />}
        <Button
          label="Create goal"
          loading={saving}
          disabled={saving}
          onPress={() => void save()}
          variant="primary"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  label: { marginTop: 16, marginBottom: 6 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    marginTop: 6,
  },
});
