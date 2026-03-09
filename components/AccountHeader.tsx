import { StyleSheet, Text, View } from 'react-native';

import { InAppLogo } from '@/components/InAppLogo';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export function AccountHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.centerRow}>
        <Text style={styles.title}>Account</Text>
        <View style={styles.logo}>
          <InAppLogo size={24} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: 20,
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
