# React 리팩토링 가이드

## 1. 개요

이 문서는 출석 관리 페이지 리팩토링 과정에서 얻은 경험과 React 개발 시 권장되는 패턴을 공유하기 위해 작성되었습니다. 리팩토링은 코드의 동작을 변경하지 않으면서 내부 구조를 개선하는 과정입니다. 이를 통해 코드의 가독성, 유지보수성, 확장성을 향상시킬 수 있습니다.

## 2. 리팩토링 배경

기존 출석 관리 페이지(`app/attendance/page.tsx`)는 모든 기능이 단일 파일에 포함되어 있었습니다. 이로 인해 다음과 같은 문제가 있었습니다:

- **파일 크기**: 700줄 이상의 코드로 가독성이 떨어짐
- **모든 기능이 한 곳에**: 타입 정의, 유틸리티 함수, API 호출, 상태 관리, UI 컴포넌트가 모두 한 파일에 존재
- **재사용성 부족**: 다른 페이지에서 동일한 기능을 사용하기 어려움
- **유지보수의 어려움**: 코드 수정 시 전체 파일을 이해해야 함

## 3. 리팩토링 전략

다음과 같은 전략으로 코드를 분리했습니다:

1. **관심사 분리(Separation of Concerns)**: 각 파일이 하나의 책임만 갖도록 구성
2. **컴포넌트 분리**: UI 부분을 독립적인 컴포넌트로 분리
3. **비즈니스 로직 분리**: 데이터 처리 로직을 커스텀 훅으로 분리
4. **타입 정의 분리**: 재사용 가능한 타입을 별도 파일로 분리

## 4. 파일 구조

리팩토링 후 다음과 같은 파일 구조로 개선되었습니다:

```
📁 types/
  └── attendance.ts         # 타입 정의
📁 lib/
  └── attendance-utils.ts   # 유틸리티 함수
📁 hooks/
  ├── use-attendance.ts     # API 호출 훅
  └── use-attendance-manager.ts # 상태 관리 훅
📁 services/
  └── attendance-service.ts # 서비스 함수
📁 components/attendance/
  ├── AttendanceInputModal.tsx    # 출석 입력 모달
  ├── GbsMembersTable.tsx         # GBS 멤버 테이블
  ├── WeeklyAttendanceTable.tsx   # 주간 출석 테이블
  └── MonthlyAttendanceTable.tsx  # 월간 출석 테이블
📁 app/attendance/
  └── page.tsx              # 메인 페이지 (간소화됨)
```

## 5. 각 모듈의 역할

### 5.1 타입 정의 (`types/attendance.ts`)

모든 타입 인터페이스를 한 곳에 정의하여 여러 파일에서 일관되게 사용할 수 있게 했습니다.

```typescript
// 출석 데이터 타입 정의
export interface AttendanceResponse {
  id: number;
  memberId: number;
  memberName: string;
  // ... 다른 속성들
}

// 다른 타입 정의들...
```

### 5.2 유틸리티 함수 (`lib/attendance-utils.ts`)

날짜 변환, 색상 선택 등 순수 함수를 분리했습니다.

```typescript
// 날짜 형식 포맷 함수
export function formatDate(dateString: string) {
  return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko });
}

// 다른 유틸리티 함수들...
```

### 5.3 API 훅 (`hooks/use-attendance.ts`)

API 호출 로직을 React Query 훅으로 분리하여 데이터 페칭과 캐싱을 처리합니다.

```typescript
// GBS 출석 데이터 조회 훅
export const useAttendance = (gbsId: number | null, weekStart: string) => {
  return useQuery({
    queryKey: ['attendance', gbsId, weekStart],
    queryFn: async () => {
      const response = await api.get('/api/attendance', {
        params: { gbsId, weekStart }
      });
      return response.data;
    },
    enabled: !!gbsId
  });
};
```

### 5.4 상태 관리 훅 (`hooks/use-attendance-manager.ts`)

컴포넌트의 상태 관리와 비즈니스 로직을 캡슐화하여 페이지 컴포넌트를 간소화했습니다.

