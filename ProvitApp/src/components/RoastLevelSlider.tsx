import React from 'react';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import Slider from '@react-native-community/slider';

interface RoastLevelSliderProps {
  value: number;
  onChange: (
    value: number
  ) => void;
}

export const RoastLevelSlider: React.FC<
  RoastLevelSliderProps
> = ({
  value,
  onChange,
}) => {
  const getLevelData = (
    level: number
  ) => {
    if (level <= 3) {
      return {
        label: 'Friendly',
        description:
          'More casual and relaxed responses.',

        color: '#22c55e',
      };
    }

    if (level <= 6) {
      return {
        label: 'Balanced',
        description:
          'A mix of logic, challenge and personality.',

        color: '#f59e0b',
      };
    }

    if (level <= 8) {
      return {
        label: 'Aggressive',
        description:
          'Sharper arguments and tougher pushback.',

        color: '#f97316',
      };
    }

    return {
      label: 'Savage',
      description:
        'No mercy. Brutal responses enabled.',

      color: '#ef4444',
    };
  };

  const levelData =
    getLevelData(value);

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            AI Intensity
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Control how intense
            the AI behaves during
            conversations.
          </Text>
        </View>

        <View
          style={[
            styles.levelBadge,
            {
              backgroundColor:
                levelData.color,
            },
          ]}
        >
          <Text
            style={
              styles.levelBadgeText
            }
          >
            {value}
          </Text>
        </View>
      </View>

      {/* SLIDER */}
      <Slider
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={
          levelData.color
        }
        maximumTrackTintColor="#1e293b"
        thumbTintColor={
          levelData.color
        }
      />

      {/* LABELS */}
      <View style={styles.labels}>
        <Text
          style={
            styles.labelText
          }
        >
          Friendly
        </Text>

        <Text
          style={
            styles.labelText
          }
        >
          Balanced
        </Text>

        <Text
          style={
            styles.labelText
          }
        >
          Savage
        </Text>
      </View>

      {/* CURRENT MODE */}
      <View
        style={[
          styles.currentMode,
          {
            borderColor:
              levelData.color,
          },
        ]}
      >
        <Text
          style={[
            styles.currentTitle,
            {
              color:
                levelData.color,
            },
          ]}
        >
          {levelData.label}
        </Text>

        <Text
          style={
            styles.currentDescription
          }
        >
          {
            levelData.description
          }
        </Text>
      </View>
    </View>
  );
};

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        '#0f172a',

      borderRadius: 24,

      borderWidth: 1,

      borderColor:
        '#1e293b',

      padding: 22,
    },

    header: {
      flexDirection: 'row',

      justifyContent:
        'space-between',

      alignItems:
        'flex-start',

      marginBottom: 26,
    },

    title: {
      color: '#ffffff',

      fontSize: 20,

      fontWeight: '700',

      marginBottom: 6,
    },

    subtitle: {
      color: '#94a3b8',

      fontSize: 14,

      lineHeight: 22,

      maxWidth: 240,
    },

    levelBadge: {
      width: 42,
      height: 42,

      borderRadius: 999,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    levelBadgeText: {
      color: '#ffffff',

      fontSize: 16,

      fontWeight: '800',
    },

    labels: {
      flexDirection: 'row',

      justifyContent:
        'space-between',

      marginTop: 8,

      marginBottom: 24,
    },

    labelText: {
      color: '#64748b',

      fontSize: 12,
    },

    currentMode: {
      borderWidth: 1,

      borderRadius: 18,

      padding: 16,

      backgroundColor:
        'rgba(255,255,255,0.02)',
    },

    currentTitle: {
      fontSize: 18,

      fontWeight: '700',

      marginBottom: 6,
    },

    currentDescription: {
      color: '#94a3b8',

      fontSize: 14,

      lineHeight: 22,
    },
  });