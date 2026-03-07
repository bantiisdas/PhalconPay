import { StyleSheet, Switch, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export interface SettingsRowProps {
  label: string;
  /** Toggle: controlled value and change handler. */
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  /** Or show a value string (e.g. app version) instead of switch. */
  valueLabel?: string;
  /** Last row often has no divider. */
  showDivider?: boolean;
}

export function SettingsRow({
  label,
  value,
  onValueChange,
  valueLabel,
  showDivider = true,
}: SettingsRowProps) {
  const isSwitch = onValueChange !== undefined && value !== undefined;

  return (
    <View style={[styles.row, showDivider && styles.rowBorder]}>
      <Text style={styles.label}>{label}</Text>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.card, true: colors.primary + '80' }}
          thumbColor={value ? colors.primary : colors.secondaryText}
        />
      ) : valueLabel !== undefined ? (
        <Text style={styles.valueLabel}>{valueLabel}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  valueLabel: {
    fontSize: 14,
    color: colors.secondaryText,
  },
});
