import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Card } from "@/components/ui/Card";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useWallet } from "@/hooks/useWallet";
import { useWalletStore } from "@/store/wallet-store";

export interface ProfileWalletCardProps {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

function shortenAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-3)}`;
}

const PLACEHOLDER_NAME = "Your Name";

export function ProfileWalletCard({
  connected,
  connecting,
  publicKey,
  onConnect,
  onDisconnect,
}: ProfileWalletCardProps) {
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editValue, setEditValue] = useState("");
  const router = useRouter();
  const wallet = useWallet();
  const displayName = useWalletStore((s) => s.displayName);
  const setDisplayName = useWalletStore((s) => s.setDisplayName);
  const profileImageUri = useWalletStore((s) => s.profileImageUri);
  const setProfileImageUri = useWalletStore((s) => s.setProfileImageUri);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(publicKey ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startEdit = () => {
    setEditValue(displayName || "");
    setIsEditingName(true);
  };

  const saveName = () => {
    setDisplayName(editValue);
    setIsEditingName(false);
  };

  const displayLabel = displayName.trim() || PLACEHOLDER_NAME;
  const initial = displayLabel.charAt(0).toUpperCase();

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to set a profile picture.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;
    const uri = result.assets[0].uri;
    if (uri) {
      setProfileImageUri(uri);
    }
  };

  return (
    <Card padding="lg" withMargin={false}>
      <View style={styles.profileRow}>
        <Pressable
          onPress={handlePickImage}
          style={styles.avatarPressable}
          accessibilityRole="button"
          accessibilityLabel="Change profile picture"
        >
          <View style={styles.avatar}>
            {profileImageUri ? (
              <Image
                source={{ uri: profileImageUri }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </View>
          <View style={styles.cameraBadge}>
            <Ionicons
              name="camera-outline"
              size={16}
              color={colors.text}
            />
          </View>
        </Pressable>
        <View style={styles.info}>
          {isEditingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={editValue}
                onChangeText={setEditValue}
                placeholder={PLACEHOLDER_NAME}
                placeholderTextColor={colors.secondaryText}
                autoFocus
                onBlur={saveName}
                onSubmitEditing={saveName}
                returnKeyType="done"
                maxLength={32}
              />
              <Pressable
                onPress={saveName}
                style={({ pressed }) => [
                  styles.pencilBtn,
                  pressed && styles.pressed,
                ]}
                accessibilityLabel="Save name"
                accessibilityRole="button"
              >
                <Ionicons name="checkmark" size={22} color={colors.success} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={startEdit}
              style={styles.nameRow}
              accessibilityLabel="Edit name"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.username,
                  !displayName.trim() && styles.usernamePlaceholder,
                ]}
              >
                {displayLabel}
              </Text>
              <Ionicons
                name="pencil"
                size={18}
                color={colors.secondaryText}
                style={styles.pencilIcon}
              />
            </Pressable>
          )}
          <View style={styles.addressRow}>
            <Text style={styles.address} selectable numberOfLines={1}>
              {shortenAddress(publicKey ?? "")}
            </Text>
            <Pressable
              onPress={handleCopy}
              style={({ pressed }) => [
                styles.copyBtn,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={copied ? "Copied" : "Copy wallet address"}
            >
              <Ionicons
                name={copied ? "checkmark-circle" : "copy-outline"}
                size={20}
                color={copied ? colors.success : colors.text}
              />
            </Pressable>
          </View>
        </View>
      </View>
      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => {
            wallet.connect();
          }}
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && styles.actionBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Connect Wallet"
        >
          <Ionicons
            name="wallet-outline"
            size={22}
            color={colors.success}
            style={styles.actionIcon}
          />
          <Text style={styles.actionLabel} numberOfLines={2}>
            Connect Wallet
          </Text>
        </Pressable>
        <Pressable
          onPress={onDisconnect}
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && styles.actionBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Disconnect Wallet"
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color={colors.error}
            style={styles.actionIcon}
          />
          <Text style={styles.actionLabel} numberOfLines={2}>
            Disconnect Wallet
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/receive")}
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && styles.actionBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Generate QR Code"
        >
          <Ionicons
            name="qr-code-outline"
            size={22}
            color={colors.text}
            style={styles.actionIcon}
          />
          <Text style={styles.actionLabel} numberOfLines={2}>
            Generate QR Code
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  avatarPressable: {
    marginRight: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  cameraBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  usernamePlaceholder: {
    color: colors.secondaryText,
  },
  pencilIcon: {
    marginLeft: spacing.xs,
  },
  nameEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  nameInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
  },
  pencilBtn: {
    padding: spacing.xs,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  address: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.secondaryText,
    fontVariant: ["tabular-nums"],
  },
  copyBtn: {
    padding: spacing.xs,
  },
  pressed: {
    opacity: 0.8,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnPressed: {
    opacity: 0.85,
  },
  actionIcon: {
    marginBottom: spacing.xs,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
});
