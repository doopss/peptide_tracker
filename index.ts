import { AppRegistry, Platform } from 'react-native';
import App from './App';

if (Platform.OS === 'web') {
  // Web-specific rendering
  const rootTag = document.getElementById('root');
  AppRegistry.runApplication('main', { rootTag });
} else {
  // Native rendering
  const { registerRootComponent } = require('expo');
  registerRootComponent(App);
}
