import { useNavigate, useLocation } from 'react-router-dom';
import { Archive, Bell } from 'lucide-react';
import { isSeasonActive } from '@/lib/season';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  // 메인 화면과 다음 시즌 안내 화면에서만 보이도록 설정
  const showHeaderPaths = ['/feed', '/next-season'];
  if (!showHeaderPaths.includes(location.pathname)) {
    return null;
  }

  const handleInventoryClick = () => {
    if (isSeasonActive() && location.pathname !== '/next-season') {
      navigate('/inventory');
    } else {
      alert('쪽지함은 시즌 중에만 열람 가능합니다.');
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
          className="p-1 hover:text-brand-500 transition-colors"
          aria-label="알림"
        >
          <Bell className="w-6 h-6" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
