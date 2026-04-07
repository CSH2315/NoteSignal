import { CheckCircle2, Siren } from 'lucide-react';

export interface NoteItem {
  id: string;
  nickname: string;
  age: number | null; // null if hidden
  mbti: string;
  charm: string;
  idealType: string;
  copiesRemaining: number;
  isPicked?: boolean;
}

interface NoteCardProps {
  note: NoteItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onReport: (id: string) => void;
}

export function NoteCard({ note, isSelected, onSelect, onReport }: NoteCardProps) {
  return (
    <div 
      onClick={() => { if (!note.isPicked) onSelect(note.id); }}
      className={`relative w-full rounded-3xl p-5 cursor-pointer transition-all duration-300 break-inside-avoid shadow-sm
        ${note.isPicked 
          ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
          : isSelected 
            ? 'bg-brand-50 border-2 border-brand-500 scale-[0.98]' 
            : 'bg-white border border-gray-100 hover:shadow-md hover:-translate-y-1'
        }
      `}
      style={{ marginBottom: '1rem' }}
    >
      {/* Checkbox Icon */}
      {isSelected && (
        <div className="absolute top-4 right-4 text-brand-500 animate-in zoom-in duration-200">
          <CheckCircle2 className="w-6 h-6 fill-brand-100" />
        </div>
      )}

      {/* Header (Nickname, Age, MBTI) */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-1 pr-6">
          <span className="font-extrabold text-gray-900 text-lg leading-tight">
            {note.nickname}
          </span>
          {note.age && (
            <span className="text-sm font-semibold text-gray-400">
              {note.age}세
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-lg uppercase tracking-wider ${note.isPicked ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
            {note.mbti}
          </span>
          {note.isPicked ? (
            <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-500 text-xs font-bold rounded-lg tracking-wider">
              이미 선택함
            </span>
          ) : (
            <span className="inline-block px-2 py-0.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg tracking-wider">
              남은 쪽지: {note.copiesRemaining}장
            </span>
          )}
        </div>
      </div>

      {/* Body: Charm & Ideal Type */}
      <div className="space-y-4">
        <div>
          <span className="block text-xs font-bold text-gray-400 mb-1">자신의 매력</span>
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
            {note.charm}
          </p>
        </div>
        
        <div>
          <span className="block text-xs font-bold text-gray-400 mb-1">이상형</span>
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
            {note.idealType}
          </p>
        </div>
      </div>

      {/* Report Icon - Stops event propagation to prevent toggling the card */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onReport(note.id);
        }}
        className="absolute bottom-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors z-10"
        aria-label="쪽지 신고하기"
      >
        <Siren className="w-5 h-5" />
      </button>
    </div>
  );
}
