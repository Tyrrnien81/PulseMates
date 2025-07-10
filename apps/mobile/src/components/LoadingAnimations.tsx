import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../constants/Colors';
import { typography } from '../constants/Typography';
import { spacing, borderRadius } from '../constants/Layout';

interface PulsingDotsProps {
  color?: string;
  size?: number;
  speed?: 'slow' | 'normal' | 'fast';
}

export function PulsingDots({
  color = colors.primary,
  size = 8,
  speed = 'normal',
}: PulsingDotsProps) {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  const duration = speed === 'slow' ? 800 : speed === 'fast' ? 400 : 600;

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(withTiming(1, { duration }), withTiming(0, { duration })),
      -1
    );
    dot2.value = withDelay(
      duration * 0.3,
      withRepeat(
        withSequence(withTiming(1, { duration }), withTiming(0, { duration })),
        -1
      )
    );
    dot3.value = withDelay(
      duration * 0.6,
      withRepeat(
        withSequence(withTiming(1, { duration }), withTiming(0, { duration })),
        -1
      )
    );
  }, [duration, dot1, dot2, dot3]);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot1.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot1.value, [0, 1], [0.8, 1.2]) }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot2.value, [0, 1], [0.8, 1.2]) }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot3.value, [0, 1], [0.8, 1.2]) }],
  }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, width: size, height: size },
          dot1Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, width: size, height: size },
          dot2Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, width: size, height: size },
          dot3Style,
        ]}
      />
    </View>
  );
}

interface ProcessingWaveProps {
  color?: string;
  height?: number;
  isActive?: boolean;
}

export function ProcessingWave({
  color = colors.primary,
  height = 40,
  isActive = true,
}: ProcessingWaveProps) {
  const waveAnimation = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      waveAnimation.value = withRepeat(
        withTiming(1, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }
  }, [isActive, waveAnimation]);

  const bar1Style = useAnimatedStyle(() => {
    const delay = 0 * 0.1;
    const animationProgress = Math.max(
      0,
      Math.min(1, waveAnimation.value - delay)
    );

    return {
      height: interpolate(
        animationProgress,
        [0, 0.5, 1],
        [height * 0.2, height, height * 0.2]
      ),
      opacity: interpolate(animationProgress, [0, 1], [0.3, 1]),
    };
  });

  const bar2Style = useAnimatedStyle(() => {
    const delay = 1 * 0.1;
    const animationProgress = Math.max(
      0,
      Math.min(1, waveAnimation.value - delay)
    );

    return {
      height: interpolate(
        animationProgress,
        [0, 0.5, 1],
        [height * 0.2, height, height * 0.2]
      ),
      opacity: interpolate(animationProgress, [0, 1], [0.3, 1]),
    };
  });

  const bar3Style = useAnimatedStyle(() => {
    const delay = 2 * 0.1;
    const animationProgress = Math.max(
      0,
      Math.min(1, waveAnimation.value - delay)
    );

    return {
      height: interpolate(
        animationProgress,
        [0, 0.5, 1],
        [height * 0.2, height, height * 0.2]
      ),
      opacity: interpolate(animationProgress, [0, 1], [0.3, 1]),
    };
  });

  const bar4Style = useAnimatedStyle(() => {
    const delay = 3 * 0.1;
    const animationProgress = Math.max(
      0,
      Math.min(1, waveAnimation.value - delay)
    );

    return {
      height: interpolate(
        animationProgress,
        [0, 0.5, 1],
        [height * 0.2, height, height * 0.2]
      ),
      opacity: interpolate(animationProgress, [0, 1], [0.3, 1]),
    };
  });

  const bar5Style = useAnimatedStyle(() => {
    const delay = 4 * 0.1;
    const animationProgress = Math.max(
      0,
      Math.min(1, waveAnimation.value - delay)
    );

    return {
      height: interpolate(
        animationProgress,
        [0, 0.5, 1],
        [height * 0.2, height, height * 0.2]
      ),
      opacity: interpolate(animationProgress, [0, 1], [0.3, 1]),
    };
  });

  return (
    <View style={styles.waveContainer}>
      <Animated.View
        style={[styles.waveBar, { backgroundColor: color }, bar1Style]}
      />
      <Animated.View
        style={[styles.waveBar, { backgroundColor: color }, bar2Style]}
      />
      <Animated.View
        style={[styles.waveBar, { backgroundColor: color }, bar3Style]}
      />
      <Animated.View
        style={[styles.waveBar, { backgroundColor: color }, bar4Style]}
      />
      <Animated.View
        style={[styles.waveBar, { backgroundColor: color }, bar5Style]}
      />
    </View>
  );
}

