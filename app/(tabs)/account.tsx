import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import Constants from "expo-constants";

import { AccountHeader } from "@/components/AccountHeader";
import type { NetworkOption } from "@/components/NetworkSelector";
import { NetworkSelector } from "@/components/NetworkSelector";
import { ProfileWalletCard } from "@/components/ProfileWalletCard";
import { SettingsRow } from "@/components/SettingsRow";
import { TokenBalanceList } from "@/components/TokenBalanceList";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Section } from "@/components/ui/Section";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useWallet } from "@/hooks/useWallet";
import { useWalletStore } from "@/store/wallet-store";

function formatSol(sol: number): string {
  if (sol >= 1000) return sol.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (sol >= 1) return sol.toFixed(2);
  if (sol >= 0.01) return sol.toFixed(4);
  return sol.toFixed(6);
}

export default function AccountScreen() {
  const wallet = useWallet();
  const isDevnet = useWalletStore((s) => s.isDevnet);
  const [network, setNetwork] = useState<NetworkOption>(
    isDevnet ? "devnet" : "mainnet",
  );
  const toggleNetwork = useWalletStore((s) => s.toggleNetwork);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [balanceSol, setBalanceSol] = useState<number | null>(null);
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});

  const fetchBalances = useCallback(async () => {
    if (!wallet.connected || !wallet.getBalance) return;
    try {
      const [sol, tokens] = await Promise.all([
        wallet.getBalance(),
        wallet.getTokenBalances?.() ?? Promise.resolve({}),
      ]);
      setBalanceSol(sol);
      setTokenBalances(tokens);
    } catch {
      setBalanceSol(null);
      setTokenBalances({});
    }
  }, [wallet.connected, wallet.getBalance, wallet.getTokenBalances]);

  useEffect(() => {
    if (wallet.connected) fetchBalances();
    else {
      setBalanceSol(null);
      setTokenBalances({});
    }
  }, [wallet.connected, fetchBalances]);

  const balances =
    wallet.connected && balanceSol !== null
      ? {
          SOL: formatSol(balanceSol),
          USDC: tokenBalances.USDC ?? "0",
          USDT: tokenBalances.USDT ?? "0",
          BONK: tokenBalances.BONK ?? "0",
          JUP: tokenBalances.JUP ?? "0",
          WIF: tokenBalances.WIF ?? "0",
        }
      : undefined;

  const appVersion = Constants.expoConfig?.version ?? "1.2.3";
  const versionLabel = appVersion.startsWith("v")
    ? appVersion
    : `v${appVersion}`;

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
            connected={wallet.connected}
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

        <Section>
          <Card padding={0} withMargin={false}>
            <View style={styles.settingsTitle}>
              <Text style={styles.settingsTitleText}>Settings</Text>
            </View>
            <SettingsRow
              label="Dark Mode"
              value={darkMode}
              onValueChange={setDarkMode}
              showDivider
            />
            <SettingsRow
              label="Notifications"
              value={notifications}
              onValueChange={setNotifications}
              showDivider
            />
            <SettingsRow
              label="Currency preference"
              valueLabel="USD"
              showDivider
            />
            <SettingsRow
              label="App version"
              valueLabel={versionLabel}
              showDivider={false}
            />
          </Card>
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
  settingsTitle: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  settingsTitleText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
});
