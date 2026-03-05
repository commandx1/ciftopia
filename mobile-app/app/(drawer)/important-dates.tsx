import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { importantDatesApi, ImportantDate } from '../../api/important-dates';
import { useToast } from '../../components/ui/ToastProvider';
import { Plus, Calendar as CalendarIcon, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import ImportantDateCard from '../../components/important-dates/ImportantDateCard';
import AddImportantDateModal from '../../components/important-dates/AddImportantDateModal';

const FILTER_TYPES = [
  { id: 'all', label: 'Tümü' },
  { id: 'dating', label: 'Tanışma' },
  { id: 'relationship', label: 'İlişki' },
  { id: 'marriage', label: 'Evlilik' },
  { id: 'birthday', label: 'Doğum Günü' },
  { id: 'travel', label: 'Seyahat' },
];

export default function ImportantDatesScreen() {
  const { user } = useAuth();
  const { show: showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<ImportantDate | null>(null);
  const [activeType, setActiveType] = useState('all');

  const fetchDates = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await importantDatesApi.getImportantDates(user?.accessToken);
      setDates(data);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Tarihler yüklenirken bir sorun oluştu.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDates(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Tarihi Sil',
      'Bu özel tarihi listenizden kalıcı olarak kaldırmak istediğinizden emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await importantDatesApi.delete(id, user?.accessToken);
              setDates(dates.filter(d => d._id !== id));
              showToast({ type: 'success', title: 'Başarılı', message: 'Tarih silindi.' });
            } catch (err) {
              showToast({ type: 'error', title: 'Hata', message: 'Tarih silinemedi.' });
            }
          },
        },
      ]
    );
  };

  const { filteredDates, upcomingDates } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const processed = dates.map(d => {
      const nextOccur = new Date(d.date);
      nextOccur.setHours(0, 0, 0, 0);

      if (d.isRecurring) {
        nextOccur.setFullYear(now.getFullYear());
        if (nextOccur < now) {
          nextOccur.setFullYear(now.getFullYear() + 1);
        }
      }

      const isToday = nextOccur.getTime() === now.getTime();
      const daysDiff = Math.round((nextOccur.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return { ...d, nextOccur, isToday, daysDiff };
    });

    let filtered = processed;
    if (activeType !== 'all') {
      filtered = processed.filter(d => d.type === activeType);
    }

    const sortedFiltered = filtered.sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      if (a.daysDiff >= 0 && b.daysDiff < 0) return -1;
      if (a.daysDiff < 0 && b.daysDiff >= 0) return 1;
      if (a.daysDiff >= 0 && b.daysDiff >= 0) return a.daysDiff - b.daysDiff;
      return b.daysDiff - a.daysDiff;
    });

    const upcoming = processed
      .filter(d => d.daysDiff >= 0)
      .sort((a, b) => a.daysDiff - b.daysDiff)
      .slice(0, 3);

    return { filteredDates: sortedFiltered, upcomingDates: upcoming };
  }, [dates, activeType]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F43F5E']} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.mainTitle}>Önemli Tarihlerimiz 📅</Text>
              <Text style={styles.subtitle}>Asla unutmak istemediğiniz anları kaydedin</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setEditData(null);
                setIsModalOpen(true);
              }}
              style={styles.addBtn}
            >
              <LinearGradient
                colors={['#F43F5E', '#EC4899']}
                style={styles.addGradient}
              >
                <Plus size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Upcoming Section */}
          <View style={styles.upcomingSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Yaklaşanlar</Text>
              <View style={styles.clockIconBox}>
                <Clock size={16} color="#F43F5E" />
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.upcomingList}>
              {upcomingDates.length > 0 ? (
                upcomingDates.map((date, index) => {
                  const daysLeft = date.daysDiff;
                  return (
                    <View
                      key={date._id}
                      style={[styles.upcomingCard, index === 0 && styles.upcomingCardFirst]}
                    >
                      <View style={styles.upcomingTop}>
                        <View style={styles.upcomingEmojiBox}>
                          <Text style={styles.upcomingEmoji}>
                            {date.type === 'birthday' ? '🎂' : date.type === 'marriage' ? '💒' : '💍'}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.upcomingTitle} numberOfLines={1}>{date.title}</Text>
                          <Text style={styles.upcomingDate}>
                            {format(date.nextOccur, 'd MMMM', { locale: tr })}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.daysLeftBadge, index === 0 && styles.daysLeftBadgeFirst]}>
                        <Text style={[styles.daysLeftText, index === 0 && styles.daysLeftTextFirst]}>
                          {daysLeft === 0 ? 'Bugün!' : `${daysLeft} gün sonra`}
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.noUpcoming}>
                  <Text style={styles.noUpcomingText}>Yakın zamanda bir tarih yok.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
          {FILTER_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              onPress={() => setActiveType(type.id)}
              style={[styles.filterBtn, activeType === type.id && styles.filterBtnActive]}
            >
              <Text style={[styles.filterBtnText, activeType === type.id && styles.filterBtnTextActive]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Timeline */}
        <View style={styles.timelineContent}>
          <View style={styles.timelineLine} />
          
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F43F5E" />
            </View>
          ) : filteredDates.length > 0 ? (
            filteredDates.map((date) => (
              <ImportantDateCard
                key={date._id}
                date={date}
                currentUser={user}
                onEdit={(d) => {
                  setEditData(d);
                  setIsModalOpen(true);
                }}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <CalendarIcon size={40} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyTitle}>Henüz bir tarih eklenmemiş</Text>
              <Text style={styles.emptySubtitle}>Özel anlarınızı kaydederek burada ölümsüzleştirebilirsiniz.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <AddImportantDateModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDates}
        editData={editData}
      />
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
    padding: 20,
    paddingTop: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 28,
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  addBtn: {
    borderRadius: 18,
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
  upcomingSection: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#111827',
  },
  clockIconBox: {
    width: 36,
    height: 36,
    backgroundColor: '#FFF1F2',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingList: {
    gap: 12,
  },
  upcomingCard: {
    width: 200,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  upcomingCardFirst: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FFE4E6',
    borderWidth: 2,
  },
  upcomingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  upcomingEmojiBox: {
    width: 44,
    height: 44,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  upcomingEmoji: {
    fontSize: 20,
  },
  upcomingTitle: {
    fontSize: 14,
    color: '#111827',
    width: 100,
  },
  upcomingDate: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  daysLeftBadge: {
    backgroundColor: 'white',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  daysLeftBadgeFirst: {
    backgroundColor: 'white',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  daysLeftText: {
    fontSize: 12,
    color: '#6B7280',
  },
  daysLeftTextFirst: {
    color: '#F43F5E',
  },
  noUpcoming: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  noUpcomingText: {
    color: '#9CA3AF',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 10,
  },
  filterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  filterBtnActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  filterBtnText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  filterBtnTextActive: {
    color: 'white',
  },
  timelineContent: {
    paddingHorizontal: 5,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 25,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#E5E7EB',
    borderRadius: 1,
  },
  loadingContainer: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    paddingLeft: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
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
    paddingHorizontal: 40,
  },
});
