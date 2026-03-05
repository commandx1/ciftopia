import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { Text } from '../ui/Text';

interface StorePriceProps {
  value: number | string;
  /** Ana fiyat rengi (varsayılan: #1f2937) */
  color?: string;
  /** Ana fiyat font-size (varsayılan: 28) */
  size?: number;
}

const DEFAULT_COLOR = '#1f2937';
const DEFAULT_SIZE = 28;

export default function StorePrice({ value, color, size }: StorePriceProps) {
  const resolvedSize = size ?? DEFAULT_SIZE;
  const resolvedColor = color ?? DEFAULT_COLOR;
  const currencySize = Math.round(resolvedSize * 0.65);

  return (
    <View style={styles.row}>
      <Text style={[styles.amount, { fontSize: resolvedSize, color: resolvedColor }]}>{value}</Text>
      <RNText style={[styles.currency, { fontSize: currencySize, color: resolvedColor }]}>₺</RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amount: {},
  currency: {
    marginLeft: 4,
  },
});


