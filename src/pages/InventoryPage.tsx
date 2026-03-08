import { Box, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InventoryNoteCard } from '@/components/inventory/InventoryNoteCard';

// === 임시 데이터 타입 및 목업 ===
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

const MOCK_INVENTORY_NOTES: InventoryNoteItem[] = [
  {
    id: `i_1`,
    nickname: `훈훈한사람`,
    age: 24,
    mbti: 'ENFJ',
    charm: '웃는 상이고 항상 주변을 잘 챙겨줍니다. 이야기를 잘 들어줘서 편안하다는 소리를 많이 들어요.',
    idealType: '대화가 잘 통하고 밝은 성격이었으면 좋겠습니다. 같이 맛집 다니는 걸 좋아해요.',
    contactType: 'instagram',
    contactId: 'hunhun_smile',
    pickedAt: '2026-03-04T10:00:00Z',
  },
  {
    id: `i_2`,
    nickname: `다정한고양이`,
    age: null,
    mbti: 'ISTP',
    charm: '요리를 잘하고 책임감이 강합니다.',
    idealType: '기본적인 예의가 바른 사람, 같이 있을 때 배울 점이 많은 사람이 이상형입니다.',
    contactType: 'kakao',
    contactId: 'cat_lover_99',
    pickedAt: '2026-03-04T11:30:00Z',
  }
];
// =================================

export default function InventoryPage() {
  const navigate = useNavigate();
  // TODO: 실제로는 DB에서 내가 '선택한(picked)' 상대방들의 쪽지(+연락처)를 모두 가져와야 합니다.
  const myPickedNotes = MOCK_INVENTORY_NOTES;

  if (myPickedNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Box className="w-8 h-8 text-gray-400 stroke-2" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">당신의 보관함이 비어있어요</h2>
        <p className="text-gray-500 mb-8 max-w-[280px]">
          메인 피드에서 당신의 마음을 이끄는 매력적인 쪽지를 골라보세요.
        </p>
        <button
          onClick={() => navigate('/feed')}
          className="w-full max-w-[240px] py-4 bg-brand-500 text-white font-bold rounded-2xl shadow-lg hover:bg-brand-600 transition"
        >
          쪽지 찾으러 가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe pt-4 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 px-1 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">내 쪽지 보관함</h1>
          <p className="text-gray-500 text-sm mt-1">내가 선택했던 소중한 인연들이에요.</p>
        </div>
        <button 
          onClick={() => navigate('/feed')}
          className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow text-gray-400 hover:text-brand-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {myPickedNotes.map((note) => (
          <InventoryNoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
