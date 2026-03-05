import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../ui/Text';
import { STORE_COLORS } from '../../constants/store-theme';
import StorePrice from './StorePrice';

const STARS = ['⭐', '🌟', '✨', '⭐', '🌟', '✨', '⭐', '🌟', '✨', '⭐'];

const BULLETS = [
  '10 farklı yıldız animasyonu',
  'Parlama ve ışıldama efektleri',
  'Tüm sayfalarda kullanılabilir',
];

interface StarPackageCardProps {
  price?: number;
}

export default function StarPackageCard({ price }: StarPackageCardProps) {
  const displayPrice = price ?? 39;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>⭐ 10'lu Yıldız Paketi</Text>
          <Text style={styles.subtitle}>Parlayan yıldız efektleri koleksiyonu</Text>
        </View>
        <View style={styles.headerRight}>
          <StorePrice value={displayPrice} color={STORE_COLORS.gray800} size={28} />
          <TouchableOpacity style={styles.buyButton} activeOpacity={0.9}>
            <LinearGradient
              colors={['#f59e0b', '#eab308']}
              style={styles.buyButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buyButtonText}>🛒 Satın Al</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.starGrid}>
        {STARS.map((star, i) => (
          <View key={i} style={styles.starCell}>
            <Text style={styles.starEmoji}>{star}</Text>
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
    backgroundColor: '#fef3c7',
    borderRadius: 24,
    padding: 24,
    borderWidth: 3,
    borderColor: '#fcd34d',
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
  starGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  starCell: {
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  starEmoji: {
    fontSize: 36,
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
