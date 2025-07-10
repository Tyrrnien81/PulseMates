// API Response Types for PulseMates

export interface SentimentResult {
  score: number; // 0-1 normalized
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface CoachingResponse {
  breathingExercise: {
    title: string;
    instructions: string[];
    duration: number;
  };
  stretchExercise: {
    title: string;
    instructions: string[];
    imageUrl?: string;
  };
  resources: {
    title: string;
    description: string;
    url: string;
    category: 'counseling' | 'meditation' | 'emergency';
  }[];
  motivationalMessage: string;
}

// Audio metadata for TTS (Phase 5)
export interface AudioMetadata {
  duration: number;
  fileSize: number;
  format: string;
  processingTime: number;
  voiceConfig?: {
    languageCode: string;
    voiceName: string;
    ssmlGender: string;
  };
}

export interface CheckinResponse {
  success: boolean;
  data: {
    transcript?: string;
    sentiment?: SentimentResult;
    coaching?: CoachingResponse;
    audioUrl?: string; // Phase 5: TTS audio file URL
    audioText?: string; // Phase 5: Text that was converted to speech
    audioMetadata?: AudioMetadata; // Phase 5: Audio file metadata
    sessionId: string;
  };
  processingTime: number;
  error?: string;
}

export interface APIError {
  success: false;
  error: string;
  details?: unknown;
  timestamp: string;
}

// File upload validation types
export interface AudioFileValidation {
  format: 'wav' | 'mp3' | 'm4a';
  maxSize: number; // in bytes
  maxDuration: number; // in seconds
}

export const AUDIO_UPLOAD_CONFIG: AudioFileValidation = {
  format: 'wav', // Allow multiple formats
  maxSize: 10 * 1024 * 1024, // 10MB
  maxDuration: 60, // 60 seconds
};
