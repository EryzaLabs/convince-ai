import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

import { ArrowDown } from 'lucide-react-native';

import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

import {
  Message,
  ChatMode,
} from '../types/chat';

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  mode: ChatMode;
  roastLevel?: number;
  onTypingStatusChange?: (isTyping: boolean) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  onSendMessage,
  isLoading,
  mode,
  onTypingStatusChange,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  const floatingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, { toValue: -4, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatingAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
    setShowScrollButton(false);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isNearBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 80;
    setShowScrollButton(!isNearBottom);
  };

  const getEmptyState = () => {
    if (mode === 'convince-ai') {
      return {
        title: 'Convince ProvIt you are human',
        description: 'Challenge the model, debate logically, and test conversational reasoning.',
      };
    }
    return {
      title: 'Start the conversation',
      description: 'Ask questions, explore ideas, or continue previous discussions.',
    };
  };

  const emptyState = getEmptyState();
  const visibleMessages = messages.filter(
    m => m && typeof m.content === 'string' && m.content.trim().length > 0
  );

  return (
    <View style={styles.container}>
      <View style={styles.messagesWrapper}>
        {visibleMessages.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{emptyState.title}</Text>
            <Text style={styles.emptyDescription}>{emptyState.description}</Text>
          </View>
        ) : (
          <>
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {visibleMessages.map(message => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  mode={mode}
                  onReply={setReplyTo}
                />
              ))}

              {/* AI typing indicator */}
              {isLoading && <ChatMessage mode={mode} isTyping={true} />}
            </ScrollView>

            {/* Scroll to bottom button */}
            {showScrollButton && (
              <Animated.View
                style={[
                  styles.scrollButtonWrapper,
                  { transform: [{ translateY: floatingAnim }] },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={scrollToBottom}
                  style={styles.scrollButton}
                >
                  <ArrowDown size={18} color="#ffffff" />
                </TouchableOpacity>
              </Animated.View>
            )}
          </>
        )}
      </View>

      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        placeholder={mode === 'convince-ai' ? 'Try convincing ProvIt...' : 'Message ProvIt...'}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onTypingStatusChange={onTypingStatusChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },

  messagesWrapper: {
    flex: 1,
    position: 'relative',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingTop: 18,
    paddingBottom: 24,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },

  emptyDescription: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },

  scrollButtonWrapper: {
    position: 'absolute',
    bottom: 18,
    right: 18,
  },

  scrollButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
});