import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { WalletAvatar } from '@/components/WalletAvatar';
import type { FavoriteWallet } from '@/store/favoritesStore';

export interface RecipientCardProps {
  address: string;
  label?: string;
  /** Display name or short label (e.g. "Alice"). Falls back to truncated address. */
  name?: string;
  /** When set, show favorite wallet icon (from WalletAvatar) instead of initial letter. */
  avatarType?: FavoriteWallet['avatarType'];
  /** Background color for the avatar when using an icon. */
  avatarColor?: string;
  /** When true and address is "new", show an editable TextInput for entering wallet address. */
  editable?: boolean;
  /** Controlled value for the address input when editable. */
  inputValue?: string;
  /** Called when the user types in the address input. */
  onAddressChange?: (value: string) => void;
}

function truncateAddress(addr: string, start = 4, end = 3): string {
  if (!addr || addr === 'new') return 'Enter address';
  if (addr.length <= start + end) return addr;
  return `${addr.slice(0, start)}...${addr.slice(-end)}`;
}

export function RecipientCard({
  address,
  label = 'To',
  name,
  avatarType,
  avatarColor,
  editable = false,
  inputValue = '',
  onAddressChange,
}: RecipientCardProps) {
  const isEnterMode = address === 'new' && editable && onAddressChange != null;
  const displayName = name || truncateAddress(address);
  const showAddress = address && address !== 'new' && address.length > 10;
  const showFavoriteIcon = avatarType != null || avatarColor != null;

  if (isEnterMode) {
    return (
      <Card padding="lg" withMargin={false} style={styles.card}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View style={styles.row}>
          {showFavoriteIcon ? (
            <View style={styles.avatarWrap}>
              <WalletAvatar
                wallet={{
                  name: displayName,
                  avatarType,
                  avatarColor,
                }}
                size={48}
              />
            </View>
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>?</Text>
            </View>
          )}
          <View style={styles.inputColumn}>
            {name ? (
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
            ) : null}
            <TextInput
              style={[styles.addressInput, name ? styles.addressInputWithName : null]}
              value={inputValue}
              onChangeText={onAddressChange}
              placeholder="Enter wallet address"
              placeholderTextColor={colors.secondaryText}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
            />
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card padding="lg" withMargin={false} style={styles.card}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {showFavoriteIcon ? (
          <View style={styles.avatarWrap}>
            <WalletAvatar
              wallet={{
                name: displayName,
                avatarType,
                avatarColor,
              }}
              size={48}
            />
          </View>
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          {showAddress ? (
            <Text style={styles.address} numberOfLines={1}>
              {truncateAddress(address)}
            </Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  avatarWrap: {
    marginRight: spacing.lg,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  inputColumn: {
    flex: 1,
    minWidth: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  address: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: spacing.xs,
    fontFamily: 'monospace',
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
    minHeight: 48,
  },
  addressInputWithName: {
    paddingTop: spacing.xs,
    minHeight: 40,
  },
});
