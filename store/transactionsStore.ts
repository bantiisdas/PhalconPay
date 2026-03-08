import { mmkvStorage } from "@/src/lib/storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TransactionKind = "send_sol" | "send_token" | "swap" | "swap_and_send";

export interface BaseStoredTransaction {
  id: string;
  kind: TransactionKind;
  signature: string;
  timestamp: number;
}

export interface SendSolTransaction extends BaseStoredTransaction {
  kind: "send_sol";
  toAddress: string;
  amount: number;
  symbol: string;
}

export interface SendTokenTransaction extends BaseStoredTransaction {
  kind: "send_token";
  toAddress: string;
  amount: number;
  symbol: string;
  mint?: string;
}

export interface SwapTransaction extends BaseStoredTransaction {
  kind: "swap";
  inputSymbol: string;
  outputSymbol: string;
  outputAmount: number;
  inputAmount?: number;
}

export interface SwapAndSendTransaction extends BaseStoredTransaction {
  kind: "swap_and_send";
  toAddress: string;
  amount: number;
  symbol: string;
  swapFrom: string;
  swapTo: string;
}

export type StoredTransaction =
  | SendSolTransaction
  | SendTokenTransaction
  | SwapTransaction
  | SwapAndSendTransaction;

interface TransactionsState {
  transactions: StoredTransaction[];
  addTransaction: (tx: StoredTransaction) => void;
  getTransactions: () => StoredTransaction[];
  getTransactionById: (id: string) => StoredTransaction | undefined;
  clearAll: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (tx) => {
        const withId = { ...tx, id: tx.id || generateId() };
        set((state) => ({
          transactions: [withId, ...state.transactions],
        }));
      },

      getTransactions: () => get().transactions,

      getTransactionById: (id) =>
        get().transactions.find((t) => t.id === id),

