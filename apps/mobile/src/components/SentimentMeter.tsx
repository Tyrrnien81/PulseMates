import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../constants/Colors';
import { typography } from '../constants/Typography';
import { spacing } from '../constants/Layout';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface SentimentMeterProps {
  score: number; // 0 to 1
  confidence: number; // 0 to 1
  label: string;
  size?: number;
  strokeWidth?: number;
  showDetails?: boolean;
  customColors?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  style?: object;
}

export function SentimentMeter({
  score,
  confidence,
  label,
  size = 120,
  strokeWidth = 8,
  showDetails = true,
  customColors,
  style,
}: SentimentMeterProps) {
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    // Animate progress
    Animated.timing(progressAnimation, {
      toValue: score,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    // Pulse animation for low confidence
    if (confidence < 0.6) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [score, confidence, progressAnimation, pulseAnimation]);

  const getSentimentColor = (sentimentScore: number) => {
    if (customColors) {
      // Use theme colors when provided
      if (sentimentScore >= 0.7) return customColors.primary;
      if (sentimentScore >= 0.4) return customColors.secondary;
      return colors.info;
    }

    // Default colors
    if (sentimentScore >= 0.7) return colors.success;
    if (sentimentScore >= 0.4) return colors.warning;
    return colors.info;
  };

  const getSentimentLevel = (sentimentScore: number) => {
    if (sentimentScore >= 0.8) return 'Very Positive';
    if (sentimentScore >= 0.6) return 'Positive';
    if (sentimentScore >= 0.4) return 'Neutral';
    if (sentimentScore >= 0.2) return 'Negative';
    return 'Very Negative';
  };

  const getConfidenceText = (confidenceScore: number) => {
    if (confidenceScore >= 0.8) return 'High Confidence';
    if (confidenceScore >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const sentimentColor = getSentimentColor(score);
  const sentimentLevel = getSentimentLevel(score);
  const confidenceText = getConfidenceText(confidence);

  // Calculate stroke dash for progress
  const strokeDasharray = circumference;
  const animatedStrokeDashoffset = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, circumference * 0.2], // Show 80% max progress for visual balance
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: pulseAnimation }] },
        style,
      ]}
    >
      <View style={styles.meterContainer}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={customColors?.border || colors.borderLight}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />

          {/* Progress circle */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={sentimentColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={animatedStrokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>

        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={[styles.scoreText, { color: sentimentColor }]}>
            {Math.round(score * 100)}%
          </Text>
          <Text
            style={[
              styles.labelText,
              { color: customColors?.textSecondary || colors.textSecondary },
            ]}
          >
            {label}
          </Text>
        </View>
      </View>

      {showDetails && (
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                { color: customColors?.textSecondary || colors.textSecondary },
              ]}
            >
              Mood Level:
            </Text>
            <Text style={[styles.detailValue, { color: sentimentColor }]}>
              {sentimentLevel}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                { color: customColors?.textSecondary || colors.textSecondary },
              ]}
            >
              Analysis:
            </Text>
            <Text
              style={[
                styles.detailValue,
                { color: confidence >= 0.6 ? colors.success : colors.warning },
              ]}
            >
              {confidenceText}
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

// Compact version for smaller spaces
// Simple progress bar version for cleaner UI
export function SimpleSentimentBar({
  score,
  confidence,
  label: _label,
  customColors,
  style,
}: Pick<
  SentimentMeterProps,
  'score' | 'confidence' | 'label' | 'customColors' | 'style'
>) {
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: score,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [score, progressAnimation]);

  const getSentimentColor = (sentimentScore: number) => {
    if (customColors) {
      if (sentimentScore >= 0.7) return customColors.primary;
      if (sentimentScore >= 0.4) return customColors.secondary;
      return colors.info;
    }

    if (sentimentScore >= 0.7) return colors.success;
    if (sentimentScore >= 0.4) return colors.warning;
    return colors.info;
  };

  const getSentimentLevel = (sentimentScore: number) => {
    if (sentimentScore >= 0.8) return 'Very Positive';
    if (sentimentScore >= 0.6) return 'Positive';
    if (sentimentScore >= 0.4) return 'Neutral';
    if (sentimentScore >= 0.2) return 'Negative';
    return 'Very Negative';
  };

  const sentimentColor = getSentimentColor(score);
  const sentimentLevel = getSentimentLevel(score);

  const animatedWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.simpleContainer, style]}>
      <View style={styles.simpleHeader}>
        <Text style={[styles.simpleSentimentText, { color: sentimentColor }]}>
          {sentimentLevel}
        </Text>
        <Text style={[styles.simpleScoreText, { color: sentimentColor }]}>
          {Math.round(score * 100)}%
        </Text>
      </View>

      <View
        style={[
          styles.progressBarBackground,
          { backgroundColor: customColors?.border || colors.borderLight },
        ]}
      >
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: sentimentColor,
              width: animatedWidth,
            },
          ]}
        />
      </View>

      <Text
        style={[
          styles.simpleConfidenceText,
          { color: customColors?.textSecondary || colors.textSecondary },
        ]}
      >
        Analysis confidence: {Math.round(confidence * 100)}%
      </Text>
    </View>
  );
}

export function CompactSentimentMeter({
  score,
  confidence,
  label,
  size = 60,
}: Omit<SentimentMeterProps, 'showDetails' | 'style' | 'strokeWidth'>) {
  return (
    <SentimentMeter
      score={score}
      confidence={confidence}
      label={label}
      size={size}
      strokeWidth={4}
      showDetails={false}
      style={styles.compactContainer}
    />
  );
}

const styles = StyleSheet.create({
  centerContent: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  compactContainer: {
    marginVertical: spacing.xs,
  },
  container: {
    alignItems: 'center',
  },
  detailLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.bodySmall,
    flex: 2,
    fontWeight: '600',
    textAlign: 'right',
  },
  details: {
    marginTop: spacing.md,
    width: '100%',
  },
  labelText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  meterContainer: {
    position: 'relative',
  },
  progressBarBackground: {
    borderRadius: 8,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    borderRadius: 8,
    height: '100%',
  },
  scoreText: {
    ...typography.h2,
    fontWeight: 'bold',
  },
  simpleConfidenceText: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  simpleContainer: {
    width: '100%',
  },
  simpleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  simpleScoreText: {
    ...typography.h4,
    fontWeight: 'bold',
  },
  simpleSentimentText: {
    ...typography.h4,
    fontWeight: '600',
  },
  svg: {
    transform: [{ rotate: '180deg' }], // Start from top
  },
});
