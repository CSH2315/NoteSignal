import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Heart, Info, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  id: string;
  type: 'picked_me' | 'system';
  title: string;
  message: string;
  createdAt: string; // ISO String
  isNew: boolean;
}

// === 임시 데이터 생성 ===
const getMockNotifications = (): NotificationItem[] => {
  const now = new Date();
  
  const minusDays = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

  const minusHours = (hours: number) => {
    const d = new Date(now);
    d.setHours(d.getHours() - hours);
    return d.toISOString();
  };

  return [
    {
      id: 'n_1',
      type: 'picked_me',
      title: '누군가 당신의 매력을 발견했어요!',
      message: '당신의 보관함 남은 쪽지가 1장 차감되었습니다.',
      createdAt: minusHours(2), // 2시간 전
      isNew: true,
    },
    {
      id: 'n_2',
      type: 'system',
      title: '노트시그널 베타 오픈 안내',
      message: '당신의 이야기를 쪽지에 담아 새로운 인연을 만들어보세요.',
      createdAt: minusDays(1), // 1일 전
      isNew: true,
    },
    {
      id: 'n_3',
      type: 'picked_me',
      title: '누군가 당신의 쪽지를 선택했어요.',
      message: '매력적인 프로필 덕분이에요!',
      createdAt: minusDays(5), // 5일 전
      isNew: false,
    },
    {
      id: 'n_4',
      type: 'system',
      title: '14일이 지난 오래된 알림 (보이면 안됨)',
      message: '이 알림은 15일 전 알림이므로 무시되어야 합니다.',
      createdAt: minusDays(15), // 15일 전
      isNew: true,
    }
  ];
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // 1. 임시 데이터 로드
    const rawData = getMockNotifications();

    // 2. 14일 이내의 데이터만 필터링
    const now = new Date();
    const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
    
    const validNotes = rawData.filter(noti => {
      const notiDate = new Date(noti.createdAt);
      return (now.getTime() - notiDate.getTime()) <= FOURTEEN_DAYS_MS;
    });

    // 3. 최신순(내림차순) 정렬
    const sortedNotes = validNotes.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setNotifications(sortedNotes);
  }, []);

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
        {notifications.length === 0 ? (
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
                  ${noti.isNew ? 'bg-brand-50 hover:bg-brand-100/50' : 'bg-white hover:bg-gray-50'}
                `}
              >
                {/* 안 읽은 알림의 경우 뱃지 포인트 점 표시 */}
                {noti.isNew && (
                  <div className="absolute top-4 left-2 w-1.5 h-1.5 rounded-full bg-brand-500" />
                )}

                {getIcon(noti.type)}
                
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
