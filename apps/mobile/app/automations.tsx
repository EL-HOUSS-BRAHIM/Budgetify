import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, DataNotice, Screen } from '../src/components/ui';
import { useTheme } from '../src/theme/ThemeProvider';

function Icon(props: React.ComponentProps<typeof Ionicons>) {
  return (
    <Ionicons
      {...props}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
export default function AutomationsScreen(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [intent, setIntent] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  return (
    <Screen contentContainerStyle={{ paddingTop: insets.top + 8 }}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <Icon name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <Text
          style={[styles.head, { color: colors.text.secondary, fontFamily: fontFamily.medium }]}
        >
          Automation Engine
        </Text>
        <View style={styles.button} />
      </View>
      <View style={styles.hero}>
        <Text
          style={[styles.eyebrow, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}
        >
          ENGINE HEALTHY · PREVIEW
        </Text>
        <Text style={[typography.h2, { color: colors.text.primary }]}>Financial Automation</Text>
        <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
          Event-driven rules compiled from your intents
        </Text>
      </View>
      <Card style={styles.card}>
        <Rule
          title="Payday allocation"
          quote="Whenever I get paid, save 20% unless upcoming bills exceed 2,000 MAD."
        />
        <Rule
          title="Buffer floor"
          quote="Never let checking fall below 1,000 MAD. Pause goal savings if near."
        />
        <Rule
          title="Fee sentinel"
          quote="If a fee or price increase exceeds 5%, prepare an alert."
        />
      </Card>
      <Text style={[styles.section, { color: colors.text.primary, fontFamily: fontFamily.medium }]}>
        Natural Language Builder
      </Text>
      <Card style={[styles.builder, { borderColor: colors.brand.accent }]}>
        <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
          State an automation intent
        </Text>
        <TextInput
          accessibilityLabel="Automation intent"
          maxLength={300}
          multiline
          onChangeText={setIntent}
          placeholder="For example: save 20% of each payout"
          placeholderTextColor={colors.text.muted}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface.input,
              borderColor: colors.border.default,
              color: colors.text.primary,
              fontFamily: fontFamily.regular,
            },
          ]}
          value={intent}
        />
        <Button
          disabled={!intent.trim()}
          label="Compile preview rule"
          onPress={() =>
            setNotice('Rule compiled locally for review. No automation was activated.')
          }
          variant="secondary"
        />
      </Card>
      {notice && <DataNotice label={notice} tone="info" />}
    </Screen>
  );
}
function Rule({ title, quote }: { title: string; quote: string }): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View style={styles.rule}>
      <View style={styles.ruleIcon}>
        <Icon name="flash-outline" size={17} color={colors.semantic.info} />
      </View>
      <View style={styles.flex}>
        <Text
          style={[
            styles.ruleTitle,
            { color: colors.text.primary, fontFamily: fontFamily.semibold },
          ]}
        >
          {title}
        </Text>
        <Text style={[styles.quote, { color: colors.text.tertiary }]}>“{quote}”</Text>
        <Text style={[styles.pipeline, { color: colors.semantic.income }]}>
          Draft only · approval required
        </Text>
      </View>
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
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: { fontSize: 12, lineHeight: 18 },
  hero: { marginTop: 20, alignItems: 'center', gap: 6 },
  eyebrow: { fontSize: 10, lineHeight: 14 },
  card: { marginTop: 18, paddingHorizontal: 12 },
  rule: { minHeight: 88, paddingVertical: 12, flexDirection: 'row', gap: 9 },
  ruleIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  ruleTitle: { fontSize: 12, lineHeight: 16 },
  quote: { marginTop: 3, fontSize: 10, lineHeight: 15 },
  pipeline: { marginTop: 4, fontSize: 9, lineHeight: 13 },
  section: { marginTop: 22, fontSize: 16, lineHeight: 22 },
  builder: { marginTop: 8, padding: 12, gap: 10 },
  input: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    textAlignVertical: 'top',
  },
});
