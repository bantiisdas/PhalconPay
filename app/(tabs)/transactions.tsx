import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { TransactionItem } from "@/components/TransactionItem";
import { TransactionsHeader } from "@/components/TransactionsHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Section } from "@/components/ui/Section";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import {
  getTransactionSections,
  useTransactionsStore,
} from "@/store/transactionsStore";

export default function TransactionsScreen() {
  const router = useRouter();
  const transactions = useTransactionsStore((s) => s.transactions);
  const sections = getTransactionSections(transactions);

  return (
    <ScreenContainer edges={["top"]} paddingHorizontal="lg" paddingBottom="xl">
      <TransactionsHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>
              Send, swap, or swap & send to see history here.
            </Text>
          </View>
        ) : (
          sections.map((section) => (
            <Section key={section.title} title={section.title}>
              <View style={styles.cardList}>
                {section.data.map((tx, index) => (
                  <Pressable
                    key={tx.id}
                    onPress={() =>
                      router.push({
                        pathname: "/transaction/[id]",
                        params: { id: tx.id },
                      })
                    }
                    style={({ pressed }) => [pressed && styles.cardPressed]}
                  >
                    <Card
                      padding={0}
                      withMargin={false}
                      style={
                        index < section.data.length - 1
                          ? styles.transactionCard
                          : undefined
                      }
                    >
                      <TransactionItem
                        id={tx.id}
                        title={tx.title}
                        amount={tx.amount}
                        type={tx.type}
                        time={tx.time}
                        iconType={tx.iconType}
                        iconColor={tx.iconColor}
                        favoriteAvatarType={tx.favoriteAvatarType}
                        timeOnRight
                        showDivider={false}
                      />
                    </Card>
                  </Pressable>
                ))}
              </View>
            </Section>
          ))
        )}
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
  cardList: {},
  cardPressed: {
    opacity: 0.9,
  },
  transactionCard: {
    marginBottom: spacing.md,
  },
  empty: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.secondaryText,
  },
});
