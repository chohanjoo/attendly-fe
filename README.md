# 출석부 웹 애플리케이션 (Attendly)

교회나 단체의 출석 관리를 위한 웹 애플리케이션입니다. 리더, 마을장, 교역자 등 다양한 역할에 맞는 출석 관리 기능을 제공합니다.

## 주요 기능

- **출석 관리**: 리더가 GBS(소그룹) 모임 참석자의 출석 상태 기록
- **위임 관리**: 리더가 다른 리더에게 출석 입력 권한 위임
- **마을 대시보드**: 마을장을 위한 마을 내 모든 GBS 출석 현황 및 통계
- **부서 보고서**: 교역자를 위한 부서별 출석 통계 및 리포트

## 기술 스택

- **프론트엔드**:
  - React 19
  - Next.js 15
  - TypeScript
  - Tailwind CSS
  - shadcn/ui (컴포넌트 라이브러리)
  - React Query (데이터 관리)
  - React Hook Form (폼 관리)
  - Recharts / Chart.js (데이터 시각화)

## 프로젝트 구조

```
attendly-fe/
├── app/                   # Next.js 페이지 및 레이아웃
│   ├── attendance/        # 출석 관련 페이지
│   ├── login/             # 로그인 페이지
│   ├── profile/           # 프로필 페이지
│   ├── signup/            # 회원가입 페이지
│   └── ...
├── components/            # 재사용 가능한 컴포넌트
│   ├── attendance/        # 출석 관련 컴포넌트
│   ├── layouts/           # 레이아웃 컴포넌트
│   └── ui/                # UI 컴포넌트
├── hooks/                 # React 훅
├── lib/                   # 유틸리티 함수
├── services/              # API 서비스
├── types/                 # TypeScript 타입 정의
└── public/                # 정적 파일
```

## 시작하기

### 필수 조건

- Node.js 18 이상
- npm 또는 yarn 또는 pnpm

### 설치

```bash
# 의존성 설치
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 개발 서버 실행

```bash
# 개발 서버 실행
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

개발 서버는 기본적으로 http://localhost:3000 에서 실행됩니다.

### 빌드

```bash
# 프로덕션 빌드
npm run build
# 또는
yarn build
# 또는
pnpm build
```

## 역할별 기능

### 리더

- 출석 데이터 입력 및 수정
- 출석 현황 확인
- 위임 관리

### 마을장

- 마을 내 모든 GBS 출석 현황 조회
- 출석 트렌드 그래프 확인

### 교역자

- 부서 전체 통계 확인
- 기간별 출석 데이터 필터링
- 보고서 CSV 다운로드

## 문서

추가 문서는 다음 파일에서 확인할 수 있습니다:

- `spec.md` - 프로젝트 명세서
- `api-documentation.md` - API 문서
- `todolist.md` - 작업 목록
- `taskList.md` - 추가 작업 목록 