import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export interface HeaderProps extends ViewProps {
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  middle?: React.ReactNode;
  /** Hide bottom border. Default: false. */
  noBorder?: boolean;
}

export function Header({
  title,
  left,
  right,
  middle,
  noBorder = false,
  style,
  ...viewProps
}: HeaderProps) {
  return (
    <View
      style={[styles.container, !noBorder && styles.border, style]}
      {...viewProps}
    >
      <View style={styles.left} pointerEvents="box-none">
        {left}
      </View>
      {title ? (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View style={styles.spacer} />
      )}
      <View style={styles.right} pointerEvents="box-none">
        {right}
      </View>
    </View>
  );
}

/** Helper for a pressable icon slot in the header. */
export interface HeaderButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  accessibilityLabel: string;
}

export function HeaderButton({
  onPress,
  children,
  accessibilityLabel,
}: HeaderButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.headerButton,
        pressed && styles.headerButtonPressed,
      ]}
      hitSlop={spacing.lg}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  left: {
    //flex: 1,
    minWidth: 0,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  spacer: {
    width: spacing.sm,
  },
  right: {
    //flex: 1,

    minWidth: 0,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  title: {
    //flex: 1,
    minWidth: 0,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  headerButton: {
    padding: spacing.sm,
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
});
