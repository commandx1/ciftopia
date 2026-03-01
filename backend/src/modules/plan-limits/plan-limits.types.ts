/**
 * Plan limitleri tek kaynak: plan_limits koleksiyonu.
 * Frontend ile paylaşılacak yapı (dashboard coupleInfo.limits).
 */
export interface PlanLimitsDto {
  photosPerContent?: number;
  photosPerAlbum?: number;
  dailyQuiz?: number; // -1 = sınırsız
  storageBytes?: number;
  videoUpload?: boolean;
  maxVideoDuration?: number;
  adFree?: boolean;
  aiCommentFree?: boolean;
  weeklyReport?: boolean;
  yearlyReport?: boolean;
  allCosmetics?: boolean;
}

/** Bilinmeyen plan için varsayılan (free) */
const DEFAULT_FREE_LIMITS: PlanLimitsDto = {
  photosPerContent: 1,
  photosPerAlbum: 7,
  dailyQuiz: 2,
  storageBytes: 52428800, // 50MB
  videoUpload: false,
  adFree: false,
  aiCommentFree: false,
  weeklyReport: false,
  yearlyReport: false,
  allCosmetics: false,
};

export { DEFAULT_FREE_LIMITS };
