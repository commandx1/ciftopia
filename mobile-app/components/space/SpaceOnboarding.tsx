import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated'
import { Text } from '../ui/Text'
import { ChevronRight, MousePointer2, Move, Eye } from 'lucide-react-native'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

interface SpaceOnboardingProps {
  isVisible: boolean
  onComplete: () => void
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Hoş Geldiniz',
    description: 'Burası sizin ortak evreniniz. Paylaştığınız her anı, şiir ve hayal bu boşlukta bir cisim kazanıyor.',
    icon: null,
  },
  {
    id: 'controls',
    title: 'Uzayda Gezinti',
    description: 'Sol joystick ile hareket edebilir, sağ joystick ile etrafına bakabilirsin.',
    highlight: 'joysticks',
  },
  {
    id: 'objects',
    title: 'Yaşayan İçerikler',
    description: 'Yıldızlar şiirleri, gezegenler anıları ve diğer cisimler paylaşımlarınızı temsil eder. Paylaştıkça evreniniz şenlenecek!',
    icon: 'objects',
  },
  {
    id: 'interaction',
    title: 'Keşfet ve Hatırla',
    description: 'Herhangi bir gök cisminin üzerine tıklayarak o içeriği görüntüleyebilirsin.',
    icon: 'tap',
  },
  {
    id: 'growth',
    title: 'Birlikte Büyütün',
    description: 'Ne kadar çok paylaşım yaparsanız, evreniniz o kadar büyüyecek ve zenginleşecek.',
    icon: 'growth',
  },
]

export function SpaceOnboarding({ isVisible, onComplete }: SpaceOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const opacity = useSharedValue(0)
  const contentTranslateY = useSharedValue(20)

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 500 })
      contentTranslateY.value = withTiming(0, { duration: 500 })
    }
  }, [isVisible])

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      contentTranslateY.value = withSequence(
        withTiming(10, { duration: 200 }),
        withTiming(0, { duration: 200 })
      )
      setCurrentStep(prev => prev + 1)
    } else {
      opacity.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(onComplete)()
      })
    }
  }, [currentStep, onComplete])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }))

  if (!isVisible) return null

  const step = STEPS[currentStep]

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Background Dimmer */}
      <View style={styles.dimmer} />

      {/* Highlights */}
      {step.highlight === 'joysticks' && (
        <>
          <View style={[styles.highlightCircle, styles.leftJoystick]} />
          <View style={[styles.highlightCircle, styles.rightJoystick]} />
        </>
      )}

      {/* Content Card */}
      <Animated.View style={[styles.card, contentStyle]}>
        <View style={styles.stepIndicator}>
          {STEPS.map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.dot, 
                i === currentStep && styles.activeDot,
                i < currentStep && styles.completedDot
              ]} 
            />
          ))}
        </View>

        <View style={styles.iconContainer}>
          {step.id === 'welcome' && <View style={styles.pulsePoint} />}
          {step.id === 'controls' && (
            <View style={styles.controlsIconWrap}>
              <Move color="#fbbf24" size={32} />
              <Eye color="#fbbf24" size={32} />
            </View>
          )}
          {step.id === 'interaction' && <MousePointer2 color="#fbbf24" size={40} />}
          {step.id === 'growth' && (
            <View style={styles.growthIconWrap}>
              <View style={[styles.growthDot, { transform: [{ scale: 0.8 }] }]} />
              <View style={[styles.growthDot, { transform: [{ scale: 1.2 }] }]} />
              <View style={[styles.growthDot, { transform: [{ scale: 1.6 }] }]} />
            </View>
          )}
        </View>

        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentStep === STEPS.length - 1 ? 'BAŞLAYALIM' : 'DEVAM ET'}
          </Text>
          <ChevronRight color="#020010" size={20} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  card: {
    width: SCREEN_W * 0.85,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  activeDot: {
    width: 20,
    backgroundColor: '#fbbf24',
  },
  completedDot: {
    backgroundColor: 'rgba(251, 191, 36, 0.5)',
  },
  iconContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    color: '#fef3c7',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  description: {
    fontSize: 15,
    color: 'rgba(254, 243, 199, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbbf24',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  buttonText: {
    color: '#020010',
    fontSize: 14,
    letterSpacing: 1,
  },
  highlightCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  leftJoystick: {
    bottom: 50,
    left: 30,
  },
  rightJoystick: {
    bottom: 50,
    right: 30,
  },
  pulsePoint: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fbbf24',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  controlsIconWrap: {
    flexDirection: 'row',
    gap: 24,
  },
  growthIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  growthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fbbf24',
  },
})