```typescript
export const useAttendanceManager = () => {
  const [gbsId, setGbsId] = useState<number | null>(null);
  // ... 다른 상태들
  
  // 예배 출석 상태를 토글하는 함수
  const toggleWorship = (index: number) => {
    // ... 구현
  };
  
  // ... 다른 함수들
  
  return {
    gbsId,
    // ... 다른 상태와 함수들
  };
};
```

### 5.5 서비스 함수 (`services/attendance-service.ts`)

복잡한 데이터 처리 로직을 분리했습니다.

```typescript
// 이번달 출석 데이터 조회 함수
export const fetchMonthlyAttendance = async (gbsId: number | null) => {
  // ... 복잡한 데이터 처리 로직
};
```

### 5.6 UI 컴포넌트 (`components/attendance/`)

화면 표시를 담당하는 컴포넌트들을 분리했습니다.

```typescript
// 주간 출석 테이블 컴포넌트
export default function WeeklyAttendanceTable({
  isLoading,
  error,
  attendances,
  // ... 다른 props
}) {
  // ... 렌더링 로직
}
```

### 5.7 메인 페이지 (`app/attendance/page.tsx`)

모든 모듈을 조합하여 최종 페이지를 구성합니다. 분리된 모듈 덕분에 코드가 간결해졌습니다.

```typescript
export default function AttendancePage() {
  const { user } = useAuth();
  const {
    // ... 필요한 상태와 함수들 
  } = useAttendanceManager();
  
  return (
    <AuthLayout>
      <AppShellLayout>
        {/* ... 컴포넌트 사용 */}
        <WeeklyAttendanceTable
          isLoading={isLoading}
          error={error}
          attendances={attendances}
          // ... 다른 props
        />
        {/* ... 다른 컴포넌트들 */}
      </AppShellLayout>
    </AuthLayout>
  );
}
```

## 6. 리팩토링 효과

이러한 리팩토링을 통해 얻은 효과는 다음과 같습니다:

1. **코드 가독성 향상**: 각 파일이 더 짧고 집중된 역할을 수행
2. **재사용성 증가**: 분리된 컴포넌트와 훅을 다른 페이지에서 재사용 가능
3. **유지보수 용이성**: 특정 기능만 수정할 때 관련 파일만 확인하면 됨
4. **테스트 용이성**: 분리된 모듈은 독립적으로 테스트하기 쉬움
5. **협업 효율성**: 여러 개발자가 서로 다른 모듈을 동시에 작업 가능

## 7. React 개발 권장 규칙

### 7.1 컴포넌트 설계 원칙

1. **단일 책임 원칙(SRP)**: 각 컴포넌트는 하나의 책임만 갖도록 설계
   ```jsx
   // ❌ 나쁜 예: 여러 기능이 혼합된 컴포넌트
   function AttendancePage() {
     // API 호출, 데이터 처리, 렌더링이 모두 한 컴포넌트에
   }
   
   // ✅ 좋은 예: 책임이 분리된 컴포넌트
   function AttendancePage() {
     const { data, isLoading } = useAttendanceData(); // 데이터 로직 분리
     return isLoading ? <Spinner /> : <AttendanceTable data={data} />; // 렌더링 분리
   }
   ```

2. **컴포넌트 크기 제한**: 한 컴포넌트가 200줄을 넘지 않도록 분리
   - 큰 컴포넌트는 이해하기 어렵고 재사용하기 어려움

3. **명확한 Props 인터페이스**: TypeScript를 활용해 props 타입을 명확하게 정의
   ```typescript
   interface ButtonProps {
     label: string;
     onClick: () => void;
     variant?: 'primary' | 'secondary';
   }
   
   function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
     // ...
   }
   ```

### 7.2 상태 관리 패턴

1. **지역 상태와 전역 상태 구분**:
   - 컴포넌트 내부에서만 사용하는 상태는 `useState` 사용
   - 여러 컴포넌트에서 공유하는 상태는 Context API 또는 상태 관리 라이브러리 사용

