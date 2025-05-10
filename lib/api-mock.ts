import { handlers } from '@/mocks/handlers';

// API 응답 타입 정의
interface MockApiResponse {
  status: number;
  data: any;
  message?: string;
}

/**
 * API 요청을 모킹하는 간단한 헬퍼 함수
 * @param url 요청 URL
 * @param method HTTP 메서드
 * @param data 요청 데이터
 * @returns Promise 응답
 */
export const mockApiRequest = async (url: string, method: string = 'GET', data?: any): Promise<MockApiResponse> => {
  // URL에서 파라미터를 추출하는 함수
  const extractParams = (pattern: string, url: string) => {
    const paramNames: string[] = [];
    const regexStr = pattern.replace(/:([^\/]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });
    
    const regex = new RegExp(`^${regexStr}$`);
    const matches = url.match(regex);
    
    if (!matches) return null;
    
    const params: Record<string, string> = {};
    paramNames.forEach((name, index) => {
      params[name] = matches[index + 1];
    });
    
    return params;
  };
  
  // 요청에 맞는 핸들러 찾기
  for (const handler of handlers) {
    const params = extractParams(handler.url, url);
    
    if (params && handler.method.toUpperCase() === method.toUpperCase()) {
      // 핸들러가 매칭되면 요청 처리
      const req = { body: data };
      try {
        // 핸들러 함수의 any 타입은 mocks/handlers.ts에서 정의되므로 안전하게 처리
        return await handler.handleRequest(req, params as any) as MockApiResponse;
      } catch (error) {
        return Promise.reject({
          status: 500,
          message: '내부 서버 오류',
          error
        });
      }
    }
  }
  
  // 매칭되는 핸들러가 없을 경우 에러 응답
  return Promise.reject({
    status: 404,
    message: 'Not Found'
  });
}; 