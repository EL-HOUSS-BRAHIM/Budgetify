import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, DataNotice, Screen } from './ui';
import { useTheme } from '../theme/ThemeProvider';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface AuraScaffoldScreenProps {
  eyebrow: string;
  icon: IconName;
  title: string;
  description: string;
  nextStep: string;
}

export function AuraScaffoldScreen({
  eyebrow,
  icon,
  title,
  description,
  nextStep,
}: AuraScaffoldScreenProps): React.ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, fontFamily, typography } = useTheme();

  return (
    <Screen contentContainerStyle={{ paddingTop: insets.top + 8 }}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <Ionicons accessible={false} name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <View style={styles.brandRow}>
          <View style={[styles.brandMark, { borderColor: colors.semantic.income }]}>
            <Ionicons accessible={false} name="sparkles" size={13} color={colors.semantic.income} />
          </View>
          <Text
            style={[styles.brandName, { color: colors.text.primary, fontFamily: fontFamily.bold }]}
          >
            Aura
          </Text>
        </View>
      </View>

      <View style={styles.heading}>
        <Text
          style={[styles.eyebrow, { color: colors.semantic.info, fontFamily: fontFamily.semibold }]}
        >
          {eyebrow}
        </Text>
        <Text style={[typography.h2, { color: colors.text.primary }]}>{title}</Text>
        <Text style={[typography.bodyMedium, { color: colors.text.secondary }]}>{description}</Text>
      </View>

      <Card style={styles.stateCard}>
        <View style={[styles.iconWell, { backgroundColor: colors.brand.accentLight }]}>
          <Ionicons accessible={false} name={icon} size={26} color={colors.semantic.info} />
        </View>
        <Text
          style={[typography.h4, { color: colors.text.primary, fontFamily: fontFamily.semibold }]}
        >
          Screen scaffolded
        </Text>
        <Text style={[typography.bodySmall, styles.stateCopy, { color: colors.text.tertiary }]}>
          The destination and navigation are ready. Live data and task flows will be implemented in
          the next screen pass.
        </Text>
        <DataNotice icon="construct-outline" label={nextStep} tone="info" />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 14, lineHeight: 20 },
  heading: { marginTop: 28, gap: 8 },
  eyebrow: { fontSize: 11, lineHeight: 16 },
  stateCard: { marginTop: 28, padding: 20, alignItems: 'flex-start', gap: 12 },
  iconWell: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateCopy: { lineHeight: 20 },
});
