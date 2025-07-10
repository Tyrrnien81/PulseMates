import { colors as baseColors } from './Colors';

export interface SentimentTheme {
  // Primary colors that change based on sentiment
  primary: string;
  secondary: string;
  accent: string;

  // Background colors
  background: string;
  surface: string;
  surfaceLight: string;

  // Gradient colors
  gradientStart: string;
  gradientEnd: string;

  // Text colors
  text: string;
  textSecondary: string;

  // Status colors (these remain consistent)
  success: string;
  warning: string;
  error: string;
  info: string;

  // Border colors
  border: string;
  borderLight: string;
}

// Positive sentiment theme (70%+ score)
export const positiveTheme: SentimentTheme = {
  primary: '#10B981', // Emerald green
  secondary: '#06B6D4', // Sky blue
  accent: '#34D399', // Light emerald

  background: '#F0FDF4', // Very light green
  surface: '#FFFFFF',
  surfaceLight: '#F7FEF7', // Subtle green tint

  gradientStart: '#10B981',
  gradientEnd: '#06B6D4',

  text: '#065F46', // Dark green
  textSecondary: '#047857', // Medium green

  success: baseColors.success,
  warning: baseColors.warning,
  error: baseColors.error,
  info: baseColors.info,

  border: '#A7F3D0', // Light green border
  borderLight: '#D1FAE5',
};

// Neutral sentiment theme (40-69% score)
export const neutralTheme: SentimentTheme = {
  primary: '#6366F1', // Indigo (original)
  secondary: '#8B5CF6', // Purple
  accent: '#A78BFA', // Light purple

  background: '#F8FAFC', // Original background
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9', // Light slate

  gradientStart: '#6366F1',
  gradientEnd: '#8B5CF6',

  text: '#1E293B', // Original text
  textSecondary: '#64748B',

  success: baseColors.success,
  warning: baseColors.warning,
  error: baseColors.error,
  info: baseColors.info,

  border: '#E2E8F0', // Original border
  borderLight: '#F1F5F9',
};

// Negative sentiment theme (<40% score) - calming, supportive colors
export const negativeTheme: SentimentTheme = {
  primary: '#8B5CF6', // Soft purple
  secondary: '#F59E0B', // Warm amber
  accent: '#C084FC', // Light purple

  background: '#FEF7FF', // Very light purple
  surface: '#FFFFFF',
  surfaceLight: '#FAF5FF', // Subtle purple tint

  gradientStart: '#8B5CF6',
  gradientEnd: '#F59E0B',

  text: '#581C87', // Dark purple
  textSecondary: '#7C3AED', // Medium purple

  success: baseColors.success,
  warning: baseColors.warning,
  error: baseColors.error,
  info: baseColors.info,

  border: '#DDD6FE', // Light purple border
  borderLight: '#EDE9FE',
};

export type SentimentLevel = 'positive' | 'neutral' | 'negative';

export function getSentimentLevel(score: number): SentimentLevel {
  if (score >= 0.7) return 'positive';
  if (score >= 0.4) return 'neutral';
  return 'negative';
}

export function getThemeForSentiment(score: number): SentimentTheme {
  const level = getSentimentLevel(score);

  switch (level) {
    case 'positive':
      return positiveTheme;
    case 'negative':
      return negativeTheme;
    default:
      return neutralTheme;
  }
}

// Theme transition animations
export const themeTransition = {
  duration: 800, // ms
  easing: 'ease-in-out',
};

// Helper function to interpolate between themes
export function interpolateTheme(
  fromTheme: SentimentTheme,
  toTheme: SentimentTheme,
  progress: number
): SentimentTheme {
  const interpolateColor = (from: string, to: string, t: number): string => {
    // Simple color interpolation - in a real app you might want to use a color library
    return t > 0.5 ? to : from;
  };

  return {
    primary: interpolateColor(fromTheme.primary, toTheme.primary, progress),
    secondary: interpolateColor(
      fromTheme.secondary,
      toTheme.secondary,
      progress
    ),
    accent: interpolateColor(fromTheme.accent, toTheme.accent, progress),
    background: interpolateColor(
      fromTheme.background,
      toTheme.background,
      progress
    ),
    surface: interpolateColor(fromTheme.surface, toTheme.surface, progress),
    surfaceLight: interpolateColor(
      fromTheme.surfaceLight,
      toTheme.surfaceLight,
      progress
    ),
    gradientStart: interpolateColor(
      fromTheme.gradientStart,
      toTheme.gradientStart,
      progress
    ),
    gradientEnd: interpolateColor(
      fromTheme.gradientEnd,
      toTheme.gradientEnd,
      progress
    ),
    text: interpolateColor(fromTheme.text, toTheme.text, progress),
    textSecondary: interpolateColor(
      fromTheme.textSecondary,
      toTheme.textSecondary,
      progress
    ),
    success: fromTheme.success, // Status colors remain constant
    warning: fromTheme.warning,
    error: fromTheme.error,
    info: fromTheme.info,
    border: interpolateColor(fromTheme.border, toTheme.border, progress),
    borderLight: interpolateColor(
      fromTheme.borderLight,
      toTheme.borderLight,
      progress
    ),
  };
}
