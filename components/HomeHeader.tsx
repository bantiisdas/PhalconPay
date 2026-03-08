import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useWalletStore } from "@/store/wallet-store";

export interface HomeHeaderProps {
  title?: string;
}

export function HomeHeader({ title = "FalconPay" }: HomeHeaderProps) {
  const router = useRouter();
  const isDevnet = useWalletStore((s) => s.isDevnet);
  const toggleNetwork = useWalletStore((s) => s.toggleNetwork);
  const displayName = useWalletStore((s) => s.displayName);
  const initial =
    displayName.trim().length > 0
      ? displayName.trim().charAt(0).toUpperCase()
      : "Y";

  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <View style={styles.logo}>
          <MaterialCommunityIcons name="flash" size={24} color={colors.text} />
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Pressable
          onPress={toggleNetwork}
          style={({ pressed }) => [
            styles.devnetBadge,
            pressed && styles.pressed,
            !isDevnet && styles.mainnetBadge,
          ]}
          hitSlop={spacing.sm}
          accessibilityLabel={isDevnet ? "Switch to Mainnet" : "Switch to Devnet"}
          accessibilityRole="button"
        >
          <Text style={styles.devnetText}>
            {isDevnet ? "Devnet" : "Mainnet"}
          </Text>
        </Pressable>
      </View>
      <Pressable
        onPress={() => router.push("/(tabs)/account")}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        hitSlop={spacing.lg}
        accessibilityLabel="Account"
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
    minWidth: 0,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flexShrink: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  devnetBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginLeft: spacing.sm,
  },
  mainnetBadge: {
    backgroundColor: colors.primary,
  },
  devnetText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  iconButton: {
    padding: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.secondaryText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
