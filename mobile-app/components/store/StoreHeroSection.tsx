import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../ui/Text';
import { STORE_COLORS } from '../../constants/store-theme';

const BlobView = ({
  top,
  left,
  right,
  bottom,
  size,
  delay = 0,
}: {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  size: number;
  delay?: number;
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      )
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size * 0.4,
          backgroundColor: 'rgba(255,255,255,0.2)',
          top,
          left,
          right,
          bottom,
        },
        animatedStyle,
      ]}
    />
  );
};

const FloatEmoji = ({
  emoji,
  top,
  left,
  right,
  bottom,
  delay = 0,
  size = 24,
}: {
  emoji: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  delay?: number;
  size?: number;
}) => {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-12, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(6, { duration: 1500 }),
        -1,
        true
      )
    );
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top,
          left,
          right,
          bottom,
          opacity: 0.4,
        },
        animatedStyle,
      ]}
    >
      <Text style={{ fontSize: size }}>{emoji}</Text>
    </Animated.View>
  );
};

export default function StoreHeroSection() {
  return (
    <LinearGradient
      colors={STORE_COLORS.heroGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <BlobView top={20} left={20} size={160} />
      <BlobView bottom={20} right={20} size={128} delay={1500} />
      <FloatEmoji emoji="⭐" top={32} right={32} size={40} />
      <FloatEmoji emoji="❤️" top={64} left={48} size={28} delay={500} />
      <FloatEmoji emoji="✨" bottom={48} left={64} size={32} delay={500} />
      <FloatEmoji emoji="🚀" bottom={64} right={48} size={24} delay={2000} />

      <View style={styles.content}>
        <Text style={styles.emoji}>💕</Text>
        <Text style={styles.title}>
          Evreninizi{'\n'}Büyütün! 🚀
        </Text>
        <Text style={styles.subtitle}>
          Bugün yazdıklarınız, 20 yıl sonra hatırlayacağınız hikâye olacak ✨
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 32,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    color: STORE_COLORS.white,
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    maxWidth: 280,
    textAlign: 'center',
    lineHeight: 22,
  },
});
