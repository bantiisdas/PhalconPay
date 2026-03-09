import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export interface AmountInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  /** Token symbol shown below amount (e.g. SOL). */
  symbol?: string;
  /** USD equivalent, e.g. "190" or "≈ $190 USD". */
  usdEquivalent?: string;
}

export function AmountInput({
  value,
  onChangeText,
  placeholder = '0.00',
  editable = true,
  symbol,
  usdEquivalent,
}: AmountInputProps) {
  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        keyboardType="decimal-pad"
        editable={editable}
        maxLength={16}
        selectTextOnFocus
      />
      {symbol ? (
        <Text style={styles.symbol}>{symbol}</Text>
      ) : null}
      {usdEquivalent != null && usdEquivalent !== '' ? (
        <Text style={styles.usd}>≈ ${usdEquivalent} USD</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  input: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
    minWidth: 120,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    textAlign: 'center',
  },
  symbol: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xs,
  },
  usd: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: spacing.xs,
  },
});
