/**
 * PhalconPay design system – 8px spacing grid.
 * Use these values for padding, margins, and gaps.
 */

export const spacing = {
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px */
  lg: 16,
  /** 24px */
  xl: 24,
  /** 32px */
  xxl: 32,
  /** 40px */
  xxxl: 40,
  /** 48px */
  huge: 48,
  /** 64px */
  massive: 64,
} as const;

export type SpacingKey = keyof typeof spacing;
