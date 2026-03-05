import React, { useState, useEffect, useMemo } from 'react'
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Image } from 'react-native'
import { Text } from '../ui/Text'
import { TextInput } from '../ui/TextInput'
import {
  X,
  Heart,
  Images,
  CloudUpload,
  PenLine,
  Calendar as CalendarIcon,
  MapPin,
  Smile,
  AlignLeft,
  Star,
  Sparkles,
  Database,
  Info
} from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { memoriesApi } from '../../api/memories'
import { uploadApi } from '../../api/upload'
import { useAuth } from '../../context/AuthContext'
import { usePlanLimits } from '../../context/PlanLimitsContext'
import { useToast } from '../ui/ToastProvider'
import { useRouter } from 'expo-router'
import { getEffectivePhotoLimit } from '../../utils/planLimits'
import { moodConfigs } from './MemoryMoodBadge'
import { CustomModal } from '../ui/Modal'
import { PlanUpgradeBlock } from '../ui/PlanUpgradeBlock'
import { romanticRoseTheme } from '../../theme/romanticRose'
import { nightBlueTheme } from '../../theme/nightBlue'

const formatBytes = (bytes: number) => {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

interface NewMemoryModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  editingMemory?: any
  storage?: { used: number; limit: number }
}

const themes = {
  romanticRose: romanticRoseTheme,
  nightBlue: nightBlueTheme
} as const

const theme = themes.romanticRose

