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
  PanResponder,
  Modal,
  Pressable,
} from 'react-native';

import * as Clipboard from 'expo-clipboard';

import {
  CornerUpLeft,
  X,
  Pencil,
  Trash2,
  Copy,
} from 'lucide-react-native';

import {
  Message,
  ChatMode,
} from '../types/chat';

interface ChatMessageProps {
  message?: Message;
  mode: ChatMode;
  isTyping?: boolean;

  onReply?: (
    message: Message
  ) => void;

  onEdit?: (
    message: Message
  ) => void;

  onDelete?: (
    messageId: string
  ) => void;
}

export const ChatMessage: React.FC<
  ChatMessageProps
> = ({
  message,
  mode,
  isTyping = false,
  onReply,
  onEdit,
  onDelete,
}) => {
  const isUser =
    message?.sender ===
    'user';

  const [copied, setCopied] =
    useState(false);

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const [
    actionMenuVisible,
    setActionMenuVisible,
  ] = useState(false);

  // ─────────────────────────────
  // ENTRANCE
  // ─────────────────────────────

  const fadeAnim =
    useRef(
      new Animated.Value(0)
    ).current;

  // ─────────────────────────────
  // TYPING DOTS
  // ─────────────────────────────

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

  // ─────────────────────────────
  // SWIPE REPLY
  // ─────────────────────────────

  const swipeX =
    useRef(
      new Animated.Value(0)
    ).current;

  const replyIconOpacity =
    useRef(
      new Animated.Value(0)
    ).current;

  const replyIconScale =
    useRef(
      new Animated.Value(0.5)
    ).current;

  const SWIPE_THRESHOLD = 60;

  const panResponder =
    useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder:
          (_, g) =>
            !isTyping &&
            !!message &&
            Math.abs(g.dx) >
              8 &&
            Math.abs(g.dx) >
              Math.abs(g.dy),

        onPanResponderMove:
          (_, g) => {
            const direction =
              isUser
                ? -1
                : 1;

            const rawDx =
              g.dx *
              direction;

            if (
              rawDx <= 0
            )
              return;

            const clamped =
              Math.min(
                rawDx,
                SWIPE_THRESHOLD +
                  10
              );

            swipeX.setValue(
              clamped *
                direction
            );

            const progress =
              Math.min(
                rawDx /
                  SWIPE_THRESHOLD,
                1
              );

            replyIconOpacity.setValue(
              progress
            );

            replyIconScale.setValue(
              0.5 +
                progress *
                  0.5
            );
          },

        onPanResponderRelease:
          (_, g) => {
            const direction =
              isUser
                ? -1
                : 1;

            const rawDx =
              g.dx *
              direction;

            if (
              rawDx >=
                SWIPE_THRESHOLD &&
              message &&
              onReply
            ) {
              onReply(
                message
              );
            }

            Animated.spring(
              swipeX,
              {
                toValue: 0,
                tension: 80,
                friction: 10,
                useNativeDriver: true,
              }
            ).start();

            Animated.parallel([
              Animated.timing(
                replyIconOpacity,
                {
                  toValue: 0,
                  duration: 150,
                  useNativeDriver: true,
                }
              ),

              Animated.spring(
                replyIconScale,
                {
                  toValue: 0.5,
                  tension: 80,
                  friction: 8,
                  useNativeDriver: true,
                }
              ),
            ]).start();
          },
      })
    ).current;

  // ─────────────────────────────
  // FADE IN
  // ─────────────────────────────

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

  // ─────────────────────────────
  // TYPING ANIMATION
  // ─────────────────────────────

  useEffect(() => {
    if (!isTyping)
      return;

    const createAnimation =
      (
        dot: Animated.Value,
        delay: number
      ) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(
              delay
            ),

            Animated.timing(
              dot,
              {
                toValue: 1,
                duration: 260,
                useNativeDriver: true,
              }
            ),

            Animated.timing(
              dot,
              {
                toValue: 0.3,
                duration: 260,
                useNativeDriver: true,
              }
            ),
          ])
        );

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

  // ─────────────────────────────
  // COPY
  // ─────────────────────────────

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

      setTimeout(
        () =>
          setCopied(
            false
          ),
        1200
      );
    };

  // ─────────────────────────────
  // AVATAR
  // ─────────────────────────────

  const getAvatar =
    () => {
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
    <>
      <Animated.View
        style={[
          styles.wrapper,

          isUser
            ? styles.userWrapper
            : styles.aiWrapper,

          {
            opacity:
              fadeAnim,
          },
        ]}
      >
        {/* REPLY ICON */}

        <Animated.View
          style={[
            styles.replyIcon,

            isUser
              ? styles.replyIconLeft
              : styles.replyIconRight,

            {
              opacity:
                replyIconOpacity,

              transform: [
                {
                  scale:
                    replyIconScale,
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <CornerUpLeft
            size={16}
            color="#60a5fa"
          />
        </Animated.View>

        {/* AVATAR */}

        {!isUser && (
          <View
            style={
              styles.avatarWrapper
            }
          >
            {avatar ? (
              <Image
                source={
                  avatar
                }
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

        {/* MESSAGE */}

        <Animated.View
          style={[
            styles.contentWrapper,

            isUser
              ? styles.userContent
              : styles.aiContent,

            {
              transform: [
                {
                  translateX:
                    swipeX,
                },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            activeOpacity={
              0.92
            }
            delayLongPress={
              350
            }
            disabled={
              isTyping
            }
            onLongPress={() => {
              if (
                isUser
              ) {
                setActionMenuVisible(
                  true
                );
              } else {
                copyMessage();
              }
            }}
            style={[
              styles.bubble,

              isUser
                ? styles.userBubble
                : styles.aiBubble,
            ]}
          >
            {/* REPLY CONTEXT */}

            {!isTyping &&
              message?.replyTo && (
                <View
                  style={[
                    styles.replyBubbleContext,

                    isUser
                      ? styles.userReplyContext
                      : styles.aiReplyContext,
                  ]}
                >
                  <View
                    style={[
                      styles.replyContextAccent,

                      isUser
                        ? styles.userReplyContextAccent
                        : styles.aiReplyContextAccent,
                    ]}
                  />

                  <View
                    style={
                      styles.replyContextDetails
                    }
                  >
                    <Text
                      style={[
                        styles.replyContextSender,

                        isUser
                          ? styles.userReplyContextSender
                          : styles.aiReplyContextSender,
                      ]}
                    >
                      {message
                        .replyTo
                        .sender ===
                      'user'
                        ? 'You'
                        : 'AI'}
                    </Text>

                    <Text
                      style={
                        styles.replyContextText
                      }
                      numberOfLines={
                        1
                      }
                    >
                      {
                        message
                          .replyTo
                          .content
                      }
                    </Text>
                  </View>
                </View>
              )}

            {/* IMAGE */}

            {!isTyping &&
              message?.imageUri && (
                <TouchableOpacity
                  activeOpacity={
                    0.9
                  }
                  onPress={() =>
                    setModalVisible(
                      true
                    )
                  }
                  style={
                    styles.bubbleImageWrapper
                  }
                >
                  <Image
                    source={{
                      uri: message.imageUri,
                    }}
                    style={
                      styles.bubbleImage
                    }
                  />
                </TouchableOpacity>
              )}

            {/* TYPING */}

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

                      transform:
                        [
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

                      transform:
                        [
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

                      transform:
                        [
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
                {!!message?.content && (
                  <Text
                    style={[
                      styles.messageText,

                      isUser
                        ? styles.userText
                        : styles.aiText,
                    ]}
                  >
                    {
                      message.content
                    }
                  </Text>
                )}

                {/* EDITED */}

                {message?.edited && (
                  <Text
                    style={
                      styles.editedText
                    }
                  >
                    edited
                  </Text>
                )}

                {/* COPIED */}

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

          {/* TIMESTAMP */}

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
                  {(() => {
                    const d = new Date(message.timestamp);
                    return isNaN(d.getTime())
                      ? ''
                      : d.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                  })()}
                </Text>
              </View>
            )}
        </Animated.View>
      </Animated.View>

      {/* ACTION MENU */}

      <Modal
        visible={
          actionMenuVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setActionMenuVisible(
            false
          )
        }
      >
        <Pressable
          style={
            styles.actionOverlay
          }
          onPress={() =>
            setActionMenuVisible(
              false
            )
          }
        >
          <View
            style={
              styles.actionSheet
            }
          >
            <TouchableOpacity
              style={
                styles.actionButton
              }
              onPress={() => {
                setActionMenuVisible(
                  false
                );

                copyMessage();
              }}
            >
              <Copy
                size={18}
                color="#ffffff"
              />

              <Text
                style={
                  styles.actionText
                }
              >
                Copy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.actionButton
              }
              onPress={() => {
                setActionMenuVisible(
                  false
                );

                if (
                  message &&
                  onEdit
                ) {
                  onEdit(
                    message
                  );
                }
              }}
            >
              <Pencil
                size={18}
                color="#ffffff"
              />

              <Text
                style={
                  styles.actionText
                }
              >
                Edit Message
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.actionButton
              }
              onPress={() => {
                setActionMenuVisible(
                  false
                );

                if (
                  message &&
                  onDelete
                ) {
                  onDelete(
                    message.id
                  );
                }
              }}
            >
              <Trash2
                size={18}
                color="#ef4444"
              />

              <Text
                style={
                  styles.deleteText
                }
              >
                Delete Message
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* FULL IMAGE */}

      {message?.imageUri && (
        <Modal
          visible={
            modalVisible
          }
          transparent
          animationType="fade"
          onRequestClose={() =>
            setModalVisible(
              false
            )
          }
        >
          <Pressable
            style={
              styles.modalBackground
            }
            onPress={() =>
              setModalVisible(
                false
              )
            }
          >
            <View
              style={
                styles.modalContent
              }
            >
              <TouchableOpacity
                style={
                  styles.modalCloseButton
                }
                onPress={() =>
                  setModalVisible(
                    false
                  )
                }
                activeOpacity={
                  0.8
                }
              >
                <X
                  size={24}
                  color="#ffffff"
                />
              </TouchableOpacity>

              <Image
                source={{
                  uri: message.imageUri,
                }}
                style={
                  styles.fullImage
                }
                resizeMode="contain"
              />
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
};

const styles =
  StyleSheet.create({
    wrapper: {
      flexDirection:
        'row',

      paddingHorizontal: 14,

      marginBottom: 18,

      position:
        'relative',
    },

    userWrapper: {
      justifyContent:
        'flex-end',
    },

    aiWrapper: {
      justifyContent:
        'flex-start',
    },

    replyIcon: {
      position:
        'absolute',

      top: '50%',

      width: 28,
      height: 28,

      borderRadius: 999,

      backgroundColor:
        '#1e293b',

      alignItems:
        'center',

      justifyContent:
        'center',

      zIndex: 0,

      marginTop: -14,
    },

    replyIconLeft: {
      left: 8,
    },

    replyIconRight: {
      right: 8,
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

      zIndex: 1,
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

      position:
        'relative',

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

    editedText: {
      fontSize: 11,

      color: '#bfdbfe',

      marginTop: 4,

      opacity: 0.7,
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
      position:
        'absolute',

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

    replyBubbleContext: {
      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        'rgba(0, 0, 0, 0.15)',

      borderRadius: 8,

      paddingHorizontal: 8,

      paddingVertical: 6,

      marginBottom: 8,

      gap: 8,

      maxWidth: '100%',
    },

    userReplyContext: {
      backgroundColor:
        'rgba(0, 0, 0, 0.20)',
    },

    aiReplyContext: {
      backgroundColor:
        'rgba(255, 255, 255, 0.05)',
    },

    replyContextAccent: {
      width: 3,

      height: '100%',

      borderRadius: 999,

      minHeight: 24,
    },

    userReplyContextAccent: {
      backgroundColor:
        '#93c5fd',
    },

    aiReplyContextAccent: {
      backgroundColor:
        '#3b82f6',
    },

    replyContextDetails: {
      flex: 1,

      justifyContent:
        'center',
    },

    replyContextSender: {
      fontSize: 11,

      fontWeight: '700',

      marginBottom: 1,
    },

    userReplyContextSender: {
      color: '#93c5fd',
    },

    aiReplyContextSender: {
      color: '#60a5fa',
    },

    replyContextText: {
      color: '#94a3b8',

      fontSize: 12,

      lineHeight: 16,
    },

    bubbleImage: {
      width: 220,
      height: 160,

      borderRadius: 12,

      marginBottom: 8,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.05)',
    },

    bubbleImageWrapper: {
      overflow:
        'hidden',

      borderRadius: 12,

      marginBottom: 8,
    },

    modalBackground: {
      flex: 1,

      backgroundColor:
        'rgba(2, 6, 23, 0.95)',

      justifyContent:
        'center',

      alignItems:
        'center',
    },

    modalContent: {
      width: '100%',

      height: '100%',

      justifyContent:
        'center',

      alignItems:
        'center',

      position:
        'relative',
    },

    modalCloseButton: {
      position:
        'absolute',

      top: 50,
      right: 20,

      width: 44,
      height: 44,

      borderRadius: 22,

      backgroundColor:
        'rgba(30, 41, 59, 0.7)',

      justifyContent:
        'center',

      alignItems:
        'center',

      zIndex: 10,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.1)',
    },

    fullImage: {
      width: '94%',

      height: '80%',
    },

    // ACTION MENU

    actionOverlay: {
      flex: 1,

      backgroundColor:
        'rgba(0,0,0,0.45)',

      justifyContent:
        'flex-end',
    },

    actionSheet: {
      backgroundColor:
        '#0f172a',

      padding: 14,

      borderTopLeftRadius: 24,

      borderTopRightRadius: 24,

      borderWidth: 1,

      borderColor:
        '#1e293b',

      gap: 4,
    },

    actionButton: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 12,

      paddingVertical: 16,

      paddingHorizontal: 6,
    },

    actionText: {
      color: '#ffffff',

      fontSize: 16,

      fontWeight: '600',
    },

    deleteText: {
      color: '#ef4444',

      fontSize: 16,

      fontWeight: '600',
    },
  });