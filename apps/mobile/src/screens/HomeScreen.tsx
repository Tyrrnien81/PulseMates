import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/Colors';
import { typography } from '../constants/Typography';
import { spacing } from '../constants/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';

export function HomeScreen() {
  const { state, dispatch, actions } = useAppContext();

  useEffect(() => {
    // Check API health when component mounts
    actions.checkApiHealth();
  }, [actions]);

  const handleStartRecording = () => {
    dispatch({ type: 'NAVIGATE_TO', payload: 'recording' });
  };

  const handleRetryConnection = () => {
    actions.checkApiHealth();
  };

  const viewResults = () => {
    dispatch({ type: 'NAVIGATE_TO', payload: 'results' });
  };

  const handleCallCounseling = async () => {
    // Replace with your campus counseling number
    const phoneNumber = '1-608-265-5600';
    const phoneUrl = `tel:${phoneNumber}`;

    try {
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert(
          'Cannot make call',
          "Your device doesn't support making calls from this app",
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate call. Please try again.', [
        { text: 'OK' },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={colors.background} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Welcome to</Text>
            <Text style={styles.title}>PulseMates</Text>
            <Text style={styles.subtitle}>
              Your companion for mental wellness and personal growth
            </Text>
          </View>

          {/* API Status */}
          <Card variant="outlined" padding="lg" style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>
                {state.loading.health
                  ? '🔄'
                  : state.apiHealth.isHealthy
                    ? '🟢'
                    : '🔴'}{' '}
                Server Status
              </Text>
              {state.loading.health && (
                <Text style={styles.loadingText}>Checking...</Text>
              )}
            </View>

            <Text style={styles.statusText}>
              {state.loading.health
                ? 'Checking connection...'
                : state.apiHealth.message}
            </Text>

            {state.apiHealth.lastChecked && (
              <Text style={styles.lastCheckedText}>
                Last checked:{' '}
                {new Date(state.apiHealth.lastChecked).toLocaleTimeString()}
              </Text>
            )}

            {!state.apiHealth.isHealthy && !state.loading.health && (
              <Button
                title="Retry Connection"
                onPress={handleRetryConnection}
                variant="outline"
                size="small"
                style={styles.retryButton}
              />
            )}
          </Card>

          {/* Start Recording Button */}
          <Button
            title="🎤 Start Mental Check-in"
            onPress={handleStartRecording}
            size="large"
            //disabled={!state.apiHealth.isHealthy || state.loading.health}
            style={styles.startButton}
          />

          {!state.apiHealth.isHealthy && !state.loading.health && (
            <Text style={styles.disabledText}>
              Please ensure the server is running before starting a check-in
            </Text>
          )}

          {/* Main Actions */}
          <View style={styles.actionsGrid}>
            <Button
              title="🎤 New Check-in"
              onPress={handleStartRecording}
              size="large"
              style={styles.actionButton}
              disabled={!state.apiHealth.isHealthy}
            />

            {state.checkinData.id && (
              <Button
                title="📊 View Results"
                onPress={viewResults}
                variant="outline"
                size="large"
                style={styles.actionButton}
              />
            )}
          </View>

          {/* Recent Activity */}
          {state.checkinData.id && (
            <Card variant="elevated" padding="lg" style={styles.recentCard}>
              <Text style={styles.recentTitle}>Recent Check-in</Text>
              <View style={styles.recentContent}>
                <Text style={styles.recentDate}>
                  {state.recordingData.timestamp
                    ? new Date(
                        state.recordingData.timestamp
                      ).toLocaleDateString()
                    : 'Today'}
                </Text>
                {state.checkinData.sentiment && (
                  <Text style={styles.recentSentiment}>
                    Mood: {state.checkinData.sentiment.label} (
                    {Math.round(state.checkinData.sentiment.score * 100)}%)
                  </Text>
                )}
                <Button
                  title="View Details"
                  onPress={viewResults}
                  variant="ghost"
                  size="small"
                  style={styles.viewDetailsButton}
                />
              </View>
            </Card>
          )}

          {/* Quick Tips */}
          <Card variant="default" padding="lg" style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Daily Wellness Tips</Text>
            <Text style={styles.tipsText}>
              • Take deep breaths when feeling overwhelmed{'\n'}• Share your
              thoughts and feelings regularly{'\n'}• Practice gratitude for
              small moments{'\n'}• Remember that seeking help is a sign of
              strength
            </Text>
          </Card>

          {/* Crisis Resources */}
          <Card variant="outlined" padding="lg" style={styles.crisisCard}>
            <Text style={styles.crisisTitle}> Need Immediate Support?</Text>
            <Text style={styles.crisisText}>
              If you&apos;re in crisis or having thoughts of self-harm, please
              reach out immediately:
            </Text>
            <View style={styles.crisisButtons}>
              <Button
                title="📞 Campus Counseling"
                onPress={handleCallCounseling}
                variant="outline"
                size="small"
                style={styles.crisisButton}
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    marginBottom: spacing.sm,
  },
  actionsGrid: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  crisisButton: {
    borderColor: colors.warning,
  },
  crisisButtons: {
    gap: spacing.sm,
  },
  crisisCard: {
    borderColor: colors.warning,
    borderWidth: 2,
    marginTop: spacing.xl,
  },
  crisisText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  crisisTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  disabledText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  greeting: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  lastCheckedText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  recentCard: {
    backgroundColor: colors.surfaceLight,
    marginTop: spacing.xl,
  },
  recentContent: {
    gap: spacing.sm,
  },
  recentDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  recentSentiment: {
    ...typography.body,
    color: colors.text,
  },
  recentTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  retryButton: {
    marginTop: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  startButton: {
    marginTop: spacing.lg,
  },
  statusCard: {
    marginBottom: spacing.lg,
  },
  statusHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statusText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  statusTitle: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    maxWidth: 280,
    textAlign: 'center',
  },
  tipsCard: {
    backgroundColor: colors.surfaceLight,
    borderLeftColor: colors.info,
    borderLeftWidth: 4,
    marginTop: spacing.xl,
  },
  tipsText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  tipsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  viewDetailsButton: {
    alignSelf: 'flex-start',
  },
});
