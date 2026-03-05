import React from 'react';
import { TextInput as RNTextInput, TextInputProps, StyleSheet } from 'react-native';

export function TextInput(props: TextInputProps) {
  return (
    <RNTextInput
      {...props}
      style={[styles.defaultStyle, props.style]}
      placeholderTextColor={props.placeholderTextColor || '#9CA3AF'}
    />
  );
}

const styles = StyleSheet.create({
  defaultStyle: {
    fontFamily: 'IndieFlower',
  },
});
