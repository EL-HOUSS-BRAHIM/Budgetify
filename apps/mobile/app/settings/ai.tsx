import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, Screen } from '../../src/components/ui';
import { useTheme } from '../../src/theme/ThemeProvider';

type Style = 'direct' | 'coach' | 'quiet';

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
  const [style, setStyle] = useState<Style>('direct');
  const [prepared, setPrepared] = useState(false);
  const labels: Record<Style, string> = {
    direct: 'Direct & candid',
    coach: 'Warm coach',
    quiet: 'Quiet signal',
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
      <Text
        style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
      >
        Conversation posture
      </Text>
      <PersonalityOption
        active={style === 'direct'}
        icon="flash-outline"
        title="Direct & candid"
        detail="Short, clear decisions with the tradeoff stated plainly."
        onPress={() => setStyle('direct')}
        tone="info"
      />
      <PersonalityOption
        active={style === 'coach'}
        icon="heart-outline"
        title="Warm coach"
        detail="Encouraging context, gentle nudges, and room to reflect."
        onPress={() => setStyle('coach')}
        tone="income"
      />
      <PersonalityOption
        active={style === 'quiet'}
        icon="volume-mute-outline"
        title="Quiet signal"
        detail="Only urgent changes and high-confidence recommendations."
        onPress={() => setStyle('quiet')}
        tone="warning"
      />
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
  boundaryTitle: { fontSize: 12, lineHeight: 17 },
  confirmation: { marginTop: 14, padding: 14 },
  action: { marginTop: 14 },
});
