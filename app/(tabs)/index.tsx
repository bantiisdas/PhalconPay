import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

import { AssetList } from "@/components/AssetList";
import { BalanceCard } from "@/components/BalanceCard";
import { FavoriteWallets } from "@/components/FavoriteWallets";
import { HomeHeader } from "@/components/HomeHeader";
import { QuickActions } from "@/components/QuickActions";
import { RecentTransactions } from "@/components/RecentTransactions";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import {
  useTransactionsStore,
  getRecentTransactionRows,
} from "@/store/transactionsStore";
import { useWallet } from "@/hooks/useWallet";

/** Format SOL amount for display. */
function formatSol(sol: number): string {
  if (sol >= 1000)
    return sol.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (sol >= 1) return sol.toFixed(2);
  if (sol >= 0.01) return sol.toFixed(4);
  return sol.toFixed(6);
}

/** Rough USD value (e.g. for display). Replace with real price feed later. */
const SOL_USD_ESTIMATE = 19;

const RECENT_LIMIT = 8;

export default function HomeScreen() {
  const { connected, getBalance, getTokenBalances } = useWallet();
  const transactions = useTransactionsStore((s) => s.transactions);
  const recentTransactions = getRecentTransactionRows(transactions, RECENT_LIMIT);
  const [balanceSol, setBalanceSol] = useState<number | null>(null);
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>(
    {},
  );
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!connected || !getBalance) return;
    setBalanceLoading(true);
    try {
      const [sol, tokens] = await Promise.all([
        getBalance(),
        getTokenBalances?.() ?? Promise.resolve({}),
      ]);
      setBalanceSol(sol);
      setTokenBalances(tokens);
    } catch {
      setBalanceSol(null);
      setTokenBalances({});
    } finally {
      setBalanceLoading(false);
    }
  }, [connected, getBalance, getTokenBalances]);

  useEffect(() => {
    if (connected) {
      fetchBalance();
    } else {
      setBalanceSol(null);
    }
  }, [connected, fetchBalance]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBalance();
    setRefreshing(false);
  }, [fetchBalance]);

  const balanceDisplay = balanceLoading
    ? "..."
    : connected && balanceSol !== null
      ? `$${(balanceSol * SOL_USD_ESTIMATE).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "$0.00";
  const cryptoBreakdown =
    connected && balanceSol !== null && !balanceLoading
      ? `$${(balanceSol * SOL_USD_ESTIMATE).toLocaleString(undefined, { minimumFractionDigits: 2 })} | ${formatSol(balanceSol)} SOL`
      : undefined;

  return (
    <ScreenContainer edges={["top"]} paddingHorizontal="lg" paddingBottom="xl">
      <HomeHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <BalanceCard
          balance={balanceDisplay}
          label="Total Balance"
          // cryptoBreakdown={cryptoBreakdown}
          withMargin={false}
        />
        <AssetList
          balances={{
            SOL: connected && balanceSol !== null ? formatSol(balanceSol) : "0",
            USDC: tokenBalances.USDC ?? "0",
            USDT: tokenBalances.USDT ?? "0",
            BONK: tokenBalances.BONK ?? "0",
            JUP: tokenBalances.JUP ?? "0",
            WIF: tokenBalances.WIF ?? "0",
          }}
        />
        <QuickActions />
        <FavoriteWallets />
        <RecentTransactions transactions={recentTransactions} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
});
