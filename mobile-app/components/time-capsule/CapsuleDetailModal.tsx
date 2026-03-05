import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Text } from '../ui/Text';
import { X, Lock, LockOpen, Clock, Send, Trash2, Heart, MessageSquare } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import { TimeCapsule, timeCapsuleApi } from '../../api/timeCapsule';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { TextInput } from '../ui/TextInput';

interface CapsuleDetailModalProps {
  capsule: TimeCapsule | null;
  visible: boolean;
  onClose: () => void;
  onUpdate: (updated: TimeCapsule) => void;
  onDelete: (id: string) => void;
}

export default function CapsuleDetailModal({ capsule, visible, onClose, onUpdate, onDelete }: CapsuleDetailModalProps) {
  const { user } = useAuth();
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullScreenPhotoUri, setFullScreenPhotoUri] = useState<string | null>(null);

  if (!capsule) return null;

  const now = new Date();
  const unlockDate = new Date(capsule.unlockDate);
  const isLocked = unlockDate > now && !capsule.isOpened;

  const getUserAvatar = (author: any) => {
    if (author?.avatar?.url) {
      return { uri: author.avatar.url };
    }
    return author?.gender === 'female'
      ? require('../../assets/woman-pp.png')
      : require('../../assets/man-pp.png');
  };

  const handleAddReflection = async () => {
    if (!reflection.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updated = await timeCapsuleApi.addReflection(capsule._id, reflection.trim(), user?.accessToken);
      onUpdate(updated);
      setReflection('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <LinearGradient 
            colors={isLocked ? ['#F59E0B', '#D97706'] : ['#8B5CF6', '#6D28D9']} 
            style={styles.header}
          >
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                {isLocked ? <Lock size={24} color="white" /> : <LockOpen size={24} color="white" />}
              </View>
              <View>
                <Text style={styles.headerTitle} numberOfLines={1}>{capsule.title}</Text>
                <Text style={styles.headerSubtitle}>
                  {isLocked ? '🔒 Henüz Mühürlü' : '🔓 Zamanı Geldi!'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Author and Date Card */}
            <View style={styles.metaCard}>
              <View style={styles.metaItem}>
                <View style={styles.authorInfo}>
                  <View style={styles.avatarBox}>
                    <Image source={getUserAvatar(capsule.authorId)} style={styles.avatar} />
                  </View>
                  <View>
                    <Text style={styles.metaLabel}>Gönderen</Text>
                    <Text style={styles.metaValue}>{capsule.authorId.firstName}</Text>
                  </View>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.dateInfo}>
                  <Text style={styles.metaLabel}>Açılma Tarihi</Text>
                  <Text style={styles.metaValue}>
                    {format(unlockDate, 'd MMMM yyyy', { locale: tr })}
                  </Text>
                </View>
              </View>
            </View>

            {isLocked ? (
              <View style={styles.lockedContent}>
                <View style={styles.lockedIconCircle}>
                  <Clock size={40} color="#F59E0B" />
                </View>
                <Text style={styles.lockedTitle}>Sürpriz Hazırlanıyor!</Text>
                <Text style={styles.lockedText}>
                  Bu kapsülün içindeki mesaj ve anılar, {format(unlockDate, 'd MMMM yyyy', { locale: tr })} tarihinde otomatik olarak açılacaktır.
                </Text>
                <View style={styles.countdownBox}>
                  <Text style={styles.countdownText}>
                    Biraz daha sabır, gelecekteki anılarına çok az kaldı... ❤️
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.openContent}>
                <View style={styles.letterContainer}>
                  <View style={styles.letterHeader}>
                    <Heart size={24} color="#F43F5E" fill="#F43F5E" />
                    <Text style={styles.letterDate}>{format(new Date(capsule.createdAt), 'd MMMM yyyy', { locale: tr })}</Text>
                  </View>
                  <Text style={styles.letterContent}>{capsule.content}</Text>
                </View>

                {/* Photos if any */}
                {capsule.photos && capsule.photos.length > 0 && (
                  <View style={styles.photosSection}>
                    <Text style={styles.sectionTitle}>Anılar</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                      {capsule.photos.map((photo, i) => (
                        <TouchableOpacity
                          key={i}
                          onPress={() => setFullScreenPhotoUri(photo.url)}
                          activeOpacity={0.9}
                        >
                          <Image source={{ uri: photo.url }} style={styles.capsulePhoto} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Full-screen photo overlay */}
                <Modal
                  visible={fullScreenPhotoUri != null}
                  transparent
                  animationType="fade"
                  statusBarTranslucent
                  onRequestClose={() => setFullScreenPhotoUri(null)}
                >
                  <TouchableOpacity
                    style={styles.fullScreenPhotoOverlay}
                    activeOpacity={1}
                    onPress={() => setFullScreenPhotoUri(null)}
                  >
                    <TouchableOpacity
                      style={styles.fullScreenPhotoImageWrap}
                      activeOpacity={1}
                      onPress={(e) => e.stopPropagation()}
                    >
                      {fullScreenPhotoUri != null && (
                        <Image
                          source={{ uri: fullScreenPhotoUri }}
                          style={styles.fullScreenPhotoImage}
                          resizeMode="contain"
                        />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.fullScreenPhotoCloseBtn}
                      onPress={() => setFullScreenPhotoUri(null)}
                      hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                    >
                      <X size={28} color="#fff" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Modal>

                {/* Video if any */}
                {capsule.video && (
                  <View style={styles.videoSection}>
                    <Text style={styles.sectionTitle}>Video Mesajı</Text>
                    <View style={styles.videoWrapper}>
                      <Video
                        source={{ uri: capsule.video.url }}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay={false}
                        isLooping={false}
                        style={styles.videoPlayer}
                      />
                    </View>
                  </View>
                )}

                {/* Reflections */}
                <View style={styles.reflectionsSection}>
                  <Text style={styles.sectionTitle}>Neler Hissettiniz?</Text>
                  {capsule.reflections && capsule.reflections.length > 0 ? (
                    capsule.reflections.map((refl, i) => (
                      <View key={i} style={styles.reflectionItem}>
                        <View style={styles.reflAvatarBox}>
                          <Image source={getUserAvatar(refl.authorId)} style={styles.avatar} />
                        </View>
                        <View style={styles.reflContent}>
                          <View style={styles.reflHeader}>
                            <Text style={styles.reflAuthor}>{refl.authorId.firstName}</Text>
                            <Text style={styles.reflTime}>
                              {format(new Date(refl.createdAt), 'HH:mm', { locale: tr })}
                            </Text>
                          </View>
                          <Text style={styles.reflText}>{refl.content}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.noReflections}>
                      <MessageSquare size={32} color="#D1D5DB" />
                      <Text style={styles.noReflectionsText}>Bu anı hakkında ilk düşünceni sen ekle!</Text>
                    </View>
                  )}

                  {/* Add Reflection Input */}
                  <View style={styles.addReflContainer}>
                    <TextInput
                      value={reflection}
                      onChangeText={setReflection}
                      placeholder="Bir şeyler yaz..."
                      style={styles.reflInput}
                      placeholderTextColor="#9CA3AF"
                    />
                    <TouchableOpacity 
                      onPress={handleAddReflection}
                      disabled={!reflection.trim() || isSubmitting}
                      style={[styles.sendBtn, !reflection.trim() && styles.sendBtnDisabled]}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Send size={20} color="white" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Delete Action if author and locked */}
          {capsule.authorId._id === user?._id && isLocked && (
            <TouchableOpacity onPress={() => onDelete(capsule._id)} style={styles.deleteBtn}>
              <Trash2 size={20} color="#EF4444" />
              <Text style={styles.deleteText}>Kapsülü İptal Et</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    paddingTop: 30,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  closeBtn: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  metaCard: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 15,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  dateInfo: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    color: '#111827',
  },
  metaDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  lockedContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  lockedIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockedTitle: {
    fontSize: 22,
    color: '#111827',
    marginBottom: 10,
  },
  lockedText: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  countdownBox: {
    backgroundColor: '#FFFBEB',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  countdownText: {
    fontSize: 13,
    color: '#B45309',
    textAlign: 'center',
  },
  openContent: {},
  letterContainer: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 25,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  letterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  letterDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  letterContent: {
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
  },
  photosSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 15,
    paddingLeft: 5,
  },
  photoScroll: {
    flexDirection: 'row',
  },
  capsulePhoto: {
    width: 150,
    height: 150,
    borderRadius: 20,
    marginRight: 12,
  },
  fullScreenPhotoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenPhotoImageWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  fullScreenPhotoImage: {
    width: '100%',
    height: '100%',
  },
  fullScreenPhotoCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  videoSection: {
    marginBottom: 25,
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'black',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  reflectionsSection: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  reflectionItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },
  reflAvatarBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 2,
  },
  reflContent: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 15,
  },
  reflHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reflAuthor: {
    fontSize: 13,
    color: '#111827',
  },
  reflTime: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  reflText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  noReflections: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 10,
  },
  noReflectionsText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  addReflContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  reflInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
    backgroundColor: '#FEF2F2',
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  deleteText: {
    fontSize: 14,
    color: '#EF4444',
  },
});
