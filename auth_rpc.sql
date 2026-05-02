-- ==========================================================
-- 1. IP 기반 Rate Limiting & Sliding Window 로그 테이블
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.ip_rate_limits (
  ip_address TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  locked_until TIMESTAMP WITH TIME ZONE,
  register_locked_until TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.register_logs (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_register_logs_ip ON public.register_logs(ip_address, created_at);

-- RLS 활성화 (직접 접근 차단)
ALTER TABLE public.ip_rate_limits ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- 2. 로그인 검증 RPC (IP Rate Limiting + 계정 잠금 + Timing Attack 방어)
-- ==========================================================
DROP FUNCTION IF EXISTS public.verify_login(TEXT, TEXT) CASCADE;
CREATE OR REPLACE FUNCTION public.verify_login(p_login_id TEXT, p_pin_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_ip TEXT;
  v_headers JSONB;
  v_ip_record RECORD;
  v_user_record RECORD;
  v_dummy_hash TEXT := '$2a$06$wI.2e./5Nn6NRe8lV.H2b.n9a2hR/M0g7oM8A.n7r8l0D9u/O5s7q'; -- Timing attack 방어 (고정 해시값 사용)
  v_is_valid_pin BOOLEAN;
  v_is_active BOOLEAN := false;
  v_is_banned BOOLEAN := false;
  v_season_status TEXT;
  v_now TIMESTAMP WITH TIME ZONE := timezone('utc'::text, now());
BEGIN
  -- 클라이언트 IP 추출 (Supabase API Gateway의 헤더 사용)
  BEGIN
    v_headers := current_setting('request.headers', true)::JSONB;
    v_client_ip := v_headers->>'x-forwarded-for';
    IF v_client_ip IS NULL THEN
      v_client_ip := 'unknown';
    ELSE
      v_client_ip := split_part(v_client_ip, ',', 1);
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_client_ip := 'unknown';
  END;

  -- 1. IP 락(Lock) 확인
  SELECT * INTO v_ip_record FROM public.ip_rate_limits WHERE ip_address = v_client_ip FOR UPDATE;
  IF FOUND THEN
    IF v_ip_record.locked_until IS NOT NULL AND v_ip_record.locked_until > v_now THEN
       -- Timing Attack 방어를 위해 무의미한 해시 연산을 한 번 돌림 (시간 딜레이 맞춤)
       PERFORM crypt(p_pin_code, v_dummy_hash);
       RETURN jsonb_build_object('success', false, 'reason', '비정상적인 로그인 시도로 IP가 차단되었습니다. ' || CEIL(EXTRACT(EPOCH FROM (v_ip_record.locked_until - v_now)) / 60) || '분 후 다시 시도해주세요.');
    END IF;
    -- 1분이 지났으면 (잠기지 않은 상태에서) 연속 시도 횟수 초기화
    IF v_ip_record.last_attempt_at < v_now - interval '1 minute' THEN
       UPDATE public.ip_rate_limits SET attempts = 0, locked_until = NULL, last_attempt_at = v_now WHERE ip_address = v_client_ip;
       v_ip_record.attempts := 0;
       v_ip_record.last_attempt_at := v_now;
    END IF;
  ELSE
    INSERT INTO public.ip_rate_limits (ip_address, attempts, last_attempt_at) VALUES (v_client_ip, 0, v_now);
    v_ip_record.attempts := 0;
    v_ip_record.locked_until := NULL;
  END IF;

  -- 2. 사용자 계정 조회
  SELECT * INTO v_user_record FROM public.users WHERE login_id = p_login_id FOR UPDATE;

  -- 3. 계정 단위 락(Lock) 확인 (ID가 존재할 때만)
  IF FOUND THEN
    IF v_user_record.locked_until IS NOT NULL AND v_user_record.locked_until > v_now THEN
       PERFORM crypt(p_pin_code, v_dummy_hash);
       RETURN jsonb_build_object('success', false, 'reason', '연속된 로그인 실패로 계정이 잠겼습니다. ' || CEIL(EXTRACT(EPOCH FROM (v_user_record.locked_until - v_now)) / 60) || '분 후 다시 시도해주세요.');
    END IF;
  END IF;

  -- 4. PIN 번호 정합성 검증
  IF FOUND AND v_user_record.pin_code IS NOT NULL THEN
    v_is_valid_pin := (v_user_record.pin_code = crypt(p_pin_code, v_user_record.pin_code));
  ELSE
    PERFORM crypt(p_pin_code, v_dummy_hash);
    v_is_valid_pin := false;
  END IF;

  -- 5. 판정 및 후속 조치
  IF v_is_valid_pin THEN
    -- IP/계정 카운트 전부 초기화
    UPDATE public.ip_rate_limits SET attempts = 0, locked_until = NULL, last_attempt_at = v_now WHERE ip_address = v_client_ip;
    UPDATE public.users SET failed_login_attempts = 0, locked_until = NULL WHERE id = v_user_record.id;
    
    -- 쪽지 생존 상태 확인
    SELECT is_active INTO v_is_active FROM public.notes WHERE user_id = v_user_record.id;
    
    -- 현재 활성화된(종료가 아닌 최신) 시즌 상태 추출
    SELECT status INTO v_season_status 
    FROM public.seasons 
    WHERE status != 'completed' 
    ORDER BY created_at DESC 
    LIMIT 1;

    IF v_season_status IS NULL THEN
      v_season_status := 'completed';
    END IF;
    
    -- 밴 여부 확인
    SELECT is_banned INTO v_is_banned FROM public.bans WHERE user_id = v_user_record.id;
    IF v_is_banned IS NULL THEN
      v_is_banned := false;
    END IF;
    
    IF v_is_active IS NULL OR v_is_active = false THEN
      -- 쪽지 삭제 유저 또는 쪽지 데이터가 없는 유저 -> 재등록 권유 데이터 반환
      RETURN jsonb_build_object(
        'success', false, 
        'needs_reregistration', true, 
        'user_id', v_user_record.id,
        'login_id', v_user_record.login_id,
        'gender', v_user_record.gender,
        'reason', '쪽지 삭제 처리된 계정입니다. 해당 복구 코드로 쪽지를 재등록하시겠습니까?'
      );
    ELSE
      -- 정상 로그인
      RETURN jsonb_build_object(
        'success', true, 
        'user_id', v_user_record.id, 
        'gender', v_user_record.gender, 
        'season_status', v_season_status,
        'is_banned', v_is_banned,
        'picks_remaining', v_user_record.picks_remaining,
        'my_note_copies', v_user_record.my_note_copies
      );
    END IF;
  ELSE
    -- 로그인 실패 조치
    UPDATE public.ip_rate_limits 
    SET attempts = attempts + 1, last_attempt_at = v_now,
        locked_until = CASE WHEN attempts + 1 >= 5 THEN v_now + interval '10 minutes' ELSE NULL END
    WHERE ip_address = v_client_ip;

    IF FOUND THEN
      UPDATE public.users 
      SET failed_login_attempts = failed_login_attempts + 1,
          locked_until = CASE WHEN failed_login_attempts + 1 >= 5 THEN v_now + interval '10 minutes' ELSE NULL END
      WHERE id = v_user_record.id;
    END IF;

    RETURN jsonb_build_object('success', false, 'reason', '복구 아이디 또는 4자리 PIN 번호가 올바르지 않습니다.');
  END IF;
END;
$$;


-- ==========================================================
-- 3. 회원가입 및 쪽지 등록 원자적 처리 (프론트에서 평문 던지면 여기서 Hashing)
-- ==========================================================
DROP FUNCTION IF EXISTS public.register_note(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, INTEGER, BOOLEAN, TEXT, TEXT, TEXT) CASCADE; -- Drop old signature
DROP FUNCTION IF EXISTS public.register_note(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, BOOLEAN, TEXT, TEXT, TEXT) CASCADE; -- Drop new signature
CREATE OR REPLACE FUNCTION public.register_note(
  p_login_id TEXT,
  p_pin_code TEXT,
  p_gender TEXT,
  p_nickname TEXT,
  p_contact_type TEXT,
  p_contact_id TEXT,
  p_age INTEGER,
  p_is_age_visible BOOLEAN,
  p_mbti TEXT,
  p_ideal_type TEXT,
  p_charm TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_hashed_pin TEXT;
  v_client_ip TEXT;
  v_headers JSONB;
  v_locked_until TIMESTAMP WITH TIME ZONE;
  v_recent_attempts INTEGER;
BEGIN
  -- 클라이언트 IP 추출
  BEGIN
    v_headers := current_setting('request.headers', true)::JSONB;
    v_client_ip := v_headers->>'x-forwarded-for';
    IF v_client_ip IS NULL THEN v_client_ip := 'unknown';
    ELSE v_client_ip := split_part(v_client_ip, ',', 1); END IF;
  EXCEPTION WHEN OTHERS THEN v_client_ip := 'unknown';
  END;

  -- 1️⃣ IP 차단 상태 확인
  SELECT register_locked_until INTO v_locked_until 
  FROM public.ip_rate_limits 
  WHERE ip_address = v_client_ip;
  
  IF FOUND AND v_locked_until > now() THEN
     RETURN jsonb_build_object('success', false, 'reason', '비정상적인 가입 시도가 너무 많아 30분 동안 가입이 제한되었습니다.');
  END IF;

  -- 2️⃣ 최근 10분 내 가입 시도 횟수 확인 (Sliding Window)
  SELECT count(*) INTO v_recent_attempts
  FROM public.register_logs
  WHERE ip_address = v_client_ip 
    AND created_at > now() - interval '10 minutes';

  IF v_recent_attempts >= 10 THEN
     -- 10회 초과 시 락 걸기 (30분)
     INSERT INTO public.ip_rate_limits (ip_address, attempts, register_locked_until)
     VALUES (v_client_ip, 0, now() + interval '30 minutes')
     ON CONFLICT (ip_address) DO UPDATE SET register_locked_until = now() + interval '30 minutes';
     
     RETURN jsonb_build_object('success', false, 'reason', '가입 시도 횟수 초과로 30분간 가입이 차단되었습니다.');
  END IF;

  -- 3️⃣ 시도 기록 적재
  INSERT INTO public.register_logs (ip_address) VALUES (v_client_ip);

  -- 4️⃣ 원본 가입 로직 수행
  v_hashed_pin := crypt(p_pin_code, gen_salt('bf'));
  
  INSERT INTO public.users (
    login_id, pin_code, gender, agreed_terms
  ) VALUES (
    p_login_id, v_hashed_pin, p_gender, true
  ) RETURNING id INTO v_user_id;

  INSERT INTO public.notes (
    user_id, nickname, contact_type, contact_id, gender, 
    age, is_age_visible, mbti, ideal_type, charm
  ) VALUES (
    v_user_id, p_nickname, p_contact_type, p_contact_id, p_gender,
    p_age, p_is_age_visible, p_mbti, p_ideal_type, p_charm
  );

  RETURN jsonb_build_object('success', true, 'user_id', v_user_id);
END;
$$;


-- ==========================================================
-- 3-1. 기존 유저 쪽지 복구 (Restore Note)
-- ==========================================================
DROP FUNCTION IF EXISTS public.restore_note(UUID, TEXT, TEXT, TEXT, INTEGER, BOOLEAN, TEXT, TEXT, TEXT) CASCADE;
CREATE OR REPLACE FUNCTION public.restore_note(
  p_user_id UUID,
  p_nickname TEXT,
  p_contact_type TEXT,
  p_contact_id TEXT,
  p_age INTEGER,
  p_is_age_visible BOOLEAN,
  p_mbti TEXT,
  p_ideal_type TEXT,
  p_charm TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_record RECORD;
BEGIN
  -- 유저 정보 조회
  SELECT * INTO v_user_record FROM public.users WHERE id = p_user_id;

  -- 쪽지를 다시 활성화(is_active = true)하고 내용 덮어쓰기
  UPDATE public.notes 
  SET 
    nickname = p_nickname,
    contact_type = p_contact_type,
    contact_id = p_contact_id,
    age = p_age,
    is_age_visible = p_is_age_visible,
    mbti = p_mbti,
    ideal_type = p_ideal_type,
    charm = p_charm,
    is_active = true,
    updated_at = timezone('utc'::text, now())
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.notes (
      user_id, nickname, contact_type, contact_id, gender, 
      age, is_age_visible, mbti, ideal_type, charm
    ) VALUES (
      p_user_id, p_nickname, p_contact_type, p_contact_id, v_user_record.gender,
      p_age, p_is_age_visible, p_mbti, p_ideal_type, p_charm
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_record.id,
    'gender', v_user_record.gender,
    'picks_remaining', v_user_record.picks_remaining,
    'my_note_copies', v_user_record.my_note_copies
  );
END;
$$;



