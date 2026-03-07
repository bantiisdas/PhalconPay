import type { TransactionIconType, TransactionType } from '@/components/TransactionItem';
import type { RecentTransactionData } from '@/components/RecentTransactions';

/** Full transaction details for the Transaction Details screen. */
export type TransactionStatus = 'confirmed' | 'pending' | 'failed';

export interface TransactionDetails {
  id: string;
  title: string;
  amount: string;
  type: TransactionType;
  iconType?: TransactionIconType;
  status: TransactionStatus;
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

/** Transaction row for the Transactions screen (sectioned list). */
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

/** Sectioned transaction list for the Transactions tab. */
export const TRANSACTION_SECTIONS: TransactionSection[] = [
  {
    title: 'Today',
    data: [
      {
        id: '1',
        title: 'Alice',
        amount: '12 USDC',
        type: 'received',
        time: '10:30 AM',
        iconType: 'payment',
      },
      {
        id: '2',
        title: 'Coffee Shop',
        amount: '5 USDC',
        type: 'sent',
        time: '09:12 AM',
        iconType: 'payment',
      },
    ],
  },
  {
    title: 'Yesterday',
    data: [
      {
        id: '3',
        title: 'Exchange',
        amount: '0.45 SOL',
        type: 'sent',
        time: 'Yesterday',
        iconType: 'sol',
      },
    ],
  },
  {
    title: 'Earlier',
    data: [
      {
        id: '4',
        title: 'BONK Rewards',
        amount: '5,000 BONK',
        type: 'received',
        time: '5d ago',
        iconType: 'bonk',
      },
    ],
  },
];

/** Full details by transaction id. Used by Transaction Details screen. */
export const TRANSACTION_DETAILS: Record<string, TransactionDetails> = {
  '1': {
    id: '1',
    title: 'Alice',
    amount: '12 USDC',
    type: 'received',
    iconType: 'payment',
    status: 'confirmed',
    fromName: 'Alice',
    fromAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    toName: 'Me',
    toAddress: '9xGk7PLmFfXqVvW9W1mZgY4H2KjS7',
    amountValue: '+12 USDC',
    networkFee: '0.000005 SOL',
    total: '12 USDC',
    date: 'Mar 7, 2025',
    time: '10:30 AM',
    hash: '5j7s8K2mNpQrTvWxYzAbCdEfGhJkLmNoPqRsTuVwXyZ',
    note: 'Payment for lunch',
  },
  '2': {
    id: '2',
    title: 'Coffee Shop',
    amount: '5 USDC',
    type: 'sent',
    iconType: 'payment',
    status: 'confirmed',
    fromName: 'Me',
    fromAddress: '9xGk7PLmFfXqVvW9W1mZgY4H2KjS7',
    toName: 'Coffee Shop',
    toAddress: '3nM9pL2qRsTuVwXyZAbCdEfGhJkLmNoPqR',
    amountValue: '-5 USDC',
    networkFee: '0.000005 SOL',
    total: '5.00 USDC',
    date: 'Mar 7, 2025',
    time: '09:12 AM',
    hash: '2mNpQrTvWxYzAbCdEfGhJkLmNoPqRsTuVwXyZ1aBc',
  },
  '3': {
    id: '3',
    title: 'Exchange',
    amount: '0.45 SOL',
    type: 'sent',
    iconType: 'sol',
    status: 'confirmed',
    fromName: 'Me',
    fromAddress: '9xGk7PLmFfXqVvW9W1mZgY4H2KjS7',
    toName: 'Exchange',
    toAddress: '4pQrTuVwXyZAbCdEfGhJkLmNoPqRsTuVwX',
    amountValue: '-0.45 SOL',
    networkFee: '0.000005 SOL',
    total: '0.45 SOL',
    date: 'Mar 6, 2025',
    time: '6:20 PM',
    hash: '3qRsTuVwXyZAbCdEfGhJkLmNoPqRsTuVwXyZ2bCd',
  },
  '4': {
    id: '4',
    title: 'BONK Rewards',
    amount: '5,000 BONK',
    type: 'received',
    iconType: 'bonk',
    status: 'confirmed',
    fromName: 'BONK Rewards',
    fromAddress: '5rTuVwXyZAbCdEfGhJkLmNoPqRsTuVwXyZ',
    toName: 'Me',
    toAddress: '9xGk7PLmFfXqVvW9W1mZgY4H2KjS7',
    amountValue: '+5,000 BONK',
    networkFee: '0.000005 SOL',
    total: '5,000 BONK',
    date: 'Mar 2, 2025',
    time: '2:15 PM',
    hash: '4sUvWxYzAbCdEfGhJkLmNoPqRsTuVwXyZ3cDe',
  },
};

/** Get full transaction details by id. Returns undefined if not found. */
export function getTransactionById(id: string): TransactionDetails | undefined {
  return TRANSACTION_DETAILS[id];
}

/** Recent transactions for the Home screen. */
export const RECENT_TRANSACTIONS: RecentTransactionData[] = [
  {
    id: '1',
    title: 'Coffee Shop',
    amount: '$5.00',
    type: 'sent',
    subtitle: '5 USDC',
    iconType: 'coffee',
  },
  {
    id: '2',
    title: 'Alice',
    amount: '12 USDC',
    type: 'received',
    iconType: 'avatar',
  },
  {
    id: '3',
    title: 'Swap SOL → USDC',
    amount: '0.1 SOL',
    type: 'swap',
    iconType: 'swap',
  },
];
