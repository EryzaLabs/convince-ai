import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';

import { ArrowRight, Brain, UserCheck, Trophy, Lock } from 'lucide-react-native';
import { FallingPatternBackground } from './FallingPatternBackground';
import { ChatMode } from '../types/chat';

const { width } = Dimensions.get('window');

interface OnboardingProps {
  onStartChat: (mode: ChatMode, roastLevel?: number) => void;
}

// ── Reusable animated slide wrapper ────────────────────────
const SlideContent: React.FC<{ children: React.ReactNode; step: number }> = ({
  children,
  step,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(24);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 480, useNativeDriver: true }),
    ]).start();
  }, [step]);

  return (
    <Animated.View
      style={[styles.slideContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      {children}
    </Animated.View>
  );
};

// ── Small feature card used in step 1 ─────────────────────
const FeatureRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}> = ({ icon, title, description, color }) => (
  <View style={[styles.featureRow, { borderColor: color + '33' }]}>
    <View style={[styles.featureIcon, { backgroundColor: color + '22' }]}>{icon}</View>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{description}</Text>
    </View>
  </View>
);

// ── Level preview dots ─────────────────────────────────────
const LevelDots: React.FC = () => {
  const colors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#a855f7',
                  '#06b6d4', '#ef4444', '#8b5cf6', '#dc2626', '#7c3aed'];

  return (
    <View style={styles.levelDotsRow}>
      {colors.map((color, i) => (
        <View
          key={i}
          style={[
            styles.levelDot,
            i === 0
              ? { backgroundColor: color, width: 22 }
              : i < 3
              ? { backgroundColor: color }
              : { backgroundColor: '#1e293b', borderWidth: 1, borderColor: color + '44' },
          ]}
        />
      ))}
      <Lock size={10} color="#475569" style={{ marginLeft: 4 }} />
    </View>
  );
};

// ── Main Component ─────────────────────────────────────────
export const OnboardingScreen: React.FC<OnboardingProps> = ({ onStartChat }) => {
  const [step, setStep] = useState(0);
  const TOTAL_STEPS = 3;

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
    } else {
      // Done — hand off to App (which shows LevelSelectScreen)
      onStartChat('convince-ai', 5);
    }
  };

  const bgColor = '#2563eb'; // consistent blue throughout onboarding

  return (
    <View style={styles.container}>
      <FallingPatternBackground color={bgColor} />

      {/* ── Progress dots ──────────────────────────────── */}
      <View style={styles.progressContainer}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={[styles.progressDot, i === step && styles.activeProgressDot]}
          />
        ))}
      </View>

      {/* ── Step content ───────────────────────────────── */}
      <View style={styles.contentArea}>

        {/* STEP 0 — Welcome */}
        {step === 0 && (
          <SlideContent step={step}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../assets/logo.png')}
                style={{ width: '100%', height: '100%', borderRadius: 28 }}
                resizeMode="cover"
              />
            </View>

            <Text style={styles.title}>ProvIt</Text>
            <Text style={styles.subtitle}>AI vs Human</Text>

            <Text style={styles.description}>
              A battle of wits between human and machine.
              10 levels of escalating challenges await.
              Can you conquer them all?
            </Text>

            <TouchableOpacity activeOpacity={0.9} style={styles.primaryBtn} onPress={goNext}>
              <Text style={styles.primaryBtnText}>Let's Go</Text>
              <ArrowRight size={18} color="#fff" />
            </TouchableOpacity>
          </SlideContent>
        )}

        {/* STEP 1 — How it works */}
        {step === 1 && (
          <SlideContent step={step}>
            <Text style={styles.stepTitle}>Two Ways{'\n'}to Play</Text>

            <FeatureRow
              icon={<Brain size={22} color="#60a5fa" />}
              title="Convince AI"
              description="The AI thinks it's human. Expose it — make it admit it's a machine."
              color="#2563eb"
            />

            <FeatureRow
              icon={<UserCheck size={22} color="#f87171" />}
              title="Prove Human"
              description="A suspicious AI doubts your humanity. Answer its questions to convince it."
              color="#dc2626"
            />

            <View style={styles.divider} />

            <FeatureRow
              icon={<Trophy size={22} color="#facc15" />}
              title="10 Levels Each"
              description="Both modes have 10 levels — from pushover to near-impossible. Win a level to unlock the next."
              color="#eab308"
            />

            <TouchableOpacity activeOpacity={0.9} style={styles.primaryBtn} onPress={goNext}>
              <Text style={styles.primaryBtnText}>Got it</Text>
              <ArrowRight size={18} color="#fff" />
            </TouchableOpacity>
          </SlideContent>
        )}

        {/* STEP 2 — Level preview / call to action */}
        {step === 2 && (
          <SlideContent step={step}>
            <Text style={styles.stepTitle}>Start at{'\n'}Level 1</Text>

            <Text style={styles.stepDescription}>
              Defeat the AI to complete a level and unlock the next one.
              Each level gets tougher — all the way up to the Mastermind.
            </Text>

            {/* Level progression preview */}
            <View style={styles.levelPreviewCard}>
              <Text style={styles.levelPreviewLabel}>Your Progress</Text>
              <LevelDots />
              <View style={styles.levelPreviewRow}>
                <Text style={styles.levelPreviewStart}>🟢 Pushover</Text>
                <Text style={styles.levelPreviewEnd}>🧠 Mastermind</Text>
              </View>
            </View>

            <Text style={styles.winHint}>
              💡 The AI will declare its defeat when you've convinced it — that's your win signal.
            </Text>

            <TouchableOpacity activeOpacity={0.9} style={styles.startBtn} onPress={goNext}>
              <Text style={styles.startBtnText}>Choose Your Level</Text>
              <ArrowRight size={18} color="#fff" />
            </TouchableOpacity>
          </SlideContent>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },

  progressContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },

  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#1e293b',
  },

  activeProgressDot: {
    width: 28,
    backgroundColor: '#2563eb',
  },

  contentArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  slideContent: {
    width: '100%',
  },

  // ── Step 0 (welcome) ──
  logoWrapper: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    alignSelf: 'center',
    marginBottom: 32,
    overflow: 'hidden',
  },

  title: {
    fontSize: 52,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#60a5fa',
    textAlign: 'center',
    marginTop: 8,
  },

  description: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 26,
    marginTop: 24,
    paddingHorizontal: 8,
    marginBottom: 4,
  },

  primaryBtn: {
    height: 58,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Step 1 (how it works) ──
  stepTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 28,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },

  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  featureText: {
    flex: 1,
  },

  featureTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },

  featureDesc: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
  },

  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 4,
  },

  // ── Step 2 (level preview) ──
  stepDescription: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },

  levelPreviewCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 20,
    marginBottom: 18,
    alignItems: 'center',
  },

  levelPreviewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },

  levelDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },

  levelDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: '#1e293b',
  },

  levelPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  levelPreviewStart: {
    fontSize: 11,
    color: '#22c55e',
    fontWeight: '600',
  },

  levelPreviewEnd: {
    fontSize: 11,
    color: '#7c3aed',
    fontWeight: '600',
  },

  winHint: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  startBtn: {
    height: 62,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  startBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
});