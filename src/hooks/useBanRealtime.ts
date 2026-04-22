import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/useUserStore';

export function useBanRealtime() {
  const { uuid, setBannedState } = useUserStore();

  useEffect(() => {
    if (!uuid) return;

    // 테이블 이름: bans, 이벤트: UPDATE 및 INSERT
    // 현 유저(uuid)의 row가 들어오거나 값이 업데이트 될 때 감지
    // (insert로 차단될 수도 있고, update로 차단 해제될 수도 있음)
    const channel = supabase
      .channel('public:bans:realtime')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'bans',
          filter: `user_id=eq.${uuid}`
        },
        (payload) => {
          const newRecord = payload.new as any;
          if (newRecord && 'is_banned' in newRecord) {
            console.log('[Realtime] Ban status changed:', newRecord.is_banned);
            setBannedState(newRecord.is_banned);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [uuid, setBannedState]);
}
