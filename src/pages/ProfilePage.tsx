import { useUserStore } from '@/store/useUserStore';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/common/BottomNav';
import { AlertTriangle, Edit3, Trash2, UserCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout, gender, myNoteCopies, decrementMyNoteCopies } = useUserStore();

  // TODO: 실제로는 DB 연동 후 내 쪽지(노트) 정보를 불러와야 합니다.
  const myProfileMock = {
    nickname: '빛나는고양이',
    age: 24,
    gender: gender || 'female',
    contactType: 'instagram',
    contactId: 'shiney_cat_24',
    mbti: 'ENFP',
    charm: '항상 밝은 에너지로 주변 사람들을 기분 좋게 해줍니다! 맛집 탐방을 좋아하고 사진을 예쁘게 잘 찍어요.',
    idealType: '다정하고 배려심이 깊은 사람, 대화가 끊이지 않고 티키타카가 잘 되는 사람이 좋습니다.',
  };

  const handleDelete = () => {
    const isConfirmed = window.confirm(`정말 삭제하시겠습니까?\n삭제한 후에도 시즌 동안에는 '새로운 쪽지 등록하기'를 선택해 다시 작성할 수 있습니다.\n단, 다시 작성해도 쪽지는 ${myNoteCopies}장만 등록됩니다.`);
    if (isConfirmed) {
      // TODO: Supabase 연동 시 DB에서 해당 사용자의 users 및 notes 정보 삭제 혹은 soft delete 처리
      // 테스트 환경에서는 로컬 스토리지 로그아웃 처리 후 랜딩 이동
      logout();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 pt-4 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 px-1 flex items-center gap-3">
        <UserCircle2 className="w-8 h-8 text-brand-500" strokeWidth={2.5} />
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">내 프로필</h1>
      </div>

      <div className="space-y-6">
        {/* 프로필 카드 영역 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-extrabold text-gray-900">{myProfileMock.nickname}</span>
                <span className="text-sm font-semibold text-gray-400">{myProfileMock.age}세</span>
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">
                  {myProfileMock.mbti}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider">
                  {myProfileMock.gender === 'female' ? '여성' : '남성'}
                </span>
              </div>
            </div>
            
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${myProfileMock.gender === 'female' ? 'bg-pink-100/50' : 'bg-blue-100/50'}`}>
              <UserCircle2 className={`w-6 h-6 ${myProfileMock.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`} />
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <span className="block text-xs font-bold text-gray-400 mb-1.5">연락처 ({myProfileMock.contactType === 'instagram' ? '인스타그램' : '카카오톡'})</span>
              <p className="text-sm font-bold text-gray-800 bg-gray-50 py-2 px-3 rounded-xl border border-gray-100/50">
                {myProfileMock.contactId}
              </p>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 mb-1.5">자신의 매력</span>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 py-3 px-3 rounded-xl border border-gray-100/50">
                {myProfileMock.charm}
              </p>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 mb-1.5">이상형</span>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 py-3 px-3 rounded-xl border border-gray-100/50">
                {myProfileMock.idealType}
              </p>
            </div>
          </div>
        </div>

        {/* 내 쪽지 현황 요약 */}
        <div className={`border rounded-3xl p-5 flex items-center justify-between shadow-sm ${myNoteCopies > 0 ? 'bg-brand-50 border-brand-100' : 'bg-gray-100 border-gray-200'}`}>
          <div>
            <h3 className="text-sm font-bold text-gray-900">내 쪽지 현황</h3>
            <p className="text-xs text-gray-500 mt-0.5">다른 사람들에게 뽑힐 수 있는 남은 횟수예요.</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-extrabold ${myNoteCopies > 0 ? 'text-brand-500' : 'text-gray-400'}`}>
              {Math.max(0, myNoteCopies)}
            </span>
            <span className="text-sm font-bold text-gray-400">장 남음</span>
          </div>
        </div>

        {/* 테스트용: 차감 시뮬레이션 버튼 */}
        {myNoteCopies > 0 && (
           <div className="flex justify-end px-2">
             <button 
               onClick={decrementMyNoteCopies}
               className="text-xs text-gray-400 underline decoration-gray-300 hover:text-gray-600"
             >
               (테스트) 누군가 내 쪽지를 고름
             </button>
           </div>
        )}

        {/* 액션 버튼 영역 */}
        <div className="space-y-3 px-1">
          {myNoteCopies > 0 ? (
            <button
              onClick={() => navigate('/edit-profile')}
              className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
              <Edit3 className="w-5 h-5" />
              내 프로필 수정하기
            </button>
          ) : (
            <button
              disabled
              className="w-full py-4 bg-gray-200 text-gray-400 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Edit3 className="w-5 h-5" />
              수정 불가 (남은 쪽지 0장)
            </button>
          )}
          
          <button
            onClick={handleDelete}
            className="w-full py-4 bg-red-50 text-red-500 font-bold rounded-2xl hover:bg-red-100 transition flex items-center justify-center gap-2 border border-red-100"
          >
            <Trash2 className="w-5 h-5" />
            내 프로필 삭제하기
          </button>
        </div>
        
        <div className="flex items-start gap-2 p-4 bg-gray-100/50 rounded-2xl mt-4">
          <AlertTriangle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed">
            게시된 당신의 쪽지가 모두 소진될 시 더 이상 다른 사람의 피드에 표시되지 않습니다. 
            삭제 후 새로 작성 시 남은 횟수는 복구되지 않고 유지됩니다.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
