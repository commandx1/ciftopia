import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../ui/Text';
import { STORE_COLORS } from '../../constants/store-theme';
import StorePrice from './StorePrice';
import type { PlanLimit } from '../../api/store';
import {
  getPlanTitle,
  getPlanSubtitle,
  buildSubscriptionFeatureItems,
} from '../../utils/planLimits';

const FloatDecor = ({
  emoji,
  top,
  left,
  right,
  bottom,
  delay = 0,
}: {
  emoji: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  delay?: number;
}) => {
  const translateY = useSharedValue(0);
  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-8, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  return (
    <Animated.View
      style={[
        { position: 'absolute', top, left, right, bottom, opacity: 0.4 },
        animatedStyle,
      ]}
    >
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
    </Animated.View>
  );
};

const PREMIUM_BG = ['#9333ea', '#db2777', '#e11d48'] as const;

interface PremiumPlanCardProps {
  plan: PlanLimit | null;
  currentPlanCode?: string | null;
  onPurchasePress?: () => void;
  isPurchasing?: boolean;
}

export default function PremiumPlanCard({ plan, currentPlanCode, onPurchasePress, isPurchasing }: PremiumPlanCardProps) {
  if (!plan) return null;

  const title = getPlanTitle(plan);
  const subtitle = getPlanSubtitle(plan);
  const features = buildSubscriptionFeatureItems(plan);
  const isCurrentPlan = currentPlanCode === 'premium';

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={PREMIUM_BG}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={['rgba(147,51,234,0.4)', 'rgba(219,39,119,0.4)', 'rgba(244,63,94,0.4)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <FloatDecor emoji="⭐" top={24} left={24} />
      <FloatDecor emoji="👑" top={48} right={48} delay={300} />
      <FloatDecor emoji="💎" bottom={48} left={48} delay={600} />
      <FloatDecor emoji="🌟" bottom={24} right={24} delay={900} />

      <View style={styles.inner}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>👑 {title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <View style={styles.iconBox}>
            <Text style={styles.crownEmoji}>👑</Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <StorePrice value={plan.price} color={STORE_COLORS.white} size={44} />
          <Text style={styles.priceUnit}>/ay</Text>
        </View>
        <View style={styles.badgeYellow}>
          <Text style={styles.badgeYellowText}>⚡ En İyi Değer!</Text>
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
            colors={isCurrentPlan ? ['#9ca3af', '#6b7280'] : STORE_COLORS.premiumButtonGradient}
            style={styles.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonEmoji}>🚀</Text>
            <Text style={[styles.buttonText, isCurrentPlan && styles.buttonTextDisabled]}>
              {isPurchasing ? '...' : isCurrentPlan ? 'Mevcut Plan' : 'Galaksini Aç!'}
            </Text>
            <Text style={styles.buttonEmoji}>🚀</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 28,
    borderWidth: 3,
    borderColor: STORE_COLORS.amber400,
    shadowColor: STORE_COLORS.purple500,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
    overflow: 'hidden',
  },
  inner: {
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    color: STORE_COLORS.white,
    fontSize: 22,
  },
  subtitle: {
    color: 'rgba(216,180,254,1)',
    fontSize: 14,
    marginTop: 4,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(251,191,36,1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownEmoji: {
    fontSize: 40,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  priceUnit: {
    color: 'rgba(216,180,254,1)',
    fontSize: 16,
  },
  badgeYellow: {
    alignSelf: 'flex-start',
    backgroundColor: STORE_COLORS.amber400,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 28,
  },
  badgeYellowText: {
    color: STORE_COLORS.gray800,
    fontSize: 14,
  },
  featureList: {
    gap: 12,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureText: {
    color: STORE_COLORS.white,
    fontSize: 14,
    flex: 1,
  },
  buttonWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  buttonText: {
    color: STORE_COLORS.gray800,
    fontSize: 18,
  },
  buttonEmoji: {
    fontSize: 24,
  },
  buttonTextDisabled: {
    color: STORE_COLORS.gray800,
    opacity: 0.8,
  },
});
