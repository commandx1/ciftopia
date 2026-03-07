import React from 'react';
import { View, StyleSheet, Modal, ActivityIndicator, Pressable } from 'react-native';
import { Text } from '../ui/Text';
import { Check } from 'lucide-react-native';
import { romanticRoseTheme } from '../../theme/romanticRose';
import { LinearGradient } from 'expo-linear-gradient';

const theme = romanticRoseTheme;

const STEPS: { step: number; label: string; sublabel: string }[] = [
  { step: 1, label: 'Anılar analiz ediliyor', sublabel: 'Seçtiğiniz anılar inceleniyor' },
  { step: 2, label: 'Hikaye yazılıyor', sublabel: 'Özel hikayeniz oluşturuluyor' },
  { step: 3, label: 'Ses üretiliyor', sublabel: 'Hikâye seslendirmesi oluşturuluyor' },
  { step: 4, label: 'Hikaye hazırlanıyor', sublabel: 'Bitiyor...' },
];

interface GenerateNovelModalProps {
  visible: boolean;
  currentStep: number;
  onClose?: () => void;
}

export function GenerateNovelModal({ visible, currentStep, onClose }: GenerateNovelModalProps) {
  const safeStep = Math.min(4, Math.max(1, currentStep));
  const currentIndex = STEPS.findIndex((s) => s.step === safeStep);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6', '#EC4899']}
            style={styles.header}
          >
            <View style={styles.iconWrap}>
              <View style={styles.iconPulse} />
              <View style={styles.iconInner}>
                <ActivityIndicator size="large" color="white" />
              </View>
            </View>
            <Text style={styles.title}>Hikayeniz Yazılıyor</Text>
            <Text style={styles.subtitle}>Yapay zeka anılarınızı analiz ediyor...</Text>
          </LinearGradient>

          <View style={styles.body}>
            {STEPS.map((step, index) => {
              const isDone = index < activeIndex;
              const isActive = index === activeIndex;
              return (
                <View key={step.step} style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepIcon,
                      isDone && styles.stepIconDone,
                      isActive && styles.stepIconActive,
                    ]}
                  >
                    {isDone ? (
                      <Check size={16} color="white" />
                    ) : isActive ? (
                      <ActivityIndicator size="small" color={theme.accent} />
                    ) : (
                      <View style={styles.stepDot} />
                    )}
                  </View>
                  <View style={styles.stepTextWrap}>
                    <Text
                      style={[
                        styles.stepLabel,
                        isDone && styles.stepLabelDone,
                        !isDone && !isActive && styles.stepLabelPending,
                      ]}
                    >
                      {step.label}
                    </Text>
                    <Text
                      style={[
                        styles.stepSublabel,
                        !isDone && !isActive && styles.stepSublabelPending,
                      ]}
                    >
                      {step.sublabel}
                    </Text>
                  </View>
                </View>
              );
            })}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                İşlem tamamlandığında bildirim alacaksınız. İsterseniz bu pencereyi kapatabilirsiniz.
              </Text>
              {onClose && (
                <Pressable style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>Kapat</Text>
                </Pressable>
              )}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    maxWidth: 360,
    width: '100%',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 80,
    height: 80,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  iconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  body: {
    padding: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.cardSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepIconDone: {
    backgroundColor: theme.accent,
  },
  stepIconActive: {
    backgroundColor: theme.cardSoft,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  stepTextWrap: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 15,
    color: theme.textPrimary,
  },
  stepLabelDone: {
    color: theme.textSecondary,
  },
  stepLabelPending: {
    color: '#9CA3AF',
  },
  stepSublabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  stepSublabelPending: {
    color: '#9CA3AF',
  },
  footer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.cardSoft,
  },
  footerText: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  closeButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.cardSoft,
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 15,
    color: theme.textPrimary,
  },
  tip: {
    marginTop: 16,
    padding: 16,
    backgroundColor: theme.cardSoft,
    borderRadius: 12,
  },
  tipTitle: {
    fontSize: 13,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
});
