import React, { useState, useMemo } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Image,
  Dimensions
} from 'react-native'

const { width } = Dimensions.get('window')
import { Text } from '../ui/Text'
import { TextInput } from '../ui/TextInput'
import {
  X,
  Lock,
  Calendar,
  Sparkles,
  MessageSquare,
  Clock,
  Camera,
  Video,
  Trash2,
  Database,
  Info,
  User,
  Heart,
  Users
} from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useAuth } from '../../context/AuthContext'
import { usePlanLimits } from '../../context/PlanLimitsContext'
import { useRouter } from 'expo-router'
import { uploadApi } from '../../api/upload'
import { useToast } from '../ui/ToastProvider'
import { getEffectivePhotoLimit } from '../../utils/planLimits'
import { MAX_VIDEO_BYTES } from '../../constants/upload'
import { CustomModal } from '../ui/Modal'
import { PlanUpgradeBlock } from '../ui/PlanUpgradeBlock'

const formatBytes = (bytes: number) => {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

interface CreateCapsuleModalProps {
  visible: boolean
  onClose: () => void
  onAdd: (data: any) => Promise<void>
}

export default function CreateCapsuleModal({ visible, onClose, onAdd }: CreateCapsuleModalProps) {
  const { user } = useAuth()
  const { limits, storageUsed: ctxStorageUsed, storageLimit: ctxStorageLimit } = usePlanLimits()
  const { show: showToast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pickingVideo, setPickingVideo] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [unlockDate, setUnlockDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [receiver, setReceiver] = useState<'me' | 'partner' | 'both'>('both')

  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([])
  const [selectedVideo, setSelectedVideo] = useState<any>(null)

  const maxPhotosPerContent = getEffectivePhotoLimit(limits.photosPerContent, 5)
  const atPhotoLimit = selectedPhotos.length >= maxPhotosPerContent
  const allowVideoUpload = limits.videoUpload === true
  const currentStorageUsed = ctxStorageUsed
  const storageLimit = ctxStorageLimit

  const handleUpgradePress = () => {
    onClose()
    router.push('/store')
  }

  const currentNewFilesSize = useMemo(() => {
    const photosSize = selectedPhotos.reduce((acc, img) => acc + Number(img.fileSize || 0), 0)
    const videoSize = Number(selectedVideo?.fileSize || 0)
    return photosSize + videoSize
  }, [selectedPhotos, selectedVideo])

  const projectedUsage = currentStorageUsed + currentNewFilesSize
  const usagePercentage = storageLimit > 0 ? (Math.min(projectedUsage, storageLimit) / storageLimit) * 100 : 0
  const isOverLimit = storageLimit > 0 && projectedUsage > storageLimit

  const pickPhotos = async () => {
    const remainingSlots = maxPhotosPerContent - selectedPhotos.length
    if (remainingSlots <= 0) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.8
    })

    if (!result.canceled) {
      const newImages = result.assets
      const newSize = newImages.reduce((acc, img) => acc + Number(img.fileSize || 0), 0)

      if (storageLimit > 0 && projectedUsage + newSize > storageLimit) {
        showToast({ type: 'error', title: 'Limit Aşıldı', message: 'Depolama alanınız yetersiz.' })
        return
      }

      setSelectedPhotos(prev => [...prev, ...newImages])
    }
  }

  const pickVideo = async () => {
    if (!allowVideoUpload) return
    setPickingVideo(true)
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8
      })

      if (!result.canceled) {
        const video = result.assets[0]
        const videoSize = Number(video.fileSize || 0)

        if (videoSize > MAX_VIDEO_BYTES) {
          showToast({
            type: 'error',
            title: 'Video çok büyük',
            message: `En fazla ${formatBytes(MAX_VIDEO_BYTES)} yükleyebilirsiniz. Daha kısa bir video seçin veya sıkıştırın.`
          })
          return
        }

        if (storageLimit > 0 && projectedUsage - (selectedVideo?.fileSize || 0) + videoSize > storageLimit) {
          showToast({ type: 'error', title: 'Limit Aşıldı', message: 'Depolama alanınız yetersiz.' })
          return
        }

        setSelectedVideo(video)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const isNoSpace = /ENOSPC|No space left|write failed/i.test(msg)
      showToast({
        type: 'error',
        title: isNoSpace ? 'Yeterli alan yok' : 'Video seçilemedi',
        message: isNoSpace
          ? 'Cihazda depolama alanı dolu. Uygulama önbelleğini temizleyin veya dosyaları silin.'
          : 'Lütfen tekrar deneyin.'
      })
    } finally {
      setPickingVideo(false)
    }
  }

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const removeVideo = () => {
    setSelectedVideo(null)
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return
    if (isOverLimit) {
      showToast({ type: 'error', title: 'Hata', message: 'Depolama limitini aşıyorsunuz!' })
      return
    }

    setLoading(true)
    try {
      let photoData = []
      let videoData = undefined

      // Upload photos if any
      if (selectedPhotos.length > 0) {
        const uploadRes = await uploadApi.uploadPhotos(selectedPhotos, user?.accessToken)
        photoData = uploadRes.photos.map((p: any) => ({
          key: p.key,
          url: p.key,
          width: p.width,
          height: p.height,
          size: p.size
        }))
      }

      // Upload video if any (onProgress = part part circular progress)
      if (selectedVideo) {
        const uploadRes = await uploadApi.uploadVideo(selectedVideo, user?.accessToken, {
          onProgress: () => {}
        })
        videoData = {
          key: uploadRes.video.key,
          url: uploadRes.video.key,
          size: uploadRes.video.size
        }
      }

      await onAdd({
        title: title.trim(),
        content: content.trim(),
        unlockDate: unlockDate.toISOString(),
        receiver,
        photos: photoData,
        video: videoData
      })

      setTitle('')
      setContent('')
      setSelectedPhotos([])
      setSelectedVideo(null)
      onClose()
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string; code?: string }
      let message = ax?.response?.data?.message || ax?.message
      if (!message) {
        message =
          ax?.code === 'ECONNABORTED'
            ? 'Video yükleme zaman aşımına uğradı. Bağlantınızı kontrol edin veya daha küçük bir video deneyin.'
            : 'Kapsül oluşturulurken bir hata oluştu.'
      }
      console.error('Kapsül hatası:', err)
      showToast({ type: 'error', title: 'Hata', message })
    } finally {
      setLoading(false)
    }
  }

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setUnlockDate(selectedDate)
    }
  }

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title='Yeni Zaman Kapsülü'
      subtitle='Geleceğe anlamlı bir miras bırakın'
      headerIcon={<Lock size={24} color='white' />}
      headerColors={['#8B5CF6', '#6D28D9']}
    >
      <View style={styles.contentWrap}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.infoBox}>
            <Sparkles size={20} color='#8B5CF6' />
            <Text style={styles.infoText}>Gelecekteki kendinize veya partnerinize bir mesaj mühürleyin.</Text>
          </View>

          {/* Receiver */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kime? 💌</Text>
            <View style={styles.receiverGrid}>
              {[
                { id: 'me', label: 'Kendime', icon: User, color: '#9333EA', bg: '#F5F3FF', border: '#DDD6FE' },
                { id: 'partner', label: 'Partnerime', icon: Heart, color: '#F43F5E', bg: '#FFF1F2', border: '#FECDD3' },
                { id: 'both', label: 'İkimize', icon: Users, color: '#D97706', bg: '#FFFBEB', border: '#FEF3C7' }
              ].map(option => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setReceiver(option.id as any)}
                  style={[
                    styles.receiverBtn,
                    receiver === option.id
                      ? { backgroundColor: option.bg, borderColor: option.border }
                      : styles.receiverBtnInactive
                  ]}
                >
                  <option.icon
                    size={24}
                    color={receiver === option.id ? option.color : '#9CA3AF'}
                    fill={receiver === option.id && option.id === 'partner' ? option.color : 'transparent'}
                  />
                  <Text
                    style={[styles.receiverText, receiver === option.id ? { color: '#111827' } : { color: '#6B7280' }]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Başlık ✨</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder='Kapsül başlığı...'
              style={styles.input}
              placeholderTextColor='#9CA3AF'
            />
          </View>

          {/* Content */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <MessageSquare size={16} color='#8B5CF6' />
              <Text style={styles.label}>Mektubunuz 💭</Text>
            </View>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder='Geleceğe ne söylemek istersiniz? En içten duygularınızı buraya dökün...'
              multiline
              numberOfLines={6}
              style={[styles.input, styles.textArea]}
              placeholderTextColor='#9CA3AF'
            />
            <View style={styles.contentFooter}>
              <Text style={styles.contentHint}>El Yazısı Stili Aktif</Text>
              <Text style={styles.contentHint}>{content.length} / 2000</Text>
            </View>
          </View>

          {/* Unlock Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ne zaman açılsın? ⏰</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateSelector}>
              <Calendar size={20} color='#8B5CF6' />
              <Text style={styles.dateSelectorText}>{format(unlockDate, 'd MMMM yyyy', { locale: tr })}</Text>
              <Clock size={16} color='#9CA3AF' />
            </TouchableOpacity>
          </View>

          {/* Photo Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fotoğraf Ekle (Opsiyonel) 📸</Text>
            <View style={styles.photoGrid}>
              {selectedPhotos.map((photo, index) => (
                <View key={index} style={styles.previewBox}>
                  <Image source={{ uri: photo.uri }} style={styles.previewImage} />
                  <TouchableOpacity onPress={() => removePhoto(index)} style={styles.removeBtn}>
                    <X size={12} color='white' />
                  </TouchableOpacity>
                </View>
              ))}
              {selectedPhotos.length < maxPhotosPerContent && (
                <TouchableOpacity onPress={pickPhotos} style={styles.addPhotoBtn}>
                  <Camera size={24} color='#9CA3AF' />
                  <Text style={styles.addBtnText}>Ekle</Text>
                </TouchableOpacity>
              )}
            </View>
            {atPhotoLimit && (
              <PlanUpgradeBlock
                variant='photos_per_content'
                limit={maxPhotosPerContent}
                onUpgradePress={handleUpgradePress}
              />
            )}
          </View>

          {/* Video Upload — plana göre göster/gizle */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Video Ekle (Opsiyonel) 🎥</Text>
            {!allowVideoUpload ? (
              <PlanUpgradeBlock variant='video' onUpgradePress={handleUpgradePress} />
            ) : selectedVideo ? (
              <View style={styles.videoPreviewContainer}>
                <View style={styles.videoPlaceholder}>
                  <Video size={32} color='#8B5CF6' />
                  <Text style={styles.videoName}>Video Seçildi</Text>
                  <Text style={styles.videoSize}>{formatBytes(selectedVideo.fileSize || 0)}</Text>
                </View>
                <TouchableOpacity onPress={removeVideo} style={styles.removeVideoBtn}>
                  <Trash2 size={20} color='#F43F5E' />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={pickVideo} style={styles.uploadVideoBtn} disabled={pickingVideo}>
                {pickingVideo ? (
                  <ActivityIndicator size='small' color='#8B5CF6' />
                ) : (
                  <>
                    <Video size={32} color='#9CA3AF' />
                    <Text style={styles.uploadVideoText}>Video Seç</Text>
                    <Text style={styles.uploadVideoSubtext}>MP4, MOV (Maks. 100MB)</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Storage Status */}
          <View style={styles.storageCard}>
            <View style={styles.storageHeader}>
              <View style={styles.storageTitleRow}>
                <Database size={18} color='#8B5CF6' />
                <Text style={styles.storageTitle}>Depolama Durumu</Text>
              </View>
              <Text style={[styles.storageValue, isOverLimit && styles.textRed]}>
                {formatBytes(projectedUsage)} / {formatBytes(storageLimit)}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${usagePercentage}%` }, isOverLimit && styles.bgRed]} />
            </View>
            <View style={styles.storageFooter}>
              <Info size={12} color='#6B7280' />
              <Text style={styles.storageFooterText}>
                {selectedPhotos.length > 0 || selectedVideo
                  ? `Seçilenler: ~${formatBytes(currentNewFilesSize)}`
                  : `En fazla ${maxPhotosPerContent} fotoğraf${allowVideoUpload ? ' ve 1 video' : ''} ekleyebilirsiniz.`}
              </Text>
            </View>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Vazgeç</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !title.trim() || !content.trim() || isOverLimit}
            style={styles.submitBtn}
          >
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {loading ? (
                <ActivityIndicator size='small' color='white' />
              ) : (
                <>
                  <Lock size={18} color='white' />
                  <Text style={styles.submitBtnText}>Kapsülü Mühürle</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={unlockDate}
            mode='date'
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>
    </CustomModal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  keyboardView: {
    width: '100%',
    maxHeight: '95%',
    justifyContent: 'flex-end'
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    height: '100%',
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    paddingTop: 30
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  headerTitle: {
    fontSize: 20,
    color: 'white'
  },
  closeBtn: {
    padding: 5
  },
  contentWrap: {
    flex: 1,
    position: 'relative'
  },
  content: {
    padding: 20
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    padding: 15,
    borderRadius: 20,
    gap: 12,
    marginBottom: 25
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#6D28D9',
    lineHeight: 20
  },
  inputGroup: {
    marginBottom: 20
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  label: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1
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
    textAlignVertical: 'top',
    fontSize: 18
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingHorizontal: 5
  },
  contentHint: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase'
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  dateSelectorText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    marginLeft: 12
  },
  receiverGrid: {
    flexDirection: 'row',
    gap: 10
  },
  receiverBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8
  },
  receiverBtnInactive: {
    backgroundColor: '#F9FAFB',
    borderColor: '#F3F4F6'
  },
  receiverText: {
    fontSize: 11,
    textTransform: 'uppercase'
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  previewBox: {
    width: (width - 60) / 3,
    aspectRatio: 1,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  previewImage: {
    width: '100%',
    height: '100%'
  },
  removeBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addPhotoBtn: {
    width: (width - 60) / 3,
    aspectRatio: 1,
    borderRadius: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5
  },
  addBtnText: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase'
  },
  uploadVideoBtn: {
    width: '100%',
    height: 120,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5
  },
  uploadVideoText: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'uppercase'
  },
  uploadVideoSubtext: {
    fontSize: 10,
    color: '#9CA3AF'
  },
  videoPreviewContainer: {
    width: '100%',
    height: 120,
    borderRadius: 20,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20
  },
  videoPlaceholder: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  videoName: {
    fontSize: 14,
    color: '#111827'
  },
  videoSize: {
    fontSize: 12,
    color: '#6B7280'
  },
  removeVideoBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  storageCard: {
    backgroundColor: '#F5F3FF',
    padding: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#DDD6FE'
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  storageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  storageTitle: {
    fontSize: 13,
    color: '#6D28D9',
    textTransform: 'uppercase'
  },
  storageValue: {
    fontSize: 12,
    color: '#111827'
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E9D5FF',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8B5CF6'
  },
  storageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10
  },
  storageFooterText: {
    fontSize: 10,
    color: '#6B7280'
  },
  footer: {
    flexDirection: 'row',
    padding: 25,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  cancelBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 15,
    backgroundColor: '#F3F4F6'
  },
  cancelBtnText: {
    fontSize: 14,
    color: '#4B5563'
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
    gap: 10,
    paddingVertical: 15
  },
  submitBtnText: {
    color: 'white',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  textRed: { color: '#F43F5E' },
  bgRed: { backgroundColor: '#F43F5E' }
})
