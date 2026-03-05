import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { Text } from '../../components/ui/Text';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Flame,
  Check,
  TrendingUp,
  MessageSquare,
  ArrowRight,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { saveMood, getMonthlyMoods, getMoodNotes, Mood, MonthlyMoodStats } from '../../api/mood';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { TextInput } from '../../components/ui/TextInput';

const { width } = Dimensions.get('window');

const MOOD_TYPES = [
  { emoji: '😍', label: 'Harika' },
  { emoji: '😊', label: 'İyi' },
  { emoji: '🥰', label: 'Aşık' },
  { emoji: '🤩', label: 'Heyecanlı' },
  { emoji: '🎉', label: 'Mutlu' },
  { emoji: '😐', label: 'Eh İşte' },
  { emoji: '😴', label: 'Yorgun' },
  { emoji: '😔', label: 'Üzgün' },
  { emoji: '😤', label: 'Kızgın' },
];

const MOOD_COLORS: Record<string, string[]> = {
  '😍': ['#DCFCE7', '#10B981'], // green
  '😊': ['#DCFCE7', '#10B981'], // green
  '🥰': ['#FCE7F3', '#EC4899'], // pink
  '🤩': ['#FEF3C7', '#F59E0B'], // yellow/gold
  '🎉': ['#F3E8FF', '#A855F7'], // purple
  '😐': ['#FEF3C7', '#F59E0B'], // yellow
  '😴': ['#E0F2FE', '#06B6D4'], // blue
  '😔': ['#F1F5F9', '#64748B'], // gray
  '😤': ['#FEE2E2', '#EF4444'], // red
};

