import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { apiService, CheckinResponse } from '../services/api';
import { enhanceCoachingData } from '../utils/dummyCoachingData';

export interface AppState {
  currentScreen: 'home' | 'recording' | 'results';
  isRecording: boolean;
  recordingData: {
    uri: string | null;
    duration: number;
    timestamp: string | null;
  };
  checkinData: {
    sessionId: string | null;
    transcript: string | null;
    sentiment: {
      score: number;
      label: string;
      confidence: number;
    } | null;
    coaching: CheckinResponse['coaching'] | null;
    audioUrl: string | null;
  };
  apiHealth: {
    isHealthy: boolean;
    message: string;
    lastChecked: string | null;
    detailedStatus?: {
      status: string;
      service: string;
      version: string;
    };
  };
  loading: {
    health: boolean;
    upload: boolean;
    processing: boolean;
  };
  error: string | null;
  processingTime: number | null;
  coachingMode: 'fast' | 'optimized';
}

export type AppAction =
  | { type: 'NAVIGATE_TO'; payload: AppState['currentScreen'] }
  | { type: 'START_RECORDING' }
  | {
      type: 'STOP_RECORDING';
      payload: { recordingUri: string; duration: number };
    }
  | { type: 'RESET_RECORDING' }
  | {
      type: 'SET_HEALTH_STATUS';
      payload: {
        isHealthy: boolean;
        message: string;
        detailedStatus?: {
          status: string;
          service: string;
          version: string;
        };
      };
    }
  | {
      type: 'SET_LOADING';
      payload: { type: keyof AppState['loading']; loading: boolean };
    }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CHECKIN_DATA'; payload: CheckinResponse }
  | { type: 'START_UPLOAD' }
  | {
      type: 'UPLOAD_SUCCESS';
      payload: {
        data: CheckinResponse;
        processingTime?: number;
      };
    }
  | { type: 'UPLOAD_ERROR'; payload: string }
  | { type: 'SET_COACHING_MODE'; payload: 'fast' | 'optimized' };

