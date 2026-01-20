// src/components/Button.js - FIXED
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../theme/theme';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'ghost':
        return styles.ghostButton;
      case 'danger':
        return styles.dangerButton;
      default:
        return styles.primaryButton;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'medium':
        return styles.mediumButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  const getTextVariant = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
      case 'ghost':
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'medium':
        return styles.mediumText;
      case 'large':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? COLORS.textInverse : COLORS.primary}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={size === 'small' ? 16 : size === 'large' ? 20 : 18}
              color={variant === 'primary' || variant === 'danger' ? COLORS.textInverse : COLORS.primary}
              style={styles.iconLeft}
            />
          )}
          <Text style={[getTextVariant(), getTextSize(), textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={size === 'small' ? 16 : size === 'large' ? 20 : 18}
              color={variant === 'primary' || variant === 'danger' ? COLORS.textInverse : COLORS.primary}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  
  // Variant Styles
  primaryButton: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  secondaryButton: {
    backgroundColor: COLORS.primaryBg,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  dangerButton: {
    backgroundColor: COLORS.accentRed,
    ...SHADOWS.sm,
  },
  
  // Size Styles
  smallButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  mediumButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  largeButton: {
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.xl,
  },
  
  // Text Variants
  primaryText: {
    color: COLORS.textInverse,
    fontWeight: TYPOGRAPHY.semibold,
  },
  secondaryText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.semibold,
  },
  outlineText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.semibold,
  },
  
  // Text Sizes
  smallText: {
    fontSize: TYPOGRAPHY.bodySmall,
  },
  mediumText: {
    fontSize: TYPOGRAPHY.body,
  },
  largeText: {
    fontSize: TYPOGRAPHY.h5,
  },
  
  // Icon Styles
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});

export default Button;