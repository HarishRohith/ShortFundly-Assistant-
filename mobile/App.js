import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  StatusBar,
  PanResponder,
} from 'react-native';
import { COLORS } from './src/config/colors';
import { useVoiceAssistant, ASSISTANT_STATE } from './src/hooks/useVoiceAssistant';
import { AccessibleHeader } from './src/components/AccessibleHeader';
import { CentralVoiceOrb } from './src/components/CentralVoiceOrb';
import { SpokenDisplay } from './src/components/SpokenDisplay';
import { ActionConfirmationModal } from './src/components/ActionConfirmationModal';
import { ReminderListModal } from './src/components/ReminderListModal';
import { QuickSettingsModal } from './src/components/QuickSettingsModal';
import { PermissionModal } from './src/components/PermissionModal';
import { SpeechService } from './src/services/speechService';
import { BatteryService } from './src/services/batteryService';
import { NotificationReaderService } from './src/services/notificationService';
import { InformationService } from './src/services/informationService';
import { HapticService } from './src/services/hapticService';
import { FallSafetyService } from './src/services/fallSafetyService';
import { PermissionService } from './src/services/permissionService';

export default function App() {
  const {
    state,
    lastQuery,
    lastResponse,
    pendingAction,
    preferences,
    batteryLevel,
    isWakeWordActive,
    toggleListening,
    startListening,
    stopListening,
    processUtterance,
    repeatLastMessage,
    stopSpeech,
    updatePreferences,
  } = useVoiceAssistant();

  // Modals visibility
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [remindersVisible, setRemindersVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);

  // Gesture tracking refs
  const lastTapRef = useRef(0);
  const holdTimerRef = useRef(null);
  const isHoldingRef = useRef(false);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  // On initial mount: proactively check permissions & prompt onboarding if needed
  useEffect(() => {
    async function initPermissions() {
      const { allGranted } = await PermissionService.checkAllPermissions();
      if (!allGranted) {
        setPermissionModalVisible(true);
        SpeechService.speak(
          'Welcome! I am Assi. Please grant permissions so I can listen to your voice and guide you hands-free.'
        );
      }
    }
    initPermissions();
  }, []);

  // Tactile Multi-Gesture PanResponder for Blind / Visually Impaired Users
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20;
        },
        onPanResponderGrant: (evt) => {
          const now = Date.now();
          touchStartRef.current = {
            x: evt.nativeEvent.pageX,
            y: evt.nativeEvent.pageY,
            time: now,
          };
          isHoldingRef.current = false;

          // If a fall safety alert is counting down, tapping the screen immediately cancels it
          if (FallSafetyService.isCountdownActive) {
            FallSafetyService.cancelFallAlert(preferences?.language || 'auto');
            return;
          }

          // If speech is playing, a single tap silences it immediately
          if (state === ASSISTANT_STATE.SPEAKING) {
            stopSpeech();
            HapticService.onStop();
            return;
          }

          // Long press timer (500ms): triggers Walkie-Talkie Mode
          holdTimerRef.current = setTimeout(() => {
            isHoldingRef.current = true;
            HapticService.onHoldToTalk();
            startListening();
          }, 500);
        },
        onPanResponderRelease: (evt, gestureState) => {
          if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
          }

          // If holding in Walkie-Talkie mode, releasing stops listening & evaluates speech
          if (isHoldingRef.current) {
            isHoldingRef.current = false;
            stopListening();
            return;
          }

          const now = Date.now();
          const timeSinceLastTap = now - lastTapRef.current;
          const isSwipe = Math.abs(gestureState.dx) > 40 || Math.abs(gestureState.dy) > 40;

          // Swipe Down: Immediately Silence speech
          if (gestureState.dy > 50 && Math.abs(gestureState.dx) < 50) {
            stopSpeech();
            HapticService.onStop();
            return;
          }

          // Swipe Up: Speak Battery & Network Status
          if (gestureState.dy < -50 && Math.abs(gestureState.dx) < 50) {
            handleBatteryPress();
            return;
          }

          // Double Tap (within 350ms): Repeats the last assistant response
          if (!isSwipe && timeSinceLastTap < 350) {
            HapticService.onDoubleTap();
            repeatLastMessage();
            lastTapRef.current = 0;
            return;
          }

          lastTapRef.current = now;
        },
      }),
    [state, preferences, startListening, stopListening, stopSpeech, repeatLastMessage]
  );

  // Quick Action Handlers
  const handleBatteryPress = async () => {
    const batt = await BatteryService.getSpokenBatteryStatus(preferences?.language || 'auto');
    await SpeechService.speak(batt.spokenText, { preferredLang: preferences?.language || 'auto' });
  };

  const handleHelpPress = async () => {
    const helpMsg =
      preferences?.language === 'ta'
        ? 'அஸ்ஸி உங்கள் குரல் உதவியாளர். பேச திரையை ஒருமுறை தொடவும். "ஹே அஸ்ஸி" என்றும் அழைக்கலாம்.'
        : 'Assi is your hands-free companion. Tap the center button or say "Hey Assi" anytime to command.';
    await SpeechService.speak(helpMsg, { preferredLang: preferences?.language || 'auto' });
  };

  const handleCheckMoney = async () => {
    await processUtterance('check money');
  };

  const handleWhichWay = async () => {
    await processUtterance('which direction am I facing');
  };

  const handleMorningBriefing = async () => {
    await processUtterance('morning briefing');
  };

  // Action Confirmation Handlers
  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    if (pendingAction.type === 'CALL') {
      await processUtterance('yes call');
    } else if (pendingAction.type === 'MESSAGE') {
      await processUtterance('yes send');
    }
  };

  const handleCancelAction = async () => {
    await processUtterance('cancel');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.canvas} />

      <View
        style={styles.container}
        {...panResponder.panHandlers}
        accessible={true}
        accessibilityLabel="Assi Voice Assistant Screen. Tap or say Hey Assi to command. Double tap to repeat."
        accessibilityLiveRegion="assertive"
      >
        {/* Accessible Top Bar */}
        <AccessibleHeader
          batteryLevel={batteryLevel}
          isCharging={false}
          onBatteryPress={handleBatteryPress}
          onSettingsPress={() => setSettingsVisible(true)}
          wakeWordEnabled={isWakeWordActive && (preferences?.wakeWordEnabled ?? true)}
        />

        {/* Central High-Contrast Tactile Voice Orb */}
        <CentralVoiceOrb
          state={state}
          onPress={toggleListening}
          onLongPress={handleHelpPress}
        />

        {/* Spoken Dialogue Display & Quick Sensory Shortcuts */}
        <SpokenDisplay
          lastQuery={lastQuery}
          lastResponse={lastResponse}
          onRepeat={repeatLastMessage}
          onStop={stopSpeech}
          isSpeaking={state === ASSISTANT_STATE.SPEAKING}
          onCheckMoney={handleCheckMoney}
          onWhichWay={handleWhichWay}
          onMorningBriefing={handleMorningBriefing}
        />

        {/* Action Confirmation Modal (for Call / SMS dispatch) */}
        <ActionConfirmationModal
          visible={state === ASSISTANT_STATE.AWAITING_CONFIRMATION}
          pendingAction={pendingAction}
          promptText={lastResponse}
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />

        {/* Reminders Modal */}
        <ReminderListModal
          visible={remindersVisible}
          onClose={() => setRemindersVisible(false)}
          onAddVoiceReminder={() => {
            SpeechService.speak('What should I remind you about, bro?');
            startListening();
          }}
        />

        {/* Bro Quick Settings Modal */}
        <QuickSettingsModal
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
          preferences={preferences}
          onUpdatePreferences={updatePreferences}
          onOpenReminders={() => setRemindersVisible(true)}
          onOpenPermissions={() => setPermissionModalVisible(true)}
        />

        {/* Upfront Permissions & Notification Access Onboarding */}
        <PermissionModal
          visible={permissionModalVisible}
          onClose={() => setPermissionModalVisible(false)}
          onPermissionsGranted={() => setPermissionModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
});
