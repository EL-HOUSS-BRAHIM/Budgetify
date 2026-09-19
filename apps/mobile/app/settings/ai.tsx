import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, Screen } from '../../src/components/ui';
import { useTheme } from '../../src/theme/ThemeProvider';

type Style = 'coach' | 'analyst' | 'guardian' | 'minimalist';

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

export default function AiPersonalityScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [style, setStyle] = useState<Style>('coach');
  const [prepared, setPrepared] = useState(false);
  const labels: Record<Style, string> = {
    coach: 'The Coach',
    analyst: 'The Analyst',
    guardian: 'The Guardian',
    minimalist: 'The Minimalist',
  };
  const details: Record<Style, string> = {
    coach: 'Encouraging context, gentle nudges, and room to reflect.',
    analyst: 'Pattern-led explanations with the next decision made explicit.',
    guardian: 'Protective guardrails and early warnings before risk compounds.',
    minimalist: 'Only urgent changes and high-confidence recommendations.',
  };

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
          AI Personality
        </Text>
        <View style={styles.headerButton} />
      </View>
      <Text
        style={[styles.eyebrow, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}
      >
        AI PERSONALITY · PREVIEW
      </Text>
      <Text style={[typography.h2, { color: colors.text.primary, marginTop: 5 }]}>
        Make the signal yours
      </Text>
      <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 4 }]}>
        Choose how Lyvora frames financial decisions without changing the underlying analysis.
      </Text>
      <DataNotice
        icon="eye-outline"
        label="Design preview · preference is stored locally in this screen"
        tone="info"
      />
      <Card style={[styles.voiceCard, { borderColor: colors.brand.accent }]}>
        <View style={[styles.voiceIcon, { backgroundColor: colors.brand.accentLight }]}>
          <Icon name="sparkles-outline" size={23} color={colors.semantic.info} />
        </View>
        <View style={styles.flex}>
          <Text
            style={[
              styles.voiceTitle,
              { color: colors.text.primary, fontFamily: fontFamily.semibold },
            ]}
          >
            Current voice
          </Text>
          <Text style={[styles.voiceText, { color: colors.text.tertiary }]}>{labels[style]}</Text>
        </View>
        <Text
          style={[styles.preview, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}
        >
          PREVIEW
        </Text>
      </Card>
      <Card style={styles.sampleCard}>
        <View style={styles.sampleHeader}>
          <Text style={[styles.label, { color: colors.text.tertiary }]}>LIVE PREVIEW</Text>
          <Text style={[styles.preview, { color: colors.semantic.income, fontFamily: fontFamily.semibold }]}>LOCAL ONLY</Text>
        </View>
        <Text style={[styles.sampleQuote, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}>“{style === 'minimalist' ? 'Your runway is healthy. I will surface only material changes.' : style === 'coach' ? 'You are building good momentum. Let us protect the runway before adding more.' : style === 'analyst' ? 'Liquidity is the constraint. Preserve 5.4 months before accelerating the target.' : 'Dining is 18% above pace. I will flag the risk before it reaches your safety floor.'}”</Text>
        <Text style={[styles.small, { color: colors.text.tertiary }]}>Tone changes the framing, not the underlying financial signal.</Text>
      </Card>
      <Text
        style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
      >
        Conversation posture
      </Text>
      <PersonalityOption
        active={style === 'coach'}
        icon="heart-outline"
        title="The Coach"
        detail={details.coach}
        onPress={() => setStyle('coach')}
        tone="info"
      />
      <PersonalityOption
        active={style === 'analyst'}
        icon="analytics-outline"
        title="The Analyst"
        detail={details.analyst}
        onPress={() => setStyle('analyst')}
        tone="info"
      />
      <PersonalityOption
        active={style === 'guardian'}
        icon="shield-checkmark-outline"
        title="The Guardian"
        detail={details.guardian}
        onPress={() => setStyle('guardian')}
        tone="warning"
      />
      <PersonalityOption
        active={style === 'minimalist'}
        icon="volume-mute-outline"
        title="The Minimalist"
        detail={details.minimalist}
        onPress={() => setStyle('minimalist')}
        tone="income"
      />
      <Text style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}>Live calibration</Text>
      <Card style={styles.calibration}>
        <CalibrationRow label="Proactivity" value={style === 'minimalist' ? 'Low' : style === 'guardian' ? 'High' : 'Balanced'} />
        <CalibrationRow label="Explanation depth" value={style === 'analyst' ? 'Deep' : style === 'minimalist' ? 'Brief' : 'Balanced'} />
        <CalibrationRow label="Risk sensitivity" value={style === 'guardian' ? 'Protective' : 'Standard'} last />
      </Card>
      <Card style={styles.boundary}>
        <Icon name="lock-closed-outline" size={18} color={colors.semantic.income} />
        <View style={styles.flex}>
          <Text
            style={[
              styles.boundaryTitle,
              { color: colors.text.primary, fontFamily: fontFamily.semibold },
            ]}
          >
            The boundary stays fixed
          </Text>
          <Text style={[styles.small, { color: colors.text.tertiary }]}>
            Personality changes tone only. Money movement always requires explicit approval.
          </Text>
        </View>
      </Card>
      {prepared ? (
        <Card style={styles.confirmation}>
          <DataNotice
            icon="checkmark-circle-outline"
            label="AI personality preference prepared locally. No model or account setting changed."
            tone="info"
          />
        </Card>
      ) : (
        <Button
          icon="checkmark-outline"
          label="Save preview preference"
          onPress={() => setPrepared(true)}
          style={styles.action}
        />
      )}
    </Screen>
  );
}

