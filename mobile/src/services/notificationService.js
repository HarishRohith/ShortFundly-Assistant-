import { Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_PREFERENCES } from '../config/constants';
import { SpeechService } from './speechService';
import { HapticService } from './hapticService';

class NotificationReaderManager {
  constructor() {
    this.allowedApps = new Set(DEFAULT_PREFERENCES.allowedNotificationApps);
    this.queuedNotifications = [];
  }

  async loadSettings() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.allowedApps = new Set(parsed);
        }
      }
    } catch (e) {}
  }

  async saveSettings() {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(Array.from(this.allowedApps))
      );
    } catch (e) {}
  }

  // Toggle allowing notifications for an app
  async toggleApp(appName, enable = null) {
    await this.loadSettings();
    const appKey = appName.toLowerCase();
    const currentState = this.isAppAllowed(appKey);
    const newState = enable !== null ? enable : !currentState;

    if (newState) {
      this.allowedApps.add(appKey);
    } else {
      this.allowedApps.delete(appKey);
    }

    await this.saveSettings();
    HapticService.onSuccess();

    return {
      appName,
      enabled: newState,
      reply: `Notifications for ${appName} are now ${newState ? 'enabled' : 'disabled'}.`,
    };
  }

  isAppAllowed(appName) {
    if (!appName) return true;
    const key = appName.toLowerCase();
    return (
      this.allowedApps.has(key) ||
      Array.from(this.allowedApps).some((allowed) => allowed.includes(key) || key.includes(allowed))
    );
  }

  // Voice handler for managing which apps have notifications read
  async handleVoiceManagement(query, language = 'en') {
    await this.loadSettings();
    const clean = query.toLowerCase();

    // Check list intent: "which apps", "list allowed apps", "notification apps"
    if (clean.includes('which app') || clean.includes('list notification') || clean.includes('allowed app') || clean.includes('apps allowed')) {
      const appsList = Array.from(this.allowedApps).join(', ');
      let reply = `Notifications are currently read for: ${appsList || 'no apps'}. You can say 'enable WhatsApp notifications' or 'disable YouTube notifications' anytime.`;
      if (language === 'ta') {
        reply = `தற்போது அறிவிப்புகள் படிக்கப்படும் செயலிகள்: ${appsList || 'எதுவுமில்லை'}.`;
      }
      await SpeechService.speak(reply, { preferredLang: language });
      return { success: true, reply };
    }

    // Check toggle intent
    const enableMatch = clean.match(/(?:enable|allow|turn on|start)\s+([a-zA-Z\s]+?)\s*notifications?/i);
    const disableMatch = clean.match(/(?:disable|block|turn off|stop)\s+([a-zA-Z\s]+?)\s*notifications?/i);

    if (enableMatch) {
      const targetApp = enableMatch[1].trim();
      const res = await this.toggleApp(targetApp, true);
      let reply = `Notifications for ${targetApp} are now enabled, bro.`;
      if (language === 'ta') reply = `${targetApp} செயலிக்கான அறிவிப்புகள் இயக்கப்பட்டது.`;
      await SpeechService.speak(reply, { preferredLang: language });
      return { success: true, reply };
    }

    if (disableMatch) {
      const targetApp = disableMatch[1].trim();
      const res = await this.toggleApp(targetApp, false);
      let reply = `Notifications for ${targetApp} are now disabled, bro.`;
      if (language === 'ta') reply = `${targetApp} செயலிக்கான அறிவிப்புகள் முடக்கப்பட்டது.`;
      await SpeechService.speak(reply, { preferredLang: language });
      return { success: true, reply };
    }

    return null;
  }

  // Open Android Notification Listener system settings
  async openAndroidNotificationSettings() {
    if (Platform.OS === 'android') {
      try {
        await IntentLauncher.startActivityAsync(
          'android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS'
        );
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  // -----------------------------------------------------------------
  // DISCREET PRIVACY MODE (For Public Places / Loudspeakers)
  // -----------------------------------------------------------------
  async toggleDiscreetMode(enable = null, language = 'en') {
    await this.loadSettings();
    this.discreetMode = enable !== null ? enable : !this.discreetMode;
    try {
      await AsyncStorage.setItem('@hey_bro_discreet_mode', JSON.stringify(this.discreetMode));
    } catch (e) {}

    HapticService.onSuccess();
    let reply = `Discreet notification mode is now ${this.discreetMode ? 'ON. Sensitive messages will not be read aloud in public.' : 'OFF.'}`;
    if (language === 'ta') {
      reply = `ரகசிய அறிவிப்பு முறை ${this.discreetMode ? 'இயக்கப்பட்டது. பொது இடங்களில் செய்திகள் சத்தமாக படிக்கப்படாது.' : 'முடக்கப்பட்டது.'}`;
    }
    await SpeechService.speak(reply, { preferredLang: language });
    return { success: true, discreetMode: this.discreetMode, reply };
  }

  async isDiscreetModeActive() {
    try {
      const raw = await AsyncStorage.getItem('@hey_bro_discreet_mode');
      return raw ? JSON.parse(raw) : false;
    } catch (e) {
      return false;
    }
  }

  // Read all unread notifications aloud (from WhatsApp, SMS, Phone)
  async readNotifications(language = 'en', forceReadPrivate = false) {
    await this.loadSettings();
    const isDiscreet = await this.isDiscreetModeActive();

    let allNotifs = [];

    // 1. Queued notifications
    if (this.queuedNotifications.length > 0) {
      allNotifs = this.queuedNotifications.filter((n) => !n.read);
    }

    // Filter allowed apps
    const unread = allNotifs.filter((n) => this.isAppAllowed(n.appName));

    if (unread.length === 0) {
      let emptyReply = 'You have no new unread notifications.';
      if (language === 'ta') emptyReply = 'புதிய அறிவிப்புகள் எதுவும் இல்லை.';
      else if (language === 'tanglish') emptyReply = 'Pudhu notifications edhum illa bro.';

      await SpeechService.speak(emptyReply, { preferredLang: language });
      return { success: true, count: 0, reply: emptyReply };
    }

    // If Discreet Mode is active and user didn't say "read private", announce safely without reading content
    if (isDiscreet && !forceReadPrivate) {
      HapticService.onConfirmationRequired();
      let discreetAlert = `You have ${unread.length} new private notification from ${unread[0].sender || 'a contact'}. Discreet mode is ON. Say "Read private message" when you are in private.`;
      if (language === 'ta') {
        discreetAlert = `உங்களுக்கு ${unread.length} புதிய ரகசிய செய்தி வந்துள்ளது. ரகசிய முறை இயக்கத்தில் உள்ளது. தனியாக இருக்கும் போது "ரகசிய செய்தியை படி" என்று சொல்லுங்கள்.`;
      }
      await SpeechService.speak(discreetAlert, { preferredLang: language });
      return { success: true, discreet: true, count: unread.length, reply: discreetAlert };
    }

    // Mark as read
    this.queuedNotifications.forEach((n) => (n.read = true));

    HapticService.onProcessing();

    let fullSpokenText = `You have ${unread.length} new ${unread.length === 1 ? 'notification' : 'notifications'}: `;
    if (language === 'ta') {
      fullSpokenText = `உங்களுக்கு ${unread.length} புதிய அறிவிப்புகள் வந்துள்ளன: `;
    } else if (language === 'tanglish') {
      fullSpokenText = `Ungalukku ${unread.length} pudhu notifications vandhirukku bro: `;
    }

    unread.forEach((n, idx) => {
      const app = n.appName || 'Message';
      const sender = n.sender || 'Someone';
      const message = n.text || '';

      if (language === 'ta') {
        fullSpokenText += `${idx + 1}. ${app} செயலியில் ${sender} அனுப்பிய செய்தி: "${message}". `;
      } else if (language === 'tanglish') {
        fullSpokenText += `${idx + 1}. ${app} la ${sender} anuppirukaanga: "${message}". `;
      } else {
        fullSpokenText += `${idx + 1}. From ${app}, ${sender} says: "${message}". `;
      }
    });

    await SpeechService.speak(fullSpokenText, { preferredLang: language });
    HapticService.onSuccess();

    return {
      success: true,
      count: unread.length,
      reply: fullSpokenText,
      notifications: unread,
    };
  }

  // Push local notification
  pushNotification(notif) {
    this.queuedNotifications.unshift({
      id: Date.now().toString(),
      appName: notif.appName || 'System',
      sender: notif.sender || 'Unknown',
      text: notif.text || '',
      timestamp: new Date().toISOString(),
      read: false,
    });
  }
}

export const NotificationReaderService = new NotificationReaderManager();
