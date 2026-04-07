import { Check, AlertTriangle, X } from 'lucide-react';

interface PickCompleteModalProps {
  isOpen: boolean;
  pickedCount: number;
  failedCount: number;
  remainingPicks: number;
}

export function PickCompleteModal({ isOpen, pickedCount, failedCount, remainingPicks }: PickCompleteModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 transition-opacity" />
      <div className="fixed inset-x-4 top-[50%] -translate-y-[50%] bg-white rounded-3xl z-50 p-8 shadow-xl max-w-sm mx-auto flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${pickedCount > 0 ? 'bg-brand-50' : 'bg-red-50'}`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center animate-[pop_0.4s_ease-out] ${pickedCount > 0 ? 'bg-brand-500' : 'bg-red-500'}`}>
            {pickedCount > 0 ? (
              <Check className="w-8 h-8 text-white stroke-3" />
            ) : (
              <X className="w-8 h-8 text-white stroke-3" />
            )}
          </div>
        </div>
        
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
          {pickedCount > 0 ? '선택 완료!' : '앗, 아쉬워요!'}
        </h2>
        <p className="text-gray-600 text-center mb-1 text-lg">
          {pickedCount > 0 ? (
            <><span className="font-bold text-brand-500">{pickedCount}개</span>의 쪽지를 뽑았어요.</>
          ) : (
            <>쪽지를 획득하지 못했어요.</>
          )}
        </p>

        {failedCount > 0 && (
          <div className="flex items-start gap-1.5 mt-3 mb-2 bg-red-50 text-red-500 px-3 py-2 rounded-xl text-sm font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">다른 사람이 한 발 먼저 가져간 쪽지가 {failedCount}개 있어요. 해당 쪽지의 기회는 차감되지 않았어요.</span>
          </div>
        )}

        <p className={`text-sm font-medium ${failedCount > 0 ? 'text-gray-500 mt-2' : 'text-gray-400 mt-1'}`}>
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
