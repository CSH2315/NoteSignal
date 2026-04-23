import { useNavigate, useLocation } from 'react-router-dom';
import { Archive, Bell } from 'lucide-react';
import { useSeasonStore } from '@/store/useSeasonStore';
import { useUserStore } from '@/store/useUserStore';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const seasonStatus = useSeasonStore((state) => state.status);
  const { uuid, hasUnreadNotifications, setHasUnreadNotifications } = useUserStore();

  useEffect(() => {
    if (!uuid) return;
    const fetchUnread = async () => {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', uuid)
          .eq('is_read', false);
        
        if (!error && count && count > 0) {
          setHasUnreadNotifications(true);
        } else {
          setHasUnreadNotifications(false);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnread();
  }, [uuid, setHasUnreadNotifications]);

  // 메인 화면과 다음 시즌 안내 화면에서만 보이도록 설정
  const showHeaderPaths = ['/feed', '/next-season'];
  if (!showHeaderPaths.includes(location.pathname)) {
    return null;
  }

  const handleInventoryClick = () => {
    // 쪽지함 열람: active(진행중) 이거나 retention(보존일) 일 때 접근 가능
    if (seasonStatus === 'active' || seasonStatus === 'retention') {
      navigate('/inventory');
    } else {
      alert('쪽지함은 시즌 중이거나 결과 보존 기간에만 열람 가능합니다.');
    }
  };

  const handleNotiClick = () => {
    navigate('/notifications');
  };

  return (
    <header className="w-full h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-5 shrink-0 sticky top-0 z-30">
      <div 
        role="button"
        tabIndex={0}
        onClick={() => navigate('/')} 
        className="text-xl font-extrabold tracking-tight text-gray-900 cursor-pointer hover:opacity-80 transition-opacity select-none"
      >
        Note<span className="text-brand-500">Signal</span>
      </div>

      <div className="flex items-center gap-4 text-gray-600">
        <button 
          onClick={handleInventoryClick} 
          className="p-1 hover:text-brand-500 transition-colors"
          aria-label="보관함"
        >
          <Archive className="w-6 h-6" strokeWidth={2} />
        </button>
        <button 
          onClick={handleNotiClick} 
          className="p-1 hover:text-brand-500 transition-colors relative"
          aria-label="알림"
        >
          <Bell className="w-6 h-6" strokeWidth={2} />
          {hasUnreadNotifications && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>
    </header>
  );
}
