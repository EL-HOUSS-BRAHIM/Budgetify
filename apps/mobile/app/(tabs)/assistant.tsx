import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { supabase } from '../../src/lib/supabase';
import { getAssistantApiUrl } from '../../src/lib/api-config';
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

const quickQueries = [
  'Can I afford this?',
  'Plan my month',
  'Explain my spending',
  'Scan upcoming bills',
];

function DecorativeIcon(props: React.ComponentProps<typeof Ionicons>): React.ReactElement {
  return (
    <Ionicons
      {...props}
      accessibilityElementsHidden
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    />
  );
}

function CopilotHeader(): React.ReactElement {
  const { colors, fontFamily } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={[styles.brandMark, { borderColor: colors.semantic.income }]}>
          <DecorativeIcon name="sparkles" size={13} color={colors.semantic.income} />
        </View>
        <Text
          style={[styles.brandName, { color: colors.text.primary, fontFamily: fontFamily.bold }]}
        >
          Lyvora
        </Text>
        <View style={[styles.versionBadge, { backgroundColor: colors.background.tertiary }]}>
          <Text
            style={[
              styles.versionText,
              { color: colors.text.tertiary, fontFamily: fontFamily.medium },
            ]}
          >
            v2.4
          </Text>
        </View>
      </View>
      <View style={[styles.connectedPill, { backgroundColor: colors.semantic.incomeLight }]}>
        <View style={[styles.connectedDot, { backgroundColor: colors.semantic.income }]} />
        <Text
          style={[
            styles.connectedText,
            { color: colors.semantic.income, fontFamily: fontFamily.medium },
          ]}
        >
          Connected
        </Text>
      </View>
    </View>
  );
}

function CopilotResponse({ content }: { content: string }): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();

  return (
    <View style={styles.responseWrap}>
      <View
        style={[
          styles.copilotAvatar,
          { backgroundColor: colors.brand.accentLight, borderColor: colors.brand.accent },
        ]}
      >
        <DecorativeIcon name="sparkles" size={15} color={colors.semantic.info} />
      </View>
      <View
        style={[
          styles.responseCard,
          { backgroundColor: colors.background.card, borderColor: colors.border.default },
        ]}
      >
        <View style={styles.responseMeta}>
          <View style={styles.metaTitle}>
            <Text
              style={[
                styles.copilotName,
                { color: colors.text.primary, fontFamily: fontFamily.semibold },
              ]}
            >
              Lyvora Copilot
            </Text>
            <Text style={[styles.metaText, { color: colors.text.tertiary }]}>Server response</Text>
          </View>
        </View>
        <Text style={[typography.bodyMedium, styles.responseText, { color: colors.text.primary }]}>
          {content}
        </Text>
      </View>
    </View>
  );
}

