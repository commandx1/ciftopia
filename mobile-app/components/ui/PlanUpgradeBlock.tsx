import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './Text';

export type PlanUpgradeVariant = 'photos_per_content' | 'photos_per_album' | 'video' | 'custom';

export interface PlanUpgradeBlockProps {
  /** Hangi limit mesajı gösterilecek */
  variant: PlanUpgradeVariant;
  /** Fotoğraf limiti (variant='photos_per_content' | 'photos_per_album' için kullanılır) */
  limit?: number;
  /** Özel metin (variant='custom' için zorunlu) */
  customMessage?: string;
  /** "Planı yükselt" tıklandığında (modal kapat + /store yönlendirme parent'ta yapılır) */
  onUpgradePress: () => void;
  /** CTA buton metni */
  ctaLabel?: string;
}

const MESSAGES: Record<PlanUpgradeVariant, (limit?: number) => string> = {
  photos_per_content: (limit) =>
    `Bu planla anı başına en fazla ${limit ?? 0} fotoğraf ekleyebilirsiniz. Daha fazlası için planınızı yükseltebilirsiniz.`,
  photos_per_album: (limit) =>
    `Bu planla albüm başına en fazla ${limit ?? 0} fotoğraf ekleyebilirsiniz. Daha fazlası için planınızı yükseltebilirsiniz.`,
  video: () =>
    'Video yükleme özelliği mevcut planınızda yok. Planınızı yükselterek açabilirsiniz.',
  custom: () => '',
};

export function PlanUpgradeBlock({
  variant,
  limit,
  customMessage,
  onUpgradePress,
  ctaLabel = 'Planı yükselt',
}: PlanUpgradeBlockProps) {
  const message =
    variant === 'custom'
      ? customMessage ?? ''
      : variant === 'photos_per_content'
        ? MESSAGES.photos_per_content(limit)
        : variant === 'photos_per_album'
          ? MESSAGES.photos_per_album(limit)
          : MESSAGES.video();
  if (!message) return null;

  return (
    <View style={styles.block}>
      <Text style={styles.text}>{message}</Text>
      <TouchableOpacity style={styles.cta} onPress={onUpgradePress} activeOpacity={0.8}>
        <Text style={styles.ctaText}>{ctaLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
    backgroundColor: '#FFFBEB',
    gap: 12,
  },
  text: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
  },
  cta: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FDE68A',
  },
  ctaText: {
    fontSize: 14,
    color: '#92400E',
  },
});
