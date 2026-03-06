import React,{ useEffect,useState,useCallback } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/ui/Text'
import { useAuth } from '../../context/AuthContext'
import { useAppSocket } from '../../context/AppSocketContext'
import { memoriesApi,Memory } from '../../api/memories'
import { useToast } from '../../components/ui/ToastProvider'
import { GenerateSongModal } from '../../components/memories/GenerateSongModal'
import { SongPlayerModal } from '../../components/memories/SongPlayerModal'
import type { SongStep } from '../../components/memories/GenerateSongModal'
import {
  Clock,
  Heart,
  Plus,
  Filter,
  Sparkles,
  Star,
  ArrowDown,
  HeartOff,
  CalendarIcon,
} from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import MemoryCard from '../../components/memories/MemoryCard'
import NewMemoryModal from '../../components/memories/NewMemoryModal'
import { moodConfigs } from '../../components/memories/MemoryMoodBadge'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { romanticRoseTheme } from '../../theme/romanticRose'
import { nightBlueTheme } from '../../theme/nightBlue'

const SORT_OPTIONS = [
  { id: 'newest',label: 'En yeni',emoji: '🆕' },
  { id: 'oldest',label: 'En eski',emoji: '🕰️' },
  { id: 'alphabetical',label: 'Alfabetik',emoji: '🔤' },
]

const themes = {
  romanticRose: romanticRoseTheme,
  nightBlue: nightBlueTheme,
} as const

const theme = themes.romanticRose

