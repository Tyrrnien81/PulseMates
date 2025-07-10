import { useState, useRef, useEffect, useCallback } from 'react';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from 'expo-audio';

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
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize permissions and audio mode
  useEffect(() => {
    (async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        setHasPermissions(status.granted);

        if (!status.granted) {
          setError('Microphone permission is required to record audio');
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (err) {
        setError('Failed to initialize audio recording');
      }
    })();
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const status = await AudioModule.requestRecordingPermissionsAsync();
      const granted = status.granted;
      setHasPermissions(granted);

      if (!granted) {
        setError('Microphone permission is required to record audio');
      }

      return granted;
    } catch (err) {
      setError('Failed to request microphone permissions');
      return false;
    }
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      // Check permissions first
      if (!hasPermissions) {
        const granted = await requestPermissions();
        if (!granted) {
          return false;
        }
      }

      // Prepare and start recording
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();

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
  }, [hasPermissions, requestPermissions, audioRecorder]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      setError(null);

      // Stop timer first
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop recording even if state shows not recording (defensive programming)
      try {
        await audioRecorder.stop();
      } catch (stopError) {
        // Continue anyway, this might be expected if already stopped
      }

      // Get recording URI
      const uri = audioRecorder.uri;
      setRecordingUri(uri);

      if (!uri) {
        setError('Recording file not found after stopping');
        return null;
      }

      return uri;
    } catch (err) {
      setError('Failed to stop recording');
      return null;
    }
  }, [recorderState.isRecording, audioRecorder]);

  return {
    isRecording: recorderState.isRecording,
    recordingDuration,
    recordingUri,
    startRecording,
    stopRecording,
    requestPermissions,
    hasPermissions,
    error,
  };
}
