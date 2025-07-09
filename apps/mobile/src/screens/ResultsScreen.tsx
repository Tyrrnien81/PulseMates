import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/Colors';
import { typography } from '../constants/Typography';
import { spacing, borderRadius } from '../constants/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';

export function ResultsScreen() {
  const { state, dispatch, actions } = useAppContext();

  const goHome = () => {
    dispatch({ type: 'NAVIGATE_TO', payload: 'home' });
  };

  const startNewRecording = () => {
    actions.resetApp();
  };

  // Show loading if upload is in progress
  if (state.loading.upload || state.loading.processing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={colors.background} />

        <View style={styles.content}>
          <Card variant="elevated" padding="xl" style={styles.loadingCard}>
            <Text style={styles.loadingTitle}>
              {state.loading.upload ? '📤 Uploading...' : '🤖 Processing...'}
            </Text>
            <Text style={styles.loadingText}>
              {state.loading.upload
                ? 'Uploading your recording securely'
                : 'Analyzing your voice and generating insights'}
            </Text>
            <Text style={styles.loadingSubtext}>
              This may take a few moments
            </Text>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if upload failed
  if (state.error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={colors.background} />

        <View style={styles.header}>
          <Button
            title="← Back"
            onPress={goHome}
            variant="ghost"
            size="small"
          />
          <Text style={styles.headerTitle}>Check-in Results</Text>
          <Button
            title="New +"
            onPress={startNewRecording}
            variant="ghost"
            size="small"
          />
        </View>

        <View style={styles.content}>
          <Card variant="outlined" padding="xl" style={styles.errorCard}>
            <Text style={styles.errorTitle}>❌ Upload Failed</Text>
            <Text style={styles.errorText}>{state.error}</Text>
            <View style={styles.errorActions}>
              <Button
                title="Try Again"
                onPress={actions.uploadRecording}
                variant="primary"
                style={styles.errorButton}
              />
              <Button
                title="Go Home"
                onPress={goHome}
                variant="outline"
                style={styles.errorButton}
              />
            </View>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  // Get data from context
  const { checkinData, recordingData } = state;
  const hasData =
    checkinData.id &&
    (checkinData.transcript || checkinData.sentiment || checkinData.coaching);

  if (!hasData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={colors.background} />

        <View style={styles.content}>
          <Card variant="outlined" padding="xl" style={styles.noDataCard}>
            <Text style={styles.noDataTitle}>📝 No Results Yet</Text>
            <Text style={styles.noDataText}>
              Complete a check-in recording to see your personalized results and
              coaching.
            </Text>
            <Button
              title="Start Check-in"
              onPress={() =>
                dispatch({ type: 'NAVIGATE_TO', payload: 'recording' })
              }
              size="large"
              style={styles.noDataButton}
            />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Button title="← Back" onPress={goHome} variant="ghost" size="small" />
        <Text style={styles.headerTitle}>Check-in Results</Text>
        <Button
          title="New +"
          onPress={startNewRecording}
          variant="ghost"
          size="small"
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Recording Info */}
          <Card
            variant="outlined"
            padding="lg"
            style={styles.recordingInfoCard}
          >
            <Text style={styles.cardTitle}>📊 Session Summary</Text>
            <View style={styles.recordingInfo}>
              <Text style={styles.infoText}>
                Duration: {Math.floor(recordingData.duration / 60)}:
                {(recordingData.duration % 60).toString().padStart(2, '0')}
              </Text>
              {recordingData.timestamp && (
                <Text style={styles.infoText}>
                  Date: {new Date(recordingData.timestamp).toLocaleDateString()}
                </Text>
              )}
            </View>
          </Card>

          {/* Transcript */}
          {checkinData.transcript && (
            <Card variant="elevated" padding="lg" style={styles.transcriptCard}>
              <Text style={styles.cardTitle}>💬 What You Shared</Text>
              <Text style={styles.transcriptText}>
                &ldquo;{checkinData.transcript}&rdquo;
              </Text>
            </Card>
          )}

          {/* Sentiment Analysis */}
          {checkinData.sentiment && (
            <Card variant="elevated" padding="lg" style={styles.sentimentCard}>
              <Text style={styles.cardTitle}>🎭 Mood Analysis</Text>
              <View style={styles.sentimentContainer}>
                <Text style={styles.sentimentLabel}>
                  {checkinData.sentiment.label}
                </Text>
                <View style={styles.sentimentMeter}>
                  <View
                    style={[
                      styles.sentimentFill,
                      {
                        width: `${Math.round(checkinData.sentiment.confidence * 100)}%`,
                        backgroundColor: getSentimentColor(
                          checkinData.sentiment.score
                        ),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.sentimentScore}>
                  {Math.round(checkinData.sentiment.confidence * 100)}%
                  confidence
                </Text>
              </View>
            </Card>
          )}

          {/* Coaching Content */}
          {checkinData.coaching && (
            <>
              {/* Motivational Message */}
              {checkinData.coaching.motivationalMessage && (
                <Card
                  variant="default"
                  padding="lg"
                  style={styles.motivationCard}
                >
                  <Text style={styles.cardTitle}>💪 Personal Message</Text>
                  <Text style={styles.motivationText}>
                    {checkinData.coaching.motivationalMessage}
                  </Text>
                </Card>
              )}

              {/* Breathing Exercise */}
              {checkinData.coaching.breathingExercise && (
                <Card
                  variant="outlined"
                  padding="lg"
                  style={styles.exerciseCard}
                >
                  <Text style={styles.cardTitle}>
                    🫁 {checkinData.coaching.breathingExercise.title}
                  </Text>
                  <Text style={styles.exerciseDescription}>
                    Duration: {checkinData.coaching.breathingExercise.duration}{' '}
                    minutes
                  </Text>
                  <View style={styles.exerciseInstructions}>
                    {checkinData.coaching.breathingExercise.instructions.map(
                      (instruction, index) => (
                        <Text key={index} style={styles.instructionText}>
                          {index + 1}. {instruction}
                        </Text>
                      )
                    )}
                  </View>
                  <Button
                    title="Start Exercise"
                    onPress={() =>
                      Alert.alert(
                        'Exercise',
                        'Breathing exercise feature coming soon!'
                      )
                    }
                    variant="outline"
                    style={styles.exerciseButton}
                  />
                </Card>
              )}

              {/* Stretch Exercise */}
              {checkinData.coaching.stretchExercise && (
                <Card
                  variant="outlined"
                  padding="lg"
                  style={styles.exerciseCard}
                >
                  <Text style={styles.cardTitle}>
                    🧘 {checkinData.coaching.stretchExercise.title}
                  </Text>
                  <View style={styles.exerciseInstructions}>
                    {checkinData.coaching.stretchExercise.instructions.map(
                      (instruction, index) => (
                        <Text key={index} style={styles.instructionText}>
                          {index + 1}. {instruction}
                        </Text>
                      )
                    )}
                  </View>
                  <Button
                    title="View Guide"
                    onPress={() =>
                      Alert.alert(
                        'Exercise',
                        'Stretch exercise guide coming soon!'
                      )
                    }
                    variant="outline"
                    style={styles.exerciseButton}
                  />
                </Card>
              )}

              {/* Resources */}
              {checkinData.coaching.resources &&
                checkinData.coaching.resources.length > 0 && (
                  <Card
                    variant="outlined"
                    padding="lg"
                    style={styles.resourcesCard}
                  >
                    <Text style={styles.cardTitle}>📚 Helpful Resources</Text>
                    {checkinData.coaching.resources.map((resource, index) => (
                      <View key={index} style={styles.resourceItem}>
                        <Text style={styles.resourceTitle}>
                          {resource.title}
                        </Text>
                        <Text style={styles.resourceDescription}>
                          {resource.description}
                        </Text>
                        <Button
                          title={`Contact ${resource.type === 'phone' ? '📞' : resource.type === 'email' ? '📧' : '🌐'}`}
                          onPress={() =>
                            Alert.alert('Resource', `Contact: ${resource.url}`)
                          }
                          variant="ghost"
                          size="small"
                          style={styles.resourceButton}
                        />
                      </View>
                    ))}
                  </Card>
                )}
            </>
          )}

          {/* Audio Playback */}
          {checkinData.audioUrl && (
            <Card variant="elevated" padding="lg" style={styles.audioCard}>
              <Text style={styles.cardTitle}>🎵 Your Coaching Audio</Text>
              <Text style={styles.audioDescription}>
                Listen to your personalized coaching message
              </Text>
              <Button
                title="▶ Play Coaching"
                onPress={() =>
                  Alert.alert(
                    'Audio Player',
                    'Audio playback feature coming soon!'
                  )
                }
                variant="primary"
                style={styles.audioButton}
              />
            </Card>
          )}

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Button
              title="🎤 New Check-in"
              onPress={startNewRecording}
              size="large"
              style={styles.actionButton}
            />
            <Button
              title="← Back to Home"
              onPress={goHome}
              variant="outline"
              size="large"
              style={styles.actionButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getSentimentColor(score: number): string {
  if (score >= 0.6) return colors.success;
  if (score >= 0.4) return colors.warning;
  return colors.info;
}

const styles = StyleSheet.create({
  actionButton: {
    marginBottom: spacing.sm,
  },
  actionsContainer: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  audioButton: {
    alignSelf: 'center',
  },
  audioCard: {
    backgroundColor: colors.surfaceLight,
    marginBottom: spacing.lg,
  },
  audioDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  errorActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  errorButton: {
    minWidth: 100,
  },
  errorCard: {
    alignItems: 'center',
    borderColor: colors.error,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  errorTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  exerciseButton: {
    alignSelf: 'flex-start',
  },
  exerciseCard: {
    marginBottom: spacing.lg,
  },
  exerciseDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  exerciseInstructions: {
    marginBottom: spacing.md,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  instructionText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  loadingCard: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  loadingSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  loadingTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  motivationCard: {
    backgroundColor: colors.surfaceLight,
    borderLeftColor: colors.primary,
    borderLeftWidth: 4,
    marginBottom: spacing.lg,
  },
  motivationText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
    textAlign: 'center',
  },
  noDataButton: {
    minWidth: 200,
  },
  noDataCard: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  noDataText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  noDataTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  recordingInfo: {
    gap: spacing.xs,
  },
  recordingInfoCard: {
    marginBottom: spacing.lg,
  },
  resourceButton: {
    alignSelf: 'flex-start',
  },
  resourceDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  resourceItem: {
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
  },
  resourceTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  resourcesCard: {
    marginBottom: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  sentimentCard: {
    marginBottom: spacing.lg,
  },
  sentimentContainer: {
    alignItems: 'center',
  },
  sentimentFill: {
    borderRadius: borderRadius.sm,
    height: '100%',
  },
  sentimentLabel: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  sentimentMeter: {
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    height: 12,
    marginBottom: spacing.sm,
    width: '100%',
  },
  sentimentScore: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  transcriptCard: {
    backgroundColor: colors.surfaceLight,
    marginBottom: spacing.lg,
  },
  transcriptText: {
    ...typography.body,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 22,
  },
});
