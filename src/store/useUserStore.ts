import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  uuid: string | null;
  gender: 'male' | 'female' | null;
  picksRemaining: number;
  myNoteCopies: number;
  login: (uuid: string, gender: 'male' | 'female', picksRemaining: number, myNoteCopies: number) => void;
  logout: () => void;
  decrementPicks: (count?: number) => void;
  updateStatus: (picksRemaining: number, myNoteCopies: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      uuid: null,
      gender: null,
      picksRemaining: 0,
      myNoteCopies: 0,
      login: (uuid, gender, picksRemaining, myNoteCopies) => set({ 
        uuid, 
        gender, 
        picksRemaining,
        myNoteCopies
      }),
      logout: () => set({ uuid: null, gender: null, picksRemaining: 0, myNoteCopies: 0 }),
      decrementPicks: (count = 1) => set((state) => ({ 
        picksRemaining: Math.max(0, state.picksRemaining - count) 
      })),
      updateStatus: (picksRemaining, myNoteCopies) => set({
        picksRemaining,
        myNoteCopies
      }),
    }),
    {
      name: 'notesignal-storage',
    }
  )
);
