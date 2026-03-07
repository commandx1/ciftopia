import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/ui/Text'
import { useAuth } from '../../context/AuthContext'
import { memoriesApi, StoryListItem } from '../../api/memories'
import { useRouter } from 'expo-router'
import { BookOpen, Calendar, Clock, Sparkles, Play, Pause, ArrowLeft } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Markdown from 'react-native-markdown-display'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { romanticRoseTheme } from '../../theme/romanticRose'
import { Audio } from 'expo-av'

const theme = romanticRoseTheme

const CARD_GRADIENTS = [
  ['#F472B6', '#EC4899', '#A855F7'],
  ['#FB923C', '#F97316', '#E11D48'],
  ['#34D399', '#10B981', '#14B8A6'],
  ['#818CF8', '#A855F7', '#EC4899'],
] as const

const SORT_OPTIONS = [
  { id: 'newest', label: 'En yeni' },
  { id: 'oldest', label: 'En eski' },
]

export default function StoriesScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [list, setList] = useState<StoryListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [storyContent, setStoryContent] = useState<string | null>(null)
  const [storyAudioUrl, setStoryAudioUrl] = useState<string | null>(null)
  const [storyUsedMemories, setStoryUsedMemories] = useState<{ _id: string; title: string }[]>([])
  const [audioLoading, setAudioLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const soundRef = React.useRef<Audio.Sound | null>(null)

  const fetchStories = useCallback(async () => {
    if (!user?.accessToken) return
    try {
      const data = await memoriesApi.getStories(user.accessToken)
      setList(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.accessToken])

  useEffect(() => {
    fetchStories()
  }, [fetchStories])

  const onRefresh = () => {
    setRefreshing(true)
    fetchStories()
  }

  const openStory = async (id: string) => {
    if (!user?.accessToken) return
    try {
      const story = await memoriesApi.getStory(id, user.accessToken)
      setStoryContent(story.content)
      setStoryAudioUrl(story.audioUrl ?? null)
      setStoryUsedMemories(story.usedMemories ?? [])
      setSelectedId(id)
    } catch (err) {
      console.error(err)
    }
  }

  const closeModal = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync()
      } catch (_) {}
      soundRef.current = null
    }
    setIsPlaying(false)
    setSelectedId(null)
    setStoryContent(null)
    setStoryAudioUrl(null)
    setStoryUsedMemories([])
  }, [])

  const togglePlay = async () => {
    if (!storyAudioUrl) return
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync()
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync()
          setIsPlaying(false)
        } else {
          await soundRef.current.playAsync()
          setIsPlaying(true)
        }
        return
      }
      setAudioLoading(true)
      const { sound } = await Audio.Sound.createAsync(
        { uri: storyAudioUrl },
        { shouldPlay: true }
      )
      soundRef.current = sound
      setIsPlaying(true)
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false)
        }
      })
    } catch (err) {
      console.error(err)
    } finally {
      setAudioLoading(false)
    }
  }

  const totalWords = list.reduce((s, i) => s + i.wordCount, 0)
  const displayList = sortBy === 'oldest' ? [...list].reverse() : list

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.accent]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.push('/memories')}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={theme.accent} />
          <Text style={styles.backBtnText}>Geri dön</Text>
        </TouchableOpacity>
        <LinearGradient
          colors={['#FDF2F8', '#FCE7F3', '#F5D0FE']}
          style={styles.hero}
        >
          <View style={styles.heroIconWrap}>
            <LinearGradient
              colors={[theme.accent, '#EC4899']}
              style={styles.heroIconGradient}
            >
              <BookOpen color="white" size={32} />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>Hikayelerimiz</Text>
          <Text style={styles.heroSubtitle}>
            Anılardan oluşan büyülü hikayeler
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <BookOpen size={14} color={theme.accent} />
              <Text style={styles.statPillText}>{list.length} hikaye</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statPillText}>
                {(totalWords / 1000).toFixed(1)}k kelime
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.toolbar}>
          <View style={styles.sortWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setSortBy(opt.id as 'newest' | 'oldest')}
                  style={[
                    styles.sortBtn,
                    sortBy === opt.id && styles.sortBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.sortBtnText,
                      sortBy === opt.id && styles.sortBtnTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/memories')}
            style={styles.createBtn}
          >
            <LinearGradient
              colors={[theme.accent, '#EC4899']}
              style={styles.createBtnGradient}
            >
              <Sparkles size={18} color="white" />
              <Text style={styles.createBtnText}>Oluştur</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        ) : displayList.length === 0 ? (
          <View style={styles.emptyWrap}>
            <BookOpen size={48} color={theme.cardSoft} />
            <Text style={styles.emptyTitle}>Henüz hikaye yok</Text>
            <Text style={styles.emptySubtitle}>
              Anılarınızdan ilk hikayenizi oluşturun
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/memories')}
              style={styles.emptyBtn}
            >
              <LinearGradient
                colors={theme.accentGradient}
                style={styles.emptyBtnGradient}
              >
                <Text style={styles.emptyBtnText}>Hikaye Oluştur</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {displayList.map((item, index) => (
              <View key={item._id} style={styles.card}>
                <LinearGradient
                  colors={[...CARD_GRADIENTS[index % CARD_GRADIENTS.length]]}
                  style={styles.cardHeader}
                >
                  <View style={styles.cardHeaderCircles}>
                    <View style={[styles.circle, styles.circle1]} />
                    <View style={[styles.circle, styles.circle2]} />
                    <View style={[styles.circle, styles.circle3]} />
                  </View>
                  <View style={styles.cardHeaderIcon}>
                    <BookOpen color="white" size={40} />
                  </View>
                </LinearGradient>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>Hikayemiz</Text>
                  <View style={styles.cardMeta}>
                    <Calendar size={12} color={theme.textSecondary} />
                    <Text style={styles.cardMetaText}>
                      {format(new Date(item.date), 'd MMMM yyyy, HH:mm', {
                        locale: tr,
                      })}
                    </Text>
                    <Text style={styles.cardMetaDot}>•</Text>
                    <Clock size={12} color={theme.textSecondary} />
                    <Text style={styles.cardMetaText}>
                      {item.readMinutes} dk okuma
                    </Text>
                  </View>
                  <Text style={styles.cardExcerpt} numberOfLines={3}>
                    {item.excerpt}
                  </Text>
                  {item.usedMemories && item.usedMemories.length > 0 ? (
                    <View style={styles.usedMemoriesSection}>
                      <Text style={styles.usedMemoriesLabel}>
                        Kullanılan Anılar ({item.usedMemories.length})
                      </Text>
                      <View style={styles.usedMemoriesChips}>
                        {item.usedMemories.slice(0, 3).map((mem) => (
                          <View key={mem._id} style={styles.memoryChip}>
                            <Text style={styles.memoryChipText} numberOfLines={1}>
                              {mem.title}
                            </Text>
                          </View>
                        ))}
                        {item.usedMemories.length > 3 ? (
                          <Text style={styles.memoryChipMore}>
                            +{item.usedMemories.length - 3} daha
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  ) : null}
                  <TouchableOpacity
                    onPress={() => openStory(item._id)}
                    style={styles.readBtn}
                  >
                    <LinearGradient
                      colors={[theme.accent, '#EC4899']}
                      style={styles.readBtnGradient}
                    >
                      <BookOpen size={18} color="white" />
                      <Text style={styles.readBtnText}>Hikayeyi Oku</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!selectedId} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              {storyAudioUrl ? (
                <TouchableOpacity
                  onPress={togglePlay}
                  disabled={audioLoading}
                  style={styles.modalPlayBtn}
                >
                  {audioLoading ? (
                    <ActivityIndicator size={20} color={theme.accent} />
                  ) : isPlaying ? (
                    <Pause size={22} color={theme.accent} />
                  ) : (
                    <Play size={22} color={theme.accent} />
                  )}
                </TouchableOpacity>
              ) : null}
              <Text style={styles.modalTitle}>Anılarımızın Hikâyesi</Text>
            </View>
            <Pressable onPress={closeModal} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>Kapat</Text>
            </Pressable>
          </View>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
          >
            {storyUsedMemories.length > 0 ? (
              <View style={styles.modalUsedMemories}>
                <Text style={styles.modalUsedMemoriesLabel}>
                  Kullanılan Anılar ({storyUsedMemories.length})
                </Text>
                <View style={styles.modalUsedMemoriesChips}>
                  {storyUsedMemories.map((mem) => (
                    <View key={mem._id} style={styles.modalMemoryChip}>
                      <Text style={styles.modalMemoryChipText}>{mem.title}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
            {storyContent ? (
              <Markdown style={markdownStyles}>{storyContent}</Markdown>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const markdownStyles = {
  body: {
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'IndieFlower'
  },
  heading1: { color: theme.textPrimary, fontSize: 22, marginTop: 16, marginBottom: 8 },
  heading2: { color: theme.textPrimary, fontSize: 18, marginTop: 14, marginBottom: 6 },
  heading3: { color: theme.textPrimary, fontSize: 16, marginTop: 12, marginBottom: 4 },
  paragraph: {
    marginBottom: 10,
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  strong: { color: theme.textPrimary },
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  backBtnText: {
    fontSize: 16,
    color: theme.accent,
    fontWeight: '600',
  },
  hero: {
    padding: 24,
    marginBottom: 12,
    alignItems: 'center',
  },
  heroIconWrap: {
    marginBottom: 12,
  },
  heroIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sortWrap: {
    flex: 1,
  },
  sortBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 8,
  },
  sortBtnActive: {
    backgroundColor: theme.cardSoft,
  },
  sortBtnText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  sortBtnTextActive: {
    color: theme.accent,
    fontWeight: '600',
  },
  createBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  createBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  loadingWrap: {
    padding: 40,
    alignItems: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 8,
    marginBottom: 24,
  },
  emptyBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyBtnGradient: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  list: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  cardHeader: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderCircles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 999,
  },
  circle1: { width: 80, height: 80, top: 16, left: 16 },
  circle2: { width: 64, height: 64, bottom: 24, right: 24 },
  circle3: { width: 48, height: 48, top: 48, right: 48 },
  cardHeaderIcon: {
    opacity: 0.35,
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  cardMetaText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  cardMetaDot: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  cardExcerpt: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  usedMemoriesSection: {
    marginBottom: 16,
  },
  usedMemoriesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
  },
  usedMemoriesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memoryChip: {
    backgroundColor: theme.cardSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    maxWidth: 120,
  },
  memoryChipText: {
    fontSize: 12,
    color: theme.accent,
    fontWeight: '500',
  },
  memoryChipMore: {
    fontSize: 12,
    color: theme.textSecondary,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  readBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  readBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  readBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderSofter,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalPlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.cardSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  modalCloseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCloseText: {
    fontSize: 15,
    color: theme.accent,
    fontWeight: '600',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalUsedMemories: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderSofter,
  },
  modalUsedMemoriesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
  },
  modalUsedMemoriesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalMemoryChip: {
    backgroundColor: theme.cardSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  modalMemoryChipText: {
    fontSize: 13,
    color: theme.accent,
    fontWeight: '500',
  },
})
