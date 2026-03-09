// jupiter api - requires api key from portal.jup.ag
const JUPITER_API = "https://api.jup.ag/swap/v1";
const JUPITER_API_KEY = process.env.EXPO_PUBLIC_JUPITER_API_KEY || "";

// well-known token mints on solana mainnet
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

// list of available tokens for the picker
export const AVAILABLE_TOKENS = [
  TOKENS.SOL,
  TOKENS.USDC,
  TOKENS.USDT,
  TOKENS.BONK,
  TOKENS.JUP,
  TOKENS.WIF,
];

export interface QuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: {
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      inAmount: string;
      outputMint: string;
      outAmount: string;
      feeAmount?: string;
      feeMint?: string;
    };
    percent: number;
  }[];
}

//Get Quote - how much user will receive
export async function getSwapQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 50,
): Promise<QuoteResponse> {
  console.log("[jupiter] getSwapQuote called");
  console.log("[jupiter] inputMint:", inputMint);
  console.log("[jupiter] outputMint:", outputMint);
  console.log("[jupiter] amount:", amount);

  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: amount.toString(),
    slippageBps: slippageBps.toString(),
  });

  const url = `${JUPITER_API}/quote?${params}`;
  console.log("[jupiter] fetching quote from:", url);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json", "x-api-key": JUPITER_API_KEY },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[jupiter] quote failed:", response.status, errorText);
        const err = new Error(
          response.status === 429
            ? "Rate limited. Please wait a moment."
            : `Jupiter quote failed: ${response.status}`,
        ) as Error & { status?: number };
        err.status = response.status;
        throw err;
      }

      const quote = await response.json();
      console.log("[jupiter] quote received, outAmount:", quote.outAmount);

      return quote;
    } catch (error) {
      lastError = error as Error;
      const is429 =
        lastError &&
        "status" in lastError &&
        (lastError as { status?: number }).status === 429;
      console.log(`Attempt ${attempt} failed with error: ${lastError.message}`);

      if (attempt < 3 && !is429) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        break;
      }
    }
  }

  throw lastError || new Error("Failed to fetch quote after 3 attempts");
}

/**
 * Get quote in ExactOut mode: amount = desired output (in smallest units).
 * Uses same api.jup.ag/swap/v1/quote as regular quote, with swapMode=ExactOut.
 * Returns quote with inAmount = SOL required, outAmount = token amount.
 */
export async function getSwapQuoteExactOut(
  inputMint: string,
  outputMint: string,
  outputAmountAtomic: number,
  slippageBps: number = 50,
): Promise<QuoteResponse> {
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: outputAmountAtomic.toString(),
    swapMode: "ExactOut",
    slippageBps: slippageBps.toString(),
  });

  const url = `${JUPITER_API}/quote?${params}`;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json", "x-api-key": JUPITER_API_KEY },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await response.text();
        const err = new Error(
          response.status === 429
            ? "Rate limited. Please wait a moment."
            : `Jupiter quote failed: ${response.status}`,
        ) as Error & { status?: number };
        err.status = response.status;
        throw err;
      }

      const quote = (await response.json()) as QuoteResponse;
      return { ...quote, swapMode: "ExactOut" };
    } catch (error) {
      lastError = error as Error;
      const is429 =
        lastError &&
        "status" in lastError &&
        (lastError as { status?: number }).status === 429;
      if (attempt < 3 && !is429) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        break;
      }
    }
  }

  throw lastError || new Error("Failed to fetch ExactOut quote");
}

const JUPITER_SWAP_V6 = "https://quote-api.jup.ag/v6/swap";
// Use api.jup.ag (same host as JUPITER_API) to avoid "Network request failed"
// issues on React Native / Android when calling swap-instructions.
const JUPITER_SWAP_INSTRUCTIONS = `${JUPITER_API}/swap-instructions`;

/** Single instruction from Jupiter swap-instructions API */
export interface JupiterInstructionAccount {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
}

export interface JupiterRawInstruction {
  programId: string;
  accounts: JupiterInstructionAccount[];
  data: string; // base64
}

/** Response from POST /v6/swap-instructions */
export interface SwapInstructionsResponse {
  computeBudgetInstructions: JupiterRawInstruction[];
  setupInstructions: JupiterRawInstruction[];
  swapInstruction: JupiterRawInstruction;
  cleanupInstruction: JupiterRawInstruction | null;
  otherInstructions: JupiterRawInstruction[];
  addressLookupTableAddresses: string[];
}

/**
 * Get raw swap instructions (no full transaction).
 * Uses api.jup.ag/swap/v1/swap-instructions so it works with v1 quote and avoids quote-api.jup.ag network issues.
 * Use destinationTokenAccount to send swap output directly to recipient (swap-and-send in one tx).
 */
