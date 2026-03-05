import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
  withDelay,
  withRepeat,
  interpolate,
  runOnJS,
  Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '../ui/Text'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')
const DIAG = Math.sqrt(SCREEN_W * SCREEN_W + SCREEN_H * SCREEN_H)

// Faz zamanları (web ile aynı)
const T_PHASE_1 = 300
const T_PHASE_2 = 1800
const T_PHASE_3 = 3500
const T_PHASE_4 = 5500
const T_FADEOUT = 1000

function StarParticle({
  delay,
  duration,
  angle,
  distance,
}: {
  delay: number
  duration: number
  angle: number
  distance: number
}) {
  const progress = useSharedValue(0)
  useEffect(() => {
    progress.value = withDelay(
      delay * 1000,
      withRepeat(
        withTiming(1, { duration: duration * 1000, easing: Easing.in(Easing.ease) }),
        -1,
        false
      )
    )
  }, [delay, duration])
  const size = 1 + Math.random() * 2
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.2, 1], [0, 1, 0]),
    transform: [
      { rotate: `${angle}deg` },
      { translateX: interpolate(progress.value, [0, 1], [0, distance]) },
    ],
  }))
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#fff',
          left: SCREEN_W / 2,
          top: SCREEN_H / 2,
        },
        style,
      ]}
    />
  )
}

export function SpaceIntroAnimation({
  onComplete,
}: {
  onComplete: () => void
}) {
  const [phase, setPhase] = useState(0)
  const containerOpacity = useSharedValue(1)

  const handleSkip = useCallback(() => {
    setPhase(4)
  }, [])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), T_PHASE_1)
    const t2 = setTimeout(() => setPhase(2), T_PHASE_2)
    const t3 = setTimeout(() => setPhase(3), T_PHASE_3)
    const t4 = setTimeout(() => setPhase(4), T_PHASE_4)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [])

  useEffect(() => {
    if (phase === 4) {
      containerOpacity.value = withTiming(
        0,
        { duration: T_FADEOUT, easing: Easing.out(Easing.ease) },
        () => runOnJS(onComplete)()
      )
    }
  }, [phase, onComplete])

  const bgStars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        key: `bg-${i}`,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 0.5 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.7,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 3,
        color: `hsl(${30 + Math.random() * 60}, 80%, ${60 + Math.random() * 40}%)`,
      })),
    []
  )

  const warpStreaks = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        key: `warp-${i}`,
        angle: (i / 40) * 360,
        length: 60 + Math.random() * 120,
        delay: Math.random() * 400,
        color: `rgba(255, ${155 + Math.random() * 100}, ${100 + Math.random() * 50}, ${0.5 + Math.random() * 0.5})`,
      })),
    []
  )

  const ringParticles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        key: `ring-${i}`,
        angle: (i / 24) * 360,
        distance: (10 + Math.random() * 40) * (SCREEN_W / 100),
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
      })),
    []
  )

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }))

  return (
    <Animated.View
      style={[styles.container, containerAnimatedStyle]}
      pointerEvents={phase < 4 ? 'auto' : 'none'}
    >
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        onPress={handleSkip}
        activeOpacity={1}
        accessibilityLabel="Animasyonu atla"
      >
        <LinearGradient
          colors={['#0a0020', '#020010', '#000008']}
          locations={[0, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Arka plan yıldızları */}
        <View style={styles.bgStarsWrap}>
          {bgStars.map((s) => (
            <BgStar
              key={s.key}
              left={s.left}
              top={s.top}
              size={s.size}
              baseOpacity={s.opacity}
              delay={s.delay}
              duration={s.duration}
              color={s.color}
              visible={phase >= 1}
            />
          ))}
        </View>

        {/* Son faz: warp + merkez parlaklık (ekranın tam ortasında) */}
        <View style={styles.centerAnchor} pointerEvents="none">
          {/* Merkez parlaklık */}
          <View
            style={[
              styles.centralGlow,
              {
                width: phase >= 3 ? DIAG * 2 : phase >= 1 ? 200 : 0,
                height: phase >= 3 ? DIAG * 2 : phase >= 1 ? 200 : 0,
                borderRadius: phase >= 3 ? DIAG : phase >= 1 ? 100 : 0,
              },
            ]}
          >
            <LinearGradient
              colors={
                phase >= 3
                  ? ['rgba(251,191,36,0.3)', 'rgba(139,92,246,0.1)', 'transparent']
                  : ['rgba(251,191,36,0.15)', 'rgba(139,92,246,0.05)', 'transparent']
              }
              locations={[0, 0.3, 0.6]}
              style={styles.glowInner}
            />
          </View>

          {/* Warp çizgileri (faz 3) */}
          {phase >= 3 && (
            <View style={styles.warpWrap}>
              {warpStreaks.map((s) => (
                <WarpStreak
                  key={s.key}
                  angle={s.angle}
                  length={s.length}
                  delay={s.delay}
                  color={s.color}
                />
              ))}
            </View>
          )}
        </View>

        {/* Yüzen parçacık halkası */}
        {phase >= 1 && phase < 3 && (
          <View style={styles.ringWrap}>
            {ringParticles.map((p) => (
              <StarParticle
                key={p.key}
                angle={p.angle}
                distance={p.distance}
                delay={p.delay}
                duration={p.duration}
              />
            ))}
          </View>
        )}

        {/* Başlık + altyazı */}
        <View style={styles.content}>
          <View
            style={[
              styles.titleWrap,
              {
                opacity: phase >= 3 ? 0 : phase >= 1 ? 1 : 0,
                transform: [
                  { translateY: phase >= 1 ? 0 : 20 },
                  { scale: phase >= 3 ? 1.5 : 1 },
                ],
              },
            ]}
          >
            <Text style={styles.title}>UZAY KEŞFİ</Text>
            <View
              style={[
                styles.underline,
                { width: phase >= 1 ? '100%' : '0%' },
              ]}
            />
          </View>

          <Text
            style={[
              styles.subtitle,
              {
                opacity: phase >= 3 ? 0 : phase >= 2 ? 1 : 0,
                transform: [{ translateY: phase >= 2 ? 0 : 15 }],
              },
            ]}
          >
            Sonsuz Evreni Keşfet
          </Text>

          {phase >= 2 && phase < 3 && (
            <View style={styles.warpLabelWrap}>
              <View style={styles.warpLabelLine} />
              <Text style={styles.warpLabel}>Işık Hızına Geçiliyor</Text>
              <View style={styles.warpLabelLine} />
            </View>
          )}
          {phase >= 2 && phase < 3 && (
            <View style={styles.dotsWrap}>
              {[0, 1, 2].map((i) => (
                <LoadDot key={i} index={i} />
              ))}
            </View>
          )}
        </View>

        {phase >= 1 && phase < 4 && (
          <View style={styles.skipWrap}>
            <Text style={styles.skipText}>Atlamak için dokun</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

function BgStar({
  left,
  top,
  size,
  baseOpacity,
  delay,
  duration,
  color,
  visible,
}: {
  left: number
  top: number
  size: number
  baseOpacity: number
  delay: number
  duration: number
  color: string
  visible: boolean
}) {
  const twinkle = useSharedValue(0)
  useEffect(() => {
    if (!visible) return
    twinkle.value = withDelay(
      delay * 1000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: (duration / 2) * 1000 }),
          withTiming(0, { duration: (duration / 2) * 1000 })
        ),
        -1,
        true
      )
    )
  }, [visible, delay, duration])
  const style = useAnimatedStyle(() => ({
    opacity: visible ? baseOpacity * (0.3 + 0.7 * twinkle.value) : 0,
  }))
  return (
    <Animated.View
      style={[
        styles.bgStar,
        {
          left: `${left}%`,
          top: `${top}%`,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  )
}

function WarpStreak({
  angle,
  length,
  delay,
  color,
}: {
  angle: number
  length: number
  delay: number
  color: string
}) {
  const width = useSharedValue(0)
  const opacity = useSharedValue(0)
  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(DIAG, { duration: 800, easing: Easing.in(Easing.ease) })
    )
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 600 })
      )
    )
  }, [])
  const style = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
    transform: [
      { translateX: -width.value / 2 },
      { translateY: -0.5 },
      { rotate: `${angle}deg` },
    ],
  }))
  return (
    <Animated.View
      style={[
        styles.warpStreak,
        { backgroundColor: color },
        style,
      ]}
    />
  )
}

