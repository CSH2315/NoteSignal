import { ReactNode } from 'react';
import { Header } from '@/components/common/Header';
import { RealtimeAlerts } from '@/components/common/RealtimeAlerts';

export default function MobileLayout({ children }: { children: ReactNode }) {
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
          </footer>
        </main>
      </div>
    </div>
  );
}
