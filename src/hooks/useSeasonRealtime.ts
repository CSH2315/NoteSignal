import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSeasonStore, SeasonStatus } from '@/store/useSeasonStore';

/**
 * 전역적인 시즌 데이터(seasons 테이블) 변경 사항을 실시간으로 구독하는 커스텀 훅.
 * 이 훅은 오직 ProtectedRoute(Auth된 유저 영역)에서만 마운트되어, 
 * 비로그인 유저들의 무분별한 웹소켓 커넥션 낭비를 방지합니다.
 */
export function useSeasonRealtime() {
  const { setSeasonData } = useSeasonStore();

  useEffect(() => {
    const channel = supabase
      .channel('public:seasons:realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'seasons' },
        (payload) => {
          const newRecord = payload.new as any;
          if (newRecord && newRecord.status) {
            console.log('[Realtime] Season UPDATE detected:', newRecord.status);
            setSeasonData(
              newRecord.status as SeasonStatus,
              newRecord.title,
              newRecord.start_date,
              newRecord.end_date
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'seasons' },
        (payload) => {
          const newRecord = payload.new as any;
          // 새로 삽입된 시즌이 완료 상태가 아니라면 현재 스토어를 덮어씌웁니다.
          if (newRecord && newRecord.status !== 'completed') {
             console.log('[Realtime] Season INSERT detected (Next Season created)');
             setSeasonData(
               newRecord.status as SeasonStatus,
               newRecord.title,
               newRecord.start_date,
               newRecord.end_date
             );
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Subscribed to seasons table changes.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setSeasonData]);
}
