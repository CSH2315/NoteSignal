import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { BottomNav } from '@/components/common/BottomNav';
import { NoteCard, NoteItem } from '@/components/feed/NoteCard';
import { PickCompleteModal } from '@/components/feed/PickCompleteModal';
import { AlertCircle } from 'lucide-react';

// === 임시 목업 데이터 생성 함수 ===
const MOCK_MALE_NOTES: NoteItem[] = Array.from({ length: 30 }, (_, i) => ({
  id: `m_${i}`,
  nickname: `훈훈한사람${i}`,
  age: Math.random() > 0.3 ? 20 + Math.floor(Math.random() * 9) : null,
  mbti: ['ENFJ', 'INFP', 'ISFJ', 'ENTJ'][Math.floor(Math.random() * 4)],
  charm: '웃는 상이고 항상 주변을 잘 챙겨줍니다. 이야기를 잘 들어줘서 편안하다는 소리를 많이 들어요.',
  idealType: '대화가 잘 통하고 밝은 성격이었으면 좋겠습니다. 같이 맛집 다니는 걸 좋아해요.',
  copiesRemaining: Math.floor(Math.random() * 2) + 1, // 1 or 2
}));
const MOCK_FEMALE_NOTES: NoteItem[] = Array.from({ length: 30 }, (_, i) => ({
  id: `f_${i}`,
  nickname: `다정한고양이${i}`,
  age: 20 + Math.floor(Math.random() * 9),
  mbti: ['ISTP', 'ESFP', 'ENFP', 'INTJ'][Math.floor(Math.random() * 4)],
  charm: '요리를 잘하고 책임감이 강합니다. 취미로 런닝을 꾸준히 하고 있어서 체력도 좋아요!',
  idealType: '기본적인 예의가 바른 사람, 같이 있을 때 배울 점이 많은 사람이 이상형입니다.',
  copiesRemaining: Math.floor(Math.random() * 2) + 1, // 1 or 2
}));
// =================================

