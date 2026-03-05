import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/ui/Text'
import { TextInput } from '../../components/ui/TextInput'
import { useAuth } from '../../context/AuthContext'
import { usePlanLimits } from '../../context/PlanLimitsContext'
import { dailyQuestionApi } from '../../api/dailyQuestion'
import { useToast } from '../../components/ui/ToastProvider'
import { Clock, Send, Sparkles, CheckCircle2, Lock, Play, RefreshCw, ThumbsUp, ThumbsDown, Video } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import Constants from 'expo-constants'

// Expo Go'da native modüller olmadığı için import ve kullanımı güvenli hale getirme
let GoogleAds: any = null
try {
  GoogleAds = require('react-native-google-mobile-ads')
} catch (e) {
  console.log('Google Ads module not found')
}

const isExpoGo = Constants.appOwnership === 'expo'
const TestIds = GoogleAds?.TestIds || { REWARDED: 'test' }
const adUnitId = __DEV__
  ? TestIds.REWARDED
  : Platform.OS === 'ios'
    ? 'ca-app-pub-3940256099942544/1712485313'
    : 'ca-app-pub-3940256099942544/5224354917'

/** Reklam yüklenirken gösterilen modal: ortada kamera ikonu, etrafında dönen çember, metinler ve İptal. */
function AdLoadingModal({
  visible,
  onCancel
}: {
  visible: boolean
  onCancel: () => void
}) {
  const spinValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!visible) return
    spinValue.setValue(0)
    const anim = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true
      })
    )
    anim.start()
    return () => anim.stop()
  }, [visible, spinValue])

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  })

  if (!visible) return null

  return (
    <Modal transparent visible={visible} animationType='fade'>
      <View style={styles.adLoadingOverlay}>
        <View style={styles.adLoadingCard}>
          <View style={styles.adLoadingIconWrap}>
            <Animated.View style={[styles.adLoadingRing, { transform: [{ rotate: spin }] }]} />
            <View style={styles.adLoadingIconInner}>
              <Video size={36} color='#6366F1' strokeWidth={2} />
            </View>
          </View>
          <Text style={styles.adLoadingTitle}>Reklam yükleniyor...</Text>
          <Text style={styles.adLoadingSubtitle}>Ödüllü videonuz yüklenirken lütfen bekleyin</Text>
          <TouchableOpacity style={styles.adLoadingCancelBtn} onPress={onCancel} activeOpacity={0.8}>
            <Text style={styles.adLoadingCancelText}>İptal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

/** Beğenmedim: yeni soru. Sadece cevap verilmediğinde render edilir; free planda reklam, premium/Expo’da doğrudan API. */
function RequestNewQuestionBlock({
  onRequestNewQuestion,
  adFree,
  showToast
}: {
  onRequestNewQuestion: () => Promise<void>
  adFree: boolean
  showToast: (v: { type: 'success' | 'error'; title: string; message: string }) => void
}) {
  const [loading, setLoading] = useState(false)

  const runRequest = useCallback(async () => {
    setLoading(true)
    try {
      await onRequestNewQuestion()
      showToast({ type: 'success', title: 'Yeni soru', message: 'İşte yeni günün sorusu! 💕' })
    } catch {
      showToast({ type: 'error', title: 'Hata', message: 'Yeni soru alınamadı.' })
    } finally {
      setLoading(false)
    }
  }, [onRequestNewQuestion, showToast])

  if (adFree || isExpoGo || !GoogleAds) {
    return (
      <TouchableOpacity
        style={styles.requestNewQuestionBtn}
        onPress={runRequest}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size='small' color='#6366F1' />
        ) : (
          <>
            <RefreshCw size={18} color='#6366F1' />
            <Text style={styles.requestNewQuestionText}>Yeni soru getir</Text>
          </>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <RequestNewQuestionWithAd onReward={runRequest} loading={loading} setLoading={setLoading} showToast={showToast} />
  )
}

function RequestNewQuestionWithAd({
  onReward,
  loading,
  setLoading,
  showToast
}: {
  onReward: () => Promise<void>
  loading: boolean
  setLoading: (v: boolean) => void
  showToast: (v: { type: 'success' | 'error'; title: string; message: string }) => void
}) {
  const { isLoaded, isEarnedReward, show, load } = GoogleAds!.useRewardedAd(adUnitId, {
    requestNonPersonalizedAdsOnly: true
  })
  const rewardHandled = useRef(false)
  const onRewardRef = useRef(onReward)
  onRewardRef.current = onReward
  const [modalVisible, setModalVisible] = useState(false)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (load) load()
  }, [load])

  useEffect(() => {
    if (!isEarnedReward || rewardHandled.current) return
    rewardHandled.current = true
    setLoading(true)
    const run = onRewardRef.current
    run()
      .catch(() => {
        showToast({ type: 'error', title: 'Hata', message: 'Yeni soru alınamadı.' })
      })
      .finally(() => {
        setLoading(false)
        rewardHandled.current = false
        if (load) load()
      })
  }, [isEarnedReward, setLoading, showToast, load])

  useEffect(() => {
    if (!modalVisible || !isLoaded || cancelledRef.current) return
    if (show) {
      setModalVisible(false)
      show()
    }
  }, [modalVisible, isLoaded, show])

  const handlePress = () => {
    if (isLoaded && show) {
      show()
      return
    }
    cancelledRef.current = false
    setModalVisible(true)
    if (load) {
      load()
    } else {
      showToast({
        type: 'error',
        title: 'Reklam yüklenemedi',
        message: 'Lütfen biraz bekleyip tekrar deneyin.'
      })
      setModalVisible(false)
    }
  }

  const handleCancel = () => {
    cancelledRef.current = true
    setModalVisible(false)
  }

  return (
    <>
      <TouchableOpacity style={styles.requestNewQuestionBtn} onPress={handlePress} disabled={loading} activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator size='small' color='#6366F1' />
        ) : (
          <>
            <RefreshCw size={18} color='#6366F1' />
            <Text style={styles.requestNewQuestionText}>Reklam izle, yeni soru getir</Text>
          </>
        )}
      </TouchableOpacity>
      <AdLoadingModal visible={modalVisible} onCancel={handleCancel} />
    </>
  )
}

