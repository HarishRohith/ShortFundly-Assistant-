import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, Switch } from 'react-native';
import { Settings, X, Volume2, Globe, Sparkles, Battery, ExternalLink, ShieldCheck } from 'lucide-react-native';
import { COLORS } from '../config/colors';
import { SpeechService } from '../services/speechService';
import { PermissionService } from '../services/permissionService';

export function QuickSettingsModal({
  visible,
  onClose,
  preferences = {},
  onUpdatePreferences,
}) {
  const currentLang = preferences?.language || 'auto';
  const currentRate = preferences?.speechRate || 1.0;
  const currentPitch = preferences?.speechPitch || 1.0;

  const handleTestSpeech = async () => {
    let testMsg = "Hello! I am Assi, your hands-free companion. How can I help you today?";
    if (currentLang === 'ta') {
      testMsg = 'வணக்கம்! நான் அஸ்ஸி. உங்களுக்கு உதவ எப்போதும் தயாராக இருக்கிறேன்.';
    } else if (currentLang === 'tanglish') {
      testMsg = 'Vanakkam! Naan Assi, ungalukku help panna ready.';
    }
    await SpeechService.speak(testMsg, {
      preferredLang: currentLang,
      rate: currentRate,
      pitch: currentPitch,
    });
  };

  const handleOpenBatterySettings = async () => {
    await PermissionService.openBatteryOptimizationSettings();
  };

  const handleOpenOverlaySettings = async () => {
    await PermissionService.openOverlaySettings();
  };

  const handleOpenAppSettings = async () => {
    await PermissionService.openAppSettings();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Settings size={20} color={COLORS.brandPrimary} />
              </View>
              <Text style={styles.title}>VOICE SETTINGS</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close voice settings"
              style={styles.closeButton}
            >
              <X size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* 1. Voice Language */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Globe size={17} color={COLORS.brandPrimary} />
                <Text style={styles.sectionTitle}>ASSISTANT LANGUAGE</Text>
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

            {/* 2. Speech Speed (Rate) */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Volume2 size={17} color={COLORS.brandPrimary} />
                <Text style={styles.sectionTitle}>SPEECH SPEED (RATE)</Text>
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
            </View>

            {/* 3. Voice Pitch (Tone) */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Sparkles size={17} color={COLORS.brandPrimary} />
                <Text style={styles.sectionTitle}>VOICE PITCH (TONE)</Text>
              </View>
              <View style={styles.optionRow}>
                {[
                  { pitch: 0.85, label: 'DEEP' },
                  { pitch: 1.0, label: 'NATURAL' },
                  { pitch: 1.2, label: 'BRIGHT' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.pitch.toString()}
                    onPress={() => onUpdatePreferences({ speechPitch: item.pitch })}
                    accessible={true}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: currentPitch === item.pitch }}
                    accessibilityLabel={`Voice pitch ${item.label}`}
                    style={[
                      styles.choiceButton,
                      currentPitch === item.pitch && styles.choiceButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        currentPitch === item.pitch && styles.choiceTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleTestSpeech}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Test current voice settings"
                style={styles.testVoiceButton}
              >
                <Volume2 size={16} color={COLORS.brandPrimary} />
                <Text style={styles.testVoiceText}>TEST ASSI VOICE</Text>
              </TouchableOpacity>
            </View>

            {/* 4. Hey Assi Wake Word Toggle */}
            <View style={styles.sectionCard}>
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>"Hey Assi" Wake Word</Text>
                  <Text style={styles.toggleSub}>Always listen for wake word hands-free</Text>
                </View>
                <Switch
                  value={preferences?.wakeWordEnabled ?? true}
                  onValueChange={(val) => onUpdatePreferences({ wakeWordEnabled: val })}
                  trackColor={{ false: '#CBD5E1', true: COLORS.brandPrimary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* 5. Essential Background Access (For Home Screen & Other Apps) */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <ShieldCheck size={17} color={COLORS.brandPrimary} />
                <Text style={styles.sectionTitle}>BACKGROUND EXECUTION ACCESS</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Required for Assi to listen and trigger when you are on the Home screen or inside other apps.
              </Text>
              <View style={styles.buttonStack}>
                <TouchableOpacity
                  onPress={handleOpenBatterySettings}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Open battery optimization settings"
                  style={styles.permButton}
                >
                  <Battery size={17} color={COLORS.brandPrimary} />
                  <Text style={styles.permButtonText}>UNRESTRICTED BATTERY</Text>
                  <ExternalLink size={15} color={COLORS.brandPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleOpenOverlaySettings}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Open display over other apps settings"
                  style={styles.permButton}
                >
                  <Sparkles size={17} color={COLORS.brandPrimary} />
                  <Text style={styles.permButtonText}>DISPLAY OVER OTHER APPS</Text>
                  <ExternalLink size={15} color={COLORS.brandPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleOpenAppSettings}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Open Android app permissions"
                  style={styles.permButton}
                >
                  <ShieldCheck size={17} color={COLORS.brandPrimary} />
                  <Text style={styles.permButtonText}>APP PERMISSIONS</Text>
                  <ExternalLink size={15} color={COLORS.brandPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    maxHeight: '88%',
    padding: 24,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
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
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.brandPrimaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1.2,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 28,
  },
  sectionCard: {
    backgroundColor: COLORS.canvas,
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
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.brandPrimary,
    letterSpacing: 1,
  },
  sectionDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 12,
    lineHeight: 18,
  },
  buttonStack: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  choiceButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceButtonActive: {
    borderColor: COLORS.brandPrimary,
    backgroundColor: COLORS.brandPrimary,
  },
  choiceText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  choiceTextActive: {
    color: '#FFFFFF',
  },
  testVoiceButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.brandPrimary,
    backgroundColor: COLORS.brandPrimaryLight,
  },
  testVoiceText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.brandPrimary,
    letterSpacing: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  toggleSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  permButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
  },
  permButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
});
