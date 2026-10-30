import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, Switch, TextInput } from 'react-native';
import { Settings, X, Volume2, Globe, Bell, Battery, Shield, Calendar, Sparkles, ExternalLink } from 'lucide-react-native';
import { COLORS } from '../config/colors';
import { SpeechService } from '../services/speechService';
import { PermissionService } from '../services/permissionService';
import { AIService } from '../services/aiService';
import { CallMessageService } from '../services/callMessageService';

export function QuickSettingsModal({
  visible,
  onClose,
  preferences = {},
  onUpdatePreferences,
  onOpenReminders,
  onOpenPermissions,
}) {
  const currentLang = preferences?.language || 'auto';
  const currentRate = preferences?.speechRate || 1.0;
  const [apiKeyInput, setApiKeyInput] = useState(preferences?.geminiApiKey || '');
  const [guardianPhoneInput, setGuardianPhoneInput] = useState(preferences?.guardianPhone || '');

  const handleSaveApiKey = () => {
    AIService.setApiKey(apiKeyInput);
    onUpdatePreferences({ geminiApiKey: apiKeyInput });
    SpeechService.speak('Gemini 2.5 Flash model settings updated.');
  };

  const handleSaveGuardianPhone = async () => {
    if (guardianPhoneInput.trim()) {
      await CallMessageService.saveContact('guardian', guardianPhoneInput.trim());
      await CallMessageService.saveContact('emergency', guardianPhoneInput.trim());
      onUpdatePreferences({ guardianPhone: guardianPhoneInput.trim() });
      SpeechService.speak('Guardian emergency contact saved successfully.');
    }
  };

  const handleTestSpeech = async () => {
    let testMsg = "Hello! Assi voice assistant is online and working properly.";
    if (currentLang === 'ta') {
      testMsg = 'வணக்கம்! அஸ்ஸி குரல் உதவியாளர் சிறப்பாக இயங்குகிறது.';
    } else if (currentLang === 'tanglish') {
      testMsg = 'Vanakkam! Assi voice assistant nalla work aagudhu.';
    }
    await SpeechService.speak(testMsg, {
      preferredLang: currentLang,
      rate: currentRate,
    });
  };

  const handleOpenNotificationSettings = async () => {
    await PermissionService.openNotificationListenerSettings();
  };

  const handleOpenAppSettings = async () => {
    await PermissionService.openAppSettings();
  };

  const handleOpenBatterySettings = async () => {
    await PermissionService.openBatteryOptimizationSettings();
  };

  const handleOpenOverlaySettings = async () => {
    await PermissionService.openOverlaySettings();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Settings size={24} color={COLORS.brandRed} />
              <Text style={styles.title}>BRO SETTINGS</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close settings"
              style={styles.closeButton}
            >
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* 1. Android Permissions & Notification Access */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Shield size={18} color={COLORS.brandRed} />
                <Text style={styles.sectionTitle}>SYSTEM PERMISSIONS & ACCESS</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Enable Device & App Notifications so Assi can speak incoming WhatsApp messages, SMS, and calls aloud.
              </Text>
              <View style={styles.buttonStack}>
                <TouchableOpacity
                  onPress={handleOpenNotificationSettings}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Open Android notification access settings"
                  style={styles.permButton}
                >
                  <Bell size={18} color="#FFFFFF" />
                  <Text style={styles.permButtonText}>NOTIFICATION ACCESS SETTINGS</Text>
                  <ExternalLink size={16} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleOpenAppSettings}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Open Android app permissions settings"
                  style={styles.permButtonSecondary}
                >
                  <Shield size={18} color={COLORS.brandRed} />
                  <Text style={styles.permButtonSecondaryText}>ALL APP PERMISSIONS</Text>
                  <ExternalLink size={16} color={COLORS.brandRed} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleOpenBatterySettings}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Unrestricted background battery settings"
                  style={styles.permButtonSecondary}
                >
                  <Battery size={18} color="#10B981" />
                  <Text style={[styles.permButtonSecondaryText, { color: '#10B981' }]}>UNRESTRICTED BATTERY (BACKGROUND)</Text>
                  <ExternalLink size={16} color="#10B981" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleOpenOverlaySettings}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Display over other apps settings"
                  style={styles.permButtonSecondary}
                >
                  <Sparkles size={18} color="#38BDF8" />
                  <Text style={[styles.permButtonSecondaryText, { color: '#38BDF8' }]}>DISPLAY OVER OTHER APPS (POPUP)</Text>
                  <ExternalLink size={16} color="#38BDF8" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. Preferred Language Selection */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Globe size={18} color={COLORS.brandRed} />
                <Text style={styles.sectionTitle}>VOICE LANGUAGE</Text>
              </View>
              <View style={styles.optionRow}>
                {[
                  { id: 'auto', label: 'AUTO' },
                  { id: 'en', label: 'ENGLISH' },
                  { id: 'ta', label: 'தமிழ்' },
                  { id: 'tanglish', label: 'TANGLISH' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => onUpdatePreferences({ language: item.id })}
                    accessible={true}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: currentLang === item.id }}
                    accessibilityLabel={`Language ${item.label}`}
                    style={[
                      styles.choiceButton,
                      currentLang === item.id && styles.choiceButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        currentLang === item.id && styles.choiceTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 3. Speech Rate (TTS) */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Volume2 size={18} color={COLORS.brandRed} />
                <Text style={styles.sectionTitle}>SPEECH SPEED (TTS)</Text>
              </View>
              <View style={styles.optionRow}>
                {[
                  { rate: 0.85, label: '0.85x' },
                  { rate: 1.0, label: '1.0x' },
                  { rate: 1.25, label: '1.25x' },
                  { rate: 1.5, label: '1.5x' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.rate.toString()}
                    onPress={() => onUpdatePreferences({ speechRate: item.rate })}
                    accessible={true}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: currentRate === item.rate }}
                    accessibilityLabel={`Speech speed ${item.label}`}
                    style={[
                      styles.choiceButton,
                      currentRate === item.rate && styles.choiceButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        currentRate === item.rate && styles.choiceTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleTestSpeech}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Test current voice speed"
                style={styles.testVoiceButton}
              >
                <Text style={styles.testVoiceText}>TEST VOICE</Text>
              </TouchableOpacity>
            </View>

            {/* 4. Automated Wake Word & Battery Alerts */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Battery size={18} color={COLORS.brandRed} />
                <Text style={styles.sectionTitle}>AUTOMATED VOICE ALERTS</Text>
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>"Hey Assi" Wake Word</Text>
                <Switch
                  value={preferences?.wakeWordEnabled ?? true}
                  onValueChange={(val) => onUpdatePreferences({ wakeWordEnabled: val })}
                  trackColor={{ false: '#262933', true: COLORS.brandRed }}
                  thumbColor={COLORS.textPrimary}
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Low-Battery Voice Warning</Text>
                <Switch
                  value={preferences?.batteryAlertsEnabled ?? true}
                  onValueChange={(val) => onUpdatePreferences({ batteryAlertsEnabled: val })}
                  trackColor={{ false: '#262933', true: COLORS.brandRed }}
                  thumbColor={COLORS.textPrimary}
                />
              </View>
            </View>

            {/* 5. Gemini 2.5 Flash AI API */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Sparkles size={18} color={COLORS.brandRed} />
                <Text style={styles.sectionTitle}>GEMINI 2.5 FLASH AI</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Connect Google Gemini 2.5 Flash for ultra-fast, conversational AI responses.
              </Text>
              <TextInput
                value={apiKeyInput}
                onChangeText={setApiKeyInput}
                placeholder="Paste Gemini API Key (AIzaSy...)"
                placeholderTextColor="#64748B"
                style={styles.keyInput}
                secureTextEntry
                accessible={true}
                accessibilityLabel="Gemini API Key input"
              />
              <TouchableOpacity
                onPress={handleSaveApiKey}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Save Gemini API Key"
                style={styles.saveKeyButton}
              >
                <Text style={styles.saveKeyButtonText}>SAVE AI MODEL KEY</Text>
              </TouchableOpacity>
            </View>

            {/* 6. Guardian Emergency Phone */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Shield size={18} color={COLORS.brandRed} />
                <Text style={styles.sectionTitle}>GUARDIAN EMERGENCY PHONE</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Number dialed automatically when you say "call guardian" or if a fall is detected.
              </Text>
              <TextInput
                value={guardianPhoneInput}
                onChangeText={setGuardianPhoneInput}
                placeholder="Guardian Phone (+91 9876543210)"
                placeholderTextColor="#64748B"
                style={styles.keyInput}
                keyboardType="phone-pad"
                accessible={true}
                accessibilityLabel="Guardian phone number input"
              />
              <TouchableOpacity
                onPress={handleSaveGuardianPhone}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Save guardian contact"
                style={styles.saveKeyButton}
              >
                <Text style={styles.saveKeyButtonText}>SAVE GUARDIAN NUMBER</Text>
              </TouchableOpacity>
            </View>

            {/* 7. Reminders Manager Link */}
            {onOpenReminders && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Calendar size={18} color={COLORS.brandRed} />
                  <Text style={styles.sectionTitle}>SAVED REMINDERS</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    onOpenReminders();
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="View and manage saved reminders"
                  style={styles.permButtonSecondary}
                >
                  <Text style={styles.permButtonSecondaryText}>VIEW ALL REMINDERS</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.surfaceBorder,
    maxHeight: '88%',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1.5,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 28,
  },
  sectionCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.brandRed,
    letterSpacing: 1.2,
  },
  sectionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  buttonStack: {
    gap: 10,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  choiceButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceButtonActive: {
    borderColor: COLORS.brandRed,
    backgroundColor: COLORS.brandRedDark,
  },
  choiceText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  choiceTextActive: {
    color: COLORS.brandRed,
  },
  testVoiceButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.brandRed,
    backgroundColor: COLORS.brandRedDark,
  },
  testVoiceText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.brandRed,
    letterSpacing: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E222D',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  permButton: {
    backgroundColor: COLORS.brandRed,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
  },
  permButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  permButtonSecondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.brandRed,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
  },
  permButtonSecondaryText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.brandRed,
    letterSpacing: 0.8,
  },
  keyInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    color: COLORS.textPrimary,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 13,
    marginBottom: 10,
  },
  saveKeyButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.brandRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveKeyButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