export default function AssistantScreen(): React.ReactElement {
  const { colors, fontFamily, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || isSending) return;

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', content: message },
    ]);
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
        setError('Sign in to use the Lyvora Copilot.');
        return;
      }

      const assistantUrl = await getAssistantApiUrl();
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
        setError(
          response.status === 401 ? 'Sign in again to continue.' : 'Lyvora Copilot is unavailable.',
        );
        return;
      }

      const parsed = assistantResponseSchema.safeParse(await response.json());
      if (!parsed.success) {
        setError('Lyvora Copilot is unavailable.');
        return;
      }
      setMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, role: 'assistant', content: parsed.data.reply },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error && requestError.name === 'AbortError'
          ? 'The request timed out. Try again.'
          : 'Lyvora Copilot is unavailable.',
      );
    } finally {
      clearTimeout(timeout);
      setIsSending(false);
    }
  };

  const useQuickQuery = (query: string) => {
    setInput(query);
    inputRef.current?.focus();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
        keyboardShouldPersistTaps="handled"
      >
        <CopilotHeader />
        <View style={styles.titleBlock}>
          <Text
            style={[
              styles.eyebrow,
              { color: colors.semantic.info, fontFamily: fontFamily.semibold },
            ]}
          >
            AUTONOMOUS FAMILY OFFICE
          </Text>
          <Text style={[typography.h2, { color: colors.text.primary }]}>Lyvora Copilot</Text>
          <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
            Connected to your ledger in real time
          </Text>
        </View>

        <View style={styles.thread}>
          {messages.length === 0 && (
            <View
              style={[
                styles.emptyThread,
                { backgroundColor: colors.background.card, borderColor: colors.border.default },
              ]}
            >
              <DecorativeIcon
                name="chatbubble-ellipses-outline"
                size={22}
                color={colors.semantic.info}
              />
              <Text
                style={[
                  typography.bodyMedium,
                  { color: colors.text.primary, fontFamily: fontFamily.semibold },
                ]}
              >
                Ask about your real ledger
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  styles.emptyThreadCopy,
                  { color: colors.text.tertiary },
                ]}
              >
                Lyvora will answer from the deployed backend using this conversation only.
              </Text>
            </View>
          )}
          {messages.map((message) =>
            message.role === 'user' ? (
              <View
                key={message.id}
                style={[
                  styles.userMessage,
                  {
                    backgroundColor: colors.background.tertiary,
                    borderColor: colors.border.default,
                  },
                ]}
              >
                <Text style={[typography.bodyMedium, { color: colors.text.primary }]}>
                  {message.content}
                </Text>
              </View>
            ) : (
              <CopilotResponse content={message.content} key={message.id} />
            ),
          )}
          {isSending && (
            <View style={styles.thinking}>
              <ActivityIndicator size="small" color={colors.semantic.info} />
              <Text style={[typography.bodySmall, { color: colors.text.tertiary }]}>
                Lyvora is reviewing your ledger
              </Text>
            </View>
          )}
          {error && (
            <Text
              accessibilityRole="alert"
              style={[typography.bodySmall, { color: colors.semantic.expense }]}
            >
              {error}
            </Text>
          )}
        </View>

        <Text
          style={[
            styles.quickLabel,
            { color: colors.text.tertiary, fontFamily: fontFamily.medium },
          ]}
        >
          INSTANT QUERIES
        </Text>
        <View style={styles.quickGrid}>
          {quickQueries.map((query, index) => (
            <Pressable
              accessibilityLabel={query}
              accessibilityRole="button"
              key={query}
              onPress={() => useQuickQuery(query)}
              style={({ pressed }) => [
                styles.quickButton,
                {
                  backgroundColor: colors.background.card,
                  borderColor: colors.border.default,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <DecorativeIcon
                name={
                  [
                    'help-circle-outline',
                    'calendar-outline',
                    'pie-chart-outline',
                    'document-text-outline',
                  ][index] as React.ComponentProps<typeof Ionicons>['name']
                }
                size={17}
                color={colors.semantic.info}
              />
              <Text
                style={[
                  styles.quickText,
                  { color: colors.text.secondary, fontFamily: fontFamily.medium },
                ]}
              >
                {query}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.composer,
          {
            backgroundColor: colors.background.card,
            borderTopColor: colors.border.default,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <View style={styles.composerTools}>
          <Pressable
            accessibilityLabel="Attach bill"
            accessibilityRole="button"
            hitSlop={4}
            style={({ pressed }) => [styles.toolButton, { opacity: pressed ? 0.72 : 1 }]}
          >
            <DecorativeIcon name="attach-outline" size={20} color={colors.text.secondary} />
          </Pressable>
          <Pressable
            accessibilityLabel="Speak to Lyvora"
            accessibilityRole="button"
            hitSlop={4}
            style={({ pressed }) => [styles.toolButton, { opacity: pressed ? 0.72 : 1 }]}
          >
            <DecorativeIcon name="mic-outline" size={20} color={colors.text.secondary} />
          </Pressable>
        </View>
        <TextInput
          accessibilityLabel="Message Lyvora Copilot"
          editable={!isSending}
          maxLength={500}
          multiline
          onChangeText={setInput}
          placeholder="Ask anything about your money"
          placeholderTextColor={colors.text.muted}
          ref={inputRef}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface.input,
              borderColor: colors.border.default,
              borderRadius: 8,
              color: colors.text.primary,
              fontFamily: fontFamily.regular,
            },
          ]}
          value={input}
        />
        <Pressable
          accessibilityLabel="Send message"
          accessibilityRole="button"
          accessibilityState={{ disabled: !input.trim() || isSending }}
          disabled={!input.trim() || isSending}
          onPress={() => void sendMessage()}
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor: colors.brand.primary,
              opacity: !input.trim() || isSending ? 0.45 : pressed ? 0.76 : 1,
            },
          ]}
        >
          <DecorativeIcon name="arrow-up" size={20} color={colors.text.inverse} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 164 },
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  versionBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  versionText: { fontSize: 9, lineHeight: 13 },
  connectedPill: {
    minHeight: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  connectedDot: { width: 5, height: 5, borderRadius: 3 },
  connectedText: { fontSize: 10, lineHeight: 14 },
  titleBlock: { marginTop: 22, gap: 5 },
  eyebrow: { fontSize: 10, lineHeight: 14 },
  thread: { marginTop: 22, gap: 16 },
  userMessage: {
    alignSelf: 'flex-end',
    maxWidth: '88%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  emptyThread: { alignItems: 'center', borderWidth: 1, borderRadius: 8, padding: 18, gap: 8 },
  emptyThreadCopy: { textAlign: 'center' },
  responseWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  copilotAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  responseCard: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 12 },
  responseMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  metaTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  copilotName: { fontSize: 11, lineHeight: 15 },
  metaText: { fontSize: 9, lineHeight: 13 },
  responseText: { marginTop: 10 },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  quickLabel: { marginTop: 24, fontSize: 10, lineHeight: 14 },
  quickGrid: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickButton: {
    width: '48.7%',
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickText: { flex: 1, fontSize: 11, lineHeight: 15 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  composerTools: { flexDirection: 'row' },
  toolButton: { width: 36, height: 48, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 112,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
