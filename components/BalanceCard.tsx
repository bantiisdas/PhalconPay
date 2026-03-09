import { StyleSheet, Text } from "react-native";

import { Card } from "@/components/ui/Card";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export interface BalanceCardProps {
  balance: string;
  label?: string;
  cryptoBreakdown?: string;
  /** When false, card has no horizontal margin (e.g. inside padded container). */
  withMargin?: boolean;
}

export function BalanceCard({
  balance,
  label = "Total Balance",
  cryptoBreakdown,
  withMargin = true,
}: BalanceCardProps) {
  return (
    <Card
      padding="xl"
      withMargin={withMargin}
      style={[styles.card, styles.glow]}
    >
      <Text style={styles.labelPill}>{label}</Text>
      <Text style={styles.amountText}>{balance}</Text>
      {cryptoBreakdown ? (
        <Text style={styles.breakdownText}>{cryptoBreakdown}</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.4)",
    backgroundColor: colors.card,
  },
  labelPill: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(37, 99, 235, 0.18)",
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  labelText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: spacing.sm,
  },
  amountText: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  breakdownText: {
    fontSize: 14,
    color: colors.secondaryText,
  },
});
