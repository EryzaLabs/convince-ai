import { useState, useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { ChatSession, ChatMode, Message } from '../types/chat';
import { openAIService } from '../services/openai';
import { chatStorage, generateId } from '../services/chatStorage';
import { detectWin, calcStars } from '../services/winDetection';

interface ChatState {
  currentChat: ChatSession | null;
  chatHistory: ChatSession[];
  isLoading: boolean;
  winDetected: boolean;
  winStars: number;
  isHistoryLoaded: boolean;
}

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    currentChat: null,
    chatHistory: [],
    isLoading: false,
    winDetected: false,
    winStars: 0,
    isHistoryLoaded: false,
  });

  const userHasText = useRef(false);
  const nudgeTimerRef = useRef<any>(null);
  const hasNudgedRef = useRef(false);

  const currentChatRef = useRef<ChatSession | null>(null);
  const isLoadingRef = useRef(false);
  const winDetectedRef = useRef(false);

  useEffect(() => {
    currentChatRef.current = state.currentChat;
    isLoadingRef.current = state.isLoading;
    winDetectedRef.current = state.winDetected;
  }, [state.currentChat, state.isLoading, state.winDetected]);

  // Load chat history from AsyncStorage on initialization
  useEffect(() => {
    const loadSavedHistory = async () => {
      const savedHistory = await chatStorage.loadChatSessions();
      setState(prev => ({
        ...prev,
        chatHistory: savedHistory,
        isHistoryLoaded: true,
      }));
    };
    loadSavedHistory();
  }, []);

  // Save chat history to AsyncStorage whenever it changes
  useEffect(() => {
    if (state.chatHistory.length > 0) {
      chatStorage.saveChatSessions(state.chatHistory);
    }
  }, [state.chatHistory]);

  const createNewChat = useCallback((mode: ChatMode, roastLevel: number = 5, level: number = 1) => {
    let result: ChatSession | null = null;

    setState(prev => {
      // Always check the freshest chatHistory here (no stale closure)
      const existingEmpty = prev.chatHistory.find(
        c =>
          c.mode === mode &&
          c.level === level &&
          c.messages.length === 0 &&
          !c.levelCompleted
      );

      if (existingEmpty) {
        result = existingEmpty;
        return { ...prev, currentChat: existingEmpty, winDetected: false, winStars: 0 };
      }

      const now = new Date();
      const newChat: ChatSession = {
        id: `chat_${now.getTime()}_${generateId()}`,
        name: mode === 'convince-ai' ? '🤖 Convincing AI...' : '👤 Testing Human...',
        messages: [],
        mode,
        roastLevel,
        level,
        levelCompleted: false,
        createdAt: now,
        updatedAt: now,
      };

      result = newChat;
      return {
        ...prev,
        currentChat: newChat,
        chatHistory: [newChat, ...prev.chatHistory],
        winDetected: false,
        winStars: 0,
      };
    });

    return result;
  }, []); // empty deps OK — reads prev (fresh) inside setState

  const selectChat = useCallback((chat: ChatSession) => {
    setState(prev => ({
      ...prev,
      currentChat: chat,
      winDetected: false,
      winStars: 0,
    }));
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setState(prev => {
      const updatedHistory = prev.chatHistory.filter(chat => chat.id !== chatId);
      const newCurrentChat = prev.currentChat?.id === chatId 
        ? (updatedHistory.length > 0 ? updatedHistory[0] : null)
        : prev.currentChat;
      
      return {
        ...prev,
        currentChat: newCurrentChat,
        chatHistory: updatedHistory
      };
    });
  }, []);

  const addMessage = useCallback((
    content: string, 
    sender: 'user' | 'ai', 
    isTyping = false, 
    replyTo?: Message['replyTo'],
    imageUri?: string
  ) => {
    const message = {
      id: Date.now().toString() + Math.random(),
      content,
      sender,
      timestamp: new Date(),
      isTyping,
      replyTo,
      imageUri
    };

    setState(prev => {
      if (!prev.currentChat) return prev;
      
      const updatedChat = {
        ...prev.currentChat,
        messages: [...prev.currentChat.messages, message],
        updatedAt: new Date()
      };

      const updatedHistory = prev.chatHistory.map(chat => 
        chat.id === updatedChat.id ? updatedChat : chat
      );

      return {
        ...prev,
        currentChat: updatedChat,
        chatHistory: updatedHistory
      };
    });

    return message.id;
  }, []);

  const updateMessage = useCallback((id: string, content: string, isTyping = false) => {
    setState(prev => {
      if (!prev.currentChat) return prev;

      const updatedMessages = prev.currentChat.messages.map(msg => 
        msg.id === id ? { ...msg, content, isTyping } : msg
      );

      const updatedChat = {
        ...prev.currentChat,
        messages: updatedMessages,
        updatedAt: new Date()
      };

      const updatedHistory = prev.chatHistory.map(chat => 
        chat.id === updatedChat.id ? updatedChat : chat
      );

      return {
        ...prev,
        currentChat: updatedChat,
        chatHistory: updatedHistory
      };
    });
  }, []);

  const editMessage = useCallback(async (
    messageId: string,
    newContent: string
  ) => {
    const now = new Date();
    setState(prev => {
      if (!prev.currentChat) return prev;

      const updatedMessages =
        prev.currentChat.messages.map(msg => {
          if (msg.id !== messageId)
            return msg;

          return {
            ...msg,
            content: newContent,
            edited: true,
            editedAt: now,
            editHistory: [
              ...(msg.editHistory || []),
              {
                previousContent: msg.content,
                editedAt: now,
              },
            ],
          };
        });

      const updatedChat = {
        ...prev.currentChat,
        messages: updatedMessages,
        updatedAt: now,
      };

      const updatedHistory =
        prev.chatHistory.map(chat =>
          chat.id === updatedChat.id
            ? updatedChat
            : chat
        );

      return {
        ...prev,
        currentChat: updatedChat,
        chatHistory: updatedHistory,
      };
    });

    const currentChatSnapshot = currentChatRef.current;
    if (!currentChatSnapshot || isLoadingRef.current || winDetectedRef.current) return;

    const userMessages = currentChatSnapshot.messages.filter(m => m.sender === 'user');
    const isLastUserMessage = userMessages.length > 0 && userMessages[userMessages.length - 1].id === messageId;

    if (!isLastUserMessage) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    const typingId = addMessage('', 'ai', true);

    try {
      const conversationHistory = currentChatSnapshot.messages.map(msg => {
        let msgContent = msg.id === messageId ? newContent : msg.content;
        
        if (msg.id === messageId) {
          const prevContent = msg.content;
          msgContent = `[User edited this message after it was already sent. Previous version: "${prevContent}"]\n${newContent}`;
        } else if (msg.sender === 'user' && msg.edited && msg.editedAt) {
          const editAge = now.getTime() - new Date(msg.editedAt).getTime();
          const RECENT_EDIT_WINDOW = 1000 * 60 * 2; // 2 mins
          if (editAge < RECENT_EDIT_WINDOW) {
            msgContent = `[User edited this message after it was already sent. Previous version: "${msg.editHistory?.slice(-1)[0]?.previousContent || ''}"]\n${msgContent}`;
          }
        }

        if (msg.replyTo) {
          const replySenderLabel = msg.replyTo.sender === 'user' ? 'You' : 'AI';
          const snippet = msg.replyTo.content.slice(0, 120);
          msgContent = `[Replying to ${replySenderLabel}: "${snippet}${msg.replyTo.content.length > 120 ? '…' : ''}"]\n${msgContent}`;
        }

        return {
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msgContent,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : new Date(msg.timestamp).toISOString()
        };
      });

      conversationHistory.push({
        role: 'user' as const,
        content: `[SYSTEM NOTE: The user just edited their last message. You noticed this edit. Acknowledge that you already read the original message before I edited it, and express it in your character/roast level. Then respond to the new edited content.]`,
        timestamp: new Date().toISOString()
      });

      const { message: aiResponse, messages: aiMessages, verdict } = await openAIService.sendMessage(
        conversationHistory, 
        currentChatSnapshot.mode, 
        currentChatSnapshot.roastLevel,
        currentChatSnapshot.level,
        undefined,
        undefined
      );
      
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      if (aiMessages && aiMessages.length > 0) {
        updateMessage(typingId, aiMessages[0], false);
        for (let i = 1; i < aiMessages.length; i++) {
          const typingDuration = Math.min(Math.max(aiMessages[i].length * 35, 800), 2000);
          setState(prev => ({ ...prev, isLoading: true }));
          await sleep(typingDuration);
          setState(prev => ({ ...prev, isLoading: false }));
          addMessage(aiMessages[i], 'ai');
        }
      } else {
        updateMessage(typingId, aiResponse, false);
      }

      const won = detectWin(aiResponse, currentChatSnapshot.mode, currentChatSnapshot.level, verdict);
      if (won) {
        const userMsgCount = currentChatSnapshot.messages.filter(m => m.sender === 'user').length;
        const stars = calcStars(userMsgCount);
        setState(prev => {
          if (!prev.currentChat) return prev;
          const completedChat = { ...prev.currentChat, levelCompleted: true };
          const updatedHistory = prev.chatHistory.map(c =>
            c.id === completedChat.id ? completedChat : c
          );
          return {
            ...prev,
            currentChat: completedChat,
            chatHistory: updatedHistory,
            winDetected: true,
            winStars: stars,
          };
        });
      }
    } catch (error) {
      console.error('Edit Chat Error:', error);
      updateMessage(typingId, "I was about to roast your edited message, but something went wrong on my end.", false);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [addMessage, updateMessage]);

const deleteMessage = useCallback((
  messageId: string
) => {
  setState(prev => {
    if (!prev.currentChat)
      return prev;

    const updatedMessages =
      prev.currentChat.messages.filter(
        msg => msg.id !== messageId
      );

    const updatedChat = {
      ...prev.currentChat,

      messages:
        updatedMessages,

      updatedAt:
        new Date(),
    };

    const updatedHistory =
      prev.chatHistory.map(chat =>
        chat.id === updatedChat.id
          ? updatedChat
          : chat
      );

    return {
      ...prev,

      currentChat:
        updatedChat,

      chatHistory:
        updatedHistory,
    };
  });
}, []);

  const updateChatName = useCallback(async (chatId: string, firstMessage: string, mode: ChatMode) => {
    try {
      const generatedName = await openAIService.generateChatName(firstMessage, mode);
      
      setState(prev => {
        const updatedHistory = prev.chatHistory.map(chat => 
          chat.id === chatId ? { ...chat, name: generatedName } : chat
        );
        
        const updatedCurrentChat = prev.currentChat?.id === chatId 
          ? { ...prev.currentChat, name: generatedName }
          : prev.currentChat;

        return {
          ...prev,
          currentChat: updatedCurrentChat,
          chatHistory: updatedHistory
        };
      });
    } catch (error) {
      console.error('❌ Failed to update chat name:', error);
      const fallbackName = mode === 'convince-ai' 
        ? `🤖 AI Chat - ${new Date().toLocaleTimeString()}` 
        : `👤 Human Test - ${new Date().toLocaleTimeString()}`;
      
      setState(prev => {
        const updatedHistory = prev.chatHistory.map(chat => 
          chat.id === chatId ? { ...chat, name: fallbackName } : chat
        );
        
        const updatedCurrentChat = prev.currentChat?.id === chatId 
          ? { ...prev.currentChat, name: fallbackName }
          : prev.currentChat;

        return {
          ...prev,
          currentChat: updatedCurrentChat,
          chatHistory: updatedHistory
        };
      });
    }
  }, []);

  const setInputHasText = useCallback((hasText: boolean) => {
    userHasText.current = hasText;
  }, []);

  const sendNudgeMessage = useCallback(async (userState: 'typing' | 'reading' | 'idle') => {
    const currentChatSnapshot = currentChatRef.current;
    if (!currentChatSnapshot || isLoadingRef.current || winDetectedRef.current) return;

    // Set loading state and add typing indicator
    setState(prev => ({ ...prev, isLoading: true }));
    const typingId = addMessage('', 'ai', true);

    try {
      const conversationHistory = currentChatSnapshot.messages.map(msg => {
        let msgContent = msg.content;
        if (msg.replyTo) {
          const replySenderLabel = msg.replyTo.sender === 'user' ? 'You' : 'AI';
          const snippet = msg.replyTo.content.slice(0, 120);
          msgContent = `[Replying to ${replySenderLabel}: "${snippet}${msg.replyTo.content.length > 120 ? '…' : ''}"]\n${msgContent}`;
        }
        return {
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msgContent,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : new Date(msg.timestamp).toISOString()
        };
      });

      const { message: aiResponse, messages: aiMessages, verdict } = await openAIService.sendMessage(
        conversationHistory,
        currentChatSnapshot.mode,
        currentChatSnapshot.roastLevel,
        currentChatSnapshot.level,
        userState
      );

      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      if (aiMessages && aiMessages.length > 0) {
        updateMessage(typingId, aiMessages[0], false);
        for (let i = 1; i < aiMessages.length; i++) {
          const typingDuration = Math.min(Math.max(aiMessages[i].length * 35, 800), 2000);
          setState(prev => ({ ...prev, isLoading: true }));
          await sleep(typingDuration);
          setState(prev => ({ ...prev, isLoading: false }));
          addMessage(aiMessages[i], 'ai');
        }
      } else {
        updateMessage(typingId, aiResponse, false);
      }

      // Check win verdict on the nudge response
      const won = detectWin(aiResponse, currentChatSnapshot.mode, currentChatSnapshot.level, verdict);
      if (won) {
        const userMsgCount = currentChatSnapshot.messages.filter(m => m.sender === 'user').length;
        const stars = calcStars(userMsgCount);
        setState(prev => {
          if (!prev.currentChat) return prev;
          const completedChat = { ...prev.currentChat, levelCompleted: true };
          const updatedHistory = prev.chatHistory.map(c =>
            c.id === completedChat.id ? completedChat : c
          );
          return {
            ...prev,
            currentChat: completedChat,
            chatHistory: updatedHistory,
            winDetected: true,
            winStars: stars,
          };
        });
      }
    } catch (error) {
      console.error('❌ Failed to send nudge message:', error);
      // Remove typing bubble on error
      setState(prev => {
        if (!prev.currentChat) return prev;
        return {
          ...prev,
          currentChat: {
            ...prev.currentChat,
            messages: prev.currentChat.messages.filter(msg => msg.id !== typingId)
          }
        };
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [addMessage, updateMessage]);

  const sendUserMessage = useCallback(async (
    content: string, 
    replyTo?: Message['replyTo'],
    attachedImage?: { uri: string; base64: string | null }
  ) => {
    const currentChatSnapshot = currentChatRef.current;
    if (!currentChatSnapshot || isLoadingRef.current || winDetectedRef.current) return;

    const isFirstMessage = currentChatSnapshot.messages.length === 0;

    // Save image to permanent storage locally if attached
    let permanentUri: string | undefined = undefined;
    if (attachedImage) {
      const fileName = attachedImage.uri.split('/').pop() || `img_${Date.now()}.jpg`;
      const newPath = `${FileSystem.documentDirectory}${Date.now()}_${fileName}`;
      try {
        await FileSystem.copyAsync({
          from: attachedImage.uri,
          to: newPath
        });
        permanentUri = newPath;
      } catch (e) {
        console.error("Failed to copy attached image locally", e);
        permanentUri = attachedImage.uri; // Fallback to temp path
      }
    }

    // Add user message with replyTo metadata and imageUri
    addMessage(content, 'user', false, replyTo, permanentUri);
    hasNudgedRef.current = false; // Reset nudge flag because user replied
    
    // Set loading state and add typing indicator
    setState(prev => ({ ...prev, isLoading: true }));
    const typingId = addMessage('', 'ai', true);

    // Generate chat name if this is the first message
    if (isFirstMessage) {
      updateChatName(currentChatSnapshot.id, content, currentChatSnapshot.mode);
    }

    try {
      const conversationHistory =
  currentChatSnapshot.messages.map(msg => {
    let msgContent =
      msg.content;

    // REPLY CONTEXT
    if (msg.replyTo) {
      const replySender =
        msg.replyTo.sender === 'user'
          ? 'You'
          : 'AI';

      msgContent =
        `[Replying to ${replySender}: "${msg.replyTo.content}"]\n${msgContent}`;
    }

    // EDIT CONTEXT
    if (
      msg.edited &&
      msg.editedAt
    ) {
      const editAge =
        Date.now() -
        new Date(
          msg.editedAt
        ).getTime();

      const RECENT_EDIT_WINDOW =
        1000 * 60 * 2;

      // 2 mins

      if (
        editAge <
        RECENT_EDIT_WINDOW
      ) {
        msgContent =
          `[User edited this message after it was already sent. Previous version: "${msg.editHistory?.slice(-1)[0]?.previousContent || ''}"]\n${msgContent}`;
      }
    }

    return {
      role:
        msg.sender === 'user'
          ? 'user'
          : 'assistant',

      content:
        msgContent,

      timestamp:
        msg.timestamp instanceof Date
          ? msg.timestamp.toISOString()
          : new Date(
              msg.timestamp
            ).toISOString(),
    };
  });

      const { message: aiResponse, messages: aiMessages, verdict } = await openAIService.sendMessage(
        conversationHistory, 
        currentChatSnapshot.mode, 
        currentChatSnapshot.roastLevel,
        currentChatSnapshot.level,
        undefined,
        attachedImage?.base64 || undefined
      );
      
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      // Update/add response bubbles
      if (aiMessages && aiMessages.length > 0) {
        updateMessage(typingId, aiMessages[0], false);
        for (let i = 1; i < aiMessages.length; i++) {
          const typingDuration = Math.min(Math.max(aiMessages[i].length * 35, 800), 2000);
          setState(prev => ({ ...prev, isLoading: true }));
          await sleep(typingDuration);
          setState(prev => ({ ...prev, isLoading: false }));
          addMessage(aiMessages[i], 'ai');
        }
      } else {
        updateMessage(typingId, aiResponse, false);
      }

      // ── Win Detection ─────────────────────────────────────
      const won = detectWin(aiResponse, currentChatSnapshot.mode, currentChatSnapshot.level, verdict);

      if (won) {
        // Count how many user messages were sent (including this one)
        const userMsgCount = currentChatSnapshot.messages.filter(m => m.sender === 'user').length + 1;
        const stars = calcStars(userMsgCount);

        // Mark session as level completed
        setState(prev => {
          if (!prev.currentChat) return prev;

          const completedChat = { ...prev.currentChat, levelCompleted: true };
          const updatedHistory = prev.chatHistory.map(c =>
            c.id === completedChat.id ? completedChat : c
          );

          return {
            ...prev,
            currentChat: completedChat,
            chatHistory: updatedHistory,
            winDetected: true,
            winStars: stars,
          };
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error && error.message.includes('backend') 
        ? "Oops! Can't reach the backend server. Make sure it's running!"
        : "Something went wrong! Even I'm confused, and that never happens.";
      
      updateMessage(typingId, errorMessage, false);
      console.error('Chat Error:', error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [addMessage, updateMessage, updateChatName]);

  const currentChatId = state.currentChat?.id;
  const messagesCount = state.currentChat?.messages?.length ?? 0;

  useEffect(() => {
    // Clear any existing timer
    if (nudgeTimerRef.current) {
      clearTimeout(nudgeTimerRef.current);
      nudgeTimerRef.current = null;
    }

    const currentChatSnapshot = currentChatRef.current;
    if (!currentChatSnapshot || isLoadingRef.current || winDetectedRef.current) return;

    const messages = currentChatSnapshot.messages;
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    
    // Only schedule a nudge if the last message is from the AI
    if (lastMessage.sender === 'ai' && !hasNudgedRef.current) {
      nudgeTimerRef.current = setTimeout(() => {
        let userState: 'typing' | 'reading' | 'idle' = 'idle';
        if (AppState.currentState === 'active') {
          userState = userHasText.current ? 'typing' : 'reading';
        }
        sendNudgeMessage(userState);
        hasNudgedRef.current = true;
      }, 25000); // 25 seconds
    }

    return () => {
      if (nudgeTimerRef.current) {
        clearTimeout(nudgeTimerRef.current);
        nudgeTimerRef.current = null;
      }
    };
  }, [currentChatId, messagesCount, state.isLoading, state.winDetected, sendNudgeMessage]);

  const updateChatSettings = useCallback((chatId: string, settings: { mode?: ChatMode; roastLevel?: number }) => {
    setState(prev => {
      const updatedHistory = prev.chatHistory.map(chat => 
        chat.id === chatId ? { ...chat, ...settings, updatedAt: new Date() } : chat
      );
      
      const updatedCurrentChat = prev.currentChat?.id === chatId 
        ? { ...prev.currentChat, ...settings, updatedAt: new Date() }
        : prev.currentChat;

      return {
        ...prev,
        currentChat: updatedCurrentChat,
        chatHistory: updatedHistory
      };
    });
  }, []);

  const clearCurrentChat = useCallback(() => {
    setState(prev => {
      if (!prev.currentChat) return prev;

      const clearedChat = {
        ...prev.currentChat,
        messages: [],
        name: 'New Chat',
        updatedAt: new Date()
      };

      const updatedHistory = prev.chatHistory.map(chat => 
        chat.id === clearedChat.id ? clearedChat : chat
      );

      return {
        ...prev,
        currentChat: clearedChat,
        chatHistory: updatedHistory
      };
    });
  }, []);

  const dismissWin = useCallback(() => {
    setState(prev => ({ ...prev, winDetected: false, winStars: 0 }));
  }, []);

  return {
    ...state,
    // Chat management
    createNewChat,
    selectChat,
    deleteChat,
    // Message handling
    sendUserMessage,
    // Settings
    updateChatSettings,
    // Utilities
    clearCurrentChat,
    // Win state
    dismissWin,
    // Typing status setter
    setInputHasText,
    editMessage,
    deleteMessage,
  };
};
