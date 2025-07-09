import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/Colors';
import { typography } from '../constants/Typography';
import { spacing, borderRadius } from '../constants/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import { useAudioRecording } from '../hooks/useAudioRecording';

const MAX_RECORDING_DURATION = 60; // 60 seconds

export function RecordingScreen() {
  const { dispatch, actions } = useAppContext();
  const audioRecording = useAudioRecording();
  const [timeRemaining, setTimeRemaining] = useState(MAX_RECORDING_DURATION);
  const [pulseAnimation] = useState(new Animated.Value(1));

  const stopRecording = useCallback(async () => {
    try {
      const recordingUri = await audioRecording.stopRecording();

      if (recordingUri) {
        dispatch({
          type: 'STOP_RECORDING',
          payload: {
            recordingUri,
            duration: audioRecording.recordingDuration,
          },
        });

        // Start upload process
        setTimeout(async () => {
          await actions.uploadRecording();
        }, 500);
      } else {
        Alert.alert('Recording Error', 'Failed to save recording.');
      }
    } catch (error) {
      Alert.alert('Recording Error', 'Failed to stop recording.');
    }
  }, [audioRecording, dispatch, actions]);

  useEffect(() => {
    // Pulse animation for recording button
    const pulseAnimationLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    if (audioRecording.isRecording) {
      pulseAnimationLoop.start();
    } else {
      pulseAnimationLoop.stop();
      pulseAnimation.setValue(1);
    }

    return () => pulseAnimationLoop.stop();
  }, [audioRecording.isRecording, pulseAnimation]);

  useEffect(() => {
    // Update time remaining based on actual recording duration
    if (audioRecording.isRecording) {
      const remaining =
        MAX_RECORDING_DURATION - audioRecording.recordingDuration;
      setTimeRemaining(Math.max(0, remaining));

      // Auto-stop at max duration
      if (remaining <= 0) {
        stopRecording();
      }
    }
  }, [
    audioRecording.recordingDuration,
    audioRecording.isRecording,
    stopRecording,
  ]);

  useEffect(() => {
    // Request permissions when component mounts
    if (!audioRecording.hasPermissions) {
      audioRecording.requestPermissions();
    }
  }, [audioRecording.hasPermissions, audioRecording.requestPermissions]);

  useEffect(() => {
    // Handle audio recording errors
    if (audioRecording.error) {
      Alert.alert('Recording Error', audioRecording.error);
    }
  }, [audioRecording.error]);

  const startRecording = async () => {
    try {
      const success = await audioRecording.startRecording();
      if (success) {
        dispatch({ type: 'START_RECORDING' });
        setTimeRemaining(MAX_RECORDING_DURATION);
      }
    } catch (error) {
      Alert.alert(
        'Recording Error',
        'Failed to start recording. Please check permissions.'
      );
    }
  };

  const cancelRecording = () => {
    Alert.alert(
      'Cancel Recording',
      'Are you sure you want to cancel? Your recording will be lost.',
      [
        { text: 'Continue Recording', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            if (audioRecording.isRecording) {
              await audioRecording.stopRecording();
            }
            dispatch({ type: 'RESET_RECORDING' });
            dispatch({ type: 'NAVIGATE_TO', payload: 'home' });
          },
        },
      ]
    );
  };

  const goBack = () => {
    if (audioRecording.isRecording) {
      cancelRecording();
    } else {
      dispatch({ type: 'NAVIGATE_TO', payload: 'home' });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = audioRecording.isRecording
    ? (audioRecording.recordingDuration / MAX_RECORDING_DURATION) * 100
    : 0;

  // Show permission request if needed
  if (!audioRecording.hasPermissions) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={colors.background} />

        <View style={styles.header}>
          <Button
            title="← Back"
            onPress={goBack}
            variant="ghost"
            size="small"
          />
          <Text style={styles.headerTitle}>Mental Check-in</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <Card variant="elevated" padding="xl" style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>
              🎤 Microphone Access Required
            </Text>
            <Text style={styles.permissionText}>
              To record your mental check-in, we need access to your microphone.
              Your recordings are processed securely and never shared.
            </Text>

            <Button
              title="Grant Microphone Access"
              onPress={audioRecording.requestPermissions}
              size="large"
              style={styles.permissionButton}
            />

            {audioRecording.error && (
              <Text style={styles.errorText}>{audioRecording.error}</Text>
            )}
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Button title="← Back" onPress={goBack} variant="ghost" size="small" />
        <Text style={styles.headerTitle}>Mental Check-in</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Instructions */}
        <Card variant="outlined" padding="lg" style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Share your thoughts</Text>
          <Text style={styles.instructionsText}>
            Take a moment to express how you&apos;re feeling. You have 60
            seconds to share whatever is on your mind.
          </Text>
        </Card>

        {/* Recording Interface */}
        <View style={styles.recordingContainer}>
          {/* Timer */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.timerLabel}>
              {audioRecording.isRecording ? 'Recording...' : 'Ready to record'}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress)}% • {audioRecording.recordingDuration}s
              recorded
            </Text>
          </View>

          {/* Recording Button */}
          <View style={styles.recordingButtonContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
              <Button
                title={
                  audioRecording.isRecording
                    ? '🎤 Recording'
                    : '🎤 Start Recording'
                }
                onPress={
                  audioRecording.isRecording ? stopRecording : startRecording
                }
                variant={audioRecording.isRecording ? 'secondary' : 'primary'}
                size="large"
                style={[
                  styles.recordingButton,
                  audioRecording.isRecording && styles.recordingButtonActive,
                ]}
              />
            </Animated.View>
          </View>

          {/* Controls */}
          {audioRecording.isRecording && (
            <View style={styles.controlsContainer}>
              <Button
                title="Stop & Continue"
                onPress={stopRecording}
                variant="outline"
                style={styles.controlButton}
              />
              <Button
                title="Cancel"
                onPress={cancelRecording}
                variant="ghost"
                style={styles.controlButton}
              />
            </View>
          )}
        </View>

        {/* Tips */}
        <Card variant="default" padding="md" style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips for a good recording:</Text>
          <Text style={styles.tipsText}>
            • Find a quiet space{'\n'}• Speak clearly and naturally{'\n'}• Share
            whatever feels comfortable{'\n'}• There&apos;s no right or wrong way
            to express yourself
          </Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  controlButton: {
    minWidth: 120,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerSpacer: {
    width: 60,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  instructionsCard: {
    marginBottom: spacing.xl,
  },
  instructionsText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  instructionsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  permissionButton: {
    minWidth: 200,
  },
  permissionCard: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  permissionText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  permissionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  progressBar: {
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    height: 8,
    marginBottom: spacing.sm,
    width: '100%',
  },
  progressBarContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    width: '80%',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    height: '100%',
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  recordingButton: {
    minWidth: 200,
  },
  recordingButtonActive: {
    backgroundColor: colors.recording,
  },
  recordingButtonContainer: {
    marginBottom: spacing.xl,
  },
  recordingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  timerLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  timerText: {
    ...typography.timer,
    color: colors.primary,
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  tipsCard: {
    backgroundColor: colors.surfaceLight,
    borderLeftColor: colors.info,
    borderLeftWidth: 4,
  },
  tipsText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  tipsTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
});
