import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export type QuickActionId = "send" | "scan" | "receive" | "swap";

export interface QuickActionItem {
  id: QuickActionId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const ACTIONS: QuickActionItem[] = [
  { id: "send", label: "Send", icon: "paper-plane", color: colors.primary },
  { id: "scan", label: "Scan & Pay", icon: "scan", color: colors.scan },
  { id: "receive", label: "Receive", icon: "qr-code", color: colors.success },
  { id: "swap", label: "Swap", icon: "swap-horizontal", color: colors.swap },
];

export interface QuickActionsProps {
  onActionPress?: (id: QuickActionId) => void;
}

export function QuickActions({ onActionPress }: QuickActionsProps) {
  const router = useRouter();

  const handlePress = (id: QuickActionId) => {
    if (onActionPress) {
      onActionPress(id);
      return;
    }
    switch (id) {
      case "send":
        router.push("/send/new");
        break;
      case "scan":
        router.push("/scan");
        break;
      case "receive":
        router.push("/receive");
        break;
      case "swap":
        router.push("/swap");
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {ACTIONS.map((action) => (
          <Pressable
            key={action.id}
            onPress={() => handlePress(action.id)}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: action.color + "20",
                borderColor: action.color + "60",
              },
              pressed && styles.actionButtonPressed,
            ]}
            accessibilityLabel={action.label}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: action.color + "30" },
              ]}
            >
              <Ionicons
                name={action.id === "receive" ? "arrow-down" : action.icon}
                size={22}
                color={colors.text}
              />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: "47%",
    maxWidth: "48%",
    borderRadius: 16,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
});
