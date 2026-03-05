import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { usePlanLimits } from '../../context/PlanLimitsContext';
import { dashboardApi } from '../../api/dashboard';
import { storeApi, StorePlansResponse } from '../../api/store';
import { purchasesService, PlanCode } from '../../services/purchases';
import { getRevenueCatApiKey } from '../../constants/revenueCat';
import StoreHeader from '../../components/store/StoreHeader';
import StoreHeroSection from '../../components/store/StoreHeroSection';
import CurrentUsageSection from '../../components/store/CurrentUsageSection';
import FreePlanCard from '../../components/store/FreePlanCard';
import PlusPlanCard from '../../components/store/PlusPlanCard';
import PremiumPlanCard from '../../components/store/PremiumPlanCard';
import ExtrasSection from '../../components/store/ExtrasSection';

const PAGE_BG = ['#fce7f3', '#f5d0fe', '#ffe4e6'] as const;

export default function StoreScreen() {
  const { user, refreshUser } = useAuth();
  const { refreshPlanLimits } = usePlanLimits();
  const [planCode, setPlanCode] = useState<string | null>(null);
  const [plans, setPlans] = useState<StorePlansResponse | null>(null);
  const [purchasingPlan, setPurchasingPlan] = useState<PlanCode | null>(null);
  const [offerings, setOfferings] = useState<{ packages: any[] } | null>(null);

  const fetchDashboard = useCallback(() => {
    if (!user?.accessToken) return;
    dashboardApi.getStats(user.accessToken).then((res) => {
      const info = res?.coupleInfo;
      if (info?.planCode) setPlanCode(info.planCode);
    }).catch(() => {});
  }, [user?.accessToken]);

  useEffect(() => {
    if (!user?.accessToken) return;
    fetchDashboard();
    storeApi.getPlans(user.accessToken).then((data) => setPlans(data)).catch(() => {});
  }, [user?.accessToken, fetchDashboard]);

  useEffect(() => {
    const apiKey = getRevenueCatApiKey();
    if (!apiKey || !purchasesService.isAvailable()) return;
    purchasesService.configure(apiKey).then((ok) => {
      if (!ok) return;
      const coupleId = user?.coupleId?._id ?? user?.coupleId;
      if (coupleId) purchasesService.setAppUserId(String(coupleId));
      purchasesService.getOfferings().then((o) => o && setOfferings({ packages: o.packages }));
    });
  }, [user?.coupleId, user?.coupleId?._id]);

  const handlePurchase = useCallback(async (targetPlan: PlanCode) => {
    if (!user?.accessToken || !offerings?.packages?.length) {
      Alert.alert('Bilgi', 'Satın alma şu an kullanılamıyor. Lütfen geliştirme build ile deneyin veya daha sonra tekrar deneyin.');
      return;
    }
    const pkg = offerings.packages.find((p: any) => purchasesService.planCodeFromPackageIdentifier(p.identifier) === targetPlan)
      ?? offerings.packages[0];
    setPurchasingPlan(targetPlan);
    try {
      const result = await purchasesService.purchasePackage(pkg);
      if (result.success && result.planCode) {
        await storeApi.syncSubscription(user.accessToken, {
          planCode: result.planCode,
          revenueCatAppUserId: user?.coupleId?._id ? String(user.coupleId._id) : undefined,
        });
        fetchDashboard();
        refreshUser?.();
        refreshPlanLimits?.();
        Alert.alert('Başarılı', 'Aboneliğiniz güncellendi.');
      } else if (result.error && !result.error.includes('İptal')) {
        Alert.alert('Hata', result.error);
      }
    } finally {
      setPurchasingPlan(null);
    }
  }, [user?.accessToken, user?.coupleId, offerings, fetchDashboard, refreshUser, refreshPlanLimits]);

  const handleRestore = useCallback(async () => {
    if (!user?.accessToken || !purchasesService.isAvailable()) return;
    const result = await purchasesService.restorePurchases();
    if (result.success && result.planCode && result.planCode !== 'free') {
      await storeApi.syncSubscription(user.accessToken, { planCode: result.planCode });
      fetchDashboard();
      refreshUser?.();
      refreshPlanLimits?.();
      Alert.alert('Başarılı', 'Satın alımlarınız geri yüklendi.');
    } else if (result.error) {
      Alert.alert('Bilgi', result.error);
    } else {
      Alert.alert('Bilgi', 'Geri yüklenecek satın alma bulunamadı.');
    }
  }, [user?.accessToken, fetchDashboard, refreshUser, refreshPlanLimits]);

  const subscriptions = plans?.subscriptions ?? [];
  const addons = plans?.addons ?? [];
  const freePlan = subscriptions.find((p) => p.code === 'free');
  const plusPlan = subscriptions.find((p) => p.code === 'plus');
  const premiumPlan = subscriptions.find((p) => p.code === 'premium');

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={PAGE_BG}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <StoreHeader onRestorePress={handleRestore} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StoreHeroSection />
        <CurrentUsageSection />
        <View style={styles.plans}>
          <FreePlanCard plan={freePlan ?? null} currentPlanCode={planCode} />
          <PlusPlanCard
            plan={plusPlan ?? null}
            currentPlanCode={planCode}
            onPurchasePress={() => handlePurchase('plus')}
            isPurchasing={purchasingPlan === 'plus'}
          />
          <PremiumPlanCard
            plan={premiumPlan ?? null}
            currentPlanCode={planCode}
            onPurchasePress={() => handlePurchase('premium')}
            isPurchasing={purchasingPlan === 'premium'}
          />
        </View>
        <ExtrasSection addons={addons} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  plans: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 24,
  },
});
