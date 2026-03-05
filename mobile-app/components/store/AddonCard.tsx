import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../ui/Text';
import { STORE_COLORS } from '../../constants/store-theme';
import StorePrice from './StorePrice';
import type { PlanLimit } from '../../api/store';
import { getPlanTitle, getPlanSubtitle } from '../../utils/planLimits';

interface AddonCardProps {
  plan: PlanLimit;
}

const ADDON_CARD_STYLE: Record<string, { bg: string; border: string; btnColors: readonly [string, string] }> = {
  planet_package: { bg: '#e0e7ff', border: '#a5b4fc', btnColors: [STORE_COLORS.indigo500, '#3b82f6'] },
  star_package: { bg: '#fef3c7', border: '#fcd34d', btnColors: ['#f59e0b', '#eab308'] },
  extra_storage: { bg: '#ccfbf1', border: '#5eead4', btnColors: [STORE_COLORS.emerald500, STORE_COLORS.teal500] },
};

function getAddonStyle(code: string) {
  return ADDON_CARD_STYLE[code] ?? { bg: '#f3f4f6', border: '#d1d5db', btnColors: ['#6b7280', '#4b5563'] as const };
}

export default function AddonCard({ plan }: AddonCardProps) {
  const title = getPlanTitle(plan);
  const subtitle = getPlanSubtitle(plan) || plan.subtitle || '';
  const style = getAddonStyle(plan.code);

  return (
    <View style={[styles.card, { backgroundColor: style.bg, borderColor: style.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.headerRight}>
          <StorePrice value={plan.price} color={STORE_COLORS.gray800} size={28} />
          <TouchableOpacity style={styles.buyButton} activeOpacity={0.9}>
            <LinearGradient
              colors={[...style.btnColors]}
              style={styles.buyButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buyButtonText}>🛒 Satın Al</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 3,
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
});
