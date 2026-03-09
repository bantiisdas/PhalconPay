import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  disabled = false,
  fullWidth,
  style,
  ...pressableProps
}: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      {...pressableProps}>
      <Text style={[styles.text, styles[`text_${variant}`], disabled && styles.textDisabled]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.card,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  text_primary: {
    color: colors.text,
  },
  text_secondary: {
    color: colors.text,
  },
  text_outline: {
    color: colors.primary,
  },
  text_ghost: {
    color: colors.primary,
  },
  textDisabled: {
    color: colors.secondaryText,
  },
});