// AI Analizi bileşenini dışarı çıkarıyoruz ki Hook kurallarını bozmasın
function AiAnalysisSection({
  data,
  aiUnlocked,
  setAiUnlocked,
  showToast,
  aiCommentFree
}: {
  data: any
  aiUnlocked: boolean
  setAiUnlocked: (v: boolean) => void
  showToast: (v: any) => void
  aiCommentFree: boolean
}) {
  const showAiContent = aiUnlocked || aiCommentFree

  if (showAiContent) {
    return (
      <LinearGradient colors={['#EEF2FF', '#F5F3FF', '#FFF1F2']} style={styles.aiBox}>
        <View style={styles.aiHeader}>
          <View style={styles.aiIconBox}>
            <Sparkles size={16} color='#4F46E5' />
          </View>
          <Text style={styles.aiLabel}>AI ANALİZİ & YORUMU</Text>
        </View>
        <Text style={styles.aiText}>"{data.question.aiAnalysis}"</Text>
      </LinearGradient>
    )
  }

  if (isExpoGo) {
    return (
      <TouchableOpacity
        style={styles.unlockAiContainer}
        onPress={() => {
          showToast({
            type: 'success',
            title: 'Expo Go Modu',
            message: "Expo Go'da reklam gösterilemez, içerik direkt açılıyor."
          })
          setAiUnlocked(true)
        }}
        activeOpacity={0.8}
      >
        <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.unlockAiBtn}>
          <View style={styles.unlockAiIconBox}>
            <Sparkles size={20} color='white' />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.unlockAiTitle}>AI Analizini Kilidini Aç</Text>
            <Text style={styles.unlockAiSubtitle}>Expo Go modunda reklam simüle ediliyor.</Text>
          </View>
          <Play size={20} color='white' />
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  return <RealAdSection data={data} aiUnlocked={aiUnlocked} setAiUnlocked={setAiUnlocked} showToast={showToast} />
}

