import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';

const FoxPayDarkTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.card,
    notification: colors.primary,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={FoxPayDarkTheme}>
        <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'default',
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="transaction/[id]" />
        <Stack.Screen name="send" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="receive" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="swap" />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
