import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/ui/Text'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  ChevronLeft,
  Heart,
  Star,
  ListChecks,
  Tag,
  CheckCircle2,
  XCircle,
  Clock,
  Plane,
  Trophy,
  Share2
} from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated'

const { width, height } = Dimensions.get('window')
const API_URL = process.env.EXPO_PUBLIC_API_URL || ''

// Floating Heart Component for Background
const FloatingHeart = ({ delay = 0, x = 0, size = 20 }: { delay?: number; x?: number; size?: number }) => {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(1000)}
      style={{
        position: 'absolute',
        left: x,
        top: Math.random() * height,
        opacity: 0.1
      }}
    >
      <Heart size={size} color='#FF69B4' fill='#FF69B4' />
    </Animated.View>
  )
}

export default function QuizAnswersScreen() {
  const { id } = useLocalSearchParams()
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [partner, setPartner] = useState<any>(null)

  useEffect(() => {
    if (id) {
      fetchSessionDetails()
    }
  }, [id])

  const fetchSessionDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/quiz/result/${id}`, {
        headers: { Authorization: `Bearer ${user?.accessToken}` }
      })
      setSession(response.data)

      // Fetch partner info if available
      if (user?.coupleId) {
        const coupleResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${user?.accessToken}` }
        })
        const userData = coupleResponse.data?.data?.user
        const couple = userData?.coupleId
        const partnerInfo =
          couple?.partner1?._id?.toString() === user?._id?.toString() ? couple?.partner2 : couple?.partner1
        setPartner(partnerInfo)
      }
    } catch (error) {
      console.error('Error fetching session details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAvatar = (u: any) => {
    if (u?.avatar?.url) return { uri: u.avatar.url }
    return u?.gender === 'female' ? require('../../assets/woman-pp.png') : require('../../assets/man-pp.png')
  }

  const getSessionScore = (scores: any, userId: string) => {
    if (!scores || !userId) return 0
    const scoresObj = scores instanceof Map ? Object.fromEntries(scores) : scores
    return (
      scoresObj[userId] || Object.entries(scoresObj).find(([sid]) => sid.toString() === userId.toString())?.[1] || 0
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#E11D48' />
      </View>
    )
  }

  if (!session) {
    return (
      <View style={styles.errorContainer}>
        <Text>Quiz bulunamadı.</Text>
        <TouchableOpacity onPress={() => router.navigate('/quiz')}>
          <Text style={{ color: '#E11D48', marginTop: 10 }}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const myScore = getSessionScore(session.scores, user?._id || '')
  const partnerId = Object.keys(session.scores || {}).find(sid => sid.toString() !== user?._id?.toString())
  const partnerScore = partnerId ? getSessionScore(session.scores, partnerId) : 0

  const isWinner = myScore > partnerScore
  const isDraw = myScore === partnerScore

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'favorites':
        return <Heart size={16} color='#6B7280' />
      case 'memories':
        return <Clock size={16} color='#6B7280' />
      case 'dreams':
        return <Plane size={16} color='#6B7280' />
      default:
        return <Tag size={16} color='#6B7280' />
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'favorites':
        return 'Favoriler'
      case 'memories':
        return 'Anılar'
      case 'dreams':
        return 'Hayaller'
      default:
        return category
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#fff0f5', '#f3e5f5', '#e1bee7', '#f8bbd0']} style={StyleSheet.absoluteFill} />

      {/* Background Decorations */}
      <FloatingHeart x={20} delay={0} size={40} />
      <FloatingHeart x={width - 80} delay={2000} size={60} />
      <FloatingHeart x={width / 2} delay={1000} size={30} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.heartIconBox}>
            <Heart size={20} color='#fff' fill='#fff' />
          </View>
          <Text style={styles.headerTitle}>Ciftopia</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={20} color='#4B5563' />
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.titleSection}>
          <View style={styles.badge}>
            <ListChecks size={14} color='#E11D48' />
            <Text style={styles.badgeText}>Tüm Cevaplar</Text>
          </View>
          <Text style={styles.mainTitle}>Quiz Cevapları 📝</Text>
          <Text style={styles.mainSubtitle}>Her sorunun detaylı cevaplarını inceleyin</Text>
        </Animated.View>

        {/* Score Summary Card */}
        <Animated.View entering={ZoomIn.delay(200)} style={styles.scoreSummaryCard}>
          <View style={styles.scoreRow}>
            {/* User */}
            <View style={styles.userScoreInfo}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={myScore >= partnerScore ? ['#FBBF24', '#F59E0B'] : ['#D1D5DB', '#9CA3AF']}
                  style={styles.avatarGradient}
                >
                  <Image source={getAvatar(user)} style={styles.avatarImage} />
                </LinearGradient>
                <View style={[styles.rankBadge, { backgroundColor: myScore >= partnerScore ? '#F59E0B' : '#9CA3AF' }]}>
                  <Text style={styles.rankBadgeText}>{myScore >= partnerScore ? '🥇' : '🥈'}</Text>
                </View>
              </View>
              <View style={styles.userText}>
                <Text style={styles.userNameText}>{user?.firstName}</Text>
                <View style={styles.scoreStatus}>
                  <Text style={styles.correctText}>{myScore} Doğru</Text>
                  <Text style={styles.incorrectText}>{5 - myScore} Yanlış</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Partner */}
            <View style={[styles.userScoreInfo, { flexDirection: 'row-reverse' }]}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={partnerScore >= myScore ? ['#FBBF24', '#F59E0B'] : ['#D1D5DB', '#9CA3AF']}
                  style={styles.avatarGradient}
                >
                  <Image source={getAvatar(partner)} style={styles.avatarImage} />
                </LinearGradient>
                <View
                  style={[
                    styles.rankBadge,
                    { backgroundColor: partnerScore >= myScore ? '#F59E0B' : '#9CA3AF', left: -8, right: undefined }
                  ]}
                >
                  <Text style={styles.rankBadgeText}>{partnerScore >= myScore ? '🥇' : '🥈'}</Text>
                </View>
              </View>
              <View style={[styles.userText, { alignItems: 'flex-end', marginRight: 12, marginLeft: 0 }]}>
                <Text style={styles.userNameText}>{partner?.firstName || 'Partner'}</Text>
                <View style={styles.scoreStatus}>
                  <Text style={styles.correctText}>{partnerScore} Doğru</Text>
                  <Text style={styles.incorrectText}>{5 - partnerScore} Yanlış</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Questions List */}
        <View style={styles.questionsList}>
          {session.details?.map((item: any, index: number) => {
            const mySelfAnswer = item.selfAnswers?.[user?._id || '']
            const partnerSelfAnswer = partnerId ? item.selfAnswers?.[partnerId] : null
            const myGuess = item.guesses?.[user?._id || '']
            const partnerGuess = partnerId ? item.guesses?.[partnerId] : null

            const myResult = myGuess === partnerSelfAnswer
            const partnerResult = partnerGuess === mySelfAnswer

            return (
              <Animated.View key={index} entering={FadeInDown.delay(300 + index * 100)} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <View style={styles.questionNumberBox}>
                    <Text style={styles.questionNumberText}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.questionText}>
                      {session.quizId?.questions?.[index]?.questionText || 'Soru yüklenemedi'}
                    </Text>
                    <View style={styles.categoryRow}>
                      {getCategoryIcon(session.category)}
                      <Text style={styles.categoryText}>{getCategoryName(session.category)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.answersGrid}>
                  {/* My Answer Box */}
                  <View style={[styles.answerBox, myResult ? styles.successBox : styles.failBox]}>
                    <View style={styles.answerUserHeader}>
                      <View style={[styles.miniAvatarContainer, { borderColor: myResult ? '#10B981' : '#EF4444' }]}>
                        <Image source={getAvatar(user)} style={styles.miniAvatar} />
                      </View>
                      <View>
                        <Text style={styles.answerUserName}>{user?.firstName}</Text>
                        <View style={styles.resultBadge}>
                          {myResult ? (
                            <>
                              <CheckCircle2 size={12} color='#047857' />
                              <Text style={[styles.resultBadgeText, { color: '#047857' }]}>Doğru Bildi</Text>
                            </>
                          ) : (
                            <>
                              <XCircle size={12} color='#B91C1C' />
                              <Text style={[styles.resultBadgeText, { color: '#B91C1C' }]}>Yanlış Bildi</Text>
                            </>
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={styles.answerDetails}>
                      <Text style={styles.answerLabel}>Kendi Cevabı:</Text>
                      <Text style={styles.answerValue}>{mySelfAnswer || 'Cevap yok'}</Text>
                      <Text style={styles.answerLabel}>{partner?.firstName || 'Partner'}'in Cevabını Tahmin:</Text>
                      <Text style={[styles.answerValue, myResult ? styles.successValue : styles.failValue]}>
                        {myGuess || 'Tahmin yok'}
                      </Text>
                      {!myResult && partnerSelfAnswer && (
                        <Text style={styles.correctValue}>✓ Doğru: {partnerSelfAnswer}</Text>
                      )}
                    </View>
                  </View>

                  {/* Partner Answer Box */}
                  <View style={[styles.answerBox, partnerResult ? styles.successBox : styles.failBox]}>
                    <View style={styles.answerUserHeader}>
                      <View
                        style={[styles.miniAvatarContainer, { borderColor: partnerResult ? '#10B981' : '#EF4444' }]}
                      >
                        <Image source={getAvatar(partner)} style={styles.miniAvatar} />
                      </View>
                      <View>
                        <Text style={styles.answerUserName}>{partner?.firstName || 'Partner'}</Text>
                        <View style={styles.resultBadge}>
                          {partnerResult ? (
                            <>
                              <CheckCircle2 size={12} color='#047857' />
                              <Text style={[styles.resultBadgeText, { color: '#047857' }]}>Doğru Bildi</Text>
                            </>
                          ) : (
                            <>
                              <XCircle size={12} color='#B91C1C' />
                              <Text style={[styles.resultBadgeText, { color: '#B91C1C' }]}>Yanlış Bildi</Text>
                            </>
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={styles.answerDetails}>
                      <Text style={styles.answerLabel}>Kendi Cevabı:</Text>
                      <Text style={styles.answerValue}>{partnerSelfAnswer || 'Cevap yok'}</Text>
                      <Text style={styles.answerLabel}>{user?.firstName}'in Cevabını Tahmin:</Text>
                      <Text style={[styles.answerValue, partnerResult ? styles.successValue : styles.failValue]}>
                        {partnerGuess || 'Tahmin yok'}
                      </Text>
                      {!partnerResult && mySelfAnswer && (
                        <Text style={styles.correctValue}>✓ Doğru: {mySelfAnswer}</Text>
                      )}
                    </View>
                  </View>
                </View>

                {myResult && partnerResult && (
                  <View style={styles.bothCorrectBadge}>
                    <Star size={14} color='#F59E0B' fill='#F59E0B' />
                    <Text style={styles.bothCorrectText}>Her ikiniz de birbirinizi doğru tahmin ettiniz! 🎉</Text>
                  </View>
                )}
              </Animated.View>
            )
          })}
        </View>

        {/* CTA Buttons */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.ctaSection}>
          <TouchableOpacity onPress={() => router.back()} style={styles.ctaButtonPrimary}>
            <LinearGradient colors={['#F43F5E', '#E11D48']} style={styles.ctaGradient}>
              <Trophy size={20} color='#fff' />
              <Text style={styles.ctaButtonText}>Lobiye Dön</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaButtonSecondary}>
            <Share2 size={20} color='#4B5563' />
            <Text style={styles.ctaButtonSecondaryText}>Cevapları Paylaş</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Ciftopia. Sevgiyle tasarlandı.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F5'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    zIndex: 20
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  heartIconBox: {
    width: 36,
    height: 36,
    backgroundColor: '#E11D48',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  headerTitle: {
    fontSize: 20,
    color: '#1F2937'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  backButtonText: {
    fontSize: 14,
    color: '#4B5563'
  },
  titleSection: {
    alignItems: 'center',
    marginVertical: 20
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.1)'
  },
  badgeText: {
    fontSize: 12,
    color: '#E11D48'
  },
  mainTitle: {
    fontSize: 32,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8
  },
  mainSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center'
  },
  scoreSummaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)'
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  userScoreInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarContainer: {
    position: 'relative'
  },
  avatarGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 2
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#fff'
  },
  rankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  rankBadgeText: {
    fontSize: 12
  },
  userText: {
    marginLeft: 12,
    flex: 1
  },
  userNameText: {
    fontSize: 18,
    color: '#111827'
  },
  scoreStatus: {
    marginTop: 2
  },
  correctText: {
    fontSize: 14,
    color: '#059669'
  },
  incorrectText: {
    fontSize: 14,
    color: '#DC2626'
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 15
  },
  questionsList: {
    gap: 20
  },
  questionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)'
  },
  questionHeader: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20
  },
  questionNumberBox: {
    width: 40,
    height: 40,
    backgroundColor: '#E11D48',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  questionNumberText: {
    color: '#fff',
    fontSize: 18
  },
  questionText: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 4
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280'
  },
  answersGrid: {
    flexDirection: 'row',
    gap: 12
  },
  answerBox: {
    flex: 1,
    borderRadius: 20,
    padding: 12,
    borderWidth: 2
  },
  successBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0'
  },
  failBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA'
  },
  answerUserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  miniAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    padding: 1,
    backgroundColor: '#fff'
  },
  miniAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 16
  },
  answerUserName: {
    fontSize: 14,
    color: '#111827'
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  resultBadgeText: {
    fontSize: 10
  },
  answerDetails: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10
  },
  answerLabel: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2
  },
  answerValue: {
    fontSize: 13,
    color: '#1F2937',
    marginBottom: 8
  },
  successValue: {
    color: '#059669',
    fontSize: 14
  },
  failValue: {
    color: '#B91C1C',
    fontSize: 14,
    textDecorationLine: 'line-through'
  },
  correctValue: {
    fontSize: 11,
    color: '#059669',
    marginTop: -4
  },
  bothCorrectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#DDD6FE'
  },
  bothCorrectText: {
    fontSize: 12,
    color: '#5B21B6',
    flex: 1
  },
  ctaSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30
  },
  ctaButtonPrimary: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16
  },
  ctaButtonSecondary: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8
  },
  ctaButtonSecondaryText: {
    color: '#4B5563',
    fontSize: 16
  },
  footer: {
    marginTop: 40,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF'
  }
})