function RealAdSection({
  data,
  aiUnlocked,
  setAiUnlocked,
  showToast
}: {
  data: any
  aiUnlocked: boolean
  setAiUnlocked: (v: boolean) => void
  showToast: (v: any) => void
}) {
  const { isLoaded, isEarnedReward, show, load, isClosed } = GoogleAds.useRewardedAd(adUnitId, {
    requestNonPersonalizedAdsOnly: true
  })
  const [modalVisible, setModalVisible] = useState(false)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (load) load()
  }, [load])

  useEffect(() => {
    if (isEarnedReward) {
      setAiUnlocked(true)
    }
  }, [isEarnedReward, setAiUnlocked])

  useEffect(() => {
    if (isClosed && load) {
      load()
    }
  }, [isClosed, load])

  useEffect(() => {
    if (!modalVisible || !isLoaded || cancelledRef.current) return
    if (show) {
      setModalVisible(false)
      show()
    }
  }, [modalVisible, isLoaded, show])

  const handleShow = () => {
    if (isLoaded && show) {
      show()
      return
    }
    cancelledRef.current = false
    setModalVisible(true)
    if (load) {
      load()
    } else {
      showToast({
        type: 'error',
        title: 'Reklam Yüklenemedi',
        message: 'Lütfen biraz bekleyip tekrar deneyin.'
      })
      setModalVisible(false)
    }
  }

  const handleCancel = () => {
    cancelledRef.current = true
    setModalVisible(false)
  }

  if (aiUnlocked) {
    return (
      <LinearGradient colors={['#EEF2FF', '#F5F3FF', '#FFF1F2']} style={styles.aiBox}>
        <View style={styles.aiHeader}>
          <View style={styles.aiIconBox}>
            <Sparkles size={16} color='#4F46E5' />
          </View>
          <Text style={styles.aiLabel}>AI ANALİZİ & YORUMU</Text>
        </View>
        <Text style={styles.aiText}>"{data.question.aiAnalysis}"</Text>
      </LinearGradient>
    )
  }

  return (
    <>
      <TouchableOpacity style={styles.unlockAiContainer} onPress={handleShow} activeOpacity={0.8}>
        <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.unlockAiBtn}>
          <View style={styles.unlockAiIconBox}>
            <Sparkles size={20} color='white' />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.unlockAiTitle}>AI Analizini Kilidini Aç</Text>
            <Text style={styles.unlockAiSubtitle}>Reklam izle ve Çifto'nun yorumunu gör!</Text>
          </View>
          <Play size={20} color='white' />
        </LinearGradient>
      </TouchableOpacity>
      <AdLoadingModal visible={modalVisible} onCancel={handleCancel} />
    </>
  )
}

