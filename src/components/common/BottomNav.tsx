import { User, Layers } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 pb-safe pb-4 pt-3 px-6 flex justify-around items-center z-30 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
      <button 
        onClick={() => navigate('/feed')}
        className={`flex flex-col items-center gap-1.5 transition-colors ${location.pathname === '/feed' ? 'text-brand-500' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <div className={`p-2 rounded-2xl transition-all ${location.pathname === '/feed' ? 'bg-brand-50' : 'bg-transparent'}`}>
          <Layers className="w-6 h-6" strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-bold tracking-wide">탐색</span>
      </button>

      <button 
        onClick={() => navigate('/profile')}
        className={`flex flex-col items-center gap-1.5 transition-colors ${location.pathname === '/profile' ? 'text-brand-500' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <div className={`p-2 rounded-2xl transition-all ${location.pathname === '/profile' ? 'bg-brand-50' : 'bg-transparent'}`}>
          <User className="w-6 h-6" strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-bold tracking-wide">내 프로필</span>
      </button>
    </nav>
  );
}
