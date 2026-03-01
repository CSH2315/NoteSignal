import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  uuid: string | null;
  picksRemaining: number;
  login: (uuid: string) => void;
  logout: () => void;
  decrementPicks: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      uuid: null,
      picksRemaining: 0,
      login: (uuid) => set({ uuid }),
      logout: () => set({ uuid: null, picksRemaining: 0 }),
      decrementPicks: () => set((state) => ({ 
        picksRemaining: Math.max(0, state.picksRemaining - 1) 
      })),
    }),
    {
      name: 'notesignal-storage',
    }
  )
);