export default function DailyQuestionScreen() {
  const { user } = useAuth()
  const { hasFeature } = usePlanLimits()
  const { show: showToast } = useToast()
  const aiCommentFree = hasFeature('aiCommentFree')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [answer, setAnswer] = useState('')
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiUnlocked, setAiUnlocked] = useState(false)
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setLoading(true)
      setError(null)
      try {
        const result = await dailyQuestionApi.getTodaysQuestion(user?.accessToken)
        if (result.success) {
          setData(result.data)
          if (result.data.userAnswer) {
            setAnswer(result.data.userAnswer.answer)
          }
        } else {
          setError(result.message)
        }
      } catch (err) {
        console.error('Daily question fetch error:', err)
        setError('Veriler yüklenirken bir sorun oluştu.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [user?.accessToken]
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const onRefresh = () => {
    setRefreshing(true)
    fetchData(true)
  }

  const handleSubmit = async () => {
    if (!answer.trim() || !data?.question) return

    try {
      setIsSubmitting(true)
      const result = await dailyQuestionApi.answerQuestion(
        {
          questionId: data.question._id,
          answer: answer.trim()
        },
        user?.accessToken
      )

      if (result.success) {
        setData(result.data)
        showToast({
          type: 'success',
          title: 'Başarılı',
          message: 'Cevabın kaydedildi! 💕'
        })
      } else {
        showToast({
          type: 'error',
          title: 'Hata',
          message: result.message
        })
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Cevap gönderilirken bir hata oluştu.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getUserAvatar = (u: any) => {
    if (u?.avatar?.url) {
      return { uri: u.avatar.url }
    }
    return u?.gender === 'female' ? require('../../assets/woman-pp.png') : require('../../assets/man-pp.png')
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#FF69B4' />
      </View>
    )
  }

  if (!data?.question) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF69B4']} />}
        >
          <View style={styles.emptyIconBox}>
            <Clock size={48} color='#F43F5E' />
          </View>
          <Text style={styles.emptyTitle}>{error?.includes('profil') ? 'Profil Eksik' : 'Soru Hazırlanıyor'}</Text>
          <Text style={styles.emptyText}>
            {error || 'Bugünün sorusu henüz hazır değil. Lütfen daha sonra tekrar kontrol edin.'}
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchData()}>
            <Text style={styles.retryBtnText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  const { partner1, partner2 } = data.question.coupleId
  const bothAnswered = !!data.userAnswer && data.partnerAnswered
  const partnerAnsweredOnly = !data.userAnswer && data.partnerAnswered
  const partnerUser = user?._id === partner1._id ? partner2 : partner1

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior='padding'
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF69B4']} />}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={[
              styles.card,
              bothAnswered ? styles.cardSuccess : partnerAnsweredOnly ? styles.cardWarning : styles.cardDefault
            ]}
          >
            <LinearGradient
              colors={
                bothAnswered
                  ? ['#10B981', '#059669']
                  : partnerAnsweredOnly
                    ? ['#F59E0B', '#D97706']
                    : ['#F43F5E', '#E11D48']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cardHeader}
            >
              <View style={styles.cardHeaderTitleRow}>
                <Text style={styles.cardHeaderText}>Günün Sorusu</Text>
                <Text style={styles.emoji}>{data.question.emoji}</Text>
              </View>
              <View style={styles.statusBadge}>
                {bothAnswered ? (
                  <>
                    <CheckCircle2 size={14} color='white' />
                    <Text style={styles.statusText}>Tamamlandı</Text>
                  </>
                ) : (
                  <Text style={styles.statusText}>Durum: Bekliyor</Text>
                )}
              </View>
            </LinearGradient>

            <View style={styles.cardBody}>
              <View
                style={[
                  styles.questionBox,
                  bothAnswered ? styles.qBoxSuccess : partnerAnsweredOnly ? styles.qBoxWarning : styles.qBoxDefault
                ]}
              >
                <Text style={styles.questionText}>"{data.question.question}"</Text>
              </View>

              <View style={styles.feedbackRow}>
                <Text style={styles.feedbackLabel}>Bu soruyu beğendin mi?</Text>
                <View style={styles.feedbackButtons}>
                  <TouchableOpacity
                    style={[
                      styles.feedbackBtn,
                      data.question.currentUserFeedback === 'like' && styles.feedbackBtnActive
                    ]}
                    onPress={async () => {
                      if (feedbackSubmitting) return
                      setFeedbackSubmitting(true)
                      try {
                        const res = await dailyQuestionApi.submitFeedback(
                          { questionId: data.question._id, type: 'like' },
                          user?.accessToken
                        )
                        if (res.success && res.data) setData(res.data)
                      } finally {
                        setFeedbackSubmitting(false)
                      }
                    }}
                    disabled={feedbackSubmitting}
                  >
                    <ThumbsUp
                      size={20}
                      color={data.question.currentUserFeedback === 'like' ? '#fff' : '#6B7280'}
                      fill={data.question.currentUserFeedback === 'like' ? '#fff' : 'transparent'}
                    />
                    <Text
                      style={[
                        styles.feedbackBtnText,
                        data.question.currentUserFeedback === 'like' && styles.feedbackBtnTextActive
                      ]}
                    >
                      Beğendim
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.feedbackBtn,
                      data.question.currentUserFeedback === 'dislike' && styles.feedbackBtnActiveDislike
                    ]}
                    onPress={async () => {
                      if (feedbackSubmitting) return
                      setFeedbackSubmitting(true)
                      try {
                        const res = await dailyQuestionApi.submitFeedback(
                          { questionId: data.question._id, type: 'dislike' },
                          user?.accessToken
                        )
                        if (res.success && res.data) setData(res.data)
                      } finally {
                        setFeedbackSubmitting(false)
                      }
                    }}
                    disabled={feedbackSubmitting}
                  >
                    <ThumbsDown
                      size={20}
                      color={data.question.currentUserFeedback === 'dislike' ? '#fff' : '#6B7280'}
                      fill={data.question.currentUserFeedback === 'dislike' ? '#fff' : 'transparent'}
                    />
                    <Text
                      style={[
                        styles.feedbackBtnText,
                        data.question.currentUserFeedback === 'dislike' && styles.feedbackBtnTextActive
                      ]}
                    >
                      Beğenmedim
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {!data.userAnswer && (
                <RequestNewQuestionBlock
                  adFree={hasFeature('adFree')}
                  showToast={showToast}
                  onRequestNewQuestion={async () => {
                    const res = await dailyQuestionApi.requestNewQuestion(user?.accessToken)
                    if (!res.success) throw new Error(res.message)
                    if (res.data) setData(res.data)
                  }}
                />
              )}

              {partnerAnsweredOnly && (
                <View style={styles.infoBoxWarning}>
                  <View style={styles.infoIconCircle}>
                    <Clock size={20} color='#D97706' />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoTitle}>Partnerin cevapladı, sıra sende!</Text>
                    <Text style={styles.infoText}>
                      Partnerin bu soruyu cevapladı. Sen de cevapladığında her ikinizin de cevaplarını görebileceksiniz.
                    </Text>
                  </View>
                </View>
              )}

              {bothAnswered && (
                <View style={styles.infoBoxSuccess}>
                  <View style={styles.infoIconCircle}>
                    <Sparkles size={20} color='#059669' />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoTitle}>Harika! İkiniz de cevapladınız</Text>
                    <Text style={styles.infoText}>
                      Birbirinizin cevaplarını görebilirsiniz. Belki bu konuda konuşmak istersiniz?
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.answersContainer}>
                {/* My Answer */}
                <View style={styles.answerSection}>
                  <View style={styles.userRow}>
                    <View style={styles.miniAvatarContainer}>
                      <Image source={getUserAvatar(user)} style={styles.miniAvatar} />
                    </View>
                    <Text style={styles.userRowName}>Senin Cevabın</Text>
                  </View>

                  {data.userAnswer ? (
                    <View style={styles.answerDisplay}>
                      <Text style={styles.answerDisplayText}>"{data.userAnswer.answer}"</Text>
                      <Text style={styles.answerTime}>
                        {formatDistanceToNow(new Date(data.userAnswer.answeredAt), { addSuffix: true, locale: tr })}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.inputContainer}>
                      <TextInput
                        value={answer}
                        onChangeText={setAnswer}
                        placeholder='Düşüncelerini buraya yaz...'
                        placeholderTextColor='#9CA3AF'
                        multiline
                        style={styles.textInput}
                      />
                      <TouchableOpacity
                        style={[styles.sendBtn, !answer.trim() && styles.sendBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={!answer.trim() || isSubmitting}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator size='small' color='white' />
                        ) : (
                          <Send size={20} color='white' />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Partner Answer */}
                <View style={styles.answerSection}>
                  <View style={styles.userRow}>
                    <View style={[styles.miniAvatarContainer, { borderColor: '#F9A8D4' }]}>
                      <Image source={getUserAvatar(partnerUser)} style={styles.miniAvatar} />
                    </View>
                    <Text style={styles.userRowName}>Partnerinin Cevabı</Text>
                  </View>

                  {bothAnswered ? (
                    <View style={[styles.answerDisplay, styles.partnerAnswerDisplay]}>
                      <Text style={styles.answerDisplayText}>"{data.partnerAnswer}"</Text>
                      <Text style={styles.answerTime}>Az önce</Text>
                    </View>
                  ) : (
                    <View style={styles.lockedContainer}>
                      {!data.userAnswer ? (
                        <>
                          <View style={styles.lockIconBox}>
                            <Lock size={24} color='#9CA3AF' />
                          </View>
                          <Text style={styles.lockedTitle}>Cevap vermeden göremezsin</Text>
                          <Text style={styles.lockedSubtitle}>Önce kendi cevabını yazmalısın</Text>
                        </>
                      ) : (
                        <>
                          <View style={styles.lockIconBox}>
                            <Clock size={24} color='#9CA3AF' />
                          </View>
                          <Text style={styles.lockedTitle}>Henüz cevap vermedi</Text>
                          <Text style={styles.lockedSubtitle}>Partnerinin cevabı bekleniyor</Text>
                        </>
                      )}
                    </View>
                  )}
                </View>
              </View>

              {/* AI Analysis */}
              {bothAnswered && data.question.aiAnalysis && (
                <AiAnalysisSection
                  data={data}
                  aiUnlocked={aiUnlocked}
                  setAiUnlocked={setAiUnlocked}
                  showToast={showToast}
                  aiCommentFree={aiCommentFree}
                />
              )}

              <View style={styles.footer}>
                <Clock size={14} color='#9CA3AF' />
                <Text style={styles.footerText}>Yarın 00:00'da yeni bir soru sizi bekliyor olacak</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF2F8',
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF2F8'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10
  },
  headerTitle: {
    fontSize: 32,
    color: '#111827',
    textAlign: 'center'
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 5
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 2
  },
  cardDefault: { borderColor: '#FFE4E6' },
  cardWarning: { borderColor: '#FEF3C7' },
  cardSuccess: { borderColor: '#D1FAE5' },
  cardHeader: {
    paddingHorizontal: 25,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  cardHeaderText: {
    color: '#fff',
    fontSize: 20
  },
  emoji: {
    fontSize: 24
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  statusText: {
    color: '#fff',
    fontSize: 12
  },
  cardBody: {
    padding: 20
  },
  questionBox: {
    borderRadius: 25,
    padding: 25,
    marginBottom: 20,
    alignItems: 'center'
  },
  qBoxDefault: { backgroundColor: '#FFF1F2' },
  qBoxWarning: { backgroundColor: '#FFFBEB' },
  qBoxSuccess: { backgroundColor: '#ECFDF5' },
  questionText: {
    fontSize: 22,
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 30
  },
  requestNewQuestionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE'
  },
  requestNewQuestionText: {
    fontSize: 14,
    color: '#4F46E5'
  },
  feedbackRow: {
    marginBottom: 20
  },
  feedbackLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    paddingHorizontal: 4
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12
  },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  feedbackBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#047857',
    borderWidth: 2
  },
  feedbackBtnActiveDislike: {
    backgroundColor: '#E11D48',
    borderColor: '#BE123C',
    borderWidth: 2
  },
  feedbackBtnText: {
    fontSize: 14,
    color: '#6B7280'
  },
  feedbackBtnTextActive: {
    color: '#fff',
  },
  infoBoxWarning: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 20
  },
  infoBoxSuccess: {
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    marginBottom: 20
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  infoTitle: {
    fontSize: 15,

    color: '#111827',
    marginBottom: 2
  },
  infoText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18
  },
  answersContainer: {
    gap: 20,
    marginBottom: 20
  },
  answerSection: {
    gap: 10
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  miniAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FECACA',
    overflow: 'hidden'
  },
  miniAvatar: {
    width: '100%',
    height: '100%'
  },
  userRowName: {
    fontSize: 14,

    color: '#374151'
  },
  answerDisplay: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    minHeight: 80
  },
  partnerAnswerDisplay: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FFE4E6'
  },
  answerDisplayText: {
    fontSize: 16,
    color: '#1F2937'
  },
  answerTime: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8
  },
  inputContainer: {
    position: 'relative'
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 15,
    paddingRight: 60,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 100,
    fontSize: 16,
    color: '#1F2937',
    textAlignVertical: 'top'
  },
  sendBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F43F5E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  sendBtnDisabled: {
    opacity: 0.5
  },
  lockedContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center'
  },
  lockIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  lockedTitle: {
    fontSize: 14,

    color: '#6B7280'
  },
  lockedSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2
  },
  aiBox: {
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E7FF'
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  aiIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  aiLabel: {
    fontSize: 11,
    color: '#4F46E5',
    letterSpacing: 1
  },
  aiText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  unlockAiContainer: {
    marginBottom: 20,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5
  },
  unlockAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 15
  },
  unlockAiIconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  unlockAiTitle: {
    color: 'white',
    fontSize: 16
  },
  unlockAiSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 24,

    color: '#111827',
    marginBottom: 10,
    textAlign: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24
  },
  retryBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25
  },
  retryBtnText: {
    color: '#374151'
  },
  adLoadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  adLoadingCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8
  },
  adLoadingIconWrap: {
    width: 88,
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  adLoadingRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#6366F1',
    borderRightColor: '#A5B4FC'
  },
  adLoadingIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  adLoadingTitle: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 6
  },
  adLoadingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8
  },
  adLoadingCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6'
  },
  adLoadingCancelText: {
    fontSize: 16,
    color: '#6B7280',
  }
})
