import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Text } from './ui/Text';
import { Heart, Send, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ui/ToastProvider';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const questions = [
  {
    id: 'conflictStyle',
    question: 'Bir sorun seni rahatsız ettiğinde genelde ne yaparsın?',
    options: [
      { label: 'İçime atarım, zamanla geçmesini beklerim', value: 'avoidant' },
      { label: 'Uygun zamanı kollayıp konuşurum', value: 'balanced' },
      { label: 'Anında dile getiririm', value: 'direct' }
    ]
  },
  {
    id: 'conflictResponse',
    question: 'Tartışma sırasında sana en yakın olan davranış hangisi?',
    options: [
      { label: 'Sessizleşirim', value: 'withdraw' },
      { label: 'Konuşarak çözmek isterim', value: 'talk' },
      { label: 'Konuyu değiştirmeyi tercih ederim', value: 'deflect' }
    ]
  },
  {
    id: 'emotionalTrigger',
    question: 'Partnerin beklediğin gibi davranmadığında ilk hissettiğin şey?',
    options: [
      { label: 'Hayal kırıklığı', value: 'disappointment' },
      { label: 'Sinir', value: 'anger' },
      { label: 'Üzüntü', value: 'sadness' },
      { label: 'Çok etkilemez', value: 'low_sensitivity' }
    ]
  },
  {
    id: 'decisionStyle',
    question: 'İlişkide kararlar alınırken hangisi sana daha uygun?',
    options: [
      { label: 'Birlikte uzun uzun konuşmak', value: 'collaborative' },
      { label: 'Hızlı karar almak', value: 'fast' },
      { label: 'Karşı tarafın yönlendirmesi', value: 'passive' }
    ]
  },
  {
    id: 'loveLanguage',
    question: 'Günlük hayatta sevgini daha çok nasıl gösterirsin?',
    options: [
      { label: 'Konuşarak / mesaj atarak', value: 'words' },
      { label: 'Zaman ayırarak', value: 'time' },
      { label: 'Küçük jestler yaparak', value: 'actions' }
    ]
  },
  {
    id: 'coreNeed',
    question: 'Bir ilişkide seni en çok güvende hissettiren şey nedir?',
    options: [
      { label: 'Açık iletişim', value: 'communication' },
      { label: 'Sadakat', value: 'trust' },
      { label: 'İlgi ve zaman', value: 'attention' },
      { label: 'Ortak hedefler', value: 'goals' }
    ],
    isMultiple: true
  },
  {
    id: 'sensitivityArea',
    question: 'Bir ilişkide seni en çok zorlayan durum hangisi?',
    options: [
      { label: 'Belirsizlik', value: 'uncertainty' },
      { label: 'İlgisizlik', value: 'neglect' },
      { label: 'Kıskançlık', value: 'jealousy' },
      { label: 'Maddi konular', value: 'finances' }
    ],
    isMultiple: true
  }
];

