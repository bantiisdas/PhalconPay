import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DetailRow } from '@/components/DetailRow';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header, HeaderButton } from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import type { TransactionIconType } from '@/components/TransactionItem';
import {
  getTransactionById,
  type TransactionDetails,
} from '@/constants/transactions';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

function shorten(str: string, start = 4, end = 4): string {
  if (str.length <= start + end) return str;
  return `${str.slice(0, start)}...${str.slice(-end)}`;
}

function TransactionSummaryIcon({
  iconType,
  type,
}: {
  iconType?: TransactionIconType;
  type: TransactionDetails['type'];
}) {
  const bg = colors.primary + '30';
  const symbol =
    iconType === 'payment'
      ? '$'
      : iconType === 'sol'
        ? 'S'
        : iconType === 'bonk'
          ? 'B'
          : type === 'received'
            ? '↓'
            : '↑';
  return (
    <View style={[styles.summaryIcon, { backgroundColor: bg }]}>
      <Text style={styles.summaryIconText}>{symbol}</Text>
    </View>
  );
}

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const tx = id ? getTransactionById(id) : undefined;

  if (!tx) {
    return (
      <ScreenContainer edges={['top']} paddingHorizontal="lg">
        <Header
          title="Transaction Details"
          left={
            <HeaderButton onPress={() => router.back()} accessibilityLabel="Go back">
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </HeaderButton>
          }
        />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Transaction not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const isReceived = tx.type === 'received';
  const amountColor = isReceived ? colors.success : colors.error;
  const typeLabel = tx.type === 'swap' ? 'Swap' : isReceived ? 'Received' : 'Sent';
  const statusColor =
    tx.status === 'confirmed'
      ? colors.success
      : tx.status === 'pending'
        ? colors.brandOrange
        : colors.error;

  const handleCopyHash = async () => {
    await Clipboard.setStringAsync(tx.hash);
  };

  const counterpartyLabel = isReceived ? `From ${tx.title}` : `To ${tx.title}`;

  return (
    <ScreenContainer edges={['top']} paddingHorizontal="lg" paddingBottom="xl">
      <Header
        title="Transaction Details"
        left={
          <HeaderButton onPress={() => router.back()} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </HeaderButton>
        }
        right={
          <HeaderButton onPress={() => {}} accessibilityLabel="Share">
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </HeaderButton>
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Card padding="lg" withMargin={false} style={styles.summaryCard}>
          <View style={styles.summaryCentered}>
            <TransactionSummaryIcon iconType={tx.iconType} type={tx.type} />
            <Text style={[styles.summaryAmount, { color: amountColor }]}>
              {tx.amountValue}
            </Text>
            <Text style={styles.summaryType}>{typeLabel}</Text>
            <Text style={styles.summaryCounterparty}>{counterpartyLabel}</Text>
          </View>
        </Card>

        <Card padding="lg" withMargin={false} style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={styles.statusValueRow}>
              {tx.status === 'confirmed' ? (
                <Ionicons name="checkmark-circle" size={20} color={colors.success} style={styles.statusIcon} />
              ) : null}
              <Text style={[styles.statusValueText, { color: statusColor }]}>
                {tx.status === 'confirmed' ? 'Confirmed' : tx.status === 'pending' ? 'Pending' : 'Failed'}
              </Text>
            </View>
          </View>
        </Card>

        <Card padding={0} withMargin={false} style={styles.detailsCard}>
          <Text style={styles.detailsCardTitle}>Transaction details</Text>
          <View style={styles.cardPadding}>
            <DetailRow
              label="From"
              value={tx.fromName}
              subValue={shorten(tx.fromAddress)}
            />
            <DetailRow
              label="To"
              value={tx.toName}
              subValue={shorten(tx.toAddress)}
            />
            <DetailRow label="Amount" value={tx.amount} />
            <DetailRow label="Network Fee" value={tx.networkFee} />
            <DetailRow label="Total" value={tx.total} last />
          </View>
        </Card>

        <Card padding={0} withMargin={false} style={styles.timestampCard}>
          <View style={styles.cardPadding}>
            <DetailRow label="Date" value={tx.date} />
            <DetailRow label="Time" value={tx.time} last />
          </View>
        </Card>

        <Card padding="lg" withMargin={false} style={styles.hashCard}>
          <View style={styles.hashTopRow}>
            <Text style={styles.sectionLabel}>Transaction Hash</Text>
            <Text style={styles.hashText} selectable>
              {shorten(tx.hash, 6, 4)}
            </Text>
          </View>
          <View style={styles.hashButtonsRow}>
            <Pressable
              onPress={handleCopyHash}
              style={({ pressed }) => [styles.hashButton, pressed && styles.pressed]}
              accessibilityLabel="Copy hash">
              <Text style={styles.hashButtonText}>Copy Hash</Text>
            </Pressable>
            <Pressable
              onPress={() => {}}
              style={({ pressed }) => [styles.hashButton, pressed && styles.pressed]}
              accessibilityLabel="View on Explorer">
              <Text style={styles.hashButtonText}>View on Explorer</Text>
            </Pressable>
          </View>
        </Card>

        {tx.note ? (
          <Card padding="lg" withMargin={false} style={styles.noteCard}>
            <View style={styles.noteRow}>
              <Text style={styles.noteLabel}>Note</Text>
              <Text style={styles.noteText}>{tx.note}</Text>
            </View>
          </Card>
        ) : null}

        <View style={styles.actionsSection}>
          <Pressable
            onPress={() => {}}
            style={({ pressed }) => [styles.actionButton, styles.actionButtonSecondary, pressed && styles.pressed]}
            accessibilityLabel="Share Receipt">
            <Text style={styles.actionButtonText}>Share Receipt</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/send/[address]',
                params: { address: tx.toAddress },
              })
            }
            style={({ pressed }) => [styles.actionButton, styles.actionButtonPrimary, pressed && styles.pressed]}
            accessibilityLabel="Repeat Payment">
            <Text style={styles.actionButtonText}>Repeat Payment</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryCentered: {
    alignItems: 'center',
  },
  summaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  summaryIconText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  summaryType: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  summaryCounterparty: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  statusCard: {
    marginBottom: spacing.xl,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  statusValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: spacing.sm,
  },
  statusValueText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsCard: {
    marginBottom: spacing.xl,
  },
  detailsCardTitle: {
    fontSize: 14,
    color: colors.secondaryText,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  cardPadding: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  timestampCard: {
    marginBottom: spacing.xl,
  },
  hashCard: {
    marginBottom: spacing.xl,
  },
  hashTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  hashText: {
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    color: colors.text,
  },
  hashButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  hashButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hashButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  pressed: {
    opacity: 0.85,
  },
  noteCard: {
    marginBottom: spacing.xl,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteLabel: {
    fontSize: 14,
    color: colors.secondaryText,
    marginRight: spacing.md,
  },
  noteText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  actionButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
