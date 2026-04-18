import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { useSeasonStore } from '@/store/useSeasonStore';
import { useSeasonRealtime } from '@/hooks/useSeasonRealtime';
import { supabase } from '@/lib/supabase';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { uuid, logout, updateStatus } = useUserStore();
  const seasonStatus = useSeasonStore((state) => state.status);
  const setSeasonData = useSeasonStore((state) => state.setSeasonData);
  const [isValidating, setIsValidating] = useState(true);
  const navigate = useNavigate();

  // 오직 인증된 유저(ProtectedRoute 통과자)에게만 실시간 웹소켓 연결
  useSeasonRealtime();

  useEffect(() => {
    if (!uuid) {
      setIsValidating(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const { data, error } = await supabase.rpc('get_user_status', { p_uuid: uuid });

        if (error || !data || !data.is_active) {
          // 서버 통신 오류거나 파기된 세션(쪽지 삭제 등)이면 로그아웃 처리
          logout();
          navigate('/', { replace: true });
        } else {
          // 정상 세션: DB의 최신 시즌 상태도 스토어에 동기화
          if (data.season_status) {
             // title, startDate, endDate는 fetchCurrentSeason이 관리하므로 status만 갱신
             setSeasonData(data.season_status as any);
          }
          updateStatus(data.picks_remaining, data.my_note_copies);
        }
      } catch (err: any) {
        // 네트워크 에러 시 강제 로그아웃 금지 (Offline 방어)
        if (err?.message === 'Failed to fetch' || err?.message?.includes('NetworkError')) {
          console.warn('네트워크 통신 중단: 세션을 유지합니다.');
        } else {
          logout();
          navigate('/', { replace: true });
        }
      } finally {
        setIsValidating(false);
      }
    };

    checkStatus();
  }, [uuid, logout, updateStatus, navigate, setSeasonData]);

  // 시즌 상태 강제 리다이렉트 (앱 셧다운 방어 로직)
  useEffect(() => {
    if (seasonStatus === 'loading') return;

    if (seasonStatus === 'completed' || seasonStatus === 'scheduled') {
      navigate('/next-season', { replace: true });
    }
    // pre_registration이나 retention일 때는 Route 접근을 허용 (내부 페이지에서 분기)
  }, [seasonStatus, navigate]);

  if (!uuid) {
    return <Navigate to="/" replace />;
  }

  // 데이터 동기화 전 깜빡임 방지용 로딩 화면
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
