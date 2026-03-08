import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import {
  getMintBySymbol,
  getTokenBalanceItems,
  type TokenIconType,
} from "@/constants/tokens";
import { useTokenIcons } from "@/hooks/useTokenIcons";

export interface AssetListProps {
  /** Symbol -> amount string. Missing tokens show "0". */
  balances?: Partial<Record<string, string>>;
}

const ICON_STYLES: Record<TokenIconType, { bg: string }> = {
  sol: { bg: colors.swap + "50" },
  usdc: { bg: colors.primary + "50" },
  usdt: { bg: "#26A17B50" },
  bonk: { bg: colors.brandOrange + "50" },
  jup: { bg: colors.success + "40" },
  wif: { bg: "#E91E6350" },
};

const ICON_LETTER: Record<TokenIconType, string> = {
  sol: "S",
  usdc: "$",
  usdt: "T",
  bonk: "B",
  jup: "J",
  wif: "W",
};

/** RN Image does not support SVG or .link; use symbol for those or when load fails. */
function shouldUseSymbolForIcon(iconUri: string | null | undefined): boolean {
  if (!iconUri) return true;
  const lower = iconUri.toLowerCase();
  if (lower.endsWith(".svg") || lower.includes(".link")) return true;
  return false;
}

function AssetIcon({
  iconType,
  iconUri,
}: {
  iconType: TokenIconType;
  iconUri?: string | null;
}) {
  const [imageError, setImageError] = useState(false);
  const useSymbol = shouldUseSymbolForIcon(iconUri) || imageError;
  const { bg } = ICON_STYLES[iconType];
  const letter = ICON_LETTER[iconType];

  if (iconUri && !useSymbol) {
    return (
      <View style={[styles.iconCircle, { backgroundColor: bg }]}>
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
    <View style={[styles.iconCircle, { backgroundColor: bg }]}>
      <Text style={styles.iconText}>{letter}</Text>
    </View>
  );
}

export function AssetList({ balances }: AssetListProps) {
  const items = getTokenBalanceItems(balances);
  const iconByMint = useTokenIcons();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      {items.map((item) => {
        const amount = Number(item.balance) === 0 ? "0" : item.balance;
        const mint = getMintBySymbol(item.symbol);
        const iconUri = mint ? iconByMint[mint] : null;
        return (
          <Card key={item.id} padding="md" withMargin={false} style={styles.assetCard}>
            <AssetIcon iconType={item.iconType} iconUri={iconUri} />
            <Text style={styles.amount} numberOfLines={1}>
              {amount} {item.symbol}
            </Text>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: spacing.xl,
  },
  scrollContent: {
    flexDirection: "row",
    paddingRight: spacing.lg,
  },
  assetCard: {
    minWidth: 100,
    marginRight: spacing.md,
    marginBottom: 0,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
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
  amount: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
});
