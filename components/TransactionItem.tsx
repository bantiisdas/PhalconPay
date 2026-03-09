import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import type { FavoriteWallet } from "@/store/favoritesStore";

export type TransactionType = "sent" | "received" | "swap";

export type TransactionIconType =
  | "payment"
  | "sol"
  | "swap"
  | "bonk"
  | "coffee"
  | "avatar"
  | "default";

export interface TransactionItemProps {
  id: string;
  title: string;
  amount: string;
  type: TransactionType;
  subtitle?: string;
  date?: string;
  time?: string;
  /** When true, show time on the right below amount (Transactions screen layout). */
  timeOnRight?: boolean;
  showDivider?: boolean;
  iconType?: TransactionIconType;
  iconColor?: string;
  favoriteAvatarType?: FavoriteWallet["avatarType"];
}

function TransactionIcon({
  iconType,
  type,
  iconColor,
  favoriteAvatarType,
}: {
  iconType: TransactionIconType;
  type: TransactionType;
  iconColor?: string;
  favoriteAvatarType?: FavoriteWallet["avatarType"];
}) {
  const bg =
    iconColor ??
    (type === "received" ? colors.primary + "30" : colors.primary + "30");
  if (iconType === "payment") {
    return (
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <Text style={styles.iconSymbol}>$</Text>
      </View>
    );
  }
  if (iconType === "sol") {
    return (
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <Text style={styles.iconSymbol}>S</Text>
      </View>
    );
  }
  if (iconType === "swap") {
    return (
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
      </View>
    );
  }
  if (iconType === "bonk") {
    return (
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: bg },
        ]}
      >
        <Text style={styles.iconSymbol}>B</Text>
      </View>
    );
  }
  if (iconType === "coffee") {
    return (
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <Ionicons name="bag-handle-outline" size={20} color={colors.text} />
      </View>
    );
  }
  if (iconType === "avatar") {
    if (favoriteAvatarType === "coffee") {
      return (
        <View style={[styles.iconWrap, { backgroundColor: bg }]}>
          <Ionicons name="cafe-outline" size={20} color={colors.text} />
        </View>
      );
    }
    if (favoriteAvatarType === "exchange") {
      return (
        <View style={[styles.iconWrap, { backgroundColor: bg }]}>
          <Ionicons name="trending-up" size={20} color={colors.text} />
        </View>
      );
    }
    if (favoriteAvatarType === "person") {
      return (
        <View style={[styles.iconWrap, { backgroundColor: bg }]}>
          <Ionicons name="person-outline" size={20} color={colors.text} />
        </View>
      );
    }
    if (favoriteAvatarType === "fox") {
      return (
        <View style={[styles.iconWrap, { backgroundColor: bg }]}>
          <MaterialCommunityIcons name="fox" size={18} color={colors.text} />
        </View>
      );
    }
    if (favoriteAvatarType === "wallet") {
      return (
        <View style={[styles.iconWrap, { backgroundColor: bg }]}>
          <Ionicons name="wallet-outline" size={20} color={colors.text} />
        </View>
      );
    }
    // initial / undefined -> first letter
    return (
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <Text style={styles.iconSymbol}>A</Text>
      </View>
    );
  }
  const iconName = type === "received" ? "arrow-down" : "arrow-up";
  const color = type === "received" ? colors.success : colors.textMuted;
  return (
    <View style={[styles.iconWrap, { backgroundColor: color + "20" }]}>
      <Ionicons name={iconName} size={20} color={color} />
    </View>
  );
}

export function TransactionItem({
  title,
  amount,
  type,
  subtitle,
  date,
  time,
  timeOnRight = false,
  showDivider = true,
  iconType = "default",
  iconColor,
  favoriteAvatarType,
}: TransactionItemProps) {
  const isReceived = type === "received";
  const isSwap = type === "swap";
  const amountColor = isReceived
    ? colors.success
    : isSwap
      ? colors.text
      : colors.error;
  const amountPrefix = isSwap ? "" : isReceived ? "+" : "-";

  const timeLabel = time ?? date;
  const typeLabel = isSwap ? "Swap" : isReceived ? "Received" : "Sent";
  const leftSubtitle = subtitle ?? (timeOnRight ? typeLabel : timeLabel);

  return (
    <View style={[styles.row, showDivider && styles.rowBorder]}>
      <TransactionIcon
        iconType={iconType}
        type={type}
        iconColor={iconColor}
        favoriteAvatarType={favoriteAvatarType}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {leftSubtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {leftSubtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.rightColumn}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {amountPrefix}
          {amount}
        </Text>
        {timeOnRight && timeLabel ? (
          <Text style={styles.dateRight}>{timeLabel}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  iconSymbol: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: spacing.xs,
  },
  date: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: spacing.xs,
  },
  rightColumn: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateRight: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: spacing.xs,
  },
});
