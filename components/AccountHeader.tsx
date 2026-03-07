import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export function AccountHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <View style={styles.logo}>
        <MaterialCommunityIcons name="flash" size={20} color={colors.primary} />
      </View>
      <Pressable
        style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}
        hitSlop={spacing.lg}
        accessibilityRole="button"
        accessibilityLabel="Settings">
        <Ionicons name="settings-outline" size={24} color={colors.text} />
      </Pressable>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtn: {
    padding: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
});
