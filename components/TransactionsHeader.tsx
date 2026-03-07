import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HeaderButton } from '@/components/ui/Header';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export function TransactionsHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>Transactions</Text>
        <View style={styles.logo}>
          <MaterialCommunityIcons name="flash" size={20} color={colors.primary} />
        </View>
      </View>
      <View style={styles.right}>
        <HeaderButton onPress={() => {}} accessibilityLabel="Filter">
          <Ionicons name="options-outline" size={22} color={colors.text} />
        </HeaderButton>
        <HeaderButton onPress={() => {}} accessibilityLabel="Search">
          <Ionicons name="search-outline" size={22} color={colors.text} />
        </HeaderButton>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  left: {
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
