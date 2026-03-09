# PhalconPay

A Solana mobile wallet app built with React Native and Expo. Send SOL and SPL tokens, swap via Jupiter, and use swap-and-send in a single transaction.

## Features

- **Wallet**  Connect with Solana Mobile Wallet Adapter (e.g. Phantom); view SOL and token balances (SOL, USDC, USDT, BONK, JUP, WIF).
- **Total balance**  USD value from Jupiter Price API (SOL + all supported tokens).
- **Send**  Send SOL or SPL tokens; optional recipient from favorites with nickname and icon.
- **Swap**  Swap tokens via Jupiter (mainnet); view quote, slippage, and route.
- **Swap & Send**  When sending a token you dont have enough of, swap from SOL and send in one transaction (Jupiter swap-instructions + destination ATA).
- **Favorites**  Save recipient wallets with nickname and avatar; open send from home or favorites list.
- **Transactions**  Local history (Zustand + MMKV) for send, swap, and swap & send with Solscan links.
- **QR**  Receive screen with address and QR code; scan to send (camera).

## Tech stack

- **React Native** + **Expo** (SDK 54)
- **Expo Router**  file-based routing, bottom tabs (Home, Transactions, Account)
- **TypeScript**
- **Solana**  `@solana/web3.js`, `@solana/spl-token`, `@solana-mobile/mobile-wallet-adapter-protocol-web3js`
- **Jupiter**  Quotes (ExactIn/ExactOut), swap transaction, swap-instructions for swap-and-send
- **State**  Zustand with MMKV persist (favorites, transactions, wallet prefs)
- **UI**  Dark fintech theme (see `.cursor/rules/ui-design.mdc`)

## Project structure

```
app/                 # Screens (Expo Router)
  (tabs)/            # Home, Transactions, Account
  send/[address].tsx # Send flow (with swap-and-send)
  swap/              # Swap screen
  receive/           # Receive + QR
  transaction/[id].tsx
  favorites/
  scan/
components/          # Reusable UI
constants/           # Colors, spacing, tokens
hooks/               # useWallet (connect, send, swap, swap-and-send)
services/            # Jupiter, SPL transfer, swap-and-send tx builder
store/               # Zustand (wallet, favorites, transactions)
```

## Prerequisites

- Node.js 18+
- npm or yarn
- Android Studio (for Android) / Xcode (for iOS)
- For swap/swap-and-send: mainnet (Jupiter is mainnet-only)

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment**

   Create `.env.local` in the project root (see [Environment variables](#environment-variables)).

3. **Start dev server**

   ```bash
   npx expo start
   ```

4. **Run on device/emulator**

   ```bash
   npx expo run:android
   # or
   npx expo run:ios
   ```

   For a clean native build (e.g. after changing app icon or name):

   ```bash
   npx expo prebuild --clean
   npx expo run:android
   ```

## Environment variables

In `.env.local`:

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_ALCHAMY_API_URL` | Solana mainnet RPC (e.g. Alchemy) |
| `EXPO_PUBLIC_ALCHAMY_DEVNET_API_URL` | Solana devnet RPC |
| `EXPO_PUBLIC_JUPITER_API_KEY` | Jupiter API key from [portal.jup.ag](https://portal.jup.ag) (for quotes, swap, price) |

Without these, the app falls back to public Solana RPC and Jupiter may rate-limit or fail.

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Build and run on Android |
| `npm run ios` | Build and run on iOS |
| `npm run web` | Start for web |
| `npm run lint` | Run ESLint |

## Build / Gradle issues (Windows)

If Android build fails with Unable to delete file (e.g. `classes.jar`):

```powershell
cd android; .\gradlew.bat --stop; cd ..
Remove-Item -Recurse -Force "node_modules\expo-modules-core\android\build" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "android\build" -ErrorAction SilentlyContinue
npx expo run:android
```

Close IDEs or other tools that might lock the project folder if the error persists.

## License

Private.
