import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  uuid: string | null;
  gender: 'male' | 'female' | null;
  picksRemaining: number;
  myNoteCopies: number;
  login: (uuid: string, gender: 'male' | 'female') => void;
  logout: () => void;
  decrementPicks: (count?: number) => void;
  // 테스트용: 다른 사람이 내 쪽지를 가져갔을 때 차감되는 로직 시뮬레이션
  decrementMyNoteCopies: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      uuid: null,
      gender: null,
      picksRemaining: 0,
      myNoteCopies: 0,
      login: (uuid, gender) => set({ 
        uuid, 
        gender, 
        picksRemaining: gender === 'female' ? 4 : 2,
        myNoteCopies: 2 // 가입/등록 시 2장 부여
      }),
      logout: () => set({ uuid: null, gender: null, picksRemaining: 0, myNoteCopies: 0 }),
      decrementPicks: (count = 1) => set((state) => ({ 
        picksRemaining: Math.max(0, state.picksRemaining - count) 
      })),
      decrementMyNoteCopies: () => set((state) => ({
        myNoteCopies: Math.max(0, state.myNoteCopies - 1)
      })),
    }),
    {
      name: 'notesignal-storage',
    }
  )
);