export default function RelationshipProfileModal({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  const { user, updateUser } = useAuth();
  const { show: showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({
    coreNeed: [],
    sensitivityArea: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentStep];

  const handleOptionSelect = (value: string) => {
    if (currentQuestion.isMultiple) {
      const currentAnswers = answers[currentQuestion.id] || [];
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter((v: string) => v !== value)
        : [...currentAnswers, value];

      setAnswers({ ...answers, [currentQuestion.id]: newAnswers });
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: value });
      // Auto advance for single choice
      if (currentStep < questions.length - 1) {
        setTimeout(() => setCurrentStep(prev => prev + 1), 300);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await authApi.saveRelationshipProfile(answers, user?.accessToken);
      if (response.success) {
        showToast({
          type: 'success',
          title: 'Başarılı',
          message: 'Profilin başarıyla oluşturuldu!',
        });
        await updateUser({
          relationshipProfile: response.relationshipProfile
        });
        onClose();
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: error?.message || 'Profil kaydedilirken bir hata oluştu.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentQuestionAnswered = () => {
    const answer = answers[currentQuestion.id];
    if (Array.isArray(answer)) return answer.length > 0;
    return !!answer;
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.heartIconBox}>
                <Heart size={32} color="#F43F5E" fill="#F43F5E" />
              </View>
              <Text style={styles.title}>Sizi Daha Yakından Tanıyalım</Text>
              <Text style={styles.subtitle}>
                İlişkinizi daha iyi analiz edebilmemiz için bu soruları cevaplamanız çok önemli.
              </Text>
            </View>

            {/* Question Area */}
            <View style={styles.questionContainer}>
              <View style={styles.stepInfo}>
                <Text style={styles.stepText}>Soru {currentStep + 1} / {questions.length}</Text>
              </View>
              <Text style={styles.questionText}>{currentQuestion.question}</Text>
              {currentQuestion.isMultiple && (
                <Text style={styles.multipleHint}>Birden fazla seçenek belirleyebilirsiniz.</Text>
              )}

              <View style={styles.optionsGrid}>
                {currentQuestion.options.map(option => {
                  const isSelected = currentQuestion.isMultiple
                    ? answers[currentQuestion.id]?.includes(option.value)
                    : answers[currentQuestion.id] === option.value;

                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.7}
                      onPress={() => handleOptionSelect(option.value)}
                      style={[
                        styles.optionButton,
                        isSelected ? styles.optionSelected : styles.optionUnselected
                      ]}
                    >
                      <View style={styles.optionContent}>
                        <Text style={[
                          styles.optionLabel,
                          isSelected ? styles.labelSelected : styles.labelUnselected
                        ]}>
                          {option.label}
                        </Text>
                        {isSelected && <CheckCircle2 size={24} color="#F43F5E" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Footer Actions */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={handleBack}
                disabled={currentStep === 0}
                style={[styles.backBtn, currentStep === 0 && styles.disabledBtn]}
              >
                <ChevronLeft size={20} color={currentStep === 0 ? '#D1D5DB' : '#6B7280'} />
                <Text style={[styles.backBtnText, currentStep === 0 && styles.disabledText]}>Geri</Text>
              </TouchableOpacity>

              {currentStep === questions.length - 1 ? (
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!isCurrentQuestionAnswered() || isSubmitting}
                  style={[styles.submitBtn, !isCurrentQuestionAnswered() && styles.disabledBtn]}
                >
                  <LinearGradient
                    colors={['#F43F5E', '#FB7185']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitGradient}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Text style={styles.submitBtnText}>Tamamla</Text>
                        <Send size={18} color="white" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleNext}
                  disabled={!isCurrentQuestionAnswered()}
                  style={[styles.nextBtn, !isCurrentQuestionAnswered() && styles.disabledBtn]}
                >
                  <Text style={styles.nextBtnText}>İleri</Text>
                  <ChevronRight size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 30,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#F3F4F6',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#F43F5E',
  },
  scrollContent: {
    padding: 25,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heartIconBox: {
    width: 64,
    height: 64,
    backgroundColor: '#FFF1F2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  questionContainer: {
    minHeight: 350,
  },
  stepInfo: {
    marginBottom: 5,
  },
  stepText: {
    fontSize: 12,
    color: '#F43F5E',
    
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 22,
    
    color: '#1F2937',
    marginBottom: 10,
  },
  multipleHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  optionsGrid: {
    gap: 12,
  },
  optionButton: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
  },
  optionUnselected: {
    borderColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#F43F5E',
    backgroundColor: '#FFF1F2',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    flex: 1,
  },
  labelUnselected: {
    color: '#4B5563',
  },
  labelSelected: {
    color: '#F43F5E',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    paddingBottom: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  backBtnText: {
    fontSize: 16,
    
    color: '#6B7280',
  },
  nextBtn: {
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 15,
    gap: 5,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    
  },
  submitBtn: {
    borderRadius: 15,
    overflow: 'hidden',
    minWidth: 140,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 25,
    gap: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    
  },
  disabledBtn: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#D1D5DB',
  },
});
