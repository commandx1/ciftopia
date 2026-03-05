import React,{ useEffect,useState,useCallback } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
  Alert,
  Modal,
  FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler'
import { Text } from '../../../components/ui/Text'
import { useAuth } from '../../../context/AuthContext'
import { galleryApi,Album,GalleryPhoto } from '../../../api/gallery'
import { useToast } from '../../../components/ui/ToastProvider'
import { ArrowLeft,Calendar,Clock,Images,Pen,Plus,Heart,Trash2,X } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useLocalSearchParams,useRouter } from 'expo-router'
import ImageUploadModal from '../../../components/gallery/ImageUploadModal'

const { width,height } = Dimensions.get('window')
const COLUMN_WIDTH = (width - 60) / 2

export default function AlbumDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { user,updateUser } = useAuth()
  const { show: showToast } = useToast()

  const [loading,setLoading] = useState(true)
  const [refreshing,setRefreshing] = useState(false)
  const [album,setAlbum] = useState<Album | null>(null)
  const [photos,setPhotos] = useState<GalleryPhoto[]>([])
  const [selectedPhotoIndex,setSelectedPhotoIndex] = useState<number | null>(null)
  const [isUploadModalOpen,setIsUploadModalOpen] = useState(false)

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true)
    try {
      const [albumRes,photosRes] = await Promise.all([
        galleryApi.getAlbum(id as string,user?.accessToken),
        galleryApi.getAlbumPhotos(id as string,user?.accessToken),
      ])
      setAlbum(albumRes)
      setPhotos(photosRes)
    } catch (err) {
      console.error(err)
      showToast({ type: 'error',title: 'Hata',message: 'Albüm detayları yüklenemedi.' })
      router.back()
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  },[id,user])

  useEffect(() => {
    fetchData()
  },[fetchData])

  const onRefresh = () => {
    setRefreshing(true)
    fetchData(true)
  }

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert(
      'Fotoğrafı Sil',
      'Bu fotoğrafı silmek istediğinizden emin misiniz?',
      [
        { text: 'Vazgeç',style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await galleryApi.deletePhoto(photoId,user?.accessToken)
              setPhotos(prev => prev.filter(p => p._id !== photoId))
              showToast({ type: 'success',title: 'Başarılı',message: 'Fotoğraf silindi.' })

              if (res.storageUsed !== undefined) {
                updateUser({
                  coupleId: {
                    ...user.coupleId,
                    storageUsed: res.storageUsed,
                    storageLimit: res.storageLimit
                  }
                })
              }
            } catch (err) {
              showToast({ type: 'error',title: 'Hata',message: 'Fotoğraf silinemedi.' })
            }
          },
        },
      ]
    )
  }

  const handleDeleteAlbum = () => {
    Alert.alert(
      'Albümü Sil',
      `"${album?.title}" albümünü ve içindeki tüm fotoğrafları silmek istediğinizden emin misiniz?`,
      [
        { text: 'Vazgeç',style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await galleryApi.deleteAlbum(id as string,user?.accessToken)
              showToast({ type: 'success',title: 'Başarılı',message: 'Albüm silindi.' })

              if (res.storageUsed !== undefined) {
                updateUser({
                  coupleId: {
                    ...user.coupleId,
                    storageUsed: res.storageUsed,
                    storageLimit: res.storageLimit
                  }
                })
              }

              router.back()
            } catch (err) {
              showToast({ type: 'error',title: 'Hata',message: 'Albüm silinemedi.' })
            }
          },
        },
      ]
    )
  }

  const getUserAvatar = (partner?: any) => {
    if (partner?.avatar?.url) {
      return { uri: partner.avatar.url }
    }
    return partner?.gender === 'female'
      ? require('../../../assets/woman-pp.png')
      : require('../../../assets/man-pp.png')
  }

  if (loading && !album) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E63" />
      </View>
    )
  }

  if (!album) return null

  const handleGesture = (event: any) => {
    // Sola kaydırınca (finger moves left, translationX is negative)
    // Veya sağa kaydırınca (finger moves right, standard back, translationX is positive)
    // Kullanıcının "sola kaydırınca" ifadesine göre her iki yönü de destekleyebiliriz 
    // veya sadece sola (negatif X) hareketini algılayabiliriz.
    const { translationX, translationY } = event.nativeEvent;
    
    // Yatay hareket dikeyden çok daha fazlaysa ve belli bir eşiği geçtiyse
    if (Math.abs(translationX) > 120 && Math.abs(translationY) < 60) {
      router.navigate('/gallery');
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler onGestureEvent={handleGesture} activeOffsetX={[-20, 20]}>
        <SafeAreaView style={styles.container}>
          <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E91E63']} />}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.navigate('/gallery')} style={styles.backBtn}>
            <ArrowLeft size={20} color="#6B7280" />
            <Text style={styles.backBtnText}>Galeriye Dön</Text>
          </TouchableOpacity>

          {/* Album Header */}
          <View style={styles.headerCard}>
            <LinearGradient
              colors={['#FFF1F2','#FDF2F8','#F5F3FF']}
              style={styles.headerGradient}
            >
              <View style={styles.headerMain}>
                <View style={styles.iconBox}>
                  <Heart size={32} color="white" fill="white" />
                </View>
                <View style={styles.headerTextInfo}>
                  <Text style={styles.albumTitle}>{album.title}</Text>
                  <View style={styles.headerMeta}>
                    <View style={styles.metaItem}>
                      <Calendar size={14} color="#F43F5E" />
                      <Text style={styles.metaText}>
                        {new Date(album.date).toLocaleDateString('tr-TR',{
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                    <View style={styles.metaDivider} />
                    <View style={styles.metaItem}>
                      <Clock size={14} color="#A855F7" />
                      <Text style={styles.metaText}>
                        {formatDistanceToNow(new Date(album.createdAt),{ addSuffix: true,locale: tr })}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text style={styles.description}>
                &quot;{album.description || 'Bu albüm için henüz bir açıklama girilmemiş.'}&quot;
              </Text>

              <View style={styles.headerFooter}>
                <View style={styles.countBadge}>
                  <Images size={16} color="#F43F5E" />
                  <Text style={styles.countText}>{photos.length} fotoğraf</Text>
                </View>
                <View style={styles.authorsBox}>
                  <View style={styles.avatarRow}>
                    {[album.coupleId?.partner1,album.coupleId?.partner2].filter(Boolean).map((partner,i) => (
                      <View key={i} style={[styles.avatarBox,i > 0 && { marginLeft: -10 }]}>
                        <Image source={getUserAvatar(partner)} style={styles.avatar} />
                      </View>
                    ))}
                  </View>
                  <Text style={styles.authorsNames}>
                    {album.coupleId?.partner1?.firstName} & {album.coupleId?.partner2?.firstName}
                  </Text>
                </View>
              </View>

              <View style={styles.headerActions}>
                {album.authorId._id === user?._id && (
                  <TouchableOpacity onPress={handleDeleteAlbum} style={styles.deleteAlbumBtn}>
                    <Trash2 size={18} color="white" />
                    <Text style={styles.deleteAlbumBtnText}>Albümü Sil</Text>
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>
          </View>

          {/* Photos Grid */}
          <View style={styles.photosSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fotoğraflar</Text>
              <TouchableOpacity
                onPress={() => setIsUploadModalOpen(true)}
                style={styles.addPhotoBtn}
              >
                <Plus size={20} color="white" />
                <Text style={styles.addPhotoBtnText}>Ekle</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.photoGrid}>
              {photos.map((photo,index) => (
                <TouchableOpacity
                  key={photo._id}
                  onPress={() => setSelectedPhotoIndex(index)}
                  style={styles.photoCard}
                >
                  <Image
                    source={{ uri: photo.photo.url }}
                    style={[styles.gridPhoto,{ height: photo.photo.height ? (COLUMN_WIDTH * photo.photo.height) / photo.photo.width : COLUMN_WIDTH }]}
                  />
                  <View style={styles.photoOverlay}>
                    <View style={styles.photoOverlayContent}>
                      <Text style={styles.photoCaption} numberOfLines={1}>
                        {photo.caption || '❤️'}
                      </Text>
                      <View style={styles.photoMetaRow}>
                        <View style={styles.photoTime}>
                          <Clock size={10} color="rgba(255,255,255,0.8)" />
                          <Text style={styles.photoTimeText}>
                            {formatDistanceToNow(new Date(photo.createdAt),{ addSuffix: true,locale: tr })}
                          </Text>
                        </View>
                        {photo.authorId._id === user?._id && (
                          <TouchableOpacity onPress={() => handleDeletePhoto(photo._id)} style={styles.deletePhotoBtn}>
                            <Trash2 size={14} color="white" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Fullscreen Lightbox */}
        {selectedPhotoIndex !== null && (
          <Modal visible={true} transparent animationType="fade">
            <View style={styles.lightboxOverlay}>
              <TouchableOpacity
                style={styles.lightboxClose}
                onPress={() => setSelectedPhotoIndex(null)}
              >
                <X size={32} color="white" />
              </TouchableOpacity>

            <FlatList
              data={photos}
              renderItem={({ item: p }) => (
                <View style={styles.lightboxSlide}>
                  <Image
                    source={{ uri: p.photo.url }}
                    style={styles.lightboxImage}
                    resizeMode="contain"
                  />
                  <View style={styles.lightboxFooter}>
                    <Text style={styles.lightboxCaption}>{p.caption || 'Hatıralar ölümsüzdür... ❤️'}</Text>
                    <View style={styles.lightboxMeta}>
                      <Calendar size={14} color="#FDA4AF" />
                      <Text style={styles.lightboxMetaText}>
                        {formatDistanceToNow(new Date(p.createdAt),{ addSuffix: true,locale: tr })}
                      </Text>
                      <View style={styles.lightboxMetaDivider} />
                      <Pen size={14} color="#C4B5FD" />
                      <Text style={styles.lightboxMetaText}>{p.authorId.firstName} tarafından yüklendi</Text>
                    </View>
                  </View>
                </View>
              )}
              keyExtractor={(p) => p._id}
              horizontal
              pagingEnabled
              initialScrollIndex={selectedPhotoIndex}
              getItemLayout={(_: any,index: number) => ({ length: width,offset: width * index,index })}
              showsHorizontalScrollIndicator={false}
            />
            </View>
          </Modal>
        )}

        <ImageUploadModal
          visible={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => fetchData(false)}
          initialAlbumId={id as string}
        />
      </SafeAreaView>
    </PanGestureHandler>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  backBtnText: {
    fontSize: 14,
    color: '#6B7280',
  },
  headerCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0,height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  headerGradient: {
    padding: 25,
  },
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  iconBox: {
    width: 64,
    height: 64,
    backgroundColor: '#F43F5E',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '6deg' }],
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0,height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTextInfo: {
    flex: 1,
  },
  albumTitle: {
    fontSize: 28,
    color: '#111827',
    marginBottom: 5,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 25,
  },
  headerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  countText: {
    fontSize: 13,
    color: '#1F2937',
  },
  authorsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  authorsNames: {
    fontSize: 12,
    color: '#374151',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  shareBtnText: {
    fontSize: 14,
    color: '#4B5563',
  },
  deleteAlbumBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E91E63',
    paddingVertical: 14,
    borderRadius: 18,
  },
  deleteAlbumBtnText: {
    fontSize: 14,
    color: 'white',
  },
  photosSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#111827',
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addPhotoBtnText: {
    fontSize: 13,
    color: 'white',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoCard: {
    width: COLUMN_WIDTH,
    backgroundColor: 'white',
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  gridPhoto: {
    width: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  photoOverlayContent: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  photoCaption: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5,
  },
  photoMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  photoTimeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
  },
  deletePhotoBtn: {
    padding: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'black',
  },
  lightboxClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
    padding: 10,
  },
  lightboxSlide: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImage: {
    width: width,
    height: height * 0.7,
  },
  lightboxFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 30,
    paddingBottom: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  lightboxCaption: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 15,
  },
  lightboxMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  lightboxMetaText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  lightboxMetaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
})
