import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/Colors';
import { typography } from '../constants/Typography';
import { spacing, borderRadius } from '../constants/Layout';
import {
  useSentimentTheme,
  useThemedStyles,
} from '../context/SentimentThemeProvider';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  TranscriptSkeleton,
  SentimentSkeleton,
  CoachingSkeleton,
} from '../components/SkeletonLoader';
import { SimpleSentimentBar } from '../components/SentimentMeter';
import { CoachingCards } from '../components/CoachingCards';
import { AudioPlayer } from '../components/AudioPlayer';
import { useAppContext } from '../context/AppContext';

export function ResultsScreen() {
  const { state, dispatch, actions } = useAppContext();
  const { theme, sentimentLevel } = useSentimentTheme();

  // Dynamic styles based on current sentiment theme
  /* eslint-disable react-native/no-unused-styles */
  const themedStyles = useThemedStyles(theme =>
    StyleSheet.create({
      themedCardTitle: {
        ...typography.h3,
        color: theme.text,
        marginBottom: spacing.md,
      },
      themedContainer: {
        backgroundColor: theme.background,
        flex: 1,
      },
      themedContent: {
        padding: spacing.lg,
      },
      themedHeader: {
        alignItems: 'center',
        backgroundColor: theme.surface,
        borderBottomColor: theme.borderLight,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
      },
      themedHeaderTitle: {
        ...typography.h3,
        color: theme.text,
      },
      themedMotivationCard: {
        backgroundColor: theme.surfaceLight,
        borderLeftColor: theme.primary,
        borderLeftWidth: 4,
        marginBottom: spacing.lg,
      },
      themedSecondaryText: {
        color: theme.textSecondary,
      },
      themedSentimentCard: {
        alignItems: 'center',
        backgroundColor: theme.surfaceLight,
        borderColor: theme.border,
        marginBottom: spacing.lg,
      },
      themedText: {
        color: theme.text,
      },
    })
  );
  /* eslint-enable react-native/no-unused-styles */

  const goHome = () => {
    dispatch({ type: 'NAVIGATE_TO', payload: 'home' });
  };

  const startNewRecording = () => {
    actions.resetApp();
  };

  // Show loading if upload is in progress
  if (state.loading.upload || state.loading.processing) {
    return (
      <SafeAreaView style={themedStyles.themedContainer}>
        <StatusBar style="dark" backgroundColor={theme.background} />

        {/* Header */}
        <View style={themedStyles.themedHeader}>
          <Button
            title="← Back"
            onPress={goHome}
            variant="ghost"
            size="small"
          />
          <Text style={themedStyles.themedHeaderTitle}>
            {state.loading.upload ? 'Uploading...' : 'Processing...'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={themedStyles.themedContent}>
            {/* Status Message */}
            <Card variant="outlined" padding="lg" style={styles.statusCard}>
              <Text style={styles.statusTitle}>
                {state.loading.upload ? '📤 Uploading...' : '🤖 Processing...'}
              </Text>
              <Text style={styles.statusText}>
                {state.loading.upload
                  ? 'Uploading your recording securely'
                  : 'Analyzing your voice and generating insights'}
              </Text>
            </Card>

            {/* Skeleton Loaders */}
            <Card variant="elevated" style={styles.skeletonCard}>
              <TranscriptSkeleton />
            </Card>

            <Card variant="elevated" style={styles.skeletonCard}>
              <SentimentSkeleton />
            </Card>

            <Card variant="elevated" style={styles.skeletonCard}>
              <CoachingSkeleton />
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show error if upload failed
  if (state.error) {
    return (
      <SafeAreaView style={themedStyles.themedContainer}>
        <StatusBar style="dark" backgroundColor={theme.background} />

        <View style={themedStyles.themedHeader}>
          <Button
            title="← Back"
            onPress={goHome}
            variant="ghost"
            size="small"
          />
          <Text style={themedStyles.themedHeaderTitle}>Check-in Results</Text>
          <Button
            title="New +"
            onPress={startNewRecording}
            variant="ghost"
            size="small"
          />
        </View>

        <View style={styles.content}>
          <Card variant="outlined" padding="xl" style={styles.errorCard}>
            <Text style={styles.errorTitle}>Upload Failed</Text>
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
  const { checkinData } = state;
  const hasData =
    checkinData.sessionId &&
    (checkinData.transcript || checkinData.sentiment || checkinData.coaching);

  if (!hasData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={colors.background} />

        <View style={styles.content}>
          <Card variant="outlined" padding="xl" style={styles.noDataCard}>
            <Text style={styles.noDataTitle}>No Results Yet</Text>
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
    <SafeAreaView style={themedStyles.themedContainer}>
      <StatusBar style="dark" backgroundColor={theme.background} />

      {/* Header */}
      <View style={themedStyles.themedHeader}>
        <Button title="← Back" onPress={goHome} variant="ghost" size="small" />
        <View style={styles.headerCenter}>
          <Text style={themedStyles.themedHeaderTitle}>Check-in Results</Text>
          {state.checkinData.sentiment && (
            <View
              style={[
                styles.sentimentIndicator,
                { backgroundColor: theme.primary },
              ]}
            >
              <Text
                style={[
                  styles.sentimentIndicatorText,
                  { color: theme.surface },
                ]}
              >
                {sentimentLevel}
              </Text>
            </View>
          )}
        </View>
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
        <View style={themedStyles.themedContent}>
          {/* TTS Audio Player */}
          {checkinData.audioUrl && (
            <AudioPlayer
              audioUrl={checkinData.audioUrl}
              audioText={checkinData.audioText || undefined}
              audioMetadata={checkinData.audioMetadata || undefined}
              style={{ marginBottom: spacing.lg }}
            />
          )}

          {/* Sentiment Analysis */}
          {checkinData.sentiment && (
            <Card
              variant="elevated"
              padding="lg"
              style={themedStyles.themedSentimentCard}
            >
              <Text style={themedStyles.themedCardTitle}>Mood Analysis</Text>

              <SimpleSentimentBar
                score={checkinData.sentiment.score}
                confidence={checkinData.sentiment.confidence}
                label={checkinData.sentiment.label}
                customColors={{
                  primary: theme.primary,
                  secondary: theme.secondary,
                  background: theme.background,
                  text: theme.text,
                  textSecondary: theme.textSecondary,
                  border: theme.border,
                }}
              />
            </Card>
          )}

          {/* Coaching Content */}
          {checkinData.coaching && (
            <CoachingCards
              coaching={checkinData.coaching}
              sentimentScore={checkinData.sentiment?.score}
            />
          )}

          {/* Actions */}
          <View style={styles.actionsContainer}>
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

const styles = StyleSheet.create({
  actionButton: {
    marginBottom: spacing.sm,
  },
  actionsContainer: {
    gap: spacing.md,
    marginTop: spacing.lg,
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
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: spacing.xxl,
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
  scrollView: {
    flex: 1,
  },
  sentimentIndicator: {
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sentimentIndicatorText: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  skeletonCard: {
    marginBottom: spacing.lg,
  },
  statusCard: {
    marginBottom: spacing.lg,
  },
  statusText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statusTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
