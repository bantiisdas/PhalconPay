import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import {
  type TokenOption,
  DEFAULT_TOKEN_OPTIONS,
} from '@/constants/tokens';

export type { TokenOption };

export interface TokenSelectorProps {
  selected: TokenOption;
  onPress?: () => void;
  options?: TokenOption[];
  /** Left label (e.g. "Pay With"). */
  label?: string;
}

export function TokenSelector({
  selected,
  onPress,
  options = DEFAULT_TOKEN_OPTIONS,
  label = 'Pay With',
}: TokenSelectorProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <Card padding="md" withMargin={false} style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.tokenRow}>
            <View style={styles.iconWrap}>
              <Text style={styles.symbolChar}>{selected.symbol.charAt(0)}</Text>
            </View>
            <Text style={styles.symbolText}>{selected.symbol}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.secondaryText} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolChar: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  symbolText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
