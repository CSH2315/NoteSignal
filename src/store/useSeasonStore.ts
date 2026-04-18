import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type SeasonStatus = 'scheduled' | 'pre_registration' | 'active' | 'retention' | 'completed' | 'loading';

interface SeasonState {
  status: SeasonStatus;
  title: string | null;
  startDate: string | null;
  endDate: string | null;
  setSeasonData: (status: SeasonStatus, title?: string | null, startDate?: string | null, endDate?: string | null) => void;
  fetchCurrentSeason: () => Promise<void>;
}

export const useSeasonStore = create<SeasonState>((set) => ({
  status: 'loading',
  title: null,
  startDate: null,
  endDate: null,
  
  setSeasonData: (status, title = null, startDate = null, endDate = null) => 
    set((state) => ({ 
      status, 
      title: title !== null ? title : state.title,
      startDate: startDate !== null ? startDate : state.startDate,
      endDate: endDate !== null ? endDate : state.endDate
    })),
    
  fetchCurrentSeason: async () => {
    try {
      // completed가 아닌 최상위 생애주기 시즌을 가져옵니다.
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .neq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // PGRST116: 일치하는 Row가 없을 때 발생하는 코드. 이 경우는 그냥 아무 시즌도 없는 것(completed)으로 간주합니다.
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        set({
          status: data.status as SeasonStatus,
          title: data.title,
          startDate: data.start_date,
          endDate: data.end_date
        });
      } else {
        set({ status: 'completed' });
      }
    } catch (err) {
      console.error('Failed to fetch season:', err);
      set({ status: 'completed' }); // 에러 발생 시 최악의 상황을 가정해 닫힌 상태로 Fallback
    }
  }
}));
