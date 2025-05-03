import { QueryClient } from '@tanstack/react-query';

// 기본 쿼리 클라이언트 설정
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // 윈도우 포커스시 자동 리페치 비활성화
      retry: 1, // 실패시 1번만 재시도
      staleTime: 1000 * 60 * 5, // 데이터가 5분 동안 유효
    },
  },
}); 