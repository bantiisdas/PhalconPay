import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import type { FavoriteWallet } from '@/store/favoritesStore';

export interface WalletAvatarProps {
  wallet: Pick<FavoriteWallet, 'name' | 'avatarType' | 'avatarColor'>;
  size?: number;
}

export function WalletAvatar({ wallet, size = 48 }: WalletAvatarProps) {
  const bg = wallet.avatarColor ?? colors.primary + '40';
  const avatarStyle = [styles.avatar, { width: size, height: size, borderRadius: size / 2 }];

  if (wallet.avatarType === 'coffee') {
    return (
      <View style={[avatarStyle, { backgroundColor: bg }]}>
        <Ionicons name="cafe-outline" size={size * 0.5} color={colors.text} />
      </View>
    );
  }
  if (wallet.avatarType === 'person') {
    return (
      <View style={[avatarStyle, { backgroundColor: bg }]}>
        <Ionicons name="person-outline" size={size * 0.5} color={colors.text} />
      </View>
    );
  }
  if (wallet.avatarType === 'fox') {
    return (
      <View style={[avatarStyle, { backgroundColor: bg }]}>
        <MaterialCommunityIcons name="fox" size={size * 0.46} color={colors.text} />
      </View>
    );
  }
  if (wallet.avatarType === 'exchange') {
    return (
      <View style={[avatarStyle, { backgroundColor: bg }]}>
        <Ionicons name="trending-up" size={size * 0.5} color={colors.text} />
      </View>
    );
  }
  if (wallet.avatarType === 'wallet') {
    return (
      <View style={[avatarStyle, { backgroundColor: bg }]}>
        <Ionicons name="wallet-outline" size={size * 0.5} color={colors.text} />
      </View>
    );
  }
  return (
    <View style={[avatarStyle, { backgroundColor: bg }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.375 }]}>
        {wallet.name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '700',
    color: colors.text,
  },
});