export async function getSwapInstructionsV6(
  quoteResponse: QuoteResponse,
  userPublicKey: string,
  destinationTokenAccount?: string,
): Promise<SwapInstructionsResponse> {
  const body: Record<string, unknown> = {
    userPublicKey,
    quoteResponse,
    wrapAndUnwrapSol: true,
    dynamicComputeUnitLimit: true,
    prioritizationFeeLamports: {
      priorityLevelWithMaxLamports: {
        priorityLevel: "veryHigh",
        maxLamports: 1000000,
      },
    },
  };
  if (destinationTokenAccount != null) {
    body.destinationTokenAccount = destinationTokenAccount;
  }

  const response = await fetch(JUPITER_SWAP_INSTRUCTIONS, {
    method: "POST",
    headers: {
      "x-api-key": JUPITER_API_KEY,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "[jupiter] swap-instructions failed:",
      response.status,
      errorText,
    );
    throw new Error(`Jupiter swap-instructions failed: ${response.status}`);
  }

  return response.json() as Promise<SwapInstructionsResponse>;
}

/**
 * Get swap transaction from Jupiter v6 swap endpoint.
 * Use this when the quote was obtained from v6/quote (e.g. ExactOut for swap-and-send).
 */
export async function getSwapTransactionV6(
  quoteResponse: QuoteResponse,
  userPublicKey: string,
): Promise<string> {
  const response = await fetch(JUPITER_SWAP_V6, {
    method: "POST",
    headers: {
      "x-api-key": JUPITER_API_KEY,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userPublicKey,
      quoteResponse,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: {
        priorityLevelWithMaxLamports: {
          priorityLevel: "veryHigh",
          maxLamports: 1000000,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[jupiter] v6 swap tx failed:", response.status, errorText);
    throw new Error(`Jupiter swap failed: ${response.status}`);
  }

  const data = await response.json();
  return data.swapTransaction;
}

// Get Swap Transaction (v1) - for ExactIn quotes from swap screen
export async function getSwapTransaction(
  quoteResponse: QuoteResponse,
  userPublicKey: string,
): Promise<string> {
  const url = `${JUPITER_API}/swap`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "x-api-key": JUPITER_API_KEY,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userPublicKey,
      quoteResponse,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: {
        priorityLevelWithMaxLamports: {
          priorityLevel: "veryHigh",
          maxLamports: 1000000,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[jupiter] swap tx failed:", response.status, errorText);
    throw new Error(`Jupiter swap failed: ${response.status}`);
  }

  const swapTx = await response.json();
  return swapTx.swapTransaction;
}

/** Jupiter price v3: response is { [mintAddress]: { usdPrice, ... } } */
const JUPITER_PRICE_V3 = "https://api.jup.ag/price/v3";

/** Fetch USD price for a single token. */
export async function getTokenPrice(mintAddress: string): Promise<number> {
  const prices = await getTokenPrices([mintAddress]);
  return prices[mintAddress] ?? 0;
}

/** Fetch current USD prices for multiple token mints. Returns { [mint]: usdPrice }. */
export async function getTokenPrices(
  mintAddresses: string[],
): Promise<Record<string, number>> {
  if (mintAddresses.length === 0) return {};
  try {
    const ids = mintAddresses.join(",");
    const response = await fetch(`${JUPITER_PRICE_V3}?ids=${ids}`, {
      method: "GET",
      headers: { "x-api-key": JUPITER_API_KEY, Accept: "application/json" },
    });
    if (!response.ok) return {};
    const data = (await response.json()) as Record<
      string,
      { usdPrice?: number }
    >;
    const result: Record<string, number> = {};
    for (const mint of mintAddresses) {
      const usdPrice = data[mint]?.usdPrice;
      result[mint] = typeof usdPrice === "number" ? usdPrice : 0;
    }
    return result;
  } catch (e) {
    console.warn("[jupiter] getTokenPrices failed:", e);
    return {};
  }
}

// Tokens API v2 – token metadata and icons (https://api.jup.ag/tokens/v2/search)
const JUPITER_TOKENS_V2 = "https://api.jup.ag/tokens/v2";
let tokenIconsCache: Record<string, string> | null = null;
let tokenIconsCacheKey: string = "";

// Fallback icon URLs when Jupiter returns no icon or SVG/.link (RN Image can't display SVG; UI shows letter for .svg)
const FALLBACK_TOKEN_ICONS: Record<string, string> = {
  [TOKENS.USDT]:
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
  [TOKENS.WIF]:
    "https://assets.coingecko.com/coins/images/33566/small/dogwifhat.jpg",
};

function applyFallbacksForUnusableUrls(
  result: Record<string, string>,
  mints: string[],
): void {
  mints.forEach((mint) => {
    if (!FALLBACK_TOKEN_ICONS[mint]) return;
    const url = result[mint] ?? "";
    const isSvgOrLink = /\.svg/i.test(url) || /\.link/i.test(url);
    if (!result[mint] || isSvgOrLink) {
      result[mint] = FALLBACK_TOKEN_ICONS[mint];
    }
  });
}

/** Fetch token icon URLs by mint. Uses x-api-key from env. Cached in memory. */
export async function fetchTokenIcons(
  mints: string[],
): Promise<Record<string, string>> {
  if (mints.length === 0) return {};
  const key = mints.slice().sort().join(",");
  if (tokenIconsCache && tokenIconsCacheKey === key) {
    const cached = { ...tokenIconsCache };
    applyFallbacksForUnusableUrls(cached, mints);
    return cached;
  }

  const query = mints.join(",");
  const url = `${JUPITER_TOKENS_V2}/search?query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-api-key": JUPITER_API_KEY,
      },
    });
    if (!response.ok) return {};
    const data = (await response.json()) as {
      id?: string;
      icon?: string | null;
    }[];
    const result: Record<string, string> = {};
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item?.id && item?.icon) result[item.id] = item.icon;
      });
    }
    applyFallbacksForUnusableUrls(result, mints);
    tokenIconsCache = { ...result };
    tokenIconsCacheKey = key;
    return result;
  } catch {
    return {};
  }
}

// ============================================
// UNIT CONVERSION HELPERS
// ============================================
export function toSmallestUnit(amount: number, decimals: number): number {
  return Math.round(amount * Math.pow(10, decimals));
}

export function fromSmallestUnit(
  amount: number | string,
  decimals: number,
): number {
  return Number(amount) / Math.pow(10, decimals);
}
