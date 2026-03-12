import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      hideToast(id);
    }, 3000);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <View style={styles.container}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onHide={() => hideToast(toast.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onHide: () => void }> = ({ toast, onHide }) => {
  const opacity = new Animated.Value(0);

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(2600),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  }, []);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getColor = () => {
    switch (toast.type) {
      case 'success':
        return COLORS.success;
      case 'error':
        return COLORS.danger;
      case 'warning':
        return COLORS.warning;
      default:
        return COLORS.info;
    }
  };

  return (
    <Animated.View style={[styles.toast, { opacity }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${getColor()}20` }]}>
        <Ionicons name={getIcon()} size={20} color={getColor()} />
      </View>
      <Text style={styles.message}>{toast.message}</Text>
      <TouchableOpacity onPress={onHide} style={styles.closeButton}>
        <Ionicons name="close" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.lg,
    minWidth: 300,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  message: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
});

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
