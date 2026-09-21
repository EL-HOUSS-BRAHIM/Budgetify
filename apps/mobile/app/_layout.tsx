import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/features/auth/AuthProvider';
import { refreshAssistantApiUrl } from '../src/lib/api-config';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';

void SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isDark, colors, fontFamily } = useTheme();

  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: colors.brand.primary,
          background: colors.background.primary,
          card: colors.background.card,
          text: colors.text.primary,
          border: colors.border.default,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: colors.brand.primary,
          background: colors.background.primary,
          card: colors.background.card,
          text: colors.text.primary,
          border: colors.border.default,
        },
      };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar
        backgroundColor={colors.background.primary}
        style={isDark ? 'light' : 'dark'}
        translucent={false}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary },
          headerStyle: { backgroundColor: colors.background.card },
          headerTintColor: colors.text.primary,
          headerTitleStyle: { fontFamily: fontFamily.semibold },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="auth/sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="auth/reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Add Transaction',
          }}
        />
        <Stack.Screen
          name="goal-modal"
          options={{ presentation: 'modal', headerShown: true, title: 'Create Goal' }}
        />
        <Stack.Screen
          name="budget-modal"
          options={{ presentation: 'modal', headerShown: true, title: 'Create Budget' }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            title: 'Settings',
          }}
        />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout(): React.ReactElement | null {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  useEffect(() => {
    void refreshAssistantApiUrl();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (fontError) {
    throw fontError;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
