import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/Colors';
import { typography } from '../constants/Typography';
import { spacing, borderRadius } from '../constants/Layout';

export interface ConfidenceIndicatorProps {
  confidence: number; // 0 to 1
  type?: 'transcript' | 'sentiment';
  showDetails?: boolean;
  style?: object;
}

export function ConfidenceIndicator({
  confidence,
  type = 'transcript',
  showDetails = true,
  style,
}: ConfidenceIndicatorProps) {
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const confidencePercentage = Math.round(confidence * 100);

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: confidence,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [confidence, progressAnimation]);

  const getConfidenceLevel = (score: number) => {
    if (score >= 0.8) return 'excellent';
    if (score >= 0.6) return 'good';
    if (score >= 0.4) return 'fair';
    return 'poor';
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return colors.success;
    if (score >= 0.6) return colors.warning;
    return colors.error;
  };

  const getConfidenceIcon = (score: number) => {
    if (score >= 0.8) return '✅';
    if (score >= 0.6) return '⚠️';
    return '❌';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  };

  const getConfidenceMessage = (score: number, type: string) => {
    const level = getConfidenceLevel(score);

    if (type === 'transcript') {
      switch (level) {
        case 'excellent':
          return 'Clear audio quality, highly accurate transcription';
        case 'good':
          return 'Good audio quality, reliable transcription';
        case 'fair':
          return 'Some audio issues, transcription may have minor errors';
        case 'poor':
          return 'Poor audio quality, consider re-recording for better results';
      }
    } else {
      switch (level) {
        case 'excellent':
          return 'Strong emotional indicators, highly reliable analysis';
        case 'good':
          return 'Clear emotional patterns, confident analysis';
        case 'fair':
          return 'Mixed emotional signals, analysis may vary';
        case 'poor':
          return 'Unclear emotional context, analysis uncertainty high';
      }
    }
  };

  const getSuggestion = (score: number, type: string) => {
    const level = getConfidenceLevel(score);

    if (level === 'poor') {
      return type === 'transcript'
        ? '💡 Try recording in a quieter environment'
        : '💡 Share more specific details about your feelings';
    }
    if (level === 'fair') {
      return type === 'transcript'
        ? '💡 Speak clearly and avoid background noise'
        : '💡 Consider describing your emotions in more detail';
    }
    return null;
  };

  const confidenceColor = getConfidenceColor(confidence);
  const confidenceLabel = getConfidenceLabel(confidence);
  const confidenceIcon = getConfidenceIcon(confidence);
  const confidenceMessage = getConfidenceMessage(confidence, type);
  const suggestion = getSuggestion(confidence, type);

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <Text style={styles.icon}>{confidenceIcon}</Text>
          <Text style={styles.label}>Confidence: </Text>
          <Text style={[styles.value, { color: confidenceColor }]}>
            {confidenceLabel} ({confidencePercentage}%)
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: confidenceColor,
              },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>0%</Text>
          <Text style={styles.progressLabel}>50%</Text>
          <Text style={styles.progressLabel}>100%</Text>
        </View>
      </View>

      {/* Details */}
      {showDetails && (
        <View style={styles.details}>
          <Text style={styles.message}>{confidenceMessage}</Text>
          {suggestion && (
            <View style={styles.suggestionContainer}>
              <Text style={styles.suggestion}>{suggestion}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// Compact version for smaller spaces
export function CompactConfidenceIndicator({
  confidence,
}: Omit<ConfidenceIndicatorProps, 'showDetails' | 'style' | 'type'>) {
  const confidencePercentage = Math.round(confidence * 100);
  const confidenceColor =
    confidence >= 0.8
      ? colors.success
      : confidence >= 0.6
        ? colors.warning
        : colors.error;
  const confidenceIcon =
    confidence >= 0.8 ? '✅' : confidence >= 0.6 ? '⚠️' : '❌';

  return (
    <View style={styles.compactContainer}>
      <Text style={styles.compactIcon}>{confidenceIcon}</Text>
      <Text style={styles.compactLabel}>
        <Text style={[styles.compactValue, { color: confidenceColor }]}>
          {confidencePercentage}%
        </Text>
        <Text style={styles.compactText}> confidence</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  compactIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  compactLabel: {
    ...typography.caption,
  },
  compactText: {
    color: colors.textSecondary,
  },
  compactValue: {
    fontWeight: '600',
  },
  container: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  details: {
    marginTop: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  labelContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  message: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 18,
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressFill: {
    borderRadius: borderRadius.sm,
    height: '100%',
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    height: 8,
    width: '100%',
  },
  suggestion: {
    ...typography.caption,
    color: colors.info,
    fontStyle: 'italic',
  },
  suggestionContainer: {
    backgroundColor: colors.background,
    borderLeftColor: colors.info,
    borderLeftWidth: 3,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  value: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
});