interface LoadingCardProps {
  title: string;
  subtitle?: string;
  type?: 'upload' | 'processing' | 'analyzing';
  children?: React.ReactNode;
}

export function LoadingCard({
  title,
  subtitle,
  type = 'processing',
  children,
}: LoadingCardProps) {
  const cardAnimation = useSharedValue(0);
  const shimmerAnimation = useSharedValue(0);

  useEffect(() => {
    cardAnimation.value = withTiming(1, { duration: 500 });
    shimmerAnimation.value = withRepeat(withTiming(1, { duration: 1500 }), -1);
  }, [cardAnimation, shimmerAnimation]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardAnimation.value,
    transform: [
      {
        translateY: interpolate(cardAnimation.value, [0, 1], [20, 0]),
      },
    ],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(shimmerAnimation.value, [0, 1], [-100, 100]),
      },
    ],
  }));

  const getIcon = () => {
    switch (type) {
      case 'upload':
        return '📤';
      case 'analyzing':
        return '🧠';
      default:
        return '⚡';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'upload':
        return colors.info;
      case 'analyzing':
        return colors.primary;
      default:
        return colors.secondary;
    }
  };

  return (
    <Animated.View style={[styles.loadingCard, cardStyle]}>
      <View style={styles.loadingCardHeader}>
        <Text style={styles.loadingIcon}>{getIcon()}</Text>
        <View style={styles.loadingTextContainer}>
          <Text style={styles.loadingTitle}>{title}</Text>
          {subtitle && <Text style={styles.loadingSubtitle}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.loadingContent}>
        <ProcessingWave color={getColor()} height={30} />
        <PulsingDots color={getColor()} />
      </View>

      {/* Shimmer effect */}
      <View style={styles.shimmerContainer}>
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </View>

      {children}
    </Animated.View>
  );
}

interface MicroInteractionProps {
  children: React.ReactNode;
  type?: 'bounce' | 'scale' | 'fade' | 'slide';
  trigger?: boolean;
  duration?: number;
}

export function MicroInteraction({
  children,
  type = 'scale',
  trigger = false,
  duration = 300,
}: MicroInteractionProps) {
  const animation = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      animation.value = withSequence(
        withTiming(1, { duration: duration / 2 }),
        withTiming(0, { duration: duration / 2 })
      );
    }
  }, [trigger, animation, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    switch (type) {
      case 'bounce':
        return {
          transform: [
            { translateY: interpolate(animation.value, [0, 1], [0, -10]) },
          ],
        };
      case 'scale':
        return {
          transform: [
            { scale: interpolate(animation.value, [0, 1], [1, 1.05]) },
          ],
        };
      case 'fade':
        return {
          opacity: interpolate(animation.value, [0, 1], [1, 0.7]),
        };
      case 'slide':
        return {
          transform: [
            { translateX: interpolate(animation.value, [0, 1], [0, 5]) },
          ],
        };
      default:
        return {};
    }
  });

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  dot: {
    borderRadius: 50,
  },
  dotsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  loadingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    elevation: 4,
    marginVertical: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    position: 'relative',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  loadingCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  loadingSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  loadingTextContainer: {
    flex: 1,
  },
  loadingTitle: {
    ...typography.h3,
    color: colors.text,
  },
  shimmer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 50,
  },
  shimmerContainer: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  waveBar: {
    borderRadius: borderRadius.sm,
    width: 4,
  },
  waveContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.xs,
    height: 50,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
});
