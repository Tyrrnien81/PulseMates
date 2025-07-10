import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { apiService, CheckinResponse } from '../services/api';

// Mock data for development/demo purposes
const getMockCheckinData = (): CheckinResponse => {
  const mockVariations = [
    {
      id: `mock_${Date.now()}`,
      transcript:
        "I'm feeling really good today. Had a great workout this morning and feeling energized for the day ahead. Looking forward to tackling my projects.",
      sentiment: {
        score: 0.85,
        label: 'Positive',
        confidence: 0.92,
      },
    },
    {
      id: `mock_${Date.now()}`,
      transcript:
        "It's been a challenging week with lots of deadlines. Feeling a bit overwhelmed but trying to stay focused and take things one step at a time.",
      sentiment: {
        score: 0.35,
        label: 'Stressed',
        confidence: 0.78,
      },
    },
    {
      id: `mock_${Date.now()}`,
      transcript:
        'Had a regular day at work. Nothing particularly exciting or stressful. Just going through the motions and feeling pretty neutral about everything.',
      sentiment: {
        score: 0.55,
        label: 'Neutral',
        confidence: 0.65,
      },
    },
  ];

  const variation =
    mockVariations[Math.floor(Math.random() * mockVariations.length)];

  return {
    ...variation,
    coaching: {
      breathingExercise: {
        title: 'Deep Breathing Exercise',
        instructions: [
          'Inhale slowly through your nose for 4 seconds',
          'Hold your breath for 7 seconds',
          'Exhale slowly through your mouth for 8 seconds',
          'Repeat 3-4 times',
        ],
        duration: 5,
      },
      stretchExercise: {
        title: 'Neck and Shoulder Release',
        instructions: [
          'Gently roll your shoulders backward 5 times',
          'Slowly turn your head left and right',
          'Tilt your head to each shoulder and hold for 10 seconds',
          'Take deep breaths throughout',
        ],
      },
      resources: [],
      motivationalMessage:
        "Remember, it's okay to feel whatever you're feeling. Every emotion is valid, and reaching out for support is a sign of strength.",
    },
  };
};

export interface AppState {
  currentScreen: 'home' | 'recording' | 'results';
  isRecording: boolean;
  recordingData: {
    uri: string | null;
    duration: number;
    timestamp: string | null;
  };
  checkinData: {
    id: string | null;
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
  };
  loading: {
    health: boolean;
    upload: boolean;
    processing: boolean;
  };
  error: string | null;
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
      payload: { isHealthy: boolean; message: string };
    }
  | {
      type: 'SET_LOADING';
      payload: { type: keyof AppState['loading']; loading: boolean };
    }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CHECKIN_DATA'; payload: CheckinResponse }
  | { type: 'START_UPLOAD' }
  | { type: 'UPLOAD_SUCCESS'; payload: CheckinResponse }
  | { type: 'UPLOAD_ERROR'; payload: string };

const initialState: AppState = {
  currentScreen: 'home',
  isRecording: false,
  recordingData: {
    uri: null,
    duration: 0,
    timestamp: null,
  },
  checkinData: {
    id: null,
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
          id: null,
          transcript: null,
          sentiment: null,
          coaching: null,
          audioUrl: null,
        },
        error: null,
      };

    case 'SET_HEALTH_STATUS':
      return {
        ...state,
        apiHealth: {
          isHealthy: action.payload.isHealthy,
          message: action.payload.message,
          lastChecked: new Date().toISOString(),
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
          id: action.payload.id,
          transcript: action.payload.transcript || null,
          sentiment: action.payload.sentiment || null,
          coaching: action.payload.coaching || null,
          audioUrl: action.payload.audioUrl || null,
        },
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
          id: action.payload.id,
          transcript: action.payload.transcript || null,
          sentiment: action.payload.sentiment || null,
          coaching: action.payload.coaching || null,
          audioUrl: action.payload.audioUrl || null,
        },
        loading: {
          ...state.loading,
          processing: false,
        },
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
    uploadRecording: () => Promise<void>;
    resetApp: () => void;
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
      const result = await apiService.checkHealth();

      if (result.success && result.data) {
        dispatch({
          type: 'SET_HEALTH_STATUS',
          payload: {
            isHealthy: true,
            message: result.data.message,
          },
        });
      } else {
        dispatch({
          type: 'SET_HEALTH_STATUS',
          payload: {
            isHealthy: false,
            message: result.message || 'Health check failed',
          },
        });
      }
    } catch (error) {
      dispatch({
        type: 'SET_HEALTH_STATUS',
        payload: {
          isHealthy: false,
          message: 'Connection failed',
        },
      });
    } finally {
      dispatch({
        type: 'SET_LOADING',
        payload: { type: 'health', loading: false },
      });
    }
  }, []);

  const uploadRecording = useCallback(async () => {
    if (!state.recordingData.uri) {
      dispatch({ type: 'SET_ERROR', payload: 'No recording found to upload' });
      return;
    }

    dispatch({ type: 'START_UPLOAD' });

    try {
      const result = await apiService.submitCheckin(
        state.recordingData.uri,
        state.recordingData.duration
      );

      if (result.success && result.data) {
        dispatch({ type: 'UPLOAD_SUCCESS', payload: result.data });

        // Always navigate to results after successful upload
        dispatch({ type: 'NAVIGATE_TO', payload: 'results' });

        // If we don't have complete data, set processing loading state
        if (
          !result.data.transcript ||
          !result.data.sentiment ||
          !result.data.coaching
        ) {
          dispatch({
            type: 'SET_LOADING',
            payload: { type: 'processing', loading: true },
          });
          // TODO: Implement polling for processing status
        }
      } else {
        // For development/demo: provide mock data when API fails
        dispatch({
          type: 'UPLOAD_SUCCESS',
          payload: getMockCheckinData(),
        });
        dispatch({ type: 'NAVIGATE_TO', payload: 'results' });
      }
    } catch (error) {
      dispatch({
        type: 'UPLOAD_ERROR',
        payload: 'Failed to upload recording. Please try again.',
      });
    }
  }, [state.recordingData.uri, state.recordingData.duration]);

  const resetApp = useCallback(() => {
    dispatch({ type: 'RESET_RECORDING' });
    dispatch({ type: 'NAVIGATE_TO', payload: 'home' });
  }, []);

  const actions = useMemo(
    () => ({
      checkApiHealth,
      uploadRecording,
      resetApp,
    }),
    [checkApiHealth, uploadRecording, resetApp]
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
