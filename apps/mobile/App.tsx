import React from 'react';
import { AppProvider } from './src/context/AppContext';
import { SentimentThemeProvider } from './src/context/SentimentThemeProvider';
import { AppNavigator } from './src/components/AppNavigator';

export default function App() {
  return (
    <AppProvider>
      <SentimentThemeProvider>
        <AppNavigator />
      </SentimentThemeProvider>
    </AppProvider>
  );
}
