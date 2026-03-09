import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export interface SwapAndSendPreviewCardProps {
  /** Token name, e.g. "SOL" */
  swapFrom: string;
  /** Token name, e.g. "JUP" */
  swapTo: string;
  /** e.g. "0.05 SOL" - amount user pays for the swap */
  youPay: string;
  /** e.g. "10 JUP" - amount that will be sent to recipient */
  youSend: string;
  onSwapAndSend: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function SwapAndSendPreviewCard({
  swapFrom,
  swapTo,
  youPay,
  youSend,
  onSwapAndSend,
  loading = false,
  disabled = false,
}: SwapAndSendPreviewCardProps) {
  return (
    <Card padding="lg" withMargin={false} style={styles.card}>
      <Text style={styles.title}>Swap & Send</Text>
      <Text style={styles.subtitle}>
        You don't have enough balance. We'll swap only what's needed, then send.
      </Text>
      <View style={styles.row}>
        <Text style={styles.label}>Swap From</Text>
        <Text style={styles.value}>{swapFrom}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Swap To</Text>
        <Text style={styles.value}>{swapTo}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>You Pay</Text>
        <Text style={styles.value}>{youPay}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>You Send</Text>
        <Text style={styles.value}>{youSend}</Text>
      </View>
      <Button
        title={loading ? "Swap & Sending…" : "Swap & Send"}
        onPress={onSwapAndSend}
        disabled={disabled || loading}
        fullWidth
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  label: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  fee: {
    fontSize: 14,
    color: colors.secondaryText,
  },
});
