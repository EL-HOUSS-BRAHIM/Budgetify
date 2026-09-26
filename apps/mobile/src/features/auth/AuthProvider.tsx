import type { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../theme/ThemeProvider';

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      setSession(null);
      return;
    }
    setSession(data.session ?? null);
  };

  useEffect(() => {
    let isMounted = true;

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (isMounted) {
          setSession(data.session ?? null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

export function AuthLoadingScreen(): React.ReactElement {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.loading, { backgroundColor: colors.background.primary }]}>
      <ActivityIndicator color={colors.brand.primary} />
      <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>Checking session</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});
