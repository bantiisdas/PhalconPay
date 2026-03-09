import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Header, HeaderButton } from "@/components/ui/Header";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { getRecipientFromSolanaPay } from "@/services/solanaPay";

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const scannedRef = useRef(false);

  const handleBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scannedRef.current) return;
      const recipient = getRecipientFromSolanaPay(data);
      if (recipient) {
        scannedRef.current = true;
        router.replace(`/send/${encodeURIComponent(recipient)}`);
      }
    },
    [router],
  );

  if (permission == null) {
    return (
      <ScreenContainer edges={["top", "bottom"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.message}>Checking camera permission…</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer edges={["top", "bottom"]}>
        <Header
          title="Scan & Pay"
          left={
            <HeaderButton
              onPress={() => router.back()}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </HeaderButton>
          }
        />
        <View style={styles.centered}>
          <Ionicons
            name="camera-outline"
            size={64}
            color={colors.secondaryText}
            style={styles.icon}
          />
          <Text style={styles.message}>
            Camera access is needed to scan Solana Pay QR codes.
          </Text>
          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => [
              styles.permissionButton,
              pressed && styles.permissionButtonPressed,
            ]}
          >
            <Text style={styles.permissionButtonText}>Allow camera</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      edges={["top", "bottom"]}
      paddingHorizontal={0}
      paddingBottom={0}
    >
      <Header
        title="Scan & Pay"
        left={
          <HeaderButton
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </HeaderButton>
        }
        right={
          <HeaderButton
            onPress={() => setTorchOn((v) => !v)}
            accessibilityLabel={torchOn ? "Turn flash off" : "Turn flash on"}
          >
            <Ionicons
              name={torchOn ? "flash" : "flash-off"}
              size={24}
              color={colors.text}
            />
          </HeaderButton>
        }
      />
      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torchOn}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={handleBarcodeScanned}
        />
        <View style={styles.overlay}>
          <View style={styles.frame} />
          <Text style={styles.hint}>
            Align a Solana Pay QR code within the frame
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  message: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  icon: {
    marginBottom: spacing.md,
  },
  permissionButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: 16,
  },
  permissionButtonPressed: {
    opacity: 0.85,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  cameraWrap: {
    flex: 1,
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  frame: {
    width: 240,
    height: 240,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
    backgroundColor: "transparent",
  },
  hint: {
    position: "absolute",
    bottom: spacing.xxl,
    left: spacing.lg,
    right: spacing.lg,
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: "center",
  },
});
