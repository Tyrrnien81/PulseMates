import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/Colors';
import { typography } from '../constants/Typography';
import { spacing, borderRadius } from '../constants/Layout';

import { Card } from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import { AnimatedGradient } from '../components/AnimatedGradient';
import {
  HapticButton,
  MicroInteraction,
} from '../components/InteractiveFeedback';
import { PageWrapper } from '../components/PageTransitions';

export function HomeScreen() {
  const { state, dispatch } = useAppContext();
  const [buttonPressed, setButtonPressed] = useState('');

  const handleStartRecording = () => {
    setButtonPressed('record');
    setTimeout(() => setButtonPressed(''), 300);
    dispatch({ type: 'NAVIGATE_TO', payload: 'recording' });
  };

  const handleViewResults = () => {
    setButtonPressed('results');
    setTimeout(() => setButtonPressed(''), 300);
    dispatch({ type: 'NAVIGATE_TO', payload: 'results' });
  };

  // Get sentiment score from latest check-in for gradient animation
  const sentimentScore = state.checkinData.sentiment?.score ?? 0.5;

  return (
    <PageWrapper transitionType="fade" duration={400}>
      <AnimatedGradient
        sentimentScore={sentimentScore}
        intensity="subtle"
        speed="slow"
        isActive={true}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar style="dark" backgroundColor={colors.background} />

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <MicroInteraction type="fade" trigger={buttonPressed === 'header'}>
              <View style={styles.header}>
                <Text style={styles.title}>PulseMates</Text>
                <Text style={styles.subtitle}>
                  Your mental wellness companion
                </Text>
              </View>
            </MicroInteraction>

            {/* Quick Check-in Card */}
            <MicroInteraction type="scale" trigger={buttonPressed === 'record'}>
              <Card variant="elevated" padding="xl" style={styles.mainCard}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardIcon}>🎤</Text>
                  <Text style={styles.cardTitle}>Quick Check-in</Text>
                  <Text style={styles.cardDescription}>
                    Share how you&apos;re feeling with a 60-second voice
                    recording
                  </Text>

                  <HapticButton
                    onPress={handleStartRecording}
                    hapticType="medium"
                    style={styles.primaryButton}
                  >
                    <View style={styles.buttonContent}>
                      <Text style={styles.buttonText}>Start Recording</Text>
                    </View>
                  </HapticButton>
                </View>
              </Card>
            </MicroInteraction>

            {/* Results Card */}
            {state.checkinData.sessionId && (
              <MicroInteraction
                type="slide"
                trigger={buttonPressed === 'results'}
              >
                <Card
                  variant="outlined"
                  padding="lg"
                  style={styles.resultsCard}
                >
                  <View style={styles.resultsHeader}>
                    <Text style={styles.resultsIcon}>📊</Text>
                    <View style={styles.resultsText}>
                      <Text style={styles.resultsTitle}>Latest Results</Text>
                      <Text style={styles.resultsSubtitle}>
                        View your personalized insights and coaching
                      </Text>
                    </View>
                  </View>

                  <HapticButton
                    onPress={handleViewResults}
                    hapticType="light"
                    style={styles.secondaryButton}
                  >
                    <View style={styles.buttonContent}>
                      <Text style={styles.secondaryButtonText}>
                        View Results
                      </Text>
                    </View>
                  </HapticButton>
                </Card>
              </MicroInteraction>
            )}

            {/* Info Cards */}
            <View style={styles.infoGrid}>
              <MicroInteraction
                type="bounce"
                trigger={buttonPressed === 'privacy'}
              >
                <Card variant="default" padding="md" style={styles.infoCard}>
                  <Text style={styles.infoIcon}>🔒</Text>
                  <Text style={styles.infoTitle}>Private & Secure</Text>
                  <Text style={styles.infoDescription}>
                    Your recordings are processed securely and never shared
                  </Text>
                </Card>
              </MicroInteraction>

              <MicroInteraction type="bounce" trigger={buttonPressed === 'ai'}>
                <Card variant="default" padding="md" style={styles.infoCard}>
                  <Text style={styles.infoIcon}>🧠</Text>
                  <Text style={styles.infoTitle}>AI-Powered</Text>
                  <Text style={styles.infoDescription}>
                    Advanced sentiment analysis and personalized coaching
                  </Text>
                </Card>
              </MicroInteraction>
            </View>

            {/* Stats Card */}
            {state.checkinData.sessionId && (
              <MicroInteraction type="fade" trigger={buttonPressed === 'stats'}>
                <Card variant="default" padding="lg" style={styles.statsCard}>
                  <Text style={styles.statsTitle}>Your Progress</Text>
                  <View style={styles.statsContent}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>1</Text>
                      <Text style={styles.statLabel}>Check-ins</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>
                        {state.checkinData.sentiment
                          ? Math.round(state.checkinData.sentiment.score * 100)
                          : '--'}
                        %
                      </Text>
                      <Text style={styles.statLabel}>Mood Score</Text>
                    </View>
                  </View>
                </Card>
              </MicroInteraction>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Take a moment for yourself. Your mental health matters.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </AnimatedGradient>
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  cardContent: {
    alignItems: 'center',
  },
  cardDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  footer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  infoCard: {
    alignItems: 'center',
    flex: 1,
  },
  infoDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  mainCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    elevation: 4,
    minWidth: 200,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  resultsCard: {
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  resultsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  resultsIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  resultsSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  resultsText: {
    flex: 1,
  },
  resultsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  scrollView: {
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statNumber: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statsCard: {
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
