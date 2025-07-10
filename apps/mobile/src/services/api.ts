// API Configuration
// React Native apps cannot connect to 'localhost' - they need the computer's IP address
// For Android emulator: use 10.0.2.2:4000
// For iOS simulator/device: use your computer's IP address
const API_BASE_URL = 'http://10.141.39.175:4000';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  details?: unknown;
  timestamp?: string;
}

// Backend health check response
export interface HealthResponse {
  pong: boolean;
  message: string;
  timestamp: string;
}

export interface DetailedHealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}

// Backend checkin response schema (matches server documentation)
export interface CheckinResponse {
  sessionId: string;
  transcript: string;
  sentiment: {
    score: number; // 0-1, lower = negative
    label: 'positive' | 'negative' | 'neutral';
    confidence: number; // 0-1
  };
  coaching: {
    breathingExercise: {
      title: string;
      instructions: string[];
      duration: number; // Duration in seconds
    };
    stretchExercise: {
      title: string;
      instructions: string[];
      imageUrl?: string;
    };
    resources: Array<{
      title: string;
      description: string;
      url: string;
      category: 'counseling' | 'meditation' | 'emergency';
    }>;
    motivationalMessage: string;
  };
  audioUrl: string; // URL to generated coaching audio (mp3)
}

// Backend complete response wrapper
export interface BackendResponse<T = CheckinResponse> {
  success: boolean;
  data: T;
  processingTime: number; // Total processing time in ms
  error?: string;
  code?: string;
  details?: unknown;
  timestamp?: string;
}

// React Native file upload type
interface ReactNativeFile {
  uri: string;
  type: string;
  name: string;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle backend error responses
        return {
          success: false,
          error:
            data.error || `HTTP ${response.status}: ${response.statusText}`,
          code: data.code || 'HTTP_ERROR',
          details: data.details,
          timestamp: data.timestamp,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to connect to server. Please check your connection.',
      };
    }
  }

  // Basic health check - /ping endpoint
  async checkHealth(): Promise<ApiResponse<HealthResponse>> {
    return this.makeRequest<HealthResponse>('/ping');
  }

  // Detailed health check - /api/health endpoint
  async checkDetailedHealth(): Promise<ApiResponse<DetailedHealthResponse>> {
    return this.makeRequest<DetailedHealthResponse>('/api/health');
  }

  // Main audio upload endpoint
  async submitCheckin(audioUri: string): Promise<ApiResponse<CheckinResponse>> {
    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Detect audio format from URI
      const audioFormat = audioUri.toLowerCase().includes('.wav')
        ? 'audio/wav'
        : audioUri.toLowerCase().includes('.m4a')
          ? 'audio/m4a'
          : 'audio/mp3';

      // Create file object from URI (React Native compatible)
      const audioFile: ReactNativeFile = {
        uri: audioUri,
        type: audioFormat,
        name: `recording.${audioFormat.split('/')[1]}`,
      };

      formData.append('audio', audioFile as unknown as Blob);

      const url = `${API_BASE_URL}/api/checkin`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          // Don't set Content-Type for multipart/form-data - let browser set it with boundary
          Accept: 'application/json',
        },
        body: formData,
      });

      const data = (await response.json()) as BackendResponse<CheckinResponse>;

      if (!response.ok) {
        // Handle backend-specific error responses
        return {
          success: false,
          error:
            data.error || `HTTP ${response.status}: ${response.statusText}`,
          code: data.code || 'HTTP_ERROR',
          details: data.details,
          timestamp: data.timestamp,
        };
      }

      // Return the data portion of the backend response
      return {
        success: data.success,
        data: data.data,
        message: `Processing completed in ${data.processingTime}ms`,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Audio upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message:
          'Failed to upload audio. Please check your connection and try again.',
      };
    }
  }

  // Test endpoint with coaching mode selection
  async submitCheckinWithMode(
    audioUri: string,
    mode: 'fast' | 'optimized' = 'fast'
  ): Promise<ApiResponse<CheckinResponse>> {
    try {
      const formData = new FormData();

      const audioFormat = audioUri.toLowerCase().includes('.wav')
        ? 'audio/wav'
        : audioUri.toLowerCase().includes('.m4a')
          ? 'audio/m4a'
          : 'audio/mp3';

      const audioFile: ReactNativeFile = {
        uri: audioUri,
        type: audioFormat,
        name: `recording.${audioFormat.split('/')[1]}`,
      };

      formData.append('audio', audioFile as unknown as Blob);

      const url = `${API_BASE_URL}/api/checkin?mode=${mode}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'X-Coaching-Mode': mode, // Alternative header method
        },
        body: formData,
      });

      const data = (await response.json()) as BackendResponse<CheckinResponse>;

      if (!response.ok) {
        return {
          success: false,
          error:
            data.error || `HTTP ${response.status}: ${response.statusText}`,
          code: data.code || 'HTTP_ERROR',
          details: data.details,
          timestamp: data.timestamp,
        };
      }

      return {
        success: data.success,
        data: data.data,
        message: `${mode} mode processing completed in ${data.processingTime}ms`,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Audio upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message:
          'Failed to upload audio. Please check your connection and try again.',
      };
    }
  }
}

export const apiService = new ApiService();
