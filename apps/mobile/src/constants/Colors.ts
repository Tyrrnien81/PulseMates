export const colors = {
  // Primary colors with the specified blue
  primary: '#60758a',
  primaryLight: '#8fa3b3',
  primaryDark: '#4a5d6e',
  secondary: '#a8c7e8',

  // Light color scheme
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceLight: '#fefefe',

  // Text colors - keeping them readable but softer
  text: '#2d3748',
  textSecondary: '#718096',
  textLight: '#a0aec0',

  // Sentiment colors (lighter variants)
  positive: '#68d391',
  neutral: '#90cdf4',
  negative: '#fbb6ce',

  // Gradients for different moods
  backgroundGradient: ['#f7fafc', '#edf2f7'],
  positiveGradient: ['#c6f6d5', '#9ae6b4'],
  neutralGradient: ['#bee3f8', '#90cdf4'],
  negativeGradient: ['#fed7e2', '#fbb6ce'],

  // UI colors
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  shadow: '#1a202c',

  // Status colors
  success: '#68d391',
  warning: '#f6e05e',
  error: '#fc8181',
  info: '#63b3ed',

  // Recording specific
  recording: '#ed64a6',
  recordingLight: '#f687b3',

  // Audio player
  audioProgress: '#60758a',
  audioBackground: '#e2e8f0',
};

export type ColorKey = keyof typeof colors;
