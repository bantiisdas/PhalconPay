import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { InAppLogo } from "@/components/InAppLogo";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export function TransactionsHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Transactions</Text>
        <View style={styles.logo}>
          <InAppLogo size={24} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  center: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  logo: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
});
