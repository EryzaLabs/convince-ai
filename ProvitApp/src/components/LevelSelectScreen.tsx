import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Lock, CheckCircle, Star, ChevronRight, Brain, UserCheck } from 'lucide-react-native';

import { ChatMode, LevelConfig } from '../types/chat';
import { getLevelsForMode, TOTAL_LEVELS } from '../services/levelConfig';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2; // 2 columns with 24px padding and 12px gap

interface LevelSelectScreenProps {
  onSelectLevel: (mode: ChatMode, level: number) => void;
  isLevelUnlocked: (mode: ChatMode, level: number) => boolean;
  isLevelCompleted: (mode: ChatMode, level: number) => boolean;
  initialMode?: ChatMode;
}

const DifficultyBadge: React.FC<{ difficulty: LevelConfig['difficulty'] }> = ({ difficulty }) => {
  const colors: Record<LevelConfig['difficulty'], string> = {
    easy: '#22c55e',
    medium: '#eab308',
    hard: '#f97316',
    extreme: '#ef4444',
  };
  const labels: Record<LevelConfig['difficulty'], string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    extreme: 'Extreme',
  };

  return (
    <View style={[styles.badge, { backgroundColor: colors[difficulty] + '22' }]}>
      <Text style={[styles.badgeText, { color: colors[difficulty] }]}>
        {labels[difficulty]}
      </Text>
    </View>
  );
};

const StarRow: React.FC<{ completed: boolean }> = ({ completed }) => {
  if (!completed) return null;
  return (
    <View style={styles.starRow}>
      {[0, 1, 2].map(i => (
        <Star key={i} size={10} color="#facc15" fill="#facc15" />
      ))}
    </View>
  );
};

const LevelCard: React.FC<{
  config: LevelConfig;
  unlocked: boolean;
  completed: boolean;
  onPress: () => void;
  index: number;
}> = ({ config, unlocked, completed, onPress, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (unlocked && !completed) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [unlocked, completed]);

  return (
    <Animated.View
      style={[
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: unlocked && !completed ? pulseAnim : 1 }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={unlocked ? 0.85 : 1}
        onPress={unlocked ? onPress : undefined}
        style={[
          styles.card,
          { borderColor: unlocked ? config.color + '55' : '#1e293b' },
          completed && { backgroundColor: config.accentColor },
          !unlocked && styles.lockedCard,
        ]}
      >
        {/* Level number + icon */}
        <View style={[styles.cardIconBg, { backgroundColor: unlocked ? config.color + '22' : '#0f172a' }]}>
          <Text style={styles.cardEmoji}>{unlocked ? config.icon : '🔒'}</Text>
        </View>

        {/* Level number */}
        <Text style={[styles.cardLevel, !unlocked && styles.lockedText]}>
          Lv. {config.level}
        </Text>

        {/* Title */}
        <Text style={[styles.cardTitle, !unlocked && styles.lockedText]} numberOfLines={1}>
          {config.title}
        </Text>

        {/* Difficulty badge */}
        {unlocked ? (
          <DifficultyBadge difficulty={config.difficulty} />
        ) : (
          <View style={styles.lockOverlay}>
            <Lock size={12} color="#475569" />
          </View>
        )}

        {/* Completion stars */}
        <StarRow completed={completed} />

        {/* Completed check */}
        {completed && (
          <View style={styles.completedBadge}>
            <CheckCircle size={14} color={config.color} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  onSelectLevel,
  isLevelUnlocked,
  isLevelCompleted,
  initialMode = 'convince-ai',
}) => {
  const [activeMode, setActiveMode] = useState<ChatMode>(initialMode);
  const levels = getLevelsForMode(activeMode);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    headerFade.setValue(0);
    headerSlide.setValue(-16);
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [activeMode]);

  const completedCount = levels.filter((l) => isLevelCompleted(activeMode, l.level)).length;

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────────── */}
      <Animated.View
        style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}
      >
        <Text style={styles.appName}>ProvIt</Text>
        <Text style={styles.headerTitle}>Choose Your Level</Text>
        <Text style={styles.headerSub}>
          {completedCount}/{TOTAL_LEVELS} completed
        </Text>
      </Animated.View>

      {/* ── Mode Toggle ─────────────────────────────────────── */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.modeBtn, activeMode === 'convince-ai' && styles.modeBtnActive]}
          onPress={() => setActiveMode('convince-ai')}
        >
          <Brain size={15} color={activeMode === 'convince-ai' ? '#fff' : '#64748b'} />
          <Text style={[styles.modeBtnText, activeMode === 'convince-ai' && styles.modeBtnTextActive]}>
            Convince AI
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.modeBtn, activeMode === 'prove-human' && styles.modeRedBtnActive]}
          onPress={() => setActiveMode('prove-human')}
        >
          <UserCheck size={15} color={activeMode === 'prove-human' ? '#fff' : '#64748b'} />
          <Text style={[styles.modeBtnText, activeMode === 'prove-human' && styles.modeBtnTextActive]}>
            Prove Human
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Level Grid ─────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {levels.map((config, idx) => (
          <LevelCard
            key={`${activeMode}-${config.level}`}
            config={config}
            unlocked={isLevelUnlocked(activeMode, config.level)}
            completed={isLevelCompleted(activeMode, config.level)}
            onPress={() => onSelectLevel(activeMode, config.level)}
            index={idx}
          />
        ))}

        {/* bottom padding */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },

  header: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 18,
    paddingHorizontal: 24,
  },

  appName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },

  headerSub: {
    fontSize: 14,
    color: '#475569',
    marginTop: 6,
    fontWeight: '600',
  },

  // ── Mode toggle
  modeToggle: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 18,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 4,
    gap: 4,
  },

  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    height: 42,
    borderRadius: 12,
  },

  modeBtnActive: {
    backgroundColor: '#2563eb',
  },

  modeRedBtnActive: {
    backgroundColor: '#dc2626',
  },

  modeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },

  modeBtnTextActive: {
    color: '#ffffff',
  },

  // ── Level grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    position: 'relative',
    minHeight: 150,
  },

  lockedCard: {
    opacity: 0.5,
  },

  cardIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  cardEmoji: {
    fontSize: 22,
  },

  cardLevel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60a5fa',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 3,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
  },

  lockedText: {
    color: '#475569',
  },

  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  lockOverlay: {
    alignSelf: 'flex-start',
  },

  starRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 8,
  },

  completedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});
