import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/ui/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Heart,
  Check,
  Camera,
  Brain,
  MessageCircle,
  Rocket,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';

export default function WelcomeAboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const handleStart = () => {
    router.replace('/dashboard');
  };

  return (
    <LinearGradient
      colors={['#FFF1F2', '#FFF5F5', '#FFF7ED']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Success Icon Section */}
          <View style={styles.header}>
            <Animated.View entering={ZoomIn.delay(200)} style={styles.successIconContainer}>
              <LinearGradient
                colors={['#FF6B9D', '#F43F5E']}
                style={styles.iconGradient}
              >
                <Heart size={60} color="white" fill="white" />
              </LinearGradient>
              <View style={styles.checkBadge}>
                <Check size={20} color="white" strokeWidth={3} />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)}>
              <Text style={styles.mainTitle}>Harika, Hazırsınız! 🎉</Text>
              <Text style={styles.subTitle}>
                <Text style={styles.highlightText}>{user?.firstName || 'Kullanıcı'}</Text>, Çiftopia'ya hoş geldin!
              </Text>
            </Animated.View>
          </View>

          {/* Features Section */}
          <View style={styles.featuresList}>
            <Animated.View entering={FadeInUp.delay(600)} style={styles.featureCard}>
              <View style={[styles.featureIconBox, { backgroundColor: '#FCE7F3' }]}>
                <Camera size={28} color="#DB2777" />
              </View>
              <View style={styles.featureTextContent}>
                <Text style={styles.featureTitle}>Anılarınızı Biriktirin</Text>
                <Text style={styles.featureDescription}>
                  Özel anlarınızı fotoğraflarla ölümsüzleştirin.
                </Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(800)} style={styles.featureCard}>
              <View style={[styles.featureIconBox, { backgroundColor: '#F1F5F9' }]}>
                <Brain size={28} color="#6366F1" />
              </View>
              <View style={styles.featureTextContent}>
                <Text style={styles.featureTitle}>Birbirinizi Tanıyın</Text>
                <Text style={styles.featureDescription}>
                  Quizlerle ilişkinizi eğlenceli hale getirin.
                </Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(1000)} style={styles.featureCard}>
              <View style={[styles.featureIconBox, { backgroundColor: '#FFF7ED' }]}>
                <MessageCircle size={28} color="#EA580C" />
              </View>
              <View style={styles.featureTextContent}>
                <Text style={styles.featureTitle}>Çifto ile Sohbet Edin</Text>
                <Text style={styles.featureDescription}>
                  AI asistanınız her zaman yanınızda.
                </Text>
              </View>
            </Animated.View>
          </View>

          {/* CTA Section */}
          <Animated.View entering={FadeInUp.delay(1200)} style={styles.footer}>
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <LinearGradient
                colors={['#FF6B9D', '#F43F5E', '#F97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startGradient}
              >
                <Text style={styles.startButtonText}>Keşfetmeye Başla</Text>
                <Rocket size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.notificationBadge}>
              <View style={styles.emailIconBox}>
                <Check size={16} color="white" />
              </View>
              <Text style={styles.notificationText}>
                Partnerine davet e-postası gönderildi ✉️
              </Text>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  successIconContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  iconGradient: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  checkBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  mainTitle: {
    fontSize: 32,
    color: '#F43F5E',
    textAlign: 'center',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 18,
    color: '#4B5563',
    textAlign: 'center',
  },
  highlightText: {
    color: '#DB2777',
  },
  featuresList: {
    gap: 15,
    marginVertical: 40,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 20,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#F43F5E',
  },
  featureIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    gap: 20,
  },
  startButton: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
  },
  notificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  emailIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 13,
    color: '#374151',
  },
});
