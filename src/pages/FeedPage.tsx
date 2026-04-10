import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { BottomNav } from '@/components/common/BottomNav';
import { NoteCard } from '@/components/feed/NoteCard';
import { PickCompleteModal } from '@/components/feed/PickCompleteModal';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// DB에서 받아올 RPC 반환 타입 수동 지정 (database.types.ts 업데이트 전 임시)
type PublicFeedNote = {
  id: string;
  nickname: string;
  age: number | null;
  mbti: string;
  charm: string;
  ideal_type: string;
  created_at: string;
  copies_remaining: number;
  is_picked: boolean;
};

// MOCK DATA REMOVED

export default function FeedPage() {
  const navigate = useNavigate();
  const { uuid, gender: myGender, picksRemaining, decrementPicks } = useUserStore();
  
  const [notes, setNotes] = useState<PublicFeedNote[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  
  // 모달 제어 상태
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [recentPickedCount, setRecentPickedCount] = useState(0);
  const [recentFailedCount, setRecentFailedCount] = useState(0);

  // 무한 스크롤 참조용 (옵저버 타겟)
  const observerTarget = useRef<HTMLDivElement>(null);

  // 쪽지 로드 함수 (최신순 10개씩 페이징 로드)
  const loadMoreNotes = useCallback(async () => {
    if (isLoading || !hasMore || picksRemaining <= 0 || !myGender) return;
    setIsLoading(true);

    try {
      const targetGender = myGender === 'male' ? 'female' : 'male';
      const startIndex = (page - 1) * 10;
      
      const { data, error } = await supabase
        .rpc('get_feed_notes', {
          p_gender: targetGender,
          p_limit: 10,
          p_offset: startIndex,
          p_viewer_id: uuid
        });

      if (error) throw error;

      if (data && data.length > 0) {
        setNotes((prev) => {
          // 중복 제거 방어로직
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueData = data.filter((d: any) => !existingIds.has(d.id));
          return [...prev, ...uniqueData];
        });
        
        // 페이지는 무조건 증가 (다음 페이지 확인을 위해)
        setPage((prev) => prev + 1);

        // 가져온 데이터가 10개보다 적으면 더 이상 남은 쪽지가 없음을 의미함
        if (data.length < 10) {
          setHasMore(false);
        }
      } else {
        // 데이터가 아예 안 온 경우 (또는 10의 배수로 끝난 후 다음 0개 요청 시)
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load notes', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, myGender, picksRemaining, uuid]);

  // Intersection Observer 설정 (스크롤이 바닥 근처에 닿으면 다음 페이지 로드)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
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
  const handleSelect = (id: string, isPicked?: boolean) => {
    // 이미 서버상에 기록이 있는 즉, 과거에 내가 뽑은 쪽지는 클릭조차 불가
    if (isPicked) return;

    // 이미 (현재 UI 상에서) 선택되어 있으면 선택 해제 (기회와 무관하게 언제든 취소 가능)
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

  // 신고 기능 대기 함수
  const handleReport = (id: string) => {
    alert(`[스프린트2 예정] 쪽지 고유번호: ${id}\n이 쪽지를 신고하는 화면(모달)이 열리게 됩니다.`);
  };

  // 선택하기 액션 (DB 횟수 차감 및 쪽지함 이동)
  const handlePickConfirmed = async () => {
    if (selectedNoteIds.length === 0 || picksRemaining < selectedNoteIds.length) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('execute_picks', {
        p_note_ids: selectedNoteIds,
        p_picker_id: uuid
      });

      if (error) throw error;

      // data 구조: { success_count: number, results: [{ note_id, status, reason }] }
      const successCount = data.success_count || 0;
      const failedCount = selectedNoteIds.length - successCount;
      
      // 결과 상관없이 일단 모달은 띄움. (일부 실패했을 수도 있음)
      if (successCount > 0) {
        decrementPicks(successCount);
      }
      
      setRecentPickedCount(successCount);
      setRecentFailedCount(failedCount);
      setIsCompleteModalOpen(true);

      // 실패한 건이 있다면 읽어볼 시간을 위해 3초 대기, 전부 성공했다면 2초 대기 후 이동
      setTimeout(() => {
        setIsCompleteModalOpen(false);
        navigate('/inventory'); 
      }, failedCount > 0 ? 3000 : 2000);

    } catch (err: any) {
      console.error('Pick execution failed', err);
      alert('쪽지 선택 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
      setSelectedNoteIds([]);
    }
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
      {notes.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center pt-24 px-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-3xl">🍃</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">아직 피드가 조용하네요</h2>
          <p className="text-gray-500 max-w-[280px]">
            회원님의 조건에 맞는 새로운 쪽지가 아직 등록되지 않았어요. 조금만 기다려주세요!
          </p>
        </div>
      ) : (
        <div className="px-4 columns-2 gap-4 space-y-4">
          {notes.map((note) => (
            note.id && (
              <NoteCard
                key={note.id}
                note={{
                  id: note.id,
                  nickname: note.nickname || '익명',
                  age: note.age,
                  mbti: note.mbti || 'N/A',
                  charm: note.charm || '',
                  idealType: note.ideal_type || '',
                  copiesRemaining: note.copies_remaining || 0,
                  isPicked: note.is_picked || false
                }}
                isSelected={selectedNoteIds.includes(note.id)}
                onSelect={(id) => handleSelect(id, note.is_picked)}
                onReport={handleReport}
              />
            )
          ))}
        </div>
      )}

      {/* 로딩 표시기 / 옵저버 타겟 */}
      <div ref={observerTarget} className="h-20 flex items-center justify-center mt-4">
        {isLoading && (
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>

      {/* 선택 완료 모달 (자동 이동) */}
      <PickCompleteModal 
        isOpen={isCompleteModalOpen} 
        pickedCount={recentPickedCount} 
        failedCount={recentFailedCount}
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
