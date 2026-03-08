import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import {
  type TokenBalanceItem,
  type TokenIconType,
  getMintBySymbol,
  getTokenBalanceItems,
} from "@/constants/tokens";
import { useTokenIcons } from "@/hooks/useTokenIcons";

export type { TokenBalanceItem };

export interface TokenBalanceListProps {
  /** Symbol -> amount string. Order is SOL, USDC, JUP, BONK, USDT, WIF. */
  balances?: Partial<Record<string, string>>;
}

const ICON_BG: Record<TokenIconType, string> = {
  sol: colors.swap + "50",
  usdc: colors.primary + "50",
  usdt: "#26A17B50",
  bonk: colors.brandOrange + "50",
  jup: colors.success + "40",
  wif: "#E91E6350",
};

const ICON_LETTER: Record<TokenIconType, string> = {
  sol: "S",
  usdc: "$",
  usdt: "T",
  bonk: "B",
  jup: "J",
  wif: "W",
};

function shouldUseSymbolForIcon(iconUri: string | null | undefined): boolean {
  if (!iconUri) return true;
  const lower = iconUri.toLowerCase();
  if (lower.endsWith(".svg") || lower.includes(".link")) return true;
  return false;
}

function TokenIcon({
  iconType,
  iconUri,
}: {
  iconType: TokenIconType;
  iconUri?: string | null;
}) {
  const [imageError, setImageError] = useState(false);
  const useSymbol = shouldUseSymbolForIcon(iconUri) || imageError;
  const letter = ICON_LETTER[iconType] ?? iconType.charAt(0).toUpperCase();

  if (iconUri && !useSymbol) {
    return (
      <View style={[styles.iconCircle, { backgroundColor: ICON_BG[iconType] }]}>
        <Image
          source={{ uri: iconUri }}
          style={styles.iconImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      </View>
    );
  }
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
  iconUri,
}: TokenBalanceItem & { showDivider: boolean; iconUri?: string | null }) {
  const amount = Number(balance) === 0 ? "0" : balance;
  const balanceDisplay = `${amount} ${symbol}`;
  return (
    <View style={[styles.row, showDivider && styles.rowBorder]}>
      <TokenIcon iconType={iconType} iconUri={iconUri} />
      <View style={styles.content}>
        <Text style={styles.symbol}>{symbol}</Text>
      </View>
      <Text style={styles.balance}>{balanceDisplay}</Text>
    </View>
  );
}

export function TokenBalanceList({ balances }: TokenBalanceListProps) {
  const tokens = getTokenBalanceItems(balances);
  const iconByMint = useTokenIcons();

  return (
    <Card padding={0} withMargin={false}>
      {tokens.map((token, index) => {
        const mint = getMintBySymbol(token.symbol);
        const iconUri = mint ? iconByMint[mint] : null;
        return (
          <TokenBalanceRow
            key={token.id}
            {...token}
            showDivider={index < tokens.length - 1}
            iconUri={iconUri}
          />
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    overflow: "hidden",
  },
  iconImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  symbol: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  balance: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
});
