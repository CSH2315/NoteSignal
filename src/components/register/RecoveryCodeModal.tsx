import { AlertTriangle, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface RecoveryCodeModalProps {
  isOpen: boolean;
  code: string;
  onConfirm: () => void;
}

export function RecoveryCodeModal({ isOpen, code, onConfirm }: RecoveryCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 transition-opacity" />
      <div className="fixed inset-x-4 top-[50%] -translate-y-[50%] bg-white rounded-2xl z-50 p-6 shadow-xl max-w-sm mx-auto animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold mb-2 text-center text-gray-900">당신의 복구용 아이디</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          기기 변경이나 캐시 삭제 시 기존 쪽지함과 남은 뽑기 횟수를 불러오기 위해 필요합니다.
        </p>

        <div className="bg-gray-100 p-4 rounded-xl flex items-center justify-between mb-2">
          <span className="text-2xl font-mono font-bold text-gray-800 tracking-widest">{code}</span>
          <button 
            onClick={handleCopy}
            className="p-2 bg-white rounded-lg shadow-sm text-gray-600 hover:text-brand-600"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <div className="text-xs text-red-500 text-center mb-6 space-y-1">
          <p>⚠️ 2026.03.31 (시즌 종료일)까지 유효합니다.</p>
          <p>⚠️ 절대 타인에게 공유하지 마세요.</p>
          <p className="font-bold">⚠️ 이 화면을 캡처하거나 코드를 따로 저장해주세요!</p>
        </div>

        <button
          onClick={onConfirm}
          className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
        >
          저장했습니다 (메인으로 이동)
        </button>
      </div>
    </>
  );
}
