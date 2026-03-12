import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import TabNavigator from './src/navigation/TabNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ToastProvider } from './src/components/Toast';
import { COLORS } from './src/constants/theme';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
          <TabNavigator />
        </NavigationContainer>
      </ToastProvider>
    </ErrorBoundary>
  );
}
