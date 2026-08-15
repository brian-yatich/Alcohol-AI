import { MessageCircle, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { ChatMessage, RealtimeEntry, TrackingEntry } from '../types';

function reply(input: string, latestTracking: TrackingEntry | undefined, latestRealtime: RealtimeEntry | undefined): string {
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

export function Chat({ latestTracking, latestRealtime }: { latestTracking?: TrackingEntry; latestRealtime?: RealtimeEntry }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi, I'm your recovery companion. I'm here anytime you want to talk through how you're doing. What's on your mind?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: String(Date.now()), role: 'user', content: trimmed, timestamp: new Date().toISOString() };
    const botMsg: ChatMessage = {
      id: String(Date.now() + 1),
      role: 'assistant',
      content: reply(trimmed, latestTracking, latestRealtime),
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg, botMsg]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
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
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Send size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
});
