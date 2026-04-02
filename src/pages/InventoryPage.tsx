import { Box, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InventoryNoteCard } from '@/components/inventory/InventoryNoteCard';

export interface InventoryNoteItem {
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

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/useUserStore';

type PickRecord = {
  id: string;
  picked_snapshot: any;
  created_at: string;
};

export default function InventoryPage() {
  const navigate = useNavigate();
  const { uuid } = useUserStore();
  const [myPickedNotes, setMyPickedNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      if (!uuid) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .rpc('get_my_picks', {
            p_picker_id: uuid
          });

        if (error) throw error;
        
        if (data) {
          // JSONB 스냅샷 원본 데이터를 꺼내서 컴포넌트 프롭스 규격에 맞게 매핑
          const formatted = data.map((d: PickRecord) => {
            const snap: any = d.picked_snapshot;
            return {
              id: d.id, // picks table ID
              nickname: snap.nickname,
              age: snap.is_age_visible ? snap.age : null,
              mbti: snap.mbti,
              charm: snap.charm,
              idealType: snap.ideal_type,
              contactType: snap.contact_type,
              contactId: snap.contact_id,
              pickedAt: d.created_at,
            };
          });
          setMyPickedNotes(formatted);
        }
      } catch (err) {
        console.error('Failed to load inventory', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, [uuid]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
        {myPickedNotes.map((note: InventoryNoteItem) => (
          <InventoryNoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
