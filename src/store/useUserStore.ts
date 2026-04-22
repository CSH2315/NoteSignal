import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  uuid: string | null;
  gender: 'male' | 'female' | null;
  picksRemaining: number;
  isBanned: boolean;
  login: (uuid: string, gender: 'male' | 'female', picksRemaining: number, myNoteCopies: number, isBanned?: boolean) => void;
  logout: () => void;
  decrementPicks: (count?: number) => void;
  updateStatus: (picksRemaining: number, myNoteCopies: number, isBanned?: boolean) => void;
  setBannedState: (isBanned: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      uuid: null,
      gender: null,
      picksRemaining: 0,
      myNoteCopies: 0,
      isBanned: false,
      login: (uuid, gender, picksRemaining, myNoteCopies, isBanned = false) => set({ 
        uuid, 
        gender, 
        picksRemaining,
        myNoteCopies,
        isBanned
      }),
      logout: () => set({ uuid: null, gender: null, picksRemaining: 0, myNoteCopies: 0, isBanned: false }),
      decrementPicks: (count = 1) => set((state) => ({ 
        picksRemaining: Math.max(0, state.picksRemaining - count) 
      })),
      updateStatus: (picksRemaining, myNoteCopies, isBanned) => set((state) => ({
        picksRemaining,
        myNoteCopies,
        isBanned: isBanned !== undefined ? isBanned : state.isBanned
      })),
      setBannedState: (isBanned) => set({ isBanned }),
    }),
    {
      name: 'notesignal-storage',
    }
  )
);
