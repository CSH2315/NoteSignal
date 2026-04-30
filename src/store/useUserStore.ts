import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  uuid: string | null;
  gender: 'male' | 'female' | null;
  picksRemaining: number;
  myNoteCopies: number;
  isBanned: boolean;
  hasUnreadNotifications: boolean;
  login: (uuid: string, gender: 'male' | 'female', picksRemaining: number, myNoteCopies: number, isBanned?: boolean) => void;
  logout: () => void;
  decrementPicks: (count?: number) => void;
  decrementMyNoteCopies: () => void;
  updateStatus: (picksRemaining: number, myNoteCopies: number, isBanned?: boolean) => void;
  setBannedState: (isBanned: boolean) => void;
  setHasUnreadNotifications: (hasUnread: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      uuid: null,
      gender: null,
      picksRemaining: 0,
      myNoteCopies: 0,
      isBanned: false,
      hasUnreadNotifications: false,
      login: (uuid, gender, picksRemaining, myNoteCopies, isBanned = false) => set({ 
        uuid, 
        gender, 
        picksRemaining,
        myNoteCopies,
        isBanned
      }),
      logout: () => set({ uuid: null, gender: null, picksRemaining: 0, myNoteCopies: 0, isBanned: false, hasUnreadNotifications: false }),
      decrementPicks: (count = 1) => set((state) => ({ 
        picksRemaining: Math.max(0, state.picksRemaining - count) 
      })),
      decrementMyNoteCopies: () => set((state) => ({
        myNoteCopies: Math.max(0, state.myNoteCopies - 1)
      })),
      updateStatus: (picksRemaining, myNoteCopies, isBanned) => set((state) => ({
        picksRemaining,
        myNoteCopies,
        isBanned: isBanned !== undefined ? isBanned : state.isBanned
      })),
      setBannedState: (isBanned) => set({ isBanned }),
      setHasUnreadNotifications: (hasUnread) => set({ hasUnreadNotifications: hasUnread }),
    }),
    {
      name: 'notesignal-storage',
    }
  )
);
