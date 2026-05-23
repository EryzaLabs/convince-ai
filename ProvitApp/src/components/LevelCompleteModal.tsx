import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Star, Trophy, ChevronRight, RotateCcw, Home } from 'lucide-react-native';

import { ChatMode } from '../types/chat';
import { getLevelConfig, TOTAL_LEVELS } from '../services/levelConfig';

const { width } = Dimensions.get('window');

interface LevelCompleteModalProps {
  visible: boolean;
  mode: ChatMode;
  level: number;
  stars: number;            // 1 | 2 | 3
  userMessageCount: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onBackToLevels: () => void;
}

const FloatingStar: React.FC<{ delay: number; x: number; color: string }> = ({
  delay,
  x,
  color,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -60,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 800, delay: 200, useNativeDriver: true }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(translateY, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.floatingStar,
        { left: x, opacity, transform: [{ translateY }] },
      ]}
    >
      <Star size={14} color={color} fill={color} />
    </Animated.View>
  );
};

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  visible,
  mode,
  level,
  stars,
  userMessageCount,
  onNextLevel,
  onReplay,
  onBackToLevels,
}) => {
  const config = getLevelConfig(mode, level);
  const isLastLevel = level >= TOTAL_LEVELS;

  // Entrance animations
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.7);
      fadeAnim.setValue(0);
      bounceAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Trophy bounce
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -12, duration: 200, useNativeDriver: true }),
          Animated.spring(bounceAnim, { toValue: 0, tension: 80, friction: 5, useNativeDriver: true }),
        ]).start();
      });
    }
  }, [visible]);

  const starFloatColors = ['#facc15', '#fbbf24', '#f59e0b'];

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onBackToLevels}>
      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* Floating stars decoration */}
        {visible && (
          <>
            <FloatingStar delay={0} x={width * 0.15} color="#facc15" />
            <FloatingStar delay={300} x={width * 0.35} color="#60a5fa" />
            <FloatingStar delay={600} x={width * 0.6} color="#a78bfa" />
            <FloatingStar delay={900} x={width * 0.8} color="#facc15" />
            <FloatingStar delay={150} x={width * 0.5} color="#34d399" />
          </>
        )}

        {/* Card */}
        <Animated.View
          style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
        >
          {/* Trophy / level icon */}
          <Animated.View
            style={[
              styles.trophyBg,
              { backgroundColor: config.accentColor, transform: [{ translateY: bounceAnim }] },
            ]}
          >
            <Text style={styles.trophyEmoji}>
              {isLastLevel ? '🏆' : config.icon}
            </Text>
          </Animated.View>

          {/* Text */}
          <Text style={styles.completeLabel}>
            {isLastLevel ? 'CHAMPION!' : 'LEVEL COMPLETE!'}
          </Text>

          <Text style={[styles.levelName, { color: config.color }]}>
            {config.title}
          </Text>

          <Text style={styles.levelSubtitle}>
            {isLastLevel
              ? "You've beaten every level. You're unstoppable."
              : `Level ${level} of ${TOTAL_LEVELS} — ${config.difficulty.toUpperCase()}`}
          </Text>

          {/* Stars */}
          <View style={styles.starsRow}>
            {[1, 2, 3].map(s => (
              <Animated.View
                key={s}
                style={[
                  styles.starContainer,
                  s <= stars && { transform: [{ scale: 1.15 }] },
                ]}
              >
                <Star
                  size={32}
                  color={s <= stars ? '#facc15' : '#1e293b'}
                  fill={s <= stars ? '#facc15' : '#1e293b'}
                />
              </Animated.View>
            ))}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{userMessageCount}</Text>
              <Text style={styles.statLabel}>Messages</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{stars}/3</Text>
              <Text style={styles.statLabel}>Stars</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>Lv.{level}</Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            {/* Replay */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onReplay}
              style={styles.secondaryBtn}
            >
              <RotateCcw size={16} color="#94a3b8" />
              <Text style={styles.secondaryBtnText}>Replay</Text>
            </TouchableOpacity>

            {/* Next level / back */}
            {isLastLevel ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onBackToLevels}
                style={[styles.primaryBtn, { backgroundColor: config.color }]}
              >
                <Home size={16} color="#fff" />
                <Text style={styles.primaryBtnText}>Back to Levels</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onNextLevel}
                style={[styles.primaryBtn, { backgroundColor: config.color }]}
              >
                <Text style={styles.primaryBtnText}>Next Level</Text>
                <ChevronRight size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {/* Back link */}
          <TouchableOpacity onPress={onBackToLevels} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Back to Level Select</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  floatingStar: {
    position: 'absolute',
    bottom: '40%',
  },

  card: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#1e293b',
    padding: 28,
    alignItems: 'center',
  },

  trophyBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  trophyEmoji: {
    fontSize: 40,
  },

  completeLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#facc15',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  levelName: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },

  levelSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },

  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },

  starContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#020617',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 24,
  },

  statBox: {
    flex: 1,
    alignItems: 'center',
  },

  statNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 3,
  },

  statLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  statDivider: {
    width: 1,
    backgroundColor: '#1e293b',
    marginHorizontal: 4,
  },

  buttons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 16,
  },

  primaryBtn: {
    flex: 2,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  secondaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  secondaryBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },

  backLink: {
    paddingVertical: 4,
  },

  backLinkText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
});
