import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
export default function DrivingMode(): React.ReactElement {
  const router = useRouter();
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [listening, setListening] = useState(false);
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
            styles.back,
            { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <Icon name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <Text
          style={[styles.head, { color: colors.text.secondary, fontFamily: fontFamily.medium }]}
        >
          Driving Mode
        </Text>
        <View style={styles.back} />
      </View>
      <View style={styles.hero}>
        <View
          style={[
            styles.mic,
            { backgroundColor: listening ? colors.semantic.incomeLight : colors.brand.accentLight },
          ]}
        >
          <Icon
            name="mic-outline"
            size={38}
            color={listening ? colors.semantic.income : colors.semantic.info}
          />
        </View>
        <Text
          style={[
            styles.eyebrow,
            { color: colors.semantic.income, fontFamily: fontFamily.semibold },
          ]}
        >
          AUDIO COPILOT · DRIVER SHIELD
        </Text>
        <Text style={[typography.h2, { color: colors.text.primary }]}>Hands-free money log</Text>
        <Text style={[typography.bodySmall, styles.center, { color: colors.text.tertiary }]}>
          Voice capture stays off until you tap Speak. Never use this screen while driving unless it
          is hands-free and safe.
        </Text>
      </View>
      <Card style={styles.card}>
        <Text
          style={[styles.listening, { color: colors.text.primary, fontFamily: fontFamily.medium }]}
        >
          {listening ? 'Listening locally…' : 'Ready when you are'}
        </Text>
        <Text style={[typography.bodyMedium, { color: colors.text.secondary }]}>
          “I just bought headphones for 600 dirhams.”
        </Text>
        <View style={[styles.response, { backgroundColor: colors.background.tertiary }]}>
          <Icon name="sparkles" size={17} color={colors.semantic.info} />
          <Text style={[typography.bodySmall, styles.flex, { color: colors.text.secondary }]}>
            Voice logging is a preview. A transaction is never created without an explicit review
            outside driving mode.
          </Text>
        </View>
      </Card>
      <Card style={styles.telemetry}>
        <Text style={[styles.small, { color: colors.text.tertiary }]}>GLANCE TELEMETRY</Text>
        <View style={styles.metrics}>
          <Metric label="Safe-to-Spend" value="460 MAD" />
          <Metric label="Next bill" value="4 days" />
        </View>
      </Card>
      <Button
        label={listening ? 'Stop listening' : 'Tap to speak'}
        onPress={() => {
          setListening(!listening);
          setNotice(listening ? 'Voice preview stopped.' : 'Voice preview started locally.');
        }}
        variant="secondary"
      />
      {notice && <DataNotice label={notice} tone="info" />}
    </Screen>
  );
}
function Metric({ label, value }: { label: string; value: string }): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  return (
    <View style={styles.metric}>
      <Text style={[styles.small, { color: colors.text.tertiary }]}>{label}</Text>
      <Text
        style={[styles.value, { color: colors.semantic.income, fontFamily: fontFamily.semibold }]}
      >
        {value}
      </Text>
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
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  head: { fontSize: 12, lineHeight: 18 },
  hero: { marginTop: 20, alignItems: 'center', gap: 7 },
  mic: { width: 86, height: 86, borderRadius: 43, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontSize: 10, lineHeight: 14 },
  center: { maxWidth: 320, textAlign: 'center', lineHeight: 19 },
  card: { marginTop: 20, padding: 14, gap: 11 },
  listening: { fontSize: 13, lineHeight: 18 },
  response: { padding: 10, borderRadius: 8, flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  telemetry: { marginTop: 12, padding: 14 },
  small: { fontSize: 10, lineHeight: 14 },
  metrics: { marginTop: 10, flexDirection: 'row', gap: 20 },
  metric: { flex: 1 },
  value: { marginTop: 3, fontSize: 16, lineHeight: 22, fontVariant: ['tabular-nums'] },
});
