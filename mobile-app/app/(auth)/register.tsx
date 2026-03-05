import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/ui/Text';
import { TextInput } from '../../components/ui/TextInput';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Lock,
  Calendar as CalendarIcon,
  Plus,
  Eye,
  EyeOff,
  ShieldCheck,
  Send,
  Heart,
  Sparkles,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import client from '../../api/client';
import { authApi } from '../../api/auth';

interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon?: React.ReactNode;
  loading?: boolean;
  error?: string;
}

const FormInput = ({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, icon, loading, error }: FormInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused,
        error ? styles.inputWrapperError : null
      ]}>
        {icon && <View style={styles.inputIcon}>{icon}</View>}
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {loading && <ActivityIndicator size="small" color="#FF6B9D" style={{ marginRight: 10 }} />}
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
            {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    avatar: null as string | null,
    partnerFirstName: '',
    partnerLastName: '',
    partnerEmail: '',
    partnerPassword: '',
    partnerAvatar: null as string | null,
    relationshipStartDate: new Date(),
  });

  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isPartnerEmailChecking, setIsPartnerEmailChecking] = useState(false);
  const [partnerEmailError, setPartnerEmailError] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  useEffect(() => {
    const email = formData.email;
    if (!email || !validateEmail(email)) {
      setEmailError('');
      setIsEmailChecking(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsEmailChecking(true);
      setEmailError('');
      try {
        const response = await authApi.checkEmail(email);
        if (!response.available) {
          setEmailError('Bu e-posta adresi zaten kullanımda.');
        }
      } catch (error) {
        console.error('Email check error:', error);
      } finally {
        setIsEmailChecking(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.email]);

  useEffect(() => {
    const email = formData.partnerEmail;
    if (!email || !validateEmail(email)) {
      setPartnerEmailError('');
      setIsPartnerEmailChecking(false);
      return;
    }

    if (email === formData.email) {
      setPartnerEmailError('Partnerinizin e-postası sizinkiyle aynı olamaz.');
      return;
    }

    const timer = setTimeout(async () => {
      setIsPartnerEmailChecking(true);
      setPartnerEmailError('');
      try {
        const response = await authApi.checkEmail(email);
        if (!response.available) {
          setPartnerEmailError('Bu e-posta adresi zaten kullanımda.');
        }
      } catch (error) {
        console.error('Partner email check error:', error);
      } finally {
        setIsPartnerEmailChecking(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.partnerEmail, formData.email]);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const pickImage = async (type: 'user' | 'partner') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      handleInputChange(type === 'user' ? 'avatar' : 'partnerAvatar', result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      // 1. Kullanıcı kaydı
      const regResponse = await client.post(`/auth/register`, {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: 'male', // Varsayılan, daha sonra profil ayarlarından güncellenebilir
      });

      const { accessToken, user } = regResponse.data.data;

      // 2. Çift ve Partner oluşturma (subdomain backend tarafından otomatik atanır)
      await client.post(
        `/onboarding/create-couple`,
        {
          partnerFirstName: formData.partnerFirstName,
          partnerLastName: formData.partnerLastName,
          partnerEmail: formData.partnerEmail,
          partnerPassword: formData.partnerPassword,
          partnerGender: 'female',
          relationshipStartDate: formData.relationshipStartDate.toISOString(),
          relationshipStatus: 'dating',
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // Kayıt başarılı, adım 3'e (Doğrulama Bilgisi) geç
      setStep(3);
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.message || 'Kayıt işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
        return;
      }
      if (emailError || isEmailChecking) {
        Alert.alert('Hata', emailError || 'E-posta adresi kontrol ediliyor...');
        return;
      }
      if (formData.password !== formData.passwordConfirm) {
        Alert.alert('Hata', 'Şifreler eşleşmiyor.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.partnerFirstName || !formData.partnerLastName || !formData.partnerEmail || !formData.partnerPassword) {
        Alert.alert('Hata', 'Lütfen partnerinizin bilgilerini doldurun.');
        return;
      }
      if (partnerEmailError || isPartnerEmailChecking) {
        Alert.alert('Hata', partnerEmailError || 'Partner e-posta adresi kontrol ediliyor...');
        return;
      }
      handleRegister();
    } else if (step === 3) {
      router.replace('/login');
    }
  };

  const prevStep = () => {
    if (step === 2) setStep(1);
    else if (step === 3) router.replace('/login');
    else router.back();
  };

  return (
    <LinearGradient
      colors={step === 2 ? ['#FDF2F8', '#F5F3FF', '#EFF6FF'] : step === 3 ? ['#EEF2FF', '#F5F3FF', '#FDF2F8'] : ['#FFF5F5', '#FFF5F5', '#FFF1F2']}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={[styles.scrollContent, step === 2 && styles.scrollContentStep2]} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.header, step === 2 && styles.headerStep2]}>
              <TouchableOpacity onPress={prevStep} style={step === 2 ? styles.backButtonCircle : styles.backButton}>
                <ArrowLeft size={step === 2 ? 20 : 24} color={step === 2 ? '#374151' : '#C44569'} />
                {step !== 2 && <Text style={styles.backText}>Geri</Text>}
              </TouchableOpacity>

              {step < 3 && (
                <View style={styles.stepIndicator}>
                  {[1, 2, 3].map(s => (
                    <View
                      key={s}
                      style={[
                        styles.stepDot,
                        s === step ? styles.stepDotActive : s < step ? styles.stepDotCompleted : null,
                        step === 2 && s === 3 && styles.stepDotInactive,
                      ]}
                    />
                  ))}
                </View>
              )}

              {step === 2 && <View style={{ width: 40 }} />}
            </View>

            <View style={[styles.formCard, step === 2 && styles.formCardStep2]}>
              {step === 1 && (
                <Animated.View entering={FadeInDown} style={styles.formContainer}>
                  <View style={styles.titleSection}>
                    <Text style={styles.title}>Seni Tanıyalım 😊</Text>
                    <Text style={styles.subtitle}>Kısa bir sürede hesabını oluşturalım</Text>
                  </View>

                  <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={() => pickImage('user')} style={styles.avatarContainer}>
                      {formData.avatar ? (
                        <Image source={{ uri: formData.avatar }} style={styles.avatar} />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <User size={40} color="#D1D5DB" />
                          <View style={styles.plusIcon}>
                            <Plus size={16} color="white" />
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                    <Text style={styles.avatarLabel}>Profil Resmi Ekle</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <FormInput
                      label="Ad"
                      placeholder="Adınızı girin"
                      value={formData.firstName}
                      onChangeText={v => handleInputChange('firstName', v)}
                      icon={<User size={20} color="#9CA3AF" />}
                    />
                    <FormInput
                      label="Soyad"
                      placeholder="Soyadınızı girin"
                      value={formData.lastName}
                      onChangeText={v => handleInputChange('lastName', v)}
                      icon={<User size={20} color="#9CA3AF" />}
                    />
                    <FormInput
                      label="E-posta"
                      placeholder="ornek@email.com"
                      value={formData.email}
                      onChangeText={v => handleInputChange('email', v)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      icon={<Mail size={20} color="#9CA3AF" />}
                      loading={isEmailChecking}
                      error={emailError}
                    />
                    <FormInput
                      label="Şifre"
                      placeholder="••••••••••"
                      value={formData.password}
                      onChangeText={v => handleInputChange('password', v)}
                      secureTextEntry
                      icon={<Lock size={20} color="#9CA3AF" />}
                    />
                    <Text style={styles.passwordHelper}>En az 8 karakter, bir büyük harf ve bir rakam</Text>
                    <FormInput
                      label="Şifre (Tekrar)"
                      placeholder="••••••••••"
                      value={formData.passwordConfirm}
                      onChangeText={v => handleInputChange('passwordConfirm', v)}
                      secureTextEntry
                      icon={<Lock size={20} color="#9CA3AF" />}
                    />
                  </View>
                </Animated.View>
              )}

              {step === 2 && (
                <Animated.View entering={FadeInDown} style={styles.formContainer}>
                  <View style={styles.titleSection}>
                    <Text style={[styles.title, styles.titleStep2]}>Partnerini Ekle 💕</Text>
                    <Text style={styles.subtitle}>Partnerine davet gönderelim</Text>
                  </View>

                  <View style={styles.visualSection}>
                    <View style={styles.avatarRow}>
                      <View style={styles.userAvatarCircle}>
                        <Text style={styles.avatarLetter}>{formData.firstName ? formData.firstName[0].toUpperCase() : '?'}</Text>
                        <View style={styles.onlineBadge} />
                      </View>
                      <View style={styles.heartCircle}>
                        <Heart size={24} color="white" fill="white" />
                        <View style={styles.sparkleBadge}>
                          <Sparkles size={12} color="white" />
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => pickImage('partner')} style={styles.partnerAvatarCircle}>
                        {formData.partnerAvatar ? (
                          <Image source={{ uri: formData.partnerAvatar }} style={styles.partnerAvatarImage} />
                        ) : (
                          <Text style={styles.avatarLetter}>
                            {formData.partnerFirstName ? formData.partnerFirstName[0].toUpperCase() : '?'}
                          </Text>
                        )}
                        <View style={[styles.onlineBadge, styles.offlineBadge]} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.coupleName}>
                      <Text style={styles.coupleNameUser}>{formData.firstName || '...'}</Text>
                      {' & '}
                      <Text style={styles.coupleNamePartner}>{formData.partnerFirstName ? formData.partnerFirstName : '...'}</Text>
                    </Text>
                    <View style={styles.heartsRow}>
                      <Heart size={12} color="#EF4444" fill="#EF4444" />
                      <Heart size={12} color="#FF6B9D" fill="#FF6B9D" />
                      <Heart size={12} color="#F87171" fill="#F87171" />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <FormInput
                      label="Partnerin Adı"
                      placeholder="Örn: Mehmet"
                      value={formData.partnerFirstName}
                      onChangeText={v => handleInputChange('partnerFirstName', v)}
                      icon={<User size={20} color="#9CA3AF" />}
                    />
                    <FormInput
                      label="Partnerin Soyadı"
                      placeholder="Soyadı"
                      value={formData.partnerLastName}
                      onChangeText={v => handleInputChange('partnerLastName', v)}
                      icon={<User size={20} color="#9CA3AF" />}
                    />
                    <FormInput
                      label="Partnerin E-postası"
                      placeholder="ornek@email.com"
                      value={formData.partnerEmail}
                      onChangeText={v => handleInputChange('partnerEmail', v)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      icon={<Mail size={20} color="#9CA3AF" />}
                      loading={isPartnerEmailChecking}
                      error={partnerEmailError}
                    />
                    <FormInput
                      label="Partner Şifresi"
                      placeholder="••••••••"
                      value={formData.partnerPassword}
                      onChangeText={v => handleInputChange('partnerPassword', v)}
                      secureTextEntry
                      icon={<Lock size={20} color="#9CA3AF" />}
                    />

                    <View style={styles.dateField}>
                      <Text style={styles.inputLabel}>Birliktelik Tarihi</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                        <CalendarIcon size={20} color="#9CA3AF" />
                        <Text style={styles.dateValue}>
                          {format(formData.relationshipStartDate, 'd MMMM yyyy', { locale: tr })}
                        </Text>
                      </TouchableOpacity>
                      <Text style={styles.dateHint}>
                        İlk buluşma, sevgili olma tarihi, düğün tarihi... size özel olan tarih
                      </Text>
                    </View>

                    {showDatePicker && (
                      <DateTimePicker
                        value={formData.relationshipStartDate}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) handleInputChange('relationshipStartDate', selectedDate);
                        }}
                      />
                    )}
                  </View>

                  <TouchableOpacity style={styles.nextButtonStep2} onPress={nextStep} disabled={loading}>
                    <LinearGradient
                      colors={['#FF6B9D', '#FFA8C5']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.nextButtonGradient}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <Text style={styles.nextButtonText}>Devam Et</Text>
                          <ArrowRight size={20} color="white" />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.securityNoteStep2}>
                    <ShieldCheck size={14} color="#10B981" />
                    <Text style={styles.securityNoteText}>Bilgileriniz güvende ve şifreleniyor</Text>
                  </View>
                </Animated.View>
              )}

              {step === 3 && (
                <Animated.View entering={ZoomIn} style={styles.verifyContainer}>
                  <View style={styles.verifyIconContainer}>
                    <LinearGradient
                      colors={['#6366F1', '#EC4899']}
                      style={styles.verifyIconGradient}
                    >
                      <Send size={50} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.verifyTitle}>E-postanı Doğrula ✉️</Text>
                  <Text style={styles.verifySubtitle}>
                    <Text style={styles.emailHighlight}>{formData.email}</Text> adresine 6 haneli bir kod gönderdik
                  </Text>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoText}>
                      Lütfen e-postanı kontrol et ve hesabını aktifleştirmek için gelen bağlantıya tıkla. Spam klasörünüzü de kontrol edin.
                    </Text>
                  </View>
                </Animated.View>
              )}

              {step !== 2 && (
                <TouchableOpacity style={styles.nextButton} onPress={nextStep} disabled={loading}>
                  <LinearGradient
                    colors={step === 3 ? ['#6366F1', '#8B5CF6'] : ['#FF6B9D', '#C44569']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.nextButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text style={styles.nextButtonText}>
                          {step === 1 ? 'Devam Et' : 'Giriş Yap'}
                        </Text>
                        <ArrowRight size={20} color="white" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {step < 3 && (
                <TouchableOpacity 
                  style={styles.loginLink}
                  onPress={() => router.replace('/login')}
                >
                  <Text style={styles.loginLinkText}>
                    Zaten hesabınız var mı? <Text style={styles.loginLinkHighlight}>Giriş Yap</Text>
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {step < 3 && (
              <View style={styles.securityFooter}>
                <ShieldCheck size={16} color="#10B981" />
                <Text style={styles.securityText}>Bilgileriniz güvende ve şifreleniyor</Text>
              </View>
            )}
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxWidth: 448,
    alignSelf: 'center',
    width: '100%',
  },
  scrollContentStep2: {
    maxWidth: 448,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerStep2: {
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backText: {
    fontSize: 16,
    color: '#C44569',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
  },
  stepDotActive: {
    backgroundColor: '#FF6B9D',
  },
  stepDotCompleted: {
    backgroundColor: '#FF6B9D',
  },
  stepDotInactive: {
    backgroundColor: '#D1D5DB',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  formCardStep2: {
    backgroundColor: 'white',
  },
  formContainer: {
    flex: 1,
  },
  titleSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#C44569',
    marginBottom: 12,
    textAlign: 'center',
  },
  titleStep2: {
    fontSize: 28,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FCE7F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#FF6B9D',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarLabel: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  inputGroup: {
    gap: 24,
  },
  inputContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: '#FF6B9D',
    backgroundColor: 'white',
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  eyeButton: {
    padding: 5,
  },
  passwordHelper: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: -16,
    marginBottom: -8,
  },
  visualSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userAvatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A78BFA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  partnerAvatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F472B6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FBCFE8',
    borderStyle: 'dashed',
    position: 'relative',
  },
  partnerAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  avatarLetter: {
    fontSize: 28,
    color: 'white',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22C55E',
    borderWidth: 4,
    borderColor: 'white',
  },
  offlineBadge: {
    backgroundColor: '#D1D5DB',
  },
  heartCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginHorizontal: 24,
    backgroundColor: '#F472B6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sparkleBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FACC15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coupleName: {
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
  },
  coupleNameUser: {
    color: '#1F2937',
  },
  coupleNamePartner: {
    color: '#EC4899',
  },
  heartsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  dateField: {
    marginTop: 0,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  dateValue: {
    fontSize: 16,
    color: '#111827',
  },
  dateHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    paddingLeft: 4,
    lineHeight: 18,
  },
  nextButton: {
    marginTop: 28,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonStep2: {
    marginTop: 28,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
  },
  securityNoteStep2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  securityNoteText: {
    fontSize: 12,
    color: '#6B7280',
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
    alignSelf: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  securityText: {
    fontSize: 14,
    color: '#374151',
  },
  verifyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  verifyIconContainer: {
    marginBottom: 24,
  },
  verifyIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  verifyTitle: {
    fontSize: 28,
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  verifySubtitle: {
    fontSize: 18,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
  },
  emailHighlight: {
    color: '#6366F1',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 22,
    textAlign: 'center',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#4B5563',
  },
  loginLinkHighlight: {
    color: '#FF6B9D',
  },
});
