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

-- 초기 시즌 상태값 세팅
INSERT INTO public.system_settings (key, status) VALUES ('season_status', 'pending')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  login_id TEXT UNIQUE,               -- 예: ABCD-1234 (시즌 초기화 시 NULL 처리)
  pin_code TEXT,                      -- Bcrypt 해싱된 4자리 PIN 저장 (시즌 초기화 시 NULL 처리)
  gender TEXT CHECK (gender IN ('male', 'female')), -- (시즌 초기화 시 NULL 처리)
  picks_remaining INTEGER,            -- 남 2, 여 4 등 가입 시 부여 (시즌 초기화 시 NULL 처리)
  my_note_copies INTEGER NOT NULL DEFAULT 2, -- 이번 시즌 매진 횟수
  agreed_terms BOOLEAN NOT NULL DEFAULT true,
  agreed_marketing BOOLEAN NOT NULL DEFAULT false,
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
      NEW.picks_remaining := 4;
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
  WHERE n.is_active = true 
    AND u.my_note_copies > 0
    AND n.gender = p_gender
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

-- 전역/익명 및 기본 보안 정책 세팅
DROP POLICY IF EXISTS "Enable Read Access for Anyone" ON public.system_settings CASCADE;
CREATE POLICY "Enable Read Access for Anyone" ON public.system_settings FOR SELECT USING (true);

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
BEGIN
  SELECT picks_remaining, my_note_copies INTO v_user FROM public.users WHERE id = p_uuid;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('is_active', false);
  END IF;

  SELECT is_active INTO v_is_active FROM public.notes WHERE user_id = p_uuid;
  
  IF NOT FOUND OR v_is_active = false THEN
    RETURN jsonb_build_object('is_active', false);
  END IF;

  RETURN jsonb_build_object(
    'is_active', true,
    'picks_remaining', v_user.picks_remaining,
    'my_note_copies', v_user.my_note_copies
  );
END;
$$;
