import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import AddonCard from './AddonCard';
import type { PlanLimit } from '../../api/store';

interface ExtrasSectionProps {
  addons: PlanLimit[];
}

export default function ExtrasSection({ addons }: ExtrasSectionProps) {
  if (!addons?.length) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>🎨 Evrenini Özelleştir</Text>
        <Text style={styles.subtitle}>
          Tek seferlik satın alımlarla özel deneyim yaşa! ✨
        </Text>
      </View>
      <View style={styles.cards}>
        {addons.map((plan) => (
          <AddonCard key={plan._id} plan={plan} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#1f2937',
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    color: '#4b5563',
    fontSize: 14,
  },
  cards: {
    gap: 24,
  },
});
