import { useEffect, useState } from 'react';
import { ChatContainer } from './components/ChatContainer';
import { Header } from './components/Header';
import { Homepage } from './components/Homepage';
import { SettingsModal } from './components/SettingsModal';
import { ChatSidebar } from './components/ChatSidebar';
import { useChat } from './hooks/useChat';
import { ChatMode } from './types/chat';

function App() {
  const [showHomepage, setShowHomepage] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
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

  // Handle mobile viewport height issues
  useEffect(() => {
    const setMobileViewportHeight = () => {
      // Set CSS custom property for mobile viewport height
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial height
    setMobileViewportHeight();

    // Update height on resize (when mobile browser UI shows/hides)
    window.addEventListener('resize', setMobileViewportHeight);
    window.addEventListener('orientationchange', setMobileViewportHeight);

    return () => {
      window.removeEventListener('resize', setMobileViewportHeight);
      window.removeEventListener('orientationchange', setMobileViewportHeight);
    };
  }, []);

  // Manage body overflow and mobile positioning based on homepage visibility
  useEffect(() => {
    if (showHomepage) {
      // Allow body to scroll for homepage  
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
      // Remove mobile positioning restrictions on homepage
      if (window.innerWidth <= 768) {
        document.body.style.position = 'static';
        document.documentElement.style.position = 'static';
      }
    } else {
      // Hide body overflow when in chat mode
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      // Apply mobile positioning for chat mode
      if (window.innerWidth <= 768) {
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.documentElement.style.position = 'static';
      }
    }

    // Cleanup function to restore default state
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.body.style.position = 'static';
      document.documentElement.style.position = 'static';
    };
  }, [showHomepage]);

  // Initialize homepage visibility based on existing chats
  useEffect(() => {
    // If there are existing chats but no current chat, select the most recent one
    if (chatHistory.length > 0 && !currentChat) {
      selectChat(chatHistory[0]);
      setShowHomepage(false);
    } else if (currentChat) {
      setShowHomepage(false);
    }
  }, [chatHistory, currentChat, selectChat]);

  useEffect(() => {
    // Check if API key is available
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.warn('VITE_OPENAI_API_KEY not found. Using backend API instead.');
    }
  }, []);

  const handleStartChat = (selectedMode: ChatMode) => {
    createNewChat(selectedMode, 5);
    setShowHomepage(false);
  };

  const handleNewChat = (mode: ChatMode) => {
    createNewChat(mode, currentChat?.roastLevel || 5);
    setShowHomepage(false);
  };

  const handleSelectChat = (chat: any) => {
    selectChat(chat);
    setShowHomepage(false);
    // Close mobile sidebar when selecting a chat
    setIsMobileSidebarOpen(false);
  };

  const handleBackToHome = () => {
    setShowHomepage(true);
  };

  const handleDeleteChat = (chatId: string) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      deleteChat(chatId);
      
      // If we deleted the current chat and no chats remain, go to homepage
      if (currentChat?.id === chatId && chatHistory.length <= 1) {
        setShowHomepage(true);
      }
    }
  };

  const handleUpdateSettings = (mode: ChatMode, roastLevel: number) => {
    updateChatSettings(mode, roastLevel);
  };

  // If homepage is shown, render it without sidebar
  if (showHomepage) {
    return <Homepage onStartChat={handleStartChat} />;
  }

  return (
    <div className="h-screen bg-slate-900 text-white flex relative overflow-hidden" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      {/* Mobile sidebar backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="sidebar-overlay lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar-mobile ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:relative z-50 lg:z-auto transition-transform duration-300 ease-in-out h-full`}>
        <ChatSidebar
          chatHistory={chatHistory}
          currentChat={currentChat}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="mobile-chat-main flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {currentChat ? (
          <>
            <Header
              onBackToHome={handleBackToHome}
              onShowSettings={() => setIsSettingsModalOpen(true)}
              onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              messages={currentChat.messages}
              mode={currentChat.mode}
              roastLevel={currentChat.roastLevel}
            />
            <div className="flex-1 min-h-0 overflow-hidden">
              <ChatContainer
                messages={currentChat.messages}
                onSendMessage={sendUserMessage}
                isLoading={isLoading}
                mode={currentChat.mode}
                onEditMessage={
                  editMessage
                }
                onDeleteMessage={
                  deleteMessage
                }
              />
            </div>
          </>
        ) : (
          /* No chat selected state */
          <div className="flex-1 flex items-center justify-center p-4 h-full overflow-hidden">
            <div className="text-center max-w-md mx-auto">
              <div className="text-4xl sm:text-6xl mb-6">💬</div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">No Chat Selected</h2>
              <p className="text-slate-400 mb-6 text-sm sm:text-base">
                Select a chat from the sidebar or create a new conversation to get started.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => handleNewChat('convince-ai')}
                  className="w-full p-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 
                           rounded-xl transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  🤖 New Convince AI Chat
                </button>
                <button
                  onClick={() => handleNewChat('prove-human')}
                  className="w-full p-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 
                           rounded-xl transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  👤 New Prove Human Chat
                </button>
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all duration-200 
                           font-medium text-sm sm:text-base lg:hidden"
                >
                  📁 Browse Chat History
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {currentChat && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          mode={currentChat.mode}
          onModeChange={(mode) => handleUpdateSettings(mode, currentChat.roastLevel)}
          roastLevel={currentChat.roastLevel}
          onRoastLevelChange={(level) => handleUpdateSettings(currentChat.mode, level)}
          messages={currentChat.messages}
        />
      )}
    </div>
  );
}

export default App;