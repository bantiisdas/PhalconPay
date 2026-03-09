import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export interface ActionRowProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Last row in a card often has no divider. */
  showDivider?: boolean;
}

export function ActionRow({
  label,
  onPress,
  icon,
  showDivider = true,
}: ActionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, showDivider && styles.rowBorder, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      {icon ? (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
      ) : null}
      <Text style={styles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    marginRight: spacing.md,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
});
