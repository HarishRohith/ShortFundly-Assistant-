import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { BatteryCharging, Battery, Settings, Radio } from 'lucide-react-native';
import { COLORS } from '../config/colors';

export function AccessibleHeader({
  batteryLevel,
  isCharging,
  onBatteryPress,
  onSettingsPress,
  wakeWordEnabled = true,
}) {
  const isBatteryLow = batteryLevel <= 20;

  return (
    <View style={styles.header}>
      {/* Brand Identity: "BRO" Glyph + Status */}
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoGlyph}>B</Text>
        </View>
        <View style={styles.titleColumn}>
          <Text
            style={styles.appName}
            accessible={true}
            accessibilityRole="header"
            accessibilityLabel="Bro Voice Assistant"
          >
            BRO
          </Text>
          {wakeWordEnabled && (
            <View
              style={styles.wakeBadge}
              accessible={true}
              accessibilityLabel="Wake word Hey Bro is active"
            >
              <Radio size={11} color={COLORS.brandRed} />
              <Text style={styles.wakeBadgeText}>HEY BRO READY</Text>
            </View>
          )}
        </View>
      </View>

      {/* Header Controls: Battery Pill + Accessible Settings */}
      <View style={styles.controlsRow}>
        {/* Battery Telemetry Pill */}
        <TouchableOpacity
          onPress={onBatteryPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Battery ${batteryLevel} percent ${isCharging ? ', charging' : ''}`}
          style={[styles.batteryPill, isBatteryLow && styles.batteryPillLow]}
        >
          {isCharging ? (
            <BatteryCharging size={16} color={COLORS.success} />
          ) : (
            <Battery size={16} color={isBatteryLow ? COLORS.danger : COLORS.textSecondary} />
          )}
          <Text style={[styles.batteryText, isBatteryLow && styles.batteryTextLow]}>
            {`${batteryLevel}%`}
          </Text>
        </TouchableOpacity>

        {/* Settings Button */}
        <TouchableOpacity
          onPress={onSettingsPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Open Bro settings"
          style={styles.settingsButton}
        >
          <Settings size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 10 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.canvas,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 2,
    borderColor: COLORS.brandRed,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.brandRed,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  logoGlyph: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.brandRed,
    letterSpacing: -1,
  },
  titleColumn: {
    flexDirection: 'column',
    gap: 2,
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 2.5,
  },
  wakeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.brandRedDark,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    alignSelf: 'flex-start',
  },
  wakeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.brandRed,
    letterSpacing: 0.8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  batteryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
  },
  batteryPillLow: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  batteryText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  batteryTextLow: {
    color: COLORS.danger,
  },
  settingsButton: {
    backgroundColor: COLORS.surface,
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
