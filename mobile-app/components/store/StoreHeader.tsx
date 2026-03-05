import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import { Text } from '../ui/Text';
import { STORE_COLORS } from '../../constants/store-theme';

interface StoreHeaderProps {
  onRestorePress?: () => void;
}

export default function StoreHeader({ onRestorePress }: StoreHeaderProps) {
  const router = useRouter();

  return (
    <LinearGradient
      colors={STORE_COLORS.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color={STORE_COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>✨ Mağaza</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onRestorePress}
          activeOpacity={0.8}
          disabled={!onRestorePress}
        >
          <RefreshCw size={20} color={STORE_COLORS.white} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 24,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: STORE_COLORS.white,
    fontSize: 20,
  },
});
