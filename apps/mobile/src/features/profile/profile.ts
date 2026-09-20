import { useCallback, useEffect, useState } from 'react';
import type { Tables, UpdateTables } from '@budgetify/types';
import { supabase } from '../../lib/supabase';

export type ProfileRow = Tables<'profiles'>;
export type AiPersonality = 'coach' | 'analyst' | 'guardian' | 'minimalist';
export type AiContextScope = 'full' | 'limited' | 'none';
export type OnboardingPriority = 'safety_net' | 'goal' | 'patterns';
export type IncomeCadence = 'weekly' | 'biweekly' | 'monthly' | 'irregular';
export type FirstSignal = 'safe_to_spend' | 'commitments' | 'insight';

interface ProfileState {
  profile: ProfileRow | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
}

export interface UpdateProfileInput {
  displayName?: string | null;
  currency?: string;
  locale?: string;
  aiPersonality?: AiPersonality;
  aiContextScope?: AiContextScope;
  autoCategorizeEnabled?: boolean;
  intelligentAlertsEnabled?: boolean;
  onboardingPriority?: OnboardingPriority;
  safetyBufferAmount?: number;
  incomeCadence?: IncomeCadence;
  firstSignal?: FirstSignal;
  onboardingCompletedAt?: string | null;
}

const AUTH_REQUIRED = 'Sign in to manage your profile.';
const LOAD_ERROR = 'Unable to load profile.';
const SAVE_ERROR = 'Unable to save profile.';

function normalizeCurrency(value: string): string {
  const currency = value.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error('Currency must be a three-letter ISO code.');
  }
  return currency;
}

export function useProfile(): ProfileState {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      setProfile(null);
      setError(AUTH_REQUIRED);
      setIsLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (queryError) {
      setProfile(null);
      setError(LOAD_ERROR);
      setIsLoading(false);
      return;
    }

    if (data) {
      setProfile(data);
      setIsLoading(false);
      return;
    }

    const fallbackName = session.user.email?.split('@')[0] ?? null;
    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .insert({ id: session.user.id, display_name: fallbackName })
      .select()
      .single();

    if (insertError || !inserted) {
      setProfile(null);
      setError(LOAD_ERROR);
      setIsLoading(false);
      return;
    }

    setProfile(inserted);
    setIsLoading(false);
  }, []);

  const updateProfile = useCallback(async (input: UpdateProfileInput) => {
    setIsSaving(true);
    setError(null);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      setIsSaving(false);
      throw new Error(AUTH_REQUIRED);
    }

    const update: UpdateTables<'profiles'> = {};
    if (input.displayName !== undefined) {
      const displayName = input.displayName?.trim() || null;
      update.display_name = displayName;
    }
    if (input.currency !== undefined) {
      update.currency = normalizeCurrency(input.currency);
    }
    if (input.locale !== undefined) {
      update.locale = input.locale.trim() || 'en-US';
    }
    if (input.aiPersonality !== undefined) {
      update.ai_personality = input.aiPersonality;
    }
    if (input.aiContextScope !== undefined) {
      update.ai_context_scope = input.aiContextScope;
    }
    if (input.autoCategorizeEnabled !== undefined) {
      update.auto_categorize_enabled = input.autoCategorizeEnabled;
    }
    if (input.intelligentAlertsEnabled !== undefined) {
      update.intelligent_alerts_enabled = input.intelligentAlertsEnabled;
    }
    if (input.onboardingPriority !== undefined) {
      update.onboarding_priority = input.onboardingPriority;
    }
    if (input.safetyBufferAmount !== undefined) {
      update.safety_buffer_amount = Math.max(0, Math.round(input.safetyBufferAmount));
    }
    if (input.incomeCadence !== undefined) {
      update.income_cadence = input.incomeCadence;
    }
    if (input.firstSignal !== undefined) {
      update.first_signal = input.firstSignal;
    }
    if (input.onboardingCompletedAt !== undefined) {
      update.onboarding_completed_at = input.onboardingCompletedAt;
    }

    const { data, error: updateError } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', session.user.id)
      .select()
      .single();

    setIsSaving(false);

    if (updateError || !data) {
      setError(SAVE_ERROR);
      throw new Error(SAVE_ERROR);
    }

    setProfile(data);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { profile, isLoading, isSaving, error, refresh, updateProfile };
}
