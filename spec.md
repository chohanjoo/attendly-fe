# 출석부 웹 앱 – React 컴포넌트 명세서

> React 19 · TypeScript · Vite · TailwindCSS · React Router v6 · React Query  
> 공통 상태는 **Context + React Query** 조합으로 관리하고, 디자인 시스템은 Tailwind 유틸리티 + shadcn/ui 컴포넌트를 기본으로 한다.

## 1. 라우트 맵
| 경로 | 페이지 컴포넌트 | 접근 권한 |
|------|----------------|-----------|
| `/login` | `<LoginPage />` | 모든 사용자 |
| `/` | `<LeaderDashboardPage />` | LEADER |
| `/attendance` | `<AttendanceSubmitPage />` | LEADER |
| `/delegations` | `<DelegationManagementPage />` | LEADER |
| `/village` | `<VillageDashboardPage />` | V_LEADER |
| `/department` | `<MinisterReportPage />` | MINISTER |
| `*` | `<NotFoundPage />` | — |

---

## 2. 레이아웃 / 전역 컴포넌트

### 2.1 `<AuthLayout>`
| 항목 | 설명 |
|------|------|
| **책임** | 인증이 필요한 라우트를 보호하고, 미인증 시 `/login` 으로 리다이렉트 |
| **props** | `children: ReactNode` |
| **state** | 없음 — `useAuth()` 훅 사용 |
| **외부** | `AuthContext` (JWT 토큰, 역할) |

### 2.2 `<AppShellLayout>`
| 항목 | 설명 |
|------|------|
| **책임** | 좌측 네비게이션·헤더·알림 토스트 등 공통 UI를 래핑 |
| **props** | `children: ReactNode` |
| **state** | `isSidebarOpen: boolean` (모바일 대응) |
| **child** | `<SidebarNav />`, `<HeaderBar />`, `<ToastContainer />` |

### 2.3 `<DashboardCard>` (공통 위젯)
| 항목 | 설명 |
|------|------|
| **props** | `title: string`, `value: string|number`, `icon?: LucideIcon`, `variant?: "primary"|"warning"|"success"` |
| **slot** | `children` – 차트, 내용 삽입 |

---

## 3. 페이지 컴포넌트

### 3.1 `<LoginPage>`
| 항목 | 설명 |
|------|------|
| **책임** | 이메일·비밀번호 입력 후 `/api/v1/auth/login` 호출 → JWT 저장 |
| **state** | `form: {email, password}`, `loading: boolean`, `error?: string` |
| **이벤트** | `onSubmit()` – 성공 시 `navigate('/')` |

### 3.2 `<LeaderDashboardPage>`
| 항목 | 설명 |
|------|------|
| **책임** | 이번 주 출석 현황 카드 + 빠른 링크 제공 |
| **쿼리** | `useWeeklyAttendance(gbsId)` (React Query) |
| **child** | `<DashboardCard />`, `<WeekSelector />` |

### 3.3 `<AttendanceSubmitPage>`
| 항목 | 설명 |
|------|------|
| **책임** | 조원 리스트에 주간 출석 데이터를 입력·저장 |
| **쿼리** | `useMembers(gbsId, week)`, `useSaveAttendance()` |
| **child** | `<AttendanceForm />` |
| **권한** | 리더 or 위임자만 수정 가능 (폼 잠금) |

### 3.4 `<DelegationManagementPage>`
| 항목 | 설명 |
|------|------|
| **책임** | 리더 → 다른 리더 위임 CRUD |
| **state** | `modalOpen: boolean` |
| **child** | `<DelegationTable />`, `<DelegationModal />` |

### 3.5 `<VillageDashboardPage>`
| 항목 | 설명 |
|------|------|
| **책임** | 마을 전체 GBS 주간 출석 테이블 & 트렌드 그래프 |
| **쿼리** | `useVillageAttendance(villageId, week)` |
| **child** | `<AttendanceTable />`, `<AttendanceTrendsChart />` |

### 3.6 `<MinisterReportPage>`
| 항목 | 설명 |
|------|------|
| **책임** | 부서 전체 통계, 기간 필터, CSV 다운로드 |
| **쿼리** | `useDepartmentReport(deptId, range)` |
| **child** | `<ReportFilters />`, `<ReportChart />`, `<ExportButton />` |

