import { Instagram, MessageCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface InventoryNoteItem {
  id: string;
  nickname: string;
  age: number | null;
  mbti: string;
  charm: string;
  idealType: string;
  contactType: 'instagram' | 'kakao';
  contactId: string;
  pickedAt: string;
}

export function InventoryNoteCard({ note }: { note: InventoryNoteItem }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(note.contactId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInsta = note.contactType === 'instagram';

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Decorative background accent for the contact type */}
      <div 
        className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -translate-y-10 translate-x-10 
          ${isInsta ? 'bg-pink-500' : 'bg-yellow-400'}`} 
      />

      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Row 1: Profile header & Action */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-extrabold text-gray-900 text-lg leading-tight">
                {note.nickname}
              </span>
              {note.age && (
                <span className="text-sm font-semibold text-gray-400">
                  {note.age}세
                </span>
              )}
            </div>
            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg uppercase tracking-wider">
              {note.mbti}
            </span>
          </div>

          {/* Contact Copy Action Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 rounded-full text-xs py-1.5 px-3 font-bold shrink-0 transition-colors
              ${isInsta 
                ? 'bg-pink-50 text-pink-600 hover:bg-pink-100' 
                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
              }`}
            aria-label="연락처 복사하기"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>복사됨</span>
              </>
            ) : (
              <>
                {isInsta ? <Instagram className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
                <span className="tracking-wide">{note.contactId}</span>
                <Copy className="w-3 h-3 ml-0.5" />
              </>
            )}
          </button>
        </div>

        {/* Row 2: Charms & Ideals (Reduced visual weight since contact is priority) */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100/50">
            <span className="block text-[10px] font-bold text-gray-400 mb-1">자신의 매력</span>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              {note.charm}
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100/50">
            <span className="block text-[10px] font-bold text-gray-400 mb-1">이상형</span>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              {note.idealType}
            </p>
          </div>
        </div>

        {/* Timestamp */}
        <div className="mt-4 text-right">
          <span className="text-[10px] font-medium text-gray-300">
            {new Date(note.pickedAt).toLocaleDateString()} 선택됨
          </span>
        </div>
      </div>
    </div>
  );
}
