import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export type SafeAreaEdges = 'top' | 'bottom' | 'left' | 'right';

export interface ScreenContainerProps extends ViewProps {
  /** Which edges get safe area insets. Default: ['top'] for tab screens. Use ['top','bottom'] for full screens. */
  edges?: SafeAreaEdges[];
  /** Horizontal padding. Default: lg (16). */
  paddingHorizontal?: keyof typeof spacing;
  /** Bottom padding. Default: xl (24). */
  paddingBottom?: keyof typeof spacing;
  /** When true, content is wrapped in SafeAreaView. Default: true. */
  safe?: boolean;
}

export function ScreenContainer({
  children,
  style,
  edges = ['top'],
  paddingHorizontal = 'lg',
  paddingBottom = 'xl',
  safe = true,
  ...viewProps
}: ScreenContainerProps) {
  const containerStyle = [
    styles.container,
    {
      paddingHorizontal: spacing[paddingHorizontal],
      paddingBottom: spacing[paddingBottom],
    },
    style,
  ];

  if (safe) {
    return (
      <SafeAreaView style={containerStyle} edges={edges} {...viewProps}>
        {children}
      </SafeAreaView>
    );
  }

  return (
    <View style={containerStyle} {...viewProps}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
