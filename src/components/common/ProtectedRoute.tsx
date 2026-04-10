import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { supabase } from '@/lib/supabase';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { uuid, logout, updateStatus } = useUserStore();
  const [isValidating, setIsValidating] = useState(true);
  const navigate = useNavigate();

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
          // 정상 세션: 최신 잔여 횟수 등으로 동기화
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
  }, [uuid, logout, updateStatus, navigate]);

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
