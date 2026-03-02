/**
 * Upload modülü sabitleri.
 * İş kuralları tek yerde; backend yetkili kaynak.
 */

/** Yüklenen videonun maksimum boyutu (100MB). */
export const MAX_VIDEO_UPLOAD_BYTES = 100 * 1024 * 1024;

/** S3 tek PUT isteği üst sınırı (5GB). İş kuralı değil, altyapı limiti. */
export const MAX_VIDEO_S3_PUT_BYTES = 5 * 1024 * 1024 * 1024;
