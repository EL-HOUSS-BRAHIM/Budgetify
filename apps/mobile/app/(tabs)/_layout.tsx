import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../src/theme/ThemeProvider';

function HeaderProfileButton(): React.ReactElement {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityLabel="Open settings"
      hitSlop={8}
      onPress={() => router.push('/settings')}
      style={styles.profileButton}
    >
      <Ionicons name="person-circle-outline" size={28} color={colors.text.secondary} />
    </Pressable>
  );
}

export default function TabLayout(): React.ReactElement {
  const { colors, fontFamily } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.border.subtle,
          height: 74,
          paddingBottom: 9,
          paddingTop: 7,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.medium,
          fontSize: 10,
        },
        tabBarHideOnKeyboard: true,
        headerStyle: {
          backgroundColor: colors.background.card,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontFamily: fontFamily.bold,
          fontSize: 20,
        },
        headerRight: () => <HeaderProfileButton />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarAccessibilityLabel: 'Home tab',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Money',
          tabBarAccessibilityLabel: 'Money tab',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'AI',
          tabBarAccessibilityLabel: 'AI assistant tab',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.aiTab,
                {
                  backgroundColor: focused ? colors.text.primary : colors.background.tertiary,
                  borderColor: focused ? colors.text.primary : colors.border.strong,
                },
              ]}
            >
              <Ionicons
                name="sparkles"
                size={18}
                color={focused ? colors.text.inverse : colors.text.primary}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="planning"
        options={{
          title: 'Plan',
          tabBarAccessibilityLabel: 'Plan tab',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarAccessibilityLabel: 'Goals tab',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'flag' : 'flag-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="budgets" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    width: 40,
    height: 40,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTab: {
    width: 42,
    height: 42,
    marginTop: -16,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
