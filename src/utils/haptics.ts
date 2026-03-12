import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/useAppStore';

export const useHaptics = () => {
  const hapticsEnabled = useAppStore((state) => state.settings.hapticsEnabled);

  const trigger = async (type: Haptics.NotificationFeedbackType | 'light' | 'medium' | 'heavy') => {
    if (!hapticsEnabled) return;

    try {
      switch (type) {
        case 'success':
        case 'warning':
        case 'error':
          await Haptics.notificationAsync(type);
          break;
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      // Haptics not available on this device
      console.log('Haptics not available:', error);
    }
  };

  return { trigger };
};

// Convenience functions for common haptic patterns
export const useHapticFeedback = () => {
  const { trigger } = useHaptics();

  return {
    success: () => trigger('success'),
    error: () => trigger('error'),
    warning: () => trigger('warning'),
    light: () => trigger('light'),
    medium: () => trigger('medium'),
    heavy: () => trigger('heavy'),
    selection: () => trigger('light'),
  };
};
