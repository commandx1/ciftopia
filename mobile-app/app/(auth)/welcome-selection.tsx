import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/ui/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Heart, Sparkles, ArrowRight, LogIn, UserPlus } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function WelcomeSelectionScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#FFF5F5', '#FFF1F2', '#FDF2F8']}
      style={styles.container}
    >
      {/* Decorative Background Elements */}
      <View style={styles.decorativeContainer}>
        <Animated.View entering={FadeInDown.delay(200).duration(1000)} style={[styles.circle, { top: -50, right: -50, backgroundColor: '#FF6B9D', opacity: 0.1 }]} />
        <Animated.View entering={FadeInUp.delay(400).duration(1000)} style={[styles.circle, { bottom: -100, left: -100, backgroundColor: '#C44569', opacity: 0.1 }]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo & Hero Section */}
          <Animated.View entering={FadeInDown.delay(300).duration(800)} style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#FF6B9D', '#C44569']}
                style={styles.logoGradient}
              >
                <Heart size={40} color="white" fill="white" />
              </LinearGradient>
              <Animated.View entering={FadeInDown.delay(500)} style={styles.sparkleContainer}>
                <Sparkles size={24} color="#FFD700" />
              </Animated.View>
            </View>
            <Text style={styles.appName}>Ciftopia</Text>
            <Text style={styles.tagline}>Aşkın Dijital Hali ❤️</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.illustrationContainer}>
            <Image
              source={require('../../assets/ciftopia-logo.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Action Section */}
          <View style={styles.actionSection}>
            <Animated.View entering={FadeInUp.delay(800).duration(800)}>
              <Text style={styles.welcomeTitle}>Hoş Geldiniz!</Text>
              <Text style={styles.welcomeSubtitle}>
                İlişkinizi daha özel kılmak için hazır mısınız?
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(1000).duration(800)} style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => router.push('/onboarding')}
              >
                <LinearGradient
                  colors={['#FF6B9D', '#C44569']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <UserPlus size={24} color="white" />
                  <Text style={styles.registerButtonText}>Kayıt Ol</Text>
                  <ArrowRight size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push('/login')}
              >
                <LogIn size={24} color="#C44569" />
                <Text style={styles.loginButtonText}>Giriş Yap</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Footer Footer */}
          <Animated.View entering={FadeInUp.delay(1200).duration(800)} style={styles.footer}>
            <Text style={styles.footerText}>
              Devam ederek kullanım koşullarını kabul etmiş olursunuz.
            </Text>
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
  decorativeContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
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
  heroSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  sparkleContainer: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  appName: {
    fontSize: 42,
    color: '#C44569',
    fontFamily: 'IndieFlower',
  },
  tagline: {
    fontSize: 16,
    color: '#FF6B9D',
    marginTop: -5,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: height * 0.3,
  },
  illustration: {
    width: width * 0.7,
    height: '100%',
  },
  actionSection: {
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 28,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 15,
  },
  registerButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#C44569',
    gap: 12,
    backgroundColor: 'white',
  },
  loginButtonText: {
    color: '#C44569',
    fontSize: 18,
  },
  footer: {
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
