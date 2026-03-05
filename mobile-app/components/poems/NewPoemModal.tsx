import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text } from '../ui/Text';
import { TextInput } from '../ui/TextInput';
import { X, Feather, Sparkles, Send, Plus, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { poemsApi } from '../../api/poems';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/ToastProvider';
import { CustomModal } from '../ui/Modal';

interface NewPoemModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingPoem?: any;
}

const TAG_OPTIONS = ['Aşk', 'Özlem', 'Yıldönümü', 'Doğum Günü', 'Günaydın', 'İyi Geceler', 'Dilek', 'Sonsuzluk'];

export default function NewPoemModal({ visible, onClose, onSuccess, editingPoem }: NewPoemModalProps) {
  const { user } = useAuth();
  const { show: showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (editingPoem) {
      setTitle(editingPoem.title || '');
      setContent(editingPoem.content || '');
      setTags(editingPoem.tags || []);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
    }
  }, [editingPoem, visible]);

  const toggleTag = (t: string) => {
    if (tags.includes(t)) {
      setTags(tags.filter((item) => item !== t));
    } else {
      setTags([...tags, t]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Başlık ve içerik boş bırakılamaz.',
      });
      return;
    }

    try {
      setLoading(true);
      const poemData = {
        title: title.trim(),
        content: content.trim(),
        tags,
      };

      let result;
      if (editingPoem) {
        result = await poemsApi.updatePoem(editingPoem._id, poemData, user?.accessToken);
      } else {
        result = await poemsApi.createPoem(poemData, user?.accessToken);
      }

      if (result.success) {
        showToast({
          type: 'success',
          title: 'Başarılı',
          message: editingPoem ? 'Şiir güncellendi! ✨' : 'Yeni şiirin paylaşıldı! ✨',
        });
        onSuccess();
        onClose();
      } else {
        showToast({
          type: 'error',
          title: 'Hata',
          message: result.message,
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Bir sorun oluştu.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      maxHeight='75%'
      title={editingPoem ? 'Şiiri Düzenle' : 'Yeni Şiir Yaz'}
      headerIcon={<Feather size={20} color="#8B5CF6" />}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Şiir Başlığı</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Şiirinize bir başlık verin..."
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dizeler</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Duygularınızı kağıda dökün..."
            multiline
            numberOfLines={8}
            style={[styles.input, styles.textArea]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Etiketler (Opsiyonel)</Text>
          <View style={styles.tagsGrid}>
            {TAG_OPTIONS.map((t) => {
              const isSelected = tags.includes(t);
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => toggleTag(t)}
                  style={[
                    styles.tagOption,
                    isSelected && styles.tagOptionSelected
                  ]}
                >
                  <Text style={[
                    styles.tagOptionText,
                    isSelected && styles.tagOptionTextSelected
                  ]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={styles.submitBtn}
        >
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text style={styles.submitText}>
                  {editingPoem ? 'Güncelle' : 'Paylaş'}
                </Text>
                <Send size={18} color="white" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  tagOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagOptionSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  tagOptionText: {
    fontSize: 13,
    color: '#4B5563',
  },
  tagOptionTextSelected: {
    color: '#fff',
  },
  submitBtn: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
  },
});

