import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Database } from 'lucide-react-native';
import { Text } from '../ui/Text';
import { STORE_COLORS } from '../../constants/store-theme';
import { usePlanLimits } from '../../context/PlanLimitsContext';

const BYTES_TO_MB = 1024 * 1024;

/**
 * Depolama kullanımını mevcut plana göre gösterir.
 * Limit: plan_limits.storageBytes (PlanLimitsContext).
 */
export default function CurrentUsageSection() {
  const { storageUsed, storageLimit } = usePlanLimits();
  const usedMB =
    storageUsed != null ? Math.round(storageUsed / BYTES_TO_MB) : 0;
  const totalMB =
    storageLimit != null ? Math.round(storageLimit / BYTES_TO_MB) : 0;
  const percent = totalMB > 0 ? Math.min(100, (usedMB / totalMB) * 100) : 0;

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>🌌 Evren Alanınız</Text>
            <Text style={styles.cardSubtitle}>Mevcut kullanım durumunuz</Text>
          </View>
          <View style={styles.iconBox}>
            <LinearGradient
              colors={[STORE_COLORS.pink400, STORE_COLORS.rose500]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Database size={28} color={STORE_COLORS.white} />
            </LinearGradient>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>📦 Depolama</Text>
            <Text style={styles.barValue}>{usedMB}MB / {totalMB}MB</Text>
          </View>
          <View style={styles.track}>
            <View style={styles.barInner}>
              <LinearGradient
                colors={[STORE_COLORS.pink400, STORE_COLORS.rose400, STORE_COLORS.pink500]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.barFill, { width: `${percent}%` }]}
              />
            </View>
          </View>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningEmoji}>⚠️</Text>
          <Text style={styles.warningText}>
            Free plan'da içerik başına sadece <Text style={styles.warningBold}>1 fotoğraf</Text> ekleyebilirsin. Premium'a geçerek sınırsız anı biriktir! 🎉
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginTop: -32,
    marginBottom: 24,
    zIndex: 20,
  },
  card: {
    backgroundColor: STORE_COLORS.white,
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: '#fbcfe8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardTitle: {
    color: STORE_COLORS.gray800,
    fontSize: 18,
  },
  cardSubtitle: {
    color: STORE_COLORS.gray500,
    fontSize: 12,
    marginTop: 4,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 24,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 16,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  barLabel: {
    color: STORE_COLORS.gray600,
    fontSize: 14,
  },
  barValue: {
    color: STORE_COLORS.pink600,
    fontSize: 14,
  },
  track: {
    height: 12,
    backgroundColor: STORE_COLORS.gray200,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barInner: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
    position: 'relative',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#fcd34d',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  warningEmoji: {
    fontSize: 24,
  },
  warningText: {
    flex: 1,
    color: '#92400e',
    fontSize: 12,
    lineHeight: 20,
  },
  warningBold: {
  },
});
