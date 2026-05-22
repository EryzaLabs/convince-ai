import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform
} from 'react-native';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

import { Homepage } from './src/components/Homepage';
import { Header } from './src/components/Header';
import { ChatContainer } from './src/components/ChatContainer';
import { ChatSidebar } from './src/components/ChatSidebar';
import { SettingsModal } from './src/components/SettingsModal';

import { useChat } from './src/hooks/useChat';
import { ChatMode } from './src/types/chat';

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

function AppContent() {
  const [showHomepage, setShowHomepage] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const bannerRef = useRef(null);

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
    createNewChat,
    selectChat,
    deleteChat,
    sendUserMessage,
    updateChatSettings
  } = useChat();

  useEffect(() => {
    if (chatHistory.length > 0 && !currentChat) {
      selectChat(chatHistory[0]);
      setShowHomepage(false);
    } else if (currentChat) {
      setShowHomepage(false);
    }
  }, [chatHistory, currentChat, selectChat]);

  const handleStartChat = (
    selectedMode: ChatMode,
    roastLevel: number = 5
  ) => {
    createNewChat(selectedMode, roastLevel);
    setShowHomepage(false);
  };

  const handleNewChat = (mode: ChatMode) => {
    createNewChat(mode, currentChat?.roastLevel || 5);
    setShowHomepage(false);
  };

  const handleSelectChat = (chat: any) => {
    selectChat(chat);
    setShowHomepage(false);
    setSidebarVisible(false);
  };

  const handleBackToHome = () => {
    setShowHomepage(true);
    setSidebarVisible(false);
  };

  const handleShowSettings = () => {
    setIsSettingsModalOpen(true);
  };

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);

    if (currentChat?.id === chatId) {
      const remainingChats = chatHistory.filter(
        (chat: any) => chat.id !== chatId
      );

      if (remainingChats.length === 0) {
        setShowHomepage(true);
      }
    }
  };

  const handleRoastLevelChange = (newLevel: number) => {
    if (currentChat) {
      updateChatSettings(currentChat.id, {
        roastLevel: newLevel
      });
    }
  };

  if (showHomepage) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#0f172a" />

        <Homepage onStartChat={handleStartChat} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0f172a" />

      <View style={styles.chatContainer}>
        {currentChat ? (
          <>
            <Header
              onBackToHome={handleBackToHome}
              onToggleSidebar={() => setSidebarVisible(true)}
              onShowSettings={handleShowSettings}
              onRoastLevelChange={handleRoastLevelChange}
              messages={currentChat.messages}
              mode={currentChat.mode}
              roastLevel={currentChat.roastLevel}
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
              onBackToHome={handleBackToHome}
              onToggleSidebar={() => setSidebarVisible(true)}
              onShowSettings={handleShowSettings}
            />

            <View style={styles.noChatContent}>
              <Text style={styles.noChatIcon}>💬</Text>

              <Text style={styles.noChatTitle}>
                No Chat Selected
              </Text>

              <Text style={styles.noChatDescription}>
                Select a chat from the sidebar or create a new
                conversation to get started.
              </Text>
            </View>
          </View>
        )}
      </View>

      <ChatSidebar
        chatHistory={chatHistory}
        currentChat={currentChat}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

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