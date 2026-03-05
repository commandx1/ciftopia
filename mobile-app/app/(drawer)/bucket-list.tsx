import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/ui/Text';
import { useAuth } from '../../context/AuthContext';
import { bucketListApi, BucketListItem } from '../../api/bucket-list';
import { useToast } from '../../components/ui/ToastProvider';
import { Plus, Sparkles, Map, Coffee, Home, Heart, Film } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DreamCard from '../../components/bucket-list/DreamCard';
import NewDreamModal from '../../components/bucket-list/NewDreamModal';

const CATEGORIES = [
  { id: 'all', label: 'Tümü', icon: Sparkles, color: '#6366F1' },
  { id: 'experience', label: 'Deneyim', icon: Film, color: '#8B5CF6' },
  { id: 'travel', label: 'Seyahat', icon: Map, color: '#3B82F6' },
  { id: 'food', label: 'Yemek', icon: Coffee, color: '#F59E0B' },
  { id: 'home', label: 'Ev', icon: Home, color: '#10B981' },
  { id: 'relationship', label: 'İlişki', icon: Heart, color: '#EF4444' },
];

export default function BucketListScreen() {
  const { user } = useAuth();
  const { show: showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDream, setEditingDream] = useState<BucketListItem | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'completed', 'pending'

  const fetchBucketList = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await bucketListApi.getBucketList(user?.accessToken);
      setItems(data);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Hayaller listesi yüklenirken bir sorun oluştu.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBucketList();
  }, [fetchBucketList]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBucketList(true);
  };

  const filteredItems = items.filter(item => {
    const categoryMatch = activeCategory === 'all' || item.category === activeCategory;
    const filterMatch =
      activeFilter === 'all' ||
      (activeFilter === 'completed' && item.isCompleted) ||
      (activeFilter === 'pending' && !item.isCompleted);
    return categoryMatch && filterMatch;
  });

  const handleToggleComplete = async (item: BucketListItem) => {
    try {
      const updated = await bucketListApi.update(
        item._id, 
        { isCompleted: !item.isCompleted }, 
        user?.accessToken
      );
      if (updated) {
        setItems(items.map(i => i._id === item._id ? updated : i));
        if (!item.isCompleted) {
          showToast({
            type: 'success',
            title: 'Tebrikler! 🎉',
            message: 'Bir hayal daha gerçek oldu!',
          });
        }
      }
    } catch (error) {
      showToast({ type: 'error', title: 'Hata', message: 'Durum güncellenemedi.' });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Hayali Sil',
      'Bu hayali listeden silmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await bucketListApi.delete(id, user?.accessToken);
              setItems(items.filter(i => i._id !== id));
              showToast({ type: 'success', title: 'Başarılı', message: 'Hayal silindi.' });
            } catch (err) {
              showToast({ type: 'error', title: 'Hata', message: 'Hayal silinemedi.' });
            }
          },
        },
      ]
    );
  };

  const completedCount = items.filter(i => i.isCompleted).length;
  const totalCount = items.length;
  const pendingCount = totalCount - completedCount;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F43F5E']} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.mainTitle}>Hayallerimiz ✨</Text>
              <Text style={styles.subtitle}>Birlikte gerçekleştireceğimiz her şey...</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setEditingDream(null);
                setIsModalOpen(true);
              }}
              style={styles.addBtn}
            >
              <LinearGradient
                colors={['#F43F5E', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addGradient}
              >
                <Plus size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.progressCardContainer}>
            <LinearGradient
              colors={['#F5F3FF', '#EDE9FE']}
              style={styles.progressCard}
            >
              <View style={styles.progressInfo}>
                <View style={styles.progressTextCol}>
                  <Text style={styles.progressLabel}>İLERLEME DURUMU</Text>
                  <Text style={styles.progressCount}>
                    {completedCount}/{totalCount} <Text style={styles.progressSubText}>hayal tamamlandı</Text>
                  </Text>
                </View>
                <View style={styles.trophyIcon}>
                  <Text style={{ fontSize: 40 }}>🏆</Text>
                </View>
              </View>

              <View style={styles.progressDetails}>
                <View style={styles.progressRow}>
                  <Text style={styles.progressRowLabel}>Tamamlanma Oranı</Text>
                  <Text style={styles.progressPercentage}>%{Math.round(progress)}</Text>
                </View>
                <View style={styles.progressBarWrapper}>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                  </View>
                </View>
              </View>

              <Text style={styles.motivationalText}>
                {progress === 100 
                  ? 'Tebrikler! Tüm hayallerinizi gerçekleştirdiniz! 🎉' 
                  : totalCount === 0 
                    ? 'Henüz hayal eklememişsiniz. Hadi bir tane ekleyelim! ✨'
                    : `Harika gidiyorsunuz! ${pendingCount} hedef daha tamamlayın ve %100'e ulaşın! 🔥`}
              </Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.filtersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusFilters}>
            <TouchableOpacity 
              onPress={() => setActiveFilter('all')}
              style={[styles.statusBtn, activeFilter === 'all' && styles.statusBtnActive]}
            >
              <Text style={[styles.statusBtnText, activeFilter === 'all' && styles.statusBtnTextActive]}>Tümü</Text>
              <View style={[styles.badge, activeFilter === 'all' ? styles.badgeActive : styles.badgeInactive]}>
                <Text style={[styles.badgeText, activeFilter === 'all' && styles.badgeTextActive]}>{totalCount}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setActiveFilter('completed')}
              style={[styles.statusBtn, activeFilter === 'completed' && styles.statusBtnActiveCompleted]}
            >
              <Text style={[styles.statusBtnText, activeFilter === 'completed' && styles.statusBtnTextActive]}>Yapıldı ✓</Text>
              <View style={[styles.badge, activeFilter === 'completed' ? styles.badgeActive : styles.badgeInactive]}>
                <Text style={[styles.badgeText, activeFilter === 'completed' && styles.badgeTextActive]}>{completedCount}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setActiveFilter('pending')}
              style={[styles.statusBtn, activeFilter === 'pending' && styles.statusBtnActivePending]}
            >
              <Text style={[styles.statusBtnText, activeFilter === 'pending' && styles.statusBtnTextActive]}>Bekliyor</Text>
              <View style={[styles.badge, activeFilter === 'pending' ? styles.badgeActive : styles.badgeInactive]}>
                <Text style={[styles.badgeText, activeFilter === 'pending' && styles.badgeTextActive]}>{pendingCount}</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryFilters}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                style={[
                  styles.categoryBtn,
                  activeCategory === cat.id && { backgroundColor: cat.color + '20', borderColor: cat.color }
                ]}
              >
                <cat.icon size={16} color={activeCategory === cat.id ? cat.color : '#9CA3AF'} />
                <Text style={[
                  styles.categoryBtnText,
                  activeCategory === cat.id && { color: cat.color }
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>
            {activeFilter === 'completed' ? '🎉 Tamamlanan Hayaller' :
             activeFilter === 'pending' ? '⏳ Bekleyen Hayaller' : '✨ Tüm Hayallerimiz'}
          </Text>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F43F5E" />
            </View>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <DreamCard
                key={item._id}
                item={item}
                isOwner={item.authorId._id === user?._id}
                onPress={() => {
                  setEditingDream(item);
                  setIsModalOpen(true);
                }}
                onToggleComplete={() => handleToggleComplete(item)}
                onDelete={() => handleDelete(item._id)}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Sparkles size={40} color="#FDA4AF" />
              </View>
              <Text style={styles.emptyTitle}>Birlikte neler yapmak istiyorsunuz?</Text>
              <Text style={styles.emptySubtitle}>Hayallerinizi paylaşın ve birlikte gerçekleştirmenin mutluluğunu yaşayın!</Text>
              <TouchableOpacity
                onPress={() => setIsModalOpen(true)}
                style={styles.emptyActionBtn}
              >
                <LinearGradient
                  colors={['#F43F5E', '#EC4899']}
                  style={styles.emptyActionGradient}
                >
                  <Plus size={20} color="white" />
                  <Text style={styles.emptyActionText}>İlk Hedefinizi Ekleyin</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <NewDreamModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBucketList}
        editingDream={editingDream}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF1F2', // Frontend rose-50 light background
    paddingTop: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerSection: {
    padding: 20,
    paddingTop: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 32,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginTop: 4,
  },
  addBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addGradient: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCardContainer: {
    marginBottom: 10,
  },
  progressCard: {
    borderRadius: 35,
    padding: 25,
    borderWidth: 2,
    borderColor: '#EDE9FE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTextCol: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 13,
    color: '#6D28D9',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  progressCount: {
    fontSize: 32,
    color: '#7C3AED',
  },
  progressSubText: {
    fontSize: 16,
    color: '#A78BFA',
  },
  trophyIcon: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '12deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  progressDetails: {
    marginBottom: 15,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  progressRowLabel: {
    fontSize: 14,
    color: '#6D28D9',
    opacity: 0.6,
  },
  progressPercentage: {
    fontSize: 24,
    color: '#7C3AED',
  },
  progressBarWrapper: {
    height: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressBarBg: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 7,
  },
  motivationalText: {
    fontSize: 14,
    color: '#4338CA',
  },
  filtersSection: {
    marginBottom: 25,
  },
  statusFilters: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 15,
  },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    gap: 10,
  },
  statusBtnActive: {
    backgroundColor: '#F43F5E',
    borderColor: '#F43F5E',
  },
  statusBtnActiveCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  statusBtnActivePending: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  statusBtnText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBtnTextActive: {
    color: 'white',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeInactive: {
    backgroundColor: '#F3F4F6',
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  badgeTextActive: {
    color: 'white',
  },
  categoryFilters: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    gap: 8,
  },
  categoryBtnText: {
    fontSize: 13,
    color: '#6B7280',
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    color: '#111827',
    marginBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 40,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4E6',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    backgroundColor: '#FFF1F2',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  emptyTitle: {
    fontSize: 24,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  emptyActionBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  emptyActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  emptyActionText: {
    color: 'white',
    fontSize: 16,
  },
});
