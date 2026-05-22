# 🚀 PhalconPay

<p align="center">
  <img src="./assets/images/In-App-Logo.png" width="120" alt="PhalconPay Logo" />
</p>

<p align="center">
  <b>Smart Solana Payment Wallet built with React Native & Expo</b>
</p>

<p align="center">
  Send • Swap • Scan & Pay • Swap & Send
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.81-blue" />
  <img src="https://img.shields.io/badge/Expo-SDK%2054-black" />
  <img src="https://img.shields.io/badge/Solana-Web3-purple" />
  <img src="https://img.shields.io/badge/Jupiter-Aggregator-orange" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue" />
</p>

---

## 📥 Download

<p align="center">
  <a href="https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest">
    <img src="https://img.shields.io/badge/📱_Download_Latest_APK-success?style=for-the-badge" alt="Download APK">
  </a>
</p>

---

## ✨ Overview

PhalconPay is a smart payment wallet for the Solana ecosystem.

It allows users to:

- 💸 Send SOL and SPL tokens
- 🔄 Swap tokens with Jupiter
- 📷 Scan Solana Pay QR codes
- 🧾 Generate payment request QR codes
- ⚡ Pay with tokens they don't own using **Swap & Send**
- ⭐ Save favorite recipients
- 📊 Track payment history

The goal is simple:

> Make crypto payments feel as easy as scanning a QR code and paying instantly.

---

# 📱 Screenshots

<p align="center">
  <img src="/assets/images/HomeScreen-portrait.png" width="220"/>
  <img src="/assets/images/SwapScreen-portrait.png" width="220"/>
  <img src="/assets/images/ReceiveScreen-portrait.png" width="220"/>
</p>

<p align="center">
  <img src="/assets/images/Swap&SendScreen-portrait.png" width="220"/>
  <img src="/assets/images/AccountScreen-portrait.png" width="220"/>
</p>

---

# 🎯 Key Features

## 🏠 Home Dashboard

- Wallet overview
- USD portfolio valuation
- Quick access to favorites
- Recent transactions

<img src="/assets/images/HomeScreen-portrait.png" width="280"/>

---

## 🔄 Token Swaps

Powered by Jupiter Aggregator.

- Best route discovery
- Exact In / Exact Out support
- Mainnet optimized execution

<img src="/assets/images/SwapScreen-portrait.png" width="280"/>

---

## ⚡ Swap & Send

The flagship feature.

If a payment QR requests a token you don't currently own:

1. Get a Jupiter quote
2. Swap from SOL
3. Transfer the requested token
4. Complete payment automatically

All in a single flow.

<img src="/assets/images/Swap&SendScreen-portrait.png" width="280"/>

---

## 📷 Scan & Pay

Supports:

- Wallet addresses
- Solana Pay URLs
- Fixed amount requests
- SPL token requests

Example:

```text
solana:<address>?amount=10&spl-token=<mint>
```

The payment details are automatically filled into the Send screen.

---

## 🧾 Receive Payments

Generate Solana Pay compatible QR codes.

Includes:

- Wallet address
- Requested token
- Fixed payment amount

<img src="/assets/images/ReceiveScreen-portrait.png" width="280"/>

---

## 👤 Account Management

- Wallet connection
- Settings
- Network configuration
- User preferences

<img src="/assets/images/AccountScreen-portrait.png" width="280"/>

---

# ⚡ Smart Payment Flow

```text
Scan QR
   │
   ▼
Parse Address + Amount + Token
   │
   ▼
Check Wallet Balance
   │
   ├─ Enough Token
   │      │
   │      ▼
   │    Send
   │
   └─ Not Enough Token
          │
          ▼
      Swap From SOL
          │
          ▼
      Send Token
          │
          ▼
      Payment Complete
```

---

# 🏗 Architecture

```text
React Native + Expo
        │
        ▼
     Zustand
        │
        ▼
 Wallet Services
        │
 ┌──────┴─────────┐
 ▼                ▼
Solana RPC    Jupiter API
```

---

# 🛠 Tech Stack

| Category   | Technology                   |
| ---------- | ---------------------------- |
| Mobile     | React Native                 |
| Framework  | Expo SDK 54                  |
| Language   | TypeScript                   |
| Routing    | Expo Router                  |
| Blockchain | Solana Web3.js               |
| Tokens     | SPL Token                    |
| Wallet     | Solana Mobile Wallet Adapter |
| Swaps      | Jupiter Aggregator           |
| State      | Zustand                      |
| Storage    | MMKV                         |

---

# 📂 Project Structure

```text
app/
├── (tabs)/
├── send/
├── swap/
├── receive/
├── scan/
├── favorites/
└── transaction/

components/
constants/
hooks/
services/
store/
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js 18+
- npm or yarn
- Android Studio / Xcode
- Solana RPC endpoint
- Jupiter API key

---

## Installation

```bash
git clone <repo-url>

cd phalconpay

npm install
```

---

## Environment Variables

Create `.env.local`

```env
EXPO_PUBLIC_ALCHAMY_API_URL=
EXPO_PUBLIC_ALCHAMY_DEVNET_API_URL=
EXPO_PUBLIC_JUPITER_API_KEY=
```

---

## Run Development Server

```bash
npx expo start
```

Android:

```bash
npx expo run:android
```

iOS:

```bash
npx expo run:ios
```

---

# 🔐 Supported Assets

- SOL
- USDC
- USDT
- BONK
- JUP
- WIF
- SKR (Seeker)

---

# 💡 What Problem Does PhalconPay Solve?

Traditional crypto payments require users to:

- Know token mint addresses
- Hold the correct token
- Manage swaps manually
- Understand wallet mechanics

PhalconPay removes that complexity.

Receivers request exactly what they want.

Senders simply scan and pay.

---

# 📄 License

Private.
