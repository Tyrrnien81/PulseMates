// API Configuration Constants
// React Native apps cannot connect to 'localhost' - they need the computer's IP address
// For Android emulator: use 10.0.2.2:4000
// For iOS simulator/device: use your computer's IP address

export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.100:4000',
  ENDPOINTS: {
    PING: '/ping',
    HEALTH: '/api/health',
    CHECKIN: '/api/checkin',
    AUDIO: '/audio',
  },
} as const;

export const getApiUrl = (endpoint: string = '') => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getAudioUrl = (audioPath: string) => {
  // If it's already a full URL, return as is
  if (audioPath.startsWith('http')) {
    return audioPath;
  }

  // If it starts with /audio, use as is
  if (audioPath.startsWith('/audio/')) {
    return `${API_CONFIG.BASE_URL}${audioPath}`;
  }

  // Otherwise, prepend /audio/
  return `${API_CONFIG.BASE_URL}/audio/${audioPath}`;
};
