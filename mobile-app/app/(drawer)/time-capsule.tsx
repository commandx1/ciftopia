import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { useAuth } from '../../context/AuthContext';
import { timeCapsuleApi, TimeCapsule } from '../../api/timeCapsule';
import { useToast } from '../../components/ui/ToastProvider';
import { Lock, Plus, PenLine, Calendar, Heart, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TimeCapsuleCard from '../../components/time-capsule/TimeCapsuleCard';
import CreateCapsuleModal from '../../components/time-capsule/CreateCapsuleModal';
import CapsuleDetailModal from '../../components/time-capsule/CapsuleDetailModal';

// HTML doc design tokens (time-capsule.html)
const COLORS = {
  softGray: '#F8F9FA',
  heroGradient: ['#312E81', '#581C87', '#831843'] as const,
  heroIconBg: 'rgba(245, 158, 11, 0.2)',
  heroIconBorder: 'rgba(245, 158, 11, 0.5)',
  heroCta: ['#F59E0B', '#EA580C'] as const,
  introCard: ['#FAF5FF', '#FDF2F8'] as const,
  introBorder: '#E9D5FF',
  introIconBg: '#7C3AED',
  purpleMuted: '#C4B5FD',
  white: '#FFFFFF',
  gray900: '#111827',
  gray700: '#374151',
  gray600: '#4B5563',
  gray500: '#6B7280',
};

export default function TimeCapsuleScreen() {
  const { user } = useAuth();
  const { show: showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'locked' | 'open'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const floatAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setLoading(true);
      try {
        const res = await timeCapsuleApi.getTimeCapsules(user?.accessToken);
        setCapsules(res);
      } catch (err) {
        console.error(err);
        showToast({
          type: 'error',
          title: 'Hata',
          message: 'Zaman kapsülleri yüklenirken bir hata oluştu.',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user, showToast],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const filteredCapsules = useMemo(() => {
    const now = new Date();
    return [...capsules]
      .filter((c) => {
        const isLocked = new Date(c.unlockDate) > now && !c.isOpened;
        if (activeFilter === 'locked') return isLocked;
        if (activeFilter === 'open') return !isLocked;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime(),
      );
  }, [capsules, activeFilter]);

  const handleOpenCapsule = async (id: string) => {
    try {
      const capsule = await timeCapsuleApi.getCapsuleDetail(
        id,
        user?.accessToken,
      );
      setSelectedCapsule(capsule);
      setIsDetailModalOpen(true);
      setCapsules((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isOpened: true } : c)),
      );
    } catch (error: unknown) {
      const ax = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Hata',
        message: ax?.response?.data?.message || 'Kapsül açılamadı.',
      });
    }
  };

  const handleCreateCapsule = async (data: Parameters<typeof timeCapsuleApi.createCapsule>[0]) => {
    try {
      const res = await timeCapsuleApi.createCapsule(data, user?.accessToken);
      setCapsules((prev) => [res, ...prev]);
      showToast({
        type: 'success',
        title: 'Harika!',
        message: 'Yeni bir zaman kapsülü mühürlendi! 🔒',
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Zaman kapsülü oluşturulamadı.',
      });
      throw err;
    }
  };

  const handleDeleteCapsule = async (id: string) => {
    Alert.alert(
      'Kapsülü İptal Et',
      'Bu zaman kapsülünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await timeCapsuleApi.deleteCapsule(id, user?.accessToken);
              setCapsules((prev) => prev.filter((c) => c._id !== id));
              setIsDetailModalOpen(false);
              showToast({
                type: 'success',
                title: 'Başarılı',
                message: 'Zaman kapsülü silindi.',
              });
            } catch (err) {
              showToast({
                type: 'error',
                title: 'Hata',
                message: 'Kapsül silinirken bir hata oluştu.',
              });
            }
          },
        },
      ],
    );
  };

  const showFilterMenu = () => {
    Alert.alert('Filtre', 'Kapsülleri filtrele', [
      { text: 'Tümü', onPress: () => setActiveFilter('all') },
      { text: 'Kilitli', onPress: () => setActiveFilter('locked') },
      { text: 'Açılmış', onPress: () => setActiveFilter('open') },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.introIconBg]}
          />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section - HTML #hero-section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[...COLORS.heroGradient]}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Animated.View
                style={[
                  styles.heroIconWrap,
                  { transform: [{ translateY }] },
                ]}
              >
                <View style={styles.heroIconCircle}>
                  <Lock size={28} color="#FCD34D" />
                </View>
              </Animated.View>
              <Text style={styles.heroTitle}>Zaman Kapsülü 💌</Text>
              <Text style={styles.heroSubtitle}>
                Geleceğe mektuplar yazın, belirlediğiniz tarihte açılsın
              </Text>
              <TouchableOpacity
                onPress={() => setIsCreateModalOpen(true)}
                activeOpacity={0.9}
                style={styles.heroCtaWrap}
              >
                <LinearGradient
                  colors={[...COLORS.heroCta]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.heroCta}
                >
                  <Plus size={18} color={COLORS.white} />
                  <Text style={styles.heroCtaText}>Yeni Kapsül</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Intro Section - HTML #intro-section */}
        <View style={styles.introSection}>
          <LinearGradient
            colors={[...COLORS.introCard]}
            style={styles.introCard}
          >
            <View style={styles.introRow}>
              <View style={styles.introIconBox}>
                <Lock size={22} color={COLORS.white} />
              </View>
              <View style={styles.introTextBlock}>
                <Text style={styles.introTitle}>Nasıl Çalışır?</Text>
                <Text style={styles.introDesc}>
                  Geleceğe mektuplar gönderin. Belirlediğiniz tarihte otomatik açılır.
                </Text>
                <View style={styles.steps}>
                  <View style={styles.stepRow}>
                    <View style={[styles.stepIcon, { backgroundColor: '#EDE9FE' }]}>
                      <PenLine size={14} color="#7C3AED" />
                    </View>
                    <Text style={styles.stepText}>Mektubunuzu yazın</Text>
                  </View>
                  <View style={styles.stepRow}>
                    <View style={[styles.stepIcon, { backgroundColor: '#FEF3C7' }]}>
                      <Calendar size={14} color="#D97706" />
                    </View>
                    <Text style={styles.stepText}>Açılma tarihi seçin</Text>
                  </View>
                  <View style={styles.stepRow}>
                    <View style={[styles.stepIcon, { backgroundColor: '#FFE4E6' }]}>
                      <Heart size={14} color="#E11D48" />
                    </View>
                    <Text style={styles.stepText}>Gelecekte keşfedin</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Capsules Section - HTML #capsules-grid-section */}
        <View style={styles.capsulesSection}>
          <View style={styles.capsulesHeader}>
            <Text style={styles.capsulesTitle}>Kapsülleriniz</Text>
            <TouchableOpacity
              onPress={showFilterMenu}
              style={styles.filterBtn}
              activeOpacity={0.8}
            >
              <Filter size={16} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.introIconBg} />
              <Text style={styles.loadingText}>Kapsüller hazırlanıyor...</Text>
            </View>
          ) : filteredCapsules.length > 0 ? (
            <View style={styles.capsuleList}>
              {filteredCapsules.map((capsule, index) => (
                <TimeCapsuleCard
                  key={capsule._id}
                  capsule={capsule}
                  onOpen={handleOpenCapsule}
                  variantIndex={index}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Lock size={48} color={COLORS.purpleMuted} />
              </View>
              <Text style={styles.emptyTitle}>Henüz kapsül yok</Text>
              <Text style={styles.emptySubtitle}>
                Geleceğe ilk mesajınızı şimdi bırakın!
              </Text>
              <TouchableOpacity
                onPress={() => setIsCreateModalOpen(true)}
                style={styles.emptyCtaWrap}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[...COLORS.heroCta]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.emptyCta}
                >
                  <Text style={styles.emptyCtaText}>Hemen Oluştur</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <CreateCapsuleModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAdd={handleCreateCapsule}
      />

      <CapsuleDetailModal
        visible={isDetailModalOpen}
        capsule={selectedCapsule}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdate={(updated) => {
          setSelectedCapsule(updated);
          setCapsules((prev) =>
            prev.map((c) => (c._id === updated._id ? updated : c)),
          );
        }}
        onDelete={handleDeleteCapsule}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.softGray,
    paddingTop: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  heroGradient: {
    borderRadius: 24,
    overflow: 'hidden',
    height: 280,
  },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  heroIconWrap: {
    marginBottom: 16,
  },
  heroIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.heroIconBg,
    borderWidth: 2,
    borderColor: COLORS.heroIconBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 28,
    color: COLORS.white,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(233, 213, 255, 0.95)',
    marginBottom: 20,
    textAlign: 'center',
    maxWidth: 280,
  },
  heroCtaWrap: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  heroCtaText: {
    fontSize: 14,
    color: COLORS.white,
  },
  introSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  introCard: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.introBorder,
    padding: 16,
    overflow: 'hidden',
  },
  introRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  introIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.introIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTextBlock: {
    flex: 1,
  },
  introTitle: {
    fontSize: 18,
    color: COLORS.gray900,
    marginBottom: 8,
  },
  introDesc: {
    fontSize: 14,
    color: COLORS.gray700,
    marginBottom: 12,
    lineHeight: 20,
  },
  steps: {
    gap: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 12,
    color: COLORS.gray700,
  },
  capsulesSection: {
    paddingHorizontal: 16,
  },
  capsulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  capsulesTitle: {
    fontSize: 24,
    color: COLORS.gray900,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  capsuleList: {
    gap: 16,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray500,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    color: COLORS.gray900,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyCtaWrap: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
  emptyCta: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyCtaText: {
    fontSize: 14,
    color: COLORS.white,
  },
});
