import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../ui/Text';
import { STORE_COLORS } from '../../constants/store-theme';
import StorePrice from './StorePrice';

const PLANETS = [
  { emoji: '☿️', name: 'Merkür', colors: ['#fb923c', '#ef4444'] as const },
  { emoji: '♀️', name: 'Venüs', colors: ['#fcd34d', '#fb923c'] as const },
  { emoji: '🌍', name: 'Dünya', colors: ['#60a5fa', '#4f46e5'] as const },
  { emoji: '♂️', name: 'Mars', colors: ['#ef4444', '#ec4899'] as const },
  { emoji: '🪐', name: 'Satürn', colors: ['#fcd34d', '#fb923c'] as const },
  { emoji: '♆', name: 'Neptün', colors: ['#a78bfa', '#6366f1'] as const },
];

const BULLETS = [
  'Animasyonlu gezegenler',
  'Özel efektler ve parıltılar',
  'Sınırsız kullanım hakkı',
];

interface PlanetPackageCardProps {
  price?: number;
}

export default function PlanetPackageCard({ price }: PlanetPackageCardProps) {
  const displayPrice = price ?? 29;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>🪐 6'lı Gezegen Paketi</Text>
          <Text style={styles.subtitle}>Özel animasyonlu gezegen koleksiyonu</Text>
        </View>
        <View style={styles.headerRight}>
          <StorePrice value={displayPrice} color={STORE_COLORS.gray800} size={28} />
          <TouchableOpacity style={styles.buyButton} activeOpacity={0.9}>
            <LinearGradient
              colors={[STORE_COLORS.indigo500, '#3b82f6']}
              style={styles.buyButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buyButtonText}>🛒 Satın Al</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.planetGrid}>
        {PLANETS.map((p, i) => (
          <View key={i} style={styles.planetItem}>
            <LinearGradient
              colors={p.colors}
              style={styles.planetCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.planetEmoji}>{p.emoji}</Text>
            </LinearGradient>
            <Text style={styles.planetName}>{p.name}</Text>
          </View>
        ))}
      </View>

      <View style={styles.bulletBox}>
        {BULLETS.map((b, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletCheck}>✅</Text>
            <Text style={styles.bulletText}>{b}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#e0e7ff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 3,
    borderColor: '#a5b4fc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    color: STORE_COLORS.gray800,
    fontSize: 20,
    marginBottom: 4,
  },
  subtitle: {
    color: STORE_COLORS.gray600,
    fontSize: 14,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  price: {
    color: STORE_COLORS.gray800,
    fontSize: 28,
  },
  buyButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buyButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buyButtonText: {
    color: STORE_COLORS.white,
    fontSize: 14,
  },
  planetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  planetItem: {
    width: '30%',
    alignItems: 'center',
  },
  planetCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  planetEmoji: {
    fontSize: 28,
  },
  planetName: {
    color: STORE_COLORS.gray600,
    fontSize: 12,
  },
  bulletBox: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletCheck: {
    fontSize: 18,
  },
  bulletText: {
    color: STORE_COLORS.gray600,
    fontSize: 14,
  },
});
