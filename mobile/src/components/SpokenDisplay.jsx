import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { RotateCcw, VolumeX, Eye, Compass, Calendar } from 'lucide-react-native';
import { COLORS } from '../config/colors';

export function SpokenDisplay({
  lastQuery,
  lastResponse,
  onRepeat,
  onStop,
  isSpeaking,
  onCheckMoney,
  onWhichWay,
  onMorningBriefing,
}) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      accessible={true}
      accessibilityLabel="Voice feedback and response display"
    >
      {/* What the User Asked */}
      {lastQuery ? (
        <View
          style={styles.queryCard}
          accessible={true}
          accessibilityLabel={`You said: ${lastQuery}`}
        >
          <Text style={styles.cardLabel}>YOU SAID</Text>
          <Text style={styles.queryText}>{lastQuery}</Text>
        </View>
      ) : null}

      {/* Assistant Voice Response Card */}
      <View
        style={styles.responseCard}
        accessible={true}
        accessibilityLiveRegion="polite"
        accessibilityLabel={`Bro reply: ${lastResponse || 'Say "Hey Bro" or tap the center orb to begin.'}`}
      >
        <Text style={styles.responseLabel}>BRO</Text>
        <Text style={styles.responseText}>
          {lastResponse || 'Say "Hey Bro" or tap the center orb to speak.'}
        </Text>
      </View>

      {/* Speech Audio Actions: Repeat & Silence */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={onRepeat}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Repeat last response. Double-tapping anywhere on screen also repeats."
          style={styles.actionButton}
        >
          <RotateCcw size={20} color={COLORS.brandRed} />
          <Text style={styles.actionButtonText}>REPEAT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onStop}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Stop speech playback"
          style={[
            styles.actionButton,
            isSpeaking && { borderColor: COLORS.brandRed, backgroundColor: COLORS.brandRedDark },
          ]}
        >
          <VolumeX size={20} color={isSpeaking ? COLORS.brandRed : COLORS.textPrimary} />
          <Text style={[styles.actionButtonText, isSpeaking && { color: COLORS.brandRed }]}>
            {isSpeaking ? 'STOP SPEECH' : 'SILENCE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Sensory Shortcuts for Blind / Low-Vision Access */}
      <View style={styles.shortcutsSection}>
        <Text style={styles.shortcutsHeader}>QUICK SENSORY ACTIONS</Text>
        <View style={styles.shortcutsRow}>
          {/* Check Money */}
          <TouchableOpacity
            onPress={onCheckMoney}
            activeOpacity={0.85}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Check currency money. Opens camera to identify Indian rupee note."
            style={styles.shortcutTile}
          >
            <Eye size={22} color={COLORS.brandRed} />
            <Text style={styles.shortcutTitle}>CHECK MONEY</Text>
            <Text style={styles.shortcutSub}>₹10 to ₹500</Text>
          </TouchableOpacity>

          {/* Which Way Compass */}
          <TouchableOpacity
            onPress={onWhichWay}
            activeOpacity={0.85}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Which direction am I facing. Announces cardinal heading and vibrates at North."
            style={styles.shortcutTile}
          >
            <Compass size={22} color={COLORS.brandRed} />
            <Text style={styles.shortcutTitle}>WHICH WAY</Text>
            <Text style={styles.shortcutSub}>Haptic North</Text>
          </TouchableOpacity>

          {/* Daily Briefing */}
          <TouchableOpacity
            onPress={onMorningBriefing}
            activeOpacity={0.85}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Daily briefing. Speaks medicines, tasks, and battery summary."
            style={styles.shortcutTile}
          >
            <Calendar size={22} color={COLORS.brandRed} />
            <Text style={styles.shortcutTitle}>BRIEFING</Text>
            <Text style={styles.shortcutSub}>Meds & Tasks</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 28,
    gap: 14,
  },
  queryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  queryText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  responseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.brandRed,
    minHeight: 115,
    justifyContent: 'center',
    shadowColor: COLORS.brandRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  responseLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.brandRed,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  responseText: {
    fontSize: 21,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 30,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    minHeight: 52,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  shortcutsSection: {
    marginTop: 6,
  },
  shortcutsHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shortcutTile: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 88,
  },
  shortcutTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  shortcutSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
