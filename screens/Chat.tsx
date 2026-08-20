import { MessageCircle, Send, Settings } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FieldLabel, TextField } from '../components/Fields';
import { chatWithOllama, listOllamaModels, loadOllamaSettings, OllamaChatMessage, OllamaSettings, saveOllamaSettings } from '../lib/ollama';
import { colors, radius, spacing } from '../theme';
import { BaselineData, ChatMessage, RealtimeEntry, TrackingEntry } from '../types';

type ConnectionState = 'unknown' | 'checking' | 'online' | 'offline';

function welcomeMessage(): ChatMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    content: "Hi, I'm your recovery companion. I'm here anytime you want to talk through how you're doing. What's on your mind?",
    timestamp: new Date().toISOString(),
  };
}

// Used only when Ollama can't be reached, so the chat still responds with something useful.
function fallbackReply(input: string, latestTracking: TrackingEntry | undefined): string {
  const text = input.toLowerCase();

  if (/crav|urge|want to drink|tempt/.test(text)) {
    return "Cravings usually peak and pass within 15-20 minutes. Try naming what you're feeling right now, then do something with your hands — a walk, a call, cold water on your face. If it's intense, log it in Real-Time Support so we can track it.";
  }
  if (/relapse|drank|slipped|drink(ing)? again/.test(text)) {
    return "Thank you for telling me. A slip doesn't erase your progress — what matters is what you do next. Would it help to talk through what led up to it, so you can plan differently next time?";
  }
  if (/stress|anxious|anxiety|overwhelm/.test(text)) {
    const s = latestTracking?.stress;
    return s != null
      ? `Your last check-in had your stress at ${s}/10. A short breathing exercise (in for 4, hold for 4, out for 6) can bring that down quickly. Want a coping strategy that's worked for you before?`
      : "It sounds like things feel heavy right now. A few slow breaths can help in the moment — want to talk about what's driving the stress?";
  }
  if (/sleep|tired|exhausted/.test(text)) {
    return "Sleep and recovery are closely linked — poor sleep tends to raise craving intensity the next day. A consistent wind-down routine, even 15 minutes, can help.";
  }
  if (/proud|good day|doing well|clean|sober/.test(text)) {
    return "That's genuinely worth noting. Recovery is built one day like this at a time — keep doing what's working.";
  }
  if (/hi|hello|hey/.test(text)) {
    return "Hi — I'm here to talk through your recovery, day to day. What's on your mind?";
  }

  return "I hear you. Tell me more about what's going on — I'm drawing on your recent check-ins to try to give you something useful, not just generic advice.";
}

function buildSystemPrompt(
  baseline: BaselineData | null | undefined,
  latestTracking: TrackingEntry | undefined,
  latestRealtime: RealtimeEntry | undefined,
): string {
  const lines = [
    'You are the in-app recovery companion for DigiCBT, an alcohol recovery support app. Speak like a warm, non-judgmental, CBT-informed coach.',
    'Keep replies short (2-5 sentences) and conversational unless the user is explicitly asking for a detailed plan.',
    "Ground advice in the user's own data below when it's relevant, but don't recite numbers back at them unless they ask.",
    'You are not a clinician: for anything medical, urgent, or safety-related, encourage the user to reach out to a professional or crisis line rather than diagnosing or prescribing.',
  ];

  if (baseline) {
    const facts: string[] = [];
    if (baseline.recoveryDurationMonths != null) facts.push(`${baseline.recoveryDurationMonths} months into recovery`);
    if (baseline.motivationLevel != null) facts.push(`baseline motivation ${baseline.motivationLevel}/10`);
    if (baseline.socialSupportLevel != null) facts.push(`social support ${baseline.socialSupportLevel}/10`);
    if (baseline.triggers?.length) facts.push(`known triggers: ${baseline.triggers.join(', ')}`);
    if (baseline.copingStrategies?.length) facts.push(`coping strategies that have worked before: ${baseline.copingStrategies.join(', ')}`);
    if (facts.length) lines.push(`User profile: ${facts.join('; ')}.`);
  }

  if (latestTracking) {
    lines.push(
      `Latest daily check-in — mood ${latestTracking.mood}/10, stress ${latestTracking.stress}/10, anxiety ${latestTracking.anxiety}/10, energy ${latestTracking.energy}/10, sleep quality: ${latestTracking.sleepQuality}, trigger encountered: ${latestTracking.triggerEncountered ? 'yes' : 'no'}.`,
    );
  }

  if (latestRealtime) {
    lines.push(
      `Latest real-time support log — risk level ${latestRealtime.riskLevel}/10, trigger: "${latestRealtime.trigger}", coping action used: "${latestRealtime.copingAction}", confidence resisting: ${latestRealtime.confidence}/10.`,
    );
  }

  return lines.join('\n');
}

