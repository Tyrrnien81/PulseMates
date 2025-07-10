import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../constants/Colors';
import { typography } from '../constants/Typography';
import { spacing, borderRadius } from '../constants/Layout';

export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error';

interface HapticButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  hapticType?: HapticType;
  visualFeedback?: boolean;
  style?: object;
  disabled?: boolean;
}

export function HapticButton({
  children,
  onPress,
  hapticType = 'light',
  visualFeedback = true,
  style,
  disabled = false,
}: HapticButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const triggerHaptic = async (type: HapticType) => {
    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          break;
        case 'warning':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          );
          break;
        case 'error':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
          break;
      }
    } catch (error) {
      // Haptics not available on this device/simulator
    }
  };

  const handlePress = () => {
    if (disabled) return;

    // Trigger haptic feedback
    runOnJS(triggerHaptic)(hapticType);

    // Visual feedback
    if (visualFeedback) {
      scale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 15, stiffness: 400 })
      );
    }

    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : opacity.value,
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

interface RecordingFeedbackProps {
  isRecording: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
}

export function RecordingFeedback({
  isRecording,
  onStartRecording,
  onStopRecording,
}: RecordingFeedbackProps) {
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isRecording) {
      // Continuous pulse while recording
      pulseScale.value = withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 })
      );

      glowOpacity.value = withTiming(0.6, { duration: 300 });

      // Trigger success haptic when starting
      runOnJS(triggerRecordingHaptic)('start');
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isRecording, pulseScale, glowOpacity]);

  const triggerRecordingHaptic = async (action: 'start' | 'stop') => {
    try {
      if (action === 'start') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      }
    } catch (error) {
      // Haptics not available
    }
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePress = () => {
    if (isRecording) {
      runOnJS(triggerRecordingHaptic)('stop');
      onStopRecording?.();
    } else {
      onStartRecording?.();
    }
  };

  return (
    <View style={styles.recordingContainer}>
      {/* Glow effect */}
      <Animated.View style={[styles.recordingGlow, glowStyle]} />

      {/* Recording button */}
      <HapticButton
        onPress={handlePress}
        hapticType={isRecording ? 'success' : 'medium'}
        style={[styles.recordingButton, isRecording && styles.recordingActive]}
      >
        <Animated.View style={pulseStyle}>
          <Text style={styles.recordingIcon}>{isRecording ? '⏹' : '🎤'}</Text>
        </Animated.View>
      </HapticButton>

      <Text style={styles.recordingText}>
        {isRecording ? 'Recording...' : 'Tap to Record'}
      </Text>
    </View>
  );
}

interface ConfirmationAnimationProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  isVisible: boolean;
  onComplete?: () => void;
  duration?: number;
}

export function ConfirmationAnimation({
  type,
  message,
  isVisible,
  onComplete,
  duration = 2000,
}: ConfirmationAnimationProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    if (isVisible) {
      // Entry animation
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });

      // Trigger appropriate haptic
      const hapticType: HapticType =
        type === 'success' ? 'success' : type === 'error' ? 'error' : 'warning';
      runOnJS(triggerHaptic)(hapticType);

      // Auto-hide
      setTimeout(() => {
        scale.value = withTiming(0.8, { duration: 200 });
        opacity.value = withTiming(0, { duration: 300 });
        translateY.value = withTiming(-20, { duration: 300 }, () => {
          if (onComplete) {
            runOnJS(onComplete)();
          }
        });
      }, duration);
    }
  }, [isVisible, scale, opacity, translateY, type, duration, onComplete]);

  const triggerHaptic = async (hapticType: HapticType) => {
    try {
      switch (hapticType) {
        case 'success':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          break;
        case 'error':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
          break;
        case 'warning':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          );
          break;
      }
    } catch (error) {
      // Haptics not available
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.confirmationOverlay}>
      <Animated.View
        style={[
          styles.confirmationContainer,
          { backgroundColor: getColor() },
          animatedStyle,
        ]}
      >
        <Text style={styles.confirmationIcon}>{getIcon()}</Text>
        <Text style={styles.confirmationMessage}>{message}</Text>
      </Animated.View>
    </View>
  );
}

interface MicroInteractionProps {
  children: React.ReactNode;
  type?: 'bounce' | 'scale' | 'fade' | 'slide';
  trigger?: boolean;
  duration?: number;
}

export function MicroInteraction({
  children,
  type = 'scale',
  trigger = false,
  duration = 300,
}: MicroInteractionProps) {
  const animation = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      animation.value = withSequence(
        withTiming(1, { duration: duration / 2 }),
        withTiming(0, { duration: duration / 2 })
      );
    }
  }, [trigger, animation, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    switch (type) {
      case 'bounce':
        return {
          transform: [
            { translateY: interpolate(animation.value, [0, 1], [0, -10]) },
          ],
        };
      case 'scale':
        return {
          transform: [
            { scale: interpolate(animation.value, [0, 1], [1, 1.05]) },
          ],
        };
      case 'fade':
        return {
          opacity: interpolate(animation.value, [0, 1], [1, 0.7]),
        };
      case 'slide':
        return {
          transform: [
            { translateX: interpolate(animation.value, [0, 1], [0, 5]) },
          ],
        };
      default:
        return {};
    }
  });

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function SwipeableCard({
  children,
  onSwipeLeft: _onSwipeLeft,
  onSwipeRight: _onSwipeRight,
  threshold: _threshold = 100,
}: SwipeableCardProps) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.swipeableCard, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  confirmationContainer: {
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    elevation: 8,
    flexDirection: 'row',
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmationIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  confirmationMessage: {
    ...typography.body,
    color: colors.surface,
    flex: 1,
    fontWeight: '600',
  },
  confirmationOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    left: spacing.lg,
    position: 'absolute',
    right: spacing.lg,
    top: 100,
    zIndex: 1000,
  },
  recordingActive: {
    backgroundColor: colors.recording,
  },
  recordingButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 40,
    elevation: 8,
    height: 80,
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 80,
  },
  recordingContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  recordingGlow: {
    backgroundColor: colors.recording,
    borderRadius: 60,
    height: 120,
    position: 'absolute',
    top: spacing.lg,
    width: 120,
  },
  recordingIcon: {
    fontSize: 32,
  },
  recordingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  swipeableCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    elevation: 4,
    marginVertical: spacing.sm,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
