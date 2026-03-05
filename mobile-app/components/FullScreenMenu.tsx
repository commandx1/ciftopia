import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Modal, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  FadeInDown
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import {
  Home,
  Heart,
  Feather,
  Images,
  StickyNote,
  ListChecks,
  Calendar,
  Hourglass,
  X,
  Settings,
  ChevronRight,
  Sparkles,
  Star,
  LogOut,
  Rocket,
  ShoppingBag,
  Camera,
  HelpCircle,
  Trophy,
  Smile,
  Activity
} from 'lucide-react-native'
import { useAuth } from '../context/AuthContext'
import { dashboardApi } from '../api/dashboard'
import { Text } from './ui/Text'

const { width, height } = Dimensions.get('window')

interface MenuItemProps {
  route: string
  title: string
  subtitle: string
  icon: React.ElementType
  gradient: [string, string]
  badge?: string | number
  badgeNew?: boolean
  onPress: () => void
  delay?: number
}

const MenuItem = ({
  route,
  title,
  subtitle,
  icon: Icon,
  gradient,
  badge,
  badgeNew,
  onPress,
  delay = 0
}: MenuItemProps) => (
  <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.menuIconBox, { backgroundColor: gradient[0] }]}>
        <LinearGradient colors={gradient} style={styles.menuIconGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Icon size={22} color='#fff' />
        </LinearGradient>
      </View>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {badge !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {badgeNew && (
          <View style={styles.badgeNew}>
            <Text style={styles.badgeNewText}>Yeni</Text>
          </View>
        )}
        <ChevronRight size={18} color='rgba(255,255,255,0.4)' />
      </View>
    </TouchableOpacity>
  </Animated.View>
)

const FloatingDecor = ({
  icon: Icon,
  delay = 0,
  top,
  left,
  right,
  bottom
}: {
  icon: React.ElementType
  delay?: number
  top?: number
  left?: number
  right?: number
  bottom?: number
}) => {
  const translateY = useSharedValue(0)
  const opacity = useSharedValue(0.2)

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.25, { duration: 1000 }))
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-15, {
          duration: 3000 + Math.random() * 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        }),
        -1,
        true
      )
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
    position: 'absolute',
    top,
    left,
    right,
    bottom
  }))

  return (
    <Animated.View style={animatedStyle}>
      <Icon size={36} color='rgba(255,255,255,0.3)' />
    </Animated.View>
  )
}

interface FullScreenMenuProps {
  visible: boolean
  onClose: () => void
}

