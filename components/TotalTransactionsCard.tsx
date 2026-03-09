import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export interface TotalTransactionsCardProps {
  timeframe?: string;
  sentAmount: string;
  receivedAmount: string;
}

export function TotalTransactionsCard({
  timeframe = 'Last 30 days',
  sentAmount,
  receivedAmount,
}: TotalTransactionsCardProps) {
  return (
    <Card padding="lg" withMargin={false}>
      <Text style={styles.label}>Total Transactions</Text>
      <Text style={styles.timeframe}>{timeframe}</Text>
      <View style={styles.row}>
        <View>
          <Text style={styles.caption}>Sent:</Text>
          <Text style={styles.value}>{sentAmount}</Text>
        </View>
        <View style={styles.receivedBlock}>
          <Text style={styles.caption}>Received:</Text>
          <Text style={styles.value}>{receivedAmount}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
  },
  timeframe: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  caption: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  receivedBlock: {
    alignItems: 'flex-end',
  },
});
