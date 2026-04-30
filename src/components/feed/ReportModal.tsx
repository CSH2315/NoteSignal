import { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/useUserStore';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string | null;
}

const REPORT_REASONS = [
  '욕설 및 혐오 표현',
  '스팸 및 도배',
  '음란물 및 성적 표현',
  '개인정보 침해',
  '기타'
];

export function ReportModal({ isOpen, onClose, noteId }: ReportModalProps) {
  const { uuid } = useUserStore();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !noteId) return null;

  const isOther = selectedReason === '기타';
  const isValid = selectedReason !== '' && (!isOther || details.trim().length > 0);

  const handleSubmit = async () => {
    if (!isValid || !uuid) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('submit_report', {
        p_reporter_id: uuid,
        p_note_id: noteId,
        p_reason_type: selectedReason,
        p_details: isOther ? details.trim() : null
      });

      if (error) throw error;
      
      if (data && data.success === false) {
        alert(`신고 접수 불가: ${data.reason}`);
        handleClose();
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Report error:', err);
      alert('신고 접수 중 통신 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setDetails('');
    setIsSubmitting(false);
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative pt-6 pb-4 px-6 border-b border-gray-100 flex items-center px-6">
          <div className="flex-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" strokeWidth={2.5} />
            <h3 className="text-lg font-bold text-gray-900">쪽지 신고하기</h3>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full"
            disabled={isSubmitting || isSuccess}
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" strokeWidth={2.5} />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">신고 접수 완료</h4>
            <p className="text-sm text-gray-500">
              클린한 생태계를 만들어주셔서 감사합니다.<br/>운영진 검토 후 신속히 조치하겠습니다.
            </p>
          </div>
        ) : (
          <>
            <div className="p-6">
              <p className="text-sm tracking-tight text-gray-500 mb-4 leading-relaxed">
                해당 쪽지가 운영 원칙을 위반했다고 생각되시면 신고해 주세요. 허위 신고 시 불이익을 받을 수 있습니다.
              </p>

              <div className="space-y-2 mb-4">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full flex items-center p-3 rounded-xl border text-left transition-all ${
                      selectedReason === reason 
                        ? 'border-red-500 bg-red-50 text-red-700 font-bold' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${
                      selectedReason === reason ? 'border-red-500' : 'border-gray-300'
                    }`}>
                      {selectedReason === reason && <div className="w-2 h-2 rounded-full bg-red-500" />}
                    </div>
                    <span className="text-sm tracking-tight">{reason}</span>
                  </button>
                ))}
              </div>

              {isOther && (
                <div className="animate-in slide-in-from-top-1 fade-in duration-200 mt-2">
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="신고 사유를 구체적으로 입력해 주세요. (필수)"
                    className="w-full h-24 p-3 text-sm tracking-tight border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:bg-white transition-colors resize-none"
                    maxLength={200}
                  />
                  <div className="text-xs tracking-tight text-gray-400 text-right mt-1">
                    {details.length} / 200자
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 pt-0">
              <button
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
                className="w-full py-3.5 bg-red-500 text-white font-bold rounded-xl shadow-md shadow-red-500/20 disabled:opacity-50 disabled:shadow-none hover:bg-red-600 transition flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  '신고 접수하기'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
