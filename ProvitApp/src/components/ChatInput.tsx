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
  Image,
} from 'react-native';

import {
  Paperclip,
  SendHorizonal,
  Smile,
  X,
  CornerUpLeft,
  Pencil,
} from 'lucide-react-native';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

import EmojiPicker from 'rn-emoji-keyboard';

import { Message } from '../types/chat';

interface ChatInputProps {
  onSendMessage: (
    message: string,
    replyTo?: Message['replyTo'],
    attachedImage?: {
      uri: string;
      base64: string | null;
    }
  ) => void;

  onEditMessage?: (
    messageId: string,
    newContent: string
  ) => void;

  isLoading: boolean;

  placeholder?: string;

  replyTo?: Message | null;

  editingMessage?: Message | null;

  onCancelReply?: () => void;

  onCancelEdit?: () => void;

  onTypingStatusChange?: (
    isTyping: boolean
  ) => void;
}

export const ChatInput: React.FC<
  ChatInputProps
> = ({
  onSendMessage,
  onEditMessage,
  isLoading,
  placeholder = 'Ask anything...',
  replyTo,
  editingMessage,
  onCancelReply,
  onCancelEdit,
  onTypingStatusChange,
}) => {
  const [message, setMessage] =
    useState('');

  const [emojiOpen, setEmojiOpen] =
    useState(false);

  const [
    attachedImage,
    setAttachedImage,
  ] = useState<{
    uri: string;
    base64: string | null;
  } | null>(null);

  const inputRef =
    useRef<TextInput>(null);

  const scaleAnim =
    useRef(
      new Animated.Value(1)
    ).current;

  // ─────────────────────────────
  // REPLY BAR
  // ─────────────────────────────

  const replyBarHeight =
    useRef(
      new Animated.Value(0)
    ).current;

  const replyBarOpacity =
    useRef(
      new Animated.Value(0)
    ).current;

  // ─────────────────────────────
  // PREFILL EDIT
  // ─────────────────────────────

  useEffect(() => {
    if (
      editingMessage
    ) {
      setMessage(
        editingMessage.content
      );

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [editingMessage]);

  // ─────────────────────────────
  // REPLY ANIMATION
  // ─────────────────────────────

  useEffect(() => {
    if (replyTo) {
      Animated.parallel([
        Animated.spring(
          replyBarHeight,
          {
            toValue: 52,
            tension: 80,
            friction: 10,
            useNativeDriver: false,
          }
        ),

        Animated.timing(
          replyBarOpacity,
          {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }
        ),
      ]).start();

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      Animated.parallel([
        Animated.timing(
          replyBarHeight,
          {
            toValue: 0,
            duration: 180,
            useNativeDriver: false,
          }
        ),

        Animated.timing(
          replyBarOpacity,
          {
            toValue: 0,
            duration: 180,
            useNativeDriver: false,
          }
        ),
      ]).start();
    }
  }, [replyTo]);

  // ─────────────────────────────
  // TYPING STATE
  // ─────────────────────────────

  useEffect(() => {
    onTypingStatusChange?.(
      message.trim()
        .length > 0
    );
  }, [
    message,
    onTypingStatusChange,
  ]);

  const canSend =
    message.trim()
      .length > 0 ||
    attachedImage !==
      null;

  // ─────────────────────────────
  // IMAGE PICKER
  // ─────────────────────────────

  const handleSelectImage =
    async (
      shouldCrop:
        | boolean
        | any = false
    ) => {
      if (
        editingMessage
      )
        return;

      try {
        const permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
          !permissionResult.granted
        ) {
          alert(
            'Permission required to access images.'
          );

          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes: [
                'images',
              ],

              allowsEditing:
                typeof shouldCrop ===
                'boolean'
                  ? shouldCrop
                  : false,

              quality: 0.7,

              base64: true,
            }
          );

        if (
          !result.canceled &&
          result.assets &&
          result.assets
            .length > 0
        ) {
          const asset =
            result.assets[0];

          let base64Str =
            asset.base64 ||
            null;

          if (
            !base64Str
          ) {
            try {
              base64Str =
                await FileSystem.readAsStringAsync(
                  asset.uri,
                  {
                    encoding:
                      FileSystem.EncodingType.Base64,
                  }
                );
            } catch (
              readErr
            ) {
              console.error(
                'Failed to read image',
                readErr
              );
            }
          }

          setAttachedImage(
            {
              uri: asset.uri,

              base64:
                base64Str
                  ? `data:image/jpeg;base64,${base64Str}`
                  : null,
            }
          );
        }
      } catch (err) {
        console.error(
          'Image picker error',
          err
        );
      }
    };

  // ─────────────────────────────
  // BUTTON ANIMATION
  // ─────────────────────────────

  const animateButton =
    () => {
      Animated.sequence([
        Animated.timing(
          scaleAnim,
          {
            toValue: 0.92,
            duration: 70,
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          scaleAnim,
          {
            toValue: 1,
            duration: 70,
            useNativeDriver: true,
          }
        ),
      ]).start();
    };

  // ─────────────────────────────
  // SEND / EDIT
  // ─────────────────────────────

  const handleSend =
    () => {
      if (
        !canSend ||
        isLoading
      )
        return;

      const trimmed =
        message.trim();

      // EDIT MODE

      if (
        editingMessage &&
        onEditMessage
      ) {
        onEditMessage(
          editingMessage.id,
          trimmed
        );

        setMessage('');

        onCancelEdit?.();

        return;
      }

      // NORMAL SEND

      onSendMessage(
        trimmed,

        replyTo
          ? {
              sender:
                replyTo.sender,

              content:
                replyTo.content,
            }
          : undefined,

        attachedImage ||
          undefined
      );

      setMessage('');

      setAttachedImage(
        null
      );

      onCancelReply?.();

      requestAnimationFrame(
        () => {
          inputRef.current?.focus();
        }
      );
    };

  const senderLabel =
    replyTo?.sender ===
    'user'
      ? 'You'
      : 'AI';

  const replySnippet =
    replyTo?.content?.slice(
      0,
      80
    ) ?? '';

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS ===
        'ios'
          ? 'padding'
          : undefined
      }
      keyboardVerticalOffset={
        10
      }
    >
      <View
        style={
          styles.wrapper
        }
      >
        {/* EDIT BAR */}

        {editingMessage && (
          <View
            style={
              styles.editBar
            }
          >
            <View
              style={
                styles.editAccent
              }
            />

            <View
              style={{
                flex: 1,
              }}
            >
              <View
                style={
                  styles.editHeader
                }
              >
                <Pencil
                  size={12}
                  color="#facc15"
                />

                <Text
                  style={
                    styles.editTitle
                  }
                >
                  Editing
                  message
                </Text>
              </View>

              <Text
                numberOfLines={
                  1
                }
                style={
                  styles.editPreview
                }
              >
                {
                  editingMessage.content
                }
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setMessage(
                  ''
                );

                onCancelEdit?.();
              }}
              style={
                styles.editCloseButton
              }
            >
              <X
                size={15}
                color="#94a3b8"
              />
            </TouchableOpacity>
          </View>
        )}

        {/* REPLY BAR */}

        <Animated.View
          style={[
            styles.replyBar,

            {
              height:
                replyBarHeight,

              opacity:
                replyBarOpacity,
            },
          ]}
        >
          <View
            style={
              styles.replyBarInner
            }
          >
            <View
              style={
                styles.replyBarAccent
              }
            />

            <View
              style={
                styles.replyBarContent
              }
            >
              <View
                style={
                  styles.replyBarHeader
                }
              >
                <CornerUpLeft
                  size={11}
                  color="#60a5fa"
                />

                <Text
                  style={
                    styles.replyBarSender
                  }
                >
                  {
                    senderLabel
                  }
                </Text>
              </View>

              <Text
                style={
                  styles.replyBarText
                }
                numberOfLines={
                  1
                }
              >
                {
                  replySnippet
                }
              </Text>
            </View>

            <TouchableOpacity
              onPress={
                onCancelReply
              }
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
              style={
                styles.replyBarClose
              }
            >
              <X
                size={14}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* IMAGE PREVIEW */}

        {attachedImage && (
          <View
            style={
              styles.imagePreviewBar
            }
          >
            <TouchableOpacity
              style={
                styles.imagePreviewWrapper
              }
              activeOpacity={
                0.85
              }
              onPress={() =>
                handleSelectImage(
                  true
                )
              }
            >
              <Image
                source={{
                  uri: attachedImage.uri,
                }}
                style={
                  styles.imagePreview
                }
              />

              <TouchableOpacity
                onPress={e => {
                  e.stopPropagation();

                  setAttachedImage(
                    null
                  );
                }}
                style={
                  styles.removeImageButton
                }
                activeOpacity={
                  0.8
                }
              >
                <X
                  size={12}
                  color="#ffffff"
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        )}

        {/* INPUT */}

        <View
          style={
            styles.container
          }
        >
          {/* IMAGE */}

          <TouchableOpacity
            style={[
              styles.iconButton,

              editingMessage && {
                opacity: 0.4,
              },
            ]}
            disabled={
              !!editingMessage
            }
            onPress={() =>
              handleSelectImage(
                false
              )
            }
          >
            <Paperclip
              size={20}
              color={
                attachedImage
                  ? '#3b82f6'
                  : '#94a3b8'
              }
            />
          </TouchableOpacity>

          {/* INPUT */}

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
            style={
              styles.input
            }
            blurOnSubmit={
              false
            }
            returnKeyType="send"
            onSubmitEditing={
              handleSend
            }
          />

          {/* EMOJI */}

          <TouchableOpacity
            style={
              styles.iconButton
            }
            onPress={() =>
              setEmojiOpen(
                true
              )
            }
          >
            <Smile
              size={20}
              color="#94a3b8"
            />
          </TouchableOpacity>

          {/* SEND */}

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

                (
                  !canSend ||
                  isLoading
                ) &&
                  styles.sendButtonDisabled,
              ]}
            >
              {editingMessage ? (
                <Pencil
                  size={18}
                  color="#ffffff"
                />
              ) : (
                <SendHorizonal
                  size={18}
                  color="#ffffff"
                />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* FOOTER */}

        <View
          style={
            styles.footer
          }
        >
          <Text
            style={
              styles.counter
            }
          >
            {
              message.length
            }
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

      {/* EMOJI PICKER */}

      <EmojiPicker
        open={emojiOpen}
        onClose={() =>
          setEmojiOpen(
            false
          )
        }
        onEmojiSelected={emoji => {
          setMessage(
            prev =>
              prev +
              emoji.emoji
          );

          requestAnimationFrame(
            () => {
              inputRef.current?.focus();
            }
          );
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

    // ─────────────────────────────
    // EDIT BAR
    // ─────────────────────────────

    editBar: {
      flexDirection: 'row',

      alignItems: 'center',

      backgroundColor:
        '#111827',

      borderWidth: 1,

      borderColor:
        '#374151',

      borderRadius: 14,

      paddingHorizontal: 12,

      paddingVertical: 10,

      marginBottom: 8,

      gap: 10,
    },

    editAccent: {
      width: 3,

      alignSelf: 'stretch',

      borderRadius: 999,

      backgroundColor:
        '#facc15',
    },

    editHeader: {
      flexDirection: 'row',

      alignItems: 'center',

      gap: 6,

      marginBottom: 2,
    },

    editTitle: {
      color: '#facc15',

      fontSize: 12,

      fontWeight: '700',
    },

    editPreview: {
      color: '#94a3b8',

      fontSize: 12,
    },

    editCloseButton: {
      width: 24,
      height: 24,

      borderRadius: 999,

      alignItems: 'center',

      justifyContent:
        'center',
    },

    // ─────────────────────────────
    // REPLY BAR
    // ─────────────────────────────

    replyBar: {
      overflow: 'hidden',

      marginBottom: 6,
    },

    replyBarInner: {
      flex: 1,

      flexDirection: 'row',

      alignItems: 'center',

      backgroundColor:
        '#0f172a',

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        '#1e3a8a',

      paddingHorizontal: 10,

      paddingVertical: 8,

      gap: 10,
    },

    replyBarAccent: {
      width: 3,

      height: '100%',

      borderRadius: 999,

      backgroundColor:
        '#2563eb',

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

    // ─────────────────────────────
    // INPUT
    // ─────────────────────────────

    container: {
      flexDirection: 'row',

      alignItems: 'flex-end',

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

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    sendButton: {
      width: 42,
      height: 42,

      borderRadius: 999,

      backgroundColor:
        '#2563eb',

      alignItems:
        'center',

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

      alignItems:
        'center',
    },

    counter: {
      color: '#64748b',

      fontSize: 11,
    },

    processing: {
      color: '#94a3b8',

      fontSize: 11,
    },

    // ─────────────────────────────
    // IMAGE PREVIEW
    // ─────────────────────────────

    imagePreviewBar: {
      flexDirection: 'row',

      marginBottom: 8,

      paddingLeft: 4,
    },

    imagePreviewWrapper: {
      position: 'relative',

      width: 66,
      height: 66,
    },

    imagePreview: {
      width: 60,
      height: 60,

      borderRadius: 10,

      borderWidth: 1,

      borderColor:
        '#334155',
    },

    removeImageButton: {
      position: 'absolute',

      top: -4,
      right: 2,

      width: 18,
      height: 18,

      borderRadius: 9,

      backgroundColor:
        '#ef4444',

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth: 1,

      borderColor:
        '#0f172a',

      shadowColor:
        '#000',

      shadowOffset: {
        width: 0,
        height: 1,
      },

      shadowOpacity: 0.2,

      shadowRadius: 1.5,

      elevation: 2,
    },
  });