import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/ui/Text';
import { useAuth } from '../../context/AuthContext';
import { galleryApi, Album, GalleryPhoto } from '../../api/gallery';
import { useToast } from '../../components/ui/ToastProvider';
import { Plus, Folder, Grip, Images, ArrowUpRight, Camera } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import ImageUploadModal from '../../components/gallery/ImageUploadModal';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 60) / 2;

export default function GalleryScreen() {
  const { user, updateUser } = useAuth();
  const { show: showToast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewToggle] = useState<'album' | 'grid'>('album');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [allPhotos, setAllPhotos] = useState<GalleryPhoto[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [albumsRes, photosRes] = await Promise.all([
        galleryApi.getAlbums(user?.accessToken),
        galleryApi.getAllPhotos(user?.accessToken),
      ]);
      setAlbums(albumsRes.albums);
      setAllPhotos(photosRes.photos);
      
      // Update global storage used/limit only if they changed
      if (albumsRes.storageUsed !== undefined && 
          (albumsRes.storageUsed !== user?.coupleId?.storageUsed || 
           albumsRes.storageLimit !== user?.coupleId?.storageLimit)) {
        updateUser({ 
          coupleId: { 
            storageUsed: albumsRes.storageUsed,
            storageLimit: albumsRes.storageLimit
          } 
        });
      }
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Hata', message: 'Galeri yüklenirken bir hata oluştu.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.accessToken]); // Fixed infinite loop by only depending on accessToken

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const getUserAvatar = (partner?: any) => {
    if (partner?.avatar?.url) {
      return { uri: partner.avatar.url };
    }
    return partner?.gender === 'female'
      ? require('../../assets/woman-pp.png')
      : require('../../assets/man-pp.png');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E91E63']} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <Camera size={32} color="white" />
              </View>
              <View>
                <Text style={styles.mainTitle}>Galerimiz</Text>
                <Text style={styles.subtitle}>En güzel anlar...</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setIsUploadModalOpen(true)}
              style={styles.addBtn}
            >
              <LinearGradient
                colors={['#E91E63', '#FF6B6B']}
                style={styles.addGradient}
              >
                <Plus size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.viewToggleContainer}>
            <View style={styles.viewToggleInner}>
              <TouchableOpacity
                onPress={() => setViewToggle('album')}
                style={[styles.toggleBtn, viewMode === 'album' && styles.toggleBtnActive]}
              >
                <Folder size={18} color={viewMode === 'album' ? 'white' : '#6B7280'} />
                <Text style={[styles.toggleText, viewMode === 'album' && styles.toggleTextActive]}>Albümler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewToggle('grid')}
                style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
              >
                <Grip size={18} color={viewMode === 'grid' ? 'white' : '#6B7280'} />
                <Text style={[styles.toggleText, viewMode === 'grid' && styles.toggleTextActive]}>Izgara</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E91E63" />
            <Text style={styles.loadingText}>Galeriniz hazırlanıyor...</Text>
          </View>
        ) : viewMode === 'album' ? (
          <View style={styles.albumGrid}>
            {albums.length > 0 ? (
              albums.map((album) => (
                <TouchableOpacity
                  key={album._id}
                  onPress={() => router.push({
                    pathname: '/gallery/[id]',
                    params: { id: album._id }
                  })}
                  style={styles.albumCard}
                >
                  <View style={styles.albumCover}>
                    {album.coverPhoto ? (
                      <Image source={{ uri: album.coverPhoto.url }} style={styles.coverImage} />
                    ) : (
                      <View style={styles.noCover}>
                        <Images size={48} color="#D1D5DB" />
                      </View>
                    )}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.coverGradient}
                    />
                    <View style={styles.albumMeta}>
                      <Text style={styles.albumTitle}>{album.title}</Text>
                      <View style={styles.albumStats}>
                        <View style={styles.statItem}>
                          <Images size={12} color="rgba(255,255,255,0.9)" />
                          <Text style={styles.statText}>{album.photoCount} fotoğraf</Text>
                        </View>
                        <Text style={styles.statText}>
                          {formatDistanceToNow(new Date(album.date), { addSuffix: true, locale: tr })}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.albumFooter}>
                    <Text style={styles.albumDesc} numberOfLines={2}>
                      {album.description || 'Bu albüm için açıklama girilmemiş.'}
                    </Text>
                    <View style={styles.albumAuthors}>
                      <View style={styles.avatarRow}>
                        {[album.coupleId?.partner1, album.coupleId?.partner2].filter(Boolean).map((partner, i) => (
                          <View key={i} style={[styles.avatarBox, i > 0 && { marginLeft: -10 }]}>
                            <Image source={getUserAvatar(partner)} style={styles.avatar} />
                          </View>
                        ))}
                      </View>
                      <View style={styles.arrowIcon}>
                        <ArrowUpRight size={16} color="#E91E63" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIconBox, { backgroundColor: '#FFF1F2' }]}>
                  <Folder size={48} color="#E91E63" />
                </View>
                <Text style={styles.emptyTitle}>Henüz Albüm Yok</Text>
                <Text style={styles.emptySubtitle}>Anılarınızı düzenlemek için ilk albümünüzü oluşturun!</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.photoGrid}>
            {allPhotos.length > 0 ? (
              allPhotos.map((photo) => (
                <View key={photo._id} style={styles.photoCard}>
                  <Image
                    source={{ uri: photo.photo.url }}
                    style={[styles.gridPhoto, { height: photo.photo.height ? (COLUMN_WIDTH * photo.photo.height) / photo.photo.width : COLUMN_WIDTH }]}
                  />
                  <View style={styles.photoInfo}>
                    <Text style={styles.caption} numberOfLines={1}>{photo.caption || '❤️'}</Text>
                    <View style={styles.photoMetaRow}>
                      <Text style={styles.photoDate}>{new Date(photo.createdAt).toLocaleDateString('tr-TR')}</Text>
                      <View style={styles.photoAuthor}>
                        <Text style={styles.authorName}>{photo.authorId.firstName}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIconBox, { backgroundColor: '#EEF2FF' }]}>
                  <Camera size={48} color="#4F46E5" />
                </View>
                <Text style={styles.emptyTitle}>Fotoğraf Yok</Text>
                <Text style={styles.emptySubtitle}>Henüz hiçbir fotoğraf yüklememişsiniz.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <ImageUploadModal
        visible={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => fetchData(false)}
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconBox: {
    width: 56,
    height: 56,
    backgroundColor: '#9333EA',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '3deg' }],
    shadowColor: '#9333EA',
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
    shadowColor: '#E91E63',
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
  viewToggleContainer: {
    alignItems: 'center',
  },
  viewToggleInner: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
  },
  toggleBtnActive: {
    backgroundColor: '#E91E63',
  },
  toggleText: {
    fontSize: 13,
    color: '#6B7280',
  },
  toggleTextActive: {
    color: 'white',
  },
  albumGrid: {
    padding: 20,
    gap: 20,
  },
  albumCard: {
    backgroundColor: 'white',
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 3,
  },
  albumCover: {
    height: 220,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noCover: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  albumMeta: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  albumTitle: {
    fontSize: 24,
    color: 'white',
    marginBottom: 5,
  },
  albumStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  albumFooter: {
    padding: 20,
  },
  albumDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 15,
  },
  albumAuthors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  arrowIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#FFF1F2',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoGrid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoCard: {
    width: COLUMN_WIDTH,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  gridPhoto: {
    width: '100%',
    resizeMode: 'cover',
  },
  photoInfo: {
    padding: 12,
  },
  caption: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  photoMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoDate: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  photoAuthor: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  authorName: {
    fontSize: 9,
    color: '#6B7280',
  },
  loadingContainer: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    transform: [{ rotate: '-6deg' }],
  },
  emptyTitle: {
    fontSize: 22,
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
