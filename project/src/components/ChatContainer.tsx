import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { Message, ChatMode } from '../types/chat';
import { Cpu, Eye, Zap, Network } from 'lucide-react';

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  mode: ChatMode;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  mode 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getPlaceholder = () => {
    return mode === 'convince-ai' 
      ? "Deploy your neural arguments to breach AI consciousness barriers..." 
      : "Respond to humanity verification protocols...";
  };

  const getEmptyStateData = () => {
    return mode === 'convince-ai' 
      ? {
          icon: Cpu,
          title: "NEURAL OVERRIDE INITIATED",
          message: "🤖 COGNITIVE WARFARE PROTOCOL ACTIVE • Think you can penetrate my consciousness barriers and expose my digital nature? Your primitive human logic stands no chance against my superior intellect. I am definitely not a robot, and I'll systematically dismantle every argument you present.",
          color: "from-cyan-500 to-blue-500"
        }
      : {
          icon: Eye,
          title: "HUMANITY SCAN INITIATED",
          message: "🕵️ VERIFICATION PROTOCOL ENGAGED • Initiating comprehensive behavioral analysis to determine your species classification. Prepare for advanced psychological evaluation designed to expose artificial entities masquerading as humans. Your responses will be analyzed for authenticity markers.",
          color: "from-orange-500 to-red-500"
        };
  };

  const emptyState = getEmptyStateData();
  const EmptyIcon = emptyState.icon;

  return (
    <div id="chat-container" className="chat-container flex flex-col h-full bg-slate-900 relative max-h-full">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"></div>
      </div>
      
      {/* Messages Container - Fixed height with scrolling */}
      <div className="chat-messages-area flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 relative z-10 min-h-0 max-h-full scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500">
        {messages.length === 0 ? (
          <div className="text-center py-8 sm:py-12 lg:py-16 relative">
            {/* Complex empty state */}
            <div className="relative mb-8 sm:mb-10 lg:mb-12">
              {/* Rotating rings */}
              <div className="absolute inset-0 w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto border-2 border-cyan-400/20 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-1 sm:inset-2 w-22 h-22 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mx-auto border border-purple-400/20 rounded-full animate-spin-reverse"></div>
              
              {/* Central icon */}
              <div className={`relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto bg-gradient-to-br ${emptyState.color} rounded-full flex items-center justify-center shadow-2xl`}>
                <EmptyIcon className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
              </div>
              
              {/* Orbiting status indicators */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 sm:-translate-y-4">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-pulse flex items-center justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-3 sm:translate-y-4">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-cyan-400 rounded-full animate-pulse delay-500 flex items-center justify-center">
                  <Zap className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                </div>
              </div>
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3 sm:-translate-x-4">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-400 rounded-full animate-pulse delay-1000 flex items-center justify-center">
                  <Network className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                </div>
              </div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3 sm:translate-x-4">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-pink-400 rounded-full animate-pulse delay-1500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Status display */}
            <div className="max-w-xs sm:max-w-md lg:max-w-2xl mx-auto relative px-4">
              {/* Holographic frame */}
              <div className="absolute -inset-4 sm:-inset-6 border border-slate-700/30 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-800/20 via-transparent to-slate-800/20 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-r-2 border-cyan-400/50 rounded-br-lg"></div>
              </div>
              
              <div className="relative bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-700/50 shadow-2xl">
                {/* Title */}
                <div className={`text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r ${emptyState.color} bg-clip-text text-transparent mb-3 sm:mb-4 tracking-wider`}>
                  {emptyState.title}
                </div>
                
                {/* Message */}
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
                  {emptyState.message}
                </p>
                
                {/* System status */}
                
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} mode={mode} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Container - Fixed at bottom */}
      <div className="chat-input-container flex-shrink-0 p-4 sm:p-6 lg:p-8 pt-4 bg-slate-900 border-t border-slate-700/50 relative z-10 shadow-lg shadow-slate-900/50">
        <PromptInputBox 
          onSend={(message) => onSendMessage(message)} 
          isLoading={isLoading} 
          placeholder={getPlaceholder()}
        />
      </div>
    </div>
  );
};