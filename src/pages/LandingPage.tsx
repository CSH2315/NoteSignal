import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { isSeasonActive } from '@/lib/season';
import { LoginModal } from '@/components/landing/LoginModal';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const navigate = useNavigate();
  const uuid = useUserStore((state) => state.uuid);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    // 1. Check Season Status
    if (!isSeasonActive()) {
      navigate('/next-season');
      return;
    }

    // 2. Auto-login check
    if (uuid) {
      navigate('/feed');
      return;
    }

    // If no UUID and season is active, show the Landing Page UI
    setIsChecking(false);
  }, [uuid, navigate]);

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-brand-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-brand-50 px-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-brand-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-brand-200 rounded-full blur-3xl opacity-50" />

      {/* Hero Section */}
      <div className="z-10 flex flex-col items-center text-center mt-[-10vh] w-full max-w-sm">
        
        {/* Step 1: Logo and Catchphrase appearing first */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Note<span className="text-brand-500">Signal</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl font-medium max-w-[280px]">
            "이번엔 꼭 솔로탈출 하세요!"
          </p>
        </motion.div>

        {/* Step 2: Description and Buttons appearing nicely after a delay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center w-full"
        >
          <p className="text-gray-500 text-sm max-w-[300px] leading-relaxed mb-8">
            쪽지 한 장으로 시작되는 20대의 연애
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col w-full gap-4">
            <button
              onClick={() => navigate('/register')}
              className="w-full flex items-center justify-between px-6 py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg hover:bg-brand-600 active:scale-95 transition-all shadow-lg shadow-brand-500/30"
            >
              <span>새로운 쪽지 등록하기</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setLoginModalOpen(true)}
              className="w-full px-5 py-4 bg-white text-gray-700 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all border border-gray-200 shadow-sm flex items-center justify-center space-x-1"
            >
              <span className="text-sm font-medium text-gray-500">이번 시즌에 이미 등록하셨나요?</span>
              <span className="text-sm font-bold text-brand-500 whitespace-nowrap">쪽지 이어보기</span>
            </button>
          </div>
        </motion.div>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => {
          setLoginModalOpen(false);
          navigate('/feed');
        }}
      />
    </div>
  );
}
