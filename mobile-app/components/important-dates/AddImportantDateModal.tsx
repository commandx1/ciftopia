import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Image } from 'react-native'
import { Text } from '../ui/Text'
import { TextInput } from '../ui/TextInput'
import {
  X,
  Calendar as CalendarIcon,
  Type,
  FileText,
  Camera,
  Check,
  Loader2,
  RefreshCw,
  Database,
  Info,
  Trash2
} from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { importantDatesApi } from '../../api/important-dates'
import { uploadApi } from '../../api/upload'
import { useAuth } from '../../context/AuthContext'
import { usePlanLimits } from '../../context/PlanLimitsContext'
import { useToast } from '../ui/ToastProvider'
import { CustomModal } from '../ui/Modal'

interface AddImportantDateModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: any
}

const DATE_TYPES = [
  { id: 'dating', emoji: '💕', label: 'Tanışma' },
  { id: 'first_kiss', emoji: '💋', label: 'İlk Öpücük' },
  { id: 'relationship', emoji: '💑', label: 'İlişki' },
  { id: 'engagement', emoji: '💍', label: 'Nişan' },
  { id: 'marriage', emoji: '💒', label: 'Evlilik' },
  { id: 'birthday', emoji: '🎂', label: 'Doğum Günü' },
  { id: 'travel', emoji: '✈️', label: 'Seyahat' },
  { id: 'moving', emoji: '🏠', label: 'Taşınma' },
  { id: 'special', emoji: '📅', label: 'Özel' }
]

