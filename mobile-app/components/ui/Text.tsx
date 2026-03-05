import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

export function Text(props: TextProps) {
  return (
    <RNText
      {...props}
      style={[styles.defaultStyle, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  defaultStyle: {
    fontFamily: 'IndieFlower',
  },
});