---

## 4. 폼 & 데이터 입력 컴포넌트

### 4.1 `<AttendanceForm>`
| 항목 | 설명 |
|------|------|
| **props** | `members: MemberDTO[]`, `initial: AttendanceDTO[]`, `onSubmit: (payload)=>void` |
| **state** | 내부 `useForm`(react‑hook‑form) → 필드 배열 |
| **child** | `<MemberRow />` 반복 렌더링 |

### 4.2 `<MemberRow>`
| 항목 | 설명 |
|------|------|
| **props** | `member: MemberDTO`, `control` (react‑hook‑form) |
| **UI** | 이름 + `<WorshipToggle />`, `<QtCounterInput />`, `<MinistrySelect />` |

### 4.3 `<WorshipToggle>`
| **props** | `name: string` (form field) |
| **UI** | O/X 토글 버튼 |

### 4.4 `<QtCounterInput>`
| **props** | `name: string` |
| **UI** | 0‑6 카운터 (Stepper) |

### 4.5 `<MinistrySelect>`
| **props** | `name: string` |
| **UI** | A/B/C 라디오 버튼 |

---

## 5. 테이블 & 차트 컴포넌트

### 5.1 `<AttendanceTable>`
| **props** | `data: AttendanceDTO[]`, `editable?: boolean`, `onEdit?: (row)=>void` |
| **기능** | p‑pagination, 열 정렬, 셀 편집(옵션) |

### 5.2 `<AttendanceTrendsChart>`
| **props** | `series: TrendPoint[]` |
| **lib** | Recharts – LineChart |

---

## 6. 모달 & 대화형 컴포넌트

### 6.1 `<DelegationModal>`
| **props** | `open: boolean`, `onClose`, `delegations: DelegationDTO[]`, `onSave` |
| **UI** | 리더 검색 AutoComplete, 기간 선택 |

### 6.2 `<ConfirmationDialog>`
| **props** | `title`, `message`, `onConfirm`, `onCancel` |

---

## 7. 서비스 / 훅 레이어
| 훅 | API Endpoint | 설명 |
|-----|-------------|------|
| `useLogin()` | POST `/auth/login` | 로그인 |
| `useWeeklyAttendance(gbsId)` | GET `/attendance` | 주간 출석 조회 |
| `useSaveAttendance()` | POST `/attendance` | 출석 저장 |
| `useDelegations()` | GET `/delegations` | 위임 목록 |
| `useCreateDelegation()` | POST `/delegations` | 위임 생성 |
| `useRevokeDelegation(id)` | PATCH `/delegations/{id}/revoke` | 위임 해지 |
| `useVillageAttendance()` | GET `/villages/{id}/attendance` | 마을 조회 |
| `useDepartmentReport()` | GET `/departments/{id}/report` | 전체 통계 |

---

## 8. 접근성·국제화 가이드
- `<label>` + `id` 연결로 폼 요소 명확화  
- 색상만으로 상태 구분 금지 ­– 아이콘·텍스트 병행 표시  
- i18n : `react‑i18next` 기반, `ko` → 기본, `en` 추가 예정

---

## 9. 테스트 전략
| 계층 | 도구 | 범위 |
|------|------|------|
| 단위 | Vitest + React Testing Library | 폼 로직, 훅 |
| 통합 | MSW(Mock Service Worker) | API 상호작용 |
| E2E | Playwright | 주요 사용자 플로우 (로그인, 출석 제출) |

---

## 10. 오픈 이슈
1. **PWA 지원** 범위 결정 – 파일 구조에 영향  
2. **실시간 소켓** (차트 업데이트) – MVP 범위 제외 but 인터페이스 정의 필요  
3. **엑셀 다운로드** 구현 방식 – 서버 vs 클라이언트 xlsx  

---

> **다음 단계**: 컴포넌트별 props 타입 정의 (`types.ts`), Storybook 스텁 작성, 폴더 구조 확정 (e.g. `/features/attendance`, `/components/common`).
