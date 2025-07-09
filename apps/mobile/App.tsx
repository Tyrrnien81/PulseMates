import React from 'react';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/components/AppNavigator';

export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
