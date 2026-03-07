import * as Clipboard from 'expo-clipboard';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { ReceiveHeader } from '@/components/ReceiveHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

const WALLET_ADDRESS = '9xGk7PLmFfXqVvW9W1mZgY4H2KjS7';
const SHORTENED_ADDRESS = '9xGk...8KJ';

const RECEIVE_TOKENS = [
  { id: 'sol', symbol: 'SOL', icon: 'S' },
  { id: 'usdc', symbol: 'USDC', icon: '$' },
  { id: 'bonk', symbol: 'BONK', icon: 'B' },
  { id: 'jup', symbol: 'JUP', icon: 'J' },
];

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export default function ReceiveScreen() {
  const qrRef = useRef<any>(null);
  const [selectedToken, setSelectedToken] = useState('usdc');
  const [requestAmount, setRequestAmount] = useState('');
  const [note, setNote] = useState('');
  const [addressCopied, setAddressCopied] = useState(false);

  const token = RECEIVE_TOKENS.find((t) => t.id === selectedToken)?.symbol ?? 'USDC';
  const amount = requestAmount.trim() || '10';
  const qrValue = `falconpay://pay?address=${WALLET_ADDRESS}&token=${token}&amount=${amount}`;

  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(WALLET_ADDRESS);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const handleShareQR = async () => {
    if (!qrRef.current) return;
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      return;
    }
    qrRef.current.toDataURL(async (dataUrl: string) => {
      try {
        const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
        const bytes = base64ToUint8Array(base64);
        const file = new File(Paths.cache, 'falconpay-qr.png');
        file.create({ overwrite: true });
        file.write(bytes);
        const shareUri =
          Platform.OS === 'android' && 'contentUri' in file && (file as { contentUri?: string }).contentUri
            ? (file as { contentUri: string }).contentUri
            : file.uri;
        await Sharing.shareAsync(shareUri, {
          dialogTitle: 'Share QR Code',
          mimeType: 'image/png',
        });
      } catch (e) {
        Alert.alert('Share failed', e instanceof Error ? e.message : 'Could not share QR code.');
      }
    });
  };

  return (
    <ScreenContainer edges={['top', 'bottom']} paddingHorizontal="lg" paddingBottom="xl">
      <ReceiveHeader />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Card padding="lg" withMargin={false} style={styles.qrCard}>
            <View style={styles.qrWrap}>
              <QRCode
                getRef={(c) => {
                  qrRef.current = c;
                }}
                value={qrValue}
                size={200}
                color="#000"
                backgroundColor="#FFF"
              />
            </View>
            <Text style={styles.walletName}>FalconPay</Text>
            <Text style={styles.shortAddress}>Address: {SHORTENED_ADDRESS}</Text>
            <View style={styles.qrActions}>
              <Pressable
                onPress={handleCopyAddress}
                style={({ pressed }) => [styles.qrActionBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={addressCopied ? 'Copied' : 'Copy Address'}>
                <Ionicons
                  name={addressCopied ? 'checkmark-circle' : 'copy-outline'}
                  size={20}
                  color={addressCopied ? colors.success : colors.text}
                />
                <Text
                  style={[
                    styles.qrActionLabel,
                    addressCopied && styles.qrActionLabelCopied,
                  ]}>
                  {addressCopied ? 'Copied' : 'Copy Address'}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleShareQR}
                style={({ pressed }) => [styles.qrActionBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Share QR">
                <Ionicons name="share-outline" size={20} color={colors.text} />
                <Text style={styles.qrActionLabel}>Share QR</Text>
              </Pressable>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Receive Token</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tokenRow}
            style={styles.tokenScroll}>
            {RECEIVE_TOKENS.map((token) => {
              const isSelected = selectedToken === token.id;
              return (
                <Pressable
                  key={token.id}
                  onPress={() => setSelectedToken(token.id)}
                  style={[
                    styles.tokenChip,
                    isSelected && styles.tokenChipSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}>
                  <Text style={styles.tokenChipSymbol}>{token.icon}</Text>
                  <Text
                    style={[
                      styles.tokenChipLabel,
                      isSelected && styles.tokenChipLabelSelected,
                    ]}>
                    {token.symbol}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.inputLabel}>Request Amount (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder={`10.00 ${selectedToken.toUpperCase()} (optional)`}
            placeholderTextColor={colors.secondaryText}
            value={requestAmount}
            onChangeText={setRequestAmount}
            keyboardType="decimal-pad"
          />

          <Text style={styles.inputLabel}>Add Note (optional)</Text>
          <View style={styles.noteInputWrap}>
            <Ionicons name="document-text-outline" size={20} color={colors.secondaryText} />
            <TextInput
              style={styles.noteInput}
              placeholder="Coffee payment ☕"
              placeholderTextColor={colors.secondaryText}
              value={note}
              onChangeText={setNote}
            />
          </View>

          <Text style={styles.inputLabel}>Wallet Address</Text>
          <Text style={styles.fullAddress} selectable>
            {WALLET_ADDRESS}
          </Text>

          <Button
            title={addressCopied ? 'Copied' : 'Copy Address'}
            onPress={handleCopyAddress}
            fullWidth
            style={[styles.ctaButton, addressCopied && styles.ctaButtonCopied]}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  qrCard: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  qrWrap: {
    padding: spacing.md,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  shortAddress: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: spacing.lg,
  },
  qrActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  qrActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  pressed: {
    opacity: 0.85,
  },
  qrActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  qrActionLabelCopied: {
    color: colors.success,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  tokenScroll: {
    marginHorizontal: -spacing.lg,
    marginBottom: spacing.xl,
  },
  tokenRow: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tokenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.card,
  },
  tokenChipSelected: {
    backgroundColor: colors.primary,
  },
  tokenChipSymbol: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  tokenChipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tokenChipLabelSelected: {
    color: colors.text,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  noteInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  noteInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  fullAddress: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xl,
    fontVariant: ['tabular-nums'],
  },
  ctaButton: {
    marginTop: spacing.sm,
  },
  ctaButtonCopied: {
    backgroundColor: colors.success,
  },
});
