import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabase';

const API_URL_CONFIG_KEY = 'ai_api_url';
const API_URL_CACHE_KEY = 'budgetify.ai_api_url';
const bundledApiUrl = (process.env.EXPO_PUBLIC_AI_SERVICE_URL || 'http://10.0.2.2:8787').replace(
  /\/$/,
  '',
);

let cachedApiUrl: string | null = null;
let refreshPromise: Promise<string> | null = null;

function normalizeApiUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value.trim());
    const isLocalHttp =
      url.protocol === 'http:' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '10.0.2.2');
    if (url.protocol !== 'https:' && !isLocalHttp) return null;
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

async function readCachedApiUrl(): Promise<string | null> {
  const cached = normalizeApiUrl(await SecureStore.getItemAsync(API_URL_CACHE_KEY));
  if (cached) cachedApiUrl = cached;
  return cached;
}

export async function refreshAssistantApiUrl(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', API_URL_CONFIG_KEY)
      .maybeSingle();
    const remoteUrl = normalizeApiUrl(data?.value);

    if (!error && remoteUrl) {
      cachedApiUrl = remoteUrl;
      await SecureStore.setItemAsync(API_URL_CACHE_KEY, remoteUrl);
      return remoteUrl;
    }

    return (
      cachedApiUrl ?? (await readCachedApiUrl()) ?? normalizeApiUrl(bundledApiUrl) ?? bundledApiUrl
    );
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function getAssistantApiUrl(): Promise<string> {
  return cachedApiUrl ?? refreshAssistantApiUrl();
}
