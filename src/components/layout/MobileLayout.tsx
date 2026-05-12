import { ReactNode, useState } from 'react';
import { Header } from '@/components/common/Header';
import { RealtimeAlerts } from '@/components/common/RealtimeAlerts';
import { PrivacyPolicy } from '@/components/register/PrivacyPolicy';
import { TermsOfService } from '@/components/register/TermsOfService';
import { X } from 'lucide-react';

type LegalView = 'privacy' | 'terms' | null;

export default function MobileLayout({ children }: { children: ReactNode }) {
  const [legalView, setLegalView] = useState<LegalView>(null);

  return (
    <div className="w-full min-h-screen bg-gray-50 flex justify-center selection:bg-brand-100">
      <div className="w-full max-w-md bg-white min-h-screen shadow-[0_0_15px_rgba(0,0,0,0.05)] relative flex flex-col">
        <Header />
        <RealtimeAlerts />
        <main className="flex-1 overflow-y-auto flex flex-col relative">
          <div className="flex-1">
            {children}
          </div>
          <footer className="w-full text-center pb-28 pt-10 px-4 mt-auto">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              이용에 불편함 또는 문의사항이 있을 경우<br />
              <a href="mailto:notesignaldev@gmail.com" className="font-semibold underline hover:text-brand-500 transition-colors">notesignaldev@gmail.com</a> 으로 연락바랍니다.
            </p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <button
                onClick={() => setLegalView('privacy')}
                className="text-[11px] text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
              >
                개인정보처리방침
              </button>
              <span className="text-[11px] text-gray-300">|</span>
              <button
                onClick={() => setLegalView('terms')}
                className="text-[11px] text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
              >
                이용약관
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* 개인정보처리방침 풀스크린 오버레이 */}
      {legalView === 'privacy' && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col w-full max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold">개인정보처리방침</h2>
            <button onClick={() => setLegalView(null)} className="p-2" aria-label="닫기">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
            <PrivacyPolicy />
          </div>
        </div>
      )}

      {/* 이용약관 풀스크린 오버레이 */}
      {legalView === 'terms' && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col w-full max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold">이용약관</h2>
            <button onClick={() => setLegalView(null)} className="p-2" aria-label="닫기">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
            <TermsOfService />
          </div>
        </div>
      )}
    </div>
  );
}
