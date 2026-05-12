-- 1. UUID 및 pgcrypto (해싱) 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. 기본 테이블(Tables) 생성
-------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 초기 시즌 상태값 세팅 (하위 호환성 유지용)
INSERT INTO public.system_settings (key, status) VALUES ('season_status', 'pending')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'pre_registration', 'active', 'retention', 'completed')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 초기 가용 시즌 한 개 강제 삽입 (초기 셋업 시 1회 연출용 / 차후 대시보드 관리)
INSERT INTO public.seasons (title, start_date, end_date, status) 
SELECT '스프린트 3 (메인)', timezone('utc'::text, now()), timezone('utc'::text, now() + interval '14 days'), 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.seasons LIMIT 1);

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  login_id TEXT UNIQUE,               -- 예: ABCD-1234 (시즌 초기화 시 NULL 처리)
  pin_code TEXT,                      -- Bcrypt 해싱된 4자리 PIN 저장 (시즌 초기화 시 NULL 처리)
  gender TEXT CHECK (gender IN ('male', 'female')), -- (시즌 초기화 시 NULL 처리)
  picks_remaining INTEGER,            -- 남 2, 여 4 등 가입 시 부여 (시즌 초기화 시 NULL 처리)
  my_note_copies INTEGER NOT NULL DEFAULT 3, -- 이번 시즌 매진 횟수
  agreed_terms BOOLEAN NOT NULL DEFAULT true,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  contact_type TEXT CHECK (contact_type IN ('instagram', 'kakao')) NOT NULL,
  contact_id TEXT NOT NULL,           -- 노출용 연락처 ID
  gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
  age INTEGER,
  is_age_visible BOOLEAN NOT NULL DEFAULT true,
  mbti TEXT NOT NULL,
  ideal_type TEXT NOT NULL,
  charm TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true, -- Soft Delete 제어용
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bans (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason_type TEXT NOT NULL CHECK (reason_type IN ('욕설 및 혐오 표현', '스팸 및 도배', '음란물 및 성적 표현', '개인정보 침해', '기타')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_feed ON public.notes(is_active, gender, created_at DESC);

CREATE TABLE IF NOT EXISTS public.picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  picker_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  picked_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  picked_snapshot JSONB NOT NULL,     -- 뽑은 당시의 프로필 및 연락처 완벽 복제본 보존
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(picker_id, picked_id)        -- 같은 상대를 2번 뽑을 수 없음
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 회원가입 시 성별에 따라 기본 picks_remaining 자동 부여 (트리거)
DROP FUNCTION IF EXISTS public.set_default_picks_remaining() CASCADE;
CREATE OR REPLACE FUNCTION public.set_default_picks_remaining()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.picks_remaining IS NULL THEN
    IF NEW.gender = 'male' THEN
      NEW.picks_remaining := 2;
    ELSIF NEW.gender = 'female' THEN
      NEW.picks_remaining := 3;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_default_picks ON public.users CASCADE;
CREATE TRIGGER trg_set_default_picks
BEFORE INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_default_picks_remaining();

-- 3. 안전한 메인 피드 로드를 위한 RPC (View 대신 RPC로 RLS 우회)
-------------------------------------------------
DROP FUNCTION IF EXISTS public.get_feed_notes(TEXT, INT, INT, UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.get_feed_notes(
  p_gender TEXT, 
  p_limit INT DEFAULT 10, 
  p_offset INT DEFAULT 0,
  p_viewer_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  nickname TEXT,
  age INTEGER,
  mbti TEXT,
  charm TEXT,
  ideal_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  copies_remaining INTEGER,
  is_picked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id, 
    n.nickname, 
    (CASE WHEN n.is_age_visible THEN n.age ELSE NULL END) as age, 
    n.mbti, 
    n.charm, 
    n.ideal_type, 
    n.created_at, 
    u.my_note_copies as copies_remaining,
    (CASE 
      WHEN p_viewer_id IS NOT NULL THEN 
        EXISTS(SELECT 1 FROM public.picks p WHERE p.picker_id = p_viewer_id AND p.picked_id = n.user_id)
      ELSE false
    END) as is_picked
  FROM public.notes n
  JOIN public.users u ON n.user_id = u.id
  LEFT JOIN public.bans b ON n.user_id = b.user_id
  WHERE n.is_active = true 
    AND u.my_note_copies > 0
    AND n.gender = p_gender
    AND (b.is_banned IS NULL OR b.is_banned = false)
  ORDER BY n.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- 4. Race Condition을 완벽히 방어하는 쪽지 다중 선택 RPC 함수
-------------------------------------------------
DROP FUNCTION IF EXISTS public.execute_picks(UUID[], UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.execute_picks(p_note_ids UUID[], p_picker_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_picker_id UUID := p_picker_id;   -- 커스텀 인증 기반이므로 파라미터로 받음
  v_picker_gender TEXT;
  v_picks_remaining INT;
  v_note_id UUID;
  v_picked_user_id UUID;
  v_my_note_copies INT;
  v_note_record RECORD;
  v_success_count INT := 0;
  v_results JSONB := '[]'::JSONB;
BEGIN
  IF v_picker_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Picker Row Lock 획득 (중복 API 요청에 의한 뽑기 횟수 마이너스 방어)
  SELECT gender, picks_remaining INTO v_picker_gender, v_picks_remaining
  FROM public.users
  WHERE id = v_picker_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Picker not found';
  END IF;

  FOREACH v_note_id IN ARRAY p_note_ids
  LOOP
    IF v_picks_remaining <= 0 THEN
      v_results := v_results || jsonb_build_object('note_id', v_note_id, 'status', 'failed', 'reason', '남은 기회 부족');
      CONTINUE;
    END IF;

    -- Note Row Lock 획득 (해당 쪽지를 누군가 동시에 수정/삭제/선택 하는 것 차단)
    SELECT * INTO v_note_record
    FROM public.notes
    WHERE id = v_note_id AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
      v_results := v_results || jsonb_build_object('note_id', v_note_id, 'status', 'failed', 'reason', '이미 삭제된 쪽지예요');
      CONTINUE;
    END IF;
    
    v_picked_user_id := v_note_record.user_id;

    -- 성별 방어
    IF v_note_record.gender = v_picker_gender THEN
       v_results := v_results || jsonb_build_object('note_id', v_note_id, 'status', 'failed', 'reason', '같은 성별은 선택 불가능합니다');
       CONTINUE;
    END IF;

    -- 중복 픽 방어
    IF EXISTS (SELECT 1 FROM public.picks WHERE picker_id = v_picker_id AND picked_id = v_picked_user_id) THEN
      v_results := v_results || jsonb_build_object('note_id', v_note_id, 'status', 'failed', 'reason', '이미 선택한 대상입니다');
      CONTINUE;
    END IF;

    -- Picked User Row Lock 획득 (가져갈 쪽지의 수량 방어)
    SELECT my_note_copies INTO v_my_note_copies
    FROM public.users
    WHERE id = v_picked_user_id
    FOR UPDATE;

    IF v_my_note_copies <= 0 THEN
      v_results := v_results || jsonb_build_object('note_id', v_note_id, 'status', 'failed', 'reason', '다른 분이 한 발 먼저 쟁취했어요');
      CONTINUE;
    END IF;

    -- == 상태 갱신 (Update) ==
    UPDATE public.users SET my_note_copies = my_note_copies - 1 WHERE id = v_picked_user_id;
    UPDATE public.users SET picks_remaining = picks_remaining - 1 WHERE id = v_picker_id;
    v_picks_remaining := v_picks_remaining - 1;

    -- == 삽입 (Insert) == 
    -- 1. 영구 스냅샷 기록 (연락처 포함 전체 정보)
    INSERT INTO public.picks (picker_id, picked_id, picked_snapshot)
    VALUES (v_picker_id, v_picked_user_id, row_to_json(v_note_record)::JSONB);

    -- 2. 해당 유저에게 알림 전송 (Realtime / 인앱 피드백 용)
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
      v_picked_user_id, 
      'picked_me', 
      '누군가 당신의 매력을 발견했어요!', 
      '보관함에 등록된 쪽지가 1장 인출되었습니다.'
    );

    v_success_count := v_success_count + 1;
    v_results := v_results || jsonb_build_object('note_id', v_note_id, 'status', 'success', 'reason', '쪽지 선택 완료');
  END LOOP;

  -- 안전하게 차감되고 수행된 최종 결과 묶음을 통째로 return
  RETURN jsonb_build_object('success_count', v_success_count, 'results', v_results);
END;
$$;

-- 5. RLS (Row Level Security) 강력 활성화
-------------------------------------------------
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 전역/익명 및 기본 보안 정책 세팅
DROP POLICY IF EXISTS "Enable Read Access for Anyone" ON public.system_settings CASCADE;
CREATE POLICY "Enable Read Access for Anyone" ON public.system_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view seasons" ON public.seasons CASCADE;
CREATE POLICY "Anyone can view seasons" ON public.seasons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view bans" ON public.bans CASCADE;
CREATE POLICY "Anyone can view bans" ON public.bans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage seasons" ON public.seasons CASCADE;
CREATE POLICY "Admins can manage seasons" ON public.seasons USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage bans" ON public.bans CASCADE;
CREATE POLICY "Admins can manage bans" ON public.bans USING (auth.role() = 'authenticated');

-- [NEW] Realtime 활성화를 위해 publication에 등록
-- 등록 전 이미 존재하는지 확인하는 안전한 구문 활용
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'seasons'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.seasons;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'bans'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bans;
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    -- 만약 supabase_realtime publication이 없다면 생성하고 추가 (로컬 등 엣지케이스)
    CREATE PUBLICATION supabase_realtime FOR TABLE public.seasons, public.bans;
END
$$;

-- API를 통한 DB 직접 조회 방어: Custom Auth를 사용하므로 auth.uid()를 사용할 수 없음
-- 따라서 테이블에 대한 직접적인 SELECT/INSERT/UPDATE/DELETE는 기본적으로 모두 차단 (기본 Deny).
-- 오직 SECURITY DEFINER가 설정된 RPC(get_feed_notes, get_my_picks, execute_picks 등)를 통해서만 데이터에 접근 가능합니다.

-- 6. 기타 Custom Auth 조회용 RPC
-------------------------------------------------
DROP FUNCTION IF EXISTS public.get_my_picks(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.get_my_picks(p_picker_id UUID)
RETURNS TABLE (
  id UUID,
  picked_snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.picked_snapshot, p.created_at
  FROM public.picks p
  WHERE p.picker_id = p_picker_id
  ORDER BY p.created_at DESC;
END;
$$;
-- 7. 내 프로필 조회를 위한 RPC
-------------------------------------------------
DROP FUNCTION IF EXISTS public.get_my_profile(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.get_my_profile(p_user_id UUID)
RETURNS TABLE (
  nickname TEXT,
  contact_type TEXT,
  contact_id TEXT,
  gender TEXT,
  age INTEGER,
  is_age_visible BOOLEAN,
  mbti TEXT,
  ideal_type TEXT,
  charm TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.nickname, 
    n.contact_type, 
    n.contact_id, 
    n.gender, 
    n.age, 
    n.is_age_visible, 
    n.mbti, 
    n.ideal_type, 
    n.charm
  FROM public.notes n
  WHERE n.user_id = p_user_id AND n.is_active = true;
END;
$$;

-- 8. 내 프로필 삭제(Soft Delete)를 위한 RPC
-------------------------------------------------
DROP FUNCTION IF EXISTS public.delete_my_profile(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.delete_my_profile(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notes 
  SET is_active = false, updated_at = timezone('utc'::text, now())
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', '삭제할 프로필이 없습니다.');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 9. 내 프로필 수정을 위한 RPC
-------------------------------------------------
DROP FUNCTION IF EXISTS public.update_my_profile(UUID, TEXT, INTEGER, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;
CREATE OR REPLACE FUNCTION public.update_my_profile(
  p_user_id UUID,
  p_nickname TEXT,
  p_age INTEGER,
  p_is_age_visible BOOLEAN,
  p_contact_type TEXT,
  p_contact_id TEXT,
  p_mbti TEXT,
  p_charm TEXT,
  p_ideal_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notes 
  SET 
    nickname = p_nickname,
    age = p_age,
    is_age_visible = p_is_age_visible,
    contact_type = p_contact_type,
    contact_id = p_contact_id,
    mbti = p_mbti,
    charm = p_charm,
    ideal_type = p_ideal_type,
    updated_at = timezone('utc'::text, now())
  WHERE user_id = p_user_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', '수정할 프로필이 없거나 이미 삭제되었습니다.');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;


-- 10. 내 알림 조회를 위한 RPC (최근 14일치)
-------------------------------------------------
DROP FUNCTION IF EXISTS public.get_my_notifications(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.get_my_notifications(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  message TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id, 
    n.type, 
    n.title, 
    n.message, 
    n.is_read, 
    n.created_at
  FROM public.notifications n
  WHERE n.user_id = p_user_id 
    AND n.created_at >= (timezone('utc'::text, now()) - interval '14 days')
  ORDER BY n.created_at DESC;
END;
$$;

-- 11. 알림 읽음 처리를 위한 RPC
-------------------------------------------------
DROP FUNCTION IF EXISTS public.mark_notifications_as_read(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.mark_notifications_as_read(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true
  WHERE user_id = p_user_id AND is_read = false;
END;
$$;

-- 12. 유저 상태 검증 및 동기화 (Zombie Session Protection)
-------------------------------------------------
DROP FUNCTION IF EXISTS public.get_user_status(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.get_user_status(p_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_is_active BOOLEAN;
  v_is_banned BOOLEAN := false;
  v_season_status TEXT;
BEGIN
  -- 현재 라이프사이클 최상위 시즌 읽기 (종료가 아닌 가장 최신 생성 시즌 판별)
  SELECT status INTO v_season_status 
  FROM public.seasons 
  WHERE status != 'completed' 
  ORDER BY created_at DESC 
  LIMIT 1;

  IF v_season_status IS NULL THEN
     v_season_status := 'completed'; -- 만약 진행중인 시즌이 아예 아무것도 없으면 닫힌 것으로 간주
  END IF;

  SELECT picks_remaining, my_note_copies INTO v_user FROM public.users WHERE id = p_uuid;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('is_active', false, 'season_status', v_season_status);
  END IF;

  SELECT is_active INTO v_is_active FROM public.notes WHERE user_id = p_uuid;
  
  IF NOT FOUND OR v_is_active = false THEN
    RETURN jsonb_build_object('is_active', false, 'season_status', v_season_status);
  END IF;

  -- 밴 여부 확인
  SELECT is_banned INTO v_is_banned FROM public.bans WHERE user_id = p_uuid;
  IF v_is_banned IS NULL THEN
    v_is_banned := false;
  END IF;

  RETURN jsonb_build_object(
    'is_active', true,
    'season_status', v_season_status,
    'is_banned', v_is_banned,
    'picks_remaining', v_user.picks_remaining,
    'my_note_copies', v_user.my_note_copies,
    'has_unread_notifications', EXISTS(SELECT 1 FROM public.notifications WHERE user_id = p_uuid AND is_read = false)
  );
END;
$$;

-- 13. 신고 및 제재 처리를 위한 RPC (Phase 3)
-------------------------------------------------
DROP FUNCTION IF EXISTS public.submit_report(UUID, UUID, TEXT, TEXT) CASCADE;
CREATE OR REPLACE FUNCTION public.submit_report(
  p_reporter_id UUID,
  p_note_id UUID,
  p_reason_type TEXT,
  p_details TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reported_user_id UUID;
BEGIN
  -- 1. 쪽지 작성자 찾기
  SELECT user_id INTO v_reported_user_id
  FROM public.notes
  WHERE id = p_note_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', '존재하지 않거나 삭제된 쪽지입니다.');
  END IF;

  -- 2. 자기 자신 신고 방지
  IF v_reported_user_id = p_reporter_id THEN
    RETURN jsonb_build_object('success', false, 'reason', '자신의 쪽지는 신고할 수 없습니다.');
  END IF;

  -- 3. 중복 신고 방지
  IF EXISTS (
    SELECT 1 FROM public.reports 
    WHERE reporter_id = p_reporter_id AND reported_note_id = p_note_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'reason', '이미 신고한 쪽지입니다.');
  END IF;

  -- 4. 신고 삽입
  INSERT INTO public.reports (reporter_id, reported_note_id, reported_user_id, reason_type, details)
  VALUES (p_reporter_id, p_note_id, v_reported_user_id, p_reason_type, p_details);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 14. 신규 쪽지 등록 여부 확인용 RPC (폴링 최적화)
-------------------------------------------------
DROP FUNCTION IF EXISTS public.check_new_notes_exist(TEXT, TIMESTAMP WITH TIME ZONE) CASCADE;
CREATE OR REPLACE FUNCTION public.check_new_notes_exist(
  p_target_gender TEXT,
  p_last_timestamp TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  -- 대상 성별의 쪽지 중 입력된 시간보다 더 최근에 등록된 활성 쪽지가 1개라도 있는지 초고속 검사
  SELECT EXISTS(
    SELECT 1 FROM public.notes 
    WHERE gender = p_target_gender 
      AND is_active = true 
      AND created_at > p_last_timestamp
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$;

-- 15. 공지사항(Announcements) 테이블 및 조회 RPC
-------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view announcements" ON public.announcements CASCADE;
CREATE POLICY "Anyone can view announcements" ON public.announcements FOR SELECT USING (true);

-- 활성 공지 1개를 조회하는 RPC (is_active=true 중 가장 최신)
DROP FUNCTION IF EXISTS public.get_active_announcement() CASCADE;
CREATE OR REPLACE FUNCTION public.get_active_announcement()
RETURNS TABLE (id UUID, title TEXT, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.title, a.message
  FROM public.announcements a
  WHERE a.is_active = true
  ORDER BY a.created_at DESC
  LIMIT 1;
END;
$$;
