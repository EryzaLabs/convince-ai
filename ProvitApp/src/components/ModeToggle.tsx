import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

import {
  Brain,
  UserCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';

import { ChatMode } from '../types/chat';

interface ModeToggleProps {
  mode: ChatMode;

  onChange: (
    mode: ChatMode
  ) => void;

  disabled?: boolean;
}

export const ModeToggle: React.FC<
  ModeToggleProps
> = ({
  mode,
  onChange,
  disabled = false,
}) => {
  const isConvince =
    mode ===
    'convince-ai';

  const handleToggle = () => {
    if (disabled)
      return;

    onChange(
      isConvince
        ? 'prove-human'
        : 'convince-ai'
    );
  };

  const currentMode = isConvince
    ? {
        title:
          'Convince AI',

        subtitle:
          'Debate against ProvIt',

        icon: Brain,

        accent:
          '#38bdf8',

        bg: 'rgba(56,189,248,0.08)',

        border:
          'rgba(56,189,248,0.18)',
      }
    : {
        title:
          'Prove Human',

        subtitle:
          'Convince ProvIt you are real',

        icon: UserCheck,

        accent:
          '#fb923c',

        bg: 'rgba(251,146,60,0.08)',

        border:
          'rgba(251,146,60,0.18)',
      };

  const nextMode = isConvince
    ? {
        title:
          'Prove Human',

        accent:
          '#fb923c',
      }
    : {
        title:
          'Convince AI',

        accent:
          '#38bdf8',
      };

  const Icon =
    currentMode.icon;

  return (
    <View
      style={styles.container}
    >
      {/* CURRENT MODE */}
      <View
        style={[
          styles.currentCard,

          {
            backgroundColor:
              currentMode.bg,

            borderColor:
              currentMode.border,
          },
        ]}
      >
        {/* Glow */}
        <View
          style={[
            styles.glow,

            {
              backgroundColor:
                currentMode.accent,
            },
          ]}
        />

        {/* Icon */}
        <View
          style={[
            styles.iconWrapper,

            {
              backgroundColor:
                currentMode.accent,
            },
          ]}
        >
          <Icon
            size={22}
            color="#ffffff"
          />
        </View>

        {/* Text */}
        <View
          style={
            styles.content
          }
        >
          <View
            style={
              styles.titleRow
            }
          >
            <Text
              style={[
                styles.title,

                {
                  color:
                    currentMode.accent,
                },
              ]}
            >
              {
                currentMode.title
              }
            </Text>

            <View
              style={[
                styles.liveBadge,

                {
                  backgroundColor:
                    currentMode.accent,
                },
              ]}
            >
              <Sparkles
                size={10}
                color="#fff"
              />

              <Text
                style={
                  styles.liveText
                }
              >
                LIVE
              </Text>
            </View>
          </View>

          <Text
            style={
              styles.subtitle
            }
          >
            {
              currentMode.subtitle
            }
          </Text>
        </View>
      </View>

      {/* SWITCH BUTTON */}
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={disabled}
        onPress={handleToggle}
        style={[
          styles.switchButton,

          disabled &&
            styles.disabled,
        ]}
      >
        <View
          style={
            styles.switchLeft
          }
        >
          <Text
            style={
              styles.switchLabel
            }
          >
            Switch Mode
          </Text>

          <Text
            style={[
              styles.switchTitle,

              {
                color:
                  nextMode.accent,
              },
            ]}
          >
            {
              nextMode.title
            }
          </Text>
        </View>

        <View
          style={
            styles.switchArrow
          }
        >
          <ChevronRight
            size={18}
            color="#94a3b8"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles =
  StyleSheet.create({
    container: {
      gap: 14,
    },

    currentCard: {
      position:
        'relative',

      overflow:
        'hidden',

      flexDirection:
        'row',

      alignItems:
        'center',

      borderRadius: 22,

      borderWidth: 1,

      padding: 18,
    },

    glow: {
      position:
        'absolute',

      top: -30,
      right: -30,

      width: 120,
      height: 120,

      borderRadius: 999,

      opacity: 0.12,
    },

    iconWrapper: {
      width: 54,
      height: 54,

      borderRadius: 18,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginRight: 16,
    },

    content: {
      flex: 1,
    },

    titleRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      marginBottom: 6,
    },

    title: {
      fontSize: 19,

      fontWeight: '700',

      marginRight: 10,
    },

    subtitle: {
      color: '#94a3b8',

      fontSize: 14,

      lineHeight: 20,
    },

    liveBadge: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 4,

      paddingHorizontal: 8,

      paddingVertical: 4,

      borderRadius: 999,
    },

    liveText: {
      color: '#ffffff',

      fontSize: 10,

      fontWeight: '700',
    },

    switchButton: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      backgroundColor:
        '#0f172a',

      borderRadius: 18,

      borderWidth: 1,

      borderColor:
        '#1e293b',

      paddingHorizontal: 18,

      paddingVertical: 16,
    },

    disabled: {
      opacity: 0.45,
    },

    switchLeft: {
      flex: 1,
    },

    switchLabel: {
      color: '#64748b',

      fontSize: 12,

      marginBottom: 4,

      textTransform:
        'uppercase',

      letterSpacing: 1,
    },

    switchTitle: {
      fontSize: 16,

      fontWeight: '700',
    },

    switchArrow: {
      width: 36,
      height: 36,

      borderRadius: 999,

      backgroundColor:
        '#111827',

      alignItems:
        'center',

      justifyContent:
        'center',
    },
  });