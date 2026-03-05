import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  RefreshControl
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/ui/Text'
import { TextInput } from '../../components/ui/TextInput'
import { LinearGradient } from 'expo-linear-gradient'
import {
  User,
  Mail,
  Trash2,
  X,
  AlertTriangle,
  Images,
  CalendarDays,
  CheckSquare,
  Square,
  Save,
  Camera,
  Lock,
  Eye,
  EyeOff,
  PenTool,
  Hourglass,
  Activity,
  Star,
  Heart
} from 'lucide-react-native'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/ToastProvider'
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated'
import { authApi } from '../../api/auth'
import { uploadApi } from '../../api/upload'
import * as ImagePicker from 'expo-image-picker'

interface FormInputProps {
  label: string
  placeholder: string
  value: string
  onChangeText: (text: string) => void
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  icon?: React.ReactNode
  editable?: boolean
  secureTextEntry?: boolean
  rightElement?: React.ReactNode
}

const FormInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  icon,
  editable = true,
  secureTextEntry = false,
  rightElement
}: FormInputProps) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View
        style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused, !editable && styles.inputWrapperDisabled]}
      >
        {icon && <View style={styles.inputIcon}>{icon}</View>}
        <TextInput
          style={[styles.textInput, !editable && styles.textInputDisabled]}
          placeholder={placeholder}
          placeholderTextColor='#9CA3AF'
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
          secureTextEntry={secureTextEntry}
        />
        {rightElement}
      </View>
    </View>
  )
}

