/**
 * RevenueCat (react-native-purchases) entegrasyonu.
 * Development build gerekir; Expo Go'da çalışmaz.
 */
/// <reference path="../types/react-native-purchases.d.ts" />

type PurchasesModule = {
  configure: (o: { apiKey: string }) => Promise<void>;
  logIn: (id: string) => Promise<any>;
  getOfferings: () => Promise<any>;
  purchasePackage: (p: any) => Promise<any>;
  restorePurchases: () => Promise<any>;
};

let PURCHASES: PurchasesModule | null = null;
try {
  const mod = require('react-native-purchases');
  PURCHASES = mod?.default ?? null;
} catch {
  PURCHASES = null;
}

export type PlanCode = 'free' | 'plus' | 'premium';

/** RevenueCat package identifier -> backend planCode */
const PACKAGE_TO_PLAN: Record<string, PlanCode> = {
  plus_monthly: 'plus',
  plus_annual: 'plus',
  premium_monthly: 'premium',
  premium_annual: 'premium',
  $rc_monthly: 'plus',
  $rc_annual: 'plus',
  $rc_lifetime: 'premium',
};

/** Entitlement identifier -> planCode (RevenueCat dashboard'da tanımlı) */
const ENTITLEMENT_TO_PLAN: Record<string, PlanCode> = {
  plus: 'plus',
  premium: 'premium',
  pro: 'premium',
};

let isConfigured = false;

export const purchasesService = {
  isAvailable(): boolean {
    return typeof PURCHASES?.configure === 'function';
  },

  async configure(apiKey: string | undefined): Promise<boolean> {
    if (!PURCHASES || !apiKey?.trim()) return false;
    try {
      await PURCHASES.configure({ apiKey: apiKey.trim() });
      isConfigured = true;
      return true;
    } catch (e) {
      console.warn('RevenueCat configure error:', e);
      return false;
    }
  },

  async setAppUserId(coupleId: string): Promise<void> {
    if (!isConfigured || !PURCHASES) return;
    try {
      await PURCHASES.logIn(coupleId);
    } catch (e) {
      console.warn('RevenueCat logIn error:', e);
    }
  },

  async getOfferings(): Promise<{ packages: any[]; currentOffering: any } | null> {
    if (!isConfigured || !PURCHASES) return null;
    try {
      const offerings = await PURCHASES.getOfferings();
      const current = offerings.current;
      if (!current?.availablePackages?.length) return { packages: [], currentOffering: current };
      return {
        packages: current.availablePackages,
        currentOffering: current,
      };
    } catch (e) {
      console.warn('RevenueCat getOfferings error:', e);
      return null;
    }
  },

  planCodeFromPackageIdentifier(identifier: string): PlanCode | null {
    return PACKAGE_TO_PLAN[identifier] ?? null;
  },

  planCodeFromCustomerInfo(customerInfo: any): PlanCode {
    if (!customerInfo?.entitlements?.active) return 'free';
    const active = customerInfo.entitlements.active;
    if (active.premium || active.pro) return 'premium';
    if (active.plus) return 'plus';
    return 'free';
  },

  async purchasePackage(pkg: any): Promise<{ success: boolean; planCode?: PlanCode; error?: string }> {
    if (!isConfigured || !PURCHASES) {
      return { success: false, error: 'Satın alma yapılandırılmamış.' };
    }
    try {
      const { customerInfo } = await PURCHASES.purchasePackage(pkg);
      const planCode = this.planCodeFromCustomerInfo(customerInfo);
      const fromPackage = this.planCodeFromPackageIdentifier(pkg.identifier);
      const finalPlan = fromPackage ?? planCode;
      return { success: true, planCode: finalPlan };
    } catch (e: any) {
      const isCancelled = e?.userCancelled === true;
      return {
        success: false,
        error: isCancelled ? 'İptal edildi.' : e?.message ?? 'Satın alma başarısız.',
      };
    }
  },

  async restorePurchases(): Promise<{ success: boolean; planCode?: PlanCode; error?: string }> {
    if (!isConfigured || !PURCHASES) {
      return { success: false, error: 'Satın alma yapılandırılmamış.' };
    }
    try {
      const customerInfo = await PURCHASES.restorePurchases();
      const planCode = this.planCodeFromCustomerInfo(customerInfo);
      return { success: true, planCode };
    } catch (e: any) {
      return {
        success: false,
        error: e?.message ?? 'Geri yükleme başarısız.',
      };
    }
  },
};
