import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

// SPL Token Program ID (avoid importing @solana/spl-token for Metro compatibility)
const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
import { useCallback, useMemo, useState } from "react";
import { AVAILABLE_TOKENS, TOKEN_INFO } from "../constants/tokens";
import { useWalletStore } from "../store/wallet-store";
// import {
//   fromSmallestUnit,
//   getSwapQuote,
//   getSwapTransaction,
//   QuoteResponse,
//   toSmallestUnit,
// } from "../services/jupiter";

const APP_IDENTITY = {
  name: "SolScan",
  uri: "https://solscan.io",
  icon: "favicon.ico",
};

const decodAddress = (address: string): PublicKey => {
  if (address.includes("=") || address.includes("+") || address.includes("/")) {
    return new PublicKey(Buffer.from(address, "base64"));
  }
  return new PublicKey(address);
};

export function useWallet() {
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);

  const [swaping, setSwaping] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  //const [quotedata, setQuotedata] = useState<QuoteResponse | null>(null);

  const isDevnet = useWalletStore((s) => s.isDevnet);
  const connectedPublicKey = useWalletStore((s) => s.connectedPublicKey);
  const setConnectedPublicKey = useWalletStore((s) => s.setConnectedPublicKey);

  const publicKey = useMemo(() => {
    if (!connectedPublicKey) return null;

    try {
      return new PublicKey(connectedPublicKey);
    } catch (error) {
      return null;
    }
  }, [connectedPublicKey]);

  const cluster = isDevnet ? "devnet" : "mainnet-beta";
  const connection = useMemo(
    () => new Connection(clusterApiUrl(cluster), "confirmed"),
    [cluster]
  );

  //Connect - Asking wallet to authorize
  const connect = useCallback(async () => {
    setConnecting(true);
    console.log("hookdevnet", isDevnet);

    try {
      const authResult = await transact(async (wallet: Web3MobileWallet) => {
        //This Open the wallet & shows the user, authorization dialog

        const result = await wallet.authorize({
          chain: `solana:${cluster}`,
          identity: APP_IDENTITY,
        });
        return result;
      });

      const pubKey = decodAddress(authResult.accounts[0].address);

      setConnectedPublicKey(pubKey.toBase58());
      return pubKey.toBase58();
    } catch (error: any) {
      console.log("Connection failed", error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [cluster, isDevnet]);

  //Disconnect
  const disconnect = useCallback(() => {
    setConnectedPublicKey(null);
  }, []);

  //Getting Balance (native SOL)
  const getBalance = useCallback(async () => {
    if (!publicKey) return 0;

    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }, [publicKey, connection]);

  // SPL token balances (symbol -> amount string). SOL not included; use getBalance() for SOL.
  const getTokenBalances = useCallback(async (): Promise<Record<string, string>> => {
    const result: Record<string, string> = {};
    const sums: Record<string, number> = {};
    AVAILABLE_TOKENS.forEach((mint) => {
      const info = TOKEN_INFO[mint];
      if (info && info.symbol !== "SOL") {
        result[info.symbol] = "0";
        sums[info.symbol] = 0;
      }
    });
    if (!publicKey) return result;

    try {
      const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });
      const mintToSymbol = Object.fromEntries(
        AVAILABLE_TOKENS.map((mint) => {
          const info = TOKEN_INFO[mint];
          return [mint, info?.symbol ?? ""];
        }),
      );
      accounts.value.forEach(({ account }) => {
        const parsed = account.data?.parsed;
        if (!parsed?.info?.mint) return;
        const symbol = mintToSymbol[parsed.info.mint];
        if (!symbol || sums[symbol] === undefined) return;
        const tokenAmount = parsed.info.tokenAmount;
        const uiAmount = tokenAmount?.uiAmount ?? 0;
        sums[symbol] += Number(uiAmount);
      });
      Object.keys(sums).forEach((symbol) => {
        const v = sums[symbol];
        if (v === 0) {
          result[symbol] = "0";
        } else {
          result[symbol] =
            v >= 1e6
              ? v.toLocaleString(undefined, { maximumFractionDigits: 0 })
              : v.toFixed(v >= 1 ? 2 : v >= 0.01 ? 4 : 6);
        }
      });
    } catch {
      // leave as 0
    }
    return result;
  }, [publicKey, connection]);

  //Sending SOL
  const sendSol = useCallback(
    async (toAddress: string, amountSOL: number) => {
      if (!publicKey) throw new Error("Wallet not Connected");

      setSending(true);

      try {
        const toPublicKey = new PublicKey(toAddress);

        //Creating transaction object
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: toPublicKey,
            lamports: Math.round(amountSOL * LAMPORTS_PER_SOL),
          }),
        );
        //latest block hash
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = publicKey;

        //Send the Transaction to Wallet to sign
        const signedTransaction = await transact(
          async (wallet: Web3MobileWallet) => {
            await wallet.authorize({
              chain: `solana:${cluster}`,
              identity: APP_IDENTITY,
            });

            //sending transaction
            const signedTxs = await wallet.signTransactions({
              transactions: [transaction],
            });

            if (!signedTxs || signedTxs.length === 0) {
              throw new Error("No Signed Transaction returned from wallet");
            }

            return signedTxs[0];
          },
        );

        //delay after wallet closes (network delay)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        //sending transaction with retry logic
        const rawTransaction = signedTransaction.serialize();

        let signature: string | null = null;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            signature = await connection.sendRawTransaction(rawTransaction, {
              maxRetries: 2,
              skipPreflight: true,
            });
            break;
          } catch (error: unknown) {
            lastError = error as Error;
            console.log(`Attempt ${attempt} failed`, lastError.message);
            if (attempt < 3) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }

        if (!signature) {
          throw (
            lastError ||
            new Error("Failed to send Transaction after 3 attempts")
          );
        }

        const confirmTransaction = await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          "confirmed",
        );

        if (confirmTransaction.value.err) {
          throw new Error(
            `Transaction Failed: ${confirmTransaction.value.err}`,
          );
        }

        return signature;
      } catch (error: any) {
        console.log(error.message);
      } finally {
        setSending(false);
      }
    },
    [publicKey, connection, cluster],
  );

  //Fetch Swap Quote
  //   const fetchSwapQuote = useCallback(
  //     async (
  //       inputMint: string,
  //       outputMint: string,
  //       inputAmount: number,
  //       inputDecimals: number,
  //     ) => {
  //       if (isDevnet) {
  //         setQuotedata(null);
  //         return null;
  //       }

  //       setQuoteLoading(true);
  //       try {
  //         const amountInSmallestUnit = toSmallestUnit(inputAmount, inputDecimals);
  //         const quote = await getSwapQuote(
  //           inputMint,
  //           outputMint,
  //           amountInSmallestUnit,
  //         );

  //         setQuotedata(quote);
  //         return quote;
  //       } catch (error) {
  //         console.error("[useWallet] quote error:", error);
  //         setQuotedata(null);
  //         throw error;
  //       } finally {
  //         setQuoteLoading(false);
  //       }
  //     },
  //     [isDevnet],
  //   );

  //Clear Quote
  //   const clearQuote = useCallback(() => {
  //     setQuotedata(null);
  //   }, []);

  //Execute Swap
  //   const executeSwap = useCallback(
  //     async (
  //       quote: QuoteResponse,
  //       inputSymbol: string,
  //       outputSymbol: string,
  //       outputDecimals: number,
  //     ) => {
  //       if (!publicKey) {
  //         throw new Error("Wallet not Connected");
  //       }
  //       if (isDevnet) {
  //         throw new Error("Jupiter Swap only works in Mainnet");
  //       }

  //       setSwaping(true);
  //       try {
  //         console.log("[useWallet] getting swap transaction...");

  //         const swapTxBase64 = await getSwapTransaction(
  //           quote,
  //           publicKey.toBase58(),
  //         );
  //         const swapTXBuffer = Buffer.from(swapTxBase64, "base64");
  //         const transaction = VersionedTransaction.deserialize(swapTXBuffer);

  //         const signedTransaction = await transact(
  //           async (wallet: Web3MobileWallet) => {
  //             await wallet.authorize({
  //               chain: `solana:${cluster}`,
  //               identity: APP_IDENTITY,
  //             });

  //             const signedTxs = await wallet.signTransactions({
  //               transactions: [transaction],
  //             });

  //             if (!signedTxs || signedTxs.length === 0) {
  //               throw new Error("[swpatx] no signed transaction found");
  //             }
  //             return signedTxs[0];
  //           },
  //         );
  //         console.log("[useWallet] swap signed, waiting before send...");
  //         await new Promise((resolve) => setTimeout(resolve, 1000));

  //         //sending transaction with retry logic
  //         const rawTransaction = signedTransaction.serialize();

  //         let signature: string | null = null;
  //         let lastError: Error | null = null;

  //         for (let attempt = 1; attempt <= 3; attempt++) {
  //           try {
  //             signature = await connection.sendRawTransaction(rawTransaction, {
  //               maxRetries: 2,
  //               skipPreflight: true,
  //             });
  //             break;
  //           } catch (error: unknown) {
  //             lastError = error as Error;
  //             console.log(`Attempt ${attempt} failed`, lastError.message);
  //             if (attempt < 3) {
  //               await new Promise((resolve) => setTimeout(resolve, 1000));
  //             }
  //           }
  //         }

  //         if (!signature) {
  //           throw (
  //             lastError ||
  //             new Error("Failed to send swap Transaction after 3 attempts")
  //           );
  //         }

  //         const outputAmount = fromSmallestUnit(quote.outAmount, outputDecimals);
  //         setQuotedata(null);
  //         return {
  //           signature: signature,
  //           inputSymbol,
  //           outputSymbol,
  //           outputAmount,
  //         };
  //       } catch (error) {
  //         console.error("[useWallet] swap error:", error);
  //         throw error;
  //       } finally {
  //         setSwaping(false);
  //       }
  //     },
  //     [publicKey, connection, isDevnet],
  //   );

  return {
    connect,
    disconnect,
    publicKey,
    connected: !!publicKey,
    connecting,
    getBalance,
    getTokenBalances,
    sendSol,
    sending,
    //fetchSwapQuote,
    //clearQuote,
    //quotedata,
    //quoteLoading,
    //executeSwap,
    //swaping,
    connection,
  };
}
