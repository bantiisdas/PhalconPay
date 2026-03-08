import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import {
  type TokenBalanceItem,
  type TokenIconType,
  DEFAULT_TOKEN_BALANCE_ITEMS,
} from '@/constants/tokens';

export type { TokenBalanceItem };

export interface TokenBalanceListProps {
  tokens?: TokenBalanceItem[];
}

const ICON_BG: Record<TokenIconType, string> = {
  sol: colors.swap + '50',
  usdc: colors.primary + '50',
  usdt: '#26A17B50',
  bonk: colors.brandOrange + '50',
  jup: colors.success + '40',
  wif: '#E91E6350',
};

const ICON_LETTER: Record<TokenIconType, string> = {
  sol: 'S',
  usdc: '$',
  usdt: 'T',
  bonk: 'B',
  jup: 'J',
  wif: 'W',
};

function TokenIcon({ iconType }: { iconType: TokenIconType }) {
  const letter = ICON_LETTER[iconType] ?? iconType.charAt(0).toUpperCase();
  return (
    <View style={[styles.iconCircle, { backgroundColor: ICON_BG[iconType] }]}>
      <Text style={styles.iconText}>{letter}</Text>
    </View>
  );
}

function TokenBalanceRow({
  symbol,
  balance,
  iconType,
  showDivider,
}: TokenBalanceItem & { showDivider: boolean }) {
  const balanceDisplay = `${balance} ${symbol}`;
  return (
    <View style={[styles.row, showDivider && styles.rowBorder]}>
      <TokenIcon iconType={iconType} />
      <View style={styles.content}>
        <Text style={styles.symbol}>{symbol} -</Text>
      </View>
      <Text style={styles.balance}>{balanceDisplay}</Text>
    </View>
  );
}

export function TokenBalanceList({
  tokens = DEFAULT_TOKEN_BALANCE_ITEMS,
}: TokenBalanceListProps) {
  return (
    <Card padding={0} withMargin={false}>
      {tokens.map((token, index) => (
        <TokenBalanceRow
          key={token.id}
          {...token}
          showDivider={index < tokens.length - 1}
        />
      ))}
    </Card>
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
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  balance: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
});
