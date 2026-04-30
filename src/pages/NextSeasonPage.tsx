import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeasonStore } from '@/store/useSeasonStore';
import { useSeasonRealtime } from '@/hooks/useSeasonRealtime';

export default function NextSeasonPage() {
  const { status, startDate } = useSeasonStore();
  const navigate = useNavigate();

  // 대기 화면에 접속해있는 비로그인 유저의 자동 화면 전환을 위한 소켓 연결
  useSeasonRealtime();

  useEffect(() => {
    if (status === 'loading') return;
    
    // 시즌이 사전 등록 또는 수강 상태로 진입 시, 랜딩(메인) 혹은 피드로 자동 이동
    if (status === 'active' || status === 'pre_registration') {
      navigate('/', { replace: true });
    }
  }, [status, navigate]);

  const isScheduled = status === 'scheduled';
  const formattedDate = startDate 
    ? new Date(startDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '미정';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 text-center">
      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">💭</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {isScheduled ? '다음 시즌을 준비 중입니다' : '현재 시즌이 종료되었습니다'}
      </h1>
      <p className="text-gray-500 mb-8 max-w-[280px]">
        {isScheduled 
          ? '새로운 인연이 곧 찾아옵니다. 조금만 기다려주세요!' 
          : '다음 시즌에 다시 찾아오겠습니다. 이용해주셔서 감사합니다!'}
      </p>
      {isScheduled && (
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-sm">
          <p className="text-sm font-medium text-gray-400 mb-1">다음 시즌 안내</p>
          <p className="text-lg font-bold text-gray-900">{formattedDate} 오픈 예정</p>
        </div>
      )}
    </div>
  );
}
