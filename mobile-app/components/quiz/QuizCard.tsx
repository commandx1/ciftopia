import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../ui/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Heart, Check } from 'lucide-react-native';

interface QuizCardProps {
  currentQuestion: number;
  totalQuestions: number;
  timeLeft: number;
  questionText: string;
  questionType: 'self' | 'guess';
  options: string[];
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
  onNext: () => void;
  disabled?: boolean;
}

export const QuizCard = ({
  currentQuestion,
  totalQuestions,
  timeLeft,
  questionText,
  questionType,
  options,
  selectedOption,
  onSelectOption,
  onNext,
  disabled,
}: QuizCardProps) => {
  const progress = (currentQuestion / totalQuestions) * 100;
  const isGuess = questionType === 'guess';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.progressText}>Soru {currentQuestion}/{totalQuestions}</Text>
          {isGuess && (
            <View style={styles.timerContainer}>
              <Clock size={14} color="#7C3AED" />
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>
          )}
        </View>
        <View style={styles.progressBarBg}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${progress}%` }]}
          />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <LinearGradient colors={['#FFF1F2', '#FFE4E6']} style={styles.iconBg}>
            <Heart size={28} color="#E11D48" fill="#E11D48" />
          </LinearGradient>
        </View>

        <Text style={styles.questionText}>{questionText}</Text>
        <Text style={styles.subtitle}>{!isGuess ? 'Kendiniz için cevaplayın' : 'Partneriniz için tahmin edin!'}</Text>

        <View style={styles.optionsContainer}>
          {options.map((option, index) => {
            const isSelected = selectedOption === option;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionSelected
                ]}
                onPress={() => onSelectOption(option)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option}
                </Text>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <Check size={12} color="#fff" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.nextButton, 
            ((!isGuess && !selectedOption) || disabled) && styles.nextButtonDisabled
          ]}
          onPress={onNext}
          disabled={(!isGuess && !selectedOption) || disabled}
        >
          <LinearGradient
            colors={['#E11D48', '#FB7185']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {isGuess && !selectedOption ? 'Pas Geç' : 'Sonraki Soru'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    color: '#7C3AED',
    fontSize: 14,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: {
    color: '#7C3AED',
    fontSize: 14,
    marginLeft: 6,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 22,
    textAlign: 'center',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 24,
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: '#E11D48',
    backgroundColor: '#FFF1F2',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  optionTextSelected: {
    color: '#E11D48',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
  },
  nextButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
