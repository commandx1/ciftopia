import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text } from '../ui/Text';
import { X, Pin, Pen, Trash2 } from 'lucide-react-native';
import { NOTE_COLORS } from './NoteCard';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface NoteDetailModalProps {
  note: any;
  visible: boolean;
  onClose: () => void;
  onEdit: (note: any) => void;
  onDelete: (id: string) => void;
  currentUserId?: string;
}

export default function NoteDetailModal({ note, visible, onClose, onEdit, onDelete, currentUserId }: NoteDetailModalProps) {
  if (!note) return null;

  const colorCfg = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;
  const isOwner = note.authorId._id === currentUserId;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.container, { backgroundColor: colorCfg.bg }]}>
          {/* Corner Fold */}
          <View style={[styles.corner, { borderRightColor: colorCfg.corner }]} />

          {/* Pin */}
          <View style={styles.pinWrapper}>
            <Pin size={48} color={colorCfg.pin} fill={colorCfg.pin} style={{ transform: [{ rotate: '45deg' }] }} />
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={24} color="#4B5563" />
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={[styles.noteText, { color: colorCfg.text }]}>
              {note.content}
            </Text>
          </View>

          <View style={[styles.footer, { borderTopColor: colorCfg.border }]}>
            <View style={styles.authorSection}>
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
              <View>
                <Text style={styles.authorName}>{note.authorId.firstName}</Text>
                <Text style={styles.timeText}>
                  {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: tr })}
                </Text>
              </View>
            </View>

            {isOwner && (
              <View style={styles.actions}>
                <TouchableOpacity 
                  onPress={() => {
                    onEdit(note);
                    onClose();
                  }} 
                  style={styles.actionBtn}
                >
                  <Pen size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    onDelete(note._id);
                    onClose();
                  }} 
                  style={styles.actionBtn}
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 30,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    borderRadius: 8,
    padding: 30,
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
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
    borderBottomWidth: 50,
    borderRightWidth: 50,
    borderBottomColor: 'transparent',
    opacity: 0.8,
  },
  pinWrapper: {
    position: 'absolute',
    top: -24,
    left: '50%',
    marginLeft: -24,
    zIndex: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    zIndex: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  noteText: {
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 36,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 18,
  },
  authorName: {
    fontSize: 16,
    color: '#111827',
  },
  timeText: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
