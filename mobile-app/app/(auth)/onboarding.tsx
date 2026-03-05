import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/ui/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Heart,
  ArrowRight,
  Sparkles,
  Camera,
  StickyNote,
  Rocket,
  ShieldCheck,
  Brain,
  MessageSquare,
  ChartLine,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Anılarınızı Biriktirin 📸',
    subtitle: 'Fotoğraflar, notlar ve özel anlarınızı tek bir yerde saklayın',
    icons: [
      { icon: Camera, label: 'Fotoğraflar', color: '#FF6B9D' },
      { icon: StickyNote, label: 'Notlar', color: '#FFA07A' },
      { icon: Heart, label: 'Anlar', color: '#C44569' },
    ],
    stepText: '1 / 3',
  },
  {
    id: '2',
    title: 'Özel Günleri Unutmayın 🗓️',
    subtitle: 'Yıldönümleri, doğum günleri ve size özel tüm tarihler güvende',
    icons: [
      { icon: Heart, label: 'Yıldönümü', color: '#FF6B9D' },
      { icon: Sparkles, label: 'Kutlama', color: '#FFA07A' },
      { icon: ShieldCheck, label: 'Güvende', color: '#C44569' },
    ],
    stepText: '2 / 3',
  },
  {
    id: '3',
    title: 'AI İlişki Koçunuz: Çifto 🤖',
    subtitle: 'Kişiselleştirilmiş öneriler ve sohbetle ilişkinizi güçlendirin',
    icons: [
      { icon: Brain, label: 'Akıllı Analiz', color: '#FF6B9D' },
      { icon: MessageSquare, label: '7/24 Destek', color: '#FFA07A' },
      { icon: ChartLine, label: 'Gelişim', color: '#C44569' },
    ],
    stepText: '3 / 3',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      router.push('/register');
    }
  };

  const skipOnboarding = () => {
    router.push('/register');
  };

  const renderItem = ({ item, index }: { item: typeof ONBOARDING_DATA[0], index: number }) => (
    <View style={styles.page}>
      <View style={styles.topIllustration}>
        <LinearGradient
          colors={['rgba(255, 107, 157, 0.05)', 'rgba(196, 69, 105, 0.05)']}
          style={styles.illustrationBackground}
        >
          <Animated.View entering={FadeInDown.delay(200)} style={styles.mainVisualContainer}>
            <View style={styles.visualCard}>
              <View style={styles.visualIconsRow}>
                <View style={[styles.userIconBox, { backgroundColor: index === 2 ? '#FF6B9D' : '#FF6B9D' }]}>
                  <Heart size={32} color="white" fill="white" />
                </View>
                <View style={styles.visualCenterIcon}>
                  <LinearGradient
                    colors={['#FF6B9D', '#C44569']}
                    style={styles.centerIconGradient}
                  >
                    {index === 2 ? <Brain size={40} color="white" /> : <Rocket size={40} color="white" />}
                  </LinearGradient>
                </View>
                <View style={[styles.userIconBox, { backgroundColor: '#C44569' }]}>
                  <Sparkles size={32} color="white" />
                </View>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>
      </View>

      <View style={styles.bottomContent}>
        <Animated.View entering={FadeInUp.delay(300)} style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </Animated.View>

        <Animated.View entering={FadeInRight.delay(500)} style={styles.featuresGrid}>
          {item.icons.map((feature, idx) => (
            <View key={idx} style={styles.featureItem}>
              <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '20' }]}>
                <feature.icon size={24} color={feature.color} />
              </View>
              <Text style={styles.featureLabel}>{feature.label}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={styles.footerRow}>
          <View style={styles.stepInfo}>
            <Text style={styles.stepText}>{item.stepText}</Text>
            <View style={styles.paginationContainer}>
              {ONBOARDING_DATA.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.paginationDot,
                    currentIndex === i ? styles.paginationDotActive : null,
                  ]}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <LinearGradient
              colors={['#FF6B9D', '#C44569']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentIndex === ONBOARDING_DATA.length - 1 ? 'Hemen Başla' : 'Devam Et'}
              </Text>
              <ArrowRight size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
        <Text style={styles.skipText}>Atla</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    zIndex: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  skipText: {
    fontSize: 14,
    color: '#C44569',
  },
  page: {
    width: width,
    flex: 1,
  },
  topIllustration: {
    height: height * 0.45,
    width: '100%',
  },
  illustrationBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainVisualContainer: {
    width: '95%',
    padding: 20,
  },
  visualCard: {
    backgroundColor: '#fff5f5',
    borderRadius: 30,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  visualIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  userIconBox: {
    width: 55,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  visualCenterIcon: {
    width: 90,
    height: 90,
    borderRadius: 25,
    padding: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  centerIconGradient: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContent: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#C44569',
    textAlign: 'center',
    fontFamily: 'IndieFlower',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 30,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepInfo: {
    gap: 10,
  },
  stepText: {
    fontSize: 14,
    color: '#C44569',
  },
  paginationContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#FF6B9D',
  },
  nextButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
    gap: 10,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
