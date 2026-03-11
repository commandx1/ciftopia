import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { dashboardApi } from '../api/dashboard';

/** Backend'den gelen plan limitleri (plan_limits ile uyumlu) */
export interface PlanLimits {
  photosPerContent?: number;
  photosPerAlbum?: number;
  dailyQuiz?: number;
  ciftoDailyMessages?: number;
  storageBytes?: number;
  videoUpload?: boolean;
  maxVideoDuration?: number;
  adFree?: boolean;
  aiCommentFree?: boolean;
  weeklyReport?: boolean;
  yearlyReport?: boolean;
  allCosmetics?: boolean;
}

export interface CouplePlanInfo {
  planCode: string;
  limits: PlanLimits;
}

interface PlanLimitsContextType {
  planCode: string;
  limits: PlanLimits;
  /** Depolama kullanımı (byte) — dashboard getStats'tan */
  storageUsed: number;
  /** Depolama limiti (byte) — plandan: limits.storageBytes */
  storageLimit: number;
  hasFeature: (feature: keyof PlanLimits) => boolean;
  refreshPlanLimits: () => Promise<void>;
  isLoading: boolean;
}

const defaultLimits: PlanLimits = {
  photosPerContent: 1,
  photosPerAlbum: 7,
  dailyQuiz: 2,
  ciftoDailyMessages: 10,
  storageBytes: 52428800,
  videoUpload: false,
  adFree: false,
  aiCommentFree: false,
  weeklyReport: false,
  yearlyReport: false,
  allCosmetics: false,
};

const PlanLimitsContext = createContext<PlanLimitsContextType | undefined>(undefined);

export function PlanLimitsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [planCode, setPlanCode] = useState<string>('free');
  const [limits, setLimits] = useState<PlanLimits>(defaultLimits);
  const [storageUsed, setStorageUsed] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlanLimits = useCallback(async () => {
    if (!user?.accessToken) {
      setPlanCode('free');
      setLimits(defaultLimits);
      setStorageUsed(0);
      setIsLoading(false);
      return;
    }
    try {
      const res = await dashboardApi.getStats(user.accessToken);
      const info = res?.coupleInfo;
      if (info?.planCode) setPlanCode(info.planCode);
      const nextLimits =
        info?.limits && typeof info.limits === 'object'
          ? { ...defaultLimits, ...info.limits }
          : defaultLimits;
      setLimits(nextLimits);
      setStorageUsed(Number(info?.storageUsed) || 0);
    } catch {
      setPlanCode('free');
      setLimits(defaultLimits);
      setStorageUsed(0);
    } finally {
      setIsLoading(false);
    }
  }, [user?.accessToken]);

  useEffect(() => {
    fetchPlanLimits();
  }, [fetchPlanLimits]);

  const hasFeature = useCallback(
    (feature: keyof PlanLimits): boolean => {
      const value = limits[feature];
      if (typeof value === 'boolean') return value === true;
      return false;
    },
    [limits],
  );

  const value: PlanLimitsContextType = {
    planCode,
    limits,
    storageUsed,
    storageLimit: Number(limits.storageBytes) || defaultLimits.storageBytes!,
    hasFeature,
    refreshPlanLimits: fetchPlanLimits,
    isLoading,
  };

  return (
    <PlanLimitsContext.Provider value={value}>
      {children}
    </PlanLimitsContext.Provider>
  );
}

export function usePlanLimits() {
  const context = useContext(PlanLimitsContext);
  if (context === undefined) {
    throw new Error('usePlanLimits must be used within a PlanLimitsProvider');
  }
  return context;
}
