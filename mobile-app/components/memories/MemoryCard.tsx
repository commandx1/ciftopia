import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator } from 'react-native';
import { Text } from '../ui/Text';
import { Calendar, MapPin, Edit2, Trash2, Images, Music, Play } from 'lucide-react-native';
import { MemoryMoodBadge, moodConfigs } from './MemoryMoodBadge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { romanticRoseTheme } from '../../theme/romanticRose';
import { nightBlueTheme } from '../../theme/nightBlue';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 80; // Sol çizgi ve paddingler çıktıktan sonra kalan alan

const themes = {
  romanticRose: romanticRoseTheme,
  nightBlue: nightBlueTheme,
} as const;

const theme = themes.romanticRose;

interface MemoryCardProps {
  memory: any;
  onEdit: (memory: any) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (memory: any) => void;
  isUserFavorite: boolean;
  isTogglingFavorite: boolean;
  onGenerateSong?: (memoryId: string) => Promise<void>;
  isGeneratingSong?: boolean;
  onPlaySong?: (memory: any) => void;
}

export default function MemoryCard({
  memory,
  onEdit,
  onDelete,
  onGenerateSong,
  isGeneratingSong,
  onPlaySong,
}: MemoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const moodConfig =
    moodConfigs[memory.mood] || { cardBg: theme.card, iconColor: theme.accent, badgeBg: theme.cardSoft };
  const dateObj = new Date(memory.date);
  const MoodIcon = moodConfig.icon;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / CARD_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Timeline Column */}
      <View style={styles.timelineCol}>
        <View style={[styles.moodIconCircle, { backgroundColor: moodConfig.badgeBg || '#F3F4F6' }]}>
          <MoodIcon size={16} color={moodConfig.iconColor} fill={memory.mood === 'romantic' ? moodConfig.iconColor : 'none'} />
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.card}>
        {/* Swiper Image Container */}
        {memory.photos && memory.photos.length > 0 && (
          <View style={styles.imageContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={styles.swiper}
            >
              {memory.photos.map((photo: any, index: number) => (
                <Image
                  key={index}
                  source={{ uri: typeof photo === 'string' ? photo : photo.url }}
                  style={[styles.image, { width: CARD_WIDTH }]}
                />
              ))}
            </ScrollView>

            {/* Pagination Dots */}
            {memory.photos.length > 1 && (
              <View style={styles.pagination}>
                {memory.photos.map((_: any, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      activeIndex === index ? styles.activeDot : styles.inactiveDot
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Photo Count Badge */}
            <View style={styles.photoCountBadge}>
              <Images size={10} color="white" />
              <Text style={styles.photoCountText}>{memory.photos.length} fotoğraf</Text>
            </View>
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.title}>{memory.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Calendar size={12} color={theme.accent} />
              <Text style={styles.metaText}>{format(dateObj, 'd MMMM yyyy', { locale: tr })}</Text>
            </View>
            {memory.location?.name && (
              <View style={styles.metaItem}>
                <MapPin size={12} color={theme.accent} />
                <Text style={styles.metaText} numberOfLines={1}>{memory.location.name}</Text>
              </View>
            )}
          </View>

          <View style={styles.contentContainer}>
            <Text 
              style={styles.description} 
              numberOfLines={isExpanded ? undefined : 2}
            >
              {memory.content}
            </Text>
            {!isExpanded && memory.content.length > 100 && (
              <TouchableOpacity onPress={() => setIsExpanded(true)}>
                <Text style={styles.readMore}> devamını oku</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <MemoryMoodBadge mood={memory.mood} />
            <View style={styles.actions}>
              {memory.generatedSongUrl && (
                <TouchableOpacity
                  onPress={() => onPlaySong?.(memory)}
                  style={styles.actionBtn}
                >
                  <Play size={14} color={theme.accent} />
                </TouchableOpacity>
              )}
              {onGenerateSong && (
                <TouchableOpacity
                  onPress={() => onGenerateSong(memory._id)}
                  disabled={!!isGeneratingSong}
                  style={styles.actionBtn}
                >
                  {isGeneratingSong ? (
                    <ActivityIndicator size="small" color={theme.accent} />
                  ) : (
                    <Music size={14} color={theme.accent} />
                  )}
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => onEdit(memory)} style={styles.actionBtn}>
                <Edit2 size={14} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(memory._id)} style={styles.actionBtn}>
                <Trash2 size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingRight: 20,
    marginBottom: 10,
  },
  timelineCol: {
    width: 60,
    alignItems: 'center',
    paddingTop: 20,
  },
  moodIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: theme.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.borderSofter,
    marginVertical: 5,
  },
  imageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  swiper: {
    flex: 1,
  },
  image: {
    height: 200,
    resizeMode: 'cover',
  },
  pagination: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 16,
    backgroundColor: 'white',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  photoCountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  photoCountText: {
    color: 'white',
    fontSize: 9,
  },
  body: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: theme.textSecondary,
  },
  contentContainer: {
    marginBottom: 15,
  },
  description: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  readMore: {
    color: theme.accent,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.cardSoft,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
});
