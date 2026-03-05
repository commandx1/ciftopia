import type { PlanLimit } from '../api/store';

const BYTES_PER_MB = 1024 * 1024;
const BYTES_PER_GB = 1024 * 1024 * 1024;

/** MongoDB Long veya number olarak gelebilir */
function parseStorageBytes(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string') return parseInt(v, 10) || 0;
  if (v != null && typeof v === 'object' && '$numberLong' in (v as object))
    return parseInt(String((v as { $numberLong: string }).$numberLong), 10) || 0;
  return 0;
}

export function formatStorageBytes(bytes: unknown): string {
  const n = parseStorageBytes(bytes);
  if (n >= BYTES_PER_GB) return `${Math.round(n / BYTES_PER_GB)}GB`;
  return `${Math.round(n / BYTES_PER_MB)}MB`;
}

export function getPlanTitle(plan: PlanLimit): string {
  if (plan.title) return plan.title;
  const t: Record<string, string> = {
    free: 'Başlangıç Evreni',
    plus: 'Genişleyen Evren',
    premium: 'Kalıcı Galaksi',
    planet_package: "6'lı Gezegen Paketi",
    star_package: "10'lu Yıldız Paketi",
    extra_storage: '+5GB Ekstra Alan',
  };
  return t[plan.code] ?? plan.code;
}

export function getPlanSubtitle(plan: PlanLimit): string {
  if (plan.subtitle) return plan.subtitle;
  const t: Record<string, string> = {
    free: 'İlk yıldızlarınızı ekleyin',
    plus: 'Bazı anılar tek fotoğrafa sığmaz',
    premium: 'Anılarınızı geleceğe taşıyın',
    planet_package: 'Özel animasyonlu gezegen koleksiyonu',
    star_package: 'Parlayan yıldız efektleri koleksiyonu',
    extra_storage: 'Daha fazla anı için ek depolama',
  };
  return t[plan.code] ?? '';
}

/** Free plan: check/cross list (limits'ten) */
export function buildFreeFeatureItems(plan: PlanLimit): { text: string; check: boolean }[] {
  const l = plan.limits;
  if (!l) return [];

  const items: { text: string; check: boolean }[] = [];

  const photosContent = l.photosPerContent ?? 0;
  items.push({
    text: `İçerik başına ${photosContent} fotoğraf`,
    check: true,
  });

  const photosAlbum = l.photosPerAlbum ?? 0;
  items.push({
    text: `Galeri albümü başına ${photosAlbum} fotoğraf`,
    check: true,
  });

  const quiz = l.dailyQuiz ?? 0;
  items.push({
    text: quiz < 0 ? 'Günlük sınırsız quiz' : `Günlük ${quiz} quiz`,
    check: true,
  });

  items.push({
    text: l.aiCommentFree ? 'AI yorumu reklamsız' : 'AI yorumu reklam izleyerek',
    check: true,
  });

  const storageStr = formatStorageBytes(l.storageBytes);
  items.push({
    text: `${storageStr} toplam medya alanı`,
    check: true,
  });

  items.push({
    text: 'Video yükleme',
    check: l.videoUpload === true,
  });

  return items;
}

/** Plus/Premium: emoji + text list (limits'ten) */
export function buildSubscriptionFeatureItems(plan: PlanLimit): { emoji: string; text: string }[] {
  const l = plan.limits;
  if (!l) return [];

  const items: { emoji: string; text: string }[] = [];

  const photosContent = l.photosPerContent ?? 0;
  const photosStr = photosContent >= 50 ? 'Sınırsız fotoğraf' : `İçerik başına ${photosContent} fotoğraf`;
  items.push({ emoji: '📸', text: photosStr });

  const photosAlbum = l.photosPerAlbum ?? 0;
  const albumStr = photosAlbum >= 500 ? `Albüm başına ${photosAlbum} fotoğraf` : `Albüm başına ${photosAlbum} fotoğraf`;
  items.push({ emoji: '🖼️', text: albumStr });

  if (l.adFree) items.push({ emoji: '🚫', text: 'Reklamsız kullanım' });
  if (l.aiCommentFree) items.push({ emoji: '🤖', text: 'AI yorumu reklamsız' });

  const quiz = l.dailyQuiz ?? 0;
  const quizStr = quiz < 0 ? 'Sınırsız günlük soru' : `Günlük ${quiz} quiz`;
  items.push({ emoji: '❓', text: quizStr });

  const storageStr = formatStorageBytes(l.storageBytes);
  items.push({ emoji: '💾', text: `${storageStr} medya alanı` });

  if (l.videoUpload) {
    const maxSec = l.maxVideoDuration ?? 180;
    const minStr = maxSec >= 60 ? `${Math.round(maxSec / 60)} dakikaya kadar video` : 'Video yükleme';
    items.push({ emoji: '🎬', text: minStr });
  }

  if (l.weeklyReport) items.push({ emoji: '📊', text: 'Haftalık ilişki özeti' });
  if (l.yearlyReport) items.push({ emoji: '📈', text: 'Yıllık duygu raporu' });
  if (l.allCosmetics) items.push({ emoji: '🎨', text: 'Tüm kozmetik paketler' });

  return items;
}

export function isUnlimited(plan: PlanLimit): boolean {
  return plan.price === 0;
}

/** Plan limitinden etkin fotoğraf sayısı: -1 = sınırsız (UI için yüksek tavan), yoksa fallback */
export function getEffectivePhotoLimit(value: number | undefined | null, fallback: number): number {
  if (value === undefined || value === null) return fallback;
  if (value < 0) return 50; // sınırsız için makul UI üst sınırı
  return value;
}