export default function FullScreenMenu({ visible, onClose }: FullScreenMenuProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [coupleInfo, setCoupleInfo] = useState<{
    coupleName?: string
    daysActive?: number
    partner1?: any
    partner2?: any
  } | null>(null)

  useEffect(() => {
    if (visible && user?.accessToken) {
      dashboardApi
        .getStats(user.accessToken)
        .then(res => setCoupleInfo(res?.coupleInfo || null))
        .catch(() => setCoupleInfo(null))
    } else {
      setCoupleInfo(null)
    }
  }, [visible, user?.accessToken])

  const navigateAndClose = (route: string) => {
    onClose()
    // Use expo-router navigation instead of navigation prop
    // This is safer as it handles nested navigators correctly in Expo Router
    router.push(`/(drawer)/${route}` as any)
  }

  const coupleName =
    coupleInfo?.coupleName ||
    (user?.coupleId?.partner1 && user?.coupleId?.partner2
      ? `${user.coupleId.partner1.firstName} & ${user.coupleId.partner2.firstName}`
      : `${user?.firstName || ''} & Partner`)

  return (
    <Modal visible={visible} animationType='slide' transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(220, 120, 155, 0.98)', 'rgba(255, 155, 185, 0.98)', 'rgba(220, 120, 155, 0.98)']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <FloatingDecor icon={Heart} delay={0} top={height * 0.25} left={width * 0.15} />
          <FloatingDecor icon={Sparkles} delay={500} top={height * 0.3} right={width * 0.2} />
          <FloatingDecor icon={Star} delay={1000} bottom={height * 0.35} left={width * 0.25} />
          <FloatingDecor icon={Heart} delay={1500} top={height * 0.5} right={width * 0.25} />
          <FloatingDecor icon={Heart} delay={2000} bottom={height * 0.25} right={width * 0.2} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoCircle}>
                <Image source={require('../assets/logo.png')} style={styles.logo} />
              </View>
              <View>
                <Text style={styles.brandTitle}>Çiftopia</Text>
                <Text style={styles.brandSubtitle}>Aşkınızın dijital evi</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={24} color='#fff' />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.menuScroll}
            contentContainerStyle={styles.menuScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionLabel}>Ana Menü</Text>
            <View style={styles.menuGroup}>
              <MenuItem
                route='dashboard'
                title='Anasayfa'
                subtitle='Aşk hikayenizin merkezi'
                icon={Home}
                gradient={['#F472B6', '#EC4899']}
                onPress={() => navigateAndClose('dashboard')}
                delay={100}
              />
              <MenuItem
                route='memories'
                title='Anılarımız'
                subtitle='Özel anları ölümsüzleştir'
                icon={Camera}
                gradient={['#F472B6', '#DB2777']}
                onPress={() => navigateAndClose('memories')}
                delay={150}
              />
              <MenuItem
                route='poems'
                title='Şiirlerimiz'
                subtitle='Kalbe dokunan sözler'
                icon={Feather}
                gradient={['#FB7185', '#E11D48']}
                onPress={() => navigateAndClose('poems')}
                delay={200}
              />
              <MenuItem
                route='gallery'
                title='Galeri'
                subtitle='Fotoğraf albümlerimiz'
                icon={Images}
                gradient={['#FBBF24', '#F59E0B']}
                onPress={() => navigateAndClose('gallery')}
                delay={250}
              />
              <MenuItem
                route='notes'
                title='Notlarımız'
                subtitle='Birbirimize küçük mesajlar'
                icon={StickyNote}
                gradient={['#FACC15', '#EAB308']}
                onPress={() => navigateAndClose('notes')}
                delay={300}
              />
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Özel Alanlar</Text>
            <View style={styles.menuGroup}>
              <MenuItem
                route='bucket-list'
                title='Bucket List'
                subtitle='Birlikte yapmak istediklerimiz'
                icon={ListChecks}
                gradient={['#34D399', '#10B981']}
                onPress={() => navigateAndClose('bucket-list')}
                delay={350}
              />
              <MenuItem
                route='important-dates'
                title='Önemli Tarihler'
                subtitle='Unutulmaz günlerimiz'
                icon={Calendar}
                gradient={['#60A5FA', '#4F46E5']}
                onPress={() => navigateAndClose('important-dates')}
                delay={400}
              />
              <MenuItem
                route='time-capsule'
                title='Zaman Kapsülü'
                subtitle='Geleceğe mesajlar'
                icon={Hourglass}
                gradient={['#A78BFA', '#7C3AED']}
                onPress={() => navigateAndClose('time-capsule')}
                delay={450}
              />
              <MenuItem
                route='space-explorer'
                title='Uzay Keşfi'
                subtitle='Aşkınız sonsuzlukta'
                icon={Rocket}
                gradient={['#1E293B', '#475569']}
                onPress={() => navigateAndClose('space-explorer')}
                delay={475}
              />
            </View>

            <View style={styles.extraMenu}>
              <MenuItem
                route='daily-question'
                title='Günün Sorusu'
                subtitle='Her gün bir soru'
                icon={HelpCircle}
                gradient={['#F472B6', '#EC4899']}
                onPress={() => navigateAndClose('daily-question')}
                delay={500}
              />
              <MenuItem
                route='activities'
                title='Güncellemeler'
                subtitle='Son aktivitelerinizi görün'
                icon={Activity}
                gradient={['#F472B6', '#EC4899']}
                onPress={() => navigateAndClose('activities')}
                delay={550}
              />
              <MenuItem
                route='quiz'
                title='Aşk Quizi'
                subtitle='Birbirinizi keşfedin'
                icon={Trophy}
                gradient={['#F472B6', '#EC4899']}
                onPress={() => navigateAndClose('quiz')}
                delay={600}
              />
              <MenuItem
                route='mood-calendar'
                title='Ruh Hali Takvimi'
                subtitle='Duygusal takip'
                icon={Smile}
                gradient={['#F472B6', '#EC4899']}
                onPress={() => navigateAndClose('mood-calendar')}
                delay={650}
              />
              <MenuItem
                route='store'
                title='Mağaza'
                subtitle='Premium ve ek içerikler'
                icon={ShoppingBag}
                gradient={['#F472B6', '#EC4899']}
                onPress={() => navigateAndClose('store')}
                delay={700}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <LinearGradient
              colors={['#DB2777', 'transparent']}
              style={styles.footerGradient}
              start={{ x: 0.5, y: 1 }}
              end={{ x: 0.5, y: 0 }}
            />
            <View style={styles.footerCard}>
              <View style={styles.footerGrid}>
                <TouchableOpacity
                  style={styles.footerButton}
                  onPress={() => {
                    navigateAndClose('settings')
                  }}
                >
                  <Settings size={22} color='#fff' />
                  <Text style={styles.footerButtonText}>Ayarlar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton}>
                  <Star size={22} color='#fff' />
                  <Text style={styles.footerButtonText}>Tema</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton} onPress={() => navigateAndClose('store')}>
                  <Heart size={22} color='#fff' />
                  <Text style={styles.footerButtonText}>Mağaza</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton}>
                  <Sparkles size={22} color='#fff' />
                  <Text style={styles.footerButtonText}>Yardım</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.footerButton}
                  onPress={() => {
                    onClose()
                    signOut()
                  }}
                >
                  <LogOut size={22} color='#fff' />
                  <Text style={styles.footerButtonText}>Çıkış</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  gradient: {
    flex: 1,
    paddingTop: 10
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    zIndex: 10
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: '#ffffff99',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    width: '70%',
    height: '70%'
  },
  brandTitle: {
    color: '#fff',
    fontSize: 20
  },
  brandSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuScroll: {
    flex: 1,
    zIndex: 10
  },
  menuScrollContent: {
    paddingHorizontal: 24
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 8
  },
  menuGroup: {
    gap: 8
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 16,
    marginBottom: 8
  },
  menuIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden'
  },
  menuIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuItemContent: {
    flex: 1
  },
  menuItemTitle: {
    color: '#fff',
    fontSize: 16
  },
  menuItemSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 2
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeText: {
    color: '#fff',
    fontSize: 12
  },
  badgeNew: {
    backgroundColor: 'rgba(250,204,21,0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeNewText: {
    color: '#FEF3C7',
    fontSize: 12
  },
  extraMenu: {
    gap: 8
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 20
  },
  footerGradient: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    height: 45,
    opacity: 0.5
  },
  footerCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  footerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  footerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 12
  }
})
