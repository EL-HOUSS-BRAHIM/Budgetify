import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, Screen } from '../src/components/ui';
import { useTheme } from '../src/theme/ThemeProvider';

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
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const steps = ['Your priorities', 'Your safety floor', 'Your first signal'];
  return (
    <Screen contentContainerStyle={{ paddingTop: insets.top + 8 }}>
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
        <Text style={[styles.step, { color: colors.text.tertiary }]}>{step}/3</Text>
      </View>
      <Text
        style={[styles.eyebrow, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}
      >
        INTELLIGENT ONBOARDING · PREVIEW
      </Text>
      <Text style={[typography.h2, { color: colors.text.primary, marginTop: 5 }]}>
        {done ? 'Your operating system is ready' : steps[step - 1]}
      </Text>
      <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 4 }]}>
        {done
          ? 'A calm first view, with every decision still under your control.'
          : 'A short setup that starts with context, not account connections.'}
      </Text>
      <DataNotice
        icon="eye-outline"
        label="Design preview · no bank connection or profile was created"
        tone="info"
      />
      {done ? (
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
            Preview setup complete
          </Text>
          <Text style={[styles.small, { color: colors.text.tertiary }]}>
            Lyvora would now personalize Home, Plan, and Goals from the choices above.
          </Text>
        </Card>
      ) : (
        <Card style={styles.form}>
          <View style={[styles.promptIcon, { backgroundColor: colors.brand.accentLight }]}>
            <Icon
              name={
                step === 1
                  ? 'compass-outline'
                  : step === 2
                    ? 'shield-checkmark-outline'
                    : 'sparkles-outline'
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
            {step === 1
              ? 'What matters most this season?'
              : step === 2
                ? 'What should never be put at risk?'
                : 'How should Lyvora begin each day?'}
          </Text>
          <Text style={[styles.small, { color: colors.text.tertiary }]}>
            {step === 1
              ? 'Pick a starting lens for your financial decisions.'
              : step === 2
                ? 'Set a conservative boundary before ambition.'
                : 'Choose the first signal you want to see.'}
          </Text>
          <View style={styles.choices}>
            <Choice
              label={
                step === 1
                  ? 'Build my safety net'
                  : step === 2
                    ? 'Essential bills and runway'
                    : 'Safe-to-Spend'
              }
              selected
              onPress={() => {}}
            />
            <Choice
              label={
                step === 1
                  ? 'Reach a meaningful goal'
                  : step === 2
                    ? 'Goal contributions'
                    : "Today's commitments"
              }
              selected={false}
              onPress={() => {}}
            />
            <Choice
              label={
                step === 1
                  ? 'Understand my patterns'
                  : step === 2
                    ? 'A deliberate spending buffer'
                    : 'One useful insight'
              }
              selected={false}
              onPress={() => {}}
            />
          </View>
        </Card>
      )}
      {!done && (
        <Button
          icon={step === 3 ? 'checkmark-outline' : 'arrow-forward-outline'}
          label={step === 3 ? 'Finish preview setup' : 'Continue'}
          onPress={() => (step === 3 ? setDone(true) : setStep(step + 1))}
          style={styles.action}
        />
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
      style={[
        styles.choice,
        { borderColor: selected ? colors.semantic.info : colors.border.default },
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
  small: { marginTop: 5, fontSize: 10, lineHeight: 15 },
  choices: { marginTop: 18, gap: 8 },
  choice: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  choiceText: { fontSize: 12, lineHeight: 17 },
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
