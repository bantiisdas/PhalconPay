import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export interface WalletAddressCardProps {
  address: string;
  /** Shortened for display, e.g. "7xKX...9mN2". Defaults to first 6 + ... + last 4. */
  shortened?: string;
}

function shortenAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletAddressCard({
  address,
  shortened = shortenAddress(address),
}: WalletAddressCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card padding="lg" withMargin={false}>
      <View style={styles.row}>
        <Text style={styles.label}>Wallet address</Text>
        <Pressable
          onPress={handleCopy}
          style={({ pressed }) => [styles.copyBtn, pressed && styles.copyBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel={copied ? 'Copied' : 'Copy address'}>
          <Ionicons
            name={copied ? 'checkmark-circle' : 'copy-outline'}
            size={20}
            color={copied ? colors.success : colors.primary}
          />
          <Text style={[styles.copyText, copied && styles.copyTextSuccess]}>
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </Pressable>
      </View>
      <Text style={styles.address} selectable>
        {shortened}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.secondaryText,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  copyBtnPressed: {
    opacity: 0.8,
  },
  copyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  copyTextSuccess: {
    color: colors.success,
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
});
