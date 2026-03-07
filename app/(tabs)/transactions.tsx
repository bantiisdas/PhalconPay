import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { TransactionItem } from '@/components/TransactionItem';
import { Section } from '@/components/ui/Section';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TotalTransactionsCard } from '@/components/TotalTransactionsCard';
import { TransactionsHeader } from '@/components/TransactionsHeader';
import { TRANSACTION_SECTIONS } from '@/constants/transactions';
import { spacing } from '@/constants/spacing';

export default function TransactionsScreen() {
  const router = useRouter();
  return (
    <ScreenContainer edges={['top']} paddingHorizontal="lg" paddingBottom="xl">
      <TransactionsHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.summarySection}>
          <TotalTransactionsCard
            timeframe="Last 30 days"
            sentAmount="$540"
            receivedAmount="$720"
          />
        </View>

        {TRANSACTION_SECTIONS.map((section) => (
          <Section key={section.title} title={section.title}>
            <View style={styles.cardList}>
              {section.data.map((tx, index) => (
                <Pressable
                  key={tx.id}
                  onPress={() =>
                    router.push({
                      pathname: '/transaction/[id]',
                      params: { id: tx.id },
                    })
                  }
                  style={({ pressed }) => [pressed && styles.cardPressed]}>
                  <Card
                    padding={0}
                    withMargin={false}
                    style={index < section.data.length - 1 ? styles.transactionCard : undefined}>
                    <TransactionItem
                      id={tx.id}
                      title={tx.title}
                      amount={tx.amount}
                      type={tx.type}
                      time={tx.time}
                      iconType={tx.iconType}
                      timeOnRight
                      showDivider={false}
                    />
                  </Card>
                </Pressable>
              ))}
            </View>
          </Section>
        ))}
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
  summarySection: {
    marginBottom: spacing.xl,
  },
  cardList: {},
  cardPressed: {
    opacity: 0.9,
  },
  transactionCard: {
    marginBottom: spacing.md,
  },
});
