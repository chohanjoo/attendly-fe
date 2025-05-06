# GbsMembersModal API 최적화

## 문제 상황

`GbsMembersModal` 컴포넌트에서 GBS 멤버 리스트를 조회하는 API가 두 번 실행되는 현상이 발생했습니다:
1. 첫 번째 호출은 `gbsId`가 `null`인 상태로 실행되어 오류가 발생
2. 두 번째 호출은 정상적인 `gbsId` 값으로 실행

## 원인 분석

```tsx
const [selectedGbsId, setSelectedGbsId] = useState<number | null>(null);
const { data, isLoading: isGbsLoading, refetch } = useGbsMembers(selectedGbsId);

// GBS 선택 시 멤버 정보 가져오기
const handleGbsSelect = (gbsId: number) => {
  setSelectedGbsId(gbsId);
  refetch();
};
```

1. **컴포넌트 초기 렌더링 문제**:
   - 컴포넌트가 처음 마운트될 때 `selectedGbsId`는 `null`로 초기화됩니다.
   - `useGbsMembers` 훅이 호출될 때 파라미터로 `null`을 전달하여 첫 번째 불필요한 API 호출이 발생합니다.

2. **불필요한 refetch 호출**:
   - `handleGbsSelect` 함수에서 `selectedGbsId` 상태를 업데이트한 후 직접 `refetch()`를 호출합니다.
   - React Query는 의존성이 변경되면 자동으로 쿼리를 다시 실행하므로 이 호출은 불필요합니다.

## useGbsMembers 훅 구현 분석

```tsx
// GBS 멤버 목록 조회 훅
export const useGbsMembers = (gbsId: number | null) => {
  return useQuery({
    queryKey: ['gbsMembers', gbsId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/gbs-members/${gbsId}`);
      return response.data as GbsMembersListResponse;
    },
    enabled: !!gbsId
  });
};
```

`useGbsMembers` 훅에는 이미 `enabled: !!gbsId` 옵션이 있어 `gbsId`가 유효한 값일 때만 쿼리가 실행되도록 설정되어 있습니다. 하지만 컴포넌트에서 `refetch()`를 명시적으로 호출하고 있어 중복된 쿼리 실행이 발생했습니다.

## 해결 방법

```tsx
// 수정 전
const { data, isLoading: isGbsLoading, refetch } = useGbsMembers(selectedGbsId);

const handleGbsSelect = (gbsId: number) => {
  setSelectedGbsId(gbsId);
  refetch();
};

// 수정 후
const { data, isLoading: isGbsLoading } = useGbsMembers(selectedGbsId);

const handleGbsSelect = (gbsId: number) => {
  setSelectedGbsId(gbsId);
};
```

1. `refetch()` 호출 제거:
   - `handleGbsSelect` 함수에서 불필요한 `refetch()` 호출을 제거했습니다.
   - `selectedGbsId` 상태가 변경되면 React Query가 자동으로 쿼리를 다시 실행합니다.

## 개선 효과

1. 불필요한 API 호출 감소:
   - 컴포넌트 초기화 시 `null` 값으로 인한 불필요한 API 호출이 방지됩니다.
   - `enabled: !!gbsId` 조건으로 인해 유효한 `gbsId` 값이 있을 때만 API가 호출됩니다.

2. 코드 간결화:
   - 불필요한 `refetch()` 호출을 제거하여 코드가 더 간결해졌습니다.
   - React Query의 자동 쿼리 실행 기능을 활용하여 불필요한 코드를 줄였습니다.

## 권장사항

1. React Query 옵션 활용:
   - `enabled`, `staleTime`, `cacheTime` 등의 옵션을 적절히 활용하여 API 호출을 최적화하세요.
   - 데이터 의존성에 따라 자동으로 쿼리가 실행되도록 설계하세요.

2. 상태 변경과 데이터 페칭 분리:
   - 상태 변경과 데이터 페칭 로직을 명확히 분리하여 불필요한 API 호출을 방지하세요.
   - React Query의 자동 리페칭 기능을 믿고 활용하세요. 