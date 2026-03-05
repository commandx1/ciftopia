import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { TextInput } from '../../components/ui/TextInput';
import { Text } from '../../components/ui/Text';
import { useAuth } from '../../context/AuthContext';
import { activityApi, Activity } from '../../api/activity';
import { useToast } from '../../components/ui/ToastProvider';
import {
  History,
  Heart,
  Camera,
  Star,
  Calendar,
  Feather,
  StickyNote,
  Hourglass,
  MessageCircle,
  ShieldCheck,
  CreditCard,
  Search,
  Loader2,
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const moduleConfigs: Record<string, { icon: any; color: string; label: string; bgColor: string; iconColor: string }> = {
  memories: { icon: Heart, color: 'rose', label: 'Anılar', bgColor: '#FFF1F2', iconColor: '#F43F5E' },
  gallery: { icon: Camera, color: 'purple', label: 'Galeri', bgColor: '#F3E8FF', iconColor: '#A855F7' },
  'bucket-list': { icon: Star, color: 'amber', label: 'Hayaller', bgColor: '#FEF3C7', iconColor: '#F59E0B' },
  'important-dates': { icon: Calendar, color: 'pink', label: 'Tarihler', bgColor: '#FDF2F8', iconColor: '#EC4899' },
  poems: { icon: Feather, color: 'indigo', label: 'Şiirler', bgColor: '#E0E7FF', iconColor: '#6366F1' },
  notes: { icon: StickyNote, color: 'blue', label: 'Notlar', bgColor: '#EFF6FF', iconColor: '#3B82F6' },
  'time-capsule': { icon: Hourglass, color: 'orange', label: 'Zaman Kapsülü', bgColor: '#FFF7ED', iconColor: '#F97316' },
  'daily-question': { icon: MessageCircle, color: 'emerald', label: 'Günlük Soru', bgColor: '#ECFDF5', iconColor: '#10B981' },
  onboarding: { icon: ShieldCheck, color: 'cyan', label: 'Sistem', bgColor: '#ECFEFF', iconColor: '#06B6D4' },
  payment: { icon: CreditCard, color: 'slate', label: 'Ödeme', bgColor: '#F1F5F9', iconColor: '#64748B' },
};

const getUserAvatar = (user?: any) => {
  if (user?.avatar?.url) {
    if (user.avatar.url.startsWith('http') || user.avatar.url.startsWith('/')) {
      return { uri: user.avatar.url }
    }
  }
  return user?.gender === 'female'
    ? require('../../assets/woman-pp.png')
    : require('../../assets/man-pp.png')
}

export default function ActivitiesScreen() {
  const { user } = useAuth();
  const { show: showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchActivities = useCallback(async (pageNum: number, isLoadMore = false, moduleFilter?: string) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else if (!refreshing) setLoading(true);

      const currentFilter = moduleFilter !== undefined ? moduleFilter : activeFilter;
      const res = await activityApi.getActivities({
        page: pageNum,
        limit: 10,
        module: currentFilter === 'all' ? undefined : currentFilter,
      }, user?.accessToken);

      if (isLoadMore) {
        setActivities(prev => [...prev, ...res.activities]);
      } else {
        setActivities(res.activities);
      }

      setHasMore(res.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Hata', message: 'Aktiviteler yüklenirken bir sorun oluştu.' });
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [user, activeFilter, refreshing]);

  useEffect(() => {
    fetchActivities(1, false, activeFilter);
  }, [activeFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities(1, false, activeFilter);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchActivities(page + 1, true);
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.userId.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F43F5E']} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <History size={32} color="#F43F5E" />
              </View>
              <View>
                <Text style={styles.mainTitle}>Güncellemeler</Text>
                <Text style={styles.subtitle}>Son aktivitelerinizi görün</Text>
              </View>
            </View>
          </View>

          <View style={styles.searchWrapper}>
            <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              placeholder="Güncelleme ara..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={styles.searchInput}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
          <TouchableOpacity
            onPress={() => setActiveFilter('all')}
            style={[styles.filterBtn, activeFilter === 'all' && styles.filterBtnActive]}
          >
            <Text style={[styles.filterBtnText, activeFilter === 'all' && styles.filterBtnTextActive]}>Tümü</Text>
          </TouchableOpacity>
          {Object.entries(moduleConfigs).map(([key, config]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveFilter(key)}
              style={[
                styles.filterBtn,
                activeFilter === key && { backgroundColor: config.iconColor, borderColor: config.iconColor }
              ]}
            >
              <config.icon size={14} color={activeFilter === key ? 'white' : '#6B7280'} />
              <Text style={[styles.filterBtnText, activeFilter === key && styles.filterBtnTextActive]}>{config.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.activitiesList}>
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F43F5E" />
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
          ) : filteredActivities.length > 0 ? (
            <>
              {filteredActivities.map((activity) => {
                const config = moduleConfigs[activity.module] || moduleConfigs.onboarding;
                const Icon = config.icon;
                return (
                  <View key={activity._id} style={styles.activityCard}>
                    <View style={[styles.moduleIconBox, { backgroundColor: config.bgColor }]}>
                      <Icon size={24} color={config.iconColor} />
                    </View>
                    <View style={styles.activityContent}>
                      <View style={styles.activityHeader}>
                        <Text style={[styles.moduleLabel, { color: config.iconColor }]}>{config.label}</Text>
                        <Text style={styles.timeText}>
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: tr })}
                        </Text>
                      </View>
                      <Text style={styles.description}>{activity.description}</Text>
                      <View style={styles.userInfo}>
                        <View style={styles.avatarBox}>
                          <Image source={getUserAvatar(activity.userId)} style={styles.avatar} />
                        </View>
                        <Text style={styles.userName}>{activity.userId.firstName} {activity.userId.lastName}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}

              {hasMore && (
                <TouchableOpacity
                  onPress={handleLoadMore}
                  disabled={loadingMore}
                  style={styles.loadMoreBtn}
                >
                  {loadingMore ? (
                    <ActivityIndicator color="#111827" size="small" />
                  ) : (
                    <Text style={styles.loadMoreText}>DAHA FAZLA YÜKLE</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <History size={48} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyTitle}>Henüz güncelleme yok</Text>
              <Text style={styles.emptySubtitle}>Anı, fotoğraf, not vb. ekledikçe burada görünecek.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconBox: {
    width: 56,
    height: 56,
    backgroundColor: '#FFF1F2',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  searchWrapper: {
    position: 'relative',
    marginTop: 10,
  },
  searchIcon: {
    position: 'absolute',
    left: 15,
    top: '50%',
    marginTop: -9,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 15,
    padding: 12,
    paddingLeft: 45,
    fontSize: 14,
    color: '#111827',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  filterBtnActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  filterBtnText: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  filterBtnTextActive: {
    color: 'white',
  },
  activitiesList: {
    paddingHorizontal: 20,
    gap: 15,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 15,
    flexDirection: 'row',
    gap: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  moduleIconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  moduleLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  timeText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  description: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadMoreBtn: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loadMoreText: {
    fontSize: 12,
    color: '#111827',
    letterSpacing: 1,
  },
  loadingContainer: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#9CA3AF',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    backgroundColor: '#F9FAFB',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
