import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "../src/lib/storage";

interface WalletState {
  // Data
  favorites: string[];
  searchHistory: string[];
  isDevnet: boolean;
  connectedPublicKey: string | null;
  displayName: string;
  profileImageUri: string | null;

  // Actions
  addFavorite: (address: string) => void;
  removeFavorite: (address: string) => void;
  isFavorite: (address: string) => boolean;
  addToHistory: (address: string) => void;
  clearHistory: () => void;
  toggleNetwork: () => void;
  setConnectedPublicKey: (publicKey: string | null) => void;
  setDisplayName: (name: string) => void;
  setProfileImageUri: (uri: string | null) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      favorites: [],
      searchHistory: [],
      isDevnet: false,
      connectedPublicKey: null,
      displayName: "",
      profileImageUri: null,

      addFavorite: (address) =>
        set((state) => ({
          favorites: state.favorites.includes(address)
            ? state.favorites
            : [address, ...state.favorites],
        })),

      removeFavorite: (address) =>
        set((state) => ({
          favorites: state.favorites.filter((a) => a !== address),
        })),

      isFavorite: (address) => get().favorites.includes(address),

      addToHistory: (address) =>
        set((state) => ({
          searchHistory: [
            address,
            ...state.searchHistory.filter((a) => a !== address),
          ].slice(0, 20),
        })),

      clearHistory: () => set({ searchHistory: [] }),

      toggleNetwork: () =>
        set((state) => ({
          isDevnet: !state.isDevnet,
        })),

      setConnectedPublicKey: (publicKey) =>
        set({
          connectedPublicKey: publicKey,
        }),

      setDisplayName: (name) => set({ displayName: name.trim() }),
      setProfileImageUri: (uri) => set({ profileImageUri: uri }),
    }),
    { name: "wallet-storage", storage: createJSONStorage(() => mmkvStorage) },
  ),
);
