export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
  replyTo?: {
    sender: 'user' | 'ai';
    content: string;
  };
  imageUri?: string;
}

export type ChatMode = 'convince-ai' | 'prove-human';

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  mode: ChatMode;
  roastLevel: number;
  level: number;
  levelCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  currentChat: ChatSession | null;
  chatHistory: ChatSession[];
  isLoading: boolean;
}

export interface LevelConfig {
  level: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  roastLevel: number;
  icon: string;
  color: string;
  accentColor: string;
  winKeywords: string[];
  aiPersonaHint: string;
}

export interface ModeProgress {
  unlockedLevels: number[];
  completedLevels: number[];
}

export interface PlayerProgress {
  convinceAi: ModeProgress;
  proveHuman: ModeProgress;
  totalWins: number;
  hasSeenOnboarding: boolean;
}
