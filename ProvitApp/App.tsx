import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator
} from 'react-native';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

import { OnboardingScreen } from './src/components/OnboardingScreen';
import { Header } from './src/components/Header';
import { ChatContainer } from './src/components/ChatContainer';
import { ChatSidebar } from './src/components/ChatSidebar';
import { SettingsModal } from './src/components/SettingsModal';
import { LevelSelectScreen } from './src/components/LevelSelectScreen';
import { LevelCompleteModal } from './src/components/LevelCompleteModal';

import { useChat } from './src/hooks/useChat';
import { useLevelProgress } from './src/hooks/useLevelProgress';
import { ChatMode } from './src/types/chat';
import { getLevelConfig } from './src/services/levelConfig';

const isExpoGo = Constants.appOwnership === 'expo';

let BannerAd: any = null;
let BannerAdSize: any = null;
let useForeground: any = null;

if (!isExpoGo) {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
  useForeground = ads.useForeground;
}

const adUnitId = 'ca-app-pub-5804219391910467/2310638370';

type AppScreen = 'loading' | 'onboarding' | 'levelSelect' | 'chat';

function AppContent() {
  const [screen, setScreen] = useState<AppScreen>('loading');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [initialMode, setInitialMode] = useState<ChatMode>('convince-ai');

  // Pending level select (mode + level) for when user completes and wants next
  const [pendingMode, setPendingMode] = useState<ChatMode>('convince-ai');
  const [pendingLevel, setPendingLevel] = useState<number>(1);

  const bannerRef = useRef<any>(null);

  if (!isExpoGo && useForeground) {
    useForeground(() => {
      if (Platform.OS === 'ios') {
        bannerRef.current?.load();
      }
    });
  }

  const {
    currentChat,
    chatHistory,
    isLoading,
    isHistoryLoaded,
    winDetected,
    winStars,
    createNewChat,
    selectChat,
    deleteChat,
    sendUserMessage,
    updateChatSettings,
    dismissWin,
  } = useChat();

  const {
    progress,
    isLevelUnlocked,
    isLevelCompleted,
    markLevelComplete,
    markOnboardingSeen,
  } = useLevelProgress();

  // Track whether we've already run the startup navigation
  const hasInitialized = useRef(false);

  // On startup: wait for both progress + chat history to load, then decide where to go
  useEffect(() => {
    if (progress === null || !isHistoryLoaded) return; // still loading
    if (hasInitialized.current) return;               // already ran once
    hasInitialized.current = true;

    if (!progress.hasSeenOnboarding) {
      setScreen('onboarding');
      return;
    }

    // Restore the most recent chat if one exists
    if (chatHistory.length > 0) {
      const lastChat = chatHistory[0]; // chatHistory is sorted newest-first
      selectChat(lastChat);
      setScreen('chat');
    } else {
      setScreen('levelSelect');
    }
  }, [progress, isHistoryLoaded, chatHistory]);

  // When win is detected show the level complete modal and persist progress
  useEffect(() => {
    if (winDetected && currentChat && !showLevelComplete) {
      const { mode, level } = currentChat;
      markLevelComplete(mode, level);
      setShowLevelComplete(true);
    }
  }, [winDetected, currentChat]);

  // ── Navigation helpers ──────────────────────────────────
  const handleOnboardingComplete = useCallback(
    async (selectedMode: ChatMode, roastLevel: number = 5) => {
      await markOnboardingSeen();
      setScreen('levelSelect');
    },
    [markOnboardingSeen]
  );

  const handleSelectLevel = useCallback(
    (mode: ChatMode, level: number) => {
      const config = getLevelConfig(mode, level);
      setPendingMode(mode);
      setPendingLevel(level);
      createNewChat(mode, config.roastLevel, level);
      setScreen('chat');
    },
    [createNewChat]
  );

  const handleBackToLevels = useCallback(() => {
    dismissWin();
    setShowLevelComplete(false);
    setScreen('levelSelect');
  }, [dismissWin]);

  const handleNextLevel = useCallback(() => {
    dismissWin();
    setShowLevelComplete(false);
    const nextLevel = (currentChat?.level ?? pendingLevel) + 1;
    const mode = currentChat?.mode ?? pendingMode;
    if (nextLevel <= 10 && isLevelUnlocked(mode, nextLevel)) {
      handleSelectLevel(mode, nextLevel);
    } else {
      setScreen('levelSelect');
    }
  }, [currentChat, pendingLevel, pendingMode, isLevelUnlocked, handleSelectLevel, dismissWin]);

  const handleReplayLevel = useCallback(() => {
    dismissWin();
    setShowLevelComplete(false);
    const mode = currentChat?.mode ?? pendingMode;
    const level = currentChat?.level ?? pendingLevel;
    handleSelectLevel(mode, level);
  }, [currentChat, pendingMode, pendingLevel, handleSelectLevel, dismissWin]);

  const handleSelectChat = (chat: any) => {
    selectChat(chat);
    setScreen('chat');
    setSidebarVisible(false);
  };

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);
    if (currentChat?.id === chatId) {
      if (chatHistory.filter((c: any) => c.id !== chatId).length === 0) {
        setScreen('levelSelect');
      }
    }
  };

  const handleRoastLevelChange = (newLevel: number) => {
    if (currentChat) {
      updateChatSettings(currentChat.id, { roastLevel: newLevel });
    }
  };

  // ── Screens ─────────────────────────────────────────────

  // ── Loading screen ───────────────────────────────────────
  if (screen === 'loading') {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.loadingLogo}>ProvIt</Text>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Chats...</Text>
      </SafeAreaView>
    );
  }

  // ── Onboarding ───────────────────────────────────────────
  if (screen === 'onboarding') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <OnboardingScreen onStartChat={handleOnboardingComplete} />
      </SafeAreaView>
    );
  }

  if (screen === 'levelSelect') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LevelSelectScreen
          onSelectLevel={handleSelectLevel}
          isLevelUnlocked={isLevelUnlocked}
          isLevelCompleted={isLevelCompleted}
          initialMode={initialMode}
        />
      </SafeAreaView>
    );
  }

  // ── Chat screen ──────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.chatContainer}>
        {currentChat ? (
          <>
            <Header
              onToggleSidebar={() => setSidebarVisible(true)}
              onShowSettings={() => setIsSettingsModalOpen(true)}
              onRoastLevelChange={handleRoastLevelChange}
              messages={currentChat.messages}
              mode={currentChat.mode}
              roastLevel={currentChat.roastLevel}
              gameLevel={currentChat.level}
              onBackToHome={handleBackToLevels}
            />

            <ChatContainer
              messages={currentChat.messages}
              onSendMessage={sendUserMessage}
              isLoading={isLoading}
              mode={currentChat.mode}
              roastLevel={currentChat.roastLevel}
            />
          </>
        ) : (
          <View style={styles.noChatContainer}>
            <Header
              onToggleSidebar={() => setSidebarVisible(true)}
              onShowSettings={() => setIsSettingsModalOpen(true)}
            />
            <View style={styles.noChatContent}>
              <Text style={styles.noChatIcon}>💬</Text>
              <Text style={styles.noChatTitle}>No Chat Selected</Text>
              <Text style={styles.noChatDescription}>
                Select a level to start a new game.
              </Text>
            </View>
          </View>
        )}
      </View>

      <ChatSidebar
        chatHistory={chatHistory}
        currentChat={currentChat}
        onNewChat={(mode: ChatMode) => {
          setInitialMode(mode);
          setScreen('levelSelect');
          setSidebarVisible(false);
        }}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onShowOnboarding={() => setScreen('onboarding')}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* ── Level Complete Modal ───────────────────────────── */}
      {currentChat && (
        <LevelCompleteModal
          visible={showLevelComplete}
          mode={currentChat.mode}
          level={currentChat.level}
          stars={winStars}
          userMessageCount={
            currentChat.messages.filter(m => m.sender === 'user').length
          }
          onNextLevel={handleNextLevel}
          onReplay={handleReplayLevel}
          onBackToLevels={handleBackToLevels}
        />
      )}

      {!isExpoGo && BannerAd && (
        <BannerAd
          ref={bannerRef}
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      )}
    </SafeAreaView>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  loadingLogo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 24,
    letterSpacing: 2,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94a3b8',
    letterSpacing: 0.5,
  },

  chatContainer: {
    flex: 1,
  },

  noChatContainer: {
    flex: 1,
  },

  noChatContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  noChatIcon: {
    fontSize: 60,
    marginBottom: 20,
  },

  noChatTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },

  noChatDescription: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default App;