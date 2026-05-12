# NoteSignal 💌

> **20대를 위한 익명 쪽지 소개팅 서비스**
>
> 쪽지 하나로 나를 표현하고, 마음에 드는 쪽지를 뽑아 인연을 만들어 보세요.

[![Vercel](https://img.shields.io/badge/Vercel-배포됨-black?logo=vercel)](https://notesignal.vercel.app)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com)

---

## 📖 서비스 소개

NoteSignal은 간단한 **쪽지(노트) 하나로 소개팅을 시작**하는 서비스입니다.

- 자신의 매력과 이상형을 담은 쪽지를 등록합니다.
- 피드에서 마음에 드는 쪽지를 뽑으면, 상대방의 연락처가 공개됩니다.
- 내 쪽지가 누군가에게 선택되면 실시간 알림을 받습니다.
- 시즌제로 운영되며, 매 시즌마다 새로운 인연을 만날 수 있습니다.

---

## 🛠 기술 스택

| 분류           | 기술                                   |
| -------------- | -------------------------------------- |
| **프레임워크** | React 18 + Vite 5                      |
| **언어**       | TypeScript                             |
| **스타일링**   | Tailwind CSS v3                        |
| **백엔드/DB**  | Supabase (PostgreSQL + Realtime + RLS) |
| **상태관리**   | Zustand (with `persist` 미들웨어)      |
| **폼 검증**    | react-hook-form + Zod                  |
| **라우팅**     | React Router DOM v6                    |
| **알림**       | react-hot-toast                        |
| **아이콘**     | lucide-react                           |
| **배포**       | Vercel                                 |

---

## ✨ 주요 기능

- **익명 쪽지 등록**: 닉네임, 나이, MBTI, 매력, 이상형, 연락처를 담은 쪽지 작성
- **시즌제 피드**: 반대 성별의 쪽지를 무한 스크롤로 탐색
- **픽(Pick) 시스템**: 마음에 드는 쪽지를 선택하면 연락처 공개 (남성 2회, 여성 3회 기회)
- **실시간 알림**: 내 쪽지가 선택되면 즉시 알림 배지 + 팝업 (Supabase Realtime)
- **복구 코드 인증**: 이메일 없는 커스텀 인증 시스템 (복구코드 + PIN)
- **Race Condition 방어**: DB 레벨 Row Lock으로 동시 선택 충돌 방지
- **공지사항 배너**: 운영자가 Supabase에서 직접 공지 등록 및 비활성화 가능
- **신고 시스템**: 부적절한 쪽지 신고 및 제재 관리
- **시즌 상태 관리**: `pre_registration` → `active` → `retention` → `completed`

---

## 🚀 로컬 개발 환경 설정

### 사전 준비

- Node.js 18 이상
- Supabase 프로젝트

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/your-username/notesignal.git
cd notesignal

# 패키지 설치
npm install

# 환경변수 설정 (.env.local 파일 생성)
cp .env.local.example .env.local
# → 아래 환경변수 섹션을 참고하여 값 입력

# 개발 서버 실행
npm run dev
```

### 환경변수 (`.env.local`)

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Supabase 대시보드 → **Settings > API**에서 확인할 수 있습니다.

---

## 🗄 데이터베이스 설정

Supabase 대시보드의 **SQL Editor**에서 아래 파일들을 순서대로 실행하세요.

```
1. supabase_setup.sql   — 전체 테이블, RLS 정책, RPC 함수 정의
2. auth_rpc.sql         — 커스텀 인증(로그인/복구) 관련 RPC 함수
```

> **주의**: 이미 운영 중인 DB에 변경사항을 적용할 때는 각 파일의 `CREATE OR REPLACE` 구문을 개별적으로 실행하세요. 전체 파일 재실행 시 `IF NOT EXISTS` 가드가 있어 데이터는 보존되지만, 의도치 않은 충돌을 예방하려면 분리 실행을 권장합니다.

### 공지사항 등록 방법

운영자가 Supabase SQL Editor에서 직접 실행합니다:

```sql
-- 공지 등록
INSERT INTO public.announcements (title, message)
VALUES ('서비스 점검 안내', '5월 15일 오전 2시~4시 점검이 예정되어 있습니다.');

-- 공지 비활성화
UPDATE public.announcements SET is_active = false WHERE id = '공지-uuid';
```

---

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── common/           # 전역 공통 컴포넌트
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── RealtimeAlerts.tsx   # Supabase Realtime 알림
│   │   └── AnnouncementBanner.tsx  # 공지사항 배너
│   ├── feed/             # 피드 관련 컴포넌트 (NoteCard, ReportModal 등)
│   ├── inventory/        # 내 쪽지함 관련 컴포넌트
│   ├── layout/
│   │   └── MobileLayout.tsx    # 전역 레이아웃 (Header + Footer)
│   ├── register/         # 가입 관련 (TermsModal, PrivacyPolicy, TermsOfService 등)
│   └── ui/               # 기타 UI 컴포넌트
├── hooks/                # 커스텀 훅
├── lib/
│   └── supabase.ts       # Supabase 클라이언트 초기화
├── pages/                # 라우트별 페이지 컴포넌트
├── store/
│   ├── useUserStore.ts   # 사용자 상태 (Zustand + persist)
│   └── useSeasonStore.ts # 시즌 상태
└── types/                # TypeScript 공통 타입 정의
```

---

## 🌐 배포

Vercel에 연결된 저장소에 `main` 브랜치로 push하면 자동 배포됩니다.

Vercel 환경변수 설정:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

SPA 라우팅을 위해 `vercel.json`에 rewrites 설정이 포함되어 있습니다.

---

## 🔐 인증 방식

NoteSignal은 Supabase Auth를 사용하지 않는 **커스텀 인증 시스템**을 채택합니다.

- 가입 시 랜덤 **복구코드** (예: `A8X2-9M4Q`) + **4자리 PIN** 발급
- 재로그인 시 복구코드 + PIN 입력으로 인증
- 비밀번호 해싱: pgcrypto (`crypt` + `gen_salt('bf')`)
- 세션 상태: Zustand `persist`로 로컬 스토리지에 유지

---

## 📮 문의

서비스 관련 문의: **notesignaldev@gmail.com**
