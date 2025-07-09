import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/Colors';
import { borderRadius, shadows, spacing } from '../../constants/Layout';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof spacing;
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  style,
}: CardProps) {
  const cardStyles = [
    styles.base,
    styles[variant],
    styles[`padding_${padding}`],
    style,
  ];

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },

  // Variants - used dynamically via styles[variant]
  // eslint-disable-next-line react-native/no-unused-styles
  default: {
    ...shadows.none,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  elevated: {
    ...shadows.md,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  outlined: {
    borderColor: colors.border,
    borderWidth: 1,
    ...shadows.none,
  },

  // Padding variants - used dynamically via styles[`padding_${padding}`]
  // eslint-disable-next-line react-native/no-unused-styles
  padding_lg: {
    padding: spacing.lg,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  padding_md: {
    padding: spacing.md,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  padding_sm: {
    padding: spacing.sm,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  padding_xl: {
    padding: spacing.xl,
  },
});
