import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  runOnJS,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { spacing } from '../constants/Layout';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PageWrapperProps {
  children: React.ReactNode;
  transitionType?: 'slide' | 'fade' | 'zoom' | 'scale';
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  isEntering?: boolean;
}

export function PageWrapper({
  children,
  transitionType = 'slide',
  direction = 'right',
  duration = 300,
  isEntering = true,
}: PageWrapperProps) {
  const getEnteringAnimation = () => {
    switch (transitionType) {
      case 'slide':
        return direction === 'left'
          ? SlideInLeft.duration(duration)
          : SlideInRight.duration(duration);
      case 'fade':
        return FadeIn.duration(duration);
      case 'zoom':
        return ZoomIn.duration(duration);
      case 'scale':
        return ZoomIn.duration(duration).springify();
      default:
        return SlideInRight.duration(duration);
    }
  };

  const getExitingAnimation = () => {
    switch (transitionType) {
      case 'slide':
        return direction === 'left'
          ? SlideOutLeft.duration(duration)
          : SlideOutRight.duration(duration);
      case 'fade':
        return FadeOut.duration(duration);
      case 'zoom':
        return ZoomOut.duration(duration);
      case 'scale':
        return ZoomOut.duration(duration).springify();
      default:
        return SlideOutLeft.duration(duration);
    }
  };

  return (
    <Animated.View
      style={styles.pageContainer}
      entering={isEntering ? getEnteringAnimation() : undefined}
      exiting={getExitingAnimation()}
    >
      {children}
    </Animated.View>
  );
}

interface SlideTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  onAnimationComplete?: () => void;
  fromDirection?: 'left' | 'right' | 'top' | 'bottom';
}

export function SlideTransition({
  children,
  isVisible,
  onAnimationComplete,
  fromDirection = 'right',
}: SlideTransitionProps) {
  const translateX = useSharedValue(
    fromDirection === 'left' ? -screenWidth : screenWidth
  );
  const translateY = useSharedValue(
    fromDirection === 'top' ? -screenHeight : screenHeight
  );
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      const targetX =
        fromDirection === 'left'
          ? -screenWidth
          : fromDirection === 'right'
            ? screenWidth
            : 0;
      const targetY =
        fromDirection === 'top'
          ? -screenHeight
          : fromDirection === 'bottom'
            ? screenHeight
            : 0;

      translateX.value = withTiming(targetX, { duration: 300 });
      translateY.value = withTiming(targetY, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 }, () => {
        if (onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      });
    }
  }, [
    isVisible,
    translateX,
    translateY,
    opacity,
    fromDirection,
    onAnimationComplete,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: ['left', 'right'].includes(fromDirection)
          ? translateX.value
          : 0,
      },
      {
        translateY: ['top', 'bottom'].includes(fromDirection)
          ? translateY.value
          : 0,
      },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.transitionContainer, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

interface SuccessAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
  children?: React.ReactNode;
}

export function SuccessAnimation({
  isVisible,
  onComplete,
  children,
}: SuccessAnimationProps) {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      // Sequence of animations for success feedback
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      rotation.value = withSpring(360, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto-hide after showing
      setTimeout(() => {
        scale.value = withSpring(0, { damping: 15, stiffness: 150 });
        opacity.value = withTiming(0, { duration: 300 }, () => {
          if (onComplete) {
            runOnJS(onComplete)();
          }
        });
      }, 2000);
    }
  }, [isVisible, scale, rotation, opacity, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
  }));

  if (!isVisible) return null;

  return (
    <View style={styles.successOverlay}>
      <Animated.View style={[styles.successContainer, animatedStyle]}>
        {children || <View style={styles.defaultSuccess} />}
      </Animated.View>
    </View>
  );
}

interface ProgressTransitionProps {
  progress: number; // 0 to 1
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
}

export function ProgressTransition({
  progress,
  children,
  direction = 'horizontal',
}: ProgressTransitionProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const translateValue = interpolate(
      progress,
      [0, 1],
      direction === 'horizontal' ? [-screenWidth, 0] : [-screenHeight, 0]
    );

    return {
      transform: [
        direction === 'horizontal'
          ? { translateX: translateValue }
          : { translateY: translateValue },
      ],
      opacity: interpolate(progress, [0, 0.3, 1], [0, 0.5, 1]),
    };
  });

  return (
    <Animated.View style={[styles.progressContainer, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

interface CardStackProps {
  cards: React.ReactNode[];
  currentIndex: number;
  onSwipe?: (direction: 'left' | 'right') => void;
}

export function CardStack({
  cards,
  currentIndex,
  onSwipe: _onSwipe,
}: CardStackProps) {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Reset position when index changes
    translateX.value = withSpring(0);
    scale.value = withSpring(1);
  }, [currentIndex, translateX, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          Math.abs(translateX.value),
          [0, screenWidth * 0.5],
          [0.9, 1]
        ),
      },
    ],
    opacity: interpolate(
      Math.abs(translateX.value),
      [0, screenWidth * 0.3],
      [0.5, 1]
    ),
  }));

  return (
    <View style={styles.cardStackContainer}>
      {/* Next card (behind) */}
      {currentIndex + 1 < cards.length && (
        <Animated.View
          style={[styles.stackCard, styles.nextCard, nextCardStyle]}
        >
          {cards[currentIndex + 1]}
        </Animated.View>
      )}

      {/* Current card (front) */}
      <Animated.View
        style={[styles.stackCard, styles.currentCard, animatedStyle]}
      >
        {cards[currentIndex]}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardStackContainer: {
    flex: 1,
    position: 'relative',
  },
  currentCard: {
    zIndex: 2,
  },
  defaultSuccess: {
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    height: 60,
    width: 60,
  },
  nextCard: {
    zIndex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  progressContainer: {
    flex: 1,
  },
  stackCard: {
    bottom: 0,
    left: 0,
    margin: spacing.md,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  successContainer: {
    alignItems: 'center',
    height: 100,
    justifyContent: 'center',
    width: 100,
  },
  successOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  transitionContainer: {
    flex: 1,
  },
});
