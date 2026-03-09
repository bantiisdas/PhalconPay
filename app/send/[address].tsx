import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AmountInput } from "@/components/AmountInput";
import { InAppLogo } from "@/components/InAppLogo";
import { RecipientCard } from "@/components/RecipientCard";
import { SwapAndSendPreviewCard } from "@/components/SwapAndSendPreviewCard";
import { SwapPreviewCard } from "@/components/SwapPreviewCard";
import type { TokenOption } from "@/components/TokenSelector";
import { TokenSelector } from "@/components/TokenSelector";
import { Button } from "@/components/ui/Button";
import { Header, HeaderButton } from "@/components/ui/Header";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import {
  DEFAULT_TOKEN_OPTIONS,
  TOKENS,
  TOKENS_CONFIG,
} from "@/constants/tokens";
import { useWallet } from "@/hooks/useWallet";
import type { QuoteResponse } from "@/services/jupiter";
import { fromSmallestUnit, toSmallestUnit } from "@/services/jupiter";
import { useFavoritesStore } from "@/store/favoritesStore";
import {
  recordSendSol,
  recordSendToken,
  recordSwapAndSend,
} from "@/store/transactionsStore";
import { useWalletStore } from "@/store/wallet-store";

/** Allow up to 9 decimal places (e.g. 0.00001 for SOL). */
function parseAmount(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) return parts[0] + "." + parts.slice(1).join("");
  if (parts.length === 2 && parts[1].length > 9) {
    return parts[0] + "." + parts[1].slice(0, 9);
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

const NETWORK_FEE_SOL = "0.00001 SOL";
const SOL_GAS_BUFFER = 0.01;
const BALANCE_DEBOUNCE_MS = 600;
const BALANCE_THROTTLE_MS = 3000;
const QUOTE_THROTTLE_MS = 3000;

export default function SendScreen() {
  const { address } = useLocalSearchParams<{ address: string }>();
  const router = useRouter();
  const wallet = useWallet();
  const isDevnet = useWalletStore((s) => s.isDevnet);
  const favoriteWallets = useFavoritesStore((s) => s.wallets);
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenOption>(
    DEFAULT_TOKEN_OPTIONS[0],
  );
  const [enteredAddress, setEnteredAddress] = useState("");
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [solBalance, setSolBalance] = useState<number>(0);
  const swapAndSendQuoteTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const isMountedRef = useRef(true);
  const lastBalanceFetchTimeRef = useRef<number>(0);
  const lastQuoteFetchTimeRef = useRef<number>(0);
  const lastBalanceTokenSymbolRef = useRef<string | null>(null);

  const effectiveAddress = (
    enteredAddress.trim() || (address && address !== "new" ? address : "")
  ).trim();
  const numAmount = parseFloat(amount || "0");
  const canSend =
    amount.length > 0 && numAmount > 0 && effectiveAddress.length > 0;

  const tokenConfig = selectedToken?.symbol
    ? TOKENS_CONFIG[selectedToken.symbol]
    : null;
  const isSol = selectedToken?.symbol === "SOL";

  const needSwapAndSend =
    !isDevnet &&
    !isSol &&
    canSend &&
    tokenConfig?.mint != null &&
    tokenBalance != null &&
    tokenBalance < numAmount;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!wallet.connected) {
      if (isMountedRef.current) {
        setTokenBalance(null);
        setSolBalance(0);
      }
      return;
    }
    const t = setTimeout(() => {
      if (!isMountedRef.current) return;
      const now = Date.now();
      const symbol = selectedToken?.symbol ?? null;
      // Throttle only when requesting the same token repeatedly; when the user
      // switches tokens we always refresh the balance immediately.
      if (
        symbol === lastBalanceTokenSymbolRef.current &&
        now - lastBalanceFetchTimeRef.current < BALANCE_THROTTLE_MS
      ) {
        return;
      }
      lastBalanceFetchTimeRef.current = now;
      lastBalanceTokenSymbolRef.current = symbol;
      (async () => {
        try {
          const sol = await wallet.getBalance();
          if (!isMountedRef.current) return;
          setSolBalance(sol);
          if (selectedToken?.symbol === "SOL") {
            setTokenBalance(sol);
            return;
          }
          const balances = await wallet.getTokenBalances();
          const raw = balances[selectedToken?.symbol ?? ""] ?? "0";
          const parsed = parseFloat(raw.replace(/,/g, ""));
          if (isMountedRef.current) {
            setTokenBalance(Number.isFinite(parsed) ? parsed : 0);
          }
        } catch {
          if (isMountedRef.current) {
            setTokenBalance(null);
            setSolBalance(0);
          }
        }
      })();
    }, BALANCE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [wallet, selectedToken?.symbol]);

  // ExactOut: amount = desired output (token to send) in atomic units
  const outputAmountAtomic =
    tokenConfig && numAmount > 0
      ? toSmallestUnit(numAmount, tokenConfig.decimals)
      : 0;

  useEffect(() => {
    const mint = tokenConfig?.mint;
    if (!needSwapAndSend || outputAmountAtomic <= 0 || !mint) {
      wallet.clearQuote();
      return;
    }
    if (solBalance < SOL_GAS_BUFFER) {
      wallet.clearQuote();
      return;
    }

    swapAndSendQuoteTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      const now = Date.now();
      if (now - lastQuoteFetchTimeRef.current < QUOTE_THROTTLE_MS) return;
      lastQuoteFetchTimeRef.current = now;
      wallet
        .fetchSwapQuoteExactOut(TOKENS.SOL, mint, outputAmountAtomic)
        .catch(() => {});
    }, 600);

    return () => {
      if (swapAndSendQuoteTimeoutRef.current) {
        clearTimeout(swapAndSendQuoteTimeoutRef.current);
        swapAndSendQuoteTimeoutRef.current = null;
      }
    };
  }, [
    needSwapAndSend,
    outputAmountAtomic,
    tokenConfig?.mint,
    solBalance,
    wallet,
  ]);

  const quote = wallet.quotedata as QuoteResponse | null;
  const requiredSol = quote != null ? fromSmallestUnit(quote.inAmount, 9) : 0;
  const maxSolForSwap = Math.max(0, solBalance - SOL_GAS_BUFFER);
  const insufficientSolForSwap = quote != null && requiredSol > maxSolForSwap;

  const canSwapAndSend =
    needSwapAndSend &&
    quote != null &&
    !insufficientSolForSwap &&
    effectiveAddress.length > 0;

  const handleSwapAndSend = useCallback(async () => {
    if (!canSwapAndSend || !tokenConfig?.mint || !quote) return;
    if (!wallet.connected) {
      Alert.alert("Wallet not connected", "Connect your wallet first.");
      return;
    }
    try {
      const toAddr = effectiveAddress.trim();
      const { signature } = await wallet.executeSwapAndSend(
        quote,
        toAddr,
        tokenConfig.mint,
      );
      recordSwapAndSend({
        signature,
        toAddress: toAddr,
        amount: numAmount,
        symbol: selectedToken.symbol,
        swapFrom: "SOL",
        swapTo: selectedToken.symbol,
      });
      const baseUrl = "https://solscan.io/tx";
      const clusterParam = isDevnet ? "?cluster=devnet" : "";
      Alert.alert(
        "Swap & Send complete",
        `Swapped SOL for ${selectedToken.symbol} and sent ${amount} ${selectedToken.symbol} to the recipient.`,
        [
          {
            text: "View on SolScan",
            onPress: () =>
              Linking.openURL(`${baseUrl}/${signature}${clusterParam}`),
          },
          { text: "OK", onPress: () => router.back() },
        ],
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Swap & Send failed";
      Alert.alert("Error", msg);
    }
  }, [
    canSwapAndSend,
    tokenConfig,
    quote,
    wallet,
    selectedToken,
    effectiveAddress,
    amount,
    router,
    isDevnet,
  ]);

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
      const isSol = selectedToken.symbol === "SOL";
      const config = TOKENS_CONFIG[selectedToken.symbol];
      let sig: string | undefined;

      const toAddr = effectiveAddress.trim();
      if (isSol) {
        sig = await wallet.sendSol(toAddr, numAmount);
        if (sig)
          recordSendSol({
            signature: sig,
            toAddress: toAddr,
            amount: numAmount,
          });
      } else {
        if (!config?.mint) {
          Alert.alert("Error", "Unsupported token for sending.");
          return;
        }
        const balance = tokenBalance ?? 0;
        if (balance < numAmount) {
          Alert.alert(
            "Insufficient balance",
            "Use the Swap & Send option below to swap from SOL and send.",
          );
          return;
        }
        sig = await wallet.sendToken(
          toAddr,
          config.mint,
          numAmount,
          config.decimals,
        );
        if (sig)
          recordSendToken({
            signature: sig,
            toAddress: toAddr,
            amount: numAmount,
            symbol: selectedToken.symbol,
            mint: config.mint,
          });
      }

      const baseUrl = "https://solscan.io/tx";
      const clusterParam = isDevnet ? "?cluster=devnet" : "";

      Alert.alert(
        "Transaction Sent!",
        `Sent ${amount} ${selectedToken.symbol}\nSignature: ${sig?.slice(0, 20)}...`,
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
  }, [
    canSend,
    effectiveAddress,
    amount,
    selectedToken,
    isDevnet,
    wallet,
    router,
    tokenBalance,
  ]);

  const displayAmount = amount || "0";
  const previewSend = `${displayAmount} ${selectedToken.symbol}`;
  const previewReceive = `~${displayAmount} ${selectedToken.symbol}`;
  const usdEquivalent = getUsdEquivalent(amount, selectedToken);

  const favoriteWallet = effectiveAddress
    ? favoriteWallets.find((w) => w.address === effectiveAddress)
    : undefined;
  const recipientName =
    favoriteWallet?.name ??
    (effectiveAddress && effectiveAddress.length > 10 ? "Alice" : undefined);

  const currentBalanceValue =
    selectedToken.symbol === "SOL" ? solBalance : tokenBalance;
  const currentBalanceDisplay =
    currentBalanceValue == null
      ? "0"
      : currentBalanceValue === 0
        ? "0"
        : currentBalanceValue >= 1_000_000
          ? currentBalanceValue.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })
          : currentBalanceValue >= 1
            ? currentBalanceValue.toFixed(2)
            : currentBalanceValue >= 0.01
              ? currentBalanceValue.toFixed(4)
              : currentBalanceValue.toFixed(6);

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
            <InAppLogo size={28} />
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
          address="new"
          name={recipientName}
          avatarType={favoriteWallet?.avatarType}
          avatarColor={favoriteWallet?.avatarColor}
          label=""
          editable
          inputValue={effectiveAddress}
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
          Balance: {currentBalanceDisplay} {selectedToken.symbol}
        </Text>
        <AmountInput
          value={amount}
          onChangeText={(v) => setAmount(parseAmount(v))}
          placeholder="0.00"
          editable={true}
          symbol={selectedToken.symbol}
          usdEquivalent={usdEquivalent}
        />
        <SwapPreviewCard youSend={previewSend} theyReceive={previewReceive} />

        {needSwapAndSend ? (
          <>
            {wallet.quoteLoading ? (
              <View style={styles.swapSendLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.swapSendLoadingText}>
                  Fetching swap quote…
                </Text>
              </View>
            ) : quote != null ? (
              <>
                {insufficientSolForSwap ? (
                  <View style={styles.swapSendInsufficient}>
                    <Text style={styles.swapSendInsufficientText}>
                      Insufficient SOL for swap and transaction fees.
                    </Text>
                  </View>
                ) : null}
                <SwapAndSendPreviewCard
                  swapFrom="SOL"
                  swapTo={selectedToken.symbol}
                  youPay={`${requiredSol.toFixed(4)} SOL`}
                  youSend={`${numAmount} ${selectedToken.symbol}`}
                  onSwapAndSend={handleSwapAndSend}
                  loading={wallet.sending || wallet.swaping}
                  disabled={!canSwapAndSend}
                />
              </>
            ) : (
              <View style={styles.swapSendInsufficient}>
                <Text style={styles.swapSendInsufficientText}>
                  Could not get quote. Check SOL balance or try later.
                </Text>
              </View>
            )}
          </>
        ) : null}

        {!needSwapAndSend ? (
          <Button
            title={wallet.sending ? "Sending…" : "Send"}
            onPress={handleSend}
            disabled={wallet.sending}
            fullWidth
          />
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 40,
    height: 40,
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
  swapSendLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  swapSendLoadingText: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  swapSendInsufficient: {
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  swapSendInsufficientText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: "center",
  },
});
