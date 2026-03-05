import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../ui/Text';
import { STORE_COLORS } from '../../constants/store-theme';
import StorePrice from './StorePrice';

const BULLETS = [
  '5GB ekstra depolama alanı',
  'Sınırsız süre kullanım',
  'Tüm medya türleri desteklenir',
];

interface ExtraStorageCardProps {
  price?: number;
}

export default function ExtraStorageCard({ price }: ExtraStorageCardProps) {
  const displayPrice = price ?? 49;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>💾 +5GB Ekstra Alan</Text>
          <Text style={styles.subtitle}>Daha fazla anı için ek depolama</Text>
        </View>
        <View style={styles.headerRight}>
          <StorePrice value={displayPrice} color={STORE_COLORS.gray800} size={28} />
          <TouchableOpacity style={styles.buyButton} activeOpacity={0.9}>
            <LinearGradient
              colors={[STORE_COLORS.emerald500, STORE_COLORS.teal500]}
              style={styles.buyButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buyButtonText}>🛒 Satın Al</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.storageBox}>
        <View style={styles.storageIconWrap}>
          <Text style={styles.storageEmoji}>💾</Text>
          <View style={styles.badgePlus}>
            <Text style={styles.badgePlusText}>+5</Text>
          </View>
        </View>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Mevcut Alan</Text>
          <Text style={styles.barValue}>500MB</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: '30%' }]} />
        </View>
        <Text style={styles.afterText}>⬇️ Satın aldıktan sonra</Text>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Yeni Toplam Alan</Text>
          <Text style={styles.barValueNew}>5.5GB</Text>
        </View>
        <View style={styles.track}>
          <LinearGradient
            colors={[STORE_COLORS.emerald500, STORE_COLORS.teal500]}
            style={[styles.trackFillGradient, { width: '30%' }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
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
    backgroundColor: '#ccfbf1',
    borderRadius: 24,
    padding: 24,
    borderWidth: 3,
    borderColor: '#5eead4',
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
  storageBox: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  storageIconWrap: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  storageEmoji: {
    fontSize: 48,
  },
  badgePlus: {
    position: 'absolute',
    top: -12,
    right: '50%',
    marginRight: -60,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePlusText: {
    color: STORE_COLORS.white,
    fontSize: 18,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barLabel: {
    color: STORE_COLORS.gray600,
    fontSize: 14,
  },
  barValue: {
    color: STORE_COLORS.gray800,
    fontSize: 14,
  },
  barValueNew: {
    color: '#047857',
    fontSize: 18,
  },
  track: {
    height: 8,
    backgroundColor: STORE_COLORS.gray200,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 12,
  },
  trackFill: {
    height: '100%',
    backgroundColor: '#9ca3af',
    borderRadius: 999,
  },
  trackFillGradient: {
    height: '100%',
    borderRadius: 999,
  },
  afterText: {
    color: STORE_COLORS.emerald500,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
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
