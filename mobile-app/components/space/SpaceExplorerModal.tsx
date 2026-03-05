import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  LayoutChangeEvent
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  Easing,
  interpolate
} from 'react-native-reanimated'
import { Text } from '../ui/Text'
import { X, Info, Rocket, Sparkles, Star, Zap, ArrowRight } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SpaceItemType } from '../../constants/space-assets'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

const MAX_LEVEL = 15

interface SpaceExplorerModalProps {
  visible: boolean
  onClose: () => void
  title: string
  description?: string
  iconType?: SpaceItemType
  /** Seviye (0–15), progress bar için */
  level?: number
  /** İlgili sayfaya git butonu (örn. "Şiir Defterine Git") */
  goToPageLabel?: string
  onGoToPage?: () => void
}

export function SpaceExplorerModal({
  visible,
  onClose,
  title,
  description = 'Bu gizemli gök cismi hakkında daha fazla bilgi keşfedilmeyi bekliyor. Uzayın derinliklerindeki bu yolculuğunda yeni maceralara hazır ol!',
  iconType = 'planet_a',
  level = 0,
  goToPageLabel,
  onGoToPage
}: SpaceExplorerModalProps) {
  const progress = Math.min(1, Math.max(0, level / MAX_LEVEL))
  const [trackWidth, setTrackWidth] = useState(0)
  const fillWidthShared = useSharedValue(0)
  const shimmerShared = useSharedValue(0)

  useEffect(() => {
    if (!visible || trackWidth <= 0) return
    fillWidthShared.value = 0
    fillWidthShared.value = withSpring(progress * trackWidth, {
      damping: 15,
      stiffness: 100
    })
  }, [visible, progress, trackWidth])

  useEffect(() => {
    if (!visible) return
    shimmerShared.value = 0
    shimmerShared.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.linear }), -1, false)
  }, [visible])

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    if (w > 0) setTrackWidth(w)
  }

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: fillWidthShared.value
  }))

  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    const fillW = fillWidthShared.value
    const shimmerW = fillW * 0.55
    return {
      width: shimmerW,
      transform: [
        {
          translateX: interpolate(shimmerShared.value, [0, 1], [-shimmerW, shimmerW])
        }
      ]
    }
  })

  const getIcon = () => {
    switch (iconType) {
      case 'star':
        return <Star size={24} color='#fbbf24' style={styles.icon} />
      case 'comet':
        return <Zap size={24} color='#fbbf24' style={styles.icon} />
      case 'ufo':
        return <Rocket size={24} color='#a78bfa' style={styles.icon} />
      default:
        return <Rocket size={24} color='#fbbf24' style={styles.icon} />
    }
  }

  const getTypeName = () => {
    switch (iconType) {
      case 'star':
        return 'Yıldız'
      case 'comet':
        return 'Kuyruklu Yıldız'
      case 'ufo':
        return 'UFO'
      case 'planet_a':
      case 'planet_b':
      case 'planet_c':
        return 'Gezegen'
      default:
        return 'Gök Cismi'
    }
  }

  return (
    <Modal visible={visible} animationType='fade' transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Neon Border Effect */}
          <View style={styles.neonBorder} />

          <View style={styles.contentWrapper}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                {getIcon()}
                <Text style={styles.headerTitle}>{title.toUpperCase()}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color='#fde68a' />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              <View style={styles.infoBox}>
                <Info size={18} color='#fbbf24' style={styles.infoIcon} />
                <Text style={styles.description}>{description}</Text>
              </View>

              <View style={styles.progressWrap}>
                <View style={styles.progressTrack} onLayout={onTrackLayout}>
                  <Animated.View style={[styles.progressFill, fillAnimatedStyle]}>
                    <Animated.View style={[styles.progressShimmer, shimmerAnimatedStyle]} />
                  </Animated.View>
                </View>
                <Text style={styles.progressLabel}>
                  Seviye {level}/{MAX_LEVEL}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Tür</Text>
                <Text style={styles.statValue}>{getTypeName()}</Text>
              </View>

              {goToPageLabel != null && onGoToPage != null && (
                <TouchableOpacity style={styles.goToPageBtn} onPress={onGoToPage} activeOpacity={0.8}>
                  <Text style={styles.goToPageLabel}>{goToPageLabel}</Text>
                  <ArrowRight size={18} color='#fbbf24' />
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={onClose} style={styles.actionBtn}>
                <LinearGradient
                  colors={['#fbbf24', '#d97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientBtn}
                >
                  <Text style={styles.actionBtnText}>KEŞFETMEYE DEVAM ET</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 0, 16, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#0a0a20',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#fbbf24',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 15
      },
      android: {
        elevation: 10
      }
    })
  },
  neonBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.1)',
    zIndex: -1
  },
  contentWrapper: {
    padding: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  icon: {
    opacity: 0.9
  },
  headerTitle: {
    fontSize: 20,
    color: '#fbbf24',
    letterSpacing: 3,
    textShadowColor: 'rgba(251, 191, 36, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  body: {
    maxHeight: SCREEN_H * 0.5
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.1)',
    marginBottom: 20
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2
  },
  description: {
    flex: 1,
    fontSize: 14,
    color: '#e5e7eb',
    lineHeight: 22,
    opacity: 0.9
  },
  progressWrap: {
    marginBottom: 20
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    overflow: 'hidden',
    marginBottom: 6
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#fbbf24',
    overflow: 'hidden'
  },
  progressShimmer: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  progressLabel: {
    fontSize: 11,
    color: 'rgba(251, 191, 36, 0.7)',
    letterSpacing: 1
  },
  statItem: {
    width: '50%',
    marginRight: 'auto',
    marginLeft: 'auto',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(251, 191, 36, 0.6)',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  statValue: {
    fontSize: 14,
    color: '#fff'
  },
  goToPageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)'
  },
  goToPageLabel: {
    fontSize: 13,
    color: '#fbbf24',
  },
  actionBtn: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8
  },
  gradientBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionBtnText: {
    color: '#000',
    fontSize: 14,
    letterSpacing: 2
  }
})
