import React, {
  useRef,
  useState,
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
} from 'lucide-react-native';

import EmojiPicker from 'rn-emoji-keyboard';

interface ChatInputProps {
  onSendMessage: (
    message: string
  ) => void;

  isLoading: boolean;

  placeholder?: string;
}

export const ChatInput: React.FC<
  ChatInputProps
> = ({
  onSendMessage,
  isLoading,
  placeholder = 'Ask anything...',
}) => {
  const [message, setMessage] =
    useState('');

  const [emojiOpen, setEmojiOpen] =
    useState(false);

  const inputRef =
    useRef<TextInput>(null);

  const scaleAnim =
    useRef(
      new Animated.Value(1)
    ).current;

  const canSend =
    message.trim().length > 0;

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 70,
        useNativeDriver: true,
      }),

      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 70,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSend = () => {
    if (
      !canSend ||
      isLoading
    )
      return;

    const trimmed =
      message.trim();

    onSendMessage(trimmed);

    setMessage('');

    // KEEP KEYBOARD OPEN
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
      keyboardVerticalOffset={
        10
      }
    >
      <View style={styles.wrapper}>
        <View
          style={
            styles.container
          }
        >
          {/* Attachment */}
          <TouchableOpacity
            style={
              styles.iconButton
            }
          >
            <Paperclip
              size={20}
              color="#94a3b8"
            />
          </TouchableOpacity>

          {/* Input */}
          <TextInput
            ref={inputRef}
            value={message}
            onChangeText={
              setMessage
            }
            placeholder={
              placeholder
            }
            placeholderTextColor="#64748b"
            multiline
            maxLength={1200}
            editable={
              true
            }
            style={styles.input}
            blurOnSubmit={false}
            returnKeyType="send"
            onSubmitEditing={() => {
              handleSend();
            }}
          />

          {/* Emoji */}
          <TouchableOpacity
            style={
              styles.iconButton
            }
            onPress={() =>
              setEmojiOpen(true)
            }
          >
            <Smile
              size={20}
              color="#94a3b8"
            />
          </TouchableOpacity>

          {/* Send */}
          <Animated.View
            style={{
              transform: [
                {
                  scale:
                    scaleAnim,
                },
              ],
            }}
          >
            <TouchableOpacity
              activeOpacity={
                0.85
              }
              disabled={
                !canSend ||
                isLoading
              }
              onPress={() => {
                animateButton();

                handleSend();
              }}
              style={[
                styles.sendButton,

                (!canSend ||
                  isLoading) &&
                  styles.sendButtonDisabled,
              ]}
            >
              <SendHorizonal
                size={18}
                color="#ffffff"
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text
            style={
              styles.counter
            }
          >
            {message.length}
            /1200
          </Text>

          {isLoading && (
            <Text
              style={
                styles.processing
              }
            >
              Thinking...
            </Text>
          )}
        </View>
      </View>

      {/* Emoji Picker */}
      <EmojiPicker
        open={emojiOpen}
        onClose={() =>
          setEmojiOpen(false)
        }
        onEmojiSelected={emoji => {
          setMessage(
            prev =>
              prev +
              emoji.emoji
          );

          requestAnimationFrame(() => {
            inputRef.current?.focus();
          });
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles =
  StyleSheet.create({
    wrapper: {
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 14,

      backgroundColor:
        '#020617',

      borderTopWidth: 1,

      borderTopColor:
        '#111827',
    },

    container: {
      flexDirection: 'row',

      alignItems:
        'flex-end',

      backgroundColor:
        '#0f172a',

      borderWidth: 1,

      borderColor:
        '#1e293b',

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

      justifyContent:
        'center',
    },

    sendButton: {
      width: 42,
      height: 42,

      borderRadius: 999,

      backgroundColor:
        '#2563eb',

      alignItems: 'center',

      justifyContent:
        'center',
    },

    sendButtonDisabled: {
      opacity: 0.4,
    },

    footer: {
      marginTop: 8,

      paddingHorizontal: 4,

      flexDirection: 'row',

      justifyContent:
        'space-between',

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