export default function FeedPage() {
  const navigate = useNavigate();
  // TODO: 실제로는 DB 연동 후 UserStore에서 본인의 gender, picksRemaining 등을 가져와야 합니다.
  const { gender: myGender, picksRemaining, decrementPicks } = useUserStore();
  
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  
  // 모달 제어 상태
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [recentPickedCount, setRecentPickedCount] = useState(0);

  // 무한 스크롤 참조용 (옵저버 타겟)
  const observerTarget = useRef<HTMLDivElement>(null);

  // 쪽지 로드 함수 (최신순 10개씩 페이징 로드 시뮬레이션)
  const loadMoreNotes = useCallback(async () => {
    if (isLoading || !hasMore || picksRemaining <= 0) return;
    setIsLoading(true);

    // 실제로는 Supabase에서 page 기준으로 limit(10) 조회
    await new Promise((res) => setTimeout(res, 600));

    const targetPool = myGender === 'male' ? MOCK_FEMALE_NOTES : MOCK_MALE_NOTES;
    const startIndex = (page - 1) * 10;
    const endIndex = startIndex + 10;
    
    const newNotes = targetPool.slice(startIndex, endIndex);

    if (newNotes.length > 0) {
      setNotes((prev) => [...prev, ...newNotes]);
      setPage((prev) => prev + 1);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  }, [page, isLoading, hasMore, myGender, picksRemaining]);

  // Intersection Observer 설정 (스크롤이 바닥 근처에 닿으면 다음 페이지 로드)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreNotes();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMoreNotes]);

  // 선택 로직 (토글 및 여러 개 선택)
  const handleSelect = (id: string) => {
    // 이미 선택되어 있으면 선택 해제 (기회와 무관하게 언제든 취소 가능)
    if (selectedNoteIds.includes(id)) {
      setSelectedNoteIds((prev) => prev.filter(noteId => noteId !== id));
      return;
    }

    // 새로 선택하는 경우, 남은 기회보다 많이 고르려고 하면 막기 (사이드 이펙트 분리)
    if (selectedNoteIds.length >= picksRemaining) {
      alert('남은 기회가 부족합니다.');
      return;
    }

    // 선택 추가
    setSelectedNoteIds((prev) => [...prev, id]);
  };

  // 신고 기능 대기 함수 (스프린트 2에서 모달 연결)
  const handleReport = (id: string) => {
    alert(`[스프린트2 예정] 쪽지 고유번호: ${id}\n이 쪽지를 신고하는 화면(모달)이 열리게 됩니다.`);
  };

  // 선택하기 액션 (DB 횟수 차감 및 쪽지함 이동)
  const handlePickConfirmed = async () => {
    if (selectedNoteIds.length === 0 || picksRemaining < selectedNoteIds.length) return;
    
    // TODO: 실제로는 선택한 ID들을 DB의 Picks 테이블에 Insert 해야 함
    const count = selectedNoteIds.length;
    decrementPicks(count);
    
    // 애니메이션 렌더링을 위해 모달 띄우기
    setRecentPickedCount(count);
    setIsCompleteModalOpen(true);

    // 2초 뒤 보관함으로 이동
    setTimeout(() => {
      navigate('/inventory'); 
    }, 2000);
  };

  // 남은 횟수가 0일 때의 화면 (Zero State)
  // 단, 방금 선택해서 0이 되었고 모달이 떠있는 상태라면 애니메이션을 보여줘야 하므로 방어
  if (picksRemaining <= 0 && !isCompleteModalOpen) {
    return (
      <div className="min-h-screen bg-gray-50 pb-28 pt-4 flex flex-col justify-between">
        <div className="flex flex-col items-center justify-center flex-1 px-6 text-center mt-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">이번 시즌 열람 기회 소진</h2>
          <p className="text-gray-500 mb-8 max-w-[280px]">
            이번 시즌에 뽑을 수 있는 쪽지를 모두 확인하셨습니다. 보관함과 프로필에서 인연을 관리해 보세요!
          </p>
          <button
            onClick={() => navigate('/inventory')}
            className="w-full max-w-[240px] py-4 bg-brand-500 text-white font-bold rounded-2xl shadow-lg hover:bg-brand-600 transition"
          >
            내 쪽지함 가기
          </button>
        </div>
        
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 pt-4">
      {/* 2열 레이아웃을 위한 Masonry 스타일 컨테이너 */}
      <div className="px-4 columns-2 gap-4 space-y-4">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isSelected={selectedNoteIds.includes(note.id)}
            onSelect={handleSelect}
            onReport={handleReport}
          />
        ))}
      </div>

      {/* 로딩 표시기 / 옵저버 타겟 */}
      <div ref={observerTarget} className="h-20 flex items-center justify-center mt-4">
        {isLoading && (
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>

      {/* 선택 완료 모달 (2초 후 자동 이동) */}
      <PickCompleteModal 
        isOpen={isCompleteModalOpen} 
        pickedCount={recentPickedCount} 
        remainingPicks={picksRemaining} 
      />

      {/* 하단 네비게이션 처리 (선택 여부에 따라 분기) */}
      {selectedNoteIds.length > 0 && !isCompleteModalOpen ? (
        <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 p-4 pb-safe flex items-center justify-between z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-5">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900">쪽지 {selectedNoteIds.length}개 선택됨</span>
            <span className="text-xs text-brand-500 font-medium">남은 기회: {picksRemaining}장 중 {selectedNoteIds.length}장 차감</span>
          </div>
          <button
            onClick={handlePickConfirmed}
            className="px-6 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition shadow-md shadow-brand-500/20 active:scale-95"
          >
            선택하기 ({selectedNoteIds.length}회 차감)
          </button>
        </div>
      ) : (
        // 모달이 떠있을 때는 일반 네비게이션 바를 가려줌 (모달에 온전히 집중하도록)
        !isCompleteModalOpen && <BottomNav />
      )}
    </div>
  );
}
