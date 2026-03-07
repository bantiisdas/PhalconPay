import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export interface ProfileWalletCardProps {
  username?: string;
  address: string;
  shortened?: string;
}

function shortenAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-3)}`;
}

export function ProfileWalletCard({
  username = 'Rahul',
  address,
  shortened = shortenAddress(address),
}: ProfileWalletCardProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopy = async () => {
    await Clipboard.setStringAsync(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initial = username.charAt(0).toUpperCase();

  const actions = [
    { id: 'connect', label: 'Connect Wallet', icon: 'wallet-outline' as const, color: colors.success, onPress: () => {} },
    { id: 'disconnect', label: 'Disconnect Wallet', icon: 'log-out-outline' as const, color: colors.error, onPress: () => {} },
    { id: 'qr', label: 'Generate QR Code', icon: 'qr-code-outline' as const, color: colors.text, onPress: () => router.push('/receive') },
    { id: 'share', label: 'Share Wallet Address', icon: 'share-outline' as const, color: colors.text, onPress: () => {} },
  ];

  return (
    <Card padding="lg" withMargin={false}>
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.username}>{username}</Text>
          <View style={styles.addressRow}>
            <Text style={styles.address} selectable numberOfLines={1}>
              {shortened}
            </Text>
            <Pressable
              onPress={handleCopy}
              style={({ pressed }) => [styles.copyBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={copied ? 'Copied' : 'Copy wallet address'}>
              <Ionicons
                name={copied ? 'checkmark-circle' : 'copy-outline'}
                size={20}
                color={copied ? colors.success : colors.text}
              />
            </Pressable>
          </View>
        </View>
      </View>
      <View style={styles.actionsRow}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            onPress={action.onPress}
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel={action.label}>
            <Ionicons name={action.icon} size={22} color={action.color} style={styles.actionIcon} />
            <Text style={styles.actionLabel} numberOfLines={2}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  address: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.secondaryText,
    fontVariant: ['tabular-nums'],
  },
  copyBtn: {
    padding: spacing.xs,
  },
  pressed: {
    opacity: 0.8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPressed: {
    opacity: 0.85,
  },
  actionIcon: {
    marginBottom: spacing.xs,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});
