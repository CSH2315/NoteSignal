import { useEffect, useState } from 'react';
import { X, Megaphone } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const DISMISSED_KEY = 'ns_dismissed_notice';

interface Announcement {
  id: string;
  title: string;
  message: string;
}

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const { data, error } = await supabase.rpc('get_active_announcement');
      if (error || !data || data.length === 0) return;

      const notice: Announcement = data[0];

      // LocalStorage에 저장된 무시된 공지 ID와 비교
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (dismissed === notice.id) return;

      setAnnouncement(notice);
      setVisible(true);
    };

    fetchAnnouncement();
  }, []);

  const handleDismiss = () => {
    if (announcement) {
      localStorage.setItem(DISMISSED_KEY, announcement.id);
    }
    setVisible(false);
  };

  if (!visible || !announcement) return null;

  return (
    <div className="mx-4 mb-3 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex items-start gap-3 bg-brand-50 border border-brand-200 rounded-xl px-4 py-3">
        <div className="flex-shrink-0 mt-0.5">
          <Megaphone className="w-4 h-4 text-brand-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-brand-700 leading-snug">{announcement.title}</p>
          <p className="text-xs text-brand-600 leading-relaxed mt-0.5 whitespace-pre-line">
            {announcement.message}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-0.5 text-brand-400 hover:text-brand-600 transition-colors"
          aria-label="공지 닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
