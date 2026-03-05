import React, { useEffect, useState, useCallback } from 'react'
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/ui/Text'
import { useAuth } from '../../context/AuthContext'
import { dashboardApi } from '../../api/dashboard'
import { useToast } from '../../components/ui/ToastProvider'
import RelationshipProfileModal from '../../components/RelationshipProfileModal'
import {
  Clock,
  Images,
  Feather,
  StickyNote,
  Database,
  ArrowUp,
  Crown,
  Camera,
  Heart,
  ArrowRight,
  LayoutDashboard,
  Rocket
} from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

const DAYS = {
  Pazartesi: 'Pzt',
  Salı: 'Sal',
  Çarşamba: 'Çar',
  Perşembe: 'Per',
  Cuma: 'Cum',
  Cumartesi: 'Cmt',
  Pazar: 'Paz'
}

const WEEK_DAY_ORDER: (keyof typeof DAYS)[] = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar'
]

// Utility functions
const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  if (!sizes[i]) return '0 Bytes'
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const getUserAvatar = (user?: any) => {
  if (user?.avatar?.url) {
    if (user.avatar.url.startsWith('http') || user.avatar.url.startsWith('/')) {
      return { uri: user.avatar.url }
    }
  }
  return user?.gender === 'female' ? require('../../assets/woman-pp.png') : require('../../assets/man-pp.png')
}

