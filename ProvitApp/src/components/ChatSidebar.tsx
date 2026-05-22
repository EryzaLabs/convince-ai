import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';

import {
  Plus,
  MessageSquare,
  Brain,
  UserCheck,
  Trash2,
  X,
} from 'lucide-react-native';

import {
  Chat,
  ChatMode,
} from '../types/chat';

const SCREEN_WIDTH =
  Dimensions.get('window').width;

const SIDEBAR_WIDTH = 290;

interface ChatSidebarProps {
  chatHistory: Chat[];

  currentChat: Chat | null;

  onNewChat: (
    mode: ChatMode
  ) => void;

  onSelectChat: (
    chat: Chat
  ) => void;

  onDeleteChat: (
    chatId: string
  ) => void;

  isVisible: boolean;

  onClose: () => void;
}

export const ChatSidebar: React.FC<
  ChatSidebarProps
> = ({
  chatHistory,
  currentChat,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  isVisible,
  onClose,
}) => {
  const translateX = React.useRef(
    new Animated.Value(
      -SIDEBAR_WIDTH
    )
  ).current;

  React.useEffect(() => {
    Animated.spring(
      translateX,
      {
        toValue: isVisible
          ? 0
          : -SIDEBAR_WIDTH,

        damping: 18,
        stiffness: 180,

        useNativeDriver: true,
      }
    ).start();
  }, [isVisible]);

  const panResponder =
    React.useMemo(
      () =>
        PanResponder.create({
          onMoveShouldSetPanResponder:
            (_, gesture) => {
              const isHorizontal =
                Math.abs(
                  gesture.dx
                ) >
                Math.abs(
                  gesture.dy
                );

              return (
                isHorizontal &&
                Math.abs(
                  gesture.dx
                ) > 8
              );
            },

          onPanResponderMove:
            (_, gesture) => {
              // OPENING
              if (!isVisible) {
                if (
                  gesture.dx > 0
                ) {
                  const value =
                    -SIDEBAR_WIDTH +
                    gesture.dx;

                  translateX.setValue(
                    Math.min(
                      value,
                      0
                    )
                  );
                }
              }

              // CLOSING
              else {
                if (
                  gesture.dx < 0
                ) {
                  translateX.setValue(
                    gesture.dx
                  );
                }
              }
            },

          onPanResponderRelease:
            (_, gesture) => {
              // OPEN
              if (!isVisible) {
                if (
                  gesture.dx >
                  70
                ) {
                  Animated.spring(
                    translateX,
                    {
                      toValue: 0,

                      damping: 18,
                      stiffness: 180,

                      useNativeDriver: true,
                    }
                  ).start();
                } else {
                  Animated.spring(
                    translateX,
                    {
                      toValue:
                        -SIDEBAR_WIDTH,

                      damping: 18,
                      stiffness: 180,

                      useNativeDriver: true,
                    }
                  ).start();
                }
              }

              // CLOSE
              else {
                if (
                  gesture.dx <
                  -70
                ) {
                  Animated.spring(
                    translateX,
                    {
                      toValue:
                        -SIDEBAR_WIDTH,

                      damping: 18,
                      stiffness: 180,

                      useNativeDriver: true,
                    }
                  ).start(
                    onClose
                  );
                } else {
                  Animated.spring(
                    translateX,
                    {
                      toValue: 0,

                      damping: 18,
                      stiffness: 180,

                      useNativeDriver: true,
                    }
                  ).start();
                }
              }
            },
        }),
      [isVisible]
    );

  const getPreview = (
    chat: Chat
  ) => {
    if (
      !chat.messages ||
      chat.messages.length === 0
    ) {
      return chat.mode ===
        'convince-ai'
        ? 'New Convince AI Chat'
        : 'New Prove Human Chat';
    }

    return (
      chat.messages[0]
        ?.content?.slice(
          0,
          42
        ) + '...'
    );
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Edge Gesture */}
      {!isVisible && (
        <View
          style={styles.edgeGesture}
          {...panResponder.panHandlers}
        />
      )}

      {/* Backdrop */}
      {isVisible && (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.backdrop}
          onPress={onClose}
        />
      )}

      {/* Sidebar */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.sidebarWrapper,
          {
            transform: [
              {
                translateX,
              },
            ],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>
              ProvIt
            </Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={
              styles.closeButton
            }
          >
            <X
              size={18}
              color="#cbd5e1"
            />
          </TouchableOpacity>
        </View>

        {/* Modes */}
        <View style={styles.section}>
          <Text
            style={
              styles.sectionTitle
            }
          >
            Modes
          </Text>

          <View
            style={styles.modeList}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              style={
                styles.modeButton
              }
              onPress={() => {
                onNewChat(
                  'convince-ai'
                );

                onClose();
              }}
            >
              <Brain
                size={16}
                color="#60a5fa"
              />

              <Text
                style={
                  styles.modeText
                }
              >
                Convince AI
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={
                styles.modeButton
              }
              onPress={() => {
                onNewChat(
                  'prove-human'
                );

                onClose();
              }}
            >
              <UserCheck
                size={16}
                color="#60a5fa"
              />

              <Text
                style={
                  styles.modeText
                }
              >
                Prove Human
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Chats */}
        <View
          style={[
            styles.section,
            styles.flexSection,
          ]}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Recents
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
          >
            {chatHistory.length ===
            0 ? (
              <View
                style={
                  styles.emptyState
                }
              >
                <Text
                  style={
                    styles.emptyText
                  }
                >
                  No conversations
                </Text>
              </View>
            ) : (
              chatHistory.map(
                (chat) => {
                  const isActive =
                    currentChat?.id ===
                    chat.id;

                  return (
                    <TouchableOpacity
                      key={chat.id}
                      activeOpacity={
                        0.8
                      }
                      onPress={() => {
                        onSelectChat(
                          chat
                        );

                        onClose();
                      }}
                      style={[
                        styles.chatCard,

                        isActive &&
                          styles.activeChatCard,
                      ]}
                    >
                      <View
                        style={
                          styles.chatLeft
                        }
                      >
                        <MessageSquare
                          size={15}
                          color={
                            isActive
                              ? '#ffffff'
                              : '#94a3b8'
                          }
                        />

                        <Text
                          numberOfLines={
                            1
                          }
                          style={[
                            styles.chatTitle,

                            isActive &&
                              styles.activeChatTitle,
                          ]}
                        >
                          {getPreview(
                            chat
                          )}
                        </Text>
                      </View>

                      <TouchableOpacity
                        hitSlop={{
                          top: 8,
                          bottom: 8,
                          left: 8,
                          right: 8,
                        }}
                        onPress={() =>
                          onDeleteChat(
                            chat.id
                          )
                        }
                      >
                        <Trash2
                          size={14}
                          color="#64748b"
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                }
              )
            )}
          </ScrollView>
        </View>

        {/* Floating Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={
            styles.floatingButton
          }
          onPress={() => {
            onNewChat(
              'convince-ai'
            );

            onClose();
          }}
        >
          <Plus
            size={16}
            color="#ffffff"
          />

          <Text
            style={
              styles.floatingButtonText
            }
          >
            New Chat
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  edgeGesture: {
    position: 'absolute',

    left: 0,
    top: 0,
    bottom: 0,

    width: 24,

    zIndex: 60,
  },

  sidebarWrapper: {
    position: 'absolute',

    left: 0,
    top: 0,
    bottom: 0,

    width: SIDEBAR_WIDTH,

    backgroundColor:
      '#000000',

    borderRightWidth: 1,
    borderRightColor:
      '#111827',

    paddingTop: 8,
    paddingHorizontal: 14,
    paddingBottom: 18,

    zIndex: 50,
  },

  backdrop: {
    position: 'absolute',

    top: 0,
    left: 0,

    width: SCREEN_WIDTH,
    height: '100%',

    backgroundColor:
      'rgba(0,0,0,0.45)',

    zIndex: 40,
  },

  header: {
    height: 52,

    flexDirection: 'row',
    justifyContent:
      'space-between',

    alignItems: 'center',

    marginBottom: 18,
  },

  logo: {
    color: '#ffffff',

    fontSize: 24,
    fontWeight: '800',
  },

  closeButton: {
    width: 34,
    height: 34,

    borderRadius: 999,

    backgroundColor:
      '#0f172a',

    alignItems: 'center',
    justifyContent: 'center',
  },

  section: {
    marginBottom: 18,
  },

  flexSection: {
    flex: 1,
  },

  sectionTitle: {
    color: '#94a3b8',

    fontSize: 11,
    fontWeight: '600',

    textTransform:
      'uppercase',

    letterSpacing: 1,

    marginBottom: 10,
  },

  modeList: {
    gap: 10,
  },

  modeButton: {
    height: 42,

    borderRadius: 12,

    backgroundColor:
      '#0f172a',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,

    gap: 10,
  },

  modeText: {
    color: '#ffffff',

    fontSize: 14,
    fontWeight: '600',
  },

  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },

  chatCard: {
    height: 42,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',

    paddingHorizontal: 10,

    borderRadius: 10,

    marginBottom: 4,
  },

  activeChatCard: {
    backgroundColor:
      '#1e293b',
  },

  chatLeft: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 10,

    flex: 1,
  },

  chatTitle: {
    flex: 1,

    color: '#cbd5e1',

    fontSize: 14,
  },

  activeChatTitle: {
    color: '#ffffff',
  },

  floatingButton: {
    position: 'absolute',

    right: 16,
    bottom: 28,

    height: 46,

    paddingHorizontal: 16,

    borderRadius: 999,

    backgroundColor:
      '#2563eb',

    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,
  },

  floatingButtonText: {
    color: '#ffffff',

    fontSize: 14,
    fontWeight: '700',
  },
});