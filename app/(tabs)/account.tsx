import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { AccountHeader } from "@/components/AccountHeader";
import type { NetworkOption } from "@/components/NetworkSelector";
import { NetworkSelector } from "@/components/NetworkSelector";
import { ProfileWalletCard } from "@/components/ProfileWalletCard";
import { TokenBalanceList } from "@/components/TokenBalanceList";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Section } from "@/components/ui/Section";
import { spacing } from "@/constants/spacing";
import { useWallet } from "@/hooks/useWallet";
import { useWalletStore } from "@/store/wallet-store";

function formatSol(sol: number): string {
  if (sol >= 1000)
    return sol.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (sol >= 1) return sol.toFixed(2);
  if (sol >= 0.01) return sol.toFixed(4);
  return sol.toFixed(6);
}

export default function AccountScreen() {
  const wallet = useWallet();
  const isDevnet = useWalletStore((s) => s.isDevnet);
  const { connected, getBalance, getTokenBalances } = wallet;
  const [network, setNetwork] = useState<NetworkOption>(
    isDevnet ? "devnet" : "mainnet",
  );
  const [balanceSol, setBalanceSol] = useState<number | null>(null);
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>(
    {},
  );

  const fetchBalances = useCallback(async () => {
    if (!connected || !getBalance) return;
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
    }
  }, [connected, getBalance, getTokenBalances]);

  useEffect(() => {
    if (connected) fetchBalances();
    else {
      setBalanceSol(null);
      setTokenBalances({});
    }
  }, [connected, fetchBalances]);

  const balances =
    connected && balanceSol !== null
      ? {
          SOL: formatSol(balanceSol),
          SKR: tokenBalances.SKR ?? "0",
          USDC: tokenBalances.USDC ?? "0",
          USDT: tokenBalances.USDT ?? "0",
          BONK: tokenBalances.BONK ?? "0",
          JUP: tokenBalances.JUP ?? "0",
          WIF: tokenBalances.WIF ?? "0",
        }
      : undefined;

  return (
    <ScreenContainer edges={["top"]} paddingHorizontal="lg" paddingBottom="xl">
      <AccountHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Section>
          <ProfileWalletCard
            connected={connected}
            connecting={wallet.connecting}
            publicKey={wallet.publicKey?.toBase58() || null}
            onConnect={wallet.connect}
            onDisconnect={wallet.disconnect}
          />
        </Section>

        <Section>
          <TokenBalanceList balances={balances} />
        </Section>

        <Section>
          <NetworkSelector value={network} onValueChange={setNetwork} />
        </Section>
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
