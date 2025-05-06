import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import logger from './logger';

// API 기본 URL
const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
const environment = process.env.NEXT_PUBLIC_ENV || 'local';

// 로깅 관련 환경 변수
const ENABLE_API_LOGGING = process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === 'true';

// 클라이언트 사이드 여부 확인
const isClientSide = () => typeof window !== 'undefined';

// 개발 환경에서만 로그 출력
if (process.env.NODE_ENV !== 'production') {
  console.log('Current API URL:', baseURL);
  console.log('Environment:', environment);
  console.log('API 로깅:', ENABLE_API_LOGGING ? '활성화' : '비활성화');
  logger.info('API 설정', { baseURL, environment, logging: ENABLE_API_LOGGING });
}

// 로깅 허용 여부 확인 함수
const shouldLog = () => {
  return process.env.NODE_ENV !== 'production' && ENABLE_API_LOGGING;
};

// 민감한 헤더 마스킹
const sanitizeHeaders = (headers: any) => {
  const sanitized = { ...headers };
  
  // Authorization 헤더 마스킹 처리
  if (sanitized.Authorization) {
    sanitized.Authorization = sanitized.Authorization.replace(/^(Bearer\s+)(.{5}).+(.{4})$/, '$1$2***$3');
  }
  
  return sanitized;
};

// 로그 출력 헬퍼 함수
const formatLog = (obj: any) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return obj;
  }
};

// API 요청 로깅 함수
const logRequest = (config: InternalAxiosRequestConfig) => {
  if (!shouldLog()) return config;
  
  const method = config.method?.toUpperCase() || 'UNKNOWN';
  const url = config.url || 'UNKNOWN';
  const timestamp = new Date().toISOString();
  
  console.group(`🚀 API 요청 [${timestamp}] ${method} ${url}`);
  console.log(`URL: ${config.baseURL}${url}`);
  console.log('Headers:', formatLog(sanitizeHeaders(config.headers)));
  
  if (config.params) {
    console.log('Query Params:', formatLog(config.params));
  }
  
  if (config.data) {
    console.log('Request Body:', formatLog(config.data));
  }
  
  console.groupEnd();
  
  // Discord로 로그 전송
  logger.debug(`API 요청: ${method} ${url}`, {
    url: `${config.baseURL}${url}`,
    method,
    headers: sanitizeHeaders(config.headers),
    params: config.params,
    data: config.data
  });
  
  return config;
};

// API 응답 로깅 함수
const logResponse = (response: AxiosResponse) => {
  if (!shouldLog()) return response;
  
  const method = response.config.method?.toUpperCase() || 'UNKNOWN';
  const url = response.config.url || 'UNKNOWN';
  const timestamp = new Date().toISOString();
  const duration = response.headers['x-response-time'] || 'unknown';
  
  console.group(`✅ API 응답 [${timestamp}] ${method} ${url} - ${response.status}`);
  console.log(`Status: ${response.status} ${response.statusText}`);
  console.log(`Duration: ${duration}`);
  
  if (response.data) {
    console.log('Response Data:', formatLog(response.data));
  }
  
  console.groupEnd();
  
  // Discord로 로그 전송
  logger.debug(`API 응답: ${method} ${url} - ${response.status}`, {
    url: `${response.config.baseURL}${url}`,
    method,
    status: response.status,
    statusText: response.statusText,
    duration,
    data: response.data
  });
  
  return response;
};

// API 에러 로깅 함수
const logError = (error: any) => {
  if (!shouldLog()) return Promise.reject(error);
  
  const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
  const url = error.config?.url || 'UNKNOWN';
  const timestamp = new Date().toISOString();
  
  console.group(`❌ API 에러 [${timestamp}] ${method} ${url}`);
  
  if (error.response) {
    console.log(`Status: ${error.response.status} ${error.response.statusText}`);
    console.log('Response Data:', formatLog(error.response.data));
  } else if (error.request) {
    console.log('요청은 전송되었지만 응답이 없습니다.');
    console.log('Request:', error.request);
  } else {
    console.log('Error Message:', error.message);
  }
  
  console.log('Error Config:', error.config);
  console.groupEnd();
  
  // Discord로 에러 로그 전송
  logger.error(`API 에러: ${method} ${url}`, {
    url: `${error.config?.baseURL}${url}`,
    method,
    error: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    responseData: error.response?.data,
    config: error.config
  });
  
  return Promise.reject(error);
};

// 토큰 리프레시 처리 함수
const refreshAuthToken = async (refreshToken: string) => {
  const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
  return response.data;
};

// 새 토큰 저장 및 알림 함수
const saveTokensAndNotify = (accessToken: string, newRefreshToken?: string) => {
  localStorage.setItem('accessToken', accessToken);
  
  if (newRefreshToken) {
    localStorage.setItem('refreshToken', newRefreshToken);
  }
  
  if (isClientSide() && window.dispatchEvent) {
    const event = new CustomEvent('token-refreshed', {
      detail: { message: '인증이 갱신되었습니다.' }
    });
    window.dispatchEvent(event);
  }
};

// 로그아웃 처리 함수
const handleLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
};

// 토큰 만료 처리 및 재요청 함수
const handleTokenExpiration = async (error: any) => {
  const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
  
  if (error.response?.status !== 401 || originalRequest._retry) {
    return Promise.reject(error);
  }
  
  originalRequest._retry = true;
  
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('Refresh token not found');
    
    const { accessToken, refreshToken: newRefreshToken } = await refreshAuthToken(refreshToken);
    saveTokensAndNotify(accessToken, newRefreshToken);
    
    // 원래 요청에 새 토큰 적용
    if (originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      originalRequest.headers = { Authorization: `Bearer ${accessToken}` };
    }
    
    return axios(originalRequest);
  } catch (refreshError) {
    handleLogout();
    return Promise.reject(refreshError);
  }
};

// UUID 생성 함수
const generateUUID = () => {
  // crypto API를 사용하여 UUID 생성 (클라이언트 사이드에서만 작동)
  if (isClientSide() && window.crypto) {
    return ([1e7] as any + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
      (c ^ (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }
  // 서버 사이드 또는 crypto API가 없는 경우 간단한 UUID 대체 생성
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// axios 인스턴스 생성
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 헤더에 JWT 토큰 추가
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 클라이언트 사이드에서만 토큰을 가져옴
    if (isClientSide()) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // 요청마다 고유한 X-Request-ID 추가
    config.headers['X-Request-ID'] = generateUUID();
    
    // 요청 로깅
    return logRequest(config);
  },
  (error: any) => {
    logError(error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 401 에러 처리 (토큰 만료)
api.interceptors.response.use(
  logResponse,
  async (error: any) => {
    logError(error);
    
    // 서버 사이드에서는 토큰 갱신 처리를 하지 않음
    if (!isClientSide()) {
      return Promise.reject(error);
    }
    
    return handleTokenExpiration(error);
  }
);

export default api; 