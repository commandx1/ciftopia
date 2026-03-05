import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/ui/Text'
import { useAuth } from '../../context/AuthContext'
import { poemsApi } from '../../api/poems'
import { useToast } from '../../components/ui/ToastProvider'
import { Feather, Pen, Sparkles, BookOpen, Heart, Plus } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import PoemCard from '../../components/poems/PoemCard'
import NewPoemModal from '../../components/poems/NewPoemModal'
import PoemDetailModal from '../../components/poems/PoemDetailModal'

const { width } = Dimensions.get('window')

export default function PoemsScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const { show: showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [poems, setPoems] = useState<any[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [filterTag, setFilterTag] = useState('all')
  const [filterAuthor, setFilterAuthor] = useState('all')
  const [stats, setStats] = useState({ total: 0 })
  const [authorStats, setAuthorStats] = useState<any[]>([])

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [editingPoem, setEditingPoem] = useState<any>(null)
  const [selectedPoem, setSelectedPoem] = useState<any>(null)

  const fetchPoems = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setLoading(true)
      try {
        const res = await poemsApi.getPoems(
          {
            tag: filterTag === 'all' ? undefined : filterTag,
            author: filterAuthor === 'all' ? undefined : filterAuthor
          },
          user?.accessToken
        )

        if (res.success) {
          setPoems(res.data.poems)
          setStats({ total: res.data.totalCount })
          setAuthorStats(res.data.authorStats)
        }
      } catch (error) {
        console.error('Poems fetch error:', error)
        showToast({
          type: 'error',
          title: 'Hata',
          message: 'Şiirler yüklenirken bir sorun oluştu.'
        })
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [user, filterTag, filterAuthor]
  )

  const fetchTags = useCallback(async () => {
    try {
      const res = await poemsApi.getTags(user?.accessToken)
      if (res.success) {
        setAvailableTags(res.data)
      }
    } catch (err) {
      console.error('Tags fetch error:', err)
    }
  }, [user])

  useEffect(() => {
    fetchPoems()
    fetchTags()
  }, [fetchPoems, fetchTags])

  const onRefresh = () => {
    setRefreshing(true)
    fetchPoems(true)
    fetchTags()
  }

  const handleDelete = (id: string) => {
    Alert.alert('Şiiri Sil', 'Bu şiiri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await poemsApi.deletePoem(id, user?.accessToken)
            if (res.success) {
              showToast({
                type: 'success',
                title: 'Başarılı',
                message: 'Şiir silindi.'
              })
              fetchPoems(true)
            }
          } catch (err) {
            showToast({ type: 'error', title: 'Hata', message: 'Şiir silinemedi.' })
          }
        }
      }
    ])
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.headerBox}>
          <LinearGradient colors={['#F5F3FF', '#FDF2F8']} style={styles.headerGradient}>
            <View style={styles.headerTop}>
              <View style={styles.headerInfo}>
                <View style={styles.iconCircle}>
                  <Feather size={24} color='white' />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Şiirlerimiz</Text>
                  <Text style={styles.headerSubtitle}>Duygusal dizeler...</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setEditingPoem(null)
                  setIsNewModalOpen(true)
                }}
                style={styles.writeBtn}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.writeGradient}
                >
                  <Pen size={16} color='white' />
                  <Text style={styles.writeText}>Yaz</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <TouchableOpacity
                onPress={() => setFilterAuthor('all')}
                style={[styles.statCard, filterAuthor === 'all' && styles.statCardActive]}
              >
                <Text style={[styles.statValue, filterAuthor === 'all' && styles.statActiveText]}>{stats.total}</Text>
                <Text style={styles.statLabel}>Toplam</Text>
              </TouchableOpacity>

              {authorStats
                .sort((a, b) => b._id.toString().localeCompare(a._id.toString()))
                .map((stat, idx) => (
                  <TouchableOpacity
                    key={stat._id}
                    onPress={() => setFilterAuthor(stat._id)}
                    style={[styles.statCard, filterAuthor === stat._id && styles.statCardActive]}
                  >
                    <Text style={[styles.statValue, filterAuthor === stat._id && styles.statActiveText]}>
                      {stat.count}
                    </Text>
                    <Text style={styles.statLabel} numberOfLines={1}>
                      {stat.firstName}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </LinearGradient>
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
            <TouchableOpacity
              onPress={() => setFilterTag('all')}
              style={[styles.tagFilter, filterTag === 'all' && styles.tagFilterActive]}
            >
              <Text style={[styles.tagFilterText, filterTag === 'all' && styles.tagFilterTextActive]}>Tümü</Text>
            </TouchableOpacity>
            {availableTags.map(tag => (
              <TouchableOpacity
                key={tag}
                onPress={() => setFilterTag(tag)}
                style={[styles.tagFilter, filterTag === tag && styles.tagFilterActive]}
              >
                <Text style={[styles.tagFilterText, filterTag === tag && styles.tagFilterTextActive]}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Poems Grid */}
        <View style={styles.poemsGrid}>
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='large' color='#8B5CF6' />
            </View>
          ) : poems.length > 0 ? (
            poems.map((poem, index) => (
              <PoemCard
                key={poem._id}
                poem={poem}
                index={index}
                isOwner={poem.authorId._id === user?._id}
                onPress={() => setSelectedPoem(poem)}
                onEdit={() => {
                  setEditingPoem(poem)
                  setIsNewModalOpen(true)
                }}
                onDelete={() => handleDelete(poem._id)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Feather size={48} color='#D1D5DB' />
              </View>
              <Text style={styles.emptyTitle}>Henüz Şiir Yok</Text>
              <Text style={styles.emptyText}>İlk şiiri siz yazmak ister misiniz?</Text>
              <TouchableOpacity onPress={() => setIsNewModalOpen(true)} style={styles.emptyBtn}>
                <Plus size={20} color='white' />
                <Text style={styles.emptyBtnText}>Şiir Yaz</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <View style={styles.tipsHeader}>
            <Sparkles size={20} color='#F59E0B' />
            <Text style={styles.tipsTitle}>İlham Kaynakları</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tipsScroll}>
            <TouchableOpacity
              onPress={() => router.push('/poems-tips')}
              style={[styles.tipCard, { backgroundColor: '#FFFBEB' }]}
            >
              <BookOpen size={24} color='#F59E0B' />
              <Text style={styles.tipCardTitle}>Yazma İpuçları</Text>
              <Text style={styles.tipCardDesc}>Duygularınızı içten ve samimi bir şekilde ifade edin.</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/poems-romantic')}
              style={[styles.tipCard, { backgroundColor: '#FFF1F2' }]}
            >
              <Heart size={24} color='#F43F5E' />
              <Text style={styles.tipCardTitle}>Romantik Sözler</Text>
              <Text style={styles.tipCardDesc}>Ünlü şairlerin dizeleriyle duygularınızı pekiştirin.</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Modals */}
      <NewPoemModal
        visible={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={onRefresh}
        editingPoem={editingPoem}
      />

      <PoemDetailModal visible={!!selectedPoem} onClose={() => setSelectedPoem(null)} poem={selectedPoem} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 16,
  },
  loadingContainer: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: {
    paddingBottom: 40
  },
  headerBox: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  headerGradient: {
    padding: 25,
    paddingTop: 30,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#EDE9FE'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  headerTitle: {
    fontSize: 28,
    color: '#111827'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280'
  },
  writeBtn: {
    borderRadius: 15,
    overflow: 'hidden'
  },
  writeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 8
  },
  writeText: {
    color: '#fff',
    fontSize: 15
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff'
  },
  statCardActive: {
    backgroundColor: '#fff',
    borderColor: '#8B5CF6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  statValue: {
    fontSize: 24,
    color: '#6B7280'
  },
  statActiveText: {
    color: '#8B5CF6'
  },
  statLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginTop: 2
  },
  filtersSection: {
    marginBottom: 20
  },
  tagsScroll: {
    paddingHorizontal: 20,
    gap: 10
  },
  tagFilter: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  tagFilterActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6'
  },
  tagFilterText: {
    fontSize: 14,
    color: '#6B7280'
  },
  tagFilterTextActive: {
    color: '#fff'
  },
  poemsGrid: {
    paddingHorizontal: 20
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderStyle: 'dashed'
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 20,
    color: '#111827',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 25
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 15,
    gap: 10
  },
  emptyBtnText: {
    color: '#fff'
  },
  tipsSection: {
    marginTop: 30,
    paddingHorizontal: 20
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15
  },
  tipsTitle: {
    fontSize: 20,
    color: '#111827'
  },
  tipsScroll: {
    gap: 15
  },
  tipCard: {
    width: width * 0.7,
    padding: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  tipCardTitle: {
    fontSize: 16,
    color: '#111827',
    marginTop: 12,
    marginBottom: 5
  },
  tipCardDesc: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18
  }
})
