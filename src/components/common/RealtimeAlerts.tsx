import { useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/useUserStore';
import { Bell } from 'lucide-react';

export function RealtimeAlerts() {
  const uuid = useUserStore((state) => state.uuid);
  const decrementMyNoteCopies = useUserStore((state) => state.decrementMyNoteCopies);

  useEffect(() => {
    // 사용자가 로그인하지 않았다면 구독하지 않음
    if (!uuid) return;

    // notifications 테이블에서 내 uuid로 들어오는 INSERT 이벤트를 구독
    const channel = supabase
      .channel(`realtime-notifications-${uuid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${uuid}`, // 내 알림만 필터링
        },
        (payload) => {
          // 1. 새로운 알림 인서트 시 예쁜 우측 상단 팝업 띄우기
          const { title, message, type } = payload.new;
          
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-sm w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-full bg-brand-50 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-brand-500" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-brand-600 hover:text-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  닫기
                </button>
              </div>
            </div>
          ), { duration: 4000, position: 'top-center' });

          // 2. 만약 내 쪽지가 선택된 알림이라면, 프론트엔드 상태(myNoteCopies)를 동기화하기 위해 차감
          // DB의 execute_picks RPC가 INSERT하는 type 값은 'picked_me'
          if (type === 'picked_me') {
            decrementMyNoteCopies();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [uuid, decrementMyNoteCopies]);

  return <Toaster />;
}
