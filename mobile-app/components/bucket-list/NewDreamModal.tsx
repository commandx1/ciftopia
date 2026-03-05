import React,{ useState,useEffect } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native'
import { Text } from '../ui/Text'
import { TextInput } from '../ui/TextInput'
import { X,Plus,Calendar as CalendarIcon,Trash2,Map,Coffee,Home,Heart,Film } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { bucketListApi } from '../../api/bucket-list'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ui/ToastProvider'
import { CustomModal } from '../ui/Modal'

interface NewDreamModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  editingDream?: any
}

const CATEGORIES = [
  { id: 'experience', label: 'Deneyim', icon: Film, color: '#8B5CF6' },
  { id: 'travel', label: 'Seyahat', icon: Map, color: '#3B82F6' },
  { id: 'food', label: 'Yemek', icon: Coffee, color: '#F59E0B' },
  { id: 'home', label: 'Ev', icon: Home, color: '#10B981' },
  { id: 'relationship', label: 'İlişki', icon: Heart, color: '#F43F5E' },
]

export default function NewDreamModal({ visible,onClose,onSuccess,editingDream }: NewDreamModalProps) {
  const { user } = useAuth()
  const { show: showToast } = useToast()
  const [loading,setLoading] = useState(false)
  const [title,setTitle] = useState('')
  const [description,setDescription] = useState('')
  const [category,setCategory] = useState('experience')
  const [targetDate,setTargetDate] = useState<Date | null>(null)
  const [showDatePicker,setShowDatePicker] = useState(false)

  useEffect(() => {
    if (editingDream) {
      setTitle(editingDream.title || '')
      setDescription(editingDream.description || '')
      setCategory(editingDream.category || 'experience')
      setTargetDate(editingDream.targetDate ? new Date(editingDream.targetDate) : null)
    } else {
      setTitle('')
      setDescription('')
      setCategory('experience')
      setTargetDate(null)
    }
  },[editingDream,visible])

  const onDateChange = (_event: any,selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setTargetDate(selectedDate)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Hayal başlığı boş bırakılamaz.',
      })
      return
    }

    try {
      setLoading(true)
      const dreamData = {
        title: title.trim(),
        description: description.trim(),
        category,
        targetDate: targetDate?.toISOString(),
      }

      let result
      if (editingDream) {
        result = await bucketListApi.update(editingDream._id,dreamData,user?.accessToken)
      } else {
        result = await bucketListApi.create(dreamData,user?.accessToken)
      }

      if (result) {
        showToast({
          type: 'success',
          title: 'Başarılı',
          message: editingDream ? 'Hayal güncellendi! ✨' : 'Yeni hayal eklendi! ✨',
        })
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Error submitting dream:', error)
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Bir sorun oluştu.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={editingDream ? 'Hayali Düzenle' : 'Yeni Hayal Ekle'}
      headerIcon={<Plus size={20} color="#3B82F6" />}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hayaliniz Nedir?</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Örn: Paris'te Eyfel kulesi önünde akşam yemeği"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Açıklama (Opsiyonel)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Hayalinizle ilgili detaylar ekleyin..."
            multiline
            numberOfLines={4}
            style={[styles.input,styles.textArea]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hedef Tarih (İstersen)</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.datePickerBtn}
          >
            <CalendarIcon size={20} color="#6B7280" />
            <Text style={[styles.datePickerText, !targetDate && styles.placeholderText]}>
              {targetDate 
                ? format(targetDate, 'dd MMMM yyyy', { locale: tr })
                : 'Bir tarih seçin...'}
            </Text>
            {targetDate && (
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  setTargetDate(null);
                }}
                style={styles.clearDateBtn}
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={targetDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kategori Seç</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                style={[
                  styles.categoryOption,
                  category === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '10' }
                ]}
              >
                <cat.icon size={24} color={category === cat.id ? cat.color : '#9CA3AF'} />
                <Text style={[
                  styles.categoryOptionText,
                  category === cat.id && { color: cat.color }
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={styles.submitBtn}
        >
          <LinearGradient
            colors={['#F43F5E','#EC4899']}
            start={{ x: 0,y: 0 }}
            end={{ x: 1,y: 0 }}
            style={styles.submitGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Plus size={24} color="white" />
                <Text style={styles.submitText}>
                  {editingDream ? 'Hayali Güncelle' : 'Hayal Listesine Ekle'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </CustomModal>
  )
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    width: '31%',
    alignItems: 'center',
    gap: 8,
  },
  categoryOptionText: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  datePickerText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  clearDateBtn: {
    padding: 4,
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
})

