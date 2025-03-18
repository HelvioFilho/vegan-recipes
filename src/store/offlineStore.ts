import { create } from 'zustand';

type OfflineStore = {
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
};

export const useOfflineStore = create<OfflineStore>((set) => ({
  isOffline: false,
  setIsOffline: (offline) => set({ isOffline: offline }),
}));
