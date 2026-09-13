import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeProvider';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const assistantResponseSchema = z.object({
  reply: z.string().min(1),
  toolCalled: z.string().nullable().optional(),
});

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: 'What would you like to review?',
  },
];

const suggestions = ['Show my monthly summary', 'What bills are still due?', 'Spent $18 on lunch'];

const assistantUrl = (
  process.env.EXPO_PUBLIC_AI_SERVICE_URL || 'http://10.0.2.2:8787'
).replace(/\/$/, '');

export default function AssistantScreen(): React.ReactElement {
  const { colors, fontFamily, radius, spacing, typography } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || isSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setError(null);
    setIsSending(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('Sign in to use the assistant.');
        return;
      }

      const response = await fetch(`${assistantUrl}/api/chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history: messages.map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        setError(response.status === 401 ? 'Sign in again to continue.' : 'Assistant unavailable.');
        return;
      }

      const parsed = assistantResponseSchema.safeParse(await response.json());
      if (!parsed.success) {
        setError('Assistant unavailable.');
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: parsed.data.reply,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error && requestError.name === 'AbortError'
          ? 'The request timed out. Try again.'
          : 'Assistant unavailable.',
      );
    } finally {
      clearTimeout(timeout);
      setIsSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <View style={[styles.assistantMark, { backgroundColor: colors.brand.primaryLight }]}> 
            <Ionicons name="sparkles" size={20} color={colors.brand.primary} />
          </View>
          <View style={styles.introCopy}>
            <Text style={[typography.h3, { color: colors.text.primary }]}>Budget assistant</Text>
            <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>Your data stays tied to your account.</Text>
          </View>
        </View>

        <View style={[styles.suggestions, { gap: spacing.sm }]}> 
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion}
              onPress={() => setInput(suggestion)}
              style={[
                styles.suggestion,
                {
                  backgroundColor: colors.background.card,
                  borderColor: colors.border.default,
                  borderRadius: radius.md,
                },
              ]}
            >
              <Text style={[typography.bodySmall, { color: colors.text.secondary }]}>
                {suggestion}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.messages, { gap: spacing.sm }]}> 
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.message,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage,
                {
                  backgroundColor:
                    message.role === 'user' ? colors.brand.primaryLight : colors.background.card,
                  borderColor: colors.border.default,
                  borderRadius: radius.md,
                },
              ]}
            >
              <Text style={[typography.bodyMedium, { color: colors.text.primary }]}>
                {message.content}
              </Text>
            </View>
          ))}
          {isSending && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.brand.primary} />
              <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>Reviewing</Text>
            </View>
          )}
          {error && (
            <Text accessibilityRole="alert" style={[typography.bodySmall, { color: colors.semantic.expense }]}>
              {error}
            </Text>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.composer,
          { backgroundColor: colors.background.card, borderTopColor: colors.border.default },
        ]}
      >
        <TextInput
          accessibilityLabel="Message the budget assistant"
          editable={!isSending}
          maxLength={500}
          multiline
          onChangeText={setInput}
          placeholder="Ask about spending, bills, or plans"
          placeholderTextColor={colors.text.muted}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface.input,
              borderColor: colors.border.default,
              borderRadius: radius.md,
              color: colors.text.primary,
              fontFamily: fontFamily.regular,
            },
          ]}
          value={input}
        />
        <Pressable
          accessibilityLabel="Send message"
          disabled={!input.trim() || isSending}
          onPress={() => void sendMessage()}
          style={[
            styles.sendButton,
            { backgroundColor: colors.brand.primary, borderRadius: radius.md },
            (!input.trim() || isSending) && styles.disabled,
          ]}
        >
          <Ionicons name="arrow-up" size={20} color={colors.text.inverse} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  intro: { flexDirection: 'row', alignItems: 'center' },
  assistantMark: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  introCopy: { flex: 1, marginLeft: 12 },
  suggestions: { marginTop: 20 },
  suggestion: { alignSelf: 'flex-start', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  messages: { marginTop: 24 },
  message: { maxWidth: '88%', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  assistantMessage: { alignSelf: 'flex-start' },
  userMessage: { alignSelf: 'flex-end' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, borderTopWidth: 1, padding: 12 },
  input: { flex: 1, minHeight: 44, maxHeight: 112, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  sendButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.45 },
});