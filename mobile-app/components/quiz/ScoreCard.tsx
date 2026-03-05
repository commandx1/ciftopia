import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from '../ui/Text';
import { LinearGradient } from 'expo-linear-gradient';

interface ScoreCardProps {
  name: string;
  score: number;
  total: number;
  avatar?: string;
  isPartner: boolean;
}

export const ScoreCard = ({ name, score, total, avatar, isPartner }: ScoreCardProps) => {
  const colors = isPartner 
    ? (['#F43F5E', '#E11D48'] as [string, string])
    : (['#3B82F6', '#2563EB'] as [string, string]);

  const progress = (score / total) * 100;

  return (
    <LinearGradient colors={colors} style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={avatar ? { uri: avatar } : (isPartner ? require('../../assets/woman-pp.png') : require('../../assets/man-pp.png'))} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>{name}</Text>
      </View>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.total}>/{total}</Text>
      </View>
      
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    marginRight: 8,
  },
  name: {
    color: '#fff',
    fontSize: 14,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  score: {
    color: '#fff',
    fontSize: 32,
  },
  total: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  progressBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
});
