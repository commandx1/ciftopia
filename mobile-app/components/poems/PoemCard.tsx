import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Text } from '../ui/Text';
import { Feather, Heart, Trash2, Pen, ChevronRight } from 'lucide-react-native';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const { width } = Dimensions.get('window');

interface PoemCardProps {
  poem: any;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isOwner: boolean;
  index: number;
}

export default function PoemCard({ poem, onPress, onEdit, onDelete, isOwner, index }: PoemCardProps) {
  const bgs = [
    { from: '#FFFBEB', to: '#FEF3C7', border: '#FEF3C7', accent: '#F59E0B' }, // amber
    { from: '#FFF1F2', to: '#FFE4E6', border: '#FFE4E6', accent: '#F43F5E' }, // rose
    { from: '#F5F3FF', to: '#EDE9FE', border: '#EDE9FE', accent: '#8B5CF6' }, // purple
    { from: '#EFF6FF', to: '#DBEAFE', border: '#DBEAFE', accent: '#3B82F6' }, // blue
    { from: '#ECFDF5', to: '#D1FAE5', border: '#D1FAE5', accent: '#10B981' }, // emerald
  ];

  const style = bgs[index % bgs.length];

  const getUserAvatar = (u: any) => {
    if (u?.avatar?.url) return { uri: u.avatar.url };
    return u?.gender === 'female'
      ? require('../../assets/woman-pp.png')
      : require('../../assets/man-pp.png');
  };

  return (
    <TouchableOpacity
      testID="poem-card"
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { backgroundColor: style.from, borderColor: style.border }]}
    >
      <View style={styles.header}>
        <View style={styles.tagsRow}>
          {poem.tags?.map((tag: string) => (
            <View key={tag} style={[styles.tagBadge, { backgroundColor: style.accent + '20' }]}>
              <Text style={[styles.tagText, { color: style.accent }]}>#{tag}</Text>
            </View>
          ))}
        </View>
        <Feather size={20} color={style.accent} opacity={0.5} />
      </View>

      <Text style={styles.title} numberOfLines={1}>{poem.title}</Text>
      <Text style={styles.content} numberOfLines={4}>"{poem.content}"</Text>

      <View style={[styles.footer, { borderTopColor: style.accent + '20' }]}>
        <View style={styles.authorInfo}>
          <View style={[styles.avatarBox, { borderColor: style.accent + '40' }]}>
            <Image source={getUserAvatar(poem.authorId)} style={styles.avatar} />
          </View>
          <View>
            <Text style={styles.authorName}>{poem.authorId.firstName}</Text>
            <Text style={styles.date}>
              {format(new Date(poem.createdAt), 'd MMMM yyyy', { locale: tr })}
            </Text>
          </View>
        </View>

        {isOwner && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} style={styles.actionBtn} testID="edit-poem-btn">
              <Pen size={16} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.actionBtn} testID="delete-poem-btn">
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[styles.readMore, { backgroundColor: style.accent }]}>
        <Text style={styles.readMoreText}>Tamamını Oku</Text>
        <ChevronRight size={14} color="white" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 25,
    padding: 20,
    borderWidth: 2,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    color: '#111827',
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  authorName: {
    fontSize: 13,
    color: '#111827',
  },
  date: {
    fontSize: 10,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readMore: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 15,
    gap: 5,
  },
  readMoreText: {
    color: '#fff',
    fontSize: 13,
  },
});
