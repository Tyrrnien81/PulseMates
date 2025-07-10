import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { colors } from '../constants/Colors';
import { typography } from '../constants/Typography';
import { spacing, borderRadius } from '../constants/Layout';
import { CheckinResponse } from '../services/api';

// Types for coaching data
type CoachingData = CheckinResponse['coaching'];
type ResourceCategory = 'counseling' | 'meditation' | 'emergency';

interface CoachingCardsProps {
  coaching: CoachingData;
  sentimentScore?: number;
}

interface BreathingExerciseCardProps {
  exercise: CoachingData['breathingExercise'];
  sentimentScore?: number;
}

interface StretchExerciseCardProps {
  exercise: CoachingData['stretchExercise'];
}

interface ResourcesCardProps {
  resources: CoachingData['resources'];
}

// Resource category styling
const getCategoryStyles = (category: ResourceCategory) => {
  switch (category) {
    case 'emergency':
      return {
        backgroundColor: colors.error + '15',
        borderColor: colors.error,
        iconColor: colors.error,
        icon: '🚨',
      };
    case 'counseling':
      return {
        backgroundColor: colors.primary + '15',
        borderColor: colors.primary,
        iconColor: colors.primary,
        icon: '💬',
      };
    case 'meditation':
      return {
        backgroundColor: colors.success + '15',
        borderColor: colors.success,
        iconColor: colors.success,
        icon: '🧘',
      };
    default:
      return {
        backgroundColor: colors.surfaceLight,
        borderColor: colors.border,
        iconColor: colors.text,
        icon: '📋',
      };
  }
};

// Breathing Exercise Card with Enhanced Timer
export function BreathingExerciseCard({
  exercise,
  sentimentScore,
}: BreathingExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Get sentiment-specific messaging
  const getSentimentMessage = (score?: number) => {
    if (!score) return 'Take a moment to focus on your breathing';
    if (score < 0.4) return "Let's calm your mind with guided breathing";
    if (score < 0.7) return 'Center yourself with mindful breathing';
    return 'Energize your positive mood with rhythmic breathing';
  };

  const startExercise = () => {
    setIsActive(true);
    setIsExpanded(true);
  };

  return (
    <Card variant="elevated" padding="lg" style={styles.exerciseCard}>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.cardHeader}
      >
        <View style={styles.headerContent}>
          <Text style={styles.cardIcon}>💨</Text>
          <View style={styles.headerText}>
            <Text style={styles.cardTitle}>{exercise.title}</Text>
            <Text style={styles.cardSubtitle}>
              {getSentimentMessage(sentimentScore)}
            </Text>
          </View>
        </View>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.durationText}>
            Duration: {Math.floor(exercise.duration / 60)}:
            {(exercise.duration % 60).toString().padStart(2, '0')} minutes
          </Text>

          <View style={styles.instructionsContainer}>
            {exercise.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>{index + 1}</Text>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>

          <Button
            title={isActive ? 'Continue Breathing' : 'Start Exercise'}
            onPress={startExercise}
            variant="primary"
            style={styles.exerciseButton}
          />
        </View>
      )}
    </Card>
  );
}

// Stretch Exercise Card
export function StretchExerciseCard({ exercise }: StretchExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card variant="elevated" padding="lg" style={styles.exerciseCard}>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.cardHeader}
      >
        <View style={styles.headerContent}>
          <Text style={styles.cardIcon}>🤸</Text>
          <View style={styles.headerText}>
            <Text style={styles.cardTitle}>{exercise.title}</Text>
            <Text style={styles.cardSubtitle}>
              Gentle stretches to release tension
            </Text>
          </View>
        </View>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.instructionsContainer}>
            {exercise.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>{index + 1}</Text>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>

          {exercise.imageUrl && (
            <Text style={styles.imageNote}>
              💡 Visual guide available in the full app
            </Text>
          )}

          <Button
            title="Start Stretching"
            onPress={() =>
              Alert.alert(
                'Stretch Guide',
                'Follow the steps above at your own pace. Take deep breaths throughout each stretch.'
              )
            }
            variant="outline"
            style={styles.exerciseButton}
          />
        </View>
      )}
    </Card>
  );
}

// Resources Card with Categorized Links
export function ResourcesCard({ resources }: ResourcesCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleResourcePress = async (url: string, title: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Cannot Open Link',
          `Unable to open ${title}. Please visit: ${url}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${title}. Please visit: ${url}`, [
        { text: 'OK' },
      ]);
    }
  };

  // Group resources by category
  const groupedResources = resources.reduce(
    (acc, resource) => {
      const category = resource.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(resource);
      return acc;
    },
    {} as Record<string, typeof resources>
  );

  // Sort categories by priority
  const categoryOrder: ResourceCategory[] = [
    'emergency',
    'counseling',
    'meditation',
  ];
  const sortedCategories = categoryOrder.filter(cat => groupedResources[cat]);

  return (
    <Card variant="outlined" padding="lg" style={styles.resourcesCard}>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.cardHeader}
      >
        <View style={styles.headerContent}>
          <Text style={styles.cardIcon}>📞</Text>
          <View style={styles.headerText}>
            <Text style={styles.cardTitle}>Support Resources</Text>
            <Text style={styles.cardSubtitle}>
              {resources.length} resource{resources.length !== 1 ? 's' : ''}{' '}
              available
            </Text>
          </View>
        </View>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          {sortedCategories.map(category => {
            const categoryStyles = getCategoryStyles(category);
            return (
              <View key={category} style={styles.categorySection}>
                <Text
                  style={[
                    styles.categoryTitle,
                    { color: categoryStyles.iconColor },
                  ]}
                >
                  {categoryStyles.icon}{' '}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                {groupedResources[category].map((resource, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.resourceItem,
                      {
                        backgroundColor: categoryStyles.backgroundColor,
                        borderColor: categoryStyles.borderColor,
                      },
                    ]}
                    onPress={() =>
                      handleResourcePress(resource.url, resource.title)
                    }
                  >
                    <View style={styles.resourceContent}>
                      <Text style={styles.resourceTitle}>{resource.title}</Text>
                      <Text style={styles.resourceDescription}>
                        {resource.description}
                      </Text>
                    </View>
                    <Text style={styles.resourceArrow}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

// Main Coaching Cards Component
export function CoachingCards({
  coaching,
  sentimentScore: _sentimentScore,
}: CoachingCardsProps) {
  return (
    <View style={styles.container}>
      {/* Resources */}
      {coaching.resources && coaching.resources.length > 0 && (
        <ResourcesCard resources={coaching.resources} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  cardSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    ...typography.h4,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  container: {
    gap: spacing.lg,
  },
  durationText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  exerciseButton: {
    marginTop: spacing.md,
  },
  exerciseCard: {
    backgroundColor: colors.surfaceLight,
  },
  expandIcon: {
    ...typography.body,
    color: colors.textSecondary,
  },
  expandedContent: {
    marginTop: spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  headerText: {
    flex: 1,
  },
  imageNote: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  instructionItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  instructionNumber: {
    ...typography.bodySmall,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    color: colors.white,
    fontWeight: '600',
    marginRight: spacing.md,
    minWidth: 24,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    textAlign: 'center',
  },
  instructionText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  instructionsContainer: {
    marginBottom: spacing.md,
  },
  resourceArrow: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  resourceContent: {
    flex: 1,
  },
  resourceDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  resourceItem: {
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  resourceTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  resourcesCard: {
    borderColor: colors.info,
    borderWidth: 2,
  },
});
