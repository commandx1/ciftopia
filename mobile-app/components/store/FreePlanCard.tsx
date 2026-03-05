import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Rocket, Check, X } from 'lucide-react-native';
import { Text } from '../ui/Text';
import { STORE_COLORS } from '../../constants/store-theme';
import type { PlanLimit } from '../../api/store';
import {
  getPlanTitle,
  getPlanSubtitle,
  buildFreeFeatureItems,
  isUnlimited,
} from '../../utils/planLimits';

interface FreePlanCardProps {
  plan: PlanLimit | null;
  /** Backend'deki mevcut plan; bu kart sadece free iken "Mevcut Plan" gösterir */
  currentPlanCode?: string | null;
}

export default function FreePlanCard({ plan, currentPlanCode }: FreePlanCardProps) {
  if (!plan) return null;

  const title = getPlanTitle(plan);
  const subtitle = getPlanSubtitle(plan);
  const features = buildFreeFeatureItems(plan);
  const showFree = isUnlimited(plan);
  const isCurrentPlan = currentPlanCode === 'free';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.iconBox}>
          <Rocket size={28} color={STORE_COLORS.white} />
        </View>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{showFree ? 'Ücretsiz' : `${plan.price}₺`}</Text>
      </View>

      <View style={styles.featureList}>
        {features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            {f.check ? (
              <Check size={16} color={STORE_COLORS.gray400} style={styles.featureIcon} />
            ) : (
              <X size={16} color={STORE_COLORS.gray400} style={styles.featureIcon} />
            )}
            <Text style={[styles.featureText, !f.check && styles.featureDisabled]}>{f.text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.button} disabled>
        <Text style={styles.buttonText}>{isCurrentPlan ? 'Mevcut Plan' : 'Ücretsiz'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: STORE_COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: STORE_COLORS.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    color: STORE_COLORS.gray800,
    fontSize: 20,
  },
  subtitle: {
    color: STORE_COLORS.gray500,
    fontSize: 12,
    marginTop: 4,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceRow: {
    marginBottom: 20,
  },
  price: {
    color: STORE_COLORS.gray800,
    fontSize: 28,
  },
  featureList: {
    gap: 12,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    marginTop: 2,
  },
  featureText: {
    color: STORE_COLORS.gray600,
    fontSize: 14,
    flex: 1,
  },
  featureDisabled: {
    color: STORE_COLORS.gray400,
    textDecorationLine: 'line-through',
  },
  button: {
    backgroundColor: STORE_COLORS.gray200,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: STORE_COLORS.gray500,
    fontSize: 14,
  },
});
