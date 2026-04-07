import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/useUserStore';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [recoveryCode, setRecoveryCode] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const setStoreUser = useUserStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!recoveryCode || pinCode.length !== 4) return;

    setLoading(true);
    
    try {
      const { data, error: rpcError } = await supabase.rpc('verify_login', {
        p_login_id: recoveryCode,
        p_pin_code: pinCode
      });

      if (rpcError) throw rpcError;

      if (data && data.success) {
        setStoreUser(data.user_id, data.gender, data.picks_remaining, data.my_note_copies);
        onSuccess();
      } else if (data && data.needs_reregistration) {
        // 쪽지 삭제 상태인 유저에게 재등록 여부를 묻고 /register 로 보냄
        const confirmRestore = window.confirm(data.reason);
        if (confirmRestore) {
          onSuccess(); // 모달 닫기
          navigate('/register', { 
            state: { 
              restoreUserId: data.user_id, 
              restoreLoginId: data.login_id,
              restoreGender: data.gender
            } 
          });
        }
      } else {
        // 백엔드 RPC에서 내려준 상세/통일된 에러 메시지 그대로 노출
        setError(data?.reason || '복구 아이디 또는 4자리 PIN 번호가 올바르지 않습니다.');
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      setError('서버와 통신 중 문제가 발생했습니다. 잠시 후 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-x-4 top-[50%] -translate-y-[50%] bg-white rounded-2xl z-50 p-6 shadow-xl max-w-sm mx-auto animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold mb-6 text-gray-900">쪽지 이어보기</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              접속용 복구 아이디
            </label>
            <input
              type="text"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors uppercase"
              placeholder="예: A8X2-9M4Q"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              4자리 비밀번호 (PIN)
            </label>
            <input
              type="password"
              maxLength={4}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors text-center tracking-[0.5em] font-mono text-lg"
              placeholder="숫자 4자리"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-gray-500 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !recoveryCode || pinCode.length !== 4}
              className="flex-1 py-3 bg-brand-500 text-white font-medium rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors"
            >
              {loading ? '확인 중...' : '확인'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
