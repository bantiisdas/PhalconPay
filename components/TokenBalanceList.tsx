import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export interface TokenBalanceItem {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  iconType: 'sol' | 'usdc' | 'bonk' | 'jup';
}

export interface TokenBalanceListProps {
  tokens?: TokenBalanceItem[];
}

const ICON_BG: Record<TokenBalanceItem['iconType'], string> = {
  sol: colors.swap + '50',
  usdc: colors.primary + '50',
  bonk: colors.brandOrange + '50',
  jup: colors.success + '40',
};

function TokenIcon({ iconType }: { iconType: TokenBalanceItem['iconType'] }) {
  const symbol = iconType === 'sol' ? 'S' : iconType === 'usdc' ? '$' : iconType === 'bonk' ? 'B' : 'J';
  return (
    <View style={[styles.iconCircle, { backgroundColor: ICON_BG[iconType] }]}>
      <Text style={styles.iconText}>{symbol}</Text>
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

const DEFAULT_TOKENS: TokenBalanceItem[] = [
  { id: 'sol', symbol: 'SOL', name: 'Solana', balance: '1.45', iconType: 'sol' },
  { id: 'usdc', symbol: 'USDC', name: 'USD Coin', balance: '500', iconType: 'usdc' },
  { id: 'bonk', symbol: 'BONK', name: 'Bonk', balance: '1.2M', iconType: 'bonk' },
  { id: 'jup', symbol: 'JUP', name: 'Jupiter', balance: '85', iconType: 'jup' },
];

export function TokenBalanceList({ tokens = DEFAULT_TOKENS }: TokenBalanceListProps) {
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
