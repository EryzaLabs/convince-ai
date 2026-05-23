import React, {
  useRef,
  useState,
  useEffect,
} from 'react';

import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Text,
} from 'react-native';

import {
  Paperclip,
  SendHorizonal,
  Smile,
  X,
  CornerUpLeft,
} from 'lucide-react-native';

import EmojiPicker from 'rn-emoji-keyboard';
import { Message } from '../types/chat';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  onTypingStatusChange?: (isTyping: boolean) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = 'Ask anything...',
  replyTo,
  onCancelReply,
  onTypingStatusChange,
}) => {
  const [message, setMessage] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Reply bar slide-in animation
  const replyBarHeight = useRef(new Animated.Value(0)).current;
  const replyBarOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (replyTo) {
      Animated.parallel([
        Animated.spring(replyBarHeight, { toValue: 52, tension: 80, friction: 10, useNativeDriver: false }),
        Animated.timing(replyBarOpacity, { toValue: 1, duration: 200, useNativeDriver: false }),
      ]).start();
      // Focus input when reply starts
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      Animated.parallel([
        Animated.timing(replyBarHeight, { toValue: 0, duration: 180, useNativeDriver: false }),
        Animated.timing(replyBarOpacity, { toValue: 0, duration: 180, useNativeDriver: false }),
      ]).start();
    }
  }, [replyTo]);

  useEffect(() => {
    onTypingStatusChange?.(message.trim().length > 0);
  }, [message, onTypingStatusChange]);

  const canSend = message.trim().length > 0;

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 70, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 70, useNativeDriver: true }),
    ]).start();
  };

  const handleSend = () => {
    if (!canSend || isLoading) return;

    let finalMessage = message.trim();

    // Prepend the quoted reply so the AI sees the context
    if (replyTo) {
      const sender = replyTo.sender === 'user' ? 'You' : 'AI';
      const snippet = replyTo.content.slice(0, 120);
      finalMessage = `[Replying to ${sender}: "${snippet}${replyTo.content.length > 120 ? '…' : ''}"]\n${finalMessage}`;
      onCancelReply?.();
    }

    onSendMessage(finalMessage);
    setMessage('');

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const senderLabel = replyTo?.sender === 'user' ? 'You' : 'AI';
  const replySnippet = replyTo?.content?.slice(0, 80) ?? '';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={10}
    >
      <View style={styles.wrapper}>

        {/* ── Reply preview bar ──────────────────────────── */}
        <Animated.View
          style={[
            styles.replyBar,
            { height: replyBarHeight, opacity: replyBarOpacity },
          ]}
        >
          <View style={styles.replyBarInner}>
            <View style={styles.replyBarAccent} />

            <View style={styles.replyBarContent}>
              <View style={styles.replyBarHeader}>
                <CornerUpLeft size={11} color="#60a5fa" />
                <Text style={styles.replyBarSender}>{senderLabel}</Text>
              </View>
              <Text style={styles.replyBarText} numberOfLines={1}>
                {replySnippet}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onCancelReply}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.replyBarClose}
            >
              <X size={14} color="#64748b" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Input row ─────────────────────────────────── */}
        <View style={styles.container}>
          {/* Attachment */}
          <TouchableOpacity style={styles.iconButton}>
            <Paperclip size={20} color="#94a3b8" />
          </TouchableOpacity>

          {/* Input */}
          <TextInput
            ref={inputRef}
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor="#64748b"
            multiline
            maxLength={1200}
            style={styles.input}
            blurOnSubmit={false}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />

          {/* Emoji */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setEmojiOpen(true)}
          >
            <Smile size={20} color="#94a3b8" />
          </TouchableOpacity>

          {/* Send */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!canSend || isLoading}
              onPress={() => { animateButton(); handleSend(); }}
              style={[
                styles.sendButton,
                (!canSend || isLoading) && styles.sendButtonDisabled,
              ]}
            >
              <SendHorizonal size={18} color="#ffffff" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.counter}>{message.length}/1200</Text>
          {isLoading && <Text style={styles.processing}>Thinking...</Text>}
        </View>
      </View>

      {/* Emoji Picker */}
      <EmojiPicker
        open={emojiOpen}
        onClose={() => setEmojiOpen(false)}
        onEmojiSelected={emoji => {
          setMessage(prev => prev + emoji.emoji);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#020617',
    borderTopWidth: 1,
    borderTopColor: '#111827',
  },

  // ── Reply bar
  replyBar: {
    overflow: 'hidden',
    marginBottom: 6,
  },

  replyBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e3a8a',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10,
  },

  replyBarAccent: {
    width: 3,
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2563eb',
    minHeight: 28,
  },

  replyBarContent: {
    flex: 1,
  },

  replyBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },

  replyBarSender: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '700',
  },

  replyBarText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 16,
  },

  replyBarClose: {
    padding: 2,
  },

  // ── Input row
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 26,
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: 58,
  },

  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 140,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonDisabled: {
    opacity: 0.4,
  },

  footer: {
    marginTop: 8,
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  counter: {
    color: '#64748b',
    fontSize: 11,
  },

  processing: {
    color: '#94a3b8',
    fontSize: 11,
  },
});