export function Chat({
  baseline,
  latestTracking,
  latestRealtime,
  messages: persistedMessages,
  onMessagesChange,
}: {
  baseline?: BaselineData | null;
  latestTracking?: TrackingEntry;
  latestRealtime?: RealtimeEntry;
  messages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(persistedMessages.length ? persistedMessages : [welcomeMessage()]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const [settings, setSettings] = useState<OllamaSettings>({ host: 'http://localhost:11434', model: 'qwen2.5:7b-instruct' });
  const [showSettings, setShowSettings] = useState(false);
  const [connection, setConnection] = useState<ConnectionState>('unknown');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const commit = (next: ChatMessage[]) => {
    setMessages(next);
    onMessagesChange(next);
  };

  useEffect(() => {
    if (!persistedMessages.length) onMessagesChange(messages);
    loadOllamaSettings().then(setSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkConnection = useCallback(async (s: OllamaSettings) => {
    setConnection('checking');
    try {
      const models = await listOllamaModels(s.host);
      setAvailableModels(models);
      setConnection('online');
    } catch {
      setAvailableModels([]);
      setConnection('offline');
    }
  }, []);

  useEffect(() => {
    checkConnection(settings);
  }, [settings.host, checkConnection]);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessage = { id: String(Date.now()), role: 'user', content: trimmed, timestamp: new Date().toISOString() };
    const withUser = [...messages, userMsg];
    commit(withUser);
    setInput('');
    setSending(true);

    try {
      const history: OllamaChatMessage[] = [
        { role: 'system', content: buildSystemPrompt(baseline, latestTracking, latestRealtime) },
        ...withUser.map((m) => ({ role: m.role, content: m.content }) as OllamaChatMessage),
      ];
      const content = await chatWithOllama(settings, history);
      setConnection('online');
      commit([...withUser, { id: String(Date.now() + 1), role: 'assistant', content, timestamp: new Date().toISOString() }]);
    } catch (err) {
      setConnection('offline');
      const note = `(Couldn't reach Ollama at ${settings.host} — using an offline reply. Check that "ollama serve" is running and "${settings.model}" is pulled.)`;
      commit([
        ...withUser,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: `${fallbackReply(trimmed, latestTracking)}\n\n${note}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const saveSettings = async () => {
    await saveOllamaSettings(settings);
    setShowSettings(false);
    checkConnection(settings);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={styles.statusBar}>
        <View style={styles.statusLeft}>
          <View
            style={[
              styles.dot,
              connection === 'online' && styles.dotOnline,
              connection === 'checking' && styles.dotChecking,
              connection === 'offline' && styles.dotOffline,
            ]}
          />
          <Text style={styles.statusText} numberOfLines={1}>
            {connection === 'online' && `Ollama connected · ${settings.model}`}
            {connection === 'checking' && 'Connecting to Ollama…'}
            {connection === 'offline' && 'Ollama offline — using fallback replies'}
            {connection === 'unknown' && 'Ollama'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowSettings((s) => !s)} hitSlop={8}>
          <Settings size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {showSettings && (
        <View style={styles.settingsPanel}>
          <FieldLabel>Ollama host</FieldLabel>
          <TextField value={settings.host} onChangeText={(host) => setSettings((s) => ({ ...s, host }))} placeholder="http://localhost:11434" />
          <View style={{ height: spacing.md }} />
          <FieldLabel>Model</FieldLabel>
          <TextField value={settings.model} onChangeText={(model) => setSettings((s) => ({ ...s, model }))} placeholder="qwen2.5:7b-instruct" />

          {availableModels.length > 0 && (
            <View style={styles.modelChips}>
              {availableModels.map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setSettings((s) => ({ ...s, model: m }))}
                  style={[styles.modelChip, settings.model === m && styles.modelChipActive]}
                >
                  <Text style={[styles.modelChipText, settings.model === m && styles.modelChipTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.settingsActions}>
            <TouchableOpacity onPress={() => checkConnection(settings)} style={styles.settingsBtn}>
              <Text style={styles.settingsBtnText}>Test connection</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveSettings} style={[styles.settingsBtn, styles.settingsBtnPrimary]}>
              <Text style={styles.settingsBtnTextPrimary}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.bubbleRow, item.role === 'user' ? styles.rowRight : styles.rowLeft]}>
            {item.role === 'assistant' && (
              <View style={styles.avatar}>
                <MessageCircle size={14} color="#fff" />
              </View>
            )}
            <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
              <Text style={[styles.bubbleText, item.role === 'user' && styles.bubbleTextUser]}>{item.content}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={
          sending ? (
            <View style={[styles.bubbleRow, styles.rowLeft]}>
              <View style={styles.avatar}>
                <MessageCircle size={14} color="#fff" />
              </View>
              <View style={[styles.bubble, styles.bubbleBot]}>
                <ActivityIndicator size="small" color={colors.textMuted} />
              </View>
            </View>
          ) : null
        }
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Talk through how you're feeling..."
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={send}
          returnKeyType="send"
          editable={!sending}
        />
        <TouchableOpacity style={[styles.sendBtn, sending && styles.sendBtnDisabled]} onPress={send} disabled={sending}>
          {sending ? <ActivityIndicator size="small" color="#fff" /> : <Send size={18} color="#fff" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  dotOnline: {
    backgroundColor: colors.success,
  },
  dotChecking: {
    backgroundColor: colors.warning,
  },
  dotOffline: {
    backgroundColor: colors.danger,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  settingsPanel: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  modelChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modelChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  modelChipActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  modelChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  modelChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  settingsActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  settingsBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  settingsBtnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  settingsBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  settingsBtnTextPrimary: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  list: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.gradientStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.lg,
  },
  bubbleBot: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 19,
  },
  bubbleTextUser: {
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
});