export default function SettingsScreen() {
  const { user, signOut, updateUser, refreshUser } = useAuth()
  const { show: showToast } = useToast()

  // Profile State
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [selectedAvatar, setSelectedAvatar] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Password State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshUser()
    setFirstName(user?.firstName || '')
    setLastName(user?.lastName || '')
    setEmail(user?.email || '')
    setRefreshing(false)
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5
    })

    if (!result.canceled) {
      setSelectedAvatar(result.assets[0])
    }
  }

  const handleUpdateProfile = async () => {
    if (!firstName || !lastName) {
      showToast({
        type: 'warning',
        title: 'Uyarı',
        message: 'Ad ve soyad alanları boş bırakılamaz.'
      })
      return
    }

    setLoading(true)
    try {
      let avatarData = user?.avatar

      if (selectedAvatar) {
        const uploadRes = await uploadApi.uploadPhotos([selectedAvatar], user?.accessToken)
        const p = uploadRes.photos[0]
        avatarData = {
          url: p.key,
          width: p.width,
          height: p.height,
          size: p.size
        }
      }

      const response = await authApi.updateProfile(
        {
          firstName,
          lastName,
          avatar: avatarData
        },
        user?.accessToken
      )

      if (response.success) {
        updateUser({
          ...user,
          firstName,
          lastName,
          avatar: response.data.avatar || avatarData
        })
        setSelectedAvatar(null)
        showToast({
          type: 'success',
          title: 'Başarılı',
          message: 'Profil bilgileriniz güncellendi.'
        })
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: error.response?.data?.message || 'Profil güncellenirken bir hata oluştu.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast({
        type: 'warning',
        title: 'Uyarı',
        message: 'Lütfen tüm şifre alanlarını doldurun.'
      })
      return
    }

    if (newPassword !== confirmPassword) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Yeni şifreler eşleşmiyor.'
      })
      return
    }

    if (newPassword.length < 6) {
      showToast({
        type: 'warning',
        title: 'Uyarı',
        message: 'Yeni şifre en az 6 karakter olmalıdır.'
      })
      return
    }

    setPasswordLoading(true)
    try {
      const response = await authApi.changePassword(
        {
          currentPassword,
          newPassword
        },
        user?.accessToken
      )

      if (response.success) {
        showToast({
          type: 'success',
          title: 'Başarılı',
          message: 'Şifreniz başarıyla değiştirildi.'
        })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: error.response?.data?.message || 'Şifre değiştirilirken bir hata oluştu.'
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const getUserAvatar = () => {
    if (selectedAvatar) return { uri: selectedAvatar.uri }
    if (user?.avatar?.url) return { uri: user.avatar.url }
    return user?.gender === 'female' ? require('../../assets/woman-pp.png') : require('../../assets/man-pp.png')
  }

  return (
    <LinearGradient colors={['#FFF5F5', '#FFF1F2', '#FDF2F8']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior='padding'
          style={{ flex: 1 }}
          keyboardVerticalOffset={72}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B9D']} />}
          >
            <Animated.View entering={FadeInDown} style={styles.formCard}>
              <View style={styles.titleSection}>
                <Text style={styles.title}>Profil Ayarları ⚙️</Text>
                <Text style={styles.subtitle}>Kişisel bilgilerinizi ve profil resminizi güncelleyin</Text>
              </View>

              <View style={styles.avatarSection}>
                <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                  <Image source={getUserAvatar()} style={styles.avatar} />
                  <View style={styles.editBadge}>
                    <Camera size={16} color='white' />
                  </View>
                </TouchableOpacity>
                <Text style={styles.avatarLabel}>Profil Resmini Değiştir</Text>
              </View>

              <View style={styles.inputGroup}>
                <FormInput
                  label='Ad'
                  placeholder='Adınız'
                  value={firstName}
                  onChangeText={setFirstName}
                  icon={<User size={20} color='#9CA3AF' />}
                />
                <FormInput
                  label='Soyad'
                  placeholder='Soyadınız'
                  value={lastName}
                  onChangeText={setLastName}
                  icon={<User size={20} color='#9CA3AF' />}
                />
                <FormInput
                  label='E-posta'
                  placeholder='E-posta adresiniz'
                  value={email}
                  onChangeText={setEmail}
                  icon={<Mail size={20} color='#9CA3AF' />}
                  editable={false}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile} disabled={loading}>
                <LinearGradient
                  colors={['#FF6B9D', '#C44569']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color='white' />
                  ) : (
                    <>
                      <Save size={20} color='white' />
                      <Text style={styles.saveButtonText}>Profil Güncelle</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(100)} style={styles.formCard}>
              <View style={styles.titleSection}>
                <Text style={styles.title}>Şifre Değiştir 🔒</Text>
                <Text style={styles.subtitle}>Güvenliğiniz için düzenli olarak şifrenizi güncelleyin</Text>
              </View>

              <View style={styles.inputGroup}>
                <FormInput
                  label='Mevcut Şifre'
                  placeholder='••••••••'
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showPasswords.current}
                  icon={<Lock size={20} color='#9CA3AF' />}
                  rightElement={
                    <TouchableOpacity onPress={() => setShowPasswords(p => ({ ...p, current: !p.current }))}>
                      {showPasswords.current ? <EyeOff size={20} color='#9CA3AF' /> : <Eye size={20} color='#9CA3AF' />}
                    </TouchableOpacity>
                  }
                />
                <FormInput
                  label='Yeni Şifre'
                  placeholder='••••••••'
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPasswords.new}
                  icon={<Lock size={20} color='#9CA3AF' />}
                  rightElement={
                    <TouchableOpacity onPress={() => setShowPasswords(p => ({ ...p, new: !p.new }))}>
                      {showPasswords.new ? <EyeOff size={20} color='#9CA3AF' /> : <Eye size={20} color='#9CA3AF' />}
                    </TouchableOpacity>
                  }
                />
                <FormInput
                  label='Yeni Şifre (Tekrar)'
                  placeholder='••••••••'
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPasswords.confirm}
                  icon={<Lock size={20} color='#9CA3AF' />}
                  rightElement={
                    <TouchableOpacity onPress={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}>
                      {showPasswords.confirm ? <EyeOff size={20} color='#9CA3AF' /> : <Eye size={20} color='#9CA3AF' />}
                    </TouchableOpacity>
                  }
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword} disabled={passwordLoading}>
                <LinearGradient
                  colors={['#6366F1', '#4F46E5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  {passwordLoading ? (
                    <ActivityIndicator color='white' />
                  ) : (
                    <>
                      <Lock size={20} color='white' />
                      <Text style={styles.saveButtonText}>Şifreyi Güncelle</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200)} style={styles.dangerZoneCard}>
              <View style={styles.dangerTitleSection}>
                <AlertTriangle size={24} color='#EF4444' />
                <Text style={styles.dangerTitle}>Tehlikeli Bölge</Text>
              </View>
              <Text style={styles.dangerSubtitle}>
                Sitenizi ve tüm verilerinizi kalıcı olarak silmek istiyorsanız aşağıdaki butonu kullanabilirsiniz.
              </Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => setDeleteModalVisible(true)}>
                <Trash2 size={20} color='#EF4444' />
                <Text style={styles.deleteButtonText}>Siteyi ve Hesabı Sil</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <DeleteSiteModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        accessToken={user?.accessToken}
        onConfirm={signOut}
      />
    </LinearGradient>
  )
}

interface DeleteSiteModalProps {
  visible: boolean
  onClose: () => void
  onConfirm: () => void
  accessToken?: string
}

