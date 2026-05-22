import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';

import Slider from '@react-native-community/slider';

import {
  Menu,
  Flame,
  X,
} from 'lucide-react-native';

import {
  Message,
  ChatMode,
} from '../types/chat';

import { ExportButton } from './ExportButton';

interface HeaderProps {
  onToggleSidebar?: () => void;

  onRoastLevelChange?: (
    level: number
  ) => void;

  messages?: Message[];

  mode?: ChatMode;

  roastLevel?: number;
}

export const Header: React.FC<
  HeaderProps
> = ({
  onToggleSidebar,
  onRoastLevelChange,
  messages = [],
  mode = 'convince-ai',
  roastLevel = 5,
}) => {
  const [showModal, setShowModal] =
    useState(false);

  const [tempLevel, setTempLevel] =
    useState(roastLevel);

  const openModal = () => {
    setTempLevel(roastLevel);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const applyLevel = () => {
    onRoastLevelChange?.(tempLevel);

    setShowModal(false);
  };

  const getLevelLabel = (
    level: number
  ) => {
    if (level <= 3) return 'Light';

    if (level <= 6) return 'Balanced';

    if (level <= 8) return 'Aggressive';

    return 'Unhinged';
  };

  return (
    <>
      <View style={styles.container}>
        {/* Left */}
        <View style={styles.left}>
          {onToggleSidebar && (
            <TouchableOpacity
              onPress={
                onToggleSidebar
              }
              style={
                styles.iconButton
              }
            >
              <Menu
                size={20}
                color="#e2e8f0"
              />
            </TouchableOpacity>
          )}

          <View style={styles.titleArea}>
            <Text style={styles.title}>
              ProvIt
            </Text>

            <Text
              style={styles.subtitle}
            >
              {mode ===
              'convince-ai'
                ? 'Convince AI'
                : 'Prove Human'}
            </Text>
          </View>
        </View>

        {/* Right */}
        <View style={styles.right}>
          {onRoastLevelChange && (
            <TouchableOpacity
              onPress={openModal}
              style={
                styles.levelButton
              }
            >
              <Flame
                size={16}
                color="#60a5fa"
              />

              <Text
                style={
                  styles.levelText
                }
              >
                {roastLevel}
              </Text>
            </TouchableOpacity>
          )}

          <ExportButton
            messages={messages}
            mode={mode}
            roastLevel={roastLevel}
          />
        </View>
      </View>

      {/* Roast Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.modal}
          >
            {/* Header */}
            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Response Style
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Control how intense
                  the AI responses
                  feel.
                </Text>
              </View>

              <TouchableOpacity
                onPress={closeModal}
                style={
                  styles.closeButton
                }
              >
                <X
                  size={18}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>

            {/* Level */}
            <View
              style={
                styles.levelDisplay
              }
            >
              <Text
                style={
                  styles.levelNumber
                }
              >
                {tempLevel}
              </Text>

              <Text
                style={
                  styles.levelLabel
                }
              >
                {getLevelLabel(
                  tempLevel
                )}
              </Text>
            </View>

            {/* Slider */}
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={tempLevel}
              onValueChange={
                setTempLevel
              }
              minimumTrackTintColor="#3b82f6"
              maximumTrackTintColor="#1e293b"
              thumbTintColor="#3b82f6"
            />

            {/* Footer */}
            <View
              style={
                styles.modalFooter
              }
            >
              <TouchableOpacity
                onPress={closeModal}
                style={
                  styles.cancelButton
                }
              >
                <Text
                  style={
                    styles.cancelText
                  }
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={applyLevel}
                style={
                  styles.applyButton
                }
              >
                <Text
                  style={
                    styles.applyText
                  }
                >
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 72,
    backgroundColor: '#020617',
    borderBottomWidth: 1,
    borderBottomColor: '#111827',

    paddingHorizontal: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 999,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#0f172a',
  },

  titleArea: {
    justifyContent: 'center',
    marginLeft: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },

  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },

  levelButton: {
    height: 36,

    paddingHorizontal: 12,

    borderRadius: 999,

    backgroundColor: '#0f172a',

    borderWidth: 1,
    borderColor: '#1e293b',

    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  levelText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.6)',

    justifyContent: 'center',
    alignItems: 'center',

    padding: 20,
  },

  modal: {
    width: '100%',

    backgroundColor: '#020617',

    borderRadius: 24,

    borderWidth: 1,
    borderColor: '#1e293b',

    padding: 22,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    marginBottom: 24,
  },

  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },

  modalSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },

  closeButton: {
    width: 34,
    height: 34,

    borderRadius: 999,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#0f172a',
  },

  levelDisplay: {
    alignItems: 'center',
    marginBottom: 26,
  },

  levelNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff',
  },

  levelLabel: {
    fontSize: 15,
    color: '#60a5fa',
    marginTop: 4,
    fontWeight: '600',
  },

  slider: {
    width: '100%',
    height: 40,
  },

  modalFooter: {
    flexDirection: 'row',
    marginTop: 28,
    gap: 12,
  },

  cancelButton: {
    flex: 1,

    height: 48,

    borderRadius: 14,

    backgroundColor: '#111827',

    alignItems: 'center',
    justifyContent: 'center',
  },

  applyButton: {
    flex: 1,

    height: 48,

    borderRadius: 14,

    backgroundColor: '#2563eb',

    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '600',
  },

  applyText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});