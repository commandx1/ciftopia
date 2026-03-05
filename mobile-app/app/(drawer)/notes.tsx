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
import { notesApi, Note } from '../../api/notes';
import { useToast } from '../../components/ui/ToastProvider';
import { StickyNote, Plus, StickyNote as NoteIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NoteCard from '../../components/notes/NoteCard';
import NewNoteModal from '../../components/notes/NewNoteModal';
import NoteDetailModal from '../../components/notes/NoteDetailModal';

export default function NotesScreen() {
  const { user } = useAuth();
  const { show: showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const fetchNotes = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await notesApi.getNotes(user?.accessToken);
      setNotes(data);
    } catch (error) {
      console.error(error);
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Notlar yüklenirken bir sorun oluştu.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotes(true);
  };

  const handleMarkAsRead = async (note: Note) => {
    if (note.isRead || note.authorId._id === user?._id) return;
    try {
      await notesApi.markAsRead(note._id, user?.accessToken);
      setNotes(prev => prev.map(n => n._id === note._id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Notu Sil',
      'Bu notu panodan kalıcı olarak kaldırmak istediğinizden emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await notesApi.delete(id, user?.accessToken);
              setNotes(notes.filter(n => n._id !== id));
              showToast({ type: 'success', title: 'Başarılı', message: 'Not silindi.' });
            } catch (err) {
              showToast({ type: 'error', title: 'Hata', message: 'Not silinemedi.' });
            }
          },
        },
      ]
    );
  };

  const unreadCount = notes.filter(n => !n.isRead && n.authorId._id !== user?._id).length;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F43F5E']} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <StickyNote size={32} color="white" />
              </View>
              <View>
                <Text style={styles.mainTitle}>Notlarımız</Text>
                <Text style={styles.subtitle}>Sevgi dolu küçük mesajlar...</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                setEditingNote(null);
                setIsNewModalOpen(true);
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

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{notes.length}</Text>
              <Text style={styles.statLabel}>Toplam Not</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#F43F5E' }]}>{unreadCount}</Text>
              <Text style={styles.statLabel}>Yeni Not</Text>
            </View>
          </View>
        </View>

        {/* Cork Board Area */}
        <View style={styles.boardContainer}>
          <View style={styles.boardDecoration}>
            <View style={[styles.boardPin, { top: 15, left: 15 }]} />
            <View style={[styles.boardPin, { top: 15, right: 15 }]} />
            <View style={[styles.boardPin, { bottom: 15, left: 15 }]} />
            <View style={[styles.boardPin, { bottom: 15, right: 15 }]} />
          </View>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#white" />
            </View>
          ) : notes.length > 0 ? (
            <View style={styles.notesGrid}>
              {notes.map((note, index) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  index={index}
                  currentUserId={user?._id}
                  onPress={(n) => {
                    setSelectedNote(n);
                    handleMarkAsRead(n);
                  }}
                  onEdit={setEditingNote}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <NoteIcon size={48} color="white" />
              </View>
              <Text style={styles.emptyTitle}>Panoda Henüz Not Yok</Text>
              <Text style={styles.emptySubtitle}>Sevgilinize günün ilk notunu bırakın!</Text>
              <TouchableOpacity
                onPress={() => setIsNewModalOpen(true)}
                style={styles.emptyActionBtn}
              >
                <Text style={styles.emptyActionText}>Hemen Bir Not Yaz</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <NewNoteModal
        visible={isNewModalOpen || !!editingNote}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingNote(null);
        }}
        onSuccess={() => fetchNotes(false)}
        editingNote={editingNote}
      />

      <NoteDetailModal
        note={selectedNote}
        visible={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        onEdit={setEditingNote}
        onDelete={handleDelete}
        currentUserId={user?._id}
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
  header: {
    padding: 20,
    paddingTop: 10,
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
    backgroundColor: '#F59E0B',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '3deg' }],
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  mainTitle: {
    fontSize: 28,
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    color: '#111827',
  },
  statLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  boardContainer: {
    margin: 15,
    borderRadius: 40,
    backgroundColor: '#D4A574',
    minHeight: 600,
    padding: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 10,
    borderColor: '#8B5A2B',
  },
  boardDecoration: {
    ...StyleSheet.absoluteFillObject,
  },
  boardPin: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 400,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ rotate: '-12deg' }],
  },
  emptyTitle: {
    fontSize: 22,
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  emptyActionBtn: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  emptyActionText: {
    color: '#F43F5E',
    fontSize: 16,
  },
});
