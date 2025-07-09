import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface ApiResponse {
  pong?: boolean;
  message?: string;
}

export default function App() {
  const [apiStatus, setApiStatus] = useState<string>('Checking connection...');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await fetch('http://localhost:4000/ping');
        const data: ApiResponse = await response.json();

        if (data.pong) {
          setApiStatus('✅ Server connection successful!');
        } else {
          setApiStatus('❌ Server response error');
        }
      } catch (error) {
        setApiStatus(
          '❌ Server connection failed - Please check if server is running'
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkApiConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PulseMates</Text>
      <Text style={styles.subtitle}>React Native + Node.js + MySQL</Text>

      <View style={styles.statusContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <Text style={styles.status}>{apiStatus}</Text>
        )}
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 60,
    padding: 20,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  title: {
    color: '#333',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
