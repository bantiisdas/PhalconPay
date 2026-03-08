import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useWallet } from "@/hooks/useWallet";

export interface ProfileWalletCardProps {
  username?: string;

  shortened?: string;
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

function shortenAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-3)}`;
}

export function ProfileWalletCard({
  username = "Rahul",
  connected,
  connecting,
  publicKey,
  onConnect,
  onDisconnect,
}: ProfileWalletCardProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const wallet = useWallet();

  const handleCopy = async () => {
    await Clipboard.setStringAsync(publicKey ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initial = username.charAt(0).toUpperCase();

  return (
    <Card padding="lg" withMargin={false}>
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.username}>{username}</Text>
          <View style={styles.addressRow}>
            <Text style={styles.address} selectable numberOfLines={1}>
              {shortenAddress(publicKey ?? "")}
            </Text>
            <Pressable
              onPress={handleCopy}
              style={({ pressed }) => [
                styles.copyBtn,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={copied ? "Copied" : "Copy wallet address"}
            >
              <Ionicons
                name={copied ? "checkmark-circle" : "copy-outline"}
                size={20}
                color={copied ? colors.success : colors.text}
              />
            </Pressable>
          </View>
        </View>
      </View>
      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => {
            wallet.connect();
          }}
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && styles.actionBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Connect Wallet"
        >
          <Ionicons
            name="wallet-outline"
            size={22}
            color={colors.success}
            style={styles.actionIcon}
          />
          <Text style={styles.actionLabel} numberOfLines={2}>
            Connect Wallet
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {}}
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && styles.actionBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Disconnect Wallet"
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color={colors.error}
            style={styles.actionIcon}
          />
          <Text style={styles.actionLabel} numberOfLines={2}>
            Disconnect Wallet
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/receive")}
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && styles.actionBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Generate QR Code"
        >
          <Ionicons
            name="qr-code-outline"
            size={22}
            color={colors.text}
            style={styles.actionIcon}
          />
          <Text style={styles.actionLabel} numberOfLines={2}>
            Generate QR Code
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {}}
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && styles.actionBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Share Wallet Address"
        >
          <Ionicons
            name="share-outline"
            size={22}
            color={colors.text}
            style={styles.actionIcon}
          />
          <Text style={styles.actionLabel} numberOfLines={2}>
            Share Wallet Address
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + "30",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  address: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.secondaryText,
    fontVariant: ["tabular-nums"],
  },
  copyBtn: {
    padding: spacing.xs,
  },
  pressed: {
    opacity: 0.8,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnPressed: {
    opacity: 0.85,
  },
  actionIcon: {
    marginBottom: spacing.xs,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
});
