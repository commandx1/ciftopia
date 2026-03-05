import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '../ui/Text';
import { X, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { notesApi } from '../../api/notes';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/ToastProvider';
import { NOTE_COLORS } from './NoteCard';
import { TextInput } from '../ui/TextInput';

interface NewNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingNote?: any;
}

export default function NewNoteModal({ visible, onClose, onSuccess, editingNote }: NewNoteModalProps) {
  const { user } = useAuth();
  const { show: showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('yellow');

  useEffect(() => {
    if (editingNote) {
      setContent(editingNote.content || '');
      setSelectedColor(editingNote.color || 'yellow');
    } else {
      setContent('');
      setSelectedColor('yellow');
    }
  }, [editingNote, visible]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      showToast({ type: 'error', title: 'Hata', message: 'Not içeriği boş bırakılamaz.' });
      return;
    }

    try {
      setLoading(true);
      if (editingNote) {
        await notesApi.update(editingNote._id, { content: content.trim(), color: selectedColor }, user?.accessToken);
        showToast({ type: 'success', title: 'Başarılı', message: 'Not güncellendi! ✨' });
      } else {
        await notesApi.create({ content: content.trim(), color: selectedColor }, user?.accessToken);
        showToast({ type: 'success', title: 'Başarılı', message: 'Not panoya eklendi! 📌' });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Hata', message: 'Not kaydedilirken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{editingNote ? 'Notu Düzenle' : 'Yeni Not Bırak'}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Not Rengi Seç</Text>
                <View style={styles.colorGrid}>
                  {Object.keys(NOTE_COLORS).map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      style={[
                        styles.colorOption,
                        { backgroundColor: NOTE_COLORS[color].bg },
                        selectedColor === color && styles.colorOptionActive,
                      ]}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mesajın</Text>
                <TextInput
                  value={content}
                  onChangeText={(text: string) => setContent(text.slice(0, 200))}
                  placeholder="Sevgiline bir mesaj yaz..."
                  multiline
                  numberOfLines={6}
                  style={[
                    styles.textArea,
                    { backgroundColor: NOTE_COLORS[selectedColor].bg }
                  ]}
                />
                <View style={styles.charCountRow}>
                  <Text style={styles.charHint}>Maksimum 200 karakter</Text>
                  <Text style={[styles.charCount, content.length >= 200 && styles.charLimit]}>
                    {content.length}/200
                  </Text>
                </View>
              </View>

              <View style={styles.footerBtns}>
                <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSubmit} disabled={loading || !content.trim()} style={styles.submitBtn}>
                  <LinearGradient
                    colors={['#F43F5E', '#EC4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Text style={styles.submitBtnText}>{editingNote ? 'Güncelle' : 'Notu Bırak'}</Text>
                        <Heart size={18} color="white" fill="white" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  keyboardView: {
    width: '100%',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 30,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 22,
    color: '#111827',
  },
  closeBtn: {
    padding: 5,
  },
  content: {
    padding: 25,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 15,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: '#F43F5E',
  },
  textArea: {
    borderRadius: 20,
    padding: 20,
    minHeight: 180,
    fontSize: 20,
    textAlignVertical: 'top',
    color: '#1F2937',
  },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 5,
  },
  charHint: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  charLimit: {
    color: '#EF4444',
  },
  footerBtns: {
    flexDirection: 'row',
    gap: 15,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    color: '#4B5563',
  },
  submitBtn: {
    flex: 2,
    borderRadius: 15,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitBtnText: {
    color: 'white',
    fontSize: 14,
  },
});
