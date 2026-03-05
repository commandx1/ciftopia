import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Text } from '../ui/Text';
import { Calendar, MapPin, Edit2, Trash2, Images } from 'lucide-react-native';
import { MemoryMoodBadge, moodConfigs } from './MemoryMoodBadge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 80; // Sol çizgi ve paddingler çıktıktan sonra kalan alan

interface MemoryCardProps {
  memory: any;
  onEdit: (memory: any) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (memory: any) => void;
  isUserFavorite: boolean;
  isTogglingFavorite: boolean;
}

export default function MemoryCard({
  memory,
  onEdit,
  onDelete,
}: MemoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const moodConfig = moodConfigs[memory.mood] || { cardBg: '#FFFFFF', iconColor: '#E91E63', badgeBg: '#F3F4F6' };
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
              <Calendar size={12} color="#F43F5E" />
              <Text style={styles.metaText}>{format(dateObj, 'd MMMM yyyy', { locale: tr })}</Text>
            </View>
            {memory.location?.name && (
              <View style={styles.metaItem}>
                <MapPin size={12} color="#F43F5E" />
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
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
    color: '#111827',
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
    color: '#6B7280',
  },
  contentContainer: {
    marginBottom: 15,
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  readMore: {
    color: '#F43F5E',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
});
