import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';

import * as Clipboard from 'expo-clipboard';

import {
  Message,
  ChatMode,
} from '../types/chat';

interface ChatMessageProps {
  message?: Message;

  mode: ChatMode;

  isTyping?: boolean;
}

export const ChatMessage: React.FC<
  ChatMessageProps
> = ({
  message,
  mode,
  isTyping = false,
}) => {
  const isUser =
    message?.sender === 'user';

  const [copied, setCopied] =
    useState(false);

  const fadeAnim =
    useRef(
      new Animated.Value(0)
    ).current;

  const dot1 =
    useRef(
      new Animated.Value(0.3)
    ).current;

  const dot2 =
    useRef(
      new Animated.Value(0.3)
    ).current;

  const dot3 =
    useRef(
      new Animated.Value(0.3)
    ).current;

  useEffect(() => {
    Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }
    ).start();
  }, []);

  useEffect(() => {
    if (!isTyping) return;

    const createAnimation = (
      dot: Animated.Value,
      delay: number
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),

          Animated.timing(dot, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),

          Animated.timing(dot, {
            toValue: 0.3,
            duration: 260,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createAnimation(
        dot1,
        0
      ),

      createAnimation(
        dot2,
        140
      ),

      createAnimation(
        dot3,
        280
      ),
    ]).start();
  }, [isTyping]);

  const copyMessage =
    async () => {
      if (
        !message?.content
      )
        return;

      await Clipboard.setStringAsync(
        message.content
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1200);
    };

  const getAvatar = () => {
    try {
      if (
        mode ===
        'convince-ai'
      ) {
        return require('../assets/roxx.png');
      }

      return require('../assets/agent_wolf.jpg');
    } catch {
      return null;
    }
  };

  const avatar =
    getAvatar();

  return (
    <Animated.View
      style={[
        styles.wrapper,

        isUser
          ? styles.userWrapper
          : styles.aiWrapper,

        {
          opacity: fadeAnim,
        },
      ]}
    >
      {/* AI Avatar */}
      {!isUser && (
        <View
          style={
            styles.avatarWrapper
          }
        >
          {avatar ? (
            <Image
              source={avatar}
              style={
                styles.avatar
              }
            />
          ) : (
            <View
              style={
                styles.avatarFallback
              }
            >
              <Text
                style={
                  styles.avatarFallbackText
                }
              >
                AI
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Message Content */}
      <View
        style={[
          styles.contentWrapper,

          isUser
            ? styles.userContent
            : styles.aiContent,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.92}
          delayLongPress={
            350
          }
          onLongPress={
            copyMessage
          }
          disabled={
            isTyping
          }
          style={[
            styles.bubble,

            isUser
              ? styles.userBubble
              : styles.aiBubble,
          ]}
        >
          {isTyping ? (
            <View
              style={
                styles.typingContainer
              }
            >
              <Animated.View
                style={[
                  styles.typingDot,

                  {
                    opacity:
                      dot1,

                    transform: [
                      {
                        scale:
                          dot1,
                      },
                    ],
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.typingDot,

                  {
                    opacity:
                      dot2,

                    transform: [
                      {
                        scale:
                          dot2,
                      },
                    ],
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.typingDot,

                  {
                    opacity:
                      dot3,

                    transform: [
                      {
                        scale:
                          dot3,
                      },
                    ],
                  },
                ]}
              />
            </View>
          ) : (
            <>
              <Text
                style={[
                  styles.messageText,

                  isUser
                    ? styles.userText
                    : styles.aiText,
                ]}
              >
                {
                  message?.content
                }
              </Text>

              {copied && (
                <View
                  style={
                    styles.copyBadge
                  }
                >
                  <Text
                    style={
                      styles.copyBadgeText
                    }
                  >
                    Copied
                  </Text>
                </View>
              )}
            </>
          )}
        </TouchableOpacity>

        {!isTyping &&
          message && (
            <View
              style={[
                styles.footer,

                isUser
                  ? styles.userFooter
                  : styles.aiFooter,
              ]}
            >
              <Text
                style={
                  styles.timestamp
                }
              >
                {message.timestamp.toLocaleTimeString(
                  [],
                  {
                    hour:
                      '2-digit',

                    minute:
                      '2-digit',
                  }
                )}
              </Text>
            </View>
          )}
      </View>
    </Animated.View>
  );
};

const styles =
  StyleSheet.create({
    wrapper: {
      flexDirection:
        'row',

      paddingHorizontal: 14,

      marginBottom: 18,
    },

    userWrapper: {
      justifyContent:
        'flex-end',
    },

    aiWrapper: {
      justifyContent:
        'flex-start',
    },

    avatarWrapper: {
      marginRight: 10,

      alignSelf:
        'flex-end',
    },

    avatar: {
      width: 30,
      height: 30,
      borderRadius: 999,
    },

    avatarFallback: {
      width: 30,
      height: 30,

      borderRadius: 999,

      backgroundColor:
        '#1e293b',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    avatarFallbackText: {
      color: '#ffffff',

      fontSize: 11,

      fontWeight: '600',
    },

    contentWrapper: {
      maxWidth: '82%',
    },

    userContent: {
      alignItems:
        'flex-end',
    },

    aiContent: {
      alignItems:
        'flex-start',
    },

    bubble: {
      borderRadius: 22,

      paddingHorizontal: 16,

      paddingVertical: 12,

      position: 'relative',

      minHeight: 48,

      justifyContent:
        'center',
    },

    userBubble: {
      backgroundColor:
        '#2563eb',

      borderBottomRightRadius: 8,
    },

    aiBubble: {
      backgroundColor:
        '#0f172a',

      borderBottomLeftRadius: 8,

      borderWidth: 1,

      borderColor:
        '#1e293b',
    },

    messageText: {
      fontSize: 15.5,

      lineHeight: 24,
    },

    userText: {
      color: '#ffffff',
    },

    aiText: {
      color: '#e2e8f0',
    },

    typingContainer: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 6,

      paddingVertical: 2,
    },

    typingDot: {
      width: 8,
      height: 8,

      borderRadius: 999,

      backgroundColor:
        '#94a3b8',
    },

    footer: {
      marginTop: 6,
    },

    userFooter: {
      alignItems:
        'flex-end',
    },

    aiFooter: {
      alignItems:
        'flex-start',
    },

    timestamp: {
      fontSize: 11,

      color: '#64748b',
    },

    copyBadge: {
      position: 'absolute',

      top: -28,
      right: 0,

      backgroundColor:
        '#111827',

      borderRadius: 999,

      paddingHorizontal: 10,

      paddingVertical: 5,

      borderWidth: 1,

      borderColor:
        '#1f2937',
    },

    copyBadgeText: {
      color: '#ffffff',

      fontSize: 11,

      fontWeight: '600',
    },
  });