export default function MoodCalendarScreen() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [stats, setStats] = useState<MonthlyMoodStats | null>(null);
  const [pagedNotes, setPagedNotes] = useState<Mood[]>([]);
  const [notesPage, setNotesPage] = useState(1);
  const [hasMoreNotes, setHasMoreNotes] = useState(false);
  const [viewMode, setViewMode] = useState<'mine' | 'partner' | 'both'>('mine');
  const [loading, setLoading] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMoods();
    fetchInitialNotes();
  }, [currentDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchMoods(), fetchInitialNotes()]);
    setRefreshing(false);
  };

  const fetchMoods = async () => {
    if (!user?.accessToken) return;
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await getMonthlyMoods(year, month, user.accessToken);
      setStats(data);
    } catch (error) {
      console.error('Error fetching moods:', error);
    }
  };

  const fetchInitialNotes = async () => {
    if (!user?.accessToken) return;
    try {
      setNotesPage(1);
      const data = await getMoodNotes(1, 10, user.accessToken);
      setPagedNotes(data.notes);
      setHasMoreNotes(data.hasMore);
    } catch (error) {
      console.error('Error fetching initial notes:', error);
    }
  };

  const loadMoreNotes = async () => {
    if (!user?.accessToken || loadingNotes || !hasMoreNotes) return;
    
    setLoadingNotes(true);
    try {
      const nextPage = notesPage + 1;
      const data = await getMoodNotes(nextPage, 10, user.accessToken);
      setPagedNotes(prev => [...prev, ...data.notes]);
      setNotesPage(nextPage);
      setHasMoreNotes(data.hasMore);
    } catch (error) {
      console.error('Error loading more notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSaveMood = async () => {
    if (!selectedEmoji) {
      Alert.alert('Hata', 'Lütfen bir emoji seçin');
      return;
    }

    if (!user?.accessToken) {
      Alert.alert('Hata', 'Oturum bilgisi bulunamadı');
      return;
    }

    setLoading(true);
    try {
      await saveMood({
        emoji: selectedEmoji,
        note,
        date: format(new Date(), 'yyyy-MM-dd'),
      }, user.accessToken);
      setSelectedEmoji(null);
      setNote('');
      fetchMoods();
      Alert.alert('Başarılı', 'Ruh haliniz kaydedildi! 💕');
    } catch (error) {
      Alert.alert('Hata', (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    // Add empty slots for the first week
    const firstDayOfWeek = getDay(start);
    const prefix = Array(firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1).fill(null);
    
    return [...prefix, ...days];
  }, [currentDate]);

  const getMoodForDay = (day: Date) => {
    if (!stats) return null;
    
    if (viewMode === 'mine') {
      return stats.moods.find(m => m.userId === user?._id && isSameDay(new Date(m.date), day));
    } else if (viewMode === 'partner') {
      return stats.moods.find(m => m.userId !== user?._id && isSameDay(new Date(m.date), day));
    } else {
      // For 'both', we might show a combined indicator or prioritizing one
      return stats.moods.find(m => isSameDay(new Date(m.date), day));
    }
  };

  const happyMoods = ['😍', '😊', '🥰', '🤩', '🎉'];
  const happyDaysCount = useMemo(() => {
    if (!stats?.emojiCounts) return 0;
    return Object.entries(stats.emojiCounts)
      .filter(([emoji]) => happyMoods.includes(emoji))
      .reduce((sum, [_, count]) => sum + count, 0);
  }, [stats]);

  const happyPercent = useMemo(() => {
    if (!stats?.totalMoods || stats.totalMoods === 0) return 0;
    return Math.round((happyDaysCount / stats.totalMoods) * 100);
  }, [stats, happyDaysCount]);

  return (
    <ScrollView 
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E91E63']} tintColor="#E91E63" />
      } 
      style={styles.container} 
      contentContainerStyle={styles.content}
    >
      {/* Header Section */}
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <Text style={styles.title}>Birlikte Nasıl Hissediyoruz 🌈</Text>
        <Text style={styles.subtitle}>Ruh hallerinizi takip edin</Text>
      </Animated.View>

      {/* View Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'mine' && styles.toggleButtonActive]}
          onPress={() => setViewMode('mine')}
        >
          <Text style={[styles.toggleText, viewMode === 'mine' && styles.toggleTextActive]}>Ben</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'partner' && styles.toggleButtonActive]}
          onPress={() => setViewMode('partner')}
        >
          <Text style={[styles.toggleText, viewMode === 'partner' && styles.toggleTextActive]}>O</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'both' && styles.toggleButtonActive]}
          onPress={() => setViewMode('both')}
        >
          <Text style={[styles.toggleText, viewMode === 'both' && styles.toggleTextActive]}>Biz</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Section */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text style={styles.monthName}>{format(currentDate, 'MMMM yyyy', { locale: tr })}</Text>
          <TouchableOpacity onPress={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight size={24} color="#4B5563" />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDays}>
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
            <Text key={d} style={styles.weekDayText}>{d}</Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {calendarDays.map((day, index) => {
            if (!day) return <View key={`empty-${index}`} style={styles.dayCellEmpty} />;
            
            const mood = getMoodForDay(day);
            const isTodayDay = isToday(day);
            
            return (
              <TouchableOpacity 
                key={day.toISOString()} 
                style={[
                  styles.dayCell, 
                  mood && { backgroundColor: MOOD_COLORS[mood.emoji]?.[0] || '#F3F4F6' },
                  isTodayDay && styles.todayCell
                ]}
              >
                <Text style={styles.dayNumber}>{format(day, 'd')}</Text>
                {mood && <Text style={styles.dayEmoji}>{mood.emoji}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#DCFCE7' }]} />
            <Text style={styles.legendText}>İyi</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FEF3C7' }]} />
            <Text style={styles.legendText}>Normal</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F1F5F9' }]} />
            <Text style={styles.legendText}>Üzgün</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FCE7F3' }]} />
            <Text style={styles.legendText}>Aşık</Text>
          </View>
        </View>
      </Animated.View>

      {/* Mood Input Section */}
      <Animated.View entering={FadeInDown.delay(400)} style={styles.inputCard}>
        <Text style={styles.inputTitle}>Bugün Nasılsın?</Text>
        
        <View style={styles.emojiGrid}>
          {MOOD_TYPES.map(({ emoji, label }) => (
            <TouchableOpacity
              key={emoji}
              style={[styles.emojiButton, selectedEmoji === emoji && styles.emojiButtonActive]}
              onPress={() => setSelectedEmoji(emoji)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
              <Text style={[styles.emojiLabel, selectedEmoji === emoji && styles.emojiLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.noteContainer}>
          <Text style={styles.noteLabel}>Not Ekle (İsteğe Bağlı)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Bugün neler yaşadınız?"
            multiline
            numberOfLines={3}
            value={note}
            onChangeText={setNote}
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveMood}
          disabled={loading}
        >
          <LinearGradient
            colors={['#E91E63', '#FF6B6B']}
            style={styles.saveGradient}
          >
            <Check size={20} color="white" />
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Stats Section */}
      <View style={styles.sectionHeader}>
        <Trophy size={20} color="#F59E0B" />
        <Text style={styles.sectionTitle}>İstatistikler</Text>
      </View>
      
      <Animated.View entering={FadeInRight} style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>Bu Ay</Text>
          <TrendingUp size={20} color="#E91E63" />
        </View>
        <View style={styles.statsMain}>
          <Text style={styles.statsPercent}>{happyPercent}%</Text>
          <Text style={styles.statsSub}>Mutlu Günler 🎉</Text>
        </View>
        
        {stats?.emojiCounts && Object.entries(stats.emojiCounts).map(([emoji, count]) => (
          <View key={emoji} style={styles.statRow}>
            <View style={styles.statInfo}>
              <Text style={styles.statEmoji}>{emoji}</Text>
              <Text style={styles.statName}>
                {MOOD_TYPES.find(m => m.emoji === emoji)?.label || 'Diğer'}
              </Text>
            </View>
            <Text style={styles.statCount}>{count} gün</Text>
          </View>
        ))}
      </Animated.View>

      {/* Daily Notes */}
      <View style={styles.sectionHeader}>
        <MessageSquare size={20} color="#E91E63" />
        <Text style={styles.sectionTitle}>Günlük Notlar</Text>
      </View>

      {pagedNotes.map((mood, idx) => (
        <Animated.View key={mood._id} entering={FadeInDown.delay(100 * idx)} style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <View style={styles.noteUser}>
              <View style={styles.noteAvatarPlaceholder}>
                <Text style={styles.avatarText}>{mood.userId === user?._id ? 'S' : 'P'}</Text>
              </View>
              <Text style={styles.noteUserName}>{mood.userId === user?._id ? 'Sen' : 'Partnerin'}</Text>
            </View>
            <View style={styles.noteMeta}>
              <Text style={styles.noteEmoji}>{mood.emoji}</Text>
              <Text style={styles.noteDate}>{format(new Date(mood.date), 'd MMM', { locale: tr })}</Text>
            </View>
          </View>
          <Text style={styles.noteContent}>{mood.note}</Text>
        </Animated.View>
      ))}

      {hasMoreNotes && (
        <TouchableOpacity 
          style={styles.viewAllButton} 
          onPress={loadMoreNotes}
          disabled={loadingNotes}
        >
          <Text style={styles.viewAllText}>
            {loadingNotes ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
          </Text>
          {!loadingNotes && <ArrowRight size={16} color="#E91E63" />}
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  toggleButtonActive: {
    backgroundColor: '#FFF1F2',
  },
  toggleText: {
    fontSize: 14,
    color: '#4B5563',
  },
  toggleTextActive: {
    color: '#E91E63',
  },
  calendarCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthName: {
    fontSize: 18,
    color: '#111827',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: (width - 64) / 7,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 4,
  },
  dayCellEmpty: {
    width: (width - 64) / 7,
    aspectRatio: 1,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#E91E63',
  },
  dayNumber: {
    fontSize: 10,
    color: '#6B7280',
    position: 'absolute',
    top: 4,
    left: 4,
  },
  dayEmoji: {
    fontSize: 20,
  },
  legend: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#6B7280',
  },
  inputCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#FCE7F3',
  },
  inputTitle: {
    fontSize: 20,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  emojiButton: {
    width: (width - 80) / 4,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  emojiButtonActive: {
    borderWidth: 2,
    borderColor: '#E91E63',
    backgroundColor: '#FFF1F2',
  },
  emojiText: {
    fontSize: 24,
    marginBottom: 4,
  },
  emojiLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  emojiLabelActive: {
    color: '#E91E63',
  },
  noteContainer: {
    marginBottom: 20,
  },
  noteLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  saveButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#111827',
    marginLeft: 8,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    color: '#111827',
  },
  statsMain: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statsPercent: {
    fontSize: 40,
    color: '#E91E63',
  },
  statsSub: {
    fontSize: 14,
    color: '#6B7280',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  statName: {
    fontSize: 14,
    color: '#374151',
  },
  statCount: {
    fontSize: 14,
    color: '#111827',
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  noteUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 12,
    color: '#E91E63',
  },
  noteUserName: {
    fontSize: 14,
    color: '#111827',
  },
  noteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  noteContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  viewAllText: {
    fontSize: 14,
    color: '#E91E63',
    marginRight: 4,
  },
});
