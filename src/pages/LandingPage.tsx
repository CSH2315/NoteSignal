import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { LoginModal } from '@/components/landing/LoginModal';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSeasonStore } from '@/store/useSeasonStore';

export default function LandingPage() {
  const navigate = useNavigate();
  const uuid = useUserStore((state) => state.uuid);
  const { status: seasonStatus } = useSeasonStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    if (seasonStatus === 'loading') return;

    // 1. 이미 접속한 유저라면 일단 Feed로 무조건 보냅니다.
    if (uuid) {
      navigate('/feed', { replace: true });
      return;
    }

    // 2. 로그인이 안 된 유저들만 시즌 상태로 분기 처리합니다.
    if (seasonStatus === 'scheduled' || seasonStatus === 'completed' || seasonStatus === 'retention') {
      navigate('/next-season', { replace: true });
      return;
    }

    // If no UUID and season is active, show the Landing Page UI
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 400); // 0.4s delay 최소한의 시간 확보 (화면 깜빡임 방지)

    return () => clearTimeout(timer);
  }, [uuid, navigate, seasonStatus]);

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
            쪽지 한 장으로 시작되는 20대의 연애
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
            현재 테스트 운영 기간으로, 정식 오픈은 5월 13일입니다.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col w-full gap-4">
            {seasonStatus === 'pre_registration' && (
              <div className="flex items-center justify-center w-full px-4 py-3 bg-brand-50 border border-brand-200 text-brand-600 rounded-2xl font-bold text-sm shadow-sm animate-pulse mb-1">
                🔥 지금은 사전 등록 기간입니다! 미리 쪽지를 남겨보세요.
              </div>
            )}

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
              <span className="text-sm font-bold text-brand-500 whitespace-nowrap">쪽지 재등록/이어보기</span>
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
