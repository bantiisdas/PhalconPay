# PhalconPay

PhalconPay is a **smart Solana payment wallet** built with React Native and Expo.  
It is designed for **seamless crypto payments** so users can:

- Send SOL and SPL tokens
- Swap tokens using Jupiter
- Scan payment QR codes
- Generate payment QR codes with token + fixed amount
- Use **swap-and-send** to pay with tokens they don’t currently hold

---

## Features

### Wallet

- **Connect with Solana Mobile Wallet Adapter** (e.g. Phantom / other SMWA wallets)
- **View balances** for SOL and supported SPL tokens (USDC, USDT, BONK, JUP, WIF, SKR/Seeker)
- **Total balance in USD** using Jupiter price API (SOL + all tracked tokens)

### Send

- **Send SOL and SPL tokens**
- Choose **recipient from Favorites** (nickname + avatar)
- See **effective balance and token symbol** for the selected asset

### Swap

- **Swap tokens using Jupiter Aggregator**
- Uses best routes on mainnet (ExactIn / ExactOut under the hood)

### Swap & Send

- If the sender **does not have enough of the requested token**, the app:
  - Swaps from SOL using Jupiter, then
  - Sends the requested token **in a single flow**
- Swap & send transactions are stored locally with summary and link to explorer

### Scan & Pay

- **Scan QR codes to send payments**
- Supports:
  - **Plain wallet addresses**
  - **Solana Pay URLs**:

    ```text
    solana:<address>?amount=<amount>&spl-token=<mint>
    ```

- Automatically navigates to the **Send** screen with the scanned address (and params)

### Payment Request QR

- **Generate payment QR codes** that include:
  - Wallet address
  - Token (via `spl-token` mint)
  - Fixed amount
- QR is Solana Pay compatible, for example:

  ```text
  solana:<address>?amount=10&spl-token=SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3
  ```

### Token Auto Detection

- When **scanning a QR code**, the app:
  - Detects **recipient address**
  - Detects **amount**
  - Detects **token mint** (when `spl-token` is present)
- Pre-fills the **Send screen** (address, token, amount) accordingly

### Favorites

- Save frequently used **wallet addresses** with:
  - **Nickname**
  - **Avatar / icon** (coffee, exchange, wallet, person, fox, initial)
- Send quickly from:
  - Home screen favorites row
  - Favorites screen
- Favorites are persisted locally via **Zustand + MMKV**

### Transactions

- View **recent transaction history** on:
  - Home screen (Recent Transactions)
  - Transactions tab (grouped by date: Today, Yesterday, This week, Earlier)
- Locally recorded events for:
  - Send SOL
  - Send token
  - Swap
  - Swap & Send
- Transaction detail screen shows:
  - Direction (Sent / Received / Swap)
  - Counterparty (uses favorite name + avatar when available)
  - Amounts and totals
  - Status (confirmed)
  - Timestamp
  - Hash with **“View on Explorer”** (Solscan)

---

## Smart Payment Flow

PhalconPay is optimized for “scan and pay” scenarios where the receiver defines the token and amount.

**Step 1 – User scans a payment QR**

- QR contains a **Solana Pay URL** or **wallet address**:
  - `solana:<address>?amount=<amount>&spl-token=<mint>`

**Step 2 – App reads address, token, and amount**

- Parses:
  - Recipient address
  - Human-readable amount
  - Optional `spl-token` mint (token to pay with)

**Step 3 – Check user’s balance**

- If the user **already has enough** of the requested token:
  - App prepares a normal **Send** transaction.
- If the user **does not have enough** of the requested token:
  - App falls back to **Swap & Send**, swapping from SOL.

**Step 4 – Swap + transfer in one flow**

- App requests a **Jupiter quote** for the required output amount.
- Executes:
  - Swap from SOL → requested token (using Jupiter)
  - Then **send** the resulting token to the recipient.

**Step 5 – Payment completes instantly**

- User sees:
  - Final token amount sent
  - Confirmation and explorer link
- From the receiver’s point of view, they simply get **the requested token + amount**.

---

## Tech Stack

### Frontend

