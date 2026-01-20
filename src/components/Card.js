// src/components/Card.js - Modern Card Component
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme/theme';

const Card = ({
  children,
  style,
  onPress,
  variant = 'default', // default, elevated, outline
  padding = true,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevated;
      case 'outline':
        return styles.outline;
      default:
        return styles.default;
    }
  };

  const content = (
    <View style={[
      styles.card,
      getVariantStyle(),
      !padding && styles.noPadding,
      style,
    ]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.cardPadding,
  },
  default: {
    ...SHADOWS.md,
  },
  elevated: {
    ...SHADOWS.lg,
  },
  outline: {
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  noPadding: {
    padding: 0,
  },
});

export default Card;