export default function DashboardScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { show: showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState<any>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const fetchDashboardData = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setLoading(true)
      try {
        const result = await dashboardApi.getStats(user?.accessToken)
        setData(result)

        // Relationship profile check
        if (!user?.relationshipProfile) {
          setShowProfileModal(true)
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error)
        showToast({
          type: 'error',
          title: 'Hata',
          message: 'Veriler yüklenirken bir sorun oluştu.'
        })
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [user?.accessToken, showToast]
  )

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const onRefresh = () => {
    setRefreshing(true)
    fetchDashboardData(true)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#FF69B4' />
      </View>
    )
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Veriler yüklenemedi</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchDashboardData()}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const { stats, coupleInfo, recentActivities, weeklyActivity = [], distribution = [] } = data
  const storagePercentage = Math.min(Math.round((coupleInfo.storageUsed / coupleInfo.storageLimit) * 100), 100)
  const weeklySorted = (Array.isArray(weeklyActivity) ? weeklyActivity : [])
    .slice()
    .sort(
      (a: any, b: any) =>
        WEEK_DAY_ORDER.indexOf(a.day as keyof typeof DAYS) - WEEK_DAY_ORDER.indexOf(b.day as keyof typeof DAYS)
    )
  const weeklyMaxCount = Math.max(...weeklySorted.map((a: any) => a.count), 1)

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF69B4']} />}
      >
        {/* Header Section — header-section.html: primary #FF6B9D, secondary #C44569, accent #FFA07A */}
        <View style={styles.headerSection}>
          <LinearGradient
            colors={['#FF6B9D', '#C44569', '#FFA07A']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerBlurCircle1} />
            <View style={styles.headerBlurCircle2} />
            <View style={styles.headerInner}>
              <View style={styles.headerAvatarsRow}>
                <View style={styles.headerAvatarWrap}>
                  <Image source={getUserAvatar(coupleInfo?.partner1)} style={styles.headerAvatar} />
                </View>
                <View style={styles.headerAvatarHeart}>
                  <Heart size={20} color='#FF6B9D' fill='#FF6B9D' />
                </View>
                <View style={styles.headerAvatarWrap}>
                  <Image source={getUserAvatar(coupleInfo?.partner2)} style={styles.headerAvatar} />
                </View>
              </View>
              <View style={styles.headerGreeting}>
                <Text style={styles.headerTitle}>
                  {coupleInfo?.partner1?.firstName ?? ''} & {coupleInfo?.partner2?.firstName ?? 'Partner'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        <View style={styles.content}>
          {/* Welcome Section — Özet kart */}
          <View style={styles.welcomeSection}>
            <LinearGradient
              colors={['#FFE4EC', '#FCE7F3', '#FDF2F8']}
              style={styles.welcomeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.welcomeHeader}>
                <View style={styles.welcomeTextBlock}>
                  <Text style={styles.welcomeTitle}>Merhaba {user?.firstName}! 👋</Text>
                  <View style={styles.welcomeBadge}>
                    <Text style={styles.welcomeBadgeText}>✨ Ütopyanız {coupleInfo.daysActive} gündür aktif</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.welcomeStatsLabel}>İçerik özeti</Text>
              <View style={styles.statsGrid}>
                {[
                  { id: 1, label: 'Anı', value: stats.memoryCount, icon: Clock, color: '#E11D48', bg: '#FFF1F2' },
                  { id: 2, label: 'Fotoğraf', value: stats.photoCount, icon: Images, color: '#7C3AED', bg: '#F3E8FF' },
                  { id: 3, label: 'Şiir', value: stats.poemCount, icon: Feather, color: '#D97706', bg: '#FEF3C7' },
                  { id: 4, label: 'Not', value: stats.noteCount, icon: StickyNote, color: '#059669', bg: '#D1FAE5' }
                ].map(stat => (
                  <View key={stat.id} style={styles.statBox}>
                    <View style={[styles.statIconCircle, { backgroundColor: stat.bg }]}>
                      <stat.icon size={22} color={stat.color} strokeWidth={2} />
                    </View>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* Space Explorer CTA */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#0F172A', '#1D2340', '#020617']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.spaceCard}
            >
              <View style={styles.spaceHeaderRow}>
                <View style={styles.spaceIconCircle}>
                  <Rocket size={24} color='#FACC15' />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.spaceTitle}>Uzay Macerası</Text>
                  <Text style={styles.spaceSubtitle}>
                    - İlişkinizi kendi oluşturduğunuz uzayda keşfedin.
                  </Text>
                  <Text style={styles.spaceSubtitle}>
                    - Eklediğiniz her içerik bir gök cismi haline gelir.
                  </Text>
                </View>
              </View>

              <View style={styles.spaceFooterRow}>
                <View style={styles.spaceBadgeRow}>
                  <View style={styles.spaceBadge}>
                    <Text style={styles.spaceBadgeText}>Oyunlaştırılmış deneyim</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.spaceCtaButton}
                  activeOpacity={0.85}
                  onPress={() => router.push('/space-explorer')}
                >
                  <Text style={styles.spaceCtaText}>Uzay’a Git</Text>
                  <ArrowRight size={16} color='#0F172A' />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Storage Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Depolama</Text>
            <View style={styles.storageCard}>
              <View style={styles.storageHeader}>
                <View>
                  <Text style={styles.storageLabel}>Kullanılan Alan</Text>
                  <Text style={styles.storageValue}>{formatBytes(coupleInfo.storageUsed)}</Text>
                </View>
                <View style={styles.storageIconCircle}>
                  <Database size={24} color='#3B82F6' />
                </View>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressTextRow}>
                  <Text style={styles.progressText}>
                    {formatBytes(coupleInfo.storageUsed)} / {formatBytes(coupleInfo.storageLimit)}
                  </Text>
                  <Text style={styles.progressText}>%{storagePercentage}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <LinearGradient
                    colors={['#3B82F6', '#06B6D4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressBarFill, { width: `${storagePercentage}%` }]}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push('/store')}>
                <LinearGradient
                  colors={['#3B82F6', '#06B6D4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.upgradeGradient}
                >
                  <ArrowUp size={18} color='white' />
                  <Text style={styles.upgradeBtnText}>Depolamayı Yükselt</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Premium Promo */}
            <View style={styles.premiumPromo}>
              <View style={styles.premiumIconBox}>
                <Crown size={24} color='white' />
              </View>
              <View style={styles.premiumInfo}>
                <Text style={styles.premiumTitle}>Premium'a Geçin</Text>
                <Text style={styles.premiumText}>Sınırsız fotoğraf, geniş depolama ve tüm premium özellikler!</Text>
                <TouchableOpacity style={styles.premiumBtn} onPress={() => router.push('/store')}>
                  <Text style={styles.premiumBtnText}>Detayları Gör</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
            <View style={styles.activityCard}>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity: any, index: number) => (
                  <View
                    key={activity._id}
                    style={[styles.activityItem, index === recentActivities.length - 1 && { borderBottomWidth: 0 }]}
                  >
                    <View style={styles.activityAvatarBox}>
                      <Image source={getUserAvatar(activity.userId)} style={styles.activityAvatar} />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityDescription}>
                        <Text style={styles.activityUserName}>{activity.userId?.firstName}</Text> {activity.description}
                      </Text>
                      <Text style={styles.activityTime}>
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: tr })}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>Henüz bir aktivite bulunmuyor.</Text>
                </View>
              )}

              <TouchableOpacity style={styles.viewMoreBtn}>
                <Text style={styles.viewMoreText}>Tüm Aktiviteleri Gör</Text>
                <ArrowRight size={16} color='#F43F5E' style={{ marginLeft: 5 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İstatistikler</Text>
            <View style={styles.insightsGrid}>
              {/* Weekly Activity */}
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightTitle}>Haftalık Aktivite</Text>
                  <ArrowUp size={16} color='#F43F5E' />
                </View>
                <View style={styles.chartContainer}>
                  {weeklySorted.map((item: any, i: number) => {
                    const barHeightPct = weeklyMaxCount > 0 ? (item.count / weeklyMaxCount) * 100 : 0
                    return (
                      <View key={item.date || i} style={styles.chartItem}>
                        <View style={styles.chartBarBg}>
                          <LinearGradient
                            colors={['#F43F5E', '#EC4899']}
                            style={[styles.chartBarFill, { height: `${barHeightPct}%` }]}
                          />
                        </View>
                        <Text style={styles.chartLabel} numberOfLines={1}>
                          {DAYS[item.day as keyof typeof DAYS] || item.day}
                        </Text>
                      </View>
                    )
                  })}
                </View>
              </View>

              {/* Content Distribution */}
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightTitle}>İçerik Dağılımı</Text>
                  <Clock size={16} color='#A855F7' />
                </View>
                <View style={styles.distList}>
                  {distribution.map((item: any, i: number) => (
                    <View key={i} style={styles.distItem}>
                      <View style={styles.distLabelRow}>
                        <View style={styles.distLabelGroup}>
                          <View style={[styles.distIndicator, { backgroundColor: getDistColor(item.label) }]} />
                          <Text style={styles.distLabelText}>{item.label}</Text>
                        </View>
                        <Text style={styles.distPercentage}>%{item.percentage}</Text>
                      </View>
                      <View style={styles.distBarBg}>
                        <View
                          style={[
                            styles.distBarFill,
                            { width: `${item.percentage}%`, backgroundColor: getDistColor(item.label) }
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Tips Section */}
          <View style={[styles.section, { marginBottom: 40 }]}>
            <Text style={styles.sectionTitle}>İpuçları & Öneriler</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tipsGrid}>
              {[
                {
                  id: 1,
                  title: 'Düzenli Paylaşım',
                  desc: 'Her gün küçük de olsa bir anınızı paylaşın.',
                  icon: LayoutDashboard,
                  color: '#3B82F6',
                  bg: '#EFF6FF'
                },
                {
                  id: 2,
                  title: 'Fotoğraf Kalitesi',
                  desc: 'Yüksek çözünürlüklü fotoğraflar yükleyin.',
                  icon: Camera,
                  color: '#A855F7',
                  bg: '#F3E8FF'
                },
                {
                  id: 3,
                  title: 'Romantik Sürprizler',
                  desc: 'Zaman kapsülü ile mesajlar bırakın.',
                  icon: Heart,
                  color: '#F43F5E',
                  bg: '#FFF1F2'
                }
              ].map(tip => (
                <View key={tip.id} style={[styles.tipCard, { backgroundColor: tip.bg, borderColor: tip.color + '20' }]}>
                  <View style={[styles.tipIconCircle, { backgroundColor: tip.color }]}>
                    <tip.icon size={20} color='white' />
                  </View>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipDesc}>{tip.desc}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
      <RelationshipProfileModal visible={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </SafeAreaView>
  )
}

const getDistColor = (label: string) => {
  switch (label.toLowerCase()) {
    case 'anılar':
      return '#F43F5E'
    case 'fotoğraflar':
      return '#A855F7'
    case 'şiirler':
      return '#F59E0B'
    case 'notlar':
      return '#10B981'
    default:
      return '#3B82F6'
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF1F2'
  },
  scrollView: {
    flex: 1
  },
  content: {
    padding: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorTitle: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  retryButtonText: {
    color: '#fff'
  },
  headerSection: {
    borderRadius: 0,
    overflow: 'hidden'
  },
  headerGradient: {
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: 'relative'
  },
  headerBlurCircle1: {
    position: 'absolute',
    top: 40,
    left: 40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  headerBlurCircle2: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  headerInner: {
    alignItems: 'center'
  },
  headerLogoImage: {
    width: 64,
    height: 64
  },
  headerLogoBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFA07A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4
  },
  headerGreeting: {
    alignItems: 'center',
    marginTop: 24
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'IndieFlower',
    color: '#fff',
    textAlign: 'center'
  },
  headerAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  headerAvatarWrap: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    borderWidth: 4,
    borderColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  headerAvatar: {
    width: '100%',
    height: '100%'
  },
  headerAvatarHeart: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3
  },
  welcomeSection: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: '#DB2777',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6
  },
  welcomeGradient: {
    padding: 24,
    paddingVertical: 28
  },
  welcomeHeader: {
    marginBottom: 22
  },
  welcomeTextBlock: {
    gap: 10
  },
  welcomeTitle: {
    fontSize: 26,
    color: '#1F2937',
    letterSpacing: 0.2
  },
  welcomeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(219, 39, 119, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20
  },
  welcomeBadgeText: {
    fontSize: 14,
    color: '#BE185D'
  },
  welcomeStatsLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 14,
    letterSpacing: 0.3
  },
  heartIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden'
  },
  heartGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14
  },
  statBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)'
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  statValue: {
    fontSize: 26,
    color: '#111827'
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2
  },
  section: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 22,
    color: '#111827'
  },
  storageCard: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F9FAFB'
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  storageLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5
  },
  storageValue: {
    fontSize: 24,
    color: '#111827'
  },
  storageIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  progressBarContainer: {
    marginBottom: 20
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280'
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4
  },
  upgradeBtn: {
    height: 50,
    borderRadius: 25,
    overflow: 'hidden'
  },
  upgradeGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 15
  },
  premiumPromo: {
    marginTop: 15,
    backgroundColor: '#FFFBEB',
    borderRadius: 25,
    padding: 15,
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#FEF3C7',
    gap: 15
  },
  premiumIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center'
  },
  premiumInfo: {
    flex: 1
  },
  premiumTitle: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4
  },
  premiumText: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 10
  },
  premiumBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start'
  },
  premiumBtnText: {
    color: '#fff',
    fontSize: 12
  },
  spaceCard: {
    borderRadius: 26,
    padding: 18,
    flexDirection: 'column',
    gap: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 6
  },
  spaceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  spaceIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(15,23,42,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248,250,252,0.2)'
  },
  spaceTitle: {
    fontSize: 18,
    color: '#E5E7EB',
    marginBottom: 4
  },
  spaceSubtitle: {
    fontSize: 13,
    color: '#9CA3AF'
  },
  spaceFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  spaceBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1
  },
  spaceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(15,118,110,0.18)'
  },
  spaceBadgeText: {
    fontSize: 11,
    color: '#A5F3FC'
  },
  spaceCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FACC15',
    gap: 6
  },
  spaceCtaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A'
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F9FAFB'
  },
  activityItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
    gap: 12
  },
  activityAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFE4E6',
    overflow: 'hidden'
  },
  activityAvatar: {
    width: '100%',
    height: '100%'
  },
  activityContent: {
    flex: 1
  },
  activityDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20
  },
  activityUserName: {
    color: '#111827'
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2
  },
  viewMoreBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15
  },
  viewMoreText: {
    color: '#F43F5E',
    fontSize: 14
  },
  insightsGrid: {
    gap: 20
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F9FAFB'
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25
  },
  insightTitle: {
    fontSize: 18,
    color: '#111827'
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingBottom: 20
  },
  chartItem: {
    alignItems: 'center',
    flex: 1
  },
  chartBarBg: {
    width: 20,
    height: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  chartBarFill: {
    width: '100%',
    minHeight: 0,
    borderRadius: 6
  },
  chartLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 8
  },
  distList: {
    gap: 20
  },
  distItem: {
    gap: 8
  },
  distLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  distLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  distIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  distLabelText: {
    fontSize: 14,
    color: '#4B5563'
  },
  distPercentage: {
    fontSize: 14,
    color: '#111827'
  },
  distBarBg: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden'
  },
  distBarFill: {
    height: '100%',
    borderRadius: 3
  },
  tipsGrid: {
    gap: 15
  },
  tipCard: {
    width: 200,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1
  },
  tipIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  tipTitle: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 8
  },
  tipDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center'
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14
  },
  footerLogout: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center'
  },
  footerLogoutText: {
    color: '#9CA3AF',
    fontSize: 14,
    textDecorationLine: 'underline'
  }
})
