import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart } from 'lucide-react-native';
import { Text } from '../ui/Text';
import { STORE_COLORS } from '../../constants/store-theme';
import StorePrice from './StorePrice';
import type { PlanLimit } from '../../api/store';
import {
  getPlanTitle,
  getPlanSubtitle,
  buildSubscriptionFeatureItems,
} from '../../utils/planLimits';

interface PlusPlanCardProps {
  plan: PlanLimit | null;
  currentPlanCode?: string | null;
  onPurchasePress?: () => void;
  isPurchasing?: boolean;
}

const PulseIconBox = () => {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={[styles.iconBox, animatedStyle]}>
      <LinearGradient
        colors={[STORE_COLORS.pink400, STORE_COLORS.rose500]}
        style={styles.iconGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Heart size={32} color={STORE_COLORS.white} fill={STORE_COLORS.white} />
      </LinearGradient>
    </Animated.View>
  );
};

export default function PlusPlanCard({ plan, currentPlanCode, onPurchasePress, isPurchasing }: PlusPlanCardProps) {
  if (!plan) return null;

  const title = getPlanTitle(plan);
  const subtitle = getPlanSubtitle(plan);
  const features = buildSubscriptionFeatureItems(plan);
  const priceLabel = plan.price;
  const isCurrentPlan = currentPlanCode === 'plus';

  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeEmoji}>🔥</Text>
        <Text style={styles.badgeText}>Popüler</Text>
      </View>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>💖 {title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <PulseIconBox />
      </View>

      <View style={styles.priceRow}>
        <View style={styles.tlRow}>
          <StorePrice value={priceLabel} color={STORE_COLORS.gray800} size={36} />
        </View>
        <Text style={styles.priceUnit}>/ay</Text>
      </View>
      <View style={styles.badgeGreen}>
        <Text style={styles.badgeGreenText}>🎁 Yıllık ödemede 2 ay bedava</Text>
      </View>

      <View style={styles.featureList}>
        {features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureEmoji}>{f.emoji}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.buttonWrap}
        activeOpacity={0.9}
        onPress={isCurrentPlan ? undefined : onPurchasePress}
        disabled={isCurrentPlan || isPurchasing}
      >
        <LinearGradient
          colors={isCurrentPlan ? [STORE_COLORS.gray200, STORE_COLORS.gray200] : STORE_COLORS.plusButtonGradient}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonEmoji}>✨</Text>
          <Text style={[styles.buttonText, isCurrentPlan && styles.buttonTextDisabled]}>
            {isPurchasing ? '...' : isCurrentPlan ? 'Mevcut Plan' : 'Evreni Genişlet'}
          </Text>
          <Text style={styles.buttonEmoji}>✨</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fdf2f8',
    borderRadius: 24,
    padding: 24,
    borderWidth: 3,
    borderColor: STORE_COLORS.pink400,
    shadowColor: STORE_COLORS.pink400,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: STORE_COLORS.pink500,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomLeftRadius: 24,
  },
  badgeText: {
    color: STORE_COLORS.white,
    fontSize: 12,
  },
  badgeEmoji: {
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 20,
  },
  title: {
    color: STORE_COLORS.gray800,
    fontSize: 22,
  },
  subtitle: {
    color: STORE_COLORS.gray600,
    fontSize: 14,
    marginTop: 4,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 24,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  tlRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceUnit: {
    color: STORE_COLORS.gray600,
    fontSize: 16,
  },
  badgeGreen: {
    alignSelf: 'flex-start',
    backgroundColor: '#4ade80',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 24,
  },
  badgeGreenText: {
    color: STORE_COLORS.white,
    fontSize: 12,
  },
  featureList: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureEmoji: {
    fontSize: 18,
  },
  featureText: {
    color: STORE_COLORS.gray600,
    fontSize: 14,
    flex: 1,
  },
  buttonWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    color: STORE_COLORS.white,
    fontSize: 16,
  },
  buttonEmoji: {
    fontSize: 20,
  },
  buttonTextDisabled: {
    color: STORE_COLORS.gray500,
  },
});
