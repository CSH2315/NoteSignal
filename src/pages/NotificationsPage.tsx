import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Heart, Info, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { uuid, setHasUnreadNotifications } = useUserStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!uuid) {
      navigate('/');
      return;
    }

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase.rpc('get_my_notifications', {
          p_user_id: uuid
        });

        if (error) throw error;
        
        const mappedData = data.map((noti: any) => ({
          id: noti.id,
          type: noti.type,
          title: noti.title,
          message: noti.message,
          createdAt: noti.created_at,
          isRead: noti.is_read
        }));

        setNotifications(mappedData);

        // 알림창에 들어오면 읽음 처리 시도
        if (mappedData.some((n: any) => !n.isRead)) {
          await supabase.rpc('mark_notifications_as_read', {
            p_user_id: uuid
          });
          setHasUnreadNotifications(false);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        toast.error('알림을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [uuid, navigate, setHasUnreadNotifications]);

  // 시간 포맷팅 함수 (예: '2시간 전', '1일 전')
  const formatTimeAgo = (dateStr: string) => {
    const time = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffMs = now - time;
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
  };

  const getIcon = (type: NotificationItem['type']) => {
    if (type === 'picked_me') {
      return (
        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <Info className="w-5 h-5 text-gray-500" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-safe animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="px-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 py-3 border-b border-gray-100">
        <button 
          onClick={() => navigate(-1)} // 이전 화면으로
          className="p-2 bg-transparent rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-extrabold text-gray-900 absolute left-[50%] -translate-x-[50%]">알림</span>
        <div className="w-10" />
      </div>

      <div className="pt-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center mt-32">
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">알림 로딩 중...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-32 px-6 text-center animate-in fade-in">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-bold text-gray-900">새로운 알림이 없습니다</p>
            <p className="text-sm text-gray-500 mt-1">최근 14일 이내의 소식이 이곳에 표시됩니다.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((noti) => (
              <div 
                key={noti.id} 
                className={`p-4 flex gap-4 transition-colors relative cursor-pointer
                  ${!noti.isRead ? 'bg-brand-50 hover:bg-brand-100/50' : 'bg-white hover:bg-gray-50'}
                `}
              >
                {/* 안 읽은 알림의 경우 뱃지 포인트 점 표시 */}
                {!noti.isRead && (
                  <div className="absolute top-4 left-2 w-1.5 h-1.5 rounded-full bg-brand-500" />
                )}

                {getIcon(noti.type as any)}
                
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="text-sm font-bold text-gray-900 mb-1 leading-tight tracking-tight">
                    {noti.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-snug">
                    {noti.message}
                  </p>
                  
                  <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(noti.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
