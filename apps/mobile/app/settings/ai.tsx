import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, DataNotice, Screen } from '../../src/components/ui';
import {
  useProfile,
  type AiPersonality,
  type ProfileRow,
} from '../../src/features/profile/profile';
import { useTheme } from '../../src/theme/ThemeProvider';

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

const labels: Record<AiPersonality, string> = {
  coach: 'The Coach',
  analyst: 'The Analyst',
  guardian: 'The Guardian',
  minimalist: 'The Minimalist',
};

const details: Record<AiPersonality, string> = {
  coach: 'Encouraging context, gentle nudges, and room to reflect.',
  analyst: 'Pattern-led explanations with the next decision made explicit.',
  guardian: 'Protective guardrails and early warnings before risk compounds.',
  minimalist: 'Only urgent changes and high-confidence recommendations.',
};

function profilePersonality(profile: ProfileRow | null): AiPersonality {
  const value = profile?.ai_personality;
  if (value === 'analyst' || value === 'guardian' || value === 'minimalist') return value;
  return 'coach';
}

export default function AiPersonalityScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, isLoading, isSaving, error, updateProfile } = useProfile();
  const [notice, setNotice] = useState<string | null>(null);
  const style = profilePersonality(profile);

  const saveStyle = async (nextStyle: AiPersonality) => {
    try {
      await updateProfile({ aiPersonality: nextStyle });
      setNotice(`${labels[nextStyle]} saved.`);
    } catch {
      setNotice('AI personality could not be saved.');
    }
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
        AI PERSONALITY
      </Text>
      <Text style={[typography.h2, { color: colors.text.primary, marginTop: 5 }]}>
        Make the signal yours
      </Text>
      <Text style={[typography.bodySmall, { color: colors.text.tertiary, marginTop: 4 }]}>
        Tone changes framing only. Money movement still requires explicit approval.
      </Text>

      {isLoading ? (
        <View accessibilityLabel="Loading AI personality" style={styles.loading}>
          <ActivityIndicator color={colors.semantic.info} />
        </View>
      ) : error ? (
        <DataNotice icon="alert-circle-outline" label={error} tone="expense" />
      ) : (
        <>
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
              <Text style={[styles.voiceText, { color: colors.text.tertiary }]}>
                {labels[style]}
              </Text>
            </View>
          </Card>

          <Text
            style={[
              styles.section,
              { color: colors.text.primary, fontFamily: fontFamily.semibold },
            ]}
          >
            Conversation posture
          </Text>
          <PersonalityOption
            active={style === 'coach'}
            detail={details.coach}
            icon="heart-outline"
            onPress={() => void saveStyle('coach')}
            title="The Coach"
            tone="info"
          />
          <PersonalityOption
            active={style === 'analyst'}
            detail={details.analyst}
            icon="analytics-outline"
            onPress={() => void saveStyle('analyst')}
            title="The Analyst"
            tone="info"
          />
          <PersonalityOption
            active={style === 'guardian'}
            detail={details.guardian}
            icon="shield-checkmark-outline"
            onPress={() => void saveStyle('guardian')}
            title="The Guardian"
            tone="warning"
          />
          <PersonalityOption
            active={style === 'minimalist'}
            detail={details.minimalist}
            icon="volume-mute-outline"
            onPress={() => void saveStyle('minimalist')}
            title="The Minimalist"
            tone="income"
          />

          <Text
            style={[
              styles.section,
              { color: colors.text.primary, fontFamily: fontFamily.semibold },
            ]}
          >
            Live calibration
          </Text>
          <Card style={styles.calibration}>
            <CalibrationRow
              label="Proactivity"
              value={style === 'minimalist' ? 'Low' : style === 'guardian' ? 'High' : 'Balanced'}
            />
            <CalibrationRow
              label="Explanation depth"
              value={style === 'analyst' ? 'Deep' : style === 'minimalist' ? 'Brief' : 'Balanced'}
            />
            <CalibrationRow
              label="Risk sensitivity"
              last
              value={style === 'guardian' ? 'Protective' : 'Standard'}
            />
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
                Personality is stored in your profile. It does not change authorization rules.
              </Text>
            </View>
          </Card>
          {isSaving && (
            <DataNotice icon="cloud-upload-outline" label="Saving preference..." tone="info" />
          )}
          {notice && <DataNotice label={notice} tone="info" />}
        </>
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

function CalibrationRow({
  label,
  last = false,
  value,
}: {
  label: string;
  last?: boolean;
  value: string;
}): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View
      style={[
        styles.calibrationRow,
        !last && { borderBottomColor: colors.border.subtle, borderBottomWidth: 1 },
      ]}
    >
      <Text style={[styles.small, { color: colors.text.tertiary }]}>{label}</Text>
      <Text
        style={[
          styles.calibrationValue,
          { color: colors.semantic.info, fontFamily: fontFamily.semibold },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { minHeight: 180, alignItems: 'center', justifyContent: 'center' },
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
  eyebrow: { marginTop: 22, fontSize: 10, lineHeight: 14, letterSpacing: 0 },
  voiceCard: {
    marginTop: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
  },
  voiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1, minWidth: 0 },
  voiceTitle: { fontSize: 12, lineHeight: 17 },
  voiceText: { marginTop: 2, fontSize: 11, lineHeight: 15 },
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
  calibration: { marginTop: 8, paddingHorizontal: 12 },
  calibrationRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calibrationValue: { fontSize: 11, lineHeight: 15 },
  boundaryTitle: { fontSize: 12, lineHeight: 17 },
});
