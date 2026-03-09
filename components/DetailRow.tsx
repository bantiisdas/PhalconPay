import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export interface DetailRowProps {
  label: string;
  value: string;
  /** Optional second line (e.g. shortened address). */
  subValue?: string;
  /** When true, no bottom border (e.g. last row). */
  last?: boolean;
}

export function DetailRow({ label, value, subValue, last }: DetailRowProps) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueBlock}>
        <Text style={styles.value}>{value}</Text>
        {subValue ? <Text style={styles.subValue}>{subValue}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 14,
    color: colors.secondaryText,
    marginRight: spacing.md,
  },
  valueBlock: {
    flex: 1,
    alignItems: 'flex-end',
    minWidth: 0,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  subValue: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: spacing.xs,
    fontVariant: ['tabular-nums'],
  },
});
