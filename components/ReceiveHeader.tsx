import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { InAppLogo } from '@/components/InAppLogo';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export function ReceiveHeader() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        hitSlop={spacing.lg}
        accessibilityRole="button"
        accessibilityLabel="Go back">
        <Text style={styles.backArrow}>‹</Text>
      </Pressable>
      <Text style={styles.title}>Receive</Text>
      <View style={styles.logo}>
        <InAppLogo size={24} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  backBtn: {
    padding: spacing.sm,
    minWidth: 44,
  },
  backArrow: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.text,
    lineHeight: 36,
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  logo: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
