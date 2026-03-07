import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export interface SectionProps extends ViewProps {
  /** Section heading. When omitted, only children are rendered. */
  title?: string;
  children: React.ReactNode;
}

/**
 * Screen section with optional title. Uses FalconPay spacing (8px grid)
 * and consistent section title typography.
 */
export function Section({ title, children, style, ...viewProps }: SectionProps) {
  return (
    <View style={[styles.section, style]} {...viewProps}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
});
