import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { WalletAvatar } from "@/components/WalletAvatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header, HeaderButton } from "@/components/ui/Header";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { avatarColors, colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import type { FavoriteWallet, WalletType } from "@/store/favoritesStore";
import { useFavoritesStore } from "@/store/favoritesStore";

const WALLET_TYPES: { value: WalletType; label: string }[] = [
  { value: "friend", label: "Friend" },
  { value: "merchant", label: "Merchant" },
  { value: "exchange", label: "Exchange" },
  { value: "wallet", label: "Wallet" },
];

type AvatarIconType = FavoriteWallet["avatarType"];

const AVATAR_OPTIONS: { type: AvatarIconType; label: string }[] = [
  { type: undefined, label: "Initial" },
  { type: "wallet", label: "Wallet" },
  { type: "coffee", label: "Coffee" },
  { type: "exchange", label: "Exchange" },
  { type: "person", label: "Person" },
  { type: "fox", label: "Fox" },
];

function pickRandomAvatarColor(): string {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)];
}

export default function AddWalletScreen() {
  const router = useRouter();
  const addWallet = useFavoritesStore((s) => s.addWallet);

  const [address, setAddress] = useState("");
  const [nickname, setNickname] = useState("");
  const [type, setType] = useState<WalletType | undefined>(undefined);
  const [avatarType, setAvatarType] = useState<AvatarIconType>(undefined);
  const [avatarColor] = useState(() => pickRandomAvatarColor());

  const canSubmit = address.trim().length > 0 && nickname.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const trimmedAddress = address.trim();
    const trimmedName = nickname.trim();
    addWallet({
      name: trimmedName,
      address: trimmedAddress,
      type,
      avatarType: avatarType ?? undefined,
      avatarColor, // used for initial letter or icon background
    });
    router.back();
  };

  const previewWallet: Pick<
    FavoriteWallet,
    "name" | "avatarType" | "avatarColor"
  > = {
    name: nickname.trim() || "?",
    avatarType: avatarType ?? undefined,
    avatarColor: avatarColor,
  };

  return (
    <ScreenContainer
      edges={["top", "bottom"]}
      paddingHorizontal="lg"
      paddingBottom="xl"
    >
      <Header
        title="Add Wallet"
        left={
          <HeaderButton
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </HeaderButton>
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <View style={styles.avatarPreview}>
            <WalletAvatar wallet={previewWallet} size={64} />
            <Text style={styles.previewLabel}>Preview</Text>
          </View>

          <Text style={styles.label}>Wallet Address *</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Paste or enter address"
            placeholderTextColor={colors.secondaryText}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Nickname *</Text>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="e.g. Alice, Coffee Shop"
            placeholderTextColor={colors.secondaryText}
            style={styles.input}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Type (optional)</Text>
          <View style={styles.typeRow}>
            {WALLET_TYPES.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() =>
                  setType(type === opt.value ? undefined : opt.value)
                }
                style={[
                  styles.typeChip,
                  type === opt.value && styles.typeChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    type === opt.value && styles.typeChipTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Avatar / Icon</Text>
          <View style={styles.iconRow}>
            {AVATAR_OPTIONS.map((opt) => (
              <Pressable
                key={opt.label}
                onPress={() => setAvatarType(opt.type)}
                style={[
                  styles.iconOption,
                  avatarType === opt.type && styles.iconOptionSelected,
                ]}
                accessibilityLabel={`Avatar ${opt.label}`}
                accessibilityRole="button"
              >
                {opt.type === undefined ? (
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: avatarColor },
                    ]}
                  >
                    <Text style={styles.iconInitial}>
                      {(nickname.trim() || "?").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                ) : opt.type === "coffee" ? (
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: avatarColor },
                    ]}
                  >
                    <Ionicons
                      name="cafe-outline"
                      size={24}
                      color={colors.text}
                    />
                  </View>
                ) : opt.type === "exchange" ? (
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: avatarColor },
                    ]}
                  >
                    <Ionicons
                      name="trending-up"
                      size={24}
                      color={colors.text}
                    />
                  </View>
                ) : opt.type === "person" ? (
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: avatarColor },
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={24}
                      color={colors.text}
                    />
                  </View>
                ) : opt.type === "fox" ? (
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: avatarColor },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="fox"
                      size={22}
                      color={colors.text}
                    />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: avatarColor },
                    ]}
                  >
                    <Ionicons
                      name="wallet-outline"
                      size={24}
                      color={colors.text}
                    />
                  </View>
                )}
                <Text style={styles.iconLabel} numberOfLines={1}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Button
          title="Add to Favorites"
          onPress={handleSubmit}
          disabled={!canSubmit}
          fullWidth
          style={styles.submitButton}
        />
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
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatarPreview: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  previewLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: "transparent",
  },
  typeChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "20",
  },
  typeChipText: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  typeChipTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  iconOption: {
    alignItems: "center",
    width: 64,
    padding: spacing.xs,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  iconOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "15",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  iconInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  iconLabel: {
    fontSize: 11,
    color: colors.secondaryText,
    maxWidth: 64,
    textAlign: "center",
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
