import { ReactNode } from 'react';
import { Header } from '@/components/common/Header';
import { RealtimeAlerts } from '@/components/common/RealtimeAlerts';

export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-gray-50 flex justify-center selection:bg-brand-100">
      <div className="w-full max-w-md bg-white min-h-screen shadow-[0_0_15px_rgba(0,0,0,0.05)] relative flex flex-col">
        <Header />
        <RealtimeAlerts />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