export default function MemoriesScreen() {
  const { user } = useAuth()
  const { show: showToast } = useToast()
  const [loading,setLoading] = useState(true)
  const [loadingMore,setLoadingMore] = useState(false)
  const [refreshing,setRefreshing] = useState(false)
  const [memories,setMemories] = useState<Memory[]>([])
  const [stats,setStats] = useState({ total: 0,thisMonth: 0,favorites: 0 })
  const [storage,setStorage] = useState({ used: 0,limit: 0 })
  const [hasMore,setHasMore] = useState(false)

  const [isModalOpen,setIsModalOpen] = useState(false)
  const [editingMemory,setEditingMemory] = useState<Memory | null>(null)
  const [togglingFavorite,setTogglingFavorite] = useState<string | null>(null)
  const [generatingSongId,setGeneratingSongId] = useState<string | null>(null)
  const [songModalMemoryId,setSongModalMemoryId] = useState<string | null>(null)
  const [songProgressStage,setSongProgressStage] = useState<SongStep>('analyzing')
  const [playerMemory,setPlayerMemory] = useState<Memory | null>(null)
  const { socket } = useAppSocket()

  // Filters
  const [sortBy,setSortBy] = useState('newest')
  const [filterMood,setFilterMood] = useState('all')
  const [onlyFavorites,setOnlyFavorites] = useState(false)

  const fetchMemories = useCallback(async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true)
      else setLoading(true)

      const skip = isLoadMore ? memories.length : 0
      const res = await memoriesApi.getMemories({
        mood: filterMood === 'all' ? undefined : filterMood,
        sortBy,
        onlyFavorites,
        limit: 5,
        skip,
      },user?.accessToken)

      if (isLoadMore) {
        setMemories(prev => [...prev,...res.memories])
      } else {
        setMemories(res.memories)
      }

      setStats(res.stats)
      setStorage({ used: res.storageUsed,limit: res.storageLimit })
      setHasMore(res.hasMore)
    } catch (err) {
      console.error(err)
      showToast({ type: 'error',title: 'Hata',message: 'Anılar yüklenirken bir hata oluştu.' })
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setRefreshing(false)
    }
  },[user,sortBy,filterMood,onlyFavorites,memories.length])

  useEffect(() => {
    fetchMemories()
  },[sortBy,filterMood,onlyFavorites])

  const onRefresh = () => {
    setRefreshing(true)
    fetchMemories(false)
  }

  const handleGenerateSong = async (memoryId: string) => {
    if (!user?.accessToken) return
    try {
      setGeneratingSongId(memoryId)
      const data = await memoriesApi.generateSong(memoryId, user.accessToken)
      if (data.started) {
        setSongModalMemoryId(memoryId)
        setSongProgressStage('analyzing')
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: (err as any)?.response?.data?.message || 'Şarkı üretimi başlatılamadı.',
      })
    } finally {
      setGeneratingSongId(null)
    }
  }

  useEffect(() => {
    if (!socket || !songModalMemoryId) return
    const onProgress = (payload: { memoryId: string; stage: string }) => {
      if (payload.memoryId === songModalMemoryId && ['analyzing','lyrics','melody'].includes(payload.stage)) {
        setSongProgressStage(payload.stage as SongStep)
      }
    }
    const onComplete = (payload: {
      memoryId: string
      generatedSongUrl?: string
      generatedSongDurationSeconds?: number
    }) => {
      if (payload.memoryId !== songModalMemoryId) return
      setMemories(prev =>
        prev.map(m =>
          m._id === payload.memoryId
            ? {
                ...m,
                generatedSongUrl: payload.generatedSongUrl,
                generatedSongDurationSeconds: payload.generatedSongDurationSeconds,
              }
            : m,
        ),
      )
      setSongModalMemoryId(null)
      showToast({ type: 'success', title: 'Şarkı hazır', message: 'Anınızın müziği oluşturuldu.' })
    }
    const onError = (payload: { memoryId: string; message?: string }) => {
      if (payload.memoryId !== songModalMemoryId) return
      setSongModalMemoryId(null)
      showToast({ type: 'error', title: 'Hata', message: payload.message || 'Şarkı üretilemedi.' })
    }
    socket.on('song:progress', onProgress)
    socket.on('song:complete', onComplete)
    socket.on('song:error', onError)
    return () => {
      socket.off('song:progress', onProgress)
      socket.off('song:complete', onComplete)
      socket.off('song:error', onError)
    }
  }, [socket, songModalMemoryId, showToast])

  const handleToggleFavorite = async (memory: Memory) => {
    if (togglingFavorite) return
    try {
      setTogglingFavorite(memory._id)
      await memoriesApi.toggleFavorite(memory._id,user?.accessToken)

      const isCurrentlyFavorite = memory.favorites.includes(user?._id || '')
      const newFavorites = isCurrentlyFavorite
        ? memory.favorites.filter(id => id !== user?._id)
        : [...memory.favorites,user?._id || '']

      setMemories(prev => prev.map(m => m._id === memory._id ? { ...m,favorites: newFavorites } : m))
      setStats(prev => ({
        ...prev,
        favorites: isCurrentlyFavorite ? prev.favorites - 1 : prev.favorites + 1,
      }))

      showToast({
        type: 'success',
        title: isCurrentlyFavorite ? 'Favorilerden Çıkarıldı' : 'Favorilere Eklendi',
        message: isCurrentlyFavorite ? 'Anı favorilerden çıkarıldı.' : 'Anı favorilerine eklendi ❤️',
      })
    } catch (err) {
      showToast({ type: 'error',title: 'Hata',message: 'Favori durumu güncellenemedi.' })
    } finally {
      setTogglingFavorite(null)
    }
  }

  const handleDelete = (id: string) => {
    Alert.alert(
      'Anıyı Sil?',
      'Bu anıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç',style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await memoriesApi.delete(id,user?.accessToken)
              setMemories(memories.filter(m => m._id !== id))
              setStats(prev => ({ ...prev,total: prev.total - 1 }))
              showToast({ type: 'success',title: 'Başarılı',message: 'Anı silindi.' })
            } catch (err) {
              showToast({ type: 'error',title: 'Hata',message: 'Anı silinemedi.' })
            }
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.accent]} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={styles.headerMain}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <LinearGradient colors={theme.accentGradient} style={styles.iconGradient}>
                  <Clock color="white" size={32} />
                </LinearGradient>
                <View style={styles.heartBadge}>
                  <Heart color="white" size={12} fill="white" />
                </View>
              </View>
              <View>
                <Text style={styles.title}>Anılarımız</Text>
                <Text style={styles.subtitle}>Birlikte yazdığımız hikaye...</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                setEditingMemory(null)
                setIsModalOpen(true)
              }}
              style={styles.addBtn}
            >
              <LinearGradient colors={theme.accentGradient} style={styles.addGradient}>
                <Plus color="white" size={24} />
                <Sparkles color="#FDE047" size={18} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Toplam</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.thisMonth}</Text>
              <Text style={styles.statLabel}>Bu Ay</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.favorites}</Text>
              <Text style={styles.statLabel}>Favoriler</Text>
            </View>
          </View>

          <View style={styles.filtersWrapper}>
            <View style={styles.filterHeader}>
              <View style={styles.filterTitleRow}>
                <Filter size={18} color={theme.accent} />
                <Text style={styles.filterTitle}>Filtrele & Sırala</Text>
              </View>
              <TouchableOpacity onPress={() => setOnlyFavorites(!onlyFavorites)} style={[styles.favToggle,onlyFavorites && styles.favToggleActive]}>
                <Star
                  size={14}
                  color={onlyFavorites ? theme.highlight : theme.textMuted}
                  fill={onlyFavorites ? theme.highlight : 'none'}
                />
                <Text style={[styles.favToggleText,onlyFavorites && styles.favToggleTextActive]}>Sadece Favoriler</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterControls}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodFilterScroll}>
                <TouchableOpacity
                  onPress={() => setFilterMood('all')}
                  style={[styles.moodFilterBtn,filterMood === 'all' && styles.moodFilterBtnActive]}
                >
                  <Text style={[styles.moodFilterText,filterMood === 'all' && styles.moodFilterTextActive]}>Tümü</Text>
                </TouchableOpacity>
                {Object.entries(moodConfigs).map(([key,config]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setFilterMood(key)}
                    style={[styles.moodFilterBtn,filterMood === key && { borderColor: config.iconColor,backgroundColor: config.badgeBg }]}
                  >
                    <config.icon size={16} color={filterMood === key ? config.iconColor : '#9CA3AF'} />
                  <Text style={[styles.moodFilterText,filterMood === key && { color: config.iconColor }]}>{config.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortFilterScroll}>
                {SORT_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setSortBy(opt.id)}
                    style={[styles.sortBtn,sortBy === opt.id && styles.sortBtnActive]}
                  >
                    <Text style={styles.sortBtnEmoji}>{opt.emoji}</Text>
                    <Text style={[styles.sortBtnText,sortBy === opt.id && styles.sortBtnTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        <View style={styles.timelineSection}>
          {/* Kesintisiz Arka Plan Çizgisi */}
          <View style={styles.timelineLine} />

          {loading && memories.length === 0 ? (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.accent} />
            </View>
          ) : memories.length > 0 ? (
            memories.map((memory,index) => {
              const dateObj = new Date(memory.date)
              const monthYear = format(dateObj,'MMMM yyyy',{ locale: tr })
              const prevMemory = index > 0 ? memories[index - 1] : null
              const showMonthMarker = !prevMemory || format(new Date(prevMemory.date),'MMMM yyyy',{ locale: tr }) !== monthYear

              return (
                <React.Fragment key={memory._id}>
                  {showMonthMarker && (
                    <View style={styles.monthMarker}>
                      <View style={styles.monthIconBox}>
                        <CalendarIcon size={12} color={theme.accent} />
                      </View>
                      <Text style={styles.monthText}>{monthYear}</Text>
                    </View>
                  )}
                  <MemoryCard
                    memory={memory}
                    onEdit={mem => {
                      setEditingMemory(mem)
                      setIsModalOpen(true)
                    }}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                    isUserFavorite={memory.favorites.includes(user?._id || '')}
                    isTogglingFavorite={togglingFavorite === memory._id}
                    onGenerateSong={handleGenerateSong}
                    isGeneratingSong={generatingSongId === memory._id}
                    onPlaySong={setPlayerMemory}
                  />
                </React.Fragment>
              )
            })
          ) : (
            <View style={styles.emptyState}>
              <HeartOff size={48} color={theme.emptyIcon} />
              <Text style={styles.emptyTitle}>Henüz anı eklenmemiş</Text>
              <Text style={styles.emptySubtitle}>İlk anınızı ekleyerek hikayenizi yazmaya başlayın!</Text>
            </View>
          )}

          {hasMore && (
            <TouchableOpacity
              onPress={() => fetchMemories(true)}
              disabled={loadingMore}
              style={styles.loadMoreBtn}
            >
              {loadingMore ? (
                <ActivityIndicator color={theme.accent} />
              ) : (
                <>
                  <ArrowDown size={20} color={theme.accent} />
                  <Text style={styles.loadMoreText}>Daha Fazla Anı Yükle</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <NewMemoryModal
        visible={isModalOpen || !!editingMemory}
        onClose={() => {
          setIsModalOpen(false)
          setEditingMemory(null)
        }}
        onSuccess={() => fetchMemories(false)}
        editingMemory={editingMemory}
        storage={storage}
      />

      <GenerateSongModal visible={!!songModalMemoryId} currentStep={songProgressStage} />

      <SongPlayerModal
        visible={!!playerMemory}
        memory={playerMemory}
        onClose={() => setPlayerMemory(null)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerSection: {
    padding: 20,
    marginRight: 16,
    marginLeft: 16,
    backgroundColor: theme.card,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0,height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconContainer: {
    position: 'relative',
  },
  iconGradient: {
    width: 60,
    height: 60,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    backgroundColor: theme.highlight,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.card,
  },
  title: {
    fontSize: 28,
    color: theme.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  addBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  addGradient: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.cardSoft,
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: theme.borderSofter,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    color: theme.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.divider,
  },
  filtersWrapper: {
    gap: 15,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterTitle: {
    fontSize: 16,
    color: theme.textPrimary,
  },
  favToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.cardSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  favToggleActive: {
    backgroundColor: theme.highlightSoft,
    borderColor: theme.highlightSoftBorder,
  },
  favToggleText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  favToggleTextActive: {
    color: theme.highlight,
  },
  filterControls: {
    gap: 10,
  },
  moodFilterScroll: {
    paddingBottom: 5,
  },
  moodFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    marginRight: 10,
  },
  moodFilterBtnActive: {
    backgroundColor: theme.textPrimary,
    borderColor: theme.textPrimary,
  },
  moodFilterText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  moodFilterTextActive: {
    color: 'white',
  },
  sortFilterScroll: {
    paddingBottom: 5,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    marginRight: 8,
  },
  sortBtnActive: {
    borderColor: theme.accent,
    backgroundColor: theme.cardSoftAlt,
  },
  sortBtnEmoji: {
    fontSize: 14,
  },
  sortBtnText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  sortBtnTextActive: {
    color: theme.accentStrong,
  },
  timelineSection: {
    marginTop: 20,
    position: 'relative',
    minHeight: 400,
  },
  timelineLine: {
    position: 'absolute',
    left: 30, // Çizgi soldan 30px
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: theme.timelineLine,
    opacity: theme.timelineLineOpacity,
  },
  monthMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16, // İkonun merkezini 30px'e getirmek için (30 - 28/2 = 16)
    marginVertical: 15,
    zIndex: 20,
  },
  monthIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.accent,
  },
  monthText: {
    fontSize: 14,
    color: theme.accent,
    marginLeft: 12,
    textTransform: 'capitalize',
  },

  // Empty State - AYNI
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    color: theme.textSecondary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },

  // Load More - AYNI
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 10,
    marginHorizontal: 50,
    backgroundColor: theme.cardSoftAlt,
    borderRadius: 12,
  },
  loadMoreText: {
    fontSize: 14,
    color: theme.accent,
  },

  // Loading - AYNI
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
})
