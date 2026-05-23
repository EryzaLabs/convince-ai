import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayerProgress, ModeProgress, ChatMode } from '../types/chat';

const PROGRESS_KEY = 'provit_player_progress';

const defaultModeProgress = (): ModeProgress => ({
  unlockedLevels: [1],
  completedLevels: [],
});

const defaultProgress = (): PlayerProgress => ({
  convinceAi: defaultModeProgress(),
  proveHuman: defaultModeProgress(),
  totalWins: 0,
  hasSeenOnboarding: false,
});

export const levelStorage = {
  async loadProgress(): Promise<PlayerProgress> {
    try {
      const raw = await AsyncStorage.getItem(PROGRESS_KEY);
      if (!raw) return defaultProgress();

      const parsed = JSON.parse(raw) as PlayerProgress;

      // Ensure structure is valid (handles old saves)
      return {
        convinceAi: {
          unlockedLevels: parsed.convinceAi?.unlockedLevels ?? [1],
          completedLevels: parsed.convinceAi?.completedLevels ?? [],
        },
        proveHuman: {
          unlockedLevels: parsed.proveHuman?.unlockedLevels ?? [1],
          completedLevels: parsed.proveHuman?.completedLevels ?? [],
        },
        totalWins: parsed.totalWins ?? 0,
        hasSeenOnboarding: parsed.hasSeenOnboarding ?? false,
      };
    } catch (e) {
      console.error('levelStorage.loadProgress error:', e);
      return defaultProgress();
    }
  },

  async saveProgress(progress: PlayerProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('levelStorage.saveProgress error:', e);
    }
  },

  async markLevelComplete(
    mode: ChatMode,
    level: number,
    currentProgress: PlayerProgress
  ): Promise<PlayerProgress> {
    const track = mode === 'convince-ai' ? 'convinceAi' : 'proveHuman';
    const modeData = currentProgress[track];

    const completedLevels = modeData.completedLevels.includes(level)
      ? modeData.completedLevels
      : [...modeData.completedLevels, level];

    // Unlock next level (up to 10)
    const nextLevel = level + 1;
    const unlockedLevels =
      nextLevel <= 10 && !modeData.unlockedLevels.includes(nextLevel)
        ? [...modeData.unlockedLevels, nextLevel]
        : modeData.unlockedLevels;

    const updated: PlayerProgress = {
      ...currentProgress,
      totalWins: currentProgress.totalWins + 1,
      [track]: { completedLevels, unlockedLevels },
    };

    await levelStorage.saveProgress(updated);
    return updated;
  },

  async markOnboardingSeen(currentProgress: PlayerProgress): Promise<PlayerProgress> {
    const updated = { ...currentProgress, hasSeenOnboarding: true };
    await levelStorage.saveProgress(updated);
    return updated;
  },

  async resetProgress(): Promise<PlayerProgress> {
    const fresh = defaultProgress();
    await levelStorage.saveProgress(fresh);
    return fresh;
  },
};
