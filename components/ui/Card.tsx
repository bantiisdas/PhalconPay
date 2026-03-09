import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

const CARD_RADIUS = 16;

export interface CardProps extends ViewProps {
  /** Padding inside the card. Defaults to lg (16). Use 0 for no padding. */
  padding?: keyof typeof spacing | 0;
  /** No horizontal margin when false; default true for standard screen padding. */
  withMargin?: boolean;
}

export function Card({
  children,
  style,
  padding = 'lg',
  withMargin = true,
  ...viewProps
}: CardProps) {
  const paddingValue = padding === 0 ? 0 : spacing[padding as keyof typeof spacing];
  return (
    <View
      style={[
        styles.card,
        withMargin && styles.margin,
        { padding: paddingValue },
        style,
      ]}
      {...viewProps}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: CARD_RADIUS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  margin: {
    marginHorizontal: spacing.lg,
  },
});
