import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../constants/Colors';
import { typography } from '../../constants/Typography';
import { borderRadius, shadows, spacing } from '../../constants/Layout';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.surface : colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    ...shadows.sm,
  },

  // Variants - used dynamically via styles[variant]
  // eslint-disable-next-line react-native/no-unused-styles
  primary: {
    backgroundColor: colors.primary,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  secondary: {
    backgroundColor: colors.secondary,
  },
  // eslint-disable-next-line react-native/no-unused-styles, react-native/sort-styles
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  ghost: {
    backgroundColor: 'transparent',
  },

  // Sizes - used dynamically via styles[size]
  // eslint-disable-next-line react-native/no-unused-styles
  small: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  medium: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  large: {
    minHeight: 56,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },

  // States
  disabled: {
    opacity: 0.5,
  },

  // Text styles - used dynamically via styles[`${variant}Text`]
  text: {
    ...typography.button,
    textAlign: 'center',
  },
  // eslint-disable-next-line react-native/no-unused-styles
  primaryText: {
    color: colors.surface,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  secondaryText: {
    color: colors.text,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  outlineText: {
    color: colors.primary,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  ghostText: {
    color: colors.primary,
  },
  disabledText: {
    opacity: 0.7,
  },

  // Size-specific text - used dynamically via styles[`${size}Text`]
  // eslint-disable-next-line react-native/no-unused-styles
  smallText: {
    fontSize: 14,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  mediumText: {
    fontSize: 16,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  largeText: {
    fontSize: 18,
  },
});