const initialState: AppState = {
  currentScreen: 'home',
  isRecording: false,
  recordingData: {
    uri: null,
    duration: 0,
    timestamp: null,
  },
  checkinData: {
    sessionId: null,
    transcript: null,
    sentiment: null,
    coaching: null,
    audioUrl: null,
  },
  apiHealth: {
    isHealthy: false,
    message: 'Not checked',
    lastChecked: null,
  },
  loading: {
    health: false,
    upload: false,
    processing: false,
  },
  error: null,
  processingTime: null,
  coachingMode: 'fast', // Default to fast mode for demos
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NAVIGATE_TO':
      return {
        ...state,
        currentScreen: action.payload,
        error: null,
      };

    case 'START_RECORDING':
      return {
        ...state,
        isRecording: true,
        recordingData: {
          uri: null,
          duration: 0,
          timestamp: new Date().toISOString(),
        },
        error: null,
      };

    case 'STOP_RECORDING':
      return {
        ...state,
        isRecording: false,
        recordingData: {
          uri: action.payload.recordingUri,
          duration: action.payload.duration,
          timestamp: state.recordingData.timestamp,
        },
      };

    case 'RESET_RECORDING':
      return {
        ...state,
        isRecording: false,
        recordingData: {
          uri: null,
          duration: 0,
          timestamp: null,
        },
        checkinData: {
          sessionId: null,
          transcript: null,
          sentiment: null,
          coaching: null,
          audioUrl: null,
        },
        error: null,
        processingTime: null,
      };

    case 'SET_HEALTH_STATUS':
      return {
        ...state,
        apiHealth: {
          isHealthy: action.payload.isHealthy,
          message: action.payload.message,
          lastChecked: new Date().toISOString(),
          detailedStatus: action.payload.detailedStatus,
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.type]: action.payload.loading,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'START_UPLOAD':
      return {
        ...state,
        loading: {
          ...state.loading,
          upload: true,
          processing: true,
        },
        error: null,
      };

    case 'UPLOAD_SUCCESS':
      return {
        ...state,
        loading: {
          ...state.loading,
          upload: false,
          processing: false,
        },
        checkinData: {
          sessionId: action.payload.data.sessionId,
          transcript: action.payload.data.transcript,
          sentiment: action.payload.data.sentiment,
          coaching: enhanceCoachingData(
            action.payload.data.coaching,
            action.payload.data.sentiment?.score
          ),
          audioUrl: action.payload.data.audioUrl,
        },
        processingTime: action.payload.processingTime || null,
        error: null,
      };

    case 'UPLOAD_ERROR':
      return {
        ...state,
        loading: {
          ...state.loading,
          upload: false,
          processing: false,
        },
        error: action.payload,
      };

    case 'SET_CHECKIN_DATA':
      return {
        ...state,
        checkinData: {
          sessionId: action.payload.sessionId,
          transcript: action.payload.transcript,
          sentiment: action.payload.sentiment,
          coaching: enhanceCoachingData(
            action.payload.coaching,
            action.payload.sentiment?.score
          ),
          audioUrl: action.payload.audioUrl,
        },
        loading: {
          ...state.loading,
          processing: false,
        },
      };

    case 'SET_COACHING_MODE':
      return {
        ...state,
        coachingMode: action.payload,
      };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    checkApiHealth: () => Promise<void>;
    uploadRecording: (recordingUri?: string) => Promise<void>;
    uploadRecordingWithMode: (mode?: 'fast' | 'optimized') => Promise<void>;
    resetApp: () => void;
    setCoachingMode: (mode: 'fast' | 'optimized') => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const checkApiHealth = useCallback(async () => {
    dispatch({
      type: 'SET_LOADING',
      payload: { type: 'health', loading: true },
    });

    try {
      // Check basic health first
      const basicHealthResult = await apiService.checkHealth();

      let isHealthy = false;
      let message = 'Health check failed';
      let detailedStatus;

      if (basicHealthResult.success && basicHealthResult.data) {
        isHealthy = true;
        message = basicHealthResult.data.message || 'API is healthy';
      }

      // Try to get detailed health info (non-blocking)
      try {
        const detailedHealthResult = await apiService.checkDetailedHealth();
        if (detailedHealthResult.success && detailedHealthResult.data) {
          detailedStatus = detailedHealthResult.data;
        }
      } catch (detailedError) {
        // Detailed health check failed, but that's okay
        // eslint-disable-next-line no-console
        console.log('Detailed health check failed:', detailedError);
      }

      dispatch({
        type: 'SET_HEALTH_STATUS',
        payload: {
          isHealthy,
          message,
          detailedStatus,
        },
      });
    } catch (error) {
      dispatch({
        type: 'SET_HEALTH_STATUS',
        payload: {
          isHealthy: false,
          message: 'Connection failed - backend may be offline',
        },
      });
    } finally {
      dispatch({
        type: 'SET_LOADING',
        payload: { type: 'health', loading: false },
      });
    }
  }, []);

  const uploadRecording = useCallback(
    async (recordingUri?: string) => {
      const uriToUse = recordingUri || state.recordingData.uri;

      if (!uriToUse) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'No recording found to upload',
        });
        return;
      }

      dispatch({ type: 'START_UPLOAD' });

      try {
        const result = await apiService.submitCheckin(uriToUse);

        if (result.success && result.data) {
          // Extract processing time from success message
          const processingTimeMatch = result.message?.match(/(\d+)ms/);
          const processingTime = processingTimeMatch
            ? parseInt(processingTimeMatch[1])
            : undefined;

          dispatch({
            type: 'UPLOAD_SUCCESS',
            payload: {
              data: result.data,
              processingTime,
            },
          });
        } else {
          // Handle API errors with detailed error information
          const errorMessage = result.error || 'Upload failed';
          const details = result.code ? ` (${result.code})` : '';
          dispatch({
            type: 'UPLOAD_ERROR',
            payload: `${errorMessage}${details}`,
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Upload recording error:', error);
        dispatch({
          type: 'UPLOAD_ERROR',
          payload: 'Network error. Please check your connection and try again.',
        });
      }
    },
    [state.recordingData.uri]
  );

  const uploadRecordingWithMode = useCallback(
    async (mode?: 'fast' | 'optimized') => {
      if (!state.recordingData.uri) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'No recording found to upload',
        });
        return;
      }

      const selectedMode = mode || state.coachingMode;
      dispatch({ type: 'START_UPLOAD' });

      try {
        const result = await apiService.submitCheckinWithMode(
          state.recordingData.uri,
          selectedMode
        );

        if (result.success && result.data) {
          // Extract processing time from success message
          const processingTimeMatch = result.message?.match(/(\d+)ms/);
          const processingTime = processingTimeMatch
            ? parseInt(processingTimeMatch[1])
            : undefined;

          dispatch({
            type: 'UPLOAD_SUCCESS',
            payload: {
              data: result.data,
              processingTime,
            },
          });

          // Navigate to results after successful upload
          dispatch({ type: 'NAVIGATE_TO', payload: 'results' });
        } else {
          // Handle API errors with detailed error information
          const errorMessage = result.error || 'Upload failed';
          const details = result.code ? ` (${result.code})` : '';
          dispatch({
            type: 'UPLOAD_ERROR',
            payload: `${errorMessage}${details}`,
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Upload recording with mode error:', error);
        dispatch({
          type: 'UPLOAD_ERROR',
          payload: 'Network error. Please check your connection and try again.',
        });
      }
    },
    [state.recordingData.uri, state.coachingMode]
  );

  const setCoachingMode = useCallback((mode: 'fast' | 'optimized') => {
    dispatch({ type: 'SET_COACHING_MODE', payload: mode });
  }, []);

  const resetApp = useCallback(() => {
    dispatch({ type: 'RESET_RECORDING' });
    dispatch({ type: 'NAVIGATE_TO', payload: 'home' });
  }, []);

  const actions = useMemo(
    () => ({
      checkApiHealth,
      uploadRecording,
      uploadRecordingWithMode,
      resetApp,
      setCoachingMode,
    }),
    [
      checkApiHealth,
      uploadRecording,
      uploadRecordingWithMode,
      resetApp,
      setCoachingMode,
    ]
  );

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
