import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'back'],
];

export interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
}

export function NumericKeypad({ onKeyPress }: NumericKeypadProps) {
  return (
    <View style={styles.container}>
      {KEYS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => (
            <Pressable
              key={key}
              onPress={() => onKeyPress(key)}
              style={({ pressed }) => [
                styles.key,
                key === 'back' && styles.keyBack,
                pressed && styles.keyPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={key === 'back' ? 'Backspace' : key}>
              {key === 'back' ? (
                <Text style={styles.keyText}>⌫</Text>
              ) : (
                <Text style={styles.keyText}>{key}</Text>
              )}
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  key: {
    width: 72,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBack: {
    backgroundColor: colors.card,
  },
  keyPressed: {
    opacity: 0.7,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
});
