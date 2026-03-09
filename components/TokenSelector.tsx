import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SvgUri } from "react-native-svg";

import { Card } from "@/components/ui/Card";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import {
  type TokenOption,
  DEFAULT_TOKEN_OPTIONS,
  getMintBySymbol,
} from "@/constants/tokens";
import { useTokenIcons } from "@/hooks/useTokenIcons";

export type { TokenOption };

const ICON_BG: Record<string, string> = {
  sol: colors.swap + "50",
  usdc: colors.primary + "50",
  usdt: "#26A17B50",
  bonk: colors.brandOrange + "50",
  jup: colors.success + "40",
  wif: "#E91E6350",
};
const ICON_LETTER: Record<string, string> = {
  sol: "S",
  usdc: "$",
  usdt: "T",
  bonk: "B",
  jup: "J",
  wif: "W",
};

function isSvgUri(uri: string | null | undefined): boolean {
  return !!uri && uri.toLowerCase().endsWith(".svg");
}
function isUnusableImageUri(uri: string | null | undefined): boolean {
  return !!uri && uri.toLowerCase().includes(".link");
}

function TokenIcon({
  symbol,
  iconUri,
}: {
  symbol: string;
  iconUri?: string | null;
}) {
  const [imgErr, setImgErr] = useState(false);
  const [svgErr, setSvgErr] = useState(false);
  const id = symbol.toLowerCase();
  const bg = ICON_BG[id] ?? colors.primary + "40";
  const letter = ICON_LETTER[id] ?? symbol.charAt(0);

  if (!iconUri || imgErr || svgErr || isUnusableImageUri(iconUri)) {
    return (
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <Text style={styles.symbolChar}>{letter}</Text>
      </View>
    );
  }
  if (isSvgUri(iconUri)) {
    return (
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <SvgUri
          width={36}
          height={36}
          uri={iconUri}
          onError={() => setSvgErr(true)}
        />
      </View>
    );
  }
  return (
    <View style={[styles.iconWrap, { backgroundColor: bg }]}>
      <Image
        source={{ uri: iconUri }}
        style={styles.iconImage}
        resizeMode="cover"
        onError={() => setImgErr(true)}
      />
    </View>
  );
}

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
  label = "Pay With",
}: TokenSelectorProps) {
  const iconByMint = useTokenIcons();
  const mint = getMintBySymbol(selected.symbol);
  const iconUri = mint ? iconByMint[mint] : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card padding="md" withMargin={false} style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.tokenRow}>
            <TokenIcon symbol={selected.symbol} iconUri={iconUri} />
            <Text style={styles.symbolText}>{selected.symbol}</Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.secondaryText}
            />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  tokenRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  symbolChar: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  symbolText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
});
