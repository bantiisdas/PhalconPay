import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { FavoriteWallet } from '@/store/favoritesStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { WalletAvatar } from '@/components/WalletAvatar';

export type { FavoriteWallet };

export interface FavoriteWalletsProps {
  wallets?: FavoriteWallet[];
  title?: string;
}

export function FavoriteWallets({
  wallets: walletsProp,
  title = 'Favorite Wallets',
}: FavoriteWalletsProps) {
  const router = useRouter();
  const storedWallets = useFavoritesStore((s) => s.wallets);
  const wallets = walletsProp ?? storedWallets;

  const handleWalletPress = (wallet: FavoriteWallet) => {
    const address = wallet.address ?? `0x${wallet.id}`;
    router.push(`/send/${address}`);
  };

  const handleViewAll = () => {
    router.push('/favorites' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable
          onPress={handleViewAll}
          style={({ pressed }) => [pressed && styles.viewAllPressed]}
          accessibilityLabel="View all favorite wallets"
          accessibilityRole="button">
          <Text style={styles.viewAllText}>View All</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {wallets.map((wallet) => (
          <Pressable
            key={wallet.id}
            onPress={() => handleWalletPress(wallet)}
            style={({ pressed }) => [
              styles.walletChip,
              pressed && styles.walletChipPressed,
            ]}
            accessibilityLabel={`Send to ${wallet.name}`}>
            <View style={styles.avatarWrap}>
              <WalletAvatar wallet={wallet} size={48} />
            </View>
            <Text style={styles.walletName} numberOfLines={1}>
              {wallet.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  viewAllPressed: {
    opacity: 0.7,
  },
  scrollContent: {
    flexDirection: 'row',
    paddingRight: spacing.lg,
  },
  walletChip: {
    alignItems: 'center',
    width: 72,
    marginRight: spacing.lg,
  },
  walletChipPressed: {
    opacity: 0.7,
  },
  avatarWrap: {
    marginBottom: spacing.sm,
  },
  walletName: {
    fontSize: 12,
    color: colors.text,
    maxWidth: 72,
    textAlign: 'center',
  },
});
