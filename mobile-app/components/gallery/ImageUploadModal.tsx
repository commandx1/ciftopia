import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { Text } from '../ui/Text';
import { TextInput } from '../ui/TextInput';
import {
  X,
  CloudUpload,
  CheckCircle,
  Database,
  Trash2,
  Info,
  Folder,
  MessageSquare,
  Layers,
  Camera,
  Plus,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { galleryApi, Album } from '../../api/gallery';
import { uploadApi } from '../../api/upload';
import { useAuth } from '../../context/AuthContext';
import { usePlanLimits } from '../../context/PlanLimitsContext';
import { useRouter } from 'expo-router';
import { useToast } from '../ui/ToastProvider';
import { getEffectivePhotoLimit } from '../../utils/planLimits';
import { CustomModal } from '../ui/Modal';
import { PlanUpgradeBlock } from '../ui/PlanUpgradeBlock';

const { width } = Dimensions.get('window');

const formatBytes = (bytes: number) => {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface ImageUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialAlbumId?: string;
}

export default function ImageUploadModal({ visible, onClose, onSuccess, initialAlbumId }: ImageUploadModalProps) {
  const { user, updateUser } = useAuth();
  const { limits, storageUsed: ctxStorageUsed, storageLimit: ctxStorageLimit, refreshPlanLimits } = usePlanLimits();
  const { show: showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(initialAlbumId || '');
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const maxPhotosPerAlbum = getEffectivePhotoLimit(limits.photosPerAlbum, 10);
  const selectedAlbum = albums.find((a) => a._id === selectedAlbumId);
  const currentAlbumPhotoCount = selectedAlbum?.photoCount ?? 0;
  /** Bu yüklemede seçilebilecek maksimum fotoğraf (seçilen albümün kalan kapasitesi veya yeni albümde plan limiti) */
  const remainingSlotsInAlbum = isCreatingAlbum
    ? maxPhotosPerAlbum
    : Math.max(0, maxPhotosPerAlbum - currentAlbumPhotoCount);
  const atPhotoLimit = remainingSlotsInAlbum <= 0 || selectedImages.length >= remainingSlotsInAlbum;

  const handleUpgradePress = () => {
    onClose();
    router.push('/store');
  };

  const currentStorageUsed = ctxStorageUsed;
  const storageLimit = ctxStorageLimit;

  const currentNewPhotosSize = useMemo(() => {
    return selectedImages.reduce((acc, img) => acc + (Number((img as any).fileSize || (img as any).size || 0)), 0);
  }, [selectedImages]);

  const projectedUsage = currentStorageUsed + currentNewPhotosSize;
  const usagePercentage = storageLimit > 0 ? (Math.min(projectedUsage, storageLimit) / storageLimit) * 100 : 0;
  const isOverLimit = storageLimit > 0 && projectedUsage > storageLimit;

  const fetchAlbums = useCallback(async () => {
    try {
      const res = await galleryApi.getAlbums(user?.accessToken);
      setAlbums(res.albums);
      
      // Update global storage only if changed
      if (res.storageUsed !== undefined && 
          (res.storageUsed !== user?.coupleId?.storageUsed || 
           res.storageLimit !== user?.coupleId?.storageLimit)) {
        updateUser({ 
          coupleId: { 
            storageUsed: res.storageUsed,
            storageLimit: res.storageLimit
          } 
        });
      }
    } catch (err) {
      console.error('Albümler yüklenirken hata:', err);
    }
  }, [user?.accessToken]); // Depend only on accessToken to avoid loops

  useEffect(() => {
    if (visible) {
      fetchAlbums();
      setSelectedAlbumId(initialAlbumId || '');
      setIsCreatingAlbum(false);
      setNewAlbumTitle('');
      setCaption('');
      setSelectedImages([]);
      setPreviewUrls([]);
    }
  }, [visible, fetchAlbums, initialAlbumId]);

  const pickImages = async () => {
    const slotsForThisBatch = Math.min(remainingSlotsInAlbum - selectedImages.length, maxPhotosPerAlbum);
    if (slotsForThisBatch <= 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: slotsForThisBatch,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets;
      
      const newImagesSize = newImages.reduce((acc, img) => acc + (Number((img as any).fileSize || (img as any).size || 0)), 0);
      if (storageLimit > 0 && projectedUsage + newImagesSize > storageLimit) {
        showToast({ type: 'error', title: 'Limit Aşıldı', message: 'Depolama alanınız yetersiz.' });
        return;
      }

      setSelectedImages(prev => [...prev, ...newImages]);
      setPreviewUrls(prev => [...prev, ...newImages.map(img => img.uri)]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
    setPreviewUrls(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (isOverLimit) {
      showToast({ type: 'error', title: 'Limit Aşıldı', message: 'Depolama limitini aşıyorsunuz!' });
      return;
    }

    if (selectedImages.length === 0) {
      showToast({ type: 'error', title: 'Hata', message: 'Lütfen en az bir fotoğraf seçin.' });
      return;
    }

    if (!selectedAlbumId && !isCreatingAlbum) {
      showToast({ type: 'error', title: 'Hata', message: 'Lütfen bir albüm seçin veya yeni bir albüm oluşturun.' });
      return;
    }

    if (isCreatingAlbum && !newAlbumTitle.trim()) {
      showToast({ type: 'error', title: 'Hata', message: 'Lütfen yeni albüm adını girin.' });
      return;
    }

    setLoading(true);

    try {
      let albumId = selectedAlbumId;

      if (isCreatingAlbum && newAlbumTitle.trim()) {
        const albumRes = await galleryApi.createAlbum({ title: newAlbumTitle.trim() }, user?.accessToken);
        albumId = albumRes._id;
      }

      const uploadRes = await uploadApi.uploadPhotos(selectedImages, user?.accessToken);
      const photoMetadatas = uploadRes.photos.map((p: any) => ({
        url: p.key,
        width: p.width,
        height: p.height,
        size: p.size
      }));

      const res = await galleryApi.uploadPhotos({
        albumId,
        photos: photoMetadatas,
        caption: caption.trim()
      }, user?.accessToken);

      if (res.storageUsed !== undefined) {
        updateUser({
          coupleId: {
            storageUsed: res.storageUsed,
            storageLimit: res.storageLimit || user?.coupleId?.storageLimit,
          },
        });
      }
      refreshPlanLimits();

      showToast({ type: 'success', title: 'Başarılı', message: 'Fotoğraflar başarıyla yüklendi! 📸' });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Hata', message: 'Fotoğraflar yüklenirken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Fotoğraf Yükle"
      headerIcon={<Camera size={28} color="white" />}
      headerColors={['#9333EA', '#4F46E5']}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Album Selection */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Folder size={18} color="#9333EA" />
            <Text style={styles.label}>Albüm Seçin</Text>
          </View>
          
          <View style={styles.albumOptions}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.albumScroll}>
              <TouchableOpacity
                onPress={() => {
                  setIsCreatingAlbum(false);
                  setSelectedAlbumId('');
                }}
                style={[styles.albumBtn, !selectedAlbumId && !isCreatingAlbum && styles.albumBtnActive]}
              >
                <Text style={[styles.albumBtnText, !selectedAlbumId && !isCreatingAlbum && styles.albumBtnTextActive]}>Seçilmedi</Text>
              </TouchableOpacity>
              {albums.map((album) => (
                <TouchableOpacity
                  key={album._id}
                  onPress={() => {
                    setIsCreatingAlbum(false);
                    setSelectedAlbumId(album._id);
                  }}
                  style={[styles.albumBtn, selectedAlbumId === album._id && styles.albumBtnActive]}
                >
                  <Text style={[styles.albumBtnText, selectedAlbumId === album._id && styles.albumBtnTextActive]}>{album.title}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => {
                  setIsCreatingAlbum(true);
                  setSelectedAlbumId('');
                }}
                style={[styles.albumBtn, isCreatingAlbum && styles.albumBtnActive, styles.newAlbumBtn]}
              >
                <Plus size={14} color={isCreatingAlbum ? 'white' : '#9333EA'} />
                <Text style={[styles.albumBtnText, isCreatingAlbum && styles.albumBtnTextActive, { color: isCreatingAlbum ? 'white' : '#9333EA' }]}>Yeni Albüm</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {isCreatingAlbum && (
            <View style={styles.newAlbumInputWrapper}>
              <TextInput
                placeholder="Yeni albüm adı girin..."
                value={newAlbumTitle}
                onChangeText={setNewAlbumTitle}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          )}
        </View>

        {/* Upload Area */}
        <TouchableOpacity
          onPress={pickImages}
          style={[styles.uploadArea, atPhotoLimit && styles.uploadAreaDisabled]}
          activeOpacity={atPhotoLimit ? 1 : 0.8}
          disabled={atPhotoLimit}
        >
          <LinearGradient
            colors={atPhotoLimit ? ['#F3F4F6', '#E5E7EB'] : ['#F5F3FF', '#EEF2FF']}
            style={styles.uploadGradient}
          >
            <View style={[styles.uploadIconCircle, atPhotoLimit && styles.uploadIconCircleDisabled]}>
              <CloudUpload size={40} color={atPhotoLimit ? '#9CA3AF' : 'white'} />
            </View>
            <Text style={[styles.uploadTitle, atPhotoLimit && styles.uploadTitleDisabled]}>
              {atPhotoLimit ? 'Limite ulaştınız' : 'Fotoğraf Seçin'}
            </Text>
            <View style={styles.uploadInfoRow}>
              <Info size={16} color={atPhotoLimit ? '#9CA3AF' : '#9333EA'} />
              <Text style={[styles.uploadInfoText, atPhotoLimit && styles.uploadInfoTextDisabled]}>
                {remainingSlotsInAlbum <= 0
                  ? 'Bu albüm plan limitine ulaştı'
                  : `Bu yüklemede en fazla ${remainingSlotsInAlbum} fotoğraf, 5MB/adet`}
              </Text>
            </View>
            <View style={styles.uploadBadgeRow}>
              <View style={styles.uploadBadge}>
                <CheckCircle size={14} color="#10B981" />
                <Text style={styles.uploadBadgeText}>JPG, PNG, WEBP</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Preview Grid */}
        {previewUrls.length > 0 && (
          <View style={styles.section}>
            <View style={styles.previewHeader}>
              <Text style={styles.label}>
                Seçilenler ({previewUrls.length}/{remainingSlotsInAlbum})
              </Text>
              <TouchableOpacity onPress={() => { setSelectedImages([]); setPreviewUrls([]); }} style={styles.clearAllBtn}>
                <Trash2 size={14} color="#EF4444" />
                <Text style={styles.clearAllText}>Tümünü Sil</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.previewGrid}>
              {previewUrls.map((url, index) => (
                <View key={index} style={styles.previewItem}>
                  <Image source={{ uri: url }} style={styles.previewImage} />
                  <TouchableOpacity onPress={() => removeImage(index)} style={styles.removePreviewBtn}>
                    <X size={12} color="white" />
                  </TouchableOpacity>
                  <View style={styles.readyBadge}>
                    <CheckCircle size={10} color="white" />
                    <Text style={styles.readyBadgeText}>HAZIR</Text>
                  </View>
                </View>
              ))}
              {previewUrls.length < remainingSlotsInAlbum && (
                <TouchableOpacity onPress={pickImages} style={styles.addMoreBtn}>
                  <Plus size={24} color="#9333EA" />
                  <Text style={styles.addMoreText}>Daha Ekle</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {atPhotoLimit && remainingSlotsInAlbum <= 0 && (
          <PlanUpgradeBlock
            variant="photos_per_album"
            limit={maxPhotosPerAlbum}
            onUpgradePress={handleUpgradePress}
          />
        )}

        {/* Caption */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <MessageSquare size={18} color="#9333EA" />
            <Text style={styles.label}>Açıklama (Opsiyonel)</Text>
          </View>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Fotoğraflarınız için ortak bir açıklama yazın..."
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea]}
            placeholderTextColor="#9CA3AF"
          />
          <View style={styles.captionHint}>
            <Layers size={16} color="#9333EA" />
            <Text style={styles.captionHintText}>Açıklama, yüklediğiniz tüm fotoğraflara eklenecektir.</Text>
          </View>
        </View>

        {/* Storage Progress */}
        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <View style={styles.storageTextGroup}>
              <Text style={styles.storageTitle}>Depolama Durumu</Text>
              <View style={styles.storageValueRow}>
                <Text style={styles.storageValue}>{formatBytes(projectedUsage)}</Text>
                {currentNewPhotosSize > 0 && (
                  <Text style={styles.storageNewText}>(+{formatBytes(currentNewPhotosSize)} yeni)</Text>
                )}
              </View>
            </View>
            <View style={styles.dbIconBox}>
              <Database size={24} color="#4F46E5" />
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>{formatBytes(projectedUsage)} / {formatBytes(storageLimit)}</Text>
              <Text style={[styles.progressPercentage, isOverLimit && styles.textRed]}>%{usagePercentage.toFixed(1)}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${usagePercentage}%` }, isOverLimit && styles.bgRed]} />
            </View>
          </View>

          {isOverLimit && (
            <View style={styles.limitWarning}>
              <Info size={14} color="#EF4444" />
              <Text style={styles.warningText}>⚠️ Depolama limitini aşıyorsunuz! Lütfen bazı fotoğrafları çıkarın.</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>İptal</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleSubmit} 
          disabled={loading || isOverLimit || selectedImages.length === 0 || (!selectedAlbumId && !isCreatingAlbum)} 
          style={styles.submitBtn}
        >
          <LinearGradient
            colors={['#9333EA', '#4F46E5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <CloudUpload size={20} color="white" />
                <Text style={styles.submitBtnText}>Fotoğrafları Yükle</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 25,
  },
  section: {
    marginBottom: 25,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#374151',
  },
  albumScroll: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  albumOptions: {
    marginBottom: 5,
  },
  albumBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    marginRight: 10,
  },
  albumBtnActive: {
    backgroundColor: '#9333EA',
    borderColor: '#9333EA',
  },
  albumBtnText: {
    fontSize: 13,
    color: '#6B7280',
  },
  albumBtnTextActive: {
    color: 'white',
  },
  newAlbumBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderStyle: 'dashed',
    borderColor: '#9333EA',
  },
  newAlbumInputWrapper: {
    marginTop: 5,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 15,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    fontSize: 15,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  uploadArea: {
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 25,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#DDD6FE',
  },
  uploadAreaDisabled: {
    borderColor: '#E5E7EB',
    opacity: 0.9,
  },
  uploadGradient: {
    padding: 30,
    alignItems: 'center',
  },
  uploadIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  uploadIconCircleDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  uploadTitle: {
    fontSize: 20,
    color: '#111827',
    marginBottom: 10,
  },
  uploadTitleDisabled: {
    color: '#6B7280',
  },
  uploadInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 15,
  },
  uploadInfoText: {
    fontSize: 13,
    color: '#6B7280',
  },
  uploadInfoTextDisabled: {
    color: '#9CA3AF',
  },
  uploadBadgeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  uploadBadgeText: {
    fontSize: 11,
    color: '#10B981',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearAllText: {
    fontSize: 12,
    color: '#EF4444',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  previewItem: {
    width: (width - 80) / 3,
    aspectRatio: 1,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removePreviewBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  readyBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  readyBadgeText: {
    color: 'white',
    fontSize: 8,
  },
  addMoreBtn: {
    width: (width - 80) / 3,
    aspectRatio: 1,
    borderRadius: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#DDD6FE',
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  addMoreText: {
    fontSize: 10,
    color: '#9333EA',
  },
  captionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F5F3FF',
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
  },
  captionHintText: {
    fontSize: 13,
    color: '#6D28D9',
    flex: 1,
  },
  storageCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 25,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  storageTextGroup: {
    gap: 4,
  },
  storageTitle: {
    fontSize: 14,
    color: '#1E40AF',
  },
  storageValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  storageValue: {
    fontSize: 20,
    color: '#111827',
  },
  storageNewText: {
    fontSize: 12,
    color: '#3B82F6',
  },
  dbIconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  progressPercentage: {
    fontSize: 11,
    color: '#2563EB',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#DBEAFE',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 12,
  },
  warningText: {
    fontSize: 11,
    color: '#EF4444',
    flex: 1,
  },
  textRed: { color: '#EF4444' },
  bgRed: { backgroundColor: '#EF4444' },
  footer: {
    flexDirection: 'row',
    padding: 25,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  cancelBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelBtnText: {
    fontSize: 15,
    color: '#4B5563',
  },
  submitBtn: {
    flex: 2,
    borderRadius: 18,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  submitBtnText: {
    color: 'white',
    fontSize: 15,
  },
});
