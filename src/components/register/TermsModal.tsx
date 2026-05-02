import { useState } from 'react';
import { Check, ChevronRight, X } from 'lucide-react';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsOfService } from './TermsOfService';

interface TermsModalProps {
  isOpen: boolean;
  onAgree: () => void;
  onClose: () => void;
}

export function TermsModal({ isOpen, onAgree, onClose }: TermsModalProps) {
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [detailView, setDetailView] = useState<'privacy' | 'terms' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAllAgree = () => {
    const isAll = privacyAgreed && termsAgreed;
    setPrivacyAgreed(!isAll);
    setTermsAgreed(!isAll);
    setErrorMsg('');
  };

  const handleConfirm = () => {
    if (!privacyAgreed || !termsAgreed) {
      setErrorMsg('서비스를 이용하려면 필수 약관에 모두 동의해 주세요.');
      return;
    }
    onAgree();
  };

  if (detailView === 'privacy') {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom flex-1">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">개인정보 이용 동의</h2>
          <button onClick={() => setDetailView(null)} className="p-2"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
          <PrivacyPolicy />
        </div>
        <div className="p-4 border-t bg-white">
          <button
            onClick={() => { setPrivacyAgreed(true); setDetailView(null); setErrorMsg(''); }}
            className="w-full py-4 bg-brand-500 text-white font-bold rounded-xl"
          >
            동의하기
          </button>
        </div>
      </div>
    );
  }

  if (detailView === 'terms') {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom flex-1">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">이용약관 동의</h2>
          <button onClick={() => setDetailView(null)} className="p-2"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
          <TermsOfService />
        </div>
        <div className="p-4 border-t bg-white">
          <button
            onClick={() => { setTermsAgreed(true); setDetailView(null); setErrorMsg(''); }}
            className="w-full py-4 bg-brand-500 text-white font-bold rounded-xl"
          >
            동의하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-50 p-6 shadow-xl w-full max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
        <h2 className="text-xl font-bold mb-6 text-gray-900">이용약관 동의</h2>

        <div className="space-y-4 mb-8">
          {/* All Agree */}
          <div 
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer"
            onClick={handleAllAgree}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${privacyAgreed && termsAgreed ? 'bg-brand-500' : 'bg-gray-200'}`}>
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">전체동의</span>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Privacy */}
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => { setPrivacyAgreed(!privacyAgreed); setErrorMsg(''); }}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${privacyAgreed ? 'bg-brand-500' : 'border border-gray-300'}`}>
                {privacyAgreed && <Check className="w-4 h-4 text-white" />}
              </div>
              <span className="text-gray-700">(필수) 개인정보 이용 동의</span>
            </div>
            <button className="p-2 text-gray-400" onClick={() => setDetailView('privacy')}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Terms */}
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => { setTermsAgreed(!termsAgreed); setErrorMsg(''); }}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${termsAgreed ? 'bg-brand-500' : 'border border-gray-300'}`}>
                {termsAgreed && <Check className="w-4 h-4 text-white" />}
              </div>
              <span className="text-gray-700">(필수) 이용약관 동의</span>
            </div>
            <button className="p-2 text-gray-400" onClick={() => setDetailView('terms')}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>


        </div>

        {errorMsg && <p className="text-red-500 text-sm mb-4 text-center">{errorMsg}</p>}

        <button
          onClick={handleConfirm}
          className="w-full py-4 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 transition-colors"
        >
          확인
        </button>
      </div>
    </>
  );
}