export default function NewMemoryModal({ visible, onClose, onSuccess, editingMemory, storage }: NewMemoryModalProps) {
  const { user } = useAuth()
  const { limits, storageUsed: ctxStorageUsed, storageLimit: ctxStorageLimit } = usePlanLimits()
  const { show: showToast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [locationName, setLocationName] = useState('')
  const [mood, setMood] = useState('romantic')
  const [content, setContent] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImages, setSelectedImages] = useState<any[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [existingPhotos, setExistingPhotos] = useState<any[]>([])
  const [initialMemorySize, setInitialMemorySize] = useState(0)

  const maxPhotosPerContent = getEffectivePhotoLimit(limits.photosPerContent, 5)
  const totalPhotos = existingPhotos.length + selectedImages.length
  const atPhotoLimit = totalPhotos >= maxPhotosPerContent
  const currentStorageUsed = storage?.used ?? ctxStorageUsed
  const storageLimit = storage?.limit ?? ctxStorageLimit

  const currentMemorySize = useMemo(() => {
    const existingSize = existingPhotos.reduce((acc, p) => acc + Number(p.size || 0), 0)
    const selectedSize = selectedImages.reduce((acc, f) => acc + Number(f.fileSize || 0), 0)
    return existingSize + selectedSize
  }, [existingPhotos, selectedImages])

  const projectedUsage = Math.max(0, currentStorageUsed - initialMemorySize + currentMemorySize)
  const usagePercentage = storageLimit > 0 ? (Math.min(projectedUsage, storageLimit) / storageLimit) * 100 : 0
  const isOverLimit = storageLimit > 0 && projectedUsage > storageLimit

  useEffect(() => {
    if (!visible) return

    if (editingMemory) {
      const initialSize = editingMemory.photos?.reduce((acc: number, p: any) => acc + (Number(p.size) || 0), 0) || 0
      setInitialMemorySize(initialSize)

      setTitle(editingMemory.title || '')
      setDate(new Date(editingMemory.date))
      setLocationName(editingMemory.location?.name || '')
      setMood(editingMemory.mood || 'romantic')
      setContent(editingMemory.content || '')
      setIsFavorite(editingMemory.favorites?.includes(user?._id) || false)
      setExistingPhotos(editingMemory.rawPhotos || [])
      setPreviewUrls(editingMemory.photos?.map((p: any) => (typeof p === 'string' ? p : p.url)) || [])
      setSelectedImages([])
    } else {
      setInitialMemorySize(0)
      setTitle('')
      setDate(new Date())
      setLocationName('')
      setMood('romantic')
      setContent('')
      setIsFavorite(false)
      setSelectedImages([])
      setPreviewUrls([])
      setExistingPhotos([])
    }
  }, [editingMemory, visible])

  const pickImages = async () => {
    const remainingSlots = maxPhotosPerContent - totalPhotos
    if (remainingSlots <= 0) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.8
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages = result.assets

      const newImagesSize = newImages.reduce((acc, img) => acc + Number(img.fileSize || 0), 0)
      if (storageLimit > 0 && projectedUsage + newImagesSize > storageLimit) {
        showToast({ type: 'error', title: 'Limit Aşıldı', message: 'Depolama alanınız yetersiz.' })
        return
      }

      setSelectedImages(prev => [...prev, ...newImages])
      setPreviewUrls(prev => [...prev, ...newImages.map(img => img.uri)])
    }
  }

  const removePhoto = (index: number) => {
    const totalExisting = existingPhotos.length
    if (index < totalExisting) {
      setExistingPhotos(prev => {
        const next = [...prev]
        next.splice(index, 1)
        return next
      })
    } else {
      setSelectedImages(prev => {
        const next = [...prev]
        next.splice(index - totalExisting, 1)
        return next
      })
    }
    setPreviewUrls(prev => {
      const next = [...prev]
      next.splice(index, 1)
      return next
    })
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      showToast({ type: 'error', title: 'Hata', message: 'Lütfen zorunlu alanları doldurun.' })
      return
    }

    if (isOverLimit && selectedImages.length > 0) {
      showToast({ type: 'error', title: 'Limit Aşıldı', message: 'Depolama limitini aşıyorsunuz!' })
      return
    }

    try {
      setLoading(true)
      let photoMetadatas = [...existingPhotos]

      if (selectedImages.length > 0) {
        const uploadRes = await uploadApi.uploadPhotos(selectedImages, user?.accessToken)
        const newPhotos = uploadRes.photos.map((p: any) => ({
          url: p.key,
          width: p.width,
          height: p.height,
          size: p.size
        }))
        photoMetadatas = [...photoMetadatas, ...newPhotos]
      }

      const otherFavorites = editingMemory?.favorites?.filter((id: string) => id !== user?._id) || []
      const newFavorites = isFavorite && user?._id ? [...otherFavorites, user._id] : otherFavorites

      const payload = {
        title: title.trim(),
        content: content.trim(),
        date: date.toISOString(),
        locationName: locationName.trim(),
        mood,
        photos: photoMetadatas,
        favorites: newFavorites
      }

      if (editingMemory) {
        await memoriesApi.update(editingMemory._id, payload, user?.accessToken)
        showToast({ type: 'success', title: 'Başarılı', message: 'Anı güncellendi.' })
      } else {
        await memoriesApi.create(payload, user?.accessToken)
        showToast({ type: 'success', title: 'Başarılı', message: 'Yeni anı eklendi.' })
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
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={editingMemory ? 'Anıyı Düzenle' : 'Yeni Anı Ekle'}
      subtitle='Özel anınızı ölümsüzleştirin'
      headerIcon={<Heart size={32} color='white' fill='white' />}
      headerColors={theme.accentGradient}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
        <View style={styles.blobTop} />
        <View style={styles.blobBottom} />

        {/* Photo Upload */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Images size={20} color={theme.accent} />
            <Text style={styles.label}>Fotoğraflar</Text>
            <Text style={styles.labelHint}>(En fazla {maxPhotosPerContent} adet)</Text>
          </View>
          <View style={styles.photoGrid}>
            <TouchableOpacity
              onPress={pickImages}
              style={[styles.addPhotoBtn, atPhotoLimit && styles.addPhotoBtnDisabled]}
              activeOpacity={atPhotoLimit ? 1 : 0.7}
            >
              <CloudUpload size={32} color={atPhotoLimit ? theme.textMuted : theme.accent} />
              <Text style={[styles.addPhotoText, atPhotoLimit && styles.addPhotoTextDisabled]}>
                {atPhotoLimit ? 'Limite ulaştınız' : 'Ekle'}
              </Text>
            </TouchableOpacity>
            {previewUrls.map((url, index) => (
              <View key={index} style={styles.photoPreview}>
                <Image source={{ uri: url }} style={styles.photo} />
                <TouchableOpacity onPress={() => removePhoto(index)} style={styles.removePhotoBtn}>
                  <X size={12} color='white' />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {atPhotoLimit && (
            <PlanUpgradeBlock
              variant='photos_per_content'
              limit={maxPhotosPerContent}
              onUpgradePress={() => {
                onClose()
                router.push('/store')
              }}
            />
          )}

          {/* Depolama Durumu */}
          {storageLimit > 0 && (
            <View style={styles.storageCard}>
              <View style={styles.storageHeader}>
                <View>
                  <Text style={styles.storageTitle}>Depolama Durumu</Text>
                  <View style={styles.storageUsageRow}>
                    <Text style={styles.storageValue}>{formatBytes(projectedUsage)}</Text>
                    {selectedImages.length > 0 && (
                      <Text style={styles.storageNewText}>
                        (+
                        {formatBytes(
                          selectedImages.reduce((acc, img) => acc + Number(img.fileSize || img.size || 0), 0)
                        )}{' '}
                        yeni)
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.databaseIconBox}>
                  <Database size={24} color={theme.accent} />
                </View>
              </View>

              <View style={styles.progressBarWrapper}>
                <View style={styles.progressBarHeader}>
                  <Text style={styles.progressText}>
                    {formatBytes(projectedUsage)} / {formatBytes(storageLimit)}
                  </Text>
                  <Text style={[styles.percentageText, { color: isOverLimit ? theme.accentStrong : theme.accent }]}>
                    %{storageLimit > 0 ? Math.max(0, (projectedUsage / storageLimit) * 100).toFixed(1) : '0.0'}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${usagePercentage}%`, backgroundColor: isOverLimit ? theme.accentStrong : theme.accent }
                    ]}
                  />
                </View>
              </View>

              {isOverLimit && (
                <View style={styles.limitWarning}>
                  <Info size={14} color={theme.accentStrong} />
                  <Text style={styles.warningText}>
                    ⚠️ Depolama limitini aşıyorsunuz! Lütfen bazı fotoğrafları çıkarın.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Title & Date */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <View style={styles.labelRow}>
              <PenLine size={18} color={theme.accent} />
              <Text style={styles.label}>Başlık</Text>
            </View>
            <TextInput value={title} onChangeText={setTitle} placeholder='Anı başlığı...' style={styles.input} />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <View style={styles.labelRow}>
              <CalendarIcon size={18} color={theme.accent} />
              <Text style={styles.label}>Tarih</Text>
            </View>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateBtn}>
              <Text style={styles.dateText}>{format(date, 'd MMMM yyyy', { locale: tr })}</Text>
            </TouchableOpacity>
          </View>
        </View>

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

        {/* Location */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <MapPin size={18} color={theme.accent} />
            <Text style={styles.label}>Konum (Opsiyonel)</Text>
          </View>
          <TextInput
            value={locationName}
            onChangeText={setLocationName}
            placeholder='Neredeydiniz?'
            style={styles.input}
          />
        </View>

        {/* Mood Selection */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Smile size={18} color={theme.accent} />
            <Text style={styles.label}>Ruh Hali</Text>
          </View>
          <View style={styles.moodGrid}>
            {Object.entries(moodConfigs).map(([key, config]) => {
              const Icon = config.icon
              const isSelected = mood === key
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setMood(key)}
                  style={[
                    styles.moodBtn,
                    isSelected && { borderColor: config.iconColor, backgroundColor: config.badgeBg }
                  ]}
                >
                  <Icon
                    size={24}
                    color={isSelected ? config.iconColor : '#9CA3AF'}
                    fill={isSelected && key === 'romantic' ? config.iconColor : 'none'}
                  />
                  <Text style={[styles.moodLabel, isSelected && { color: config.iconColor }]}>{config.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Content */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <AlignLeft size={18} color={theme.accent} />
            <Text style={styles.label}>Anınızı Anlatın</Text>
          </View>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder='O gün neler oldu? Neler hissettiniz?..'
            multiline
            numberOfLines={5}
            style={[styles.input, styles.textArea]}
          />
        </View>

        {/* Favorite Toggle */}
        <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.favoriteRow}>
          <View style={styles.favoriteLeft}>
            <Star
              size={20}
              color={isFavorite ? theme.highlight : theme.textMuted}
              fill={isFavorite ? theme.highlight : 'none'}
            />
            <Text style={styles.favoriteText}>Favorilere Ekle</Text>
          </View>
          <View style={[styles.switch, isFavorite && styles.switchActive]}>
            <View style={[styles.switchDot, isFavorite && styles.switchDotActive]} />
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.footerBtns}>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.submitBtn}>
            <LinearGradient
              colors={theme.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {loading ? (
                <ActivityIndicator size='small' color='white' />
              ) : (
                <>
                  <Heart size={20} color='white' fill='white' />
                  <Text style={styles.submitBtnText}>{editingMemory ? 'Güncelle' : 'Kaydet'}</Text>
                  <Sparkles size={16} color='#FDE047' />
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  label: {
    fontSize: 16,
    color: theme.textPrimary
  },
  labelHint: {
    fontSize: 12,
    color: theme.textMuted
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  addPhotoBtn: {
    width: 65,
    height: 65,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: theme.cardSoftAlt,
    borderStyle: 'dashed',
    backgroundColor: theme.cardSoftAlt,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addPhotoBtnDisabled: {
    borderColor: theme.borderSoft,
    backgroundColor: theme.cardSoft,
    opacity: 0.9
  },
  addPhotoText: {
    fontSize: 10,
    color: theme.accent,
    marginTop: 2
  },
  addPhotoTextDisabled: {
    color: theme.textMuted
  },
  photoPreview: {
    width: 65,
    height: 65,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.borderSoft,
    backgroundColor: theme.cardSoft
  },
  photo: {
    width: '100%',
    height: '100%'
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row',
    gap: 15
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
    minHeight: 120,
    textAlignVertical: 'top'
  },
  dateBtn: {
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center'
  },
  dateText: {
    fontSize: 14,
    color: '#111827'
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  moodBtn: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  moodLabel: {
    fontSize: 10,
    color: theme.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase'
  },
  favoriteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.cardSoft,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    marginBottom: 25
  },
  favoriteLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  favoriteText: {
    fontSize: 16,
    color: theme.textSecondary
  },
  switch: {
    width: 48,
    height: 26,
    backgroundColor: theme.borderSoft,
    borderRadius: 13,
    padding: 3
  },
  switchActive: {
    backgroundColor: theme.accent
  },
  switchDot: {
    width: 20,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 10
  },
  switchDotActive: {
    transform: [{ translateX: 22 }]
  },
  footerBtns: {
    flexDirection: 'row',
    gap: 15
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: theme.cardSoft,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center'
  },
  cancelBtnText: {
    fontSize: 16,
    color: theme.textSecondary
  },
  submitBtn: {
    flex: 2,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16
  },
  storageCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  storageTitle: {
    fontSize: 14,
    color: '#1E40AF',
    marginBottom: 2
  },
  storageUsageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6
  },
  storageValue: {
    fontSize: 18,
    color: theme.textPrimary
  },
  storageNewText: {
    fontSize: 12,
    color: '#3B82F6'
  },
  databaseIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  progressBarWrapper: {
    gap: 6
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  progressText: {
    fontSize: 11,
    color: theme.textSecondary
  },
  percentageText: {
    fontSize: 11
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#DBEAFE',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4
  },
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 10
  },
  warningText: {
    fontSize: 11,
    color: theme.accentStrong,
    flex: 1
  },
  blobTop: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    backgroundColor: theme.cardSoftAlt,
    borderRadius: 100,
    opacity: 0.5,
    zIndex: -1
  },
  blobBottom: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 200,
    height: 200,
    backgroundColor: theme.cardSoft,
    borderRadius: 100,
    opacity: 0.5,
    zIndex: -1
  }
})