      clearAll: () => set({ transactions: [] }),
    }),
    {
      name: "transactions-storage",
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

/** Helper to add a send SOL transaction. Call after successful send. */
export function recordSendSol(params: {
  signature: string;
  toAddress: string;
  amount: number;
}): void {
  useTransactionsStore.getState().addTransaction({
    id: generateId(),
    kind: "send_sol",
    signature: params.signature,
    timestamp: Date.now(),
    toAddress: params.toAddress,
    amount: params.amount,
    symbol: "SOL",
  });
}

/** Helper to add a send token transaction. Call after successful send. */
export function recordSendToken(params: {
  signature: string;
  toAddress: string;
  amount: number;
  symbol: string;
  mint?: string;
}): void {
  useTransactionsStore.getState().addTransaction({
    id: generateId(),
    kind: "send_token",
    signature: params.signature,
    timestamp: Date.now(),
    toAddress: params.toAddress,
    amount: params.amount,
    symbol: params.symbol,
    mint: params.mint,
  });
}

/** Helper to add a swap transaction. Call after successful swap. */
export function recordSwap(params: {
  signature: string;
  inputSymbol: string;
  outputSymbol: string;
  outputAmount: number;
  inputAmount?: number;
}): void {
  useTransactionsStore.getState().addTransaction({
    id: generateId(),
    kind: "swap",
    signature: params.signature,
    timestamp: Date.now(),
    inputSymbol: params.inputSymbol,
    outputSymbol: params.outputSymbol,
    outputAmount: params.outputAmount,
    inputAmount: params.inputAmount,
  });
}

/** Helper to add a swap-and-send transaction. Call after successful swap & send. */
export function recordSwapAndSend(params: {
  signature: string;
  toAddress: string;
  amount: number;
  symbol: string;
  swapFrom: string;
  swapTo: string;
}): void {
  useTransactionsStore.getState().addTransaction({
    id: generateId(),
    kind: "swap_and_send",
    signature: params.signature,
    timestamp: Date.now(),
    toAddress: params.toAddress,
    amount: params.amount,
    symbol: params.symbol,
    swapFrom: params.swapFrom,
    swapTo: params.swapTo,
  });
}

// --- UI mapping (for Transactions tab and detail screen) ---

function truncateAddr(addr: string, start = 4, end = 4): string {
  if (!addr || addr.length <= start + end) return addr;
  return `${addr.slice(0, start)}...${addr.slice(-end)}`;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = Date.now();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  if (d >= todayStart) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  if (d >= yesterdayStart) return "Yesterday";
  if (d >= weekStart) return `${Math.floor((now - ts) / 86400000)}d ago`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export type TransactionIconType =
  | "payment"
  | "sol"
  | "swap"
  | "bonk"
  | "coffee"
  | "avatar"
  | "default";
export type TransactionType = "sent" | "received" | "swap";

export interface TransactionRow {
  id: string;
  title: string;
  amount: string;
  type: TransactionType;
  time: string;
  iconType?: TransactionIconType;
}

export interface TransactionSection {
  title: string;
  data: TransactionRow[];
}

function storedToRow(t: StoredTransaction): TransactionRow {
  const time = formatTime(t.timestamp);
  switch (t.kind) {
    case "send_sol":
      return {
        id: t.id,
        title: truncateAddr(t.toAddress),
        amount: `${t.amount} ${t.symbol}`,
        type: "sent",
        time,
        iconType: "sol",
      };
    case "send_token":
      return {
        id: t.id,
        title: truncateAddr(t.toAddress),
        amount: `${t.amount} ${t.symbol}`,
        type: "sent",
        time,
        iconType: "payment",
      };
    case "swap":
      return {
        id: t.id,
        title: `Swap ${t.inputSymbol} → ${t.outputSymbol}`,
        amount: `${t.outputAmount} ${t.outputSymbol}`,
        type: "swap",
        time,
        iconType: "swap",
      };
    case "swap_and_send":
      return {
        id: t.id,
        title: `Swap & Send to ${truncateAddr(t.toAddress)}`,
        amount: `${t.amount} ${t.symbol}`,
        type: "sent",
        time,
        iconType: "swap",
      };
  }
}

/** Get the most recent N transactions as rows (e.g. for Home screen). */
export function getRecentTransactionRows(
  transactions: StoredTransaction[],
  limit: number = 8,
): TransactionRow[] {
  return transactions.slice(0, limit).map(storedToRow);
}

/** Section stored transactions by date (Today, Yesterday, This week, Earlier). */
export function getTransactionSections(
  transactions: StoredTransaction[],
): TransactionSection[] {
  const now = Date.now();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const today: TransactionRow[] = [];
  const yesterday: TransactionRow[] = [];
  const thisWeek: TransactionRow[] = [];
  const earlier: TransactionRow[] = [];

  for (const t of transactions) {
    const row = storedToRow(t);
    const d = new Date(t.timestamp);
    if (d >= todayStart) today.push(row);
    else if (d >= yesterdayStart) yesterday.push(row);
    else if (d >= weekStart) thisWeek.push(row);
    else earlier.push(row);
  }

  const sections: TransactionSection[] = [];
  if (today.length) sections.push({ title: "Today", data: today });
  if (yesterday.length) sections.push({ title: "Yesterday", data: yesterday });
  if (thisWeek.length) sections.push({ title: "This week", data: thisWeek });
  if (earlier.length) sections.push({ title: "Earlier", data: earlier });
  return sections;
}

export interface TransactionDetailsView {
  id: string;
  title: string;
  amount: string;
  type: TransactionType;
  iconType?: TransactionIconType;
  status: "confirmed";
  fromName: string;
  fromAddress: string;
  toName: string;
  toAddress: string;
  amountValue: string;
  networkFee: string;
  total: string;
  date: string;
  time: string;
  hash: string;
  note?: string;
}

function storedToDetails(t: StoredTransaction): TransactionDetailsView {
  const d = new Date(t.timestamp);
  const date = d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  switch (t.kind) {
    case "send_sol":
      return {
        id: t.id,
        title: truncateAddr(t.toAddress),
        amount: `${t.amount} ${t.symbol}`,
        type: "sent",
        iconType: "sol",
        status: "confirmed",
        fromName: "Me",
        fromAddress: "",
        toName: truncateAddr(t.toAddress),
        toAddress: t.toAddress,
        amountValue: `-${t.amount} ${t.symbol}`,
        networkFee: "—",
        total: `${t.amount} ${t.symbol}`,
        date,
        time,
        hash: t.signature,
      };
    case "send_token":
      return {
        id: t.id,
        title: truncateAddr(t.toAddress),
        amount: `${t.amount} ${t.symbol}`,
        type: "sent",
        iconType: "payment",
        status: "confirmed",
        fromName: "Me",
        fromAddress: "",
        toName: truncateAddr(t.toAddress),
        toAddress: t.toAddress,
        amountValue: `-${t.amount} ${t.symbol}`,
        networkFee: "—",
        total: `${t.amount} ${t.symbol}`,
        date,
        time,
        hash: t.signature,
      };
    case "swap":
      return {
        id: t.id,
        title: `Swap ${t.inputSymbol} → ${t.outputSymbol}`,
        amount: `${t.outputAmount} ${t.outputSymbol}`,
        type: "swap",
        iconType: "swap",
        status: "confirmed",
        fromName: "Me",
        fromAddress: "",
        toName: "",
        toAddress: "",
        amountValue: `${t.inputAmount ?? "?"} ${t.inputSymbol} → ${t.outputAmount} ${t.outputSymbol}`,
        networkFee: "—",
        total: `${t.outputAmount} ${t.outputSymbol}`,
        date,
        time,
        hash: t.signature,
      };
    case "swap_and_send":
      return {
        id: t.id,
        title: `Swap & Send to ${truncateAddr(t.toAddress)}`,
        amount: `${t.amount} ${t.symbol}`,
        type: "sent",
        iconType: "swap",
        status: "confirmed",
        fromName: "Me",
        fromAddress: "",
        toName: truncateAddr(t.toAddress),
        toAddress: t.toAddress,
        amountValue: `-${t.amount} ${t.symbol} (${t.swapFrom} → ${t.swapTo})`,
        networkFee: "—",
        total: `${t.amount} ${t.symbol}`,
        date,
        time,
        hash: t.signature,
      };
  }
}

/** Get full details for the detail screen. Returns undefined if not found. */
export function getStoredTransactionDetails(
  id: string,
): TransactionDetailsView | undefined {
  const t = useTransactionsStore.getState().getTransactionById(id);
  return t ? storedToDetails(t) : undefined;
}