function PersonalityOption({
  active,
  detail,
  icon,
  onPress,
  title,
  tone,
}: {
  active: boolean;
  detail: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  title: string;
  tone: 'income' | 'warning' | 'info';
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  const color = colors.semantic[tone];
  return (
    <Pressable
      accessibilityLabel={`Select ${title}`}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        {
          borderColor: active ? color : colors.border.default,
          backgroundColor: colors.background.card,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.optionIcon,
          {
            backgroundColor:
              tone === 'income'
                ? colors.semantic.incomeLight
                : tone === 'warning'
                  ? colors.semantic.warningLight
                  : colors.brand.accentLight,
          },
        ]}
      >
        <Icon name={icon} size={18} color={color} />
      </View>
      <View style={styles.flex}>
        <Text
          style={[
            styles.optionTitle,
            { color: colors.text.primary, fontFamily: fontFamily.semibold },
          ]}
        >
          {title}
        </Text>
        <Text style={[styles.small, { color: colors.text.tertiary }]}>{detail}</Text>
      </View>
      <View style={[styles.radio, { borderColor: active ? color : colors.border.strong }]}>
        {active && <View style={[styles.radioFill, { backgroundColor: color }]} />}
      </View>
    </Pressable>
  );
}

function CalibrationRow({ label, value, last = false }: { label: string; value: string; last?: boolean }): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View style={[styles.calibrationRow, !last && { borderBottomColor: colors.border.subtle, borderBottomWidth: 1 }]}>
      <Text style={[styles.small, { color: colors.text.tertiary }]}>{label}</Text>
      <Text style={[styles.calibrationValue, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}>{value}</Text>
    </View>
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
  eyebrow: { marginTop: 22, fontSize: 10, lineHeight: 14 },
  voiceCard: { marginTop: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  voiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  voiceTitle: { fontSize: 12, lineHeight: 17 },
  voiceText: { marginTop: 2, fontSize: 11, lineHeight: 15 },
  preview: { fontSize: 9, lineHeight: 13 },
  section: { marginTop: 22, fontSize: 16, lineHeight: 22 },
  option: {
    minHeight: 78,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: { fontSize: 12, lineHeight: 17 },
  small: { fontSize: 10, lineHeight: 15 },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioFill: { width: 10, height: 10, borderRadius: 5 },
  boundary: { marginTop: 14, padding: 14, flexDirection: 'row', gap: 10 },
  sampleCard: { marginTop: 14, padding: 14 },
  sampleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sampleQuote: { marginTop: 8, fontSize: 13, lineHeight: 19 },
  calibration: { marginTop: 8, paddingHorizontal: 12 },
  calibrationRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calibrationValue: { fontSize: 11, lineHeight: 15 },
  boundaryTitle: { fontSize: 12, lineHeight: 17 },
  confirmation: { marginTop: 14, padding: 14 },
  action: { marginTop: 14 },
});
