import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { WalletAvatar } from '@/components/WalletAvatar';
import { Button } from '@/components/ui/Button';
import { Header, HeaderButton } from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { FavoriteWallet } from '@/store/favoritesStore';
import { useFavoritesStore } from '@/store/favoritesStore';

function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function FavoriteRow({
  wallet,
  onPress,
  onDelete,
}: {
  wallet: FavoriteWallet;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onDelete}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
      ]}
      accessibilityLabel={`Send to ${wallet.name}`}
      accessibilityRole="button">
      <WalletAvatar wallet={wallet} size={48} />
      <View style={styles.rowText}>
        <Text style={styles.nickname} numberOfLines={1}>
          {wallet.name}
        </Text>
        <Text style={styles.address} numberOfLines={1}>
          {shortenAddress(wallet.address)}
        </Text>
      </View>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={({ pressed }) => [pressed && styles.deletePressed]}
        hitSlop={spacing.md}
        accessibilityLabel={`Remove ${wallet.name} from favorites`}
        accessibilityRole="button">
        <Ionicons name="trash-outline" size={22} color={colors.secondaryText} />
      </Pressable>
    </Pressable>
  );
}

export default function FavoritesScreen() {
  const router = useRouter();
  const wallets = useFavoritesStore((s) => s.wallets);
  const removeWallet = useFavoritesStore((s) => s.removeWallet);

  const handleWalletPress = (wallet: FavoriteWallet) => {
    router.push(`/send/${wallet.address}`);
  };

  const handleDelete = (wallet: FavoriteWallet) => {
    Alert.alert(
      'Remove wallet',
      `Remove "${wallet.name}" from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeWallet(wallet.id) },
      ]
    );
  };

  const handleAddWallet = () => {
    router.push('/favorites/add');
  };

  return (
    <ScreenContainer
      edges={['top', 'bottom']}
      paddingHorizontal="lg"
      paddingBottom="xl"
    >
      <Header
        title="Favorite Wallets"
        left={
          <HeaderButton
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </HeaderButton>
        }
      />
      <FlatList
        data={wallets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No favorite wallets yet</Text>
            <Text style={styles.emptySubtext}>
              Tap "Add Wallet" to add one
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <FavoriteRow
            wallet={item}
            onPress={() => handleWalletPress(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
      />
      <View style={styles.fabContainer}>
        <Button
          title="Add Wallet"
          onPress={handleAddWallet}
          fullWidth
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowText: {
    flex: 1,
    marginLeft: spacing.md,
    minWidth: 0,
  },
  nickname: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  address: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: spacing.xs,
  },
  deletePressed: {
    opacity: 0.7,
  },
  empty: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: spacing.sm,
  },
  fabContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
});
