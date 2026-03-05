import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Text } from '../ui/Text';
import { Feather, Check, Trash2, Calendar, Map, Utensils, Film, Home, Heart } from 'lucide-react-native';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';

interface DreamCardProps {
  item: any;
  onPress: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
  isOwner: boolean;
}

const CATEGORY_CONFIG: Record<string, { icon: any, color: string, bgColor: string, label: string, textColor: string }> = {
  travel: { icon: Map, color: '#3B82F6', bgColor: '#DBEAFE', label: 'Seyahat', textColor: '#1E40AF' },
  food: { icon: Utensils, color: '#F59E0B', bgColor: '#FEF3C7', label: 'Yemek', textColor: '#92400E' },
  experience: { icon: Film, color: '#8B5CF6', bgColor: '#EDE9FE', label: 'Deneyim', textColor: '#5B21B6' },
  home: { icon: Home, color: '#10B981', bgColor: '#D1FAE5', label: 'Ev', textColor: '#065F46' },
  relationship: { icon: Heart, color: '#F43F5E', bgColor: '#FFE4E6', label: 'İlişki', textColor: '#9F1239' },
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

export default function DreamCard({ item, onPress, onToggleComplete, onDelete, isOwner }: DreamCardProps) {
  const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG['experience'];
  const CategoryIcon = config.icon;

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[
          styles.card,
          item.isCompleted && styles.completedCard
        ]}
      >
        <LinearGradient
          colors={item.isCompleted ? ['#ECFDF5', '#D1FAE5'] : ['#FFFFFF', '#FFFFFF']}
          style={styles.cardGradient}
        >
          <View style={styles.contentRow}>
            <TouchableOpacity 
              onPress={onToggleComplete}
              style={[
                styles.checkButton,
                item.isCompleted ? styles.checkButtonCompleted : styles.checkButtonPending
              ]}
              testID="toggle-complete-btn"
            >
              <Check size={24} color={item.isCompleted ? '#10B981' : '#F59E0B'} testID={item.isCompleted ? "icon-check" : "icon-circle"} />
            </TouchableOpacity>

            <View style={styles.mainContent}>
              <View style={styles.header}>
                <View style={styles.titleContainer}>
                  <Text style={[styles.title, item.isCompleted && styles.completedText]}>
                    {item.title}
                  </Text>
                  
                  <View style={styles.badgeRow}>
                    <View style={[styles.categoryBadge, { backgroundColor: config.bgColor }]}>
                      <CategoryIcon size={12} color={config.color} />
                      <Text style={[styles.categoryText, { color: config.textColor }]}>
                        {config.label}
                      </Text>
                    </View>

                    {item.targetDate && (
                      <View style={styles.infoBadge}>
                        <Calendar size={12} color="#9CA3AF" />
                        <Text style={styles.infoBadgeText}>
                          Hedef: {format(new Date(item.targetDate), 'MMMM yyyy', { locale: tr })}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {isOwner && (
                  <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
                    <Trash2 size={20} color="#D1D5DB" />
                  </TouchableOpacity>
                )}
              </View>

              {item.isCompleted && item.completedAt && (
                <View style={styles.completedAtRow}>
                  <Check size={14} color="#10B981" />
                  <Text style={styles.completedAtText}>
                    {format(new Date(item.completedAt), 'd MMMM yyyy', { locale: tr })}'de tamamlandı
                  </Text>
                </View>
              )}
              
              {item.description ? (
                <Text style={[styles.description, item.isCompleted && styles.completedDescText]} numberOfLines={3}>
                  "{item.description}"
                </Text>
              ) : null}

              <View style={styles.footer}>
                <View style={styles.authorInfo}>
                  <View style={styles.avatarWrapper}>
                    <Image source={getUserAvatar(item.authorId)} style={styles.avatar} />
                  </View>
                  <Text style={styles.authorName}>
                    {item.authorId.firstName} tarafından eklendi
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  completedCard: {
    borderColor: '#D1FAE5',
  },
  cardGradient: {
    padding: 20,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 15,
  },
  checkButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkButtonPending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  checkButtonCompleted: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
    transform: [{ scale: 1.1 }],
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    color: '#111827',
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  infoBadgeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  completedAtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  completedAtText: {
    fontSize: 13,
    color: '#059669',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 15,
  },
  completedDescText: {
    color: '#9CA3AF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: '#F3F4F6',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  authorName: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  deleteBtn: {
    padding: 8,
  },
});
