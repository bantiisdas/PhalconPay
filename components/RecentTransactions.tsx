import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import type {
  TransactionIconType,
  TransactionType,
} from "@/components/TransactionItem";
import { TransactionItem } from "@/components/TransactionItem";
import { Card } from "@/components/ui/Card";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export interface RecentTransactionData {
  id: string;
  title: string;
  amount: string;
  type: TransactionType;
  subtitle?: string;
  time?: string;
  date?: string;
  iconType?: TransactionIconType;
  iconColor?: string;
  favoriteAvatarType?: import("@/store/favoritesStore").FavoriteWallet["avatarType"];
}

export interface RecentTransactionsProps {
  transactions: RecentTransactionData[];
  /** Section title. Omit or set showTitle={false} when used inside a Section. */
  title?: string;
  /** When false, title is not rendered (e.g. when wrapped in Section). Default true. */
  showTitle?: boolean;
}

export function RecentTransactions({
  transactions,
  title = "Recent Transactions",
  showTitle = true,
}: RecentTransactionsProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {showTitle && title ? (
        <Text style={styles.sectionTitle}>{title}</Text>
      ) : null}
      <Card padding={0} withMargin={false}>
        <View style={styles.list}>
          {transactions.map((tx, index) => (
            <Pressable
              key={tx.id}
              onPress={() =>
                router.push({
                  pathname: "/transaction/[id]",
                  params: { id: tx.id },
                })
              }
              style={({ pressed }) => [pressed && styles.rowPressed]}
            >
              <TransactionItem
                id={tx.id}
                title={tx.title}
                amount={tx.amount}
                type={tx.type}
                subtitle={tx.subtitle}
                date={tx.date}
                time={tx.time}
                iconType={tx.iconType}
                iconColor={tx.iconColor}
                favoriteAvatarType={tx.favoriteAvatarType}
                showDivider={index < transactions.length - 1}
              />
            </Pressable>
          ))}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  list: {
    overflow: "hidden",
  },
  rowPressed: {
    opacity: 0.9,
  },
});
