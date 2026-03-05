import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from '../ui/Text';
import { Pin } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NOTE_WIDTH = (SCREEN_WIDTH - 60) / 2;

export const NOTE_COLORS: Record<string, { bg: string; border: string; text: string; corner: string; pin: string }> = {
  yellow: { bg: '#FEF9C3', border: '#FEF08A', text: '#854D0E', corner: '#F59E0B', pin: '#EF4444' },
  pink: { bg: '#FCE7F3', border: '#FBCFE8', text: '#9D174D', corner: '#EC4899', pin: '#3B82F6' },
  blue: { bg: '#DBEAFE', border: '#BFDBFE', text: '#1E40AF', corner: '#3B82F6', pin: '#10B981' },
  green: { bg: '#DCFCE7', border: '#BBF7D0', text: '#166534', corner: '#10B981', pin: '#A855F7' },
  purple: { bg: '#F3E8FF', border: '#E9D5FF', text: '#6B21A8', corner: '#A855F7', pin: '#F59E0B' },
  orange: { bg: '#FFEDD5', border: '#FED7AA', text: '#9A3412', corner: '#F97316', pin: '#6366F1' },
};

interface NoteCardProps {
  note: any;
  index: number;
  onPress: (note: any) => void;
  onEdit: (note: any) => void;
  onDelete: (id: string) => void;
  currentUserId?: string;
}

export default function NoteCard({ note, index, onPress, onEdit, onDelete, currentUserId }: NoteCardProps) {
  const colorCfg = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;
  const rotation = ((index * 7) % 10) - 5;
  const isNew = !note.isRead && note.authorId._id !== currentUserId;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(note)}
      style={[
        styles.container,
        {
          backgroundColor: colorCfg.bg,
          transform: [{ rotate: `${rotation}deg` }],
        }
      ]}
    >
      {/* Corner Fold */}
      <View style={[styles.corner, { borderRightColor: colorCfg.corner }]} />

      {/* Pin */}
      <View style={styles.pinWrapper}>
        <Pin size={24} color={colorCfg.pin} fill={colorCfg.pin} style={{ transform: [{ rotate: '45deg' }] }} />
      </View>

      {/* New Badge */}
      {isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>YENİ</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.noteText, { color: colorCfg.text }]} numberOfLines={6}>
          {note.content}
        </Text>
      </View>

      <View style={[styles.footer, { borderTopColor: colorCfg.border }]}>
        <View style={styles.authorRow}>
          <View style={[
            styles.avatar,
            { backgroundColor: note.authorId.gender === 'female' ? '#FBCFE8' : '#BFDBFE' }
          ]}>
            <Text style={[
              styles.avatarText,
              { color: note.authorId.gender === 'female' ? '#9D174D' : '#1E40AF' }
            ]}>
              {note.authorId.firstName[0]}
            </Text>
          </View>
          <Text style={styles.authorName}>{note.authorId.firstName}</Text>
        </View>
        <Text style={styles.timeText}>
          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: tr })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: NOTE_WIDTH,
    aspectRatio: 1,
    padding: 15,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    margin: 10,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 0,
    borderBottomWidth: 30,
    borderRightWidth: 30,
    borderBottomColor: 'transparent',
    opacity: 0.8,
  },
  pinWrapper: {
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -12,
    zIndex: 10,
  },
  newBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F43F5E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 20,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  noteText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingTop: 8,
    borderTopWidth: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 10,
  },
  authorName: {
    fontSize: 10,
    color: '#4B5563',
  },
  timeText: {
    fontSize: 8,
    color: '#6B7280',
  },
});
