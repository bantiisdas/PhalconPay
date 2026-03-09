import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { DetailRow } from "@/components/DetailRow";
import type { TransactionIconType } from "@/components/TransactionItem";
import { WalletAvatar } from "@/components/WalletAvatar";
import { Card } from "@/components/ui/Card";
import { Header, HeaderButton } from "@/components/ui/Header";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import {
  getStoredTransactionDetails,
  type TransactionDetailsView,
} from "@/store/transactionsStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useWalletStore } from "@/store/wallet-store";
import * as Linking from "expo-linking";

function shorten(str: string, start = 4, end = 4): string {
  if (str.length <= start + end) return str;
  return `${str.slice(0, start)}...${str.slice(-end)}`;
}

function TransactionSummaryIcon({
  iconType,
  type,
}: {
  iconType?: TransactionIconType;
  type: TransactionDetailsView["type"];
}) {
  const bg = colors.primary + "30";
  const symbol =
    iconType === "payment"
      ? "$"
      : iconType === "sol"
        ? "S"
        : iconType === "bonk"
          ? "B"
          : type === "received"
            ? "↓"
            : "↑";
  return (
    <View style={[styles.summaryIcon, { backgroundColor: bg }]}>
      <Text style={styles.summaryIconText}>{symbol}</Text>
    </View>
  );
}

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDevnet = useWalletStore((s) => s.isDevnet);
  const tx = id ? getStoredTransactionDetails(id) : undefined;
  const favorites = useFavoritesStore((s) => s.wallets);

  if (!tx) {
    return (
      <ScreenContainer edges={["top"]} paddingHorizontal="lg">
        <Header
          title="Transaction Details"
          left={
            <HeaderButton
              onPress={() => router.back()}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </HeaderButton>
          }
        />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Transaction not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const isReceived = tx.type === "received";
  const amountColor = isReceived ? colors.success : colors.error;
  const typeLabel =
    tx.type === "swap" ? "Swap" : isReceived ? "Received" : "Sent";
  const statusColor =
    tx.status === "confirmed"
      ? colors.success
      : tx.status === "pending"
        ? colors.brandOrange
        : colors.error;

  const handleCopyHash = async () => {
    await Clipboard.setStringAsync(tx.hash);
  };

  const favorite = favorites.find((w) => w.address === tx.toAddress);
  const counterpartyName = favorite?.name ?? tx.title;

  const counterpartyLabel =
    tx.type === "swap"
      ? tx.title
      : isReceived
        ? `From ${counterpartyName}`
        : `To ${counterpartyName}`;

  const explorerUrl = `https://solscan.io/tx/${tx.hash}${isDevnet ? "?cluster=devnet" : ""}`;

  return (
    <ScreenContainer edges={["top"]} paddingHorizontal="lg" paddingBottom="xl">
      <Header
        title="Transaction Details"
        left={
          <HeaderButton
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </HeaderButton>
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card padding="lg" withMargin={false} style={styles.summaryCard}>
          <View style={styles.summaryCentered}>
            {favorite ? (
              <WalletAvatar
                wallet={{
                  name: favorite.name,
                  avatarType: favorite.avatarType,
                  avatarColor: favorite.avatarColor,
                }}
                size={64}
              />
            ) : (
              <TransactionSummaryIcon iconType={tx.iconType} type={tx.type} />
            )}
            <Text style={[styles.summaryAmount, { color: amountColor }]}>
              {tx.amountValue}
            </Text>
            <Text style={styles.summaryType}>{typeLabel}</Text>
            <Text style={styles.summaryCounterparty}>{counterpartyLabel}</Text>
          </View>
        </Card>

        <Card padding="lg" withMargin={false} style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={styles.statusValueRow}>
              {tx.status === "confirmed" ? (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.success}
                  style={styles.statusIcon}
                />
              ) : null}
              <Text style={[styles.statusValueText, { color: statusColor }]}>
                {tx.status === "confirmed"
                  ? "Confirmed"
                  : tx.status === "pending"
                    ? "Pending"
                    : "Failed"}
              </Text>
            </View>
          </View>
        </Card>

        <Card padding={0} withMargin={false} style={styles.detailsCard}>
          <Text style={styles.detailsCardTitle}>Transaction details</Text>
          <View style={styles.cardPadding}>
            {tx.fromAddress || tx.fromName ? (
              <DetailRow
                label="From"
                value={tx.fromName}
                subValue={tx.fromAddress ? shorten(tx.fromAddress) : undefined}
              />
            ) : null}
            {tx.toAddress || tx.toName ? (
              <DetailRow
                label="To"
                value={favorite?.name ?? tx.toName}
                subValue={tx.toAddress ? shorten(tx.toAddress) : undefined}
              />
            ) : null}
            <DetailRow label="Amount" value={tx.amount} />
            <DetailRow label="Total" value={tx.total} last />
          </View>
        </Card>

        <Card padding={0} withMargin={false} style={styles.timestampCard}>
          <View style={styles.cardPadding}>
            <DetailRow label="Date" value={tx.date} />
            <DetailRow label="Time" value={tx.time} last />
          </View>
        </Card>

        <Card padding="lg" withMargin={false} style={styles.hashCard}>
          <View style={styles.hashTopRow}>
            <Text style={styles.sectionLabel}>Transaction Hash</Text>
            <Text style={styles.hashText} selectable>
              {shorten(tx.hash, 6, 4)}
            </Text>
          </View>
          <View style={styles.hashButtonsRow}>
            <Pressable
              onPress={handleCopyHash}
              style={({ pressed }) => [
                styles.hashButton,
                pressed && styles.pressed,
              ]}
              accessibilityLabel="Copy hash"
            >
              <Text style={styles.hashButtonText}>Copy Hash</Text>
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL(explorerUrl)}
              style={({ pressed }) => [
                styles.hashButton,
                pressed && styles.pressed,
              ]}
              accessibilityLabel="View on Explorer"
            >
              <Text style={styles.hashButtonText}>View on Explorer</Text>
            </Pressable>
          </View>
        </Card>

        {tx.note ? (
          <Card padding="lg" withMargin={false} style={styles.noteCard}>
            <View style={styles.noteRow}>
              <Text style={styles.noteLabel}>Note</Text>
              <Text style={styles.noteText}>{tx.note}</Text>
            </View>
          </Card>
        ) : null}

        {/* Footer actions removed per design: Share Receipt, Repeat Payment */}
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryCentered: {
    alignItems: "center",
  },
  summaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  summaryIconText: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  summaryType: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  summaryCounterparty: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  statusCard: {
    marginBottom: spacing.xl,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLabel: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  statusValueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    marginRight: spacing.sm,
  },
  statusValueText: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailsCard: {
    marginBottom: spacing.xl,
  },
  detailsCardTitle: {
    fontSize: 14,
    color: colors.secondaryText,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  cardPadding: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  timestampCard: {
    marginBottom: spacing.xl,
  },
  hashCard: {
    marginBottom: spacing.xl,
  },
  hashTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  hashText: {
    fontSize: 14,
    fontVariant: ["tabular-nums"],
    color: colors.text,
  },
  hashButtonsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  hashButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  hashButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  pressed: {
    opacity: 0.85,
  },
  noteCard: {
    marginBottom: spacing.xl,
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  noteLabel: {
    fontSize: 14,
    color: colors.secondaryText,
    marginRight: spacing.md,
  },
  noteText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    textAlign: "right",
  },
  actionsSection: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  actionButtonSecondary: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
});
