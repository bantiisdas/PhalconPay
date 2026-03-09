import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { InAppLogo } from "@/components/InAppLogo";
import { Header, HeaderButton } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import {
  AVAILABLE_TOKENS,
  TOKEN_INFO,
  TOKENS,
} from "@/constants/tokens";
import { useWallet } from "@/hooks/useWallet";
import { useWalletStore } from "@/store/wallet-store";
import { recordSwap } from "@/store/transactionsStore";
import { fromSmallestUnit } from "@/services/jupiter";
import type { QuoteResponse } from "@/services/jupiter";

const SLIPPAGE_PCT = 0.5;

export default function SwapScreen() {
  const router = useRouter();
  const wallet = useWallet();
  const isDevnet = useWalletStore((s) => s.isDevnet);
  const [inputToken, setInputToken] = useState(TOKENS.SOL);
  const [outputToken, setOutputToken] = useState(TOKENS.USDC);
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const [payBalance, setPayBalance] = useState<string>("0");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"input" | "output">("input");
  const pickerTargetRef = useRef<"input" | "output">("input");
  const isMountedRef = useRef(true);
  const lastQuoteFetchTimeRef = useRef<number>(0);
  const lastBalanceFetchTimeRef = useRef<number>(0);
  const QUOTE_THROTTLE_MS = 3000;
  const BALANCE_THROTTLE_MS = 3000;
  const BALANCE_DEBOUNCE_MS = 600;

  const inputInfo = TOKEN_INFO[inputToken];
  const outputInfo = TOKEN_INFO[outputToken];

  const fetchPayBalance = useCallback(async () => {
    if (!wallet.connected) {
      setPayBalance("0");
      return;
    }
    const now = Date.now();
    if (now - lastBalanceFetchTimeRef.current < BALANCE_THROTTLE_MS) {
      return;
    }
    lastBalanceFetchTimeRef.current = now;
    try {
      if (inputInfo.symbol === "SOL") {
        const sol = await wallet.getBalance();
        if (isMountedRef.current) {
          setPayBalance(sol >= 1e6 ? sol.toFixed(0) : sol.toFixed(6));
        }
      } else {
        const balances = await wallet.getTokenBalances();
        if (isMountedRef.current) {
          setPayBalance(balances[inputInfo.symbol] ?? "0");
        }
      }
    } catch {
      if (isMountedRef.current) setPayBalance("0");
    }
  }, [wallet, inputToken, inputInfo.symbol]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (isMountedRef.current) fetchPayBalance();
    }, BALANCE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [fetchPayBalance]);

  const fetchQuote = useCallback(async () => {
    if (!inputAmount || Number(inputAmount) <= 0) {
      if (isMountedRef.current) {
        setOutputAmount("");
        wallet.clearQuote();
      }
      return;
    }
    if (isDevnet) {
      if (isMountedRef.current) {
        setOutputAmount("N/A (Devnet)");
        wallet.clearQuote();
      }
      return;
    }
    const now = Date.now();
    if (now - lastQuoteFetchTimeRef.current < QUOTE_THROTTLE_MS) {
      return;
    }
    lastQuoteFetchTimeRef.current = now;
    try {
      const quote = await wallet.fetchSwapQuote(
        inputToken,
        outputToken,
        Number(inputAmount),
        inputInfo.decimals,
      );
      if (!isMountedRef.current) return;
      if (quote) {
        const outValue = fromSmallestUnit(quote.outAmount, outputInfo.decimals);
        setOutputAmount(outValue.toFixed(outputInfo.decimals > 6 ? 4 : 2));
      }
    } catch {
      if (isMountedRef.current) setOutputAmount("—");
    }
  }, [
    inputAmount,
    inputToken,
    outputToken,
    inputInfo.decimals,
    outputInfo.decimals,
    isDevnet,
    wallet,
  ]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (isMountedRef.current) fetchQuote();
    }, 2000);
    return () => clearTimeout(t);
  }, [fetchQuote]);

  // Refresh quote every 15 seconds when we have a valid amount (avoids 429 rate limit)
  useEffect(() => {
    if (
      isDevnet ||
      !inputAmount ||
      Number(inputAmount) <= 0
    ) {
      return;
    }
    const interval = setInterval(() => {
      if (isMountedRef.current) fetchQuote();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchQuote, inputAmount, isDevnet]);

  const flipTokens = useCallback(() => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount(outputAmount);
    setOutputAmount("");
    wallet.clearQuote();
  }, [outputToken, inputToken, outputAmount, wallet]);

  const openPicker = useCallback((target: "input" | "output") => {
    pickerTargetRef.current = target;
    setPickerTarget(target);
    setPickerVisible(true);
  }, []);

  const selectToken = useCallback(
    (mint: string) => {
      const target = pickerTargetRef.current;
      setPickerVisible(false);
      wallet.clearQuote();
      setOutputAmount("");
      if (target === "input") {
        if (mint === outputToken) setOutputToken(inputToken);
        setInputToken(mint);
      } else {
        if (mint === inputToken) setInputToken(outputToken);
        setOutputToken(mint);
      }
    },
    [inputToken, outputToken, wallet],
  );

  const handleSwap = useCallback(async () => {
    if (!wallet.connected) {
      Alert.alert("Connect Wallet", "Connect your wallet first to swap");
      return;
    }
    if (isDevnet) {
      Alert.alert(
        "Mainnet Only",
        "Jupiter swaps only work on Mainnet. Switch to Mainnet in settings.",
      );
      return;
    }
    const quote = wallet.quotedata as QuoteResponse | null;
    if (!quote) {
      Alert.alert("No Quote", "Enter an amount to get a quote first.");
      return;
    }
    try {
      const result = await wallet.executeSwap(
        quote,
        inputInfo.symbol,
        outputInfo.symbol,
        outputInfo.decimals,
      );
      recordSwap({
        signature: result.signature,
        inputSymbol: result.inputSymbol,
        outputSymbol: result.outputSymbol,
        outputAmount: result.outputAmount,
        inputAmount: Number(inputAmount) || undefined,
      });
      Alert.alert(
        "Swap successful",
        `Swapped ${inputAmount} ${result.inputSymbol} for ${result.outputAmount.toFixed(4)} ${result.outputSymbol}`,
        [{ text: "OK" }],
      );
      setInputAmount("");
      setOutputAmount("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      Alert.alert("Swap failed", msg);
    }
  }, [
    wallet,
    isDevnet,
    inputInfo.symbol,
    outputInfo.symbol,
    outputInfo.decimals,
    inputAmount,
  ]);


  const exchangeRateText =
    wallet.quotedata && inputAmount && Number(inputAmount) > 0
      ? `1 ${inputInfo.symbol} = ${(Number(outputAmount) / Number(inputAmount)).toFixed(2)} ${outputInfo.symbol}`
      : "—";

  const routeText =
    wallet.quotedata?.routePlan?.length &&
    wallet.quotedata.routePlan.every((r) => r?.swapInfo?.label)
      ? wallet.quotedata.routePlan.map((r) => r.swapInfo.label).join(" → ")
      : "—";

  const canSwap =
    wallet.connected &&
    !isDevnet &&
    !!wallet.quotedata &&
    !!inputAmount &&
    Number(inputAmount) > 0 &&
    !wallet.swaping;

  const renderTokenOption = useCallback(
    ({ item }: { item: string }) => {
      const info = TOKEN_INFO[item];
      const isSelected =
        pickerTarget === "input" ? item === inputToken : item === outputToken;
      return (
        <TouchableOpacity
          style={[styles.tokenOption, isSelected && styles.tokenOptionSelected]}
          onPress={() => selectToken(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.tokenIconSmall, { backgroundColor: info.color }]}>
            <Text style={styles.tokenIconText}>{info.symbol[0]}</Text>
          </View>
          <View style={styles.tokenOptionInfo}>
            <Text style={styles.tokenOptionSymbol}>{info.symbol}</Text>
            <Text style={styles.tokenOptionName}>{info.name}</Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          )}
        </TouchableOpacity>
      );
    },
    [pickerTarget, inputToken, outputToken, selectToken],
  );

  return (
    <ScreenContainer edges={["top"]}>
      <Header
        title="Swap"
        left={
          <HeaderButton
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </HeaderButton>
        }
        right={
          <View style={styles.headerLogo}>
            <InAppLogo size={28} />
          </View>
        }
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {isDevnet && (
              <View style={styles.devnetBanner}>
                <Ionicons name="warning" size={18} color={colors.brandOrange} />
                <Text style={styles.devnetText}>
                  Jupiter swap works on Mainnet only. Switch network to swap.
                </Text>
              </View>
            )}

            {/* You Pay */}
            <Card padding="lg" withMargin={false} style={styles.card}>
              <Text style={styles.cardLabel}>You Pay</Text>
              <View style={styles.tokenRow}>
                <TouchableOpacity
                  style={styles.tokenPill}
                  onPress={() => openPicker("input")}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.tokenIconPill,
                      { backgroundColor: inputInfo.color },
                    ]}
                  >
                    <Text style={styles.tokenIconText}>
                      {inputInfo.symbol[0]}
                    </Text>
                  </View>
                  <Text style={styles.tokenSymbol}>{inputInfo.symbol}</Text>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={colors.secondaryText}
                  />
                </TouchableOpacity>
                <Text style={styles.balanceText}>
                  Balance: {payBalance} {inputInfo.symbol}
                </Text>
              </View>
              <View style={styles.amountInputWrap}>
                <TextInput
                  style={styles.amountInput}
                  value={inputAmount}
                  onChangeText={setInputAmount}
                  placeholder="0"
                  placeholderTextColor={colors.secondaryText}
                  keyboardType="decimal-pad"
                />
              </View>
            </Card>

            {/* Swap direction */}
            <View style={styles.swapButtonWrap}>
              <TouchableOpacity
                style={styles.swapDirectionButton}
                onPress={flipTokens}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="swap-vertical"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* You Receive */}
            <Card padding="lg" withMargin={false} style={styles.card}>
              <Text style={styles.cardLabel}>You Receive</Text>
              <View style={styles.tokenRow}>
                <TouchableOpacity
                  style={styles.tokenPill}
                  onPress={() => openPicker("output")}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.tokenIconPill,
                      { backgroundColor: outputInfo.color },
                    ]}
                  >
                    <Text style={styles.tokenIconText}>
                      {outputInfo.symbol[0]}
                    </Text>
                  </View>
                  <Text style={styles.tokenSymbol}>{outputInfo.symbol}</Text>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={colors.secondaryText}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.amountInputWrap}>
                <View style={styles.receiveAmountRow}>
                  {wallet.quoteLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.primary}
                    />
                  ) : (
                    <Text style={styles.receiveAmount}>
                      ≈ {outputAmount || "0"}
                    </Text>
                  )}
                </View>
              </View>
            </Card>

            {/* Swap details */}
            <Card padding="lg" withMargin={false} style={styles.detailsCard}>
              <DetailRow label="Exchange Rate" value={exchangeRateText} />
              <DetailRow label="Route" value={routeText} />
              <DetailRow label="Slippage" value={`${SLIPPAGE_PCT}%`} />
            </Card>

            {/* Swap Tokens button */}
            {wallet.connected ? (
              <TouchableOpacity
                style={[styles.primaryButton, !canSwap && styles.primaryButtonDisabled]}
                onPress={handleSwap}
                disabled={!canSwap}
                activeOpacity={0.8}
              >
                {wallet.swaping ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={styles.primaryButtonText}>Swap Tokens</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={wallet.connect}
                disabled={wallet.connecting}
                activeOpacity={0.8}
              >
                {wallet.connecting ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Connect Wallet to Swap
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select token</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={AVAILABLE_TOKENS}
              keyExtractor={(mint) => mint}
              renderItem={renderTokenOption}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerLogo: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  devnetBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(249, 115, 22, 0.12)",
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  devnetText: {
    color: colors.brandOrange,
    fontSize: 13,
    flex: 1,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    letterSpacing: 0.3,
    marginBottom: spacing.md,
  },
  tokenRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  tokenPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 24,
    gap: spacing.sm,
  },
  tokenIconPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tokenIconText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  tokenSymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  balanceText: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  amountInputWrap: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  amountInput: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  swapButtonWrap: {
    alignItems: "center",
    marginVertical: -22,
    zIndex: 10,
  },
  swapDirectionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  receiveAmountRow: {
    minHeight: 44,
    justifyContent: "center",
  },
  receiveAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },
  detailsCard: {
    marginTop: spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text,
    maxWidth: "65%",
    textAlign: "right",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 16,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    paddingBottom: spacing.xxxl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
  },
  tokenOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  tokenOptionSelected: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  tokenOptionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  tokenOptionSymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  tokenOptionName: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 2,
  },
  tokenIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
