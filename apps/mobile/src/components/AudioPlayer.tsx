import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  AudioModule,
  setAudioModeAsync,
} from 'expo-audio';
import { colors } from '../constants/Colors';
import { typography } from '../constants/Typography';
import { spacing, borderRadius } from '../constants/Layout';
import { getAudioUrl } from '../constants/api';
import { Button } from './ui/Button';

export interface AudioPlayerProps {
  audioUrl: string;
  audioText?: string;
  audioMetadata?: {
    duration: number;
    fileSize: number;
    format: string;
    processingTime: number;
  };
  style?: object;
}

export function AudioPlayer({
  audioUrl,
  audioText,
  audioMetadata,
  style,
}: AudioPlayerProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Construct full URL using the centralized API configuration
  const fullUrl = getAudioUrl(audioUrl);

  // Create audio player with the URL - this is the correct expo-audio API
  const player = useAudioPlayer({ uri: fullUrl });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    // Request audio permissions and set audio mode for better volume
    requestPermissions();
  }, []);

  useEffect(() => {
    // Set player volume to maximum for normal audio level
    if (player) {
      try {
        player.volume = 1.0; // Maximum volume (0.0 to 1.0)
      } catch (error) {
        // Volume control not supported
      }
    }
  }, [player]);

  const requestPermissions = async () => {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      setHasPermission(granted);

      // Set audio mode for better playback volume
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false, // We're only playing, not recording
      });
    } catch (error) {
      // Failed to request audio permissions
      setHasPermission(false);
    }
  };

  const playPauseAudio = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Audio playback permission is required to play coaching audio.'
      );
      return;
    }

    try {
      setIsLoading(true);

      // Check if audio is stuck at the end
      if (duration > 0 && currentTime >= duration - 0.5 && !status.playing) {
        // Audio finished, restart from beginning
        player.seekTo(0);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
        player.play();
      } else if (status.playing) {
        // Pause audio using expo-audio API
        player.pause();
      } else {
        // Play audio using expo-audio API
        player.play();
      }
    } catch (error) {
      // Failed to play/pause audio
      // Try to recover from stuck state
      try {
        forceReset();
      } catch (resetError) {
        Alert.alert(
          'Playback Error',
          'Audio player needs to be reloaded. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = () => {
    try {
      // Reset to beginning and pause - expo-audio API
      player.seekTo(0);
      player.pause();
    } catch (error) {
      // Failed to stop audio
      // Force reset if stuck
      forceReset();
    }
  };

  const forceReset = () => {
    try {
      // Force player to reset when stuck
      player.seekTo(0);
      setIsLoading(false);
    } catch (error) {
      // Failed to force reset
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current time and duration from status
  const currentTime = status.currentTime || 0;
  const duration =
    status.duration || (audioMetadata ? audioMetadata.duration : 0);
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>🎵 Personalized Coaching Audio</Text>
        {audioMetadata && (
          <Text style={styles.metadata}>
            {formatTime(audioMetadata.duration)} •{' '}
            {audioMetadata.format.toUpperCase()}
          </Text>
        )}
      </View>

      {audioText && (
        <View style={styles.textContainer}>
          <Text style={styles.audioText}>&quot;{audioText}&quot;</Text>
        </View>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>
            {duration > 0
              ? formatTime(duration)
              : audioMetadata
                ? formatTime(audioMetadata.duration)
                : '--:--'}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Button
          title={isLoading ? 'Loading...' : status.playing ? 'Pause' : 'Play'}
          onPress={playPauseAudio}
          variant={status.playing ? 'secondary' : 'primary'}
          size="large"
          style={styles.playButton}
          disabled={isLoading}
        />
        <Button
          title="Restart"
          onPress={() => {
            stopAudio();
            // Small delay then auto-play from beginning
            setTimeout(() => {
              if (!status.playing) {
                player.play();
              }
            }, 200);
          }}
          variant="outline"
          style={styles.stopButton}
          disabled={isLoading || (currentTime < 1 && !status.playing)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  audioText: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  container: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.primary,
    borderLeftWidth: 4,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metadata: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  playButton: {
    minWidth: 120,
  },
  progressBar: {
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    height: 4,
    width: '100%',
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    height: '100%',
  },
  stopButton: {
    minWidth: 80,
  },
  textContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  timeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  title: {
    ...typography.h4,
    color: colors.text,
    textAlign: 'center',
  },
});