export default function AddImportantDateModal({ visible, onClose, onSuccess, editData }: AddImportantDateModalProps) {
  const { user } = useAuth()
  const { limits, storageUsed, storageLimit } = usePlanLimits()
  const { show: showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const maxPhotosPerContent = Math.max(0, limits.photosPerContent ?? 1)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [type, setType] = useState('special')
  const [description, setDescription] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [selectedImage, setSelectedImage] = useState<any>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (editData) {
      setTitle(editData.title || '')
      setDate(new Date(editData.date))
      setType(editData.type || 'special')
      setDescription(editData.description || '')
      setIsRecurring(editData.isRecurring || false)
      setPreviewUrl(editData.photo?.url || null)
    } else {
      setTitle('')
      setDate(new Date())
      setType('special')
      setDescription('')
      setIsRecurring(false)
      setPreviewUrl(null)
      setSelectedImage(null)
    }
  }, [editData, visible])

  const pickImage = async () => {
    if (maxPhotosPerContent <= 0) {
      showToast({
        type: 'error',
        title: 'Limit',
        message: 'Planınız bu özellik için fotoğraf eklemenize izin vermiyor.'
      })
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8
    })

    if (!result.canceled) {
      const asset = result.assets[0]
      const fileSize = Number(asset.fileSize ?? 0)
      if (storageLimit > 0 && storageUsed + fileSize > storageLimit) {
        showToast({
          type: 'error',
          title: 'Depolama dolu',
          message: 'Depolama alanınız yetersiz. Planınızı yükseltin veya alan açın.'
        })
        return
      }
      setSelectedImage(asset)
      setPreviewUrl(asset.uri)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast({ type: 'error', title: 'Hata', message: 'Başlık boş bırakılamaz.' })
      return
    }
    if (selectedImage && storageLimit > 0) {
      const fileSize = Number((selectedImage as any).fileSize ?? 0)
      if (storageUsed + fileSize > storageLimit) {
        showToast({
          type: 'error',
          title: 'Depolama dolu',
          message: 'Depolama alanınız yetersiz.'
        })
        return
      }
    }

    try {
      setLoading(true)
      let photoData = editData?.photo

      if (selectedImage) {
        const uploadRes = await uploadApi.uploadPhotos([selectedImage], user?.accessToken)
        const p = uploadRes.photos[0]
        photoData = {
          url: p.key,
          width: p.width,
          height: p.height,
          size: p.size
        }
      }

      const payload = {
        title: title.trim(),
        date: date.toISOString(),
        type,
        description: description.trim(),
        isRecurring,
        photo: photoData
      }

      if (editData) {
        await importantDatesApi.update(editData._id, payload, user?.accessToken)
        showToast({ type: 'success', title: 'Başarılı', message: 'Tarih güncellendi.' })
      } else {
        await importantDatesApi.create(payload, user?.accessToken)
        showToast({ type: 'success', title: 'Başarılı', message: 'Yeni tarih eklendi.' })
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error(error)
      showToast({ type: 'error', title: 'Hata', message: 'İşlem başarısız oldu.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomModal visible={visible} onClose={onClose} title={editData ? 'Tarihi Güncelle' : 'Yeni Tarih Ekle'}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tarih Türü</Text>
          <View style={styles.typeGrid}>
            {DATE_TYPES.map(t => (
              <TouchableOpacity
                key={t.id}
                onPress={() => setType(t.id)}
                style={[styles.typeOption, type === t.id && styles.typeOptionActive]}
              >
                <Text style={styles.typeEmoji}>{t.emoji}</Text>
                <Text style={[styles.typeLabel, type === t.id && styles.typeLabelActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Başlık</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder='Örn: İlk Buluşmamız' style={styles.input} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tarih</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerBtn}>
            <CalendarIcon size={18} color='#9CA3AF' />
            <Text style={styles.datePickerText}>{format(date, 'd MMMM yyyy', { locale: tr })}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode='date'
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selectedDate) => {
                setShowDatePicker(false)
                if (selectedDate) setDate(selectedDate)
              }}
            />
          )}
        </View>

        <TouchableOpacity onPress={() => setIsRecurring(!isRecurring)} style={styles.recurringRow}>
          <View style={[styles.checkbox, isRecurring && styles.checkboxActive]}>
            {isRecurring && <Check size={14} color='white' />}
          </View>
          <RefreshCw size={16} color={isRecurring ? '#F43F5E' : '#9CA3AF'} />
          <Text style={[styles.recurringLabel, isRecurring && styles.recurringLabelActive]}>Her Yıl Tekrarla</Text>
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fotoğraf (Opsiyonel)</Text>
          {previewUrl ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: previewUrl }} style={styles.previewImage} />
              <TouchableOpacity
                onPress={() => {
                  setSelectedImage(null)
                  setPreviewUrl(null)
                }}
                style={styles.removePhotoBtn}
              >
                <X size={16} color='white' />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={pickImage} style={styles.uploadBtn}>
              <Camera size={32} color='#9CA3AF' />
              <Text style={styles.uploadText}>Fotoğraf Yükle</Text>
              <Text style={styles.uploadSubtext}>Max. 5MB • PNG, JPG</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Not (Opsiyonel)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder='Bu tarihle ilgili özel bir şeyler yazın...'
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea]}
          />
        </View>

        <View style={styles.footerBtns}>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.submitBtn}>
            <LinearGradient colors={['#F43F5E', '#EC4899']} style={styles.submitGradient}>
              {loading ? (
                <ActivityIndicator size='small' color='white' />
              ) : (
                <>
                  <Check size={20} color='white' />
                  <Text style={styles.submitBtnText}>{editData ? 'Güncelle' : 'Kaydet'}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </CustomModal>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: 25
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  typeOption: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5
  },
  typeOptionActive: {
    borderColor: '#F43F5E',
    backgroundColor: '#FFF1F2'
  },
  typeEmoji: {
    fontSize: 24,
    marginBottom: 4
  },
  typeLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  typeLabelActive: {
    color: '#E11D48'
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: '50%',
    marginTop: -9,
    zIndex: 1
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#111827'
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 15
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12
  },
  datePickerText: {
    fontSize: 16,
    color: '#111827'
  },
  recurringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 25
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxActive: {
    backgroundColor: '#F43F5E',
    borderColor: '#F43F5E'
  },
  recurringLabel: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'uppercase'
  },
  recurringLabelActive: {
    color: '#F43F5E'
  },
  uploadBtn: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    padding: 30,
    alignItems: 'center',
    gap: 8
  },
  uploadText: {
    fontSize: 14,
    color: '#4B5563'
  },
  uploadSubtext: {
    fontSize: 11,
    color: '#9CA3AF'
  },
  previewContainer: {
    position: 'relative',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden'
  },
  previewImage: {
    width: '100%',
    height: '100%'
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  footerBtns: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center'
  },
  cancelBtnText: {
    fontSize: 14,
    color: '#4B5563',
    textTransform: 'uppercase'
  },
  submitBtn: {
    flex: 2,
    borderRadius: 15,
    overflow: 'hidden'
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10
  },
  submitBtnText: {
    color: 'white',
    fontSize: 14,
    textTransform: 'uppercase'
  }
})
