import { useState, useCallback, useEffect } from 'react';
import { PlayerProgress, ChatMode } from '../types/chat';
import { levelStorage } from '../services/levelStorage';

export const useLevelProgress = () => {
  const [progress, setProgress] = useState<PlayerProgress | null>(null);

  useEffect(() => {
    levelStorage.loadProgress().then(setProgress);
  }, []);

  const getModeProgress = useCallback(
    (mode: ChatMode) => {
      if (!progress) return { unlockedLevels: [1], completedLevels: [] };
      return mode === 'convince-ai' ? progress.convinceAi : progress.proveHuman;
    },
    [progress]
  );

  const isLevelUnlocked = useCallback(
    (mode: ChatMode, level: number) => {
      if (!progress) return level === 1;
      const modeData = getModeProgress(mode);
      return modeData.unlockedLevels.includes(level);
    },
    [progress, getModeProgress]
  );

  const isLevelCompleted = useCallback(
    (mode: ChatMode, level: number) => {
      if (!progress) return false;
      const modeData = getModeProgress(mode);
      return modeData.completedLevels.includes(level);
    },
    [progress, getModeProgress]
  );

  const markLevelComplete = useCallback(
    async (mode: ChatMode, level: number) => {
      if (!progress) return;
      const updated = await levelStorage.markLevelComplete(mode, level, progress);
      setProgress(updated);
      return updated;
    },
    [progress]
  );

  const markOnboardingSeen = useCallback(async () => {
    if (!progress) return;
    const updated = await levelStorage.markOnboardingSeen(progress);
    setProgress(updated);
  }, [progress]);

  const resetProgress = useCallback(async () => {
    const fresh = await levelStorage.resetProgress();
    setProgress(fresh);
  }, []);

  return {
    progress,
    isLevelUnlocked,
    isLevelCompleted,
    getModeProgress,
    markLevelComplete,
    markOnboardingSeen,
    resetProgress,
  };
};