const DeleteSiteModal = ({ visible, onClose, onConfirm, accessToken }: DeleteSiteModalProps) => {
  const [step, setStep] = useState(1)
  const [confirmations, setConfirmations] = useState({
    understand: false,
    subscription: false
  })
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const { show: showToast } = useToast()

  const isFormValid = confirmations.understand && confirmations.subscription && confirmText.toUpperCase() === 'SİL'

  const handleDelete = async () => {
    if (step === 1) {
      setStep(2)
      return
    }

    setIsDeleting(true)
    try {
      await authApi.deleteSite(accessToken as string)
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Siteniz ve hesabınız başarıyla silindi.'
      })
      onConfirm() // Sign out
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: error.response?.data?.message || 'Silme işlemi sırasında bir hata oluştu.'
      })
      setIsDeleting(false)
      setStep(1)
    }
  }

  const toggleConfirmation = (key: keyof typeof confirmations) => {
    setConfirmations(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {step === 1 ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleRow}>
                  <AlertTriangle size={32} color='#EF4444' />
                  <View style={{ marginLeft: 15 }}>
                    <Text style={styles.modalTitle}>Siteyi Kalıcı Olarak Sil</Text>
                    <Text style={styles.modalSubtitle}>Bu işlem geri alınamaz</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color='#9CA3AF' />
                </TouchableOpacity>
              </View>

              <View style={styles.warningBanner}>
                <Text style={styles.warningBannerTitle}>Dikkat! Tüm Verileriniz Silinecek</Text>
                <Text style={styles.warningBannerText}>
                  Bu işlem hesabınızı ve içindeki <Text>tüm verileri kalıcı olarak</Text> silecektir.
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Silinecek İçerikler:</Text>
              <View style={styles.deleteItemsGrid}>
                {[
                  { icon: Images, label: 'Anılar & Galeri', detail: 'Tüm anılarınız ve fotoğraflarınız.' },
                  { icon: PenTool, label: 'Şiirler & Notlar', detail: 'Yazdığınız tüm şiirler ve aşk notları.' },
                  { icon: Hourglass, label: 'Zaman Kapsülü', detail: 'Geleceğe bıraktığınız tüm kapsüller.' },
                  { icon: CalendarDays, label: 'Özel Günler', detail: 'İlişki başlangıcı ve önemli tarihler.' },
                  { icon: Heart, label: 'Hayallerimiz', detail: 'Bucket list ve gelecek planlarınız.' },
                  { icon: Star, label: 'Quiz & Sorular', detail: 'Günün soruları ve quiz cevapları.' },
                  { icon: Activity, label: 'Ruh Hali', detail: 'Ruh hali takvimi geçmişiniz.' }
                ].map((item, i) => (
                  <View key={i} style={styles.deleteItemCard}>
                    <View style={styles.deleteItemIconBox}>
                      <item.icon size={18} color='#EF4444' />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.deleteItemLabel}>{item.label}</Text>
                      <Text style={styles.deleteItemDetail} numberOfLines={1}>
                        {item.detail}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Onaylayın:</Text>
              <View style={styles.confirmationsList}>
                {[
                  { id: 'understand', label: 'Tüm verilerimin kalıcı olarak silineceğini anlıyorum' },
                  { id: 'subscription', label: 'Premium aboneliğimin iptal edileceğini kabul ediyorum' }
                ].map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.confirmationRow}
                    onPress={() => toggleConfirmation(item.id as keyof typeof confirmations)}
                  >
                    {confirmations[item.id as keyof typeof confirmations] ? (
                      <CheckSquare size={20} color='#FF6B9D' />
                    ) : (
                      <Square size={20} color='#D1D5DB' />
                    )}
                    <Text style={styles.confirmationText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.confirmInputBox}>
                <Text style={styles.inputLabel}>
                  Devam etmek için <Text style={{ color: '#EF4444' }}>SİL</Text> yazın:
                </Text>
                <TextInput
                  style={[
                    styles.confirmTextInput,
                    confirmText && confirmText.toUpperCase() !== 'SİL' ? styles.confirmTextInputError : null
                  ]}
                  value={confirmText}
                  onChangeText={setConfirmText}
                  placeholder='SİL'
                  autoCapitalize='characters'
                />
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity onPress={onClose} style={styles.modalCancelButton}>
                  <Text style={styles.modalCancelButtonText}>İptal Et</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  disabled={!isFormValid}
                  style={[styles.modalDeleteButton, !isFormValid && styles.disabledButton]}
                >
                  <Text style={styles.modalDeleteButtonText}>Devam Et</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.finalConfirmContainer}>
              <Animated.View entering={ZoomIn} style={styles.finalConfirmIconBox}>
                <AlertTriangle size={50} color='#EF4444' />
              </Animated.View>
              <Text style={styles.finalTitle}>Son Bir Kez Emin misiniz?</Text>
              <Text style={styles.finalSubtitle}>
                Bu işlem sonrasında tüm verileriniz <Text style={{ color: '#EF4444' }}>tamamen kaybolacak.</Text>
              </Text>
              <View style={styles.finalWarningBanner}>
                <Text style={styles.finalWarningText}>⏱️ Bu işlem geri alınamaz!</Text>
              </View>

              <TouchableOpacity style={styles.finalDeleteButton} onPress={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <ActivityIndicator color='white' />
                ) : (
                  <>
                    <Trash2 size={24} color='white' />
                    <Text style={styles.finalDeleteButtonText}>Evet, Kalıcı Olarak Sil</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.finalCancelButton} onPress={() => setStep(1)} disabled={isDeleting}>
                <Text style={styles.finalCancelButtonText}>Hayır, Geri Dön</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 20
  },
  titleSection: {
    marginBottom: 25,
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    color: '#C44569',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center'
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 25
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    padding: 3,
    borderWidth: 2,
    borderColor: '#FF6B9D',
    position: 'relative'
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 47
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B9D',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white'
  },
  avatarLabel: {
    marginTop: 10,
    fontSize: 14,
    color: '#4B5563'
  },
  inputGroup: {
    gap: 15
  },
  inputContainer: {
    width: '100%'
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55
  },
  inputWrapperFocused: {
    borderColor: '#FF6B9D',
    backgroundColor: 'white'
  },
  inputWrapperDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#F3F4F6'
  },
  inputIcon: {
    marginRight: 10
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827'
  },
  textInputDisabled: {
    color: '#9CA3AF'
  },
  saveButton: {
    marginTop: 30,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18
  },
  dangerZoneCard: {
    backgroundColor: 'rgba(254, 242, 242, 0.8)',
    borderRadius: 30,
    padding: 25,
    borderWidth: 2,
    borderColor: '#FEE2E2'
  },
  dangerTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10
  },
  dangerTitle: {
    fontSize: 20,
    color: '#EF4444'
  },
  dangerSubtitle: {
    fontSize: 14,
    color: '#7F1D1D',
    marginBottom: 20,
    lineHeight: 20
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#EF4444',
    gap: 10,
    backgroundColor: 'white'
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 16
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 30,
    width: '100%',
    maxHeight: '90%',
    padding: 25
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  modalTitle: {
    fontSize: 20,
    color: '#111827'
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 2
  },
  closeButton: {
    padding: 5
  },
  warningBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20
  },
  warningBannerTitle: {
    color: '#991B1B',
    fontSize: 16,
    marginBottom: 5
  },
  warningBannerText: {
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 18
  },
  sectionTitle: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 15
  },
  deleteItemsGrid: {
    gap: 10,
    marginBottom: 20
  },
  deleteItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12
  },
  deleteItemIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteItemLabel: {
    fontSize: 14,
    color: '#111827'
  },
  deleteItemDetail: {
    fontSize: 12,
    color: '#6B7280'
  },
  confirmationsList: {
    gap: 12,
    marginBottom: 20
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  confirmationText: {
    fontSize: 13,
    color: '#374151',
    flex: 1
  },
  confirmInputBox: {
    marginBottom: 20
  },
  confirmTextInput: {
    height: 55,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginTop: 10,
    fontSize: 16,
    color: '#111827'
  },
  confirmTextInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2'
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10
  },
  modalCancelButton: {
    flex: 1,
    height: 55,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalCancelButtonText: {
    color: '#374151'
  },
  modalDeleteButton: {
    flex: 1,
    height: 55,
    borderRadius: 15,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalDeleteButtonText: {
    color: 'white'
  },
  disabledButton: {
    opacity: 0.5
  },
  finalConfirmContainer: {
    alignItems: 'center',
    paddingVertical: 20
  },
  finalConfirmIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  finalTitle: {
    fontSize: 22,
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center'
  },
  finalSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20
  },
  finalWarningBanner: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 30
  },
  finalWarningText: {
    color: '#991B1B',
    fontSize: 14
  },
  finalDeleteButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#EF4444',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15
  },
  finalDeleteButtonText: {
    color: 'white',
    fontSize: 18
  },
  finalCancelButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  finalCancelButtonText: {
    color: '#374151',
    fontSize: 16
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4
  }
})
