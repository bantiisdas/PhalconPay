export const TOKENS = {
  SOL: "So11111111111111111111111111111111111111112", // wrapped SOL
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  JUP: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  WIF: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
};

// token metadata for display
export const TOKEN_INFO: Record<
  string,
  { symbol: string; name: string; decimals: number; color: string }
> = {
  [TOKENS.SOL]: {
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    color: "#9945FF",
  },
  [TOKENS.USDC]: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    color: "#2775CA",
  },
  [TOKENS.USDT]: {
    symbol: "USDT",
    name: "Tether",
    decimals: 6,
    color: "#26A17B",
  },
  [TOKENS.BONK]: {
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    color: "#F7931A",
  },
  [TOKENS.JUP]: {
    symbol: "JUP",
    name: "Jupiter",
    decimals: 6,
    color: "#14F195",
  },
  [TOKENS.WIF]: {
    symbol: "WIF",
    name: "dogwifhat",
    decimals: 6,
    color: "#E91E63",
  },
};

// list of available tokens for the picker (mint addresses)
export const AVAILABLE_TOKENS = [
  TOKENS.SOL,
  TOKENS.USDC,
  TOKENS.USDT,
  TOKENS.BONK,
  TOKENS.JUP,
  TOKENS.WIF,
];

// Helper: get token info by mint address
export function getTokenInfo(mint: string) {
  return TOKEN_INFO[mint] ?? null;
}

// Helper: get token info by symbol (first match)
export function getTokenInfoBySymbol(symbol: string) {
  const entry = Object.entries(TOKEN_INFO).find(
    ([_, info]) => info.symbol.toUpperCase() === symbol.toUpperCase(),
  );
  return entry ? TOKEN_INFO[entry[0]] : null;
}

// Helper: get mint address by symbol
export function getMintBySymbol(symbol: string): string | null {
  const entry = Object.entries(TOKEN_INFO).find(
    ([_, info]) => info.symbol.toUpperCase() === symbol.toUpperCase(),
  );
  return entry ? entry[0] : null;
}

/** TokenOption shape for selectors (id = lowercase symbol). Mock balances; replace with real balances when available. */
export const TOKEN_OPTIONS_MOCK_BALANCE: Record<string, string> = {
  SOL: "1.45",
  USDC: "500.00",
  USDT: "100.00",
  BONK: "1.2M",
  JUP: "85",
  WIF: "50",
};

export interface TokenOption {
  id: string;
  symbol: string;
  name: string;
  balance: string;
}

/** Build TokenOption[] from AVAILABLE_TOKENS + TOKEN_INFO. Pass balances to override mock. */
export function getTokenOptions(balances?: Partial<Record<string, string>>): TokenOption[] {
  return AVAILABLE_TOKENS.map((mint) => {
    const info = TOKEN_INFO[mint];
    const symbol = info?.symbol ?? "???";
    const id = symbol.toLowerCase();
    const balance =
      balances?.[symbol] ?? TOKEN_OPTIONS_MOCK_BALANCE[symbol] ?? "0";
    return {
      id,
      symbol,
      name: info?.name ?? symbol,
      balance,
    };
  });
}

/** Default token options for send/receive pickers (mock balances). */
export const DEFAULT_TOKEN_OPTIONS = getTokenOptions();

/** Receive screen token chips: id, symbol, icon letter. */
export const RECEIVE_TOKEN_CHIPS = AVAILABLE_TOKENS.map((mint) => {
  const info = TOKEN_INFO[mint];
  const symbol = info?.symbol ?? "?";
  return {
    id: symbol.toLowerCase(),
    symbol,
    icon: symbol.charAt(0),
  };
});

/** Icon type for TokenBalanceList (symbol lowercase). */
export type TokenIconType =
  | "sol"
  | "usdc"
  | "usdt"
  | "bonk"
  | "jup"
  | "wif";

export interface TokenBalanceItem {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  iconType: TokenIconType;
}

const BALANCE_LIST_MOCK: Record<string, string> = {
  SOL: "1.45",
  USDC: "500",
  USDT: "100",
  BONK: "1.2M",
  JUP: "85",
  WIF: "50",
};

/** Build TokenBalanceItem[] from constants. Pass balances to override mock. */
export function getTokenBalanceItems(
  balances?: Partial<Record<string, string>>,
): TokenBalanceItem[] {
  return AVAILABLE_TOKENS.map((mint) => {
    const info = TOKEN_INFO[mint];
    const symbol = info?.symbol ?? "???";
    const id = symbol.toLowerCase();
    const balance = balances?.[symbol] ?? BALANCE_LIST_MOCK[symbol] ?? "0";
    return {
      id,
      symbol,
      name: info?.name ?? symbol,
      balance,
      iconType: id as TokenIconType,
    };
  });
}

/** Default token balance list for account screen. */
export const DEFAULT_TOKEN_BALANCE_ITEMS = getTokenBalanceItems();
