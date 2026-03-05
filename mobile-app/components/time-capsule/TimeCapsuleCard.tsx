import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Text } from '../ui/Text';
import {
  Lock,
  LockOpen,
  Calendar,
  MailOpen,
  Image as ImageIcon,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TimeCapsule } from '../../api/timeCapsule';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface TimeCapsuleCardProps {
  capsule: TimeCapsule;
  onOpen: (id: string) => void;
  /** Kart rengi varyantı (HTML’deki sıra: amber, purple, blue / green, rose) */
  variantIndex?: number;
}

const LOCKED_GRADIENTS = [
  { colors: ['#FBBF24', '#F97316'] as const, bg: ['#FFFBEB', '#FFF7ED'] as const, border: '#FEF3C7', badge: '#FEF3C7', badgeText: '#D97706', icon: '#B45309' },
  { colors: ['#A78BFA', '#6366F1'] as const, bg: ['#FAF5FF', '#EEF2FF'] as const, border: '#E9D5FF', badge: '#F5F3FF', badgeText: '#7C3AED', icon: '#6D28D9' },
  { colors: ['#60A5FA', '#06B6D4'] as const, bg: ['#EFF6FF', '#ECFEFF'] as const, border: '#BFDBFE', badge: '#EFF6FF', badgeText: '#2563EB', icon: '#1D4ED8' },
];

const UNLOCKED_GRADIENTS = [
  { colors: ['#34D399', '#10B981'] as const, bg: ['#ECFDF5', '#D1FAE5'] as const, border: '#A7F3D0', badge: '#D1FAE5', badgeText: '#059669', cta: ['#10B981', '#059669'] as const },
  { colors: ['#FB7185', '#EC4899'] as const, bg: ['#FFF1F2', '#FCE7F3'] as const, border: '#FECDD3', badge: '#FFE4E6', badgeText: '#E11D48', cta: ['#EC4899', '#DB2777'] as const },
];

function getDaysRemaining(unlockDate: Date): number | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const unlock = new Date(unlockDate);
  unlock.setHours(0, 0, 0, 0);
  const diff = Math.ceil((unlock.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  return diff >= 0 ? diff : null;
}

export default function TimeCapsuleCard({
  capsule,
  onOpen,
  variantIndex = 0,
}: TimeCapsuleCardProps) {
  const now = new Date();
  const unlockDate = new Date(capsule.unlockDate);
  const isLocked = unlockDate > now && !capsule.isOpened;

  const lockedTheme = LOCKED_GRADIENTS[variantIndex % LOCKED_GRADIENTS.length];
  const unlockedTheme = UNLOCKED_GRADIENTS[variantIndex % UNLOCKED_GRADIENTS.length];
  const theme = isLocked ? lockedTheme : unlockedTheme;

  const daysLeft = isLocked ? getDaysRemaining(unlockDate) : null;
  const author = capsule.authorId;
  const authorName = author?.firstName ?? '?';
  const photoCount = capsule.photos?.length ?? 0;
  const contentPreview = capsule.content
    ? capsule.content.slice(0, 50).trim() + (capsule.content.length > 50 ? '...' : '')
    : '';

  const getAvatarSource = (authorObj: typeof author) => {
    if (authorObj?.avatar?.url) return { uri: authorObj.avatar.url };
    return authorObj?.gender === 'female'
      ? require('../../assets/woman-pp.png')
      : require('../../assets/man-pp.png');
  };

  const receiverLabel =
    capsule.receiver === 'me'
      ? authorName
      : capsule.receiver === 'partner'
        ? authorName
        : 'İkimiz';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onOpen(capsule._id)}
      style={[styles.card, { borderColor: theme.border }]}
    >
      {/* Header: icon + badge */}
      <View style={styles.cardHeader}>
        <View style={styles.iconBadgeRow}>
          <LinearGradient
            colors={[...(isLocked ? theme.colors : theme.colors)]}
            style={styles.iconCircle}
          >
            {isLocked ? (
              <Lock size={18} color="#FFFFFF" />
            ) : (
              <LockOpen size={18} color="#FFFFFF" />
            )}
          </LinearGradient>
          <View style={[styles.badge, { backgroundColor: theme.badge }]}>
            <Text style={[styles.badgeText, { color: (theme as { badgeText: string }).badgeText }]}>
              {isLocked ? 'KİTLİ' : 'AÇILDI'}
            </Text>
          </View>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {capsule.title}
      </Text>

      {/* Date / opened info box */}
      <View style={[styles.dateBox, { backgroundColor: theme.bg[0] }]}>
        {isLocked ? (
          <View style={styles.dateBoxRow}>
            <View style={styles.dateBoxLeft}>
              <Calendar size={18} color={(theme as typeof lockedTheme).icon} />
              <View>
                <Text style={styles.dateLabel}>Açılma Tarihi</Text>
                <Text style={styles.dateValue}>
                  {format(unlockDate, 'd MMMM yyyy', { locale: tr })}
                </Text>
              </View>
            </View>
            <View style={styles.dateBoxRight}>
              <Text style={[styles.daysNumber, { color: (theme as typeof lockedTheme).icon }]}>
                {daysLeft !== null ? daysLeft : '—'}
              </Text>
              <Text style={styles.daysLabel}>gün</Text>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.dateLabel}>
              Açıldı: {format(unlockDate, 'd MMMM yyyy', { locale: tr })}
            </Text>
            {contentPreview ? (
              <View style={styles.previewBox}>
                <Text style={styles.previewText} numberOfLines={2}>
                  "{contentPreview}"
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>

      {/* Footer: avatar + author, then meta or Oku button */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {capsule.receiver === 'both' ? (
            <View style={styles.avatarStack}>
              <Image
                source={getAvatarSource(author)}
                style={[styles.avatar, styles.avatarStackFirst]}
              />
              <Image
                source={require('../../assets/woman-pp.png')}
                style={[styles.avatar, styles.avatarStackSecond]}
              />
            </View>
          ) : (
            <Image source={getAvatarSource(author)} style={styles.avatar} />
          )}
          <Text style={styles.footerAuthor}>{receiverLabel}</Text>
        </View>
        {isLocked ? (
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Calendar size={12} color={COLORS.gray500} />
              <Text style={styles.metaText}>
                {format(new Date(capsule.createdAt), 'd MMM', { locale: tr })}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <ImageIcon size={12} color={COLORS.gray500} />
              <Text style={styles.metaText}>{photoCount}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.okuBtnWrap}>
            <LinearGradient
              colors={[...(theme as typeof unlockedTheme).cta!]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.okuBtn}
            >
              <MailOpen size={12} color="#FFFFFF" />
              <Text style={styles.okuBtnText}>Oku</Text>
            </LinearGradient>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const COLORS = {
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray900: '#111827',
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
  },
  iconBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 11,
  },
  title: {
    fontSize: 16,
    color: COLORS.gray900,
    marginBottom: 12,
  },
  dateBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  dateBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateBoxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateBoxRight: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    color: COLORS.gray900,
  },
  daysNumber: {
    fontSize: 22,
  },
  daysLabel: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  previewBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
  previewText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FECDD3',
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatarStackFirst: {
    marginRight: -6,
    zIndex: 1,
  },
  avatarStackSecond: {
    borderColor: '#FFFFFF',
  },
  footerAuthor: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  okuBtnWrap: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
  okuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  okuBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
});
