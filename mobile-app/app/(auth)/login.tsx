import React, { useState } from 'react';
import { Text } from '../../components/ui/Text';
import { TextInput } from '../../components/ui/TextInput';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastProvider';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Heart 
} from 'lucide-react-native';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);
  const { signIn } = useAuth();
  const { show: showToast } = useToast();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      showToast({
        type: 'warning',
        title: 'Uyarı',
        message: 'Lütfen e-posta ve şifrenizi girin.',
      });
      return;
    }

    setLoading(true);
    setShowResend(false);

    try {
      const response = await authApi.login(email, password);
      
      if (response.success && response.data) {
        await signIn({
          ...response.data.user,
          accessToken: response.data.accessToken,
        });
        showToast({
          type: 'love',
          title: 'Giriş Başarılı',
          message: 'Hoş geldiniz ❤️',
        });
        router.replace('/dashboard');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Giriş yapılamadı. Lütfen tekrar deneyin.';
      const msgStr = Array.isArray(message) ? message[0] : message;
      
      if (msgStr.includes('doğrulayın')) {
        setShowResend(true);
      }

      showToast({
        type: 'error',
        title: 'Hata',
        message: msgStr,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await authApi.resendVerification(email);
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Doğrulama e-postası tekrar gönderildi.',
      });
      setShowResend(false);
    } catch (err: any) {
      const message = err.response?.data?.message || 'E-posta gönderilemedi.';
      showToast({
        type: 'error',
        title: 'Hata',
        message: Array.isArray(message) ? message[0] : message,
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FFF1F2', '#FDF2F8', '#F5F3FF']}
      style={styles.container}
    >
      {[...Array(6)].map((_, i) => (
        <Heart
          key={i}
          size={24 + (i % 3) * 8}
          color="#FECDD3"
          style={[
            styles.floatingHeart,
            {
              top: `${15 + i * 15}%`,
              left: `${10 + ((i * 23) % 80)}%`,
              opacity: 0.3,
            }
          ]}
        />
      ))}

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Image 
                    source={require('../../assets/logo.png')} 
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.title}>Ciftopia</Text>
                <Text style={styles.subtitle}>Partnerinizle ortak dünyanıza giriş yapın</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>E-posta</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="ornek@email.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Şifre</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#FF69B4', '#FB7185']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>Giriş Yap</Text>
                        <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {showResend && (
                  <TouchableOpacity 
                    style={styles.resendContainer} 
                    onPress={handleResend}
                    disabled={resending}
                  >
                    <Text style={styles.resendText}>
                      {resending ? 'Gönderiliyor...' : 'Doğrulama mailini tekrar gönder'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Şifremi unuttum</Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>veya</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity 
                  style={styles.registerLink}
                  onPress={() => router.push('/welcome-selection')}
                >
                  <Text style={styles.registerLinkText}>
                    Henüz hesabınız yok mu? <Text style={styles.registerLinkHighlight}>Kayıt Ol</Text>
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <View style={styles.securityInfo}>
                  <View style={styles.securityIconContainer}>
                    <ShieldCheck size={16} color="#9CA3AF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.securityTitle}>Güvenli Erişim</Text>
                    <Text style={styles.securityText}>
                      Tüm verileriniz uçtan uca şifrelenir ve sadece partnerinizle sizin aranızda kalır.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingHeart: {
    position: 'absolute',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 50
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 40,
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 60,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  eyeIcon: {
    padding: 5,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  buttonGradient: {
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#6B7280',
    fontSize: 14,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
  resendText: {
    color: '#FF69B4',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 30,
    paddingTop: 25,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  securityInfo: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 15,
    gap: 12,
  },
  securityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  securityTitle: {
    fontSize: 14,
    
    color: '#374151',
    marginBottom: 2,
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#9CA3AF',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 5,
  },
  registerLinkText: {
    fontSize: 15,
    color: '#4B5563',
  },
  registerLinkHighlight: {
    color: '#FF69B4',
  },
});
