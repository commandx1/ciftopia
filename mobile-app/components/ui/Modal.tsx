import React from 'react';
import {
  View,
  StyleSheet,
  Modal as RNModal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text } from './Text';
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  headerIcon?: React.ReactNode;
  headerColors?: readonly [string, string, ...string[]];
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeight?: number | string;
}

export const CustomModal = ({
  visible,
  onClose,
  title,
  subtitle,
  headerIcon,
  headerColors,
  children,
  footer,
  maxHeight = '92%',
}: ModalProps) => {
  return (
    <RNModal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.keyboardView, { maxHeight: (maxHeight as any) }]}
        >
          <View style={styles.container}>
            {/* Header */}
            {headerColors ? (
              <LinearGradient colors={headerColors} style={styles.header}>
                <View style={styles.headerLeft}>
                  {headerIcon && <View style={styles.iconBox}>{headerIcon}</View>}
                  <View>
                    {title && <Text style={styles.headerTitleLight}>{title}</Text>}
                    {subtitle && <Text style={styles.headerSubtitleLight}>{subtitle}</Text>}
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={24} color="white" />
                </TouchableOpacity>
              </LinearGradient>
            ) : (
              <View style={styles.headerPlain}>
                <View style={styles.headerLeft}>
                  {headerIcon && <View style={styles.iconBoxPlain}>{headerIcon}</View>}
                  <View>
                    {title && <Text style={styles.headerTitle}>{title}</Text>}
                    {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
            )}

            {/* Content */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
              {children}
            </ScrollView>

            {/* Footer */}
            {footer && <View style={styles.footer}>{footer}</View>}
          </View>
        </KeyboardAvoidingView>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
    maxHeight: '92%',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    paddingTop: 30,
  },
  headerPlain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxPlain: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#111827',
  },
  headerTitleLight: {
    fontSize: 20,
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerSubtitleLight: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  closeBtn: {
    padding: 5,
  },
  content: {
    width: '100%',
    height: '100%',
  },
  footer: {
    width: '100%',
  },
});