function LoadDot({ index }: { index: number }) {
  const scale = useSharedValue(0.8)
  const opacity = useSharedValue(0.3)
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withDelay(index * 200, withTiming(1.3, { duration: 600 })),
        withTiming(0.8, { duration: 600 })
      ),
      -1,
      true
    )
    opacity.value = withRepeat(
      withSequence(
        withDelay(index * 200, withTiming(1, { duration: 600 })),
        withTiming(0.3, { duration: 600 })
      ),
      -1,
      true
    )
  }, [index])
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))
  return <Animated.View style={[styles.loadDot, style]} />
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgStarsWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgStar: {
    position: 'absolute',
  },
  centerAnchor: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centralGlow: {
    /* Flex parent (centerAnchor) ortalar */
  },
  warpWrap: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 0,
    height: 0,
    overflow: 'visible',
  },
  warpStreak: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 1,
  },
  glowInner: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
  ringWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  titleWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    letterSpacing: 8,
    color: '#fbbf24',
    textShadowColor: 'rgba(251,191,36,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  underline: {
    height: 1,
    marginTop: 16,
    backgroundColor: '#fbbf24',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(253,230,138,0.7)',
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginBottom: 32,
  },
  warpLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  warpLabelLine: {
    width: 32,
    height: 1,
    backgroundColor: 'rgba(251,191,36,0.3)',
  },
  warpLabel: {
    fontSize: 11,
    color: 'rgba(251,191,36,0.5)',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  dotsWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  loadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(251,191,36,0.6)',
  },
  skipWrap: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  skipText: {
    fontSize: 11,
    color: 'rgba(253,230,138,0.5)',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
})
