import { create } from 'zustand';

export type WalletType = 'friend' | 'merchant' | 'exchange' | 'wallet';

export interface FavoriteWallet {
  id: string;
  name: string;
  address: string;
  avatarType?: 'initial' | 'coffee' | 'exchange' | 'wallet' | 'person' | 'fox';
  avatarColor?: string;
  type?: WalletType;
}

interface FavoritesState {
  wallets: FavoriteWallet[];
  addWallet: (wallet: Omit<FavoriteWallet, 'id'>) => void;
  removeWallet: (id: string) => void;
  getWallets: () => FavoriteWallet[];
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  wallets: [],

  addWallet: (wallet) => {
    const id = generateId();
    set((state) => ({
      wallets: [...state.wallets, { ...wallet, id }],
    }));
  },

  removeWallet: (id) => {
    set((state) => ({
      wallets: state.wallets.filter((w) => w.id !== id),
    }));
  },

  getWallets: () => get().wallets,
}));
