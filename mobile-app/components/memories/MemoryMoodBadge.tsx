import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { Heart, Smile, Frown, Mountain, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type MoodType = 'romantic' | 'fun' | 'emotional' | 'adventure' | string;

interface MoodConfig {
  label: string;
  color: string;
  icon: any;
  bgGradient: string[];
  iconColor: string;
  badgeBg: string;
}

export const moodConfigs: Record<string, MoodConfig> = {
  romantic: {
    label: 'Romantik',
    color: '#E11D48',
    icon: Heart,
    bgGradient: ['#F43F5E', '#FB7185'],
    iconColor: '#F43F5E',
    badgeBg: '#FFF1F2',
  },
  fun: {
    label: 'Eğlenceli',
    color: '#D97706',
    icon: Smile,
    bgGradient: ['#F59E0B', '#FBBF24'],
    iconColor: '#F59E0B',
    badgeBg: '#FEF3C7',
  },
  emotional: {
    label: 'Duygusal',
    color: '#2563EB',
    icon: Frown,
    bgGradient: ['#3B82F6', '#60A5FA'],
    iconColor: '#3B82F6',
    badgeBg: '#DBEAFE',
  },
  adventure: {
    label: 'Macera',
    color: '#16A34A',
    icon: Mountain,
    bgGradient: ['#22C55E', '#4ADE80'],
    iconColor: '#22C55E',
    badgeBg: '#DCFCE7',
  },
};

const defaultConfig: MoodConfig = {
  label: 'Anı',
  color: '#4B5563',
  icon: Clock,
  bgGradient: ['#9CA3AF', '#D1D5DB'],
  iconColor: '#9CA3AF',
  badgeBg: '#F3F4F6',
};

export const MemoryMoodBadge = ({ mood, showIcon = true }: { mood: MoodType; showIcon?: boolean }) => {
  const config = moodConfigs[mood] || defaultConfig;
  const Icon = config.icon;

  return (
    <View style={[styles.badge, { backgroundColor: config.badgeBg }]}>
      {showIcon && <Icon size={14} color={config.color} fill={mood === 'romantic' ? config.color : 'none'} style={styles.icon} />}
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

export const MemoryMoodIcon = ({ mood, size = 20 }: { mood: MoodType; size?: number }) => {
  const config = moodConfigs[mood] || defaultConfig;
  const Icon = config.icon;

  return (
    <LinearGradient colors={config.bgGradient} style={styles.iconContainer}>
      <Icon size={size} color="white" fill={mood === 'romantic' ? 'white' : 'none'} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  icon: {
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
