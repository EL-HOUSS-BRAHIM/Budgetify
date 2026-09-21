import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AuthLoadingScreen, useAuth } from '../../src/features/auth/AuthProvider';
import { useTheme } from '../../src/theme/ThemeProvider';

function HeaderActions(): React.ReactElement {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={styles.headerActions}>
      <Pressable
        accessibilityLabel="Add transaction"
        hitSlop={8}
        onPress={() => router.push('/modal')}
        style={styles.actionButton}
      >
        <Ionicons name="add-circle-outline" size={28} color={colors.brand.primary} />
      </Pressable>
      <Pressable
        accessibilityLabel="Open settings"
        hitSlop={8}
        onPress={() => router.push('/settings')}
        style={styles.actionButton}
      >
        <Ionicons name="person-circle-outline" size={28} color={colors.text.secondary} />
      </Pressable>
    </View>
  );
}

export default function TabLayout(): React.ReactElement {
  const { colors, fontFamily } = useTheme();
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!session) {
    return <Redirect href="/auth/sign-in" />;
  }

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
        headerRight: () => <HeaderActions />,
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
          title: 'Transactions',
          tabBarAccessibilityLabel: 'Transactions tab',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budget',
          tabBarAccessibilityLabel: 'Budget tab',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'pie-chart' : 'pie-chart-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          headerShown: false,
          tabBarAccessibilityLabel: 'Goals tab',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'flag' : 'flag-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarAccessibilityLabel: 'Settings tab',
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={20} color={color} />,
        }}
      />
      <Tabs.Screen name="assistant" options={{ href: null }} />
      <Tabs.Screen name="planning" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
