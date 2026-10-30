import AsyncStorage from '@react-native-async-storage/async-storage';
import { CryptoVault } from './secureVault';
import { SpeechService } from './speechService';
import { HapticService } from './hapticService';

const AUTH_CONFIG_KEY = '@bro_voice_auth_config_v1';

class VoiceSecurityManager {
  constructor() {
    this.isListeningActive = true;
    this.isAuthenticated = false;
    this.authTimeoutTimer = null;
    this.pendingSecureAction = null;
  }

  // 1. Listening State (Mute / Unmute / Disable Listening)
  isListeningEnabled() {
    return this.isListeningActive;
  }

  setListeningEnabled(enabled, language = 'en') {
    this.isListeningActive = enabled;
    const isTa = language === 'ta';
    let reply = enabled
      ? (isTa ? 'குரல் கேட்பது இயக்கப்பட்டது. பேசலாம்.' : 'Microphone unmuted. I am listening.')
      : (isTa ? 'குரல் கேட்பது நிறுத்தப்பட்டது. மீண்டும் இயக்க திரையை தட்டவும்.' : 'Listening disabled. Microphone muted for your privacy.');

    HapticService.onToggle();
    return { success: true, enabled, reply };
  }

  // 2. Voice Authentication (Voice Passphrase / PIN)
  async getAuthConfig() {
    try {
      const raw = await AsyncStorage.getItem(AUTH_CONFIG_KEY);
      if (!raw) {
        return { enabled: false, passphrase: 'assi 1 2 3 4', voicePrintPattern: 'default' };
      }
      const decrypted = CryptoVault.decrypt(raw, 'voice_auth');
      return decrypted ? JSON.parse(decrypted) : { enabled: false, passphrase: 'assi 1 2 3 4' };
    } catch (e) {
      return { enabled: false, passphrase: 'assi 1 2 3 4' };
    }
  }

  async setVoicePassphrase(passphrase) {
    try {
      const clean = passphrase.toLowerCase().trim();
      const config = { enabled: true, passphrase: clean };
      const encrypted = CryptoVault.encrypt(JSON.stringify(config), 'voice_auth');
      await AsyncStorage.setItem(AUTH_CONFIG_KEY, encrypted);
      return { success: true, passphrase: clean };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async toggleVoiceAuth(enable) {
    const config = await this.getAuthConfig();
    config.enabled = enable;
    const encrypted = CryptoVault.encrypt(JSON.stringify(config), 'voice_auth');
    await AsyncStorage.setItem(AUTH_CONFIG_KEY, encrypted);
    return config;
  }

  /**
   * Verify a spoken phrase against the stored passphrase
   */
  async verifyVoicePassphrase(spokenInput, language = 'en') {
    const config = await this.getAuthConfig();
    if (!config.enabled) {
      // If voice auth is disabled, allow action by default
      return { verified: true, message: 'Authentication bypassed (disabled)' };
    }

    const cleanInput = (spokenInput || '').toLowerCase().replace(/[^\w\s]/gi, '').trim();
    const cleanPass = (config.passphrase || '').toLowerCase().replace(/[^\w\s]/gi, '').trim();

    const isMatch = cleanInput.includes(cleanPass) || cleanPass.includes(cleanInput);

    if (isMatch) {
      this.isAuthenticated = true;
      HapticService.onSuccess();

      // Clear authentication after 3 minutes of inactivity
      if (this.authTimeoutTimer) clearTimeout(this.authTimeoutTimer);
      this.authTimeoutTimer = setTimeout(() => {
        this.isAuthenticated = false;
      }, 3 * 60 * 1000);

      const reply = language === 'ta'
        ? 'குரல் சரிபார்ப்பு வெற்றிகரமாக முடிந்தது.'
        : 'Voice authenticated successfully. Access granted.';
      return { verified: true, reply };
    } else {
      HapticService.onError();
      const reply = language === 'ta'
        ? 'குரல் கடவுச்சொல் பொருந்தவில்லை. மீண்டும் சொல்லவும்.'
        : 'Voice authentication failed. Passphrase does not match.';
      return { verified: false, reply };
    }
  }

  isCurrentlyAuthenticated() {
    return this.isAuthenticated;
  }

  resetAuthentication() {
    this.isAuthenticated = false;
    if (this.authTimeoutTimer) {
      clearTimeout(this.authTimeoutTimer);
      this.authTimeoutTimer = null;
    }
  }
}

export const VoiceSecurityService = new VoiceSecurityManager();