- **React Native** + **Expo** (SDK 54)
- **Expo Router** – file-based routing with bottom tabs (Home, Transactions, Account)
- **TypeScript**

### Blockchain

- **Solana Web3.js** – `@solana/web3.js`
- **SPL Token** – `@solana/spl-token`
- **Solana Mobile Wallet Adapter** – `@solana-mobile/mobile-wallet-adapter-protocol-web3js`

### Infrastructure

- **Jupiter Aggregator**
  - Quotes (ExactIn / ExactOut)
  - Swap transactions
  - Swap-instructions powering Swap & Send

### State Management

- **Zustand**
  - Wallet connection state
  - Favorites
  - Transactions
  - Wallet preferences
- **MMKV**
  - Fast, persistent local storage for app state

### UI / Theme

- Modern **dark fintech** theme
- Consistent spacing and component design (see `.cursor/rules/ui-design.mdc`)

---

## Project Structure

```text
app/                   # Screens (Expo Router)
  (tabs)/              # Home, Transactions, Account
  send/[address].tsx   # Send flow (with swap-and-send)
  swap/                # Swap screen
  receive/             # Receive + Solana Pay QR
  transaction/[id].tsx # Transaction details
  favorites/           # Favorites list + add/edit
  scan/                # Scan & Pay (QR scanner)

components/            # Reusable UI (cards, lists, headers, etc.)
constants/             # Colors, spacing, tokens, transactions config
hooks/                 # useWallet (connect, send, swap, swap-and-send)
services/              # Jupiter, SPL transfer, swap-and-send tx builder, Solana Pay parsing
store/                 # Zustand stores (wallet, favorites, transactions)
```

---

## Setup Instructions

### Prerequisites

- Node.js **18+**
- **npm** (or yarn)
- Android Studio (for Android) / Xcode (for iOS)
- For swap / swap-and-send: **Solana mainnet** RPC + Jupiter API key

### 1. Install dependencies

```bash
npm install
```

### 2. Environment

Create `.env.local` in the project root (see [Environment Variables](#environment-variables)).

### 3. Start the dev server

```bash
npx expo start
```

### 4. Run on device/emulator

```bash
npx expo run:android
# or
npx expo run:ios
```

For a **clean native build** (e.g. after changing app icon, name, or splash):

```bash
npx expo prebuild --clean
npx expo run:android
```

---

## Environment Variables

In `.env.local`:

| Variable                           | Description                                      |
|-----------------------------------|--------------------------------------------------|
| `EXPO_PUBLIC_ALCHAMY_API_URL`     | Solana mainnet RPC (e.g. Alchemy)               |
| `EXPO_PUBLIC_ALCHAMY_DEVNET_API_URL` | Solana devnet RPC                           |
| `EXPO_PUBLIC_JUPITER_API_KEY`     | Jupiter API key from `https://portal.jup.ag`    |

Without these, the app:

- Falls back to public Solana RPC
- May see **Jupiter rate limits / failures** for prices and quotes

---

## Scripts

| Script           | Description                    |
|------------------|--------------------------------|
| `npm start`      | Start Expo dev server          |
| `npm run android`| Build and run on Android       |
| `npm run ios`    | Build and run on iOS           |
| `npm run web`    | Start for web                  |
| `npm run lint`   | Run ESLint                     |

---

## Build / Gradle Issues (Windows)

If Android build fails with “Unable to delete file” (e.g. `classes.jar`), try:

```powershell
cd android; .\gradlew.bat --stop; cd ..
Remove-Item -Recurse -Force "node_modules\expo-modules-core\android\build" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "android\build" -ErrorAction SilentlyContinue
npx expo run:android
```

Close IDEs or other tools that might lock project files if the error persists.

---

## What PhalconPay Solves

- Makes **crypto payments on Solana feel like scanning a QR and paying in seconds**.
- Hides the complexity of:
  - Token mints
  - Swaps
  - Associated token accounts
  - Fee estimation
- Ensures receivers can **specify exactly what they want**, while senders can **pay even when they don’t hold the exact token** (via Swap & Send).

---

## License

Private.
