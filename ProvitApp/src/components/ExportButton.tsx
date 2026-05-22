import React, { useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';

import {
  Download,
  FileText,
  Share2,
  Braces,
  X,
} from 'lucide-react-native';

import {
  Message,
  ChatMode,
} from '../types/chat';

import {
  exportChatConversation,
} from '../services/exportService';

interface ExportButtonProps {
  messages: Message[];
  mode: ChatMode;
  roastLevel: number;
  disabled?: boolean;
}

export const ExportButton: React.FC<
  ExportButtonProps
> = ({
  messages,
  mode,
  roastLevel,
  disabled = false,
}) => {
  const [open, setOpen] =
    useState(false);

  const handleExport = () => {
    if (messages.length === 0) {
      Alert.alert(
        'No messages',
        'Start a conversation before exporting.'
      );

      return;
    }

    setOpen(true);
  };

  const exportFormat = async (
    format: 'json' | 'txt' | 'share'
  ) => {
    setOpen(false);

    try {
      await exportChatConversation(
        messages,
        format,
        mode,
        roastLevel
      );
    } catch {
      Alert.alert(
        'Export failed',
        'Something went wrong while exporting.'
      );
    }
  };

  if (
    disabled ||
    messages.length === 0
  ) {
    return null;
  }

  return (
    <>
      {/* Trigger */}
      <TouchableOpacity
        onPress={handleExport}
        activeOpacity={0.85}
        style={styles.trigger}
      >
        <Download
          size={18}
          color="#e2e8f0"
        />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setOpen(false)
        }
      >
        <View
          style={styles.overlay}
        >
          <View
            style={styles.modal}
          >
            {/* Header */}
            <View
              style={styles.header}
            >
              <View>
                <Text
                  style={styles.title}
                >
                  Export Conversation
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  Save or share this
                  session in your
                  preferred format.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setOpen(false)
                }
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

            {/* Options */}
            <View
              style={styles.options}
            >
              <ExportOption
                icon={
                  <Share2
                    size={20}
                    color="#60a5fa"
                  />
                }
                title="Share Text"
                description="Quick share as plain text"
                onPress={() =>
                  exportFormat(
                    'share'
                  )
                }
              />

              <ExportOption
                icon={
                  <FileText
                    size={20}
                    color="#60a5fa"
                  />
                }
                title="Export TXT"
                description="Readable conversation format"
                onPress={() =>
                  exportFormat(
                    'txt'
                  )
                }
              />

              <ExportOption
                icon={
                  <Braces
                    size={20}
                    color="#60a5fa"
                  />
                }
                title="Export JSON"
                description="Structured conversation data"
                onPress={() =>
                  exportFormat(
                    'json'
                  )
                }
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

interface ExportOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}

const ExportOption: React.FC<
  ExportOptionProps
> = ({
  icon,
  title,
  description,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.option}
    >
      <View
        style={styles.optionIcon}
      >
        {icon}
      </View>

      <View
        style={
          styles.optionContent
        }
      >
        <Text
          style={
            styles.optionTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.optionDescription
          }
        >
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  trigger: {
    width: 38,
    height: 38,

    borderRadius: 999,

    backgroundColor: '#0f172a',

    borderWidth: 1,
    borderColor: '#1e293b',

    alignItems: 'center',
    justifyContent: 'center',
  },

  overlay: {
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    marginBottom: 22,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },

  subtitle: {
    fontSize: 14,
    color: '#94a3b8',

    marginTop: 4,

    lineHeight: 20,
  },

  closeButton: {
    width: 34,
    height: 34,

    borderRadius: 999,

    backgroundColor: '#0f172a',

    alignItems: 'center',
    justifyContent: 'center',
  },

  options: {
    gap: 12,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#0f172a',

    borderRadius: 18,

    borderWidth: 1,
    borderColor: '#1e293b',

    padding: 16,
  },

  optionIcon: {
    width: 42,
    height: 42,

    borderRadius: 14,

    backgroundColor: '#111827',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },

  optionDescription: {
    fontSize: 13,
    color: '#94a3b8',

    marginTop: 4,
  },
});