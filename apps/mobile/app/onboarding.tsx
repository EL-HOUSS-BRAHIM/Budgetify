import { formatMoney, money, parseMoney } from '@budgetify/core';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, DataNotice, Screen } from '../src/components/ui';
import { createAccount } from '../src/features/finance/accounts';
import {
  useProfile,
  type FirstSignal,
  type OnboardingPriority,
} from '../src/features/profile/profile';
import { useTheme } from '../src/theme/ThemeProvider';

const TOTAL_STEPS = 4;

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

export default function OnboardingScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const { profile, isSaving, updateProfile } = useProfile();
  const currency = profile?.currency ?? 'USD';

  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [priority, setPriority] = useState<OnboardingPriority>('safety_net');
  const [safetyBufferText, setSafetyBufferText] = useState('');
  const [firstSignal, setFirstSignal] = useState<FirstSignal>('safe_to_spend');
  const [error, setError] = useState<string | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountBalance, setAccountBalance] = useState('');

  const stepTitles = [
    'Your priorities',
    'Your safety floor',
    'Your first signal',
    'Your first account',
  ];
  const questions = [
    'What matters most this season?',
    'What should never be put at risk?',
    'What should you see first each month?',
    'Add your first account (optional)',
  ];
  const hints = [
    'Pick a starting lens for your financial decisions.',
    'Set a conservative boundary before ambition.',
    'Choose the first signal you want to see.',
    'You can add accounts later from Settings.',
  ];

  /** Blank means "not set", which the profile stores as zero rather than a guess. */
  const safetyBuffer = React.useMemo(() => {
    if (!safetyBufferText.trim()) return 0;
    try {
      return parseMoney(safetyBufferText, currency).amount;
    } catch {
      return -1;
    }
  }, [safetyBufferText, currency]);

  const finish = async () => {
    setError(null);
    if (safetyBuffer < 0) {
      return setError('Enter a valid safety buffer, or leave it blank.');
    }
    try {
      if (accountName.trim() || accountBalance.trim()) {
        if (!accountName.trim()) throw new Error('Give the account a name, or clear both fields.');
        const balance = parseMoney(accountBalance.trim(), currency);
        await createAccount({
          name: accountName.trim(),
          current_balance: balance.amount,
          currency,
          type: 'checking',
          is_default: true,
        });
      }
      await updateProfile({
        onboardingPriority: priority,
        safetyBufferAmount: safetyBuffer,
        incomeCadence: 'monthly',
        firstSignal,
        onboardingCompletedAt: new Date().toISOString(),
      });
      setDone(true);
    } catch (finishError) {
      setError(finishError instanceof Error ? finishError.message : 'Setup could not be saved.');
    }
  };

  return (
    <Screen topInset>
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
          Lyvora Setup
        </Text>
        <Text style={[styles.step, { color: colors.text.tertiary }]}>
          {done ? '✓' : `${step}/${TOTAL_STEPS}`}
        </Text>
      </View>

      <Text
        style={[styles.eyebrow, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}
      >
        CORE V1 SETUP
      </Text>
      <Text style={[typography.h2, { color: colors.text.primary, marginTop: 5 }]}>
        {done ? 'Your ledger is ready' : stepTitles[step - 1]}
      </Text>
      <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 4 }]}>
        {done
          ? 'A calm first view, with every figure calculated from what you record.'
          : 'A short setup for your accounts, safety floor, and goals.'}
      </Text>

      {error && <DataNotice icon="alert-circle-outline" label={error} tone="expense" />}

      {done ? (
        <>
          <Card style={styles.complete}>
            <View style={[styles.completeIcon, { backgroundColor: colors.semantic.incomeLight }]}>
              <Icon name="checkmark-circle-outline" size={30} color={colors.semantic.income} />
            </View>
            <Text
              style={[
                styles.completeTitle,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              Setup complete
            </Text>
            <Text style={[styles.small, { color: colors.text.tertiary }]}>
              {safetyBuffer > 0
                ? `Safety floor set to ${formatMoney(money(safetyBuffer, currency))}.`
                : 'No safety floor set. You can add one from Settings.'}
            </Text>
          </Card>
          <Button
            label="Go to Home"
            onPress={() => router.replace('/(tabs)')}
            style={styles.action}
            variant="primary"
          />
        </>
      ) : (
        <>
          <Card style={styles.form}>
            <View style={[styles.promptIcon, { backgroundColor: colors.brand.accentLight }]}>
              <Icon
                name={
                  step === 1
                    ? 'compass-outline'
                    : step === 2
                      ? 'shield-checkmark-outline'
                      : step === 3
                        ? 'sparkles-outline'
                        : 'wallet-outline'
                }
                size={23}
                color={colors.semantic.info}
              />
            </View>
            <Text
              style={[
                styles.question,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              {questions[step - 1]}
            </Text>
            <Text style={[styles.small, { color: colors.text.tertiary }]}>{hints[step - 1]}</Text>

            <View style={styles.choices}>
              {step === 1 && (
                <>
                  <Choice
                    label="Build my safety net"
                    onPress={() => setPriority('safety_net')}
                    selected={priority === 'safety_net'}
                  />
                  <Choice
                    label="Reach a meaningful goal"
                    onPress={() => setPriority('goal')}
                    selected={priority === 'goal'}
                  />
                  <Choice
                    label="Understand my patterns"
                    onPress={() => setPriority('patterns')}
                    selected={priority === 'patterns'}
                  />
                </>
              )}
              {step === 2 && (
                <TextInput
                  accessibilityLabel={`Safety buffer in ${currency}`}
                  keyboardType="decimal-pad"
                  onChangeText={setSafetyBufferText}
                  placeholder={`Amount you would never touch (${currency})`}
                  placeholderTextColor={colors.text.muted}
                  style={[
                    styles.input,
                    { color: colors.text.primary, borderColor: colors.border.default },
                  ]}
                  value={safetyBufferText}
                />
              )}
              {step === 3 && (
                <>
                  <Choice
                    label="Money in and money out"
                    onPress={() => setFirstSignal('safe_to_spend')}
                    selected={firstSignal === 'safe_to_spend'}
                  />
                  <Choice
                    label="What is due next"
                    onPress={() => setFirstSignal('commitments')}
                    selected={firstSignal === 'commitments'}
                  />
                  <Choice
                    label="Savings goal progress"
                    onPress={() => setFirstSignal('insight')}
                    selected={firstSignal === 'insight'}
                  />
                </>
              )}
              {step === 4 && (
                <>
                  <TextInput
                    accessibilityLabel="Account name"
                    onChangeText={setAccountName}
                    placeholder="Account name, e.g. Current account"
                    placeholderTextColor={colors.text.muted}
                    style={[
                      styles.input,
                      { color: colors.text.primary, borderColor: colors.border.default },
                    ]}
                    value={accountName}
                  />
                  <TextInput
                    accessibilityLabel="Account starting balance"
                    keyboardType="decimal-pad"
                    onChangeText={setAccountBalance}
                    placeholder={`Starting balance (${currency})`}
                    placeholderTextColor={colors.text.muted}
                    style={[
                      styles.input,
                      { color: colors.text.primary, borderColor: colors.border.default },
                    ]}
                    value={accountBalance}
                  />
                </>
              )}
            </View>
          </Card>

          <Button
            icon={step === TOTAL_STEPS ? 'checkmark-outline' : 'arrow-forward-outline'}
            label={step === TOTAL_STEPS ? 'Finish setup' : 'Continue'}
            loading={isSaving}
            onPress={() => (step === TOTAL_STEPS ? void finish() : setStep(step + 1))}
            style={styles.action}
          />
        </>
      )}
    </Screen>
  );
}

function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <Pressable
      accessibilityLabel={`Choose ${label}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        {
          borderColor: selected ? colors.semantic.info : colors.border.default,
          backgroundColor: selected ? colors.brand.accentLight : 'transparent',
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text
        style={[styles.choiceText, { color: colors.text.primary, fontFamily: fontFamily.medium }]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.radio,
          { borderColor: selected ? colors.semantic.info : colors.border.strong },
        ]}
      >
        {selected && <View style={[styles.radioFill, { backgroundColor: colors.semantic.info }]} />}
      </View>
    </Pressable>
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
  step: { width: 44, textAlign: 'right', fontSize: 11 },
  eyebrow: { marginTop: 22, fontSize: 10, lineHeight: 14 },
  form: { marginTop: 18, padding: 16 },
  promptIcon: {
    width: 48,
    height: 48,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  question: { marginTop: 16, fontSize: 18, lineHeight: 24 },
  small: { marginTop: 5, fontSize: 12, lineHeight: 17 },
  choices: { marginTop: 18, gap: 8 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  choice: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  choiceText: { fontSize: 14, lineHeight: 20, flex: 1 },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioFill: { width: 10, height: 10, borderRadius: 5 },
  complete: { marginTop: 18, padding: 22, alignItems: 'center' },
  completeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeTitle: { marginTop: 14, fontSize: 16, lineHeight: 22 },
  action: { marginTop: 16 },
});
