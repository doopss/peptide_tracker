import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import { createRoot } from 'react-dom/client';

import App from './App';

// Web-specific entry point
if (Platform.OS === 'web') {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
} else {
  // Native entry point
  registerRootComponent(App);
}
