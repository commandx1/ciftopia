import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';

interface CategoryCardProps {
  title: string;
  count: string;
  icon: LucideIcon;
  colors: [string, string];
  bgColors: [string, string];
  onPress: () => void;
}

export const CategoryCard = ({ title, count, icon: Icon, colors, bgColors, onPress }: CategoryCardProps) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient colors={bgColors} style={styles.gradient}>
        <LinearGradient colors={colors} style={styles.iconContainer}>
          <Icon color="#fff" size={24} />
        </LinearGradient>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.count}>{count}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 6,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  gradient: {
    padding: 16,
    height: 120,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 2,
  },
  count: {
    fontSize: 12,
    color: '#6B7280',
  },
});
