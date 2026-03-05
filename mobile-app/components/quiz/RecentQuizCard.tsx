import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from '../ui/Text';

interface RecentQuizCardProps {
  title: string;
  date: string;
  partner1Score: number;
  partner2Score: number;
  totalQuestions?: number;
  partner1Avatar?: string;
  partner2Avatar?: string;
}

export const RecentQuizCard = ({ 
  title, 
  date, 
  partner1Score, 
  partner2Score, 
  totalQuestions = 5,
  partner1Avatar, 
  partner2Avatar 
}: RecentQuizCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Tamamlandı</Text>
        </View>
        <Text style={styles.dateText}>{date}</Text>
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.scoresContainer}>
        <View style={styles.playerInfo}>
          <Image 
            source={partner1Avatar ? { uri: partner1Avatar } : require('../../assets/man-pp.png')} 
            style={[styles.avatar, { borderColor: '#DBEAFE' }]} 
          />
          <Text style={styles.scoreTextBlue}>{partner1Score}/{totalQuestions}</Text>
        </View>
        
        <Text style={styles.dot}>•</Text>
        
        <View style={styles.playerInfo}>
          <Image 
            source={partner2Avatar ? { uri: partner2Avatar } : require('../../assets/woman-pp.png')} 
            style={[styles.avatar, { borderColor: '#FFE4E6' }]} 
          />
          <Text style={styles.scoreTextRose}>{partner2Score}/{totalQuestions}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusText: {
    color: '#15803D',
    fontSize: 10,
  },
  dateText: {
    color: '#9CA3AF',
    fontSize: 10,
  },
  title: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
  },
  scoresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    marginRight: 8,
  },
  scoreTextBlue: {
    color: '#2563EB',
    fontSize: 14,
  },
  scoreTextRose: {
    color: '#E11D48',
    fontSize: 14,
  },
  dot: {
    marginHorizontal: 12,
    color: '#D1D5DB',
  },
});
