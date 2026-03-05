import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text } from '../ui/Text';
import { Clock, Star, Edit2, Trash2, RefreshCw } from 'lucide-react-native';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ImportantDateCardProps {
  date: any;
  currentUser: any;
  onEdit: (date: any) => void;
  onDelete: (id: string) => void;
}

const TYPE_CONFIGS: Record<string, { icon: string; bg: string; color: string; label: string }> = {
  dating: { icon: '💕', bg: '#FFE4E6', color: '#E11D48', label: 'Tanışma' },
  first_kiss: { icon: '💋', bg: '#FCE7F3', color: '#DB2777', label: 'İlk Öpücük' },
  relationship: { icon: '💑', bg: '#E0E7FF', color: '#4F46E5', label: 'İlişki' },
  engagement: { icon: '💍', bg: '#FFE4E6', color: '#E11D48', label: 'Nişan' },
  marriage: { icon: '💒', bg: '#F3E8FF', color: '#9333EA', label: 'Evlilik' },
  birthday: { icon: '🎂', bg: '#FEF3C7', color: '#D97706', label: 'Doğum Günü' },
  travel: { icon: '✈️', bg: '#DBEAFE', color: '#2563EB', label: 'Seyahat' },
  moving: { icon: '🏠', bg: '#D1FAE5', color: '#059669', label: 'Taşınma' },
  special: { icon: '📅', bg: '#F3F4F6', color: '#4B5563', label: 'Özel' },
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

export default function ImportantDateCard({ date, currentUser, onEdit, onDelete }: ImportantDateCardProps) {
  const config = TYPE_CONFIGS[date.type] || TYPE_CONFIGS.special;
  const isAuthor = date.authorId?._id === currentUser?._id;

  const { isTodayDate, displayDate, isPast } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const nextOccur = new Date(date.date);
    nextOccur.setHours(0, 0, 0, 0);

    if (date.isRecurring) {
      nextOccur.setFullYear(now.getFullYear());
      if (nextOccur < now) {
        nextOccur.setFullYear(now.getFullYear() + 1);
      }
    }

    const isTodayDate = nextOccur.getTime() === now.getTime();
    const isPast = !isTodayDate && nextOccur < now;

    return { isTodayDate, displayDate: nextOccur, isPast };
  }, [date]);

  return (
    <View style={[styles.container, isPast && styles.pastContainer]}>
      {/* Timeline Dot */}
      <View style={styles.timelineBox}>
        <View style={[
          styles.timelineDot,
          isTodayDate ? styles.todayDot : isPast ? styles.pastDot : styles.upcomingDot
        ]} />
      </View>

      <View style={[styles.card, isTodayDate && styles.todayCard]}>
        {isTodayDate && (
          <View style={styles.todayBadge}>
            <Star size={10} color="white" fill="white" />
            <Text style={styles.todayBadgeText}>BUGÜN</Text>
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.titleInfo}>
            <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
              <Text style={styles.iconText}>{config.icon}</Text>
            </View>
            <View style={styles.titleTextContainer}>
              <Text style={[styles.title, isTodayDate && styles.todayTitle]}>{date.title}</Text>
              <Text style={styles.dateText}>
                {format(displayDate, 'd MMMM yyyy', { locale: tr })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.badgeRow}>
          {isTodayDate && (
            <View style={styles.celebrationBadge}>
              <Star size={12} color="white" fill="white" />
              <Text style={styles.celebrationText}>Kutlama Günü</Text>
            </View>
          )}
          {date.isRecurring && (
            <View style={styles.recurringBadge}>
              <RefreshCw size={12} color="#9333EA" />
              <Text style={styles.recurringText}>Her Yıl</Text>
            </View>
          )}
          <View style={[styles.statusBadge, isTodayDate ? styles.statusNow : isPast ? styles.statusPast : styles.statusUpcoming]}>
            <Clock size={12} color={isTodayDate ? '#E11D48' : isPast ? '#6B7280' : '#E11D48'} />
            <Text style={[styles.statusText, isTodayDate ? styles.textNow : isPast ? styles.textPast : styles.textUpcoming]}>
              {isTodayDate ? 'Şimdi' : isPast ? 'Geçmiş' : 'Gelecek'}
            </Text>
          </View>
        </View>

        {date.description && (
          <Text style={styles.description}>{date.description}</Text>
        )}

        {date.photo?.url && (
          <Image source={{ uri: date.photo.url }} style={styles.photo} />
        )}

        <View style={styles.footer}>
          <View style={styles.authorInfo}>
            <View style={styles.avatarWrapper}>
              <Image source={getUserAvatar(date.authorId)} style={styles.avatar} />
            </View>
            <Text style={styles.authorName}>
              {date.authorId?.firstName} tarafından eklendi
            </Text>
          </View>

          {isAuthor && (
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => onEdit(date)} style={styles.actionBtn}>
                <Edit2 size={16} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(date._id)} style={styles.actionBtn}>
                <Trash2 size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingLeft: 1,
    paddingBottom: 25,
  },
  pastContainer: {
    opacity: 0.8,
  },
  timelineBox: {
    width: 40,
    alignItems: 'center',
    paddingTop: 25,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'white',
    zIndex: 10,
  },
  upcomingDot: {
    backgroundColor: '#F43F5E',
  },
  todayDot: {
    backgroundColor: '#F43F5E',
    transform: [{ scale: 1.2 }],
  },
  pastDot: {
    backgroundColor: '#9CA3AF',
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  todayCard: {
    borderColor: '#FECDD3',
    borderWidth: 2,
  },
  todayBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#F43F5E',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  todayBadgeText: {
    color: 'white',
    fontSize: 10,
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  titleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    color: '#111827',
  },
  todayTitle: {
    color: '#E11D48',
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  celebrationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F43F5E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  celebrationText: {
    color: 'white',
    fontSize: 11,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  recurringText: {
    color: '#9333EA',
    fontSize: 11,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusNow: { backgroundColor: '#FFE4E6' },
  statusPast: { backgroundColor: '#F3F4F6' },
  statusUpcoming: { backgroundColor: '#FFE4E6' },
  statusText: { fontSize: 11 },
  textNow: { color: '#E11D48' },
  textPast: { color: '#6B7280' },
  textUpcoming: { color: '#E11D48' },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 15,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'white',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  authorName: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
