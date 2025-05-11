// API 응답 형식 타입 정의
export interface ApiResponse<T> {
  success: boolean;
  timestamp: string;
  data: T;
  message: string;
  code: number;
}

// 페이지 응답 형식 타입 정의
export interface PageResponse<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
}

// 페이지네이션 API 응답 형식 타입 정의
export interface ApiPageResponse<T> {
  success: boolean;
  timestamp: string;
  data: PageResponse<T>;
  message: string;
  code: number;
} 