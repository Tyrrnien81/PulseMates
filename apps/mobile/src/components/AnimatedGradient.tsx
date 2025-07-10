import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import { colors } from '../constants/Colors';

interface AnimatedGradientProps {
  children?: React.ReactNode;
  sentimentScore?: number; // 0 = negative, 0.5 = neutral, 1 = positive
  intensity?: 'subtle' | 'normal' | 'strong';
  speed?: 'slow' | 'normal' | 'fast';
  style?: object;
  isActive?: boolean; // Controls whether animation is running
}

export function AnimatedGradient({
  children,
  sentimentScore = 0.5,
  intensity = 'normal',
  speed = 'normal',
  style,
  isActive = true,
}: AnimatedGradientProps) {
  const breathingAnimation = useSharedValue(0);

  // Animation timing based on speed
  const animationDuration = {
    slow: 6000,
    normal: 4000,
    fast: 2500,
  }[speed];

  // Scale range based on intensity
  const scaleRange = {
    subtle: [1, 1.02],
    normal: [1, 1.05],
    strong: [1, 1.08],
  }[intensity];

  useEffect(() => {
    if (isActive) {
      breathingAnimation.value = withRepeat(
        withTiming(1, { duration: animationDuration }),
        -1,
        true
      );
    } else {
      breathingAnimation.value = withTiming(0, { duration: 500 });
    }
  }, [isActive, animationDuration, breathingAnimation]);

  // Derive colors based on sentiment score
  const backgroundColors = useDerivedValue(() => {
    // Interpolate between negative, neutral, and positive colors
    if (sentimentScore <= 0.5) {
      // Negative to neutral range (0 to 0.5)
      const progress = sentimentScore * 2; // Scale to 0-1
      return {
        primary: interpolateColor(
          progress,
          [0, 1],
          [colors.negative, colors.neutral]
        ),
        secondary: interpolateColor(progress, [0, 1], ['#fdd8e5', '#e6f3ff']),
      };
    } else {
      // Neutral to positive range (0.5 to 1)
      const progress = (sentimentScore - 0.5) * 2; // Scale to 0-1
      return {
        primary: interpolateColor(
          progress,
          [0, 1],
          [colors.neutral, colors.positive]
        ),
        secondary: interpolateColor(progress, [0, 1], ['#e6f3ff', '#e6fffa']),
      };
    }
  }, [sentimentScore]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale =
      breathingAnimation.value * (scaleRange[1] - scaleRange[0]) +
      scaleRange[0];

    return {
      transform: [{ scale }],
      backgroundColor: backgroundColors.value.primary,
      opacity: 0.1 + breathingAnimation.value * 0.05, // Subtle opacity change
    };
  });

  const secondaryLayerStyle = useAnimatedStyle(() => {
    const scale = breathingAnimation.value * 0.03 + 1; // Smaller scale for secondary layer

    return {
      transform: [{ scale }],
      backgroundColor: backgroundColors.value.secondary,
      opacity: 0.08 + breathingAnimation.value * 0.03,
    };
  });

  return (
    <View style={[styles.container, style]}>
      {/* Secondary animated layer */}
      <Animated.View
        style={[
          styles.gradientLayer,
          styles.secondaryLayer,
          secondaryLayerStyle,
        ]}
      />

      {/* Primary animated layer */}
      <Animated.View
        style={[styles.gradientLayer, styles.primaryLayer, animatedStyle]}
      />

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 2,
  },
  gradientLayer: {
    borderRadius: 12,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  primaryLayer: {
    zIndex: 1,
  },
  secondaryLayer: {
    zIndex: 0,
  },
});