2. **커스텀 훅으로 상태 로직 분리**:
   ```typescript
   // ❌ 나쁜 예: 컴포넌트 내에 복잡한 상태 로직
   function Component() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(false);
     
     useEffect(() => {
       // 복잡한 데이터 로딩 로직...
     }, []);
     
     // 렌더링 로직...
   }
   
   // ✅ 좋은 예: 커스텀 훅으로 상태 로직 분리
   function useDataLoader() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(false);
     
     useEffect(() => {
       // 복잡한 데이터 로딩 로직...
     }, []);
     
     return { data, loading };
   }
   
   function Component() {
     const { data, loading } = useDataLoader();
     // 간결한 렌더링 로직...
   }
   ```

3. **불변성 유지**: 상태 업데이트 시 항상 불변성을 유지
   ```typescript
   // ❌ 나쁜 예: 직접 상태 변경
   const handleChange = (index, value) => {
     inputs[index].value = value; // 원본 배열 수정
     setInputs(inputs);
   };
   
   // ✅ 좋은 예: 불변성 유지
   const handleChange = (index, value) => {
     const newInputs = [...inputs]; // 새 배열 생성
     newInputs[index] = { ...newInputs[index], value };
     setInputs(newInputs);
   };
   ```

### 7.3 성능 최적화

1. **적절한 메모이제이션**: `useMemo`, `useCallback`, `React.memo` 활용
   ```typescript
   // 복잡한 계산은 useMemo로 최적화
   const processedData = useMemo(() => {
     return data.map(item => expensiveProcess(item));
   }, [data]);
   
   // 이벤트 핸들러는 useCallback으로 최적화
   const handleClick = useCallback(() => {
     console.log('clicked');
   }, []);
   ```

2. **가상화 목록**: 큰 목록을 렌더링할 때 가상화 활용
   - `react-window`, `react-virtualized` 같은 라이브러리 사용

3. **지연 로딩**: 필요할 때만 컴포넌트 로드
   ```typescript
   const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
   
   function App() {
     return (
       <Suspense fallback={<Spinner />}>
         <HeavyComponent />
       </Suspense>
     );
   }
   ```

### 7.4 파일 구조 및 네이밍 컨벤션

1. **기능 기반 폴더 구조**:
   ```
   📁 features/
     📁 attendance/
       📁 components/
       📁 hooks/
       📁 types/
       📁 utils/
     📁 users/
       📁 components/
       // ...
   ```

2. **의미 있는 이름 사용**:
   - 컴포넌트: `AttendanceTable`, `UserProfile` (PascalCase)
   - 함수/훅: `useAttendance`, `formatDate` (camelCase)
   - 타입/인터페이스: `AttendanceData`, `UserProps` (PascalCase)

3. **파일명과 컴포넌트명 일치**:
   - `UserProfile.tsx` 파일은 `UserProfile` 컴포넌트를 export

### 7.5 코드 품질 관리

1. **일관된 코드 스타일**: ESLint, Prettier 설정
   - 들여쓰기, 따옴표, 세미콜론 등 일관성 유지

2. **의미 있는 커밋 메시지**:
   ```
   feat: 출석 입력 모달 컴포넌트 추가
   fix: 출석 저장 시 발생하는 오류 수정
   refactor: 출석 관리 페이지 코드 분리
   ```

3. **자동화된 테스트**: 주요 컴포넌트에 대해 테스트 작성
   - Jest, React Testing Library 활용

## 8. 결론

이번 리팩토링을 통해 코드의 구조를 개선하고 재사용성을 높였습니다. React 개발에서 중요한 것은 작은 컴포넌트와 훅으로 로직을 분리하고, 각 부분이 명확한 책임을 갖도록 설계하는 것입니다.

리팩토링은 일회성 작업이 아니라 지속적인 개선 과정입니다. 코드를 작성할 때마다 유지보수성과 확장성을 고려하여 설계하는 습관을 들이면, 장기적으로 개발 생산성을 크게 향상시킬 수 있습니다.

## 9. 참고 자료

- [React 공식 문서](https://react.dev/)
- [Kent C. Dodds의 Epic React](https://epicreact.dev/)
- [React Patterns](https://reactpatterns.com/)
- [Clean Code in React](https://dev.to/carlillo/clean-code-applied-to-react-3aji) 