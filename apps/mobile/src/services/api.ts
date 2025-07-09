// API Configuration
const API_BASE_URL = 'http://localhost:4000';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface HealthResponse {
  pong: boolean;
  message: string;
}

export interface CheckinRequest {
  audioFile: string; // URI path to audio file
  duration: number;
  timestamp: string;
}

export interface CheckinResponse {
  id: string;
  transcript?: string;
  sentiment?: {
    score: number;
    label: string;
    confidence: number;
  };
  coaching?: {
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
    resources: Array<{
      title: string;
      description: string;
      url: string;
      type: 'phone' | 'website' | 'email';
    }>;
    motivationalMessage: string;
  };
  audioUrl?: string;
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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
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

  async checkHealth(): Promise<ApiResponse<HealthResponse>> {
    return this.makeRequest<HealthResponse>('/ping');
  }

  async submitCheckin(
    audioUri: string,
    duration: number
  ): Promise<ApiResponse<CheckinResponse>> {
    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Create file object from URI
      const audioFile = {
        uri: audioUri,
        type: 'audio/mp3',
        name: `checkin_${Date.now()}.mp3`,
      } as unknown;

      formData.append('audio', audioFile as Blob);
      formData.append('duration', duration.toString());
      formData.append('timestamp', new Date().toISOString());

      const url = `${API_BASE_URL}/api/checkin`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message:
          'Failed to upload audio. Please check your connection and try again.',
      };
    }
  }

  async getCheckinStatus(id: string): Promise<ApiResponse<CheckinResponse>> {
    return this.makeRequest<CheckinResponse>(`/api/checkin/${id}`);
  }
}

export const apiService = new ApiService();
