import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { typography } from '../constants/Typography';
import { spacing, borderRadius } from '../constants/Layout';
import { Button } from './ui/Button';
import { useSentimentTheme } from '../context/SentimentThemeProvider';

export interface BreathingGuideProps {
  sentimentScore?: number;
  onComplete?: () => void;
  style?: object;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

interface BreathingPattern {
  inhale: number;
  hold: number;
  exhale: number;
  pause: number;
  cycles: number;
  name: string;
  description: string;
}

export function BreathingGuide({
  sentimentScore = 0.5,
  onComplete,
  style,
}: BreathingGuideProps) {
  const { theme } = useSentimentTheme();
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('pause');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Animations
  const circleScale = useRef(new Animated.Value(0.8)).current;
  const circleOpacity = useRef(new Animated.Value(0.8)).current;
  const backgroundPulse = useRef(new Animated.Value(1)).current;

  // Get breathing pattern based on sentiment
  const getBreathingPattern = (sentiment: number): BreathingPattern => {
    if (sentiment < 0.4) {
      // Stressed/anxious - calming 4-7-8 pattern
      return {
        inhale: 4,
        hold: 5,
        exhale: 8,
        pause: 2,
        cycles: 4,
        name: 'Calming Breath',
        description: 'Deep breathing to calm your nervous system',
      };
    } else if (sentiment < 0.7) {
      // Neutral - balanced 4-4-6 pattern
      return {
        inhale: 4,
        hold: 4,
        exhale: 6,
        pause: 2,
        cycles: 5,
        name: 'Balanced Breath',
        description: 'Steady breathing for mental balance',
      };
    } else {
      // Positive - energizing 4-4-4 pattern
      return {
        inhale: 4,
        hold: 2,
        exhale: 4,
        pause: 1,
        cycles: 6,
        name: 'Energizing Breath',
        description: 'Rhythmic breathing to maintain positive energy',
      };
    }
  };

  const pattern = getBreathingPattern(sentimentScore);

  const startBreathing = () => {
    setIsActive(true);
    setCurrentCycle(0);
    setPhaseIndex(0);
    setCurrentPhase('inhale');
    setTimeRemaining(pattern.inhale);
  };

  const stopBreathing = () => {
    setIsActive(false);
    setCurrentPhase('pause');
    setCurrentCycle(0);

    // Reset animations
    Animated.parallel([
      Animated.timing(circleScale, {
        toValue: 0.8,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(circleOpacity, {
        toValue: 0.8,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundPulse, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Phase management
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phases = React.useMemo(
    () => ['inhale', 'hold', 'exhale', 'pause'] as BreathingPhase[],
    []
  );

  // Timer effect for countdown
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;

    const timer = setTimeout(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isActive, timeRemaining]);

  // Phase transition effect
  useEffect(() => {
    if (!isActive) return;
    if (timeRemaining > 0) return;

    // Move to next phase
    const nextPhaseIndex = (phaseIndex + 1) % phases.length;

    // Check if we completed a full cycle
    if (nextPhaseIndex === 0) {
      const nextCycle = currentCycle + 1;
      setCurrentCycle(nextCycle);

      if (nextCycle >= pattern.cycles) {
        setIsActive(false);
        setCurrentPhase('pause');
        setPhaseIndex(0);
        onComplete?.();
        return;
      }
    }

    // Update to next phase
    setPhaseIndex(nextPhaseIndex);
    const nextPhase = phases[nextPhaseIndex];
    setCurrentPhase(nextPhase);
    setTimeRemaining(pattern[nextPhase]);
  }, [
    isActive,
    timeRemaining,
    phaseIndex,
    currentCycle,
    pattern.cycles,
    pattern,
    phases,
    onComplete,
  ]);

  // Animation effect
  useEffect(() => {
    if (!isActive) return;

    const animationDuration = pattern[currentPhase] * 1000;

    switch (currentPhase) {
      case 'inhale':
        Animated.parallel([
          Animated.timing(circleScale, {
            toValue: 1.4,
            duration: animationDuration,
            useNativeDriver: true,
          }),
          Animated.timing(circleOpacity, {
            toValue: 0.9,
            duration: animationDuration,
            useNativeDriver: true,
          }),
          Animated.timing(backgroundPulse, {
            toValue: 1.05,
            duration: animationDuration,
            useNativeDriver: true,
          }),
        ]).start();
        break;

      case 'hold':
        // Maintain current size during hold
        break;

      case 'exhale':
        Animated.parallel([
          Animated.timing(circleScale, {
            toValue: 0.8,
            duration: animationDuration,
            useNativeDriver: true,
          }),
          Animated.timing(circleOpacity, {
            toValue: 0.8,
            duration: animationDuration,
            useNativeDriver: true,
          }),
          Animated.timing(backgroundPulse, {
            toValue: 1,
            duration: animationDuration,
            useNativeDriver: true,
          }),
        ]).start();
        break;

      case 'pause':
        // Brief pause between cycles
        break;
    }
  }, [
    currentPhase,
    isActive,
    pattern,
    circleScale,
    circleOpacity,
    backgroundPulse,
  ]);

  const getPhaseInstruction = (phase: BreathingPhase): string => {
    if (!isActive) return 'Ready';

    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'pause':
        return 'Rest';
      default:
        return 'Ready';
    }
  };

  const getPhaseColor = (phase: BreathingPhase): string => {
    switch (phase) {
      case 'inhale':
        return theme.primary || '#4CAF50';
      case 'hold':
        return theme.secondary || '#FF9800';
      case 'exhale':
        return theme.accent || '#2196F3';
      default:
        return (theme.primary || '#4CAF50') + '40'; // Semi-transparent primary for pause
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.surfaceLight,
          transform: [{ scale: backgroundPulse }],
        },
        style,
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {pattern.name}
        </Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {pattern.description}
        </Text>
      </View>

      <View style={styles.breathingArea}>
        {/* Breathing Circle */}
        <View style={styles.circleContainer}>
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                backgroundColor: isActive
                  ? getPhaseColor(currentPhase)
                  : (theme.primary || '#4CAF50') + '20',
                borderColor: theme.primary || '#4CAF50',
                transform: [{ scale: circleScale }],
                opacity: circleOpacity,
              },
            ]}
          >
            {/* Center Content */}
            <View style={styles.centerContent}>
              <Text style={[styles.phaseText, { color: theme.text || '#333' }]}>
                {getPhaseInstruction(currentPhase)}
              </Text>
              {isActive && (
                <Text
                  style={[
                    styles.timerText,
                    { color: theme.textSecondary || '#666' },
                  ]}
                >
                  {timeRemaining}s
                </Text>
              )}
            </View>
          </Animated.View>
        </View>

        {/* Progress Info */}
        {isActive && (
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
              Cycle {currentCycle + 1} of {pattern.cycles}
            </Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {!isActive ? (
          <Button
            title="Start Breathing Exercise"
            onPress={startBreathing}
            variant="primary"
            size="large"
            style={styles.controlButton}
          />
        ) : (
          <Button
            title="Stop Exercise"
            onPress={stopBreathing}
            variant="outline"
            size="large"
            style={styles.controlButton}
          />
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  breathingArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  breathingCircle: {
    alignItems: 'center',
    borderRadius: 75,
    borderWidth: 3,
    height: 150,
    justifyContent: 'center',
    width: 150,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    alignItems: 'center',
    height: 170,
    justifyContent: 'center',
    marginVertical: spacing.md,
    width: 170,
  },
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  controlButton: {
    minWidth: 200,
  },
  controls: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  phaseText: {
    ...typography.h2,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  progressInfo: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  progressText: {
    ...typography.bodySmall,
  },
  timerText: {
    ...typography.h3,
    marginTop: spacing.xs,
  },
  title: {
    ...typography.h2,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
