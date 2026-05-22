import React, { useState } from 'react';
import { CopyIcon, CheckIcon, ThumbsUpIcon, ThumbsDownIcon, RefreshCcwIcon } from 'lucide-react';
import { Message as ChatMessageType, ChatMode } from '../types/chat';

// Import from the new shadcn ui messaging components
import { Message, MessageContent } from '@/components/ui/message';
import { Actions, Action } from '@/components/ui/actions';

interface ChatMessageProps {
  message: ChatMessageType;
  mode: ChatMode;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, mode }) => {
  const isUser = message.sender === 'user';
  const [isCopied, setIsCopied] = useState(false);
  
  // Function to copy message content to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  // Function to render text with bold formatting for *text*
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        const boldText = part.slice(1, -1);
        return (
          <strong key={index} className="font-bold">
            {boldText}
          </strong>
        );
      }
      return part;
    });
  };
  
  return (
    <Message
      className={`flex flex-col gap-2 mb-4 ${isUser ? "items-end" : "items-start"}`}
      from={isUser ? "user" : "assistant"}
    >
      <div className="flex gap-2 w-full max-w-[80%]">
        {!isUser && (
          <img
            src={mode === 'convince-ai' ? "/assets/roxx.png" : "/assets/agent_wolf.png"}
            alt={mode === 'convince-ai' ? "Roxx" : "Agent Wolf"}
            className="w-8 h-8 rounded-full flex-shrink-0 bg-slate-800 object-cover mt-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${mode === 'convince-ai' ? 'RX' : 'AW'}&background=random`;
            }}
          />
        )}
        
        <div className="flex flex-col flex-1 min-w-0">
          <MessageContent className={isUser ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200"}>
            {message.isTyping ? (
              <div className="flex gap-1 py-1">
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                {renderFormattedText(message.content.trim())}
              </div>
            )}
          </MessageContent>
          
          {!message.isTyping && (
            <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
              <span className="font-mono text-xs text-slate-500">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              
              {!isUser && (
                <Actions>
                  <Action label="Copy" tooltip="Copy" onClick={copyToClipboard}>
                    {isCopied ? <CheckIcon className="size-4 text-green-500" /> : <CopyIcon className="size-4" />}
                  </Action>
                  <Action label="Like" tooltip="Good response">
                    <ThumbsUpIcon className="size-4" />
                  </Action>
                  <Action label="Dislike" tooltip="Bad response">
                    <ThumbsDownIcon className="size-4" />
                  </Action>
                  <Action label="Retry" tooltip="Regenerate">
                    <RefreshCcwIcon className="size-4" />
                  </Action>
                </Actions>
              )}
              
              {isUser && (
                <Actions>
                  <Action label="Copy" tooltip="Copy" onClick={copyToClipboard}>
                    {isCopied ? <CheckIcon className="size-4 text-green-500" /> : <CopyIcon className="size-4" />}
                  </Action>
                </Actions>
              )}
            </div>
          )}
        </div>
      </div>
    </Message>
  );
};