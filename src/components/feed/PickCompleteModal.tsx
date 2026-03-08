import { Check } from 'lucide-react';

interface PickCompleteModalProps {
  isOpen: boolean;
  pickedCount: number;
  remainingPicks: number;
}

export function PickCompleteModal({ isOpen, pickedCount, remainingPicks }: PickCompleteModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 transition-opacity" />
      <div className="fixed inset-x-4 top-[50%] -translate-y-[50%] bg-white rounded-3xl z-50 p-8 shadow-xl max-w-sm mx-auto flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6">
          <div className="w-14 h-14 bg-brand-500 rounded-full flex items-center justify-center animate-[pop_0.4s_ease-out]">
            <Check className="w-8 h-8 text-white stroke-3" />
          </div>
        </div>
        
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">선택 완료!</h2>
        <p className="text-gray-600 text-center mb-1 text-lg">
          <span className="font-bold text-brand-500">{pickedCount}개</span>의 쪽지를 뽑았어요.
        </p>
        <p className="text-gray-400 text-sm font-medium">
          기회가 {remainingPicks}번 남았어요.
        </p>

        {/* CSS for custom pop animation locally */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pop {
            0% { transform: scale(0.5); opacity: 0; }
            70% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); }
          }
        `}} />
      </div>
    </>
  );
}
