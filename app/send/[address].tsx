import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { AmountInput } from "@/components/AmountInput";
import { RecipientCard } from "@/components/RecipientCard";
import { SwapPreviewCard } from "@/components/SwapPreviewCard";
import type { TokenOption } from "@/components/TokenSelector";
import { TokenSelector } from "@/components/TokenSelector";
import { Button } from "@/components/ui/Button";
import { Header, HeaderButton } from "@/components/ui/Header";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { DEFAULT_TOKEN_OPTIONS } from "@/constants/tokens";
import { useWallet } from "@/hooks/useWallet";
import { useWalletStore } from "@/store/wallet-store";

function parseAmount(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) return parts[0] + "." + parts.slice(1).join("");
  if (parts.length === 2 && parts[1].length > 2) {
    return parts[0] + "." + parts[1].slice(0, 2);
  }
  return cleaned;
}

/** Mock USD equivalent for display. */
function getUsdEquivalent(amount: string, token: TokenOption): string {
  const num = parseFloat(amount || "0");
  if (num <= 0) return "";
  if (token.symbol === "SOL") return (num * 19).toFixed(0);
  if (token.symbol === "USDC" || token.symbol === "USDT") return num.toFixed(2);
  if (token.symbol === "JUP") return (num * 0.58).toFixed(2);
  if (token.symbol === "WIF") return (num * 2.5).toFixed(2);
  return (num * 0.5).toFixed(2);
}

export default function SendScreen() {
  const { address } = useLocalSearchParams<{ address: string }>();
  const router = useRouter();
  const wallet = useWallet();
  const isDevnet = useWalletStore((s) => s.isDevnet);
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenOption>(
    DEFAULT_TOKEN_OPTIONS[0],
  ); // SOL first
  const [enteredAddress, setEnteredAddress] = useState("");

  const effectiveAddress =
    (address && address !== "new" ? address : enteredAddress.trim()) || "";
  const canSend =
    amount.length > 0 && parseFloat(amount) > 0 && effectiveAddress.length > 0;

  const handleSend = useCallback(async () => {
    if (!canSend) {
      if (!effectiveAddress.trim())
        Alert.alert("Missing recipient", "Enter a recipient address.");
      else if (!amount.trim() || parseFloat(amount) <= 0)
        Alert.alert("Invalid amount", "Enter an amount to send.");
      return;
    }
    if (!wallet.connected) {
      Alert.alert(
        "Wallet not connected",
        "Connect your wallet in the Account tab first.",
      );
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      const sig = await wallet.sendSol(effectiveAddress.trim(), numAmount);

      const baseUrl = "https://solscan.io/tx";
      const clusterParam = isDevnet ? "?cluster=devnet" : "";

      Alert.alert(
        "Transaction Sent!",
        `Sent ${amount} SOL\nSignature: ${sig?.slice(0, 20)}...`,
        [
          {
            text: "View on SolScan",
            onPress: () => Linking.openURL(`${baseUrl}/${sig}${clusterParam}`),
          },
          {
            text: "Done",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      Alert.alert("Transaction Failed", message);
    }
  }, [canSend, effectiveAddress, amount, isDevnet, wallet, router]);

  const displayAmount = amount || "0";
  const previewSend = `${displayAmount} ${selectedToken.symbol}`;
  const previewReceive = `~${displayAmount} ${selectedToken.symbol}`;
  const usdEquivalent = getUsdEquivalent(amount, selectedToken);

  const recipientName =
    effectiveAddress && effectiveAddress.length > 10 ? "Alice" : undefined;
  const isNewRecipient = !address || address === "new";

  return (
    <ScreenContainer
      edges={["top", "bottom"]}
      paddingHorizontal="lg"
      paddingBottom="xl"
    >
      <Header
        title="Send"
        left={
          <HeaderButton
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </HeaderButton>
        }
        right={
          <View style={styles.logo}>
            <MaterialCommunityIcons
              name="flash"
              size={24}
              color={colors.text}
            />
          </View>
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <RecipientCard
          address={isNewRecipient ? "new" : (address ?? "")}
          name={recipientName}
          label=""
          editable={isNewRecipient}
          inputValue={enteredAddress}
          onAddressChange={setEnteredAddress}
        />
        <TokenSelector
          selected={selectedToken}
          onPress={() => {
            const idx = DEFAULT_TOKEN_OPTIONS.findIndex(
              (t) => t.id === selectedToken.id,
            );
            setSelectedToken(
              DEFAULT_TOKEN_OPTIONS[(idx + 1) % DEFAULT_TOKEN_OPTIONS.length],
            );
          }}
          options={DEFAULT_TOKEN_OPTIONS}
          label="Pay With"
        />
        <Text style={styles.balance}>
          Balance: {selectedToken.balance ?? "0"} {selectedToken.symbol}
        </Text>
        <AmountInput
          value={amount}
          onChangeText={(v) => setAmount(parseAmount(v))}
          placeholder="0.00"
          editable={true}
          symbol={selectedToken.symbol}
          usdEquivalent={usdEquivalent}
        />
        <SwapPreviewCard
          youSend={previewSend}
          theyReceive={previewReceive}
          fee="0.001 SOL"
        />
        <Button
          title={wallet.sending ? "Sending…" : "Send"}
          onPress={handleSend}
          disabled={wallet.sending}
          fullWidth
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  balance: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: spacing.lg,
  },
});
