import { AlertTriangle, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface RecoveryCodeModalProps {
  isOpen: boolean;
  code: string;
  onConfirm: (pin: string) => void;
}

export function RecoveryCodeModal({ isOpen, code, onConfirm }: RecoveryCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [showError, setShowError] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    if (pinCode !== pinConfirm) {
      setShowError(true);
      return;
    }
    onConfirm(pinCode);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 transition-opacity" />
      <div className="fixed inset-x-4 top-[50%] -translate-y-[50%] bg-white rounded-3xl z-50 p-6 shadow-xl max-w-sm mx-auto animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold mb-2 text-center text-gray-900">당신의 복구용 아이디</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          기기 변경이나 캐시 삭제 시 기존 쪽지함과 남은 뽑기 횟수를 불러오기 위해 필요합니다.
        </p>

        <div className="bg-gray-100 p-4 rounded-xl flex items-center justify-between mb-4">
          <span className="text-2xl font-mono font-bold text-gray-800 tracking-widest">{code}</span>
          <button 
            onClick={handleCopy}
            className="p-2 bg-white rounded-lg shadow-sm text-gray-600 hover:text-brand-600"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3 text-center">4자리 비밀번호(PIN) 설정</label>
          <div className="space-y-3">
            <input
              type="password"
              maxLength={4}
              value={pinCode}
              onChange={(e) => {
                setPinCode(e.target.value.replace(/[^0-9]/g, ''));
                setShowError(false);
              }}
              placeholder="숫자 4자리 입력"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition text-center text-lg tracking-[0.5em] font-mono"
            />
            <input
              type="password"
              maxLength={4}
              value={pinConfirm}
              onChange={(e) => {
                setPinConfirm(e.target.value.replace(/[^0-9]/g, ''));
                setShowError(false);
              }}
              placeholder="비밀번호 재확인"
              className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 outline-none transition text-center text-lg tracking-[0.5em] font-mono ${
                showError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-brand-500'
              }`}
            />
          </div>
          {showError && (
            <p className="text-xs text-red-500 mt-2 text-center font-bold animate-in slide-in-from-top-1">
              비밀번호가 일치하지 않습니다.
            </p>
          )}
          <p className="text-xs text-gray-500 mt-3 text-center">이 번호는 로그인 시 복구코드와 함께 필요합니다.</p>
        </div>

        <div className="text-xs text-red-500 text-center mb-6 space-y-1">
          <p>⚠️ 시즌 종료일까지 유효합니다.</p>
          <p>⚠️ 절대 타인에게 공유하지 마세요.</p>
          <p className="font-bold">⚠️ 이 화면을 캡처하거나 코드를 따로 저장해주세요! 잃어버릴 경우 찾을 수 없습니다.</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={pinCode.length !== 4 || pinConfirm.length !== 4 || pinCode !== pinConfirm}
          className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          저장
        </button>
      </div>
    </>
  );
}
