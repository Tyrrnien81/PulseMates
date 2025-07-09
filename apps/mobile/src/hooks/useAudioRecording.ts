import { useState, useRef } from 'react';
import { Audio } from 'expo-audio';

export interface AudioRecordingHook {
  isRecording: boolean;
  recordingDuration: number;
  recordingUri: string | null;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<string | null>;
  requestPermissions: () => Promise<boolean>;
  hasPermissions: boolean;
  error: string | null;
}

export function useAudioRecording(): AudioRecordingHook {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      setError(null);
      const { status } = await Audio.requestPermissionsAsync();
      const granted = status === 'granted';
      setHasPermissions(granted);

      if (!granted) {
        setError('Microphone permission is required to record audio');
      }

      return granted;
    } catch (err) {
      setError('Failed to request microphone permissions');
      return false;
    }
  };

  const startRecording = async (): Promise<boolean> => {
    try {
      setError(null);

      // Check permissions first
      if (!hasPermissions) {
        const granted = await requestPermissions();
        if (!granted) return false;
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Recording options for MP3 format
      const recordingOptions = {
        android: {
          extension: '.mp3',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.mp3',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/mp3',
          bitsPerSecond: 128000,
        },
      };

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      recordingRef.current = recording;

      setIsRecording(true);
      setRecordingDuration(0);
      setRecordingUri(null);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      return true;
    } catch (err) {
      setError('Failed to start recording');
      return false;
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    try {
      setError(null);

      if (!recordingRef.current || !isRecording) {
        return null;
      }

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      setIsRecording(false);

      // Get recording URI
      const uri = recordingRef.current.getURI();
      setRecordingUri(uri);

      // Clear recording reference
      recordingRef.current = null;

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      return uri;
    } catch (err) {
      setError('Failed to stop recording');
      setIsRecording(false);
      return null;
    }
  };

  return {
    isRecording,
    recordingDuration,
    recordingUri,
    startRecording,
    stopRecording,
    requestPermissions,
    hasPermissions,
    error,
  };
}
