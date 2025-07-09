import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/Colors';
import { spacing, borderRadius } from '../constants/Layout';

export interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.sm,
  style,
}: SkeletonLoaderProps) {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnimation]);

  const shimmerTranslate = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            opacity: shimmerOpacity,
            transform: [{ translateX: shimmerTranslate }],
          },
        ]}
      />
    </View>
  );
}

// Preset skeleton components for common use cases
export function TranscriptSkeleton() {
  return (
    <View style={styles.transcriptSkeletonContainer}>
      <SkeletonLoader width="80%" height={24} style={styles.titleSkeleton} />
      <View style={styles.textLinesSkeleton}>
        <SkeletonLoader width="100%" height={16} />
        <SkeletonLoader width="95%" height={16} />
        <SkeletonLoader width="88%" height={16} />
        <SkeletonLoader width="92%" height={16} />
        <SkeletonLoader width="85%" height={16} />
        <SkeletonLoader width="90%" height={16} />
        <SkeletonLoader width="75%" height={16} />
      </View>
      <SkeletonLoader
        width="40%"
        height={14}
        style={styles.confidenceSkeleton}
      />
    </View>
  );
}

export function SentimentSkeleton() {
  return (
    <View style={styles.sentimentSkeletonContainer}>
      <SkeletonLoader width="60%" height={24} style={styles.titleSkeleton} />
      <SkeletonLoader width="50%" height={20} style={styles.labelSkeleton} />
      <SkeletonLoader width="100%" height={12} style={styles.meterSkeleton} />
      <SkeletonLoader
        width="35%"
        height={14}
        style={styles.confidenceSkeleton}
      />
    </View>
  );
}

export function CoachingSkeleton() {
  return (
    <View style={styles.coachingSkeletonContainer}>
      <SkeletonLoader width="70%" height={24} style={styles.titleSkeleton} />
      <View style={styles.textLinesSkeleton}>
        <SkeletonLoader width="100%" height={16} />
        <SkeletonLoader width="85%" height={16} />
        <SkeletonLoader width="92%" height={16} />
      </View>
      <SkeletonLoader width="30%" height={36} style={styles.buttonSkeleton} />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonSkeleton: {
    marginTop: spacing.md,
  },
  coachingSkeletonContainer: {
    padding: spacing.lg,
  },
  confidenceSkeleton: {
    marginTop: spacing.sm,
  },
  labelSkeleton: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  meterSkeleton: {
    marginBottom: spacing.sm,
  },
  sentimentSkeletonContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  shimmer: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    height: '100%',
    opacity: 0.3,
    width: '30%',
  },
  skeleton: {
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  textLinesSkeleton: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  titleSkeleton: {
    marginBottom: spacing.sm,
  },
  transcriptSkeletonContainer: {
    padding: spacing.lg,
  },
});
