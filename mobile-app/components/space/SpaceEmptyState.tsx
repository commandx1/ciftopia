import React from 'react'
import { View, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native'
import { Text } from '../ui/Text'
import { getSpaceAsset, SpaceItemType } from '../../constants/space-assets'

const { width: SCREEN_W } = Dimensions.get('window')

interface EmptyItem {
  id: string
  title: string
  cta: string
  type: SpaceItemType
  route: string
}

interface SpaceEmptyStateProps {
  isVisible: boolean
  items: EmptyItem[]
  onItemPress: (route: string) => void
  onClose: () => void
}

export function SpaceEmptyState({ isVisible, items, onItemPress, onClose }: SpaceEmptyStateProps) {
  if (!isVisible) return null

  return (
    <View style={styles.container}>
      <View style={styles.dimmer} />

      <View style={styles.card}>
        <Text style={styles.title}>Evrenini Doldurmaya Başla</Text>
        <Text style={styles.subtitle}>
          Henüz hiçbir gök cismi oluşmadı. Aşağıdaki alanlardan ilk içeriğini ekleyerek uzayı canlandır.
        </Text>

        <View style={styles.grid}>
          {items.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridItem}
              onPress={() => onItemPress(item.route)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: getSpaceAsset(item.type, 1) }} style={styles.gridImage} resizeMode='contain' />
              <Text style={styles.gridTitle}>{item.title}</Text>
              <Text style={styles.gridCta}>{item.cta}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
          <Text style={styles.secondaryButtonText}>Uzayı İncele</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 120,
    justifyContent: 'center',
    alignItems: 'center'
  },
  dimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)'
  },
  card: {
    width: SCREEN_W * 0.9,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20
  },
  title: {
    fontSize: 20,
    color: '#fef3c7',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(254, 243, 199, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  gridItem: {
    width: '48%',
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.18)'
  },
  gridImage: {
    width: 48,
    height: 48,
    marginBottom: 8
  },
  gridTitle: {
    color: '#fde68a',
    fontSize: 13,
    textAlign: 'center'
  },
  gridCta: {
    color: 'rgba(251, 191, 36, 0.8)',
    fontSize: 11,
    marginTop: 4
  },
  secondaryButton: {
    marginTop: 6,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.35)'
  },
  secondaryButtonText: {
    color: 'rgba(251, 191, 36, 0.9)',
    fontSize: 12,
    letterSpacing: 1
  }
})
