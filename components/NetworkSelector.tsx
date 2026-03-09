import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export type NetworkOption = "devnet" | "mainnet";

export interface NetworkSelectorProps {
  value: NetworkOption;
  onValueChange: (value: NetworkOption) => void;
}

const OPTIONS: { value: NetworkOption; label: string }[] = [
  { value: "devnet", label: "Devnet" },

  { value: "mainnet", label: "Mainnet" },
];

export function NetworkSelector({
  value,
  onValueChange,
}: NetworkSelectorProps) {
  return (
    <Card padding="lg" withMargin={false}>
      <Text style={styles.title}>Network</Text>
      <View style={styles.container}>
        {OPTIONS.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onValueChange(opt.value)}
              style={[styles.option, isSelected && styles.optionSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${opt.label}${isSelected ? ", selected" : ""}`}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  container: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.secondaryText,
  },
  optionTextSelected: {
    color: colors.text,
  },
});
