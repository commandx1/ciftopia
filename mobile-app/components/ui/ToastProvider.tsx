import React, { useState, useCallback, createContext, useContext, useEffect } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, Platform, ColorValue, Modal } from 'react-native';
import { Check, X, TriangleAlert, Info, Heart, Loader2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { Text } from './Text';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'love' | 'loading';

interface ToastOptions {
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  show: (options: ToastOptions) => void;
  hide: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastConfig = {
  success: {
    icon: Check,
    colors: ['#22C55E', '#059669'],
    bg: '#F0FDF4',
    border: '#BBF7D0'
  },
  error: {
    icon: X,
    colors: ['#EF4444', '#E11D48'],
    bg: '#FEF2F2',
    border: '#FECACA'
  },
  warning: {
    icon: TriangleAlert,
    colors: ['#F59E0B', '#D97706'],
    bg: '#FFFBEB',
    border: '#FEF3C7'
  },
  info: {
    icon: Info,
    colors: ['#3B82F6', '#0891B2'],
    bg: '#EFF6FF',
    border: '#DBEAFE'
  },
  love: {
    icon: Heart,
    colors: ['#F43F5E', '#DB2777'],
    bg: '#FFF1F2',
    border: '#FFE4E6'
  },
  loading: {
    icon: Loader2,
    colors: ['#8B5CF6', '#4F46E5'],
    bg: '#F5F3FF',
    border: '#EDE9FE'
  }
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ToastOptions | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(-100))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible && options?.type === 'loading') {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [visible, options, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setOptions(null);
    });
  }, [fadeAnim, slideAnim]);

  const show = useCallback((newOptions: ToastOptions) => {
    setOptions(newOptions);
    setVisible(true);
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
    ]).start();

    if (newOptions.type !== 'loading' && newOptions.duration !== Infinity) {
      setTimeout(() => {
        hide();
      }, newOptions.duration || 4000);
    }
  }, [fadeAnim, hide]);

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      {visible && options && (
        <Modal
          visible
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={hide}
        >
          <View style={styles.modalOverlay} pointerEvents="box-none">
            <Animated.View
              style={[
                styles.animatedContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
              pointerEvents="auto"
            >
              <View
                style={[
                  styles.toastCard,
                  { borderColor: toastConfig[options.type].border },
                ]}
              >
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={toastConfig[options.type].colors as [ColorValue, ColorValue, ...ColorValue[]]}
                    style={styles.gradientIcon}
                  >
                    {options.type === 'loading' ? (
                      <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <Loader2 size={20} color="white" />
                      </Animated.View>
                    ) : (
                      <View>
                        {React.createElement(toastConfig[options.type].icon, {
                          size: 20,
                          color: 'white',
                          fill: options.type === 'love' ? 'white' : 'none',
                        })}
                      </View>
                    )}
                  </LinearGradient>
                </View>
                <View style={styles.contentContainer}>
                  <Text style={styles.title}>{options.title}</Text>
                  <Text style={styles.message}>{options.message}</Text>
                </View>
                <TouchableOpacity onPress={hide} style={styles.closeButton}>
                  <X size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  animatedContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? Constants.statusBarHeight : 20,
    left: 20,
    right: 20,
  },
  toastCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    flexShrink: 0,
  },
  gradientIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    marginLeft: 16,
    flex: 1,
  },
  title: {    
    color: '#111827',
    fontSize: 14,
    marginBottom: 4,
  },
  message: {
    color: '#4B5563',
    fontSize: 12,
    lineHeight: 18,
  },
  closeButton: {
    marginLeft: 16,
  },
});

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
