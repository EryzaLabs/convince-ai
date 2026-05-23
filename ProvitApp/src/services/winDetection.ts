import { ChatMode } from '../types/chat';
import { getLevelConfig } from './levelConfig';

/**
 * Checks whether the latest AI message signals a win.
 *
 * Two-layer detection:
 *  1. Backend verdict field (passed as `backendVerdict`) — most reliable.
 *  2. Keyword scan of the AI message — client-side fallback.
 *
 * The verdict check is completely separate from the AI's conversational
 * response, so it never biases what the AI says.
 */
export const detectWin = (
  aiMessage: string,
  mode: ChatMode,
  level: number,
  backendVerdict?: string
): boolean => {
  // ── Layer 1: backend verdict ──────────────────────────────
  if (backendVerdict === 'won') return true;

  // ── Layer 2: keyword scan ─────────────────────────────────
  const config = getLevelConfig(mode, level);
  const lower = aiMessage.toLowerCase();

  return config.winKeywords.some(kw => lower.includes(kw.toLowerCase()));
};

/**
 * Returns the number of stars to award (1–3) based on message efficiency.
 *  3 stars = won in ≤4 messages
 *  2 stars = won in ≤8 messages
 *  1 star  = won in more messages
 */
export const calcStars = (userMessageCount: number): number => {
  if (userMessageCount <= 4) return 3;
  if (userMessageCount <= 8) return 2;
  return 1;
};
