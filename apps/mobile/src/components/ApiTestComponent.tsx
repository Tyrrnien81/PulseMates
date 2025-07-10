import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { apiService } from '../services/api';
import { colors } from '../constants/Colors';
import { typography } from '../constants/Typography';
import { spacing } from '../constants/Layout';

export function ApiTestComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');

  const testBasicHealth = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.checkHealth();
      if (result.success) {
        setLastResult(`✅ Basic Health: ${result.data?.message}`);
      } else {
        setLastResult(`❌ Basic Health Failed: ${result.error}`);
      }
    } catch (error) {
      setLastResult(`❌ Health Check Error: ${error}`);
    }
    setIsLoading(false);
  };

  const testDetailedHealth = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.checkDetailedHealth();
      if (result.success) {
        setLastResult(
          `✅ Detailed Health: ${result.data?.service} v${result.data?.version} - ${result.data?.status}`
        );
      } else {
        setLastResult(`❌ Detailed Health Failed: ${result.error}`);
      }
    } catch (error) {
      setLastResult(`❌ Detailed Health Error: ${error}`);
    }
    setIsLoading(false);
  };

  const showInstructions = () => {
    Alert.alert(
      'Backend Integration Test',
      'This component helps test your backend API connection:\n\n' +
        '1. Basic Health - Tests /ping endpoint\n' +
        '2. Detailed Health - Tests /api/health endpoint\n\n' +
        'Make sure your backend server is running on localhost:4000',
      [{ text: 'OK' }]
    );
  };

  return (
    <Card variant="outlined" padding="lg" style={styles.container}>
      <Text style={styles.title}>🔧 API Integration Test</Text>
      <Text style={styles.subtitle}>Test your backend connectivity</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Test Basic Health"
          onPress={testBasicHealth}
          disabled={isLoading}
          size="small"
          style={styles.button}
        />
        <Button
          title="Test Detailed Health"
          onPress={testDetailedHealth}
          disabled={isLoading}
          size="small"
          style={styles.button}
        />
        <Button
          title="Instructions"
          onPress={showInstructions}
          variant="ghost"
          size="small"
          style={styles.button}
        />
      </View>

      {isLoading && <Text style={styles.loading}>Testing connection...</Text>}

      {lastResult && !isLoading && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Last Result:</Text>
          <Text style={styles.resultText}>{lastResult}</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  button: {
    marginBottom: spacing.sm,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
  container: {
    borderColor: colors.info,
    borderWidth: 2,
    marginVertical: spacing.md,
  },
  loading: {
    ...typography.body,
    color: colors.info,
    fontStyle: 'italic',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: colors.surfaceLight,
    borderRadius: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  resultLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  resultText: {
    ...typography.body,
    color: colors.text,
    fontFamily: 'monospace',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
});
