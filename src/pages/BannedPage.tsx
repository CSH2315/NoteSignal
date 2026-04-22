import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { AlertCircle, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function BannedPage() {
  const { uuid, isBanned } = useUserStore();
  const navigate = useNavigate();
  const [isDeleted, setIsDeleted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // 만약 밴이 풀렸거나, 밴 당하지 않은 사용자가 강제 접근하려 할 경우
  useEffect(() => {
    if (!isBanned) {
      navigate('/feed', { replace: true });
    }
  }, [isBanned, navigate]);

  // 쪽지 생존 상태 확인
  useEffect(() => {
    if (!uuid) return;
    
    const checkNoteStatus = async () => {
      try {
        const { data, error } = await supabase.rpc('get_user_status', { p_uuid: uuid });
        if (!error && data) {
          setIsDeleted(data.is_active === false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkNoteStatus();
  }, [uuid]);

  const handleDeleteMyNote = async () => {
    if (!uuid || isDeleted) return;
    
    const confirmDelete = window.confirm(
      '저장된 본인의 쪽지 정보가 삭제되며 피드에서 내려갑니다. 정말 파기하시겠습니까?\n(영구 정지 상태이므로 다시 작성할 수 없습니다.)'
    );
    
    if (!confirmDelete) return;

    try {
      const { data, error } = await supabase.rpc('delete_my_profile', {
        p_user_id: uuid
      });

      if (error) throw error;
      if (data && data.success === false) {
        throw new Error(data.reason || '삭제 실패');
      }

      alert('본인의 쪽지 파기가 완료되었습니다.');
      setIsDeleted(true);
    } catch (err: any) {
      console.error(err);
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 text-center pb-20">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-200">
        <AlertCircle className="w-10 h-10 text-red-500" strokeWidth={2.5} />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        서비스 이용이 제한되었습니다
      </h1>
      <p className="text-gray-500 mb-8 max-w-[280px] leading-relaxed">
        운영 원칙 위반으로 계정 활동이 일시적 혹은 영구적으로 정지되었습니다. 신고 내역 검토 결과에 따라 조치되었습니다.
      </p>

      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => alert('[안내] notesignal.help@gmail.com 으로 문의해 주시기 바랍니다.')}
          className="w-full py-4 bg-gray-200 text-gray-700 font-bold rounded-2xl transition hover:bg-gray-300"
        >
          제재 사유 문의하기
        </button>
        <button
          onClick={handleDeleteMyNote}
          disabled={isChecking || isDeleted}
          className={`w-full py-4 font-bold rounded-2xl flex items-center justify-center gap-2 transition ${
            isDeleted 
              ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
              : 'bg-white border border-red-100 text-red-500 hover:bg-red-50'
          }`}
        >
          {isDeleted ? (
            <>
              <CheckCircle className="w-5 h-5" />
              이미 파기된 쪽지입니다
            </>
          ) : (
            <>
              <Trash2 className="w-5 h-5" />
              내 쪽지 정보 파기
            </>
          )}
        </button>
      </div>
    </div>
  );
}
