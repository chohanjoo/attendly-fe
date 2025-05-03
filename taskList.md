# React Front‑End MVP 작업 리스트 (1 주)

> **전제**  
> * 백엔드는 Kotlin + Spring Boot 로 완료, API 명세는 `api-documentation.md`에 정의됨  
> * FE는 **React 19 + TypeScript + Vite**, 스타일은 **TailwindCSS + shadcn/ui**  
> * 상태/데이터 : **TanStack Query + axios**  
> * 테스트 : **Vitest + React Testing Library**, E2E : **Playwright**  
> * 결과물 : `docker build . -t attendly-web` 로 단독 이미지 생성

---

## 0. 일정표 & 마일스톤

| Day | 산출물 (PR 머지 기준) |
|-----|-----------------------|
| **D0** | FE 템플릿 부트스트랩 + CI 파이프라인 |
| **D1** | 인증 흐름 (로그인 → JWT 보관 → 가드 라우터) |
| **D2** | 리더 출석 입력 화면 End‑to‑End |
| **D3** | 마을장 대시보드 조회 |
| **D4** | 교역자 통계 페이지 + CSV 다운로드 |
| **D5** | 공통 컴포넌트 리팩터 · 접근성 패스 |
| **D6** | Playwright 시나리오 통과 · Docker 이미지 푸시 |
| **D7** | 버퍼 / 문서화 / 데모 발표 |

---

## 1. 초기 세팅 (T‑0x)

| ID | 설명 | 예상 h | 완료 기준 |
|----|------|--------|-----------|
| **T‑01** | `vite create attendly-web --template react-ts` | 0.5 | `pnpm dev` 동작 |
| **T‑02** | Tailwind + shadcn/ui init | 0.5 | 기본 Button 렌더 |
| **T‑03** | Prettier·ESLint·Husky commit hook | 1 | `pnpm lint` 통과 |
| **T‑04** | GitHub Actions – CI (lint & unit test) | 1 | PR 녹색 체크 |
| **T‑05** | Dockerfile (Node 20 alpine) | 1 | `docker run` → Nginx 4000 |

---

## 2. 공통 인프라 (T‑1x)

| ID | 설명 | 예상 h |
|----|------|--------|
| **T‑11** | `axios` 기본 인스턴스 + JWT 인터셉터 | 1 |
| **T‑12** | TanStack Query `QueryClient` 세팅 | 0.5 |
| **T‑13** | `AuthContext` (+ `useAuth` 훅) | 2 |
| **T‑14** | `AuthLayout`, `AppShellLayout` | 2 |
| **T‑15** | 글로벌 `<ToastContainer>` | 0.5 |

---

## 3. 인증 흐름 (T‑2x)

| ID | API | 설명 | 예상 h |
|----|-----|------|--------|
| **T‑21** | `POST /auth/login` | `useLogin` 훅 | 1 |
| **T‑22** | – | `<LoginPage>` 폼 | 2 |
| **T‑23** | `POST /auth/refresh` | 토큰 silent refresh | 1 |
| **T‑24** | – | Playwright `login.spec.ts` | 1 |

---

## 4. 리더 – 출석 입력 (T‑3x)

| ID | API | 설명 | 예상 h |
|----|-----|------|--------|
| **T‑31** | `GET /attendance` | `useWeeklyAttendance` | 1 |
| **T‑32** | `POST /attendance` | `useSaveAttendance` | 1 |
| **T‑33** | `<AttendanceForm>` 구현 | 4 |
| **T‑34** | `<LeaderDashboardPage>` 구성 | 1.5 |
| **T‑35** | 로딩 & 토스트 | 0.5 |
| **T‑36** | Playwright `leader-attendance.spec.ts` | 1 |

---

## 5. 마을장 – 대시보드 (T‑4x)

| ID | API | 설명 | 예상 h |
|----|-----|------|--------|
| **T‑41** | `GET /village/{id}/attendance` | `useVillageAttendance` | 1 |
| **T‑42** | `<AttendanceTable>` 읽기 전용 | 2 |
| **T‑43** | `<AttendanceTrendsChart>` | 2 |
| **T‑44** | `<VillageDashboardPage>` 통합 | 1 |

---

## 6. 교역자 – 통계 (T‑5x)

| ID | API | 설명 | 예상 h |
|----|-----|------|--------|
| **T‑51** | `GET /departments/{id}/report` | `useDepartmentReport` | 1 |
| **T‑52** | `<ReportChart>` (Line/Bar) | 2 |
| **T‑53** | `<ExportButton>` CSV 다운로드 | 1 |
| **T‑54** | `<MinisterReportPage>` 조합 | 1.5 |

---

## 7. 품질·배포 (T‑6x)

| ID | 설명 | 예상 h |
|----|------|--------|
| **T‑61** | Vitest 커버리지 ≥ 60 % | 2 |
| **T‑62** | Playwright workflow | 1 |
| **T‑63** | Docker 이미지 push | 0.5 |
| **T‑64** | README 업데이트 | 0.5 |

---

## 8. 작업 분담 예시

| FE Dev | 주요 Task |
|--------|-----------|
| **FE‑1 (UI)** | T‑02,14,15,33,42,52 |
| **FE‑2 (Data)** | T‑11‑13,21‑23,31‑32,41,51 |
| **FE‑3 (QA/DevOps)** | T‑04,05,24,36,61‑64 |

---

## 9. 스코프 조정 규칙

| 기능 | MVP 포함 | 후순위 |
|------|---------|--------|
| **리더 위임** | API 훅 스텁만 | UI CRUD |
| **관리자 화면** | 제외 | Sprint 2 |
| **i18n** | 한국어 고정 | react‑i18next |
| **PWA** | 제외 | Sprint 3 |

---

### ✅ D2 필수 화면

1. `/login` → 로그인 성공  
2. `/attendance` → 출석 체크 후 **저장 성공 토스트**  
3. 새로고침해도 데이터 유지 (백엔드 연동 확인)
