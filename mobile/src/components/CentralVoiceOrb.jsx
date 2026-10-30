import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Mic, Volume2, Loader, AlertCircle } from 'lucide-react-native';
import { COLORS } from '../config/colors';
import { ASSISTANT_STATE } from '../hooks/useVoiceAssistant';

export function CentralVoiceOrb({ state, onPress, onLongPress }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const outerPulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Pulse animations for listening or speaking
  useEffect(() => {
    let animLoop = null;

    if (state === ASSISTANT_STATE.LISTENING || state === ASSISTANT_STATE.SPEAKING) {
      animLoop = Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.12,
              duration: 700,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1.0,
              duration: 700,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(outerPulseAnim, {
              toValue: 1.25,
              duration: 900,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(outerPulseAnim, {
              toValue: 1.0,
              duration: 900,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ),
      ]);
      animLoop.start();
    } else if (state === ASSISTANT_STATE.PROCESSING) {
      animLoop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animLoop.start();
    } else {
      pulseAnim.setValue(1);
      outerPulseAnim.setValue(1);
      rotateAnim.setValue(0);
    }

    return () => {
      if (animLoop) animLoop.stop();
    };
  }, [state, pulseAnim, outerPulseAnim, rotateAnim]);

  // Accessibility label for screen reader
  const getAccessibilityLabel = () => {
    switch (state) {
      case ASSISTANT_STATE.LISTENING:
        return 'Listening to you. Tap to stop.';
      case ASSISTANT_STATE.PROCESSING:
        return 'Thinking, processing your request.';
      case ASSISTANT_STATE.SPEAKING:
        return 'Speaking response. Tap anywhere on screen to silence.';
      case ASSISTANT_STATE.AWAITING_CONFIRMATION:
        return 'Action confirmation needed. Say yes or no, or tap to confirm.';
      default:
        return 'Bro voice assistant button. Tap or say Hey Bro to speak.';
    }
  };

  const getOrbAccent = () => {
    switch (state) {
      case ASSISTANT_STATE.LISTENING:
        return COLORS.brandRed;
      case ASSISTANT_STATE.PROCESSING:
        return COLORS.accentCyan;
      case ASSISTANT_STATE.SPEAKING:
        return COLORS.textPrimary;
      case ASSISTANT_STATE.AWAITING_CONFIRMATION:
        return COLORS.brandRed;
      default:
        return COLORS.brandRed;
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Outer Acoustic Aura Ring */}
      <Animated.View
        style={[
          styles.outerAura,
          {
            borderColor: getOrbAccent(),
            transform: [{ scale: outerPulseAnim }],
            opacity: state === ASSISTANT_STATE.LISTENING ? 0.35 : 0.08,
          },
        ]}
      />

      {/* Mid Wave Halo */}
      <Animated.View
        style={[
          styles.midHalo,
          {
            borderColor: getOrbAccent(),
            transform: [{ scale: pulseAnim }],
            opacity: state === ASSISTANT_STATE.LISTENING || state === ASSISTANT_STATE.SPEAKING ? 0.45 : 0.15,
          },
        ]}
      />

      {/* Main Tactile Voice Orb */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        onLongPress={onLongPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={getAccessibilityLabel()}
        accessibilityHint="Single tap starts listening. Double tap screen repeats last speech."
        style={[
          styles.orb,
          {
            borderColor: getOrbAccent(),
            shadowColor: getOrbAccent(),
          },
        ]}
      >
        <Animated.View
          style={[
            styles.innerContent,
            state === ASSISTANT_STATE.PROCESSING && { transform: [{ rotate: spin }] },
          ]}
        >
          {state === ASSISTANT_STATE.LISTENING && (
            <Mic size={72} color={COLORS.brandRed} strokeWidth={2.6} />
          )}
          {state === ASSISTANT_STATE.PROCESSING && (
            <Loader size={68} color={COLORS.accentCyan} strokeWidth={2.6} />
          )}
          {state === ASSISTANT_STATE.SPEAKING && (
            <Volume2 size={72} color={COLORS.textPrimary} strokeWidth={2.6} />
          )}
          {state === ASSISTANT_STATE.AWAITING_CONFIRMATION && (
            <AlertCircle size={68} color={COLORS.brandRed} strokeWidth={2.6} />
          )}
          {state === ASSISTANT_STATE.IDLE && (
            <Mic size={72} color={COLORS.textPrimary} strokeWidth={2.4} />
          )}
        </Animated.View>

        {/* State Label */}
        <Text style={[styles.stateText, { color: getOrbAccent() }]}>
          {state === ASSISTANT_STATE.LISTENING && 'LISTENING...'}
          {state === ASSISTANT_STATE.PROCESSING && 'THINKING...'}
          {state === ASSISTANT_STATE.SPEAKING && 'SPEAKING'}
          {state === ASSISTANT_STATE.AWAITING_CONFIRMATION && 'CONFIRM?'}
          {state === ASSISTANT_STATE.IDLE && 'TAP OR "HEY BRO"'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  outerAura: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 2,
  },
  midHalo: {
    position: 'absolute',
    width: 236,
    height: 236,
    borderRadius: 118,
    borderWidth: 3.5,
  },
  orb: {
    width: 196,
    height: 196,
    borderRadius: 98,
    backgroundColor: COLORS.surface,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});
