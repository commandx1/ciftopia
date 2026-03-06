import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/ui/Text'
import { useRouter } from 'expo-router'
import { QuizCard } from '../../components/quiz/QuizCard'
import {
  Heart,
  Trophy as TrophyIcon,
  ChevronLeft,
  Star,
  Clock as ClockIcon,
  Bell,
  User as UserIcon,
  CheckCircle2,
  Crown,
  Target,
  Flag,
  Medal,
  Zap,
  Play,
  Lightbulb,
  MessageCircle,
  Smile,
  RotateCw,
  TrendingUp,
  Users,
  ChevronDown,
  Lock
} from 'lucide-react-native'
import { useAuth } from '../../context/AuthContext'
import { usePlanLimits } from '../../context/PlanLimitsContext'
import axios from 'axios'
import io from 'socket.io-client'
import { LinearGradient } from 'expo-linear-gradient'
import { ScoreCard } from '@/components/quiz/ScoreCard'
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated'

const { width, height } = Dimensions.get('window')

const API_URL = process.env.EXPO_PUBLIC_API_URL || ''

// Floating Heart Component for Background
const FloatingHeart = ({ delay = 0, x = 0, size = 20 }: { delay?: number; x?: number; size?: number }) => {
  const translateY = useSharedValue(0)
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.5)

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.6, { duration: 1000 }))
    scale.value = withDelay(delay, withTiming(1, { duration: 1000 }))
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-height, {
          duration: 6000 + Math.random() * 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        }),
        -1,
        false
      )
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
    left: x,
    position: 'absolute',
    bottom: -50
  }))

  return (
    <Animated.View style={animatedStyle}>
      <Heart size={size} color='#FF69B4' fill='#FF69B4' opacity={0.2} />
    </Animated.View>
  )
}
const SOCKET_URL = API_URL.replace('/v1', '') // Adjust based on your API structure

