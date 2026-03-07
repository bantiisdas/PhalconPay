import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Constants from 'expo-constants';

import { AccountHeader } from '@/components/AccountHeader';
import { NetworkSelector } from '@/components/NetworkSelector';
import type { NetworkOption } from '@/components/NetworkSelector';
import { ProfileWalletCard } from '@/components/ProfileWalletCard';
import { SettingsRow } from '@/components/SettingsRow';
import { TokenBalanceList } from '@/components/TokenBalanceList';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Section } from '@/components/ui/Section';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

const MOCK_ADDRESS = '9xGk2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU8KJ';

export default function AccountScreen() {
  const [network, setNetwork] = useState<NetworkOption>('mainnet');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const appVersion = Constants.expoConfig?.version ?? '1.2.3';
  const versionLabel = appVersion.startsWith('v') ? appVersion : `v${appVersion}`;

  return (
    <ScreenContainer edges={['top']} paddingHorizontal="lg" paddingBottom="xl">
      <AccountHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Section>
          <ProfileWalletCard address={MOCK_ADDRESS} username="Rahul" />
        </Section>

        <Section>
          <TokenBalanceList />
        </Section>

        <Section>
          <NetworkSelector value={network} onValueChange={setNetwork} />
        </Section>

        <Section>
          <Card padding={0} withMargin={false}>
            <View style={styles.settingsTitle}>
              <Text style={styles.settingsTitleText}>Settings</Text>
            </View>
            <SettingsRow
              label="Dark Mode"
              value={darkMode}
              onValueChange={setDarkMode}
              showDivider
            />
            <SettingsRow
              label="Notifications"
              value={notifications}
              onValueChange={setNotifications}
              showDivider
            />
            <SettingsRow
              label="Currency preference"
              valueLabel="USD"
              showDivider
            />
            <SettingsRow
              label="App version"
              valueLabel={versionLabel}
              showDivider={false}
            />
          </Card>
        </Section>
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
  settingsTitle: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  settingsTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
