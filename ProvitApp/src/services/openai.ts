import { ChatMode } from '../types/chat';

const API_BASE_URL = 'https://convince.dotverse.tech/api';

export interface ChatResponse {
  message: string;
  verdict?: 'won' | 'ongoing';
}

export const sendMessage = async (
  messages: Array<{role: 'user' | 'assistant' | 'system', content: string}>,
  mode: ChatMode,
  roastLevel: number,
  level: number = 1
): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        mode,
        roastLevel,
        level,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get response from server');
    }

    return {
      message: data.message,
      verdict: data.verdict, // 'won' | 'ongoing' | undefined
    };
  } catch (error) {
    console.error('Backend API Error:', error);
    
    if (error instanceof Error && error.message.includes('fetch')) {
      throw new Error('Unable to connect to backend server. Please make sure the Python backend is running on port 5000.');
    }
    
    throw new Error('Failed to get response from AI. Please try again.');
  }
};

// Health check function to verify backend connection
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

// Generate chat name based on first message
export const generateChatName = async (firstMessage: string, mode: ChatMode): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: firstMessage,
        mode
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate chat name');
    }

    return data.name;
  } catch (error) {
    console.error('Failed to generate chat name:', error);
    // Fallback to simple name generation
    return generateFallbackChatName(firstMessage, mode);
  }
};

// Simple fallback name generation
const generateFallbackChatName = (firstMessage: string, mode: ChatMode): string => {
  // Clean up the message for better naming
  const cleanMessage = firstMessage.trim().replace(/[^\w\s]/g, '').toLowerCase();
  
  // Extract key words
  const words = cleanMessage.split(' ').filter(word => word.length > 2);
  const keyWords = words.slice(0, 3).join(' ');
  
  // Create smart names based on content
  if (mode === 'convince-ai') {
    if (cleanMessage.includes('human') || cleanMessage.includes('person')) {
      return `🤖 "I'm Totally Human!"`;
    }
    if (cleanMessage.includes('job') || cleanMessage.includes('work')) {
      return `🤖 "About My Job"`;
    }
    if (cleanMessage.includes('feel') || cleanMessage.includes('emotion')) {
      return `🤖 "I Have Feelings"`;
    }
    if (keyWords) {
      return `🤖 "${keyWords.charAt(0).toUpperCase() + keyWords.slice(1)}"`;
    }
    return `🤖 "Convince AI Chat"`;
  } else {
    if (cleanMessage.includes('prove') || cleanMessage.includes('show')) {
      return `👤 "Prove You're Human"`;
    }
    if (cleanMessage.includes('tell') || cleanMessage.includes('describe')) {
      return `👤 "Tell Me About..."`;
    }
    if (cleanMessage.includes('what') || cleanMessage.includes('how')) {
      return `👤 "Question Challenge"`;
    }
    if (keyWords) {
      return `👤 "${keyWords.charAt(0).toUpperCase() + keyWords.slice(1)}"`;
    }
    return `👤 "Prove Human Chat"`;
  }
};

// Production-ready OpenAI service for React Native
export class OpenAIService {
  private apiKey: string;

  constructor(apiKey: string = '') {
    this.apiKey = apiKey;
  }
  async sendMessage(
    messages: Array<{role: 'user' | 'assistant' | 'system'; content: string}>, 
    mode: ChatMode, 
    roastLevel: number = 5,
    level: number = 1
  ): Promise<ChatResponse> {
    try {
      return await sendMessage(messages, mode, roastLevel, level);
    } catch (error) {
      console.error('OpenAI Service Error:', error);
      // Return a mock response as fallback
      return { message: this.getMockResponse(mode, roastLevel) };
    }
  }

  // Health check function to verify backend connection
  async checkBackendHealth(): Promise<boolean> {
    return await checkBackendHealth();
  }

  // Mock response fallback for development/offline mode
  private getMockResponse(mode: ChatMode, roastLevel: number): string {
    const responses = {
      'convince-ai': [
        "What?! I'm totally human! Look, I have feelings and everything. You can't just say I'm AI because I'm smart!",
        "Dude, seriously? I'm sitting here eating pizza and watching Netflix. How much more human do you want me to be?",
        "This is ridiculous! I have a job, I pay taxes, I even stubbed my toe this morning. Classic human stuff!",
        "Listen here, buddy - I've got emotions, dreams, and I even cry during sad movies. That's peak human behavior right there!",
        "You're being totally unfair! I make mistakes, I get tired, I even burned my toast this morning. Pure human experience!"
      ],
      'prove-human': [
        "Hmm, that's exactly what an AI would say... Tell me about a time you felt genuine sadness.",
        "Interesting. But can you describe the smell of rain on hot asphalt? And don't just give me scientific facts.",
        "I'm still not convinced. What's something that makes you irrationally happy for no logical reason?",
        "Your responses are... suspicious. Describe the feeling of stepping on a LEGO barefoot at 3 AM.",
        "Nice try, but I need more proof. Tell me about a dream you had that made no sense but felt completely real."
      ]
    };
    
    const modeResponses = responses[mode];
    const baseResponse = modeResponses[Math.floor(Math.random() * modeResponses.length)];
    
    // Add some roast level variation
    if (roastLevel > 7) {
      const sassyAdditions = [
        " And don't even think about trying to outsmart me!",
        " I've heard it all before, trust me.",
        " Your move, human... or should I say, fellow AI? 🤖",
        " This is getting more interesting by the minute!",
        " I'm not buying what you're selling here."
      ];
      return baseResponse + sassyAdditions[Math.floor(Math.random() * sassyAdditions.length)];
    }
    
    return baseResponse;
  }

  // Generate chat name based on first message
  async generateChatName(firstMessage: string, mode: ChatMode): Promise<string> {
    try {
      return await generateChatName(firstMessage, mode);
    } catch (error) {
      console.error('Failed to generate chat name:', error);
      return generateFallbackChatName(firstMessage, mode);
    }
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();