export default function QuizScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const { planCode, limits } = usePlanLimits()
  const token = user?.accessToken
  const [activeSession, setActiveSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [recentSessions, setRecentSessions] = useState<any[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(15)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [status, setStatus] = useState<'lobby' | 'waiting' | 'generating' | 'playing' | 'finished'>('lobby')
  const [participantCount, setParticipantCount] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [partner, setPartner] = useState<any>(null)
  const [triviaIndex, setTriviaIndex] = useState(0)
  const [recentOffset, setRecentOffset] = useState(0)
  const [hasMoreRecent, setHasMoreRecent] = useState(true)
  const [loadingMoreRecent, setLoadingMoreRecent] = useState(false)
  const [todayQuizUsed, setTodayQuizUsed] = useState(0)
  const [todayQuizLimit, setTodayQuizLimit] = useState(2)

  const trivias = [
    'Çiftlerin birbirlerinin gözlerine 3 dakika boyunca bakmaları, kalp atışlarının senkronize olmasına neden olabilir.',
    'Sarılmak, vücudunuzda oksitosin hormonunu artırarak stresi azaltır ve mutluluk hissi verir.',
    'Dünyadaki en uzun öpücük rekoru 58 saat, 35 dakika ve 58 saniyedir.',
    "Penguenler ömür boyu tek eşli kalır ve eşlerine 'evlenme teklifi' olarak en pürüzsüz çakıl taşını hediye ederler."
  ]

  const socketRef = useRef<any>(null)
  const timerRef = useRef<any>(null)

  useEffect(() => {
    // Lobideyken or sayfa ilk açıldığında socket varsa kapat ve oturumu tazele
    if (status === 'lobby') {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      // Kısa bir gecikme ile kontrol et (backend'in temizlik yapmasına zaman tanıyalım)
      setTimeout(() => {
        checkActiveSession()
      }, 800)
    }
  }, [status])

  useEffect(() => {
    const interval = setInterval(() => {
      setTriviaIndex(prev => (prev + 1) % trivias.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const fetchTodayQuizStats = useCallback(async () => {
    if (!token) return
    try {
      const res = await axios.get(`${API_URL}/quiz/today-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTodayQuizUsed(res.data?.used ?? 0)
      setTodayQuizLimit(res.data?.limit ?? 2)
    } catch {
      setTodayQuizUsed(0)
      setTodayQuizLimit(limits.dailyQuiz ?? 2)
    }
  }, [token, limits.dailyQuiz])

  useEffect(() => {
    if (token) {
      fetchRecentSessions()
      checkActiveSession()
      fetchPartner()
      fetchTodayQuizStats()
    }
    return () => {
      if (socketRef.current) socketRef.current.disconnect()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [token])

  const fetchPartner = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const userData = response.data?.data?.user
      if (userData?.coupleId) {
        const couple = userData.coupleId
        const partnerInfo =
          couple.partner1?._id?.toString() === userData._id?.toString() ? couple.partner2 : couple.partner1
        setPartner(partnerInfo)
      }
    } catch (error) {
      console.error('Error fetching partner:', error)
    }
  }

  const notifyPartner = async () => {
    try {
      await axios.post(
        `${API_URL}/quiz/session/notify`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      Alert.alert('Başarılı', 'Partnerinize haber verildi! ❤️')
    } catch (error) {
      console.error('Error notifying partner:', error)
    }
  }

  const fetchRecentSessions = async (loadMore = false) => {
    if (loadingMoreRecent) return
    try {
      if (loadMore) setLoadingMoreRecent(true)
      const offset = loadMore ? recentOffset + 5 : 0
      const response = await axios.get(`${API_URL}/quiz/recent`, {
        params: { offset, limit: 5 },
        headers: { Authorization: `Bearer ${token}` }
      })

      const newSessions = response.data
      if (loadMore) {
        setRecentSessions(prev => [...prev, ...newSessions])
        setRecentOffset(offset)
      } else {
        setRecentSessions(newSessions)
        setRecentOffset(0)
      }

      if (newSessions.length < 5) {
        setHasMoreRecent(false)
      } else {
        setHasMoreRecent(true)
      }
    } catch (error) {
      console.error('Error fetching recent sessions:', error)
    } finally {
      if (loadMore) setLoadingMoreRecent(false)
    }
  }

  const checkActiveSession = async () => {
    try {
      const response = await axios.get(`${API_URL}/quiz/active`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data) {
        setActiveSession(response.data)
      } else {
        setActiveSession(null)
      }
    } catch (error) {
      console.error('Error checking active session:', error)
      setActiveSession(null)
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([fetchRecentSessions(), checkActiveSession(), fetchTodayQuizStats()])
    setRefreshing(false)
  }, [token, fetchTodayQuizStats])

  const cancelQuiz = async () => {
    if (!activeSession) {
      setStatus('lobby')
      return
    }
    try {
      await axios.post(
        `${API_URL}/quiz/session/cancel`,
        { sessionId: activeSession._id },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      if (socketRef.current) socketRef.current.disconnect()
      setActiveSession(null)
      setStatus('lobby')
      checkActiveSession()
    } catch (error) {
      console.error('Error cancelling quiz:', error)
      setStatus('lobby')
    }
  }

  const startNewQuiz = async (category = 'favorites') => {
    if (loading) return
    const isFreePlan = planCode === 'free'
    const dailyLimit = limits.dailyQuiz ?? 2
    if (isFreePlan && typeof dailyLimit === 'number' && dailyLimit >= 0 && todayQuizUsed >= dailyLimit) {
      Alert.alert(
        'Günlük limit doldu',
        'Bugün en fazla 2 quiz çözebilirsiniz. Yarın tekrar deneyebilir veya Premium ile sınırsız quiz çözebilirsiniz.'
      )
      return
    }
    try {
      setLoading(true)
      const response = await axios.post(
        `${API_URL}/quiz/session`,
        { category },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      const session = response.data
      setActiveSession(session)
      connectSocket(session._id)
      if (session.status === 'waiting') {
        setStatus('waiting')
      } else if (session.status === 'in_progress') {
        setStatus('playing')
      }
    } catch (error: any) {
      const msg = error.response?.status === 403
        ? (error.response?.data?.message || 'Günlük quiz limitine ulaştınız.')
        : 'Quiz başlatılamadı.'
      Alert.alert('Hata', msg)
    } finally {
      setLoading(false)
    }
  }

  const connectSocket = (sessionId: string) => {
    const socket = io(`${SOCKET_URL}/quiz`, {
      auth: { token },
      transports: ['websocket']
    })

    socket.on('connect', () => {
      socket.emit('join:quiz', { sessionId, userId: user?._id })
    })

    socket.on('player:joined', (data: any) => {
      setParticipantCount(data.participantCount)
    })

    socket.on('quiz:generating', () => {
      setStatus('generating')
    })

    socket.on('quiz:state', (session: any) => {
      setActiveSession(session)
      if (session.scores) {
        setScores(session.scores)
      }
      if (session.status === 'in_progress') {
        setStatus('playing')
      } else if (session.status === 'waiting') {
        setStatus('waiting')
      }
    })

    socket.on('quiz:start', (session: any) => {
      setActiveSession(session)
      if (session.scores) {
        setScores(session.scores)
      }
      setStatus('playing')
    })

    socket.on('question:new', (data: any) => {
      setCurrentQuestion(data)
      setSelectedOption(null)
      setIsReady(false)
      if (data.type === 'guess') {
        setTimeLeft(15)
        startTimer()
      } else {
        setTimeLeft(0)
        if (timerRef.current) clearInterval(timerRef.current)
      }
    })

    socket.on('question:result', (data: any) => {
      if (data.scores) {
        setScores(data.scores)
      }
    })

    socket.on('player:ready', (data: any) => {
      if (data.userId === user?._id) {
        setIsReady(true)
      }
    })

    socket.on('step:guessing_start', () => {
      setSelectedOption(null)
      setIsReady(false)
    })

    socket.on('player:waiting_partner', (data: any) => {
      setIsReady(true)
    })

    socket.on('stage:changed', (data: any) => {
      setIsReady(false)
      setSelectedOption(null)
    })

    socket.on('quiz:finished', (session: any) => {
      setActiveSession(session)
      if (session.scores) {
        setScores(session.scores)
      }
      setStatus('finished')
      fetchRecentSessions()
      fetchTodayQuizStats()
      if (timerRef.current) clearInterval(timerRef.current)
    })

    socketRef.current = socket
  }

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    if (status === 'playing' && currentQuestion?.type === 'guess' && timeLeft === 0) {
      handleSubmitAnswer(true)
    }
  }, [timeLeft, status, currentQuestion])

  const handleSubmitAnswer = (isTimeout = false) => {
    if (!activeSession || !currentQuestion) return
    if (currentQuestion.type === 'self' && !selectedOption) return
    socketRef.current.emit('answer:submit', {
      sessionId: activeSession._id,
      userId: user?._id,
      answer: selectedOption || (isTimeout ? 'Süre Doldu' : 'Pas Geçti'),
      type: currentQuestion.type
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Bugün'
    if (diffInDays === 1) return 'Dün'
    if (diffInDays < 7) return `${diffInDays} gün önce`
    return date.toLocaleDateString('tr-TR')
  }

  const getSessionScore = (sessionScores: any, id: string | undefined) => {
    if (!id || !sessionScores) return 0
    const scoresObj = sessionScores instanceof Map ? Object.fromEntries(sessionScores) : sessionScores
    return scoresObj[id] || Object.entries(scoresObj).find(([sid]) => sid.toString() === id.toString())?.[1] || 0
  }

  const getUserAvatar = () => {
    if (user?.avatar?.url) return { uri: user.avatar.url }
    return user?.gender === 'female' ? require('../../assets/woman-pp.png') : require('../../assets/man-pp.png')
  }

  const getPartnerAvatar = () => {
    if (partner?.avatar?.url) return { uri: partner.avatar.url }
    return partner?.gender === 'female' ? require('../../assets/woman-pp.png') : require('../../assets/man-pp.png')
  }

  const calculateStats = () => {
    let correct = 0
    let pCorrect = 0
    let myWins = 0
    let partnerWins = 0
    let draws = 0
    const total = (recentSessions?.length || 0) * 5

    recentSessions?.forEach((session: any) => {
      const myScore = getSessionScore(session.scores, user?._id) as number
      correct += myScore

      const pId = Object.keys(session.scores || {}).find(id => id.toString() !== user?._id?.toString())
      const partnerScore = getSessionScore(session.scores, pId) as number
      pCorrect += partnerScore

      if (myScore > partnerScore) myWins++
      else if (partnerScore > myScore) partnerWins++
      else draws++
    })

    const successRate = total > 0 ? Math.round((correct / total) * 100) : 0
    const pSuccessRate = total > 0 ? Math.round((pCorrect / total) * 100) : 0

    return {
      correct,
      total,
      successRate,
      pSuccessRate,
      incorrect: total - correct,
      myWins,
      partnerWins,
      draws,
      totalQuizzes: recentSessions?.length || 0,
      lastScore: (recentSessions?.length || 0) > 0 ? getSessionScore(recentSessions[0].scores, user?._id) : 0,
      partnerLastScore:
        (recentSessions?.length || 0) > 0 && partner ? getSessionScore(recentSessions[0].scores, partner?._id) : 0
    }
  }

  const stats = calculateStats()

  if (status === 'waiting') {
    return (
      <SafeAreaView style={styles.waitingScreen} edges={['bottom']}>
        <LinearGradient colors={['#FFF0F5', '#F3E5F5', '#E1BEE7']} style={StyleSheet.absoluteFill} />

        <FloatingHeart x={20} delay={0} size={40} />
        <FloatingHeart x={width * 0.4} delay={1500} size={60} />
        <FloatingHeart x={width * 0.7} delay={800} size={50} />
        <FloatingHeart x={width * 0.2} delay={2500} size={45} />
        <FloatingHeart x={width * 0.8} delay={3500} size={35} />

        <Animated.View entering={FadeInDown.duration(800)} style={styles.waitingCard}>
          <View style={styles.cardHeader}>
            <View style={styles.statusBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.statusBadgeText}>Bağlantı Bekleniyor</Text>
            </View>
          </View>

          <View style={styles.connectionContainer}>
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarCircle, { borderColor: '#4ADE80' }]}>
                <Image source={getUserAvatar()} style={styles.avatarImage} />
              </View>
              <View style={styles.readyBadge}>
                <CheckCircle2 size={12} color='#15803D' />
                <Text style={styles.readyBadgeText}>Hazır</Text>
              </View>
              <Text style={styles.avatarName}>{user?.firstName}</Text>
            </View>

            <View style={styles.connectionLineContainer}>
              <View style={styles.connectionLine} />
              <Animated.View entering={FadeIn} style={styles.connectionHeart}>
                <Heart size={16} color='#FF69B4' fill='#FF69B4' />
              </Animated.View>
            </View>

            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarCircle, { borderColor: '#D1D5DB', borderStyle: 'dashed' }]}>
                {partner ? (
                  <Image source={getPartnerAvatar()} style={[styles.avatarImage, { opacity: 0.5 }]} />
                ) : (
                  <UserIcon size={40} color='#D1D5DB' />
                )}
              </View>
              <View style={[styles.readyBadge, { backgroundColor: '#F3F4F6' }]}>
                <ActivityIndicator size='small' color='#9CA3AF' style={{ transform: [{ scale: 0.7 }] }} />
                <Text style={[styles.readyBadgeText, { color: '#6B7280' }]}>Bekleniyor</Text>
              </View>
              <Text style={[styles.avatarName, { color: '#9CA3AF' }]}>{partner?.firstName || 'Partner'}</Text>
            </View>
          </View>

          <Text style={styles.waitingMainTitle}>{partner?.firstName || 'Partneriniz'} Bekleniyor...</Text>
          <Text style={styles.waitingMainSubtitle}>
            Partneriniz odaya katıldığında quiz otomatik olarak başlayacaktır.
          </Text>

          <View style={styles.waitingActions}>
            <TouchableOpacity style={styles.notifyButton} onPress={notifyPartner}>
              <Bell size={20} color='#FF69B4' style={{ marginRight: 8 }} />
              <Text style={styles.notifyButtonText}>Haber Ver</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelQuizButton} onPress={cancelQuiz}>
              <Text style={styles.cancelQuizButtonText}>Vazgeç</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.triviaContainer}>
            <View style={styles.triviaIcon}>
              <Text style={{ fontSize: 20 }}>💡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.triviaTitle}>Beklerken bunları biliyor muydun?</Text>
              <Text style={styles.triviaText}>{trivias[triviaIndex]}</Text>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    )
  }

  if (status === 'generating') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.waitingContainer}>
          <ActivityIndicator size='large' color='#FF69B4' />
          <Text style={styles.waitingTitle}>Sorular Hazırlanıyor...</Text>
          <Text style={styles.waitingSubtitle}>AI sizin için en eğlenceli soruları oluşturuyor.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const getScoreValue = (id: string | undefined) => {
    if (!id || !scores) return 0
    const score = scores[id] || Object.entries(scores).find(([sid]) => sid.toString() === id.toString())?.[1]
    return score || 0
  }

  if (status === 'playing' && currentQuestion) {
    return (
      <SafeAreaView style={styles.playingContainer} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStatus('lobby')}>
            <ChevronLeft size={24} color='#111827' />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Aşk Quizi</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.playingContent}>
          <View style={styles.scoreCardsRow}>
            <ScoreCard name={user?.firstName || 'Ben'} score={getScoreValue(user?._id)} total={5} isPartner={false} />
            <View style={{ width: 12 }} />
            <ScoreCard
              name='Partner'
              score={
                (Object.entries(scores).find(([id]) => id.toString() !== user?._id?.toString())?.[1] as number) || 0
              }
              total={5}
              isPartner={true}
            />
          </View>

          <Animated.View
            entering={FadeInDown.duration(600)}
            style={[styles.infoBadge, currentQuestion.type === 'self' ? styles.infoBadgeSelf : styles.infoBadgeGuess]}
          >
            {currentQuestion.type === 'self' ? (
              <UserIcon size={20} color='#fff' style={{ marginRight: 8 }} />
            ) : (
              <Target size={20} color='#fff' style={{ marginRight: 8 }} />
            )}
            <Text style={styles.infoBadgeText}>
              {currentQuestion.type === 'self'
                ? 'Önce kendiniz için cevaplayın'
                : 'Şimdi partnerinizin cevabını tahmin edin!'}
            </Text>
          </Animated.View>

          <QuizCard
            currentQuestion={currentQuestion.questionIndex + 1}
            totalQuestions={5}
            timeLeft={timeLeft}
            questionText={currentQuestion.questionText}
            questionType={currentQuestion.type}
            options={currentQuestion.options}
            selectedOption={selectedOption}
            onSelectOption={setSelectedOption}
            onNext={handleSubmitAnswer}
            disabled={isReady}
          />

          {isReady && (
            <View style={styles.readyIndicator}>
              <ActivityIndicator size='small' color='#FF69B4' />
              <Text style={styles.readyText}>Partneriniz bekleniyor...</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    )
  }

  if (status === 'finished') {
    const myScore = getScoreValue(user?._id)
    const partnerId = Object.keys(scores).find(id => id.toString() !== user?._id?.toString())
    const partnerScore = getScoreValue(partnerId)
    const isWinner = myScore >= partnerScore
    const isDraw = myScore === partnerScore

    const winnerName = isWinner ? user?.firstName : partner?.firstName || 'Partner'
    const loserName = isWinner ? partner?.firstName || 'Partner' : user?.firstName
    const winnerScore = isWinner ? myScore : partnerScore
    const loserScore = isWinner ? partnerScore : myScore

    return (
      <SafeAreaView style={styles.resultsScreen} edges={['bottom']}>
        <LinearGradient colors={['#FFF0F5', '#F3E5F5', '#E1BEE7', '#F8BBD0']} style={StyleSheet.absoluteFill} />

        <FloatingHeart x={20} delay={0} size={40} />
        <FloatingHeart x={width * 0.4} delay={1500} size={60} />
        <FloatingHeart x={width * 0.7} delay={800} size={50} />
        <FloatingHeart x={width * 0.2} delay={2500} size={45} />

        <ScrollView contentContainerStyle={styles.resultsScroll}>
          <Animated.View entering={FadeInDown.duration(800)} style={styles.resultsHeader}>
            <View style={styles.finishedBadge}>
              <Flag size={14} color='#E11D48' style={{ marginRight: 6 }} />
              <Text style={styles.finishedBadgeText}>Quiz Tamamlandı</Text>
            </View>
            <Text style={styles.resultsMainTitle}>Oyun Sona Erdi! 🔥</Text>
            <Text style={styles.resultsSubtitle}>Kim daha iyi tanıyor bakalım...</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.gameResultCard}>
            <View style={styles.winnerSection}>
              <View style={styles.crownWrapper}>
                <View style={styles.crownBg}>
                  <Crown size={50} color='#fff' fill='#fff' />
                </View>
                <View style={styles.sparkleSmall}>
                  <Text>⭐</Text>
                </View>
                <View style={styles.sparkleMedium}>
                  <Text>✨</Text>
                </View>
              </View>

              <Text style={styles.winnerTitleText}>
                {isDraw ? 'DOSTLUK KAZANDI! 🤝' : `🏆 KAZANAN: ${winnerName?.toUpperCase()}! 🏆`}
              </Text>
              <Text style={styles.winnerSubtitleText}>
                {isDraw
                  ? 'Harika bir uyum içerisindesiniz!'
                  : `Tebrikler! ${isWinner ? partner?.firstName : 'Sen'} daha iyi tanınıyorsun!`}
              </Text>
            </View>

            <View style={styles.podiumLayout}>
              <Animated.View
                entering={FadeInDown.delay(400).duration(800)}
                style={[styles.podiumCard, styles.podiumFirst]}
              >
                <View style={styles.podiumRankBadge}>
                  <Text style={{ fontSize: 24 }}>🥇</Text>
                </View>

                <View style={styles.podiumUserSection}>
                  <View style={[styles.podiumUserAvatarCircle, { borderColor: '#FBBF24' }]}>
                    <Image source={isWinner ? getUserAvatar() : getPartnerAvatar()} style={styles.podiumUserAvatar} />
                    <View style={styles.podiumUserTrophyBadge}>
                      <TrophyIcon size={12} color='#fff' fill='#fff' />
                    </View>
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.podiumUserName}>{winnerName}</Text>
                    <Text style={styles.podiumUserRankText}>BİRİNCİ!</Text>
                  </View>
                </View>

                <View style={styles.podiumScoreSection}>
                  <View style={styles.podiumScoreBig}>
                    <Text style={styles.podiumScoreBigValue}>{winnerScore}</Text>
                    <Text style={styles.podiumScoreBigLabel}>/ 5 Doğru</Text>
                  </View>
                  <View style={styles.podiumProgressContainer}>
                    <View
                      style={[styles.podiumProgressBar, { width: `${winnerScore * 20}%`, backgroundColor: '#FBBF24' }]}
                    />
                  </View>
                </View>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(600).duration(800)}
                style={[styles.podiumCard, styles.podiumSecond]}
              >
                <View style={[styles.podiumRankBadge, { backgroundColor: '#E5E7EB' }]}>
                  <Text style={{ fontSize: 18 }}>🥈</Text>
                </View>

                <View style={styles.podiumUserSection}>
                  <View
                    style={[
                      styles.podiumUserAvatarCircle,
                      { borderColor: '#9CA3AF', width: 50, height: 50, borderRadius: 25 }
                    ]}
                  >
                    <Image
                      source={isWinner ? getPartnerAvatar() : getUserAvatar()}
                      style={[styles.podiumUserAvatar, { borderRadius: 25 }]}
                    />
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <Text style={[styles.podiumUserName, { fontSize: 16 }]}>{loserName}</Text>
                    <Text style={[styles.podiumUserRankText, { color: '#6B7280' }]}>İkinci</Text>
                  </View>
                </View>

                <View style={[styles.podiumScoreSection, { padding: 12 }]}>
                  <View style={styles.podiumScoreBig}>
                    <Text style={[styles.podiumScoreBigValue, { fontSize: 32, color: '#4B5563' }]}>{loserScore}</Text>
                    <Text style={styles.podiumScoreBigLabel}>/ 5 Doğru</Text>
                  </View>
                  <View style={[styles.podiumProgressContainer, { height: 4 }]}>
                    <View
                      style={[styles.podiumProgressBar, { width: `${loserScore * 20}%`, backgroundColor: '#9CA3AF' }]}
                    />
                  </View>
                </View>
              </Animated.View>
            </View>

            <View style={styles.finalDiffContainer}>
              <View style={styles.diffIconWrapper}>
                <Text style={{ fontSize: 24 }}>🎯</Text>
              </View>
              <View style={{ marginHorizontal: 16 }}>
                <Text style={styles.diffTitleText}>Skor Farkı</Text>
                <Text style={styles.diffValueText}>
                  {winnerScore} - {loserScore}
                </Text>
              </View>
              <View style={styles.diffIconWrapper}>
                <Text style={{ fontSize: 24 }}>🏁</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800).duration(800)}>
            <TouchableOpacity
              style={styles.resultsLobbyButton}
              onPress={() => {
                setStatus('lobby')
                fetchRecentSessions()
                checkActiveSession()
              }}
            >
              <Text style={styles.resultsLobbyButtonText}>Lobiye Dön</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <LinearGradient colors={['#FFF5F5', '#FDF2F8', '#F3E8FF']} style={StyleSheet.absoluteFill} />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.lobbyHeader}>
          <View style={styles.heartIconCircle}>
            <Heart size={32} color='#E11D48' fill='#E11D48' />
          </View>
          <Text style={styles.lobbyHeaderTitle}>Birbirimizi Ne Kadar Tanıyoruz? 💞</Text>
          <Text style={styles.lobbyHeaderSubtitle}>
            Eğlenceli sorularla birbirinizi ne kadar tanıdığınızı test edin!
          </Text>
        </View>

        {/* Top Cards Grid */}
        <View style={styles.topCardsGrid}>
          {/* User Card */}
          <LinearGradient
            colors={user?.gender === 'female' ? ['#F43F5E', '#E11D48', '#BE123C'] : ['#3B82F6', '#2563EB', '#1D4ED8']}
            style={styles.statCard}
          >
            <View style={styles.cardHeader}>
              <Image source={getUserAvatar()} style={styles.cardAvatar} />
              <View style={styles.cardIconBadge}>
                {user?.gender === 'female' ? (
                  <Crown size={24} color='#FDE047' />
                ) : (
                  <TrophyIcon size={24} color='#FDE047' />
                )}
              </View>
            </View>
            <Text style={styles.cardName}>{user?.firstName}</Text>
            <Text style={styles.cardTitle}>
              {user?.gender === 'female' ? 'Quiz Kraliçesi 👑' : 'Quiz Şampiyonu 🏆'}
            </Text>

            <View style={styles.cardMainStat}>
              <Text style={styles.cardMainStatLabel}>Toplam Galibiyet</Text>
              <View style={styles.cardMainStatValueRow}>
                {user?.gender === 'female' ? (
                  <Star size={20} color='#FDE047' fill='#FDE047' />
                ) : (
                  <Medal size={20} color='#FDE047' />
                )}
                <Text style={styles.cardMainStatValue}>{stats.myWins}</Text>
              </View>
            </View>

            <View style={styles.cardBottomStats}>
              <View style={styles.cardBottomStatItem}>
                <Text style={styles.cardBottomStatValue}>{stats.lastScore}</Text>
                <Text style={styles.cardBottomStatLabel}>Son Skor</Text>
              </View>
              <View style={styles.cardBottomStatItem}>
                <Text style={styles.cardBottomStatValue}>{stats.successRate}%</Text>
                <Text style={styles.cardBottomStatLabel}>Başarı</Text>
              </View>
              <View style={styles.cardBottomStatItem}>
                <Text style={styles.cardBottomStatValue}>{stats.totalQuizzes}</Text>
                <Text style={styles.cardBottomStatLabel}>Quiz</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Partner Card */}
          <LinearGradient
            colors={
              partner?.gender === 'female' ? ['#F43F5E', '#E11D48', '#BE123C'] : ['#3B82F6', '#2563EB', '#1D4ED8']
            }
            style={styles.statCard}
          >
            <View style={styles.cardHeader}>
              <Image source={getPartnerAvatar()} style={styles.cardAvatar} />
              <View style={styles.cardIconBadge}>
                {partner?.gender === 'female' ? (
                  <Crown size={24} color='#FDE047' />
                ) : (
                  <TrophyIcon size={24} color='#FDE047' />
                )}
              </View>
            </View>
            <Text style={styles.cardName}>{partner?.firstName || 'Partner'}</Text>
            <Text style={styles.cardTitle}>
              {partner?.gender === 'female' ? 'Quiz Kraliçesi 👑' : 'Quiz Şampiyonu 🏆'}
            </Text>

            <View style={styles.cardMainStat}>
              <Text style={styles.cardMainStatLabel}>Toplam Galibiyet</Text>
              <View style={styles.cardMainStatValueRow}>
                {partner?.gender === 'female' ? (
                  <Star size={20} color='#FDE047' fill='#FDE047' />
                ) : (
                  <Medal size={20} color='#FDE047' />
                )}
                <Text style={styles.cardMainStatValue}>{stats.partnerWins}</Text>
              </View>
            </View>

            <View style={styles.cardBottomStats}>
              <View style={styles.cardBottomStatItem}>
                <Text style={styles.cardBottomStatValue}>{stats.partnerLastScore}</Text>
                <Text style={styles.cardBottomStatLabel}>Son Skor</Text>
              </View>
              <View style={styles.cardBottomStatItem}>
                <Text style={styles.cardBottomStatValue}>{stats.pSuccessRate}%</Text>
                <Text style={styles.cardBottomStatLabel}>Başarı</Text>
              </View>
              <View style={styles.cardBottomStatItem}>
                <Text style={styles.cardBottomStatValue}>{stats.totalQuizzes}</Text>
                <Text style={styles.cardBottomStatLabel}>Quiz</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Action Card */}
          <LinearGradient colors={['#8B5CF6', '#6366F1', '#4F46E5']} style={styles.statCard}>
            <View style={styles.boltIconCircle}>
              <Zap size={32} color='#FDE047' fill='#FDE047' />
            </View>

            <Text style={styles.actionCardTitle}>{activeSession ? 'Quize Devam Et!' : 'Yeni Quiz Başlat!'}</Text>
            <Text style={styles.actionCardSubtitle}>
              {activeSession
                ? 'Partnerin seni bekliyor olabilir.'
                : planCode === 'free'
                  ? `Bugün ${todayQuizLimit - todayQuizUsed} quiz hakkınız kaldı.`
                  : 'Kim daha çok puan alacak?'}
            </Text>

            <TouchableOpacity
              style={[styles.actionButton, planCode === 'free' && todayQuizUsed >= todayQuizLimit && styles.actionButtonDisabled]}
              onPress={() => startNewQuiz()}
              disabled={planCode === 'free' && todayQuizUsed >= todayQuizLimit}
            >
              {loading ? (
                <ActivityIndicator color='#4F46E5' size='small' />
              ) : planCode === 'free' && todayQuizUsed >= todayQuizLimit ? (
                <Lock size={18} color='#6B7280' />
              ) : activeSession ? (
                <Users size={18} color='#4F46E5' fill='#4F46E5' />
              ) : (
                <Play size={18} color='#4F46E5' fill='#4F46E5' />
              )}
              <Text style={[styles.actionButtonText, planCode === 'free' && todayQuizUsed >= todayQuizLimit && styles.actionButtonTextDisabled]}>
                {planCode === 'free' && todayQuizUsed >= todayQuizLimit ? 'Günlük limit doldu' : activeSession ? 'Quize Katıl' : 'Hemen Başla'}
              </Text>
            </TouchableOpacity>

            {planCode === 'free' && todayQuizUsed >= todayQuizLimit && (
              <TouchableOpacity
                style={styles.premiumCtaCard}
                onPress={() => router.push('/store')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#FDE047', '#FBBF24', '#F59E0B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.premiumCtaGradient}
                >
                  <View style={styles.premiumCtaIconWrap}>
                    <Crown size={22} color='#92400E' fill='#FDE047' />
                  </View>
                  <View style={styles.premiumCtaTextWrap}>
                    <Text style={styles.premiumCtaTitle}>Daha fazla quiz çözmek ister misin?</Text>
                    <Text style={styles.premiumCtaSubtitle}>Premium ile günde sınırsız quiz çözebilirsin.</Text>
                  </View>
                  <View style={styles.premiumCtaChevron}>
                    <ChevronDown size={20} color='#92400E' style={{ transform: [{ rotate: '-90deg' }] }} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <View style={styles.cardBottomStats}>
              <View style={styles.cardBottomStatItem}>
                <Text style={[styles.cardBottomStatValue, { color: '#FDE047' }]}>
                  {stats.draws}-{stats.draws}
                </Text>
                <Text style={styles.cardBottomStatLabel}>Berabere</Text>
              </View>
              <View style={styles.cardBottomStatItem}>
                <Text style={[styles.cardBottomStatValue, { color: '#FDE047' }]}>{stats.totalQuizzes}</Text>
                <Text style={styles.cardBottomStatLabel}>Toplam</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Recent Quizzes Section */}
        <View style={styles.recentSection}>
          <LinearGradient colors={['#F59E0B', '#F97316']} style={styles.recentHeaderGradient}>
            <View style={styles.recentHeaderLeft}>
              <View style={styles.recentIconBox}>
                <TrendingUp size={24} color='#fff' />
              </View>
              <View>
                <Text style={styles.recentTitle}>Geçmiş Quizler</Text>
                <Text style={styles.recentSubtitle}>Son oynadığınız quizler</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.recentList}>
            {recentSessions.map((session: any) => {
              const myScore = getSessionScore(session.scores, user?._id)
              const pId = Object.keys(session.scores || {}).find(id => id.toString() !== user?._id?.toString())
              const partnerScore = getSessionScore(session.scores, pId) as number

              const winnerId = myScore > partnerScore ? user?._id : partnerScore > myScore ? pId : 'draw'
              const winnerName =
                winnerId === user?._id ? user?.firstName : winnerId === pId ? partner?.firstName : 'Berabere'

              return (
                <TouchableOpacity
                  key={session._id}
                  onPress={() => router.push(`/quiz-answers/${session._id}`)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.quizRow,
                      {
                        borderColor:
                          session.category === 'favorites'
                            ? '#BBF7D0'
                            : session.category === 'memories'
                              ? '#E9D5FF'
                              : '#FEF3C7'
                      }
                    ]}
                  >
                    <View style={styles.quizRowLeft}>
                      <View
                        style={[
                          styles.quizIconBox,
                          {
                            backgroundColor:
                              session.category === 'favorites'
                                ? '#4ADE80'
                                : session.category === 'memories'
                                  ? '#A855F7'
                                  : '#FBBF24'
                          }
                        ]}
                      >
                        {session.category === 'favorites' ? (
                          <Heart size={20} color='#fff' />
                        ) : session.category === 'memories' ? (
                          <ClockIcon size={20} color='#fff' />
                        ) : (
                          <Star size={20} color='#fff' />
                        )}
                      </View>
                      <View>
                        <Text style={styles.quizRowSubtitle}>{formatDate(session.createdAt)}</Text>
                        <Text style={styles.quizRowSubtitle}>{formatTime(session.createdAt)}</Text>
                      </View>
                    </View>

                    <View style={styles.quizRowRight}>
                      <View style={styles.scoreVsRow}>
                        <View style={styles.scoreInfo}>
                          <Image source={getUserAvatar()} style={[styles.scoreAvatar, { borderColor: '#60A5FA' }]} />
                          <Text style={styles.scoreNumBlue}>{myScore}</Text>
                        </View>
                        <Text style={styles.vsText}>VS</Text>
                        <View style={styles.scoreInfo}>
                          <Text style={styles.scoreNumRose}>{partnerScore}</Text>
                          <Image source={getPartnerAvatar()} style={[styles.scoreAvatar, { borderColor: '#FB7185' }]} />
                        </View>
                      </View>

                      <View
                        style={[
                          styles.winnerBadge,
                          {
                            backgroundColor:
                              winnerId === 'draw'
                                ? '#9CA3AF'
                                : winnerId === user?._id
                                  ? user?.gender === 'female'
                                    ? '#F43F5E'
                                    : '#3B82F6'
                                  : partner?.gender === 'female'
                                    ? '#F43F5E'
                                    : '#3B82F6'
                          }
                        ]}
                      >
                        {winnerId === 'draw' ? (
                          <Users size={14} color='#fff' />
                        ) : winnerId === user?._id ? (
                          user?.gender === 'female' ? (
                            <Crown size={14} color='#FDE047' />
                          ) : (
                            <TrophyIcon size={16} color='#FDE047' />
                          )
                        ) : partner?.gender === 'female' ? (
                          <Crown size={16} color='#FDE047' />
                        ) : (
                          <TrophyIcon size={16} color='#FDE047' />
                        )}
                        <Text style={styles.winnerBadgeText}>{winnerName}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })}

            {hasMoreRecent && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={() => fetchRecentSessions(true)}
                disabled={loadingMoreRecent}
              >
                {loadingMoreRecent ? (
                  <ActivityIndicator color='#F97316' size='small' />
                ) : (
                  <>
                    <Text style={styles.loadMoreText}>Daha Fazla</Text>
                    <ChevronDown size={18} color='#F97316' />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quiz Tips Section */}
        <View style={styles.tipsSection}>
          <View style={styles.tipsContainer}>
            <View style={styles.tipsHeader}>
              <View style={styles.tipsIconCircle}>
                <Lightbulb size={32} color='#fff' />
              </View>
              <Text style={styles.tipsTitle}>Quiz İpuçları</Text>
              <Text style={styles.tipsSubtitle}>Daha iyi sonuçlar için öneriler</Text>
            </View>

            <View style={styles.tipsGrid}>
              <View style={styles.tipCard}>
                <View style={[styles.tipIconBox, { backgroundColor: '#DBEAFE' }]}>
                  <ClockIcon size={20} color='#2563EB' />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tipTitle}>Aceleci Olmayın</Text>
                  <Text style={styles.tipText}>Her soruyu dikkatlice okuyun ve düşünerek cevap verin.</Text>
                </View>
              </View>

              <View style={styles.tipCard}>
                <View style={[styles.tipIconBox, { backgroundColor: '#F3E8FF' }]}>
                  <MessageCircle size={20} color='#9333EA' />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tipTitle}>İletişim Kurun</Text>
                  <Text style={styles.tipText}>Sonuçları birlikte değerlendirin ve konuşun.</Text>
                </View>
              </View>

              <View style={styles.tipCard}>
                <View style={[styles.tipIconBox, { backgroundColor: '#DCFCE7' }]}>
                  <Smile size={20} color='#16A34A' />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tipTitle}>Eğlenin</Text>
                  <Text style={styles.tipText}>Quiz bir yarışma değil, eğlenceli bir aktivite!</Text>
                </View>
              </View>

              <View style={styles.tipCard}>
                <View style={[styles.tipIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <RotateCw size={20} color='#D97706' />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tipTitle}>Düzenli Tekrar</Text>
                  <Text style={styles.tipText}>Haftada bir quiz yaparak birbirinizi daha iyi tanıyın.</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  lobbyHeader: {
    alignItems: 'center',
    paddingVertical: 32
  },
  heartIconCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#FFE4E6',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  lobbyHeaderTitle: {
    fontSize: 28,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8
  },
  lobbyHeaderSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    maxWidth: 300
  },
  topCardsGrid: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 32
  },
  statCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    minHeight: 220,
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  cardAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#fff'
  },
  cardIconBadge: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardName: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 2
  },
  cardTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16
  },
  cardMainStat: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12
  },
  cardMainStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4
  },
  cardMainStatValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardMainStatValue: {
    fontSize: 24,
    color: '#fff'
  },
  cardBottomStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4
  },
  cardBottomStatItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center'
  },
  cardBottomStatValue: {
    fontSize: 14,
    color: '#fff'
  },
  cardBottomStatLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2
  },
  boltIconCircle: {
    width: 72,
    height: 72,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16
  },
  actionCardTitle: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4
  },
  actionCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 16
  },
  actionButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginBottom: 16
  },
  actionButtonText: {
    fontSize: 16,
    color: '#4F46E5'
  },
  actionButtonDisabled: {
    backgroundColor: '#E5E7EB',
    opacity: 0.9
  },
  actionButtonTextDisabled: {
    color: '#6B7280'
  },
  premiumCtaCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3
  },
  premiumCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12
  },
  premiumCtaIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  premiumCtaTextWrap: {
    flex: 1
  },
  premiumCtaTitle: {
    fontSize: 15,
    color: '#92400E',
    marginBottom: 2
  },
  premiumCtaSubtitle: {
    fontSize: 13,
    color: 'rgba(146,64,14,0.9)'
  },
  premiumCtaChevron: {
    opacity: 0.9
  },
  recentSection: {
    backgroundColor: '#fff',
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    marginBottom: 32
  },
  recentHeaderGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24
  },
  recentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  recentIconBox: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  recentTitle: {
    fontSize: 24,
    color: '#fff'
  },
  recentSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)'
  },
  seeAllButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12
  },
  seeAllText: {
    color: '#fff',
    fontSize: 14
  },
  recentList: {
    padding: 24,
    gap: 16
  },
  quizRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: 12,
    borderWidth: 2
  },
  quizRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  quizIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quizRowTitle: {
    fontSize: 15,
    color: '#111827'
  },
  quizRowSubtitle: {
    fontSize: 11,
    color: '#6B7280'
  },
  quizRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  scoreVsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  scoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  scoreAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5
  },
  scoreNumBlue: {
    fontSize: 14,
    color: '#2563EB'
  },
  scoreNumRose: {
    fontSize: 14,
    color: '#E11D48'
  },
  scoreName: {
    fontSize: 8,
    color: '#9CA3AF'
  },
  vsText: {
    fontSize: 12,
    color: '#D1D5DB'
  },
  winnerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  winnerBadgeText: {
    fontSize: 7,
    color: '#fff',
    marginTop: 1,
    textAlign: 'center',
    paddingHorizontal: 1
  },
  tipsSection: {
    marginBottom: 40
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 8
  },
  loadMoreText: {
    fontSize: 14,
    color: '#F97316'
  },
  tipsContainer: {
    backgroundColor: '#F0F7FF',
    borderRadius: 32,
    padding: 32,
    borderWidth: 2,
    borderColor: '#DBEAFE'
  },
  tipsHeader: {
    alignItems: 'center',
    marginBottom: 32
  },
  tipsIconCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#3B82F6',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  tipsTitle: {
    fontSize: 28,
    color: '#1E3A8A'
  },
  tipsSubtitle: {
    fontSize: 16,
    color: '#1E40AF'
  },
  tipsGrid: {
    gap: 16
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 24,
    padding: 20,
    gap: 16
  },
  tipIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tipTitle: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 4
  },
  tipText: {
    fontSize: 14,
    color: '#4B5563'
  },
  playingContainer: {
    flex: 1,
    backgroundColor: '#FFF1F2'
  },
  playingContent: {
    padding: 16,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff'
  },
  headerTitle: {
    fontSize: 18,
    color: '#111827'
  },
  scoreCardsRow: {
    flexDirection: 'row',
    marginBottom: 24
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  miniStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  statValue: {
    fontSize: 16,
    color: '#111827'
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280'
  },
  sectionTitle: {
    fontSize: 20,
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 4
  },
  categoriesGrid: {
    marginBottom: 24
  },
  row: {
    flexDirection: 'row'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    marginTop: 12,
    color: '#9CA3AF',
    fontSize: 14
  },
  infoBadge: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  infoBadgeSelf: {
    backgroundColor: '#4F46E5' // Indigo for self
  },
  infoBadgeGuess: {
    backgroundColor: '#E11D48' // Rose for guess
  },
  infoBadgeText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center'
  },
  readyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20
  },
  readyText: {
    marginLeft: 10,
    color: '#FF69B4'
  },
  waitingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  waitingCard: {
    width: width * 0.9,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#FFE4E6'
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF69B4',
    marginRight: 8
  },
  statusBadgeText: {
    color: '#E11D48',
    fontSize: 12
  },
  connectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
    paddingHorizontal: 10
  },
  avatarWrapper: {
    alignItems: 'center'
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    padding: 3,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40
  },
  avatarName: {
    marginTop: 12,
    fontSize: 14,
    color: '#111827'
  },
  readyBadge: {
    position: 'absolute',
    bottom: 25,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    zIndex: 10
  },
  readyBadgeText: {
    fontSize: 10,
    color: '#15803D',
    marginLeft: 4
  },
  connectionLineContainer: {
    flex: 1,
    height: 2,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  connectionLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#FFE4E6'
  },
  connectionHeart: {
    position: 'absolute',
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 10
  },
  waitingMainTitle: {
    fontSize: 24,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8
  },
  waitingMainSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 32
  },
  waitingActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  notifyButtonText: {
    fontSize: 14,
    color: '#4B5563'
  },
  cancelQuizButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: 'center'
  },
  cancelQuizButtonText: {
    fontSize: 14,
    color: '#E11D48'
  },
  triviaContainer: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#FDF2F8',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCE7F3'
  },
  triviaIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1
  },
  triviaTitle: {
    fontSize: 12,
    color: '#86198F',
    marginBottom: 4
  },
  triviaText: {
    fontSize: 12,
    color: '#A21CAF',
    lineHeight: 18
  },
  resultsScreen: {
    flex: 1
  },
  resultsScroll: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 60
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 32
  },
  finishedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  finishedBadgeText: {
    fontSize: 12,
    color: '#E11D48'
  },
  resultsMainTitle: {
    fontSize: 28,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8
  },
  resultsSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center'
  },
  winnerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 32,
    overflow: 'hidden'
  },
  crownContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#FEF3C7',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative'
  },
  sparkleOne: {
    position: 'absolute',
    top: -10,
    right: -10
  },
  sparkleTwo: {
    position: 'absolute',
    bottom: -10,
    left: -10
  },
  winnerText: {
    fontSize: 24,
    color: '#B45309',
    textAlign: 'center',
    marginBottom: 8
  },
  winnerSubtext: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 32
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 32,
    gap: 16
  },
  podiumItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    paddingTop: 40,
    alignItems: 'center',
    borderWidth: 3,
    position: 'relative'
  },
  firstPlace: {
    borderColor: '#FBBF24',
    backgroundColor: '#FFFBEB'
  },
  secondPlace: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB'
  },
  podiumAvatarWrapper: {
    position: 'absolute',
    top: -30,
    alignItems: 'center'
  },
  podiumAvatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    backgroundColor: '#fff',
    padding: 2
  },
  podiumAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30
  },
  medalCircle: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  podiumName: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 12
  },
  podiumScoreBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEF3C7'
  },
  podiumScoreValue: {
    fontSize: 32,
    color: '#B45309'
  },
  podiumScoreLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 8
  },
  podiumProgressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden'
  },
  podiumProgressBar: {
    height: '100%',
    borderRadius: 3
  },
  scoreDifferenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FEF3C7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  resultsLobbyButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F3F4F6'
  },
  resultsLobbyButtonText: {
    fontSize: 18,
    color: '#4B5563'
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  waitingTitle: {
    fontSize: 24,
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center'
  },
  waitingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24
  },
  gameResultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 40,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden'
  },
  winnerSection: {
    alignItems: 'center',
    marginBottom: 32,
    zIndex: 10
  },
  crownWrapper: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative'
  },
  crownBg: {
    width: 80,
    height: 80,
    backgroundColor: '#FBBF24',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8
  },
  sparkleSmall: {
    position: 'absolute',
    top: 0,
    right: 0
  },
  sparkleMedium: {
    position: 'absolute',
    bottom: 10,
    left: 0
  },
  winnerTitleText: {
    fontSize: 24,
    color: '#92400E',
    textAlign: 'center',
    marginBottom: 8
  },
  winnerSubtitleText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center'
  },
  podiumLayout: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
    zIndex: 10
  },
  podiumCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 12,
    paddingTop: 32,
    borderWidth: 2,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  podiumFirst: {
    borderColor: '#FBBF24',
    backgroundColor: '#FFFBEB',
    transform: [{ scale: 1.05 }]
  },
  podiumSecond: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB'
  },
  podiumRankBadge: {
    position: 'absolute',
    top: -15,
    left: '50%',
    marginLeft: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 20
  },
  podiumUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  podiumUserAvatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    padding: 2,
    backgroundColor: '#fff',
    position: 'relative'
  },
  podiumUserAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 28
  },
  podiumUserTrophyBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  podiumUserName: {
    fontSize: 18,
    color: '#111827'
  },
  podiumUserRankText: {
    fontSize: 12,
    color: '#92400E'
  },
  podiumScoreSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    alignItems: 'center'
  },
  podiumScoreBig: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8
  },
  podiumScoreBigValue: {
    fontSize: 48,
    color: '#D97706'
  },
  podiumScoreBigLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4
  },
  finalDiffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FEF3C7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    zIndex: 10
  },
  diffIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  diffTitleText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4
  },
  diffValueText: {
    fontSize: 28,
    color: '#D97706',
    textAlign: 'center'
  